# Cinematic Web — Caching Strategy

## TABLE OF CONTENTS
1. [Caching Decision Matrix](#matrix)
2. [Next.js ISR Configuration](#isr)
3. [SWR / TanStack Query](#swr)
4. [Redis — Server-Side Cache](#redis)
5. [Cloudinary Cache Headers](#cloudinary)
6. [CDN Cache Strategy](#cdn)
7. [Cache Invalidation](#invalidation)

---

## CACHING DECISION MATRIX {#matrix}

```
WHAT IS BEING CACHED?          STRATEGY              TTL
─────────────────────────────────────────────────────────
Static pages (no CMS)          Static generation     Forever (rebuild to update)
CMS-driven pages               ISR                   60s–3600s per page type
User-specific data             No cache (SSR only)   N/A
CMS API responses (server)     Redis                 300s–3600s
Client-side CMS data           SWR/TanStack Query    300s stale-while-revalidate
Images                         Cloudinary CDN        1 year (immutable)
Videos                         Cloudinary CDN        1 year (immutable)
Fonts                          Browser cache         1 year (immutable)
JS/CSS bundles                 Browser cache         1 year (immutable, hash in name)
API route responses            Cache-Control header  Varies by endpoint
```

---

## NEXT.JS ISR CONFIGURATION {#isr}

### Revalidate Times Per Content Type
```typescript
// Revalidate values in seconds — configure per page

// Homepage — changes rarely, but needs to feel fresh
export const revalidate = 3600; // 1 hour

// Blog post listing — updated when new post published
export const revalidate = 300;  // 5 minutes

// Individual blog post — changes rarely after publish
export const revalidate = 86400; // 24 hours

// Pricing page — important to be current
export const revalidate = 600;  // 10 minutes

// About / static pages — rarely change
export const revalidate = 86400; // 24 hours
```

### On-Demand Revalidation (trigger from CMS webhook)
```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // Validate webhook secret
  const secret = request.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, slug } = await request.json() as { type: string; slug?: string };

  try {
    switch (type) {
      case 'blog-post':
        if (slug) revalidatePath(`/blog/${slug}`);
        revalidatePath('/blog');          // Also invalidate listing
        revalidateTag('blog-posts');      // Invalidate all tagged fetches
        break;
      case 'page':
        if (slug) revalidatePath(`/${slug}`);
        break;
      case 'site-settings':
        revalidatePath('/', 'layout');   // Revalidate layout on all pages
        break;
      case 'all':
        revalidatePath('/', 'layout');
        break;
    }

    return Response.json({
      revalidated: true, type, slug, timestamp: Date.now()
    });
  } catch (error) {
    return Response.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
```

### Tagged Fetches (for selective invalidation)
```typescript
// lib/cms-fetcher.ts
export async function getBlogPosts() {
  const res = await fetch(`${process.env.CMS_API_URL}/posts`, {
    next: {
      tags:       ['blog-posts'],   // Tag for targeted invalidation
      revalidate: 300,              // 5 minute background revalidation
    },
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function getBlogPost(slug: string) {
  const res = await fetch(`${process.env.CMS_API_URL}/posts/${slug}`, {
    next: {
      tags:       ['blog-posts', `blog-post-${slug}`],
      revalidate: 86400, // 24 hours for individual posts
    },
  });
  if (!res.ok) return null;
  return res.json();
}
```

---

## SWR / TANSTACK QUERY {#swr}

### SWR (simpler, smaller)
```bash
npm install swr
```

```typescript
// lib/hooks/useBlogPosts.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useBlogPosts() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/posts',
    fetcher,
    {
      revalidateOnFocus:      false,  // Don't refetch when tab regains focus
      revalidateOnReconnect:  true,   // Refetch when internet reconnects
      dedupingInterval:       300_000,// 5 min: don't re-fetch if already fetched
      fallbackData:           [],     // Immediate render with empty state
      errorRetryCount:        3,
      errorRetryInterval:     5_000,
    }
  );

  return {
    posts: data ?? [],
    loading: isLoading,
    error,
    refresh: mutate,
  };
}

// SWR Provider (global config)
// app/providers.tsx
import { SWRConfig } from 'swr';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{
      fetcher: (url: string) => fetch(url).then(r => {
        if (!r.ok) throw new Error('Fetch failed');
        return r.json();
      }),
      onError: (error) => {
        if (process.env.NODE_ENV !== 'production') console.error(error);
      },
    }}>
      {children}
    </SWRConfig>
  );
}
```

### TanStack Query (more powerful)
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

```typescript
// lib/queries/blog.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const queryKeys = {
  posts:    ['posts'] as const,
  post:     (slug: string) => ['posts', slug] as const,
  settings: ['site-settings'] as const,
};

export function useBlogPosts() {
  return useQuery({
    queryKey:  queryKeys.posts,
    queryFn:   () => fetch('/api/posts').then(r => r.json()),
    staleTime: 5 * 60 * 1000,       // 5 minutes before considered stale
    gcTime:    10 * 60 * 1000,       // 10 minutes before removed from cache
    retry:     2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey:  queryKeys.post(slug),
    queryFn:   () => fetch(`/api/posts/${slug}`).then(r => r.json()),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled:   !!slug,
  });
}
```

---

## REDIS — SERVER-SIDE CACHE {#redis}

**Budget routing:**
```
budget = zero   → Skip Redis. Use Next.js built-in cache (fetch + revalidate).
                  Upstash free tier exists (10k commands/day) — sign up if needed.
budget = micro  → Upstash free tier (10k commands/day, 256MB) — sufficient for most sites.
budget = starter+ → Upstash Pay-as-you-go (~$0.20 per 100k commands)
```

**Zero-budget alternative — Next.js built-in cache (no Redis needed):**
```typescript
// Use Next.js fetch cache + revalidation instead of Redis for most cases
// This is FREE and requires no external service

// Cache for 5 minutes, revalidate on demand
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 300, tags: ['cms-content'] }
})

// Invalidate from a Server Action or API route
import { revalidateTag } from 'next/cache'
revalidateTag('cms-content')  // ← triggers fresh fetch on next request
```

**When you actually need Redis (rate limiting, session, real-time counters):**
```bash
npm install @upstash/redis  # Free tier: upstash.com (no credit card for free tier)
```

```typescript
// lib/cache/redis.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Generic cache wrapper
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // seconds
): Promise<T> {
  // Check cache
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;

  // Fetch and cache
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

// Invalidate cache by pattern
export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Usage in API route:
// const posts = await cachedFetch('blog:posts', fetchFromCMS, 300);
// Invalidate on CMS webhook: await invalidateCache('blog:*');
```

---

## CLOUDINARY CACHE HEADERS {#cloudinary}

Cloudinary serves assets with long cache by default. Ensure transformations are consistent:

```typescript
// lib/cloudinary.ts
// Always use the same transformation string for the same use case
// Inconsistent transforms = different cache keys = cache miss

export const TRANSFORMS = {
  heroFull:     'f_auto,q_auto:good,w_2560,h_1440,c_fill',
  heroMobile:   'f_auto,q_auto:good,w_768,h_1024,c_fill',
  sectionBg:    'f_auto,q_auto:good,w_1920,h_1080,c_fill',
  cardThumb:    'f_auto,q_auto:good,w_800,h_450,c_fill',
  avatar:       'f_auto,q_auto:good,w_200,h_200,c_fill,g_face',
  ogImage:      'f_jpg,q_auto:good,w_1200,h_630,c_fill',
  videoHero:    'f_auto,vc_auto,q_auto:good,w_1920',
  videoMobile:  'f_auto,vc_auto,q_auto:good,w_768',
} as const;
```

---

## CDN CACHE STRATEGY {#cdn}

```typescript
// Vercel cache headers via route segment config
// These control the CDN edge cache (Vercel Edge Network)

// Static pages — cache forever, invalidate via deployment
export const dynamic = 'force-static';

// ISR pages — cache with revalidation
export const revalidate = 3600;

// Dynamic pages — no CDN cache
export const dynamic = 'force-dynamic';
```

```typescript
// API routes — manual cache-control headers
// app/api/posts/route.ts
export async function GET() {
  const posts = await cachedFetch('blog:posts', fetchFromCMS, 300);

  return Response.json(posts, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      //                         ↑ CDN cache 5min, ↑ serve stale for 10min while revalidating
    },
  });
}

// Never cache: user-specific data, form endpoints, auth routes
// app/api/user/route.ts
export async function GET() {
  return Response.json(userData, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
```

---

## CACHE INVALIDATION {#invalidation}

```typescript
// Complete invalidation flow — triggered by CMS webhook

// 1. CMS publishes content
// 2. CMS fires webhook to /api/revalidate
// 3. Next.js ISR revalidates pages
// 4. Redis cache invalidated for affected keys
// 5. Vercel/Netlify edge cache purged via platform API

// lib/invalidation.ts
export async function invalidateAll(type: string, slug?: string) {
  const promises: Promise<unknown>[] = [];

  // 1. Next.js ISR (via revalidatePath/revalidateTag — done in route handler)

  // 2. Redis invalidation
  promises.push(invalidateCache(`${type}:*`));
  if (slug) promises.push(invalidateCache(`${type}:${slug}`));

  // 3. Vercel edge cache purge (optional — ISR handles this mostly)
  if (process.env.VERCEL_TEAM_ID && process.env.VERCEL_TOKEN) {
    promises.push(
      fetch(`https://api.vercel.com/v1/deployments/${process.env.VERCEL_DEPLOYMENT_ID}/aliases`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
      })
    );
  }

  await Promise.allSettled(promises);
}

// Notify Slack when cache invalidated (optional)
export async function notifyCacheInvalidation(type: string, slug?: string) {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🔄 Cache invalidated: ${type}${slug ? `/${slug}` : ''} at ${new Date().toISOString()}`,
    }),
  });
}
```
