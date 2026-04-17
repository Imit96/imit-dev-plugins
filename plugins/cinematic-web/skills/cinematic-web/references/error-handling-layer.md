# Cinematic Web — Error Handling Layer

## TABLE OF CONTENTS
1. [Error Philosophy](#philosophy)
2. [React Error Boundaries](#boundaries)
3. [Video Load Failure Fallback](#video)
4. [3D / WebGL Crash Fallback](#webgl)
5. [Cloudinary Unavailable Fallback](#cloudinary)
6. [Loading Skeleton System](#skeletons)
7. [API Error Handling](#api)
8. [Sentry Setup](#sentry)
9. [Error Monitoring Checklist](#checklist)

---

## ERROR PHILOSOPHY {#philosophy}

Cinematic sites are high-risk for silent failures:
- Hero video fails to load → visitor sees black rectangle
- Three.js crashes → blank canvas, no indication of failure
- Cloudinary URL is wrong → broken image icons everywhere
- CMS API times out → entire page fails to render

**Rule:** Every complex component (video, 3D, image, CMS-driven section)
must have a graceful fallback that maintains visual quality.
Users should never see a broken state — only a slightly simpler but still
beautiful version of the intended design.

**Hierarchy:** Full cinematic → Simplified cinematic → Static beautiful → Error message

---

## REACT ERROR BOUNDARIES {#boundaries}

```tsx
// components/ErrorBoundary.tsx
'use client';
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
  section?: string; // for logging context
}
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Report to Sentry if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: { componentStack: info.componentStack, section: this.props.section },
      });
    }
    this.props.onError?.(error, info);
    console.error(`[ErrorBoundary:${this.props.section}]`, error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultErrorFallback section={this.props.section} />;
    }
    return this.props.children;
  }
}

function DefaultErrorFallback({ section }: { section?: string }) {
  return (
    <div className="error-fallback" role="alert" aria-live="polite">
      <p className="sr-only">{section ?? 'Section'} temporarily unavailable</p>
      {/* Visual fallback — matches brand, not a red error box */}
      <div className="error-fallback__visual" aria-hidden="true" />
    </div>
  );
}
```

**CSS for error fallback (visually minimal, not alarming):**
```css
.error-fallback {
  min-height: 200px;
  display: grid;
  place-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}
.error-fallback__visual {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-border), var(--color-surface-2));
  opacity: 0.5;
}
```

### Section-Specific Error Boundaries
```tsx
// Wrap every major section:

// Hero (most critical)
<ErrorBoundary
  section="hero"
  fallback={<HeroStaticFallback />}
>
  <HeroCinematic />
</ErrorBoundary>

// 3D element
<ErrorBoundary
  section="3d-element"
  fallback={<StaticHeroImage src={heroImageUrl} alt={heroImageAlt} />}
>
  <ThreeJSScene />
</ErrorBoundary>

// CMS-driven section
<ErrorBoundary
  section="features"
  fallback={<FeaturesSkeleton />}
>
  <FeaturesFromCMS />
</ErrorBoundary>
```

---

## VIDEO LOAD FAILURE FALLBACK {#video}

```tsx
// components/HeroVideo.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Props {
  webmSrc: string;
  mp4Src:  string;
  poster:  string;
  posterAlt: string;
  fallbackImageSrc: string; // Cloudinary still image
}

export default function HeroVideo({
  webmSrc, mp4Src, poster, posterAlt, fallbackImageSrc,
}: Props) {
  const [failed, setFailed]     = useState(false);
  const [loaded, setLoaded]     = useState(false);
  const videoRef                = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Timeout: if video hasn't loaded in 8s, show fallback
    const timeout = setTimeout(() => {
      if (!loaded) setFailed(true);
    }, 8000);

    return () => clearTimeout(timeout);
  }, [loaded]);

  // Reduced motion: skip video entirely
  if (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return (
      <Image src={fallbackImageSrc} alt={posterAlt} fill
             className="hero-bg" priority />
    );
  }

  if (failed) {
    return (
      <Image src={fallbackImageSrc} alt={posterAlt} fill
             className="hero-bg" priority />
    );
  }

  return (
    <>
      {/* Poster shown immediately — swapped out when video loads */}
      {!loaded && (
        <Image src={poster} alt={posterAlt} fill
               className="hero-bg hero-bg--poster" priority />
      )}
      <video
        ref={videoRef}
        autoPlay muted loop playsInline
        poster={poster}
        aria-hidden="true"
        className={`hero-video ${loaded ? 'hero-video--loaded' : ''}`}
        onLoadedData={() => setLoaded(true)}
        onError={() => setFailed(true)}
      >
        <source src={webmSrc} type="video/webm" />
        <source src={mp4Src}  type="video/mp4"  />
      </video>
    </>
  );
}
```

```css
.hero-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity var(--dur-slow) var(--ease-smooth);
}
.hero-video--loaded { opacity: 1; }
.hero-bg--poster {
  transition: opacity var(--dur-slow) var(--ease-smooth);
}
```

---

## 3D / WEBGL CRASH FALLBACK {#webgl}

```tsx
// components/ThreeJSScene.tsx
'use client';
import { useEffect, useRef, useState } from 'react';

interface Props {
  fallbackImage: string;
  fallbackAlt:   string;
}

export default function ThreeJSScene({ fallbackImage, fallbackAlt }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // 1. Feature detection before loading Three.js
    const canvas  = document.createElement('canvas');
    const gl      = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      setSupported(false);
      return;
    }

    // 2. Dynamic import — don't block page for 3D
    let cleanup: (() => void) | undefined;
    import('./three-scene-init').then(({ initScene }) => {
      try {
        cleanup = initScene(canvasRef.current!);
      } catch (err) {
        console.error('Three.js init failed:', err);
        setError(true);
      }
    }).catch(() => setError(true));

    return () => cleanup?.();
  }, []);

  if (!supported || error) {
    return (
      <div className="scene-fallback" aria-hidden="true">
        <img src={fallbackImage} alt={fallbackAlt}
             className="scene-fallback__image" />
      </div>
    );
  }

  return (
    <canvas ref={canvasRef} className="three-canvas"
            aria-hidden="true" role="presentation" />
  );
}
```

### Spline Fallback
```tsx
// For Spline embeds — same pattern
'use client';
import { useState } from 'react';
import { Suspense } from 'react';

const SplineScene = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <SplinePlaceholder />,
});

export default function SplineWrapper({ scene, fallbackImage }: {
  scene: string; fallbackImage: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <img src={fallbackImage} alt="" aria-hidden="true"
                className="spline-fallback" />;
  }

  return (
    <ErrorBoundary section="spline" fallback={
      <img src={fallbackImage} alt="" aria-hidden="true" className="spline-fallback" />
    }>
      <SplineScene url={scene} onError={() => setFailed(true)} />
    </ErrorBoundary>
  );
}
```

---

## CLOUDINARY UNAVAILABLE FALLBACK {#cloudinary}

```typescript
// lib/cloudinary.ts — Resilient URL builder with local fallback
const CDN_BASE = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`;
const LOCAL_FALLBACK_BASE = '/assets/fallback';

export function imageUrl(
  publicId: string,
  transforms: string = 'f_auto,q_auto',
  fallbackLocal?: string
): string {
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    console.warn('Cloudinary cloud name not set — using local fallback');
    return fallbackLocal ?? `${LOCAL_FALLBACK_BASE}/${publicId.split('/').pop()}`;
  }
  return `${CDN_BASE}/image/upload/${transforms}/${publicId}`;
}

// Next.js Image component with fallback
// components/CloudinaryImage.tsx
'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function CloudinaryImage({
  publicId, fallbackSrc, alt, ...props
}: {
  publicId: string; fallbackSrc: string; alt: string;
  [key: string]: unknown;
}) {
  const [src, setSrc] = useState(imageUrl(publicId));

  return (
    <Image
      src={src} alt={alt}
      onError={() => setSrc(fallbackSrc)}
      {...props}
    />
  );
}
```

---

## LOADING SKELETON SYSTEM {#skeletons}

Paradigm-matched skeletons — not generic gray boxes:

```css
/* ── Base skeleton animation ───────────────────────────────── */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
@keyframes skeleton-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.skeleton {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 4px;
}

/* Shimmer variant (more polished) */
.skeleton--shimmer {
  animation: skeleton-shimmer 2s linear infinite;
  background: linear-gradient(
    90deg,
    var(--color-surface)   0%,
    var(--color-surface-2) 50%,
    var(--color-surface)   100%
  );
  background-size: 200% 100%;
}

/* Glass paradigm skeleton */
.paradigm-glass .skeleton {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  animation: skeleton-pulse 2s ease-in-out infinite;
}

/* Brutalism paradigm skeleton */
.paradigm-brutal .skeleton {
  background: transparent;
  border: 3px solid var(--brut-black);
  box-shadow: 4px 4px 0 var(--brut-black);
  animation: none; /* Brutalism doesn't animate softly */
}
```

```tsx
// components/skeletons/HeroSkeleton.tsx
export function HeroSkeleton() {
  return (
    <div className="hero-skeleton" aria-busy="true" aria-label="Loading hero section">
      <div className="skeleton skeleton--shimmer hero-skeleton__bg" />
      <div className="hero-skeleton__content">
        <div className="skeleton hero-skeleton__headline" />
        <div className="skeleton hero-skeleton__subline" />
        <div className="skeleton hero-skeleton__cta" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card-skeleton" aria-hidden="true">
      <div className="skeleton skeleton--shimmer card-skeleton__image" />
      <div className="card-skeleton__body">
        <div className="skeleton card-skeleton__title" />
        <div className="skeleton card-skeleton__text" />
        <div className="skeleton card-skeleton__text card-skeleton__text--short" />
      </div>
    </div>
  );
}
```

```css
.hero-skeleton { position: relative; min-height: 100svh; overflow: hidden; }
.hero-skeleton__bg { position: absolute; inset: 0; border-radius: 0; }
.hero-skeleton__content {
  position: relative; z-index: 2;
  padding: clamp(2rem, 8vw, 6rem);
}
.hero-skeleton__headline { height: clamp(2rem, 6vw, 4rem); width: 60%; margin-bottom: 1rem; }
.hero-skeleton__subline   { height: 1.5rem; width: 45%; margin-bottom: 2rem; }
.hero-skeleton__cta       { height: 3rem; width: 160px; border-radius: 8px; }
.card-skeleton__image     { aspect-ratio: 16/9; width: 100%; border-radius: 8px 8px 0 0; }
.card-skeleton__title     { height: 1.25rem; width: 75%; margin: 1rem 0 0.5rem; }
.card-skeleton__text      { height: 0.875rem; width: 100%; margin-bottom: 0.5rem; }
.card-skeleton__text--short { width: 60%; }
```

---

## API ERROR HANDLING {#api}

```typescript
// lib/api-client.ts — Resilient fetch with retry and timeout
interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export async function resilientFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 10000, retries = 2, retryDelay = 1000, ...fetchOptions } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json() as T;

    } catch (error) {
      clearTimeout(timer);
      const isLast = attempt === retries;
      if (isLast) throw error;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }
  throw new Error('All retry attempts failed');
}

// CMS fetch with fallback to cached data
export async function fetchWithFallback<T>(
  url: string,
  fallbackData: T,
  cacheKey?: string
): Promise<T> {
  try {
    const data = await resilientFetch<T>(url);
    // Cache successful response
    if (cacheKey && typeof window !== 'undefined') {
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error('Fetch failed, using fallback:', error);
    // Try session cache first
    if (cacheKey && typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached) as T;
    }
    return fallbackData;
  }
}
```

---

## SENTRY SETUP {#sentry}

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT ?? 'production',
  tracesSampleRate: 0.1,     // 10% of transactions
  replaysOnErrorSampleRate: 1.0,  // 100% of sessions with errors
  replaysSessionSampleRate: 0.05, // 5% of all sessions
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,    // Privacy: mask user input
      blockAllMedia: false,
    }),
  ],
  // Don't log in development
  enabled: process.env.NODE_ENV === 'production',
  // Group related errors
  beforeSend(event) {
    // Filter out known browser extension errors
    if (event.exception?.values?.[0]?.value?.includes('Extension')) return null;
    return event;
  },
});
```

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=     # For source maps upload
```

**Free tier:** Sentry free = 5,000 errors/month. Enough for most projects.

---

## ERROR MONITORING CHECKLIST {#checklist}

```
ERROR BOUNDARIES
[ ] Hero section wrapped in ErrorBoundary with static fallback
[ ] 3D element wrapped with WebGL detection + fallback image
[ ] Video component has load timeout + error event handler
[ ] CMS-driven sections wrapped with skeleton fallback
[ ] Form wrapped with error boundary

FALLBACKS
[ ] Hero video: static image displays when video fails
[ ] 3D: static image displays when WebGL unavailable or crashes
[ ] Cloudinary image: local fallback path defined
[ ] CMS API: static/hardcoded fallback content defined for critical sections
[ ] Font load failure: system font fallback in CSS (font-display: swap)

SENTRY
[ ] Sentry DSN configured in .env
[ ] Sentry initialized in client config
[ ] Error boundaries report to Sentry (componentDidCatch)
[ ] Sentry dashboard accessible and showing events
[ ] Alert set up: email notification for error spike

LOGGING
[ ] console.error called in all catch blocks (server-side)
[ ] Error context includes section name + relevant data
[ ] No sensitive data (keys, passwords) in error messages
[ ] Production: no raw error messages exposed to users

TESTING
[ ] Test video failure: wrong URL → fallback image shows
[ ] Test WebGL: disable GPU in DevTools → fallback image shows
[ ] Test Cloudinary: wrong cloud name → local fallback shows
[ ] Test CMS timeout: block API in DevTools → skeleton persists gracefully
[ ] Test rate limit: submit form 4 times → rate limit message shown
```

---

## NEXT.JS APP ROUTER ERROR FILES {#approuter}

These four files are mandatory in every Next.js project. Generate them in Phase 5
before any page components. They are the first line of defence against crashes
reaching users as blank screens or raw error messages.

### Error hierarchy in Next.js App Router:

```
global-error.tsx    ← catches errors in root layout itself
error.tsx           ← catches errors in any route segment
[route]/error.tsx   ← catches errors in a specific route only
not-found.tsx       ← triggered by notFound() or 404 response
loading.tsx         ← Suspense boundary for async page data
```

### Where each error type comes from:

```
Server Component throws     → error.tsx catches it
useEffect crashes           → NOT caught by error.tsx (use ErrorBoundary)
GSAP crashes                → NOT caught by error.tsx (use ErrorBoundary)
WebGL init fails            → NOT caught by error.tsx (use try/catch in useEffect)
Root layout crashes         → global-error.tsx (only file that can catch this)
Dynamic route missing slug  → notFound() → not-found.tsx
API returns 404             → notFound() → not-found.tsx
```

### Correct error.tsx — marks as client component, reports to Sentry:

```tsx
// app/error.tsx  (also create per-route: app/blog/error.tsx etc.)
'use client'       // ← REQUIRED — error.tsx must be a Client Component
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }  // digest = server-side error ID
  reset: () => void                   // retries the failed render
}) {
  useEffect(() => {
    // Log to Sentry — digest links server log to client report
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: { digest: error.digest },
      })
    }
    // Always log locally too
    console.error('[Route Error]', error.message, error.digest)
  }, [error])

  return (
    <main style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', margin: 0 }}>
        Something went wrong
      </h2>
      <p style={{
        color: 'var(--color-text-muted)',
        maxWidth: '40ch',
        margin: 0,
        lineHeight: 1.6,
      }}>
        An unexpected error occurred. Our team has been notified
        {error.digest ? ` (ref: ${error.digest})` : ''}.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid var(--color-accent)',
            borderRadius: '6px',
            background: 'transparent',
            color: 'var(--color-accent)',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Try again
        </button>
        <Link href="/" style={{
          padding: '0.75rem 1.5rem',
          background: 'var(--color-surface)',
          borderRadius: '6px',
          textDecoration: 'none',
          color: 'var(--color-text)',
          fontSize: '1rem',
          border: '1px solid var(--color-border)',
        }}>
          Go home
        </Link>
      </div>
    </main>
  )
}
```

### global-error.tsx — must include html + body:

```tsx
// app/global-error.tsx
'use client'       // ← REQUIRED
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Global Error]', error.message, error.digest)
  }, [error])

  // global-error MUST render its own html/body
  // because the root layout itself failed
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        minHeight: '100vh',
        background: '#0a0f1e',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '480px' }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1.5rem',
            opacity: 0.3,
          }}>⚠</div>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 1rem', fontWeight: 600 }}>
            [BRAND_NAME] is temporarily unavailable
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0 0 2rem', lineHeight: 1.6 }}>
            We are working to restore service. Please try again shortly.
            {error.digest && (
              <span style={{ display: 'block', fontSize: '0.75rem',
                             marginTop: '0.5rem', opacity: 0.4 }}>
                Error ref: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.875rem 2rem',
              background: '[BRAND_ACCENT_HEX]',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
```

### not-found.tsx — on-brand, helpful, linked home:

```tsx
// app/not-found.tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },   // 404 pages should not be indexed
}

export default function NotFound() {
  return (
    <main style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      padding: '2rem',
      textAlign: 'center',
    }}>
      {/* Outlined 404 — uses brand accent, does not overpower */}
      <div style={{
        fontSize: 'clamp(5rem, 18vw, 14rem)',
        fontWeight: 900,
        lineHeight: 1,
        color: 'transparent',
        WebkitTextStroke: '2px var(--color-accent)',
        letterSpacing: '-0.04em',
        userSelect: 'none',
        opacity: 0.6,
      }}>
        404
      </div>
      <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)', margin: 0 }}>
        Page not found
      </h1>
      <p style={{
        color: 'var(--color-text-muted)',
        maxWidth: '36ch',
        margin: 0,
        lineHeight: 1.6,
      }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          padding: '0.875rem 2rem',
          background: 'var(--color-accent)',
          color: 'var(--color-bg)',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
        }}>
          Back to home
        </Link>
        <Link href="/contact" style={{
          padding: '0.875rem 2rem',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          textDecoration: 'none',
          color: 'var(--color-text)',
          fontSize: '0.95rem',
        }}>
          Contact us
        </Link>
      </div>
    </main>
  )
}
```

### Triggering not-found programmatically:

```tsx
// In any Server Component or Route Handler:
import { notFound } from 'next/navigation'

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()  // ← renders not-found.tsx, returns 404 status

  return <article>...</article>
}
```

### loading.tsx — Suspense skeleton per route:

```tsx
// app/loading.tsx
// Also create: app/blog/loading.tsx, app/work/loading.tsx etc.

export default function Loading() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      {/* CSS-only spinner — no JS, no library, renders immediately */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-accent)',
        animation: 'loading-spin 0.7s linear infinite',
      }} />
      <style>{`
        @keyframes loading-spin {
          to { transform: rotate(360deg) }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="loading-spin"] { animation: none; opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
```

### Error handling checklist — App Router specific:

```
[ ] app/error.tsx exists — has 'use client', reset button, Sentry report
[ ] app/global-error.tsx exists — has <html><body>, does not assume layout
[ ] app/not-found.tsx exists — on-brand, not-indexed, links home
[ ] app/loading.tsx exists — pure CSS spinner, respects reduced-motion
[ ] All dynamic pages: params typed as Promise<{...}> and awaited
[ ] All dynamic pages: notFound() called when data returns null
[ ] Per-route error.tsx for routes with their own error states (blog, work, etc.)
[ ] Server Components: try/catch around external API calls, graceful fallback returned
[ ] Client Components: ErrorBoundary wrapper around GSAP, Three.js, video, forms
```
