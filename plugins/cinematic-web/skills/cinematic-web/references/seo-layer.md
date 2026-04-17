# Cinematic Web — SEO & Analytics Layer

## TABLE OF CONTENTS
1. [Phase 5.5 — SEO Layer Flow](#flow)
2. [Meta Tags — Per Framework](#meta)
3. [Open Graph & Social Cards](#og)
4. [Structured Data / JSON-LD](#jsonld)
5. [Sitemap + Robots.txt](#sitemap)
6. [Analytics Integration](#analytics)
7. [Core Web Vitals](#vitals)
8. [SEO Audit Checklist](#audit)

---

## PHASE 5.5 — SEO LAYER FLOW {#flow}

Run after page code is generated (between Phase 5 and Phase 6 quality gate).

Ask the user:
1. "Do you have a Google Analytics 4 Measurement ID? (format: G-XXXXXXXXXX)"
2. "Do you want Hotjar heatmaps? (Hotjar Site ID if yes)"
3. "Will this site have a blog or multiple content pages? (affects sitemap complexity)"
4. "What is the primary target keyword or search intent for the homepage?"
5. "Do you want Open Graph images generated automatically via Cloudinary? (yes/no)"

Then generate: meta system + OG images + JSON-LD + sitemap + analytics setup
Output as complete files, not snippets.

---

## META TAGS — PER FRAMEWORK {#meta}

### Next.js 14+ (App Router — Metadata API)

```typescript
// lib/seo.ts — Centralized SEO config
export const siteConfig = {
  name: '[BRAND_NAME]',
  description: '[BRAND_TAGLINE] — [HERO_LINE]',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourdomain.com',
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL}/og-default.jpg`,
  twitterHandle: '@[BRAND_TWITTER]',
  locale: 'en_US',
  type: 'website' as const,
};

// Default metadata — app/layout.tsx
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — [BRAND_TAGLINE]`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['[KEYWORD_1]', '[KEYWORD_2]', '[KEYWORD_3]'],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true,
                 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} — [BRAND_TAGLINE]`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630,
               alt: `${siteConfig.name} — [BRAND_TAGLINE]` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — [BRAND_TAGLINE]`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  alternates: { canonical: siteConfig.url },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};
```

```typescript
// Per-page metadata — app/about/page.tsx (example)
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'About',
  description: '[ABOUT_PAGE_DESCRIPTION]',
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    url: `${siteConfig.url}/about`,
    images: [{
      url: `${siteConfig.url}/og-about.jpg`,
      width: 1200, height: 630,
    }],
  },
};
```

---

### Astro (Head component)

```astro
---
// components/SEO.astro
interface Props {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
  type?: 'website' | 'article';
}

const {
  title,
  description,
  image = '/og-default.jpg',
  canonical = Astro.url.pathname,
  type = 'website',
} = Astro.props;

const siteUrl    = import.meta.env.SITE_URL ?? 'https://yourdomain.com';
const siteTitle  = '[BRAND_NAME]';
const fullTitle  = title === siteTitle ? title : `${title} | ${siteTitle}`;
const absoluteImage = image.startsWith('http') ? image : `${siteUrl}${image}`;
---

<title>{fullTitle}</title>
<meta name="description"    content={description} />
<meta name="robots"         content="index, follow" />
<link rel="canonical"       href={`${siteUrl}${canonical}`} />

<!-- Open Graph -->
<meta property="og:type"        content={type} />
<meta property="og:url"         content={`${siteUrl}${canonical}`} />
<meta property="og:title"       content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:image"       content={absoluteImage} />
<meta property="og:site_name"   content={siteTitle} />

<!-- Twitter -->
<meta name="twitter:card"        content="summary_large_image" />
<meta name="twitter:title"       content={fullTitle} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image"       content={absoluteImage} />

<!-- Preconnects for performance -->
<link rel="preconnect" href="https://res.cloudinary.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

---

### Nuxt 3 (useHead / useSeoMeta)

```typescript
// composables/useSEO.ts
export function useSEO(options: {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
}) {
  const config = useRuntimeConfig();
  const siteUrl = config.public.siteUrl;
  const image = options.image ?? `${siteUrl}/og-default.jpg`;

  useSeoMeta({
    title: options.title,
    titleTemplate: `%s | [BRAND_NAME]`,
    description: options.description,
    robots: 'index, follow',
    ogType: 'website',
    ogUrl: `${siteUrl}${options.canonical ?? '/'}`,
    ogTitle: options.title,
    ogDescription: options.description,
    ogImage: image,
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: image,
  });

  useHead({
    link: [
      { rel: 'canonical', href: `${siteUrl}${options.canonical ?? '/'}` },
      { rel: 'preconnect', href: 'https://res.cloudinary.com' },
    ],
  });
}
```

---

### SvelteKit (svelte:head)

```svelte
<!-- components/SEO.svelte -->
<script lang="ts">
  export let title: string;
  export let description: string;
  export let image = '/og-default.jpg';
  export let canonical = '';

  const siteTitle = '[BRAND_NAME]';
  const siteUrl   = import.meta.env.VITE_SITE_URL ?? 'https://yourdomain.com';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description"     content={description} />
  <link rel="canonical"        href={`${siteUrl}${canonical}`} />
  <meta property="og:title"    content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:image"    content={fullImage} />
  <meta name="twitter:card"    content="summary_large_image" />
  <meta name="twitter:image"   content={fullImage} />
</svelte:head>
```

---

## OPEN GRAPH & SOCIAL CARDS {#og}

### Dynamic OG Image — Next.js (@vercel/og)

```typescript
// app/og/route.tsx — Dynamic OG image generation
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title       = searchParams.get('title') ?? '[BRAND_NAME]';
  const description = searchParams.get('description') ?? '[BRAND_TAGLINE]';

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        background: '[BRAND_BG_COLOR]',
        padding: '80px',
        position: 'relative',
      }}>
        {/* Brand accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '6px', background: '[BRAND_ACCENT]',
        }} />
        {/* Logo / brand name */}
        <div style={{
          fontSize: 28, color: '[BRAND_ACCENT]',
          fontFamily: 'sans-serif', fontWeight: 700,
          marginBottom: 40,
        }}>
          [BRAND_NAME]
        </div>
        {/* Title */}
        <div style={{
          fontSize: 64, color: '[BRAND_TEXT_COLOR]',
          fontFamily: 'sans-serif', fontWeight: 800,
          lineHeight: 1.1, marginBottom: 24,
          maxWidth: '80%',
        }}>
          {title}
        </div>
        {/* Description */}
        <div style={{
          fontSize: 26, color: 'rgba(255,255,255,0.65)',
          fontFamily: 'sans-serif',
        }}>
          {description}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

// Usage in any page:
// ogImage: `${siteConfig.url}/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(desc)}`
```

### Cloudinary OG Image (no server needed)
```typescript
// lib/cloudinary-og.ts — Generate OG images via Cloudinary text overlays
export function generateOGImage(options: {
  title: string;
  description?: string;
  templatePublicId?: string; // Base OG template uploaded to Cloudinary
}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const template  = options.templatePublicId ?? `[PROJECT_SLUG]/og-template`;

  const titleEncoded = encodeURIComponent(options.title);
  const descEncoded  = options.description
    ? encodeURIComponent(options.description) : '';

  return [
    `https://res.cloudinary.com/${cloudName}/image/upload`,
    `l_text:[BRAND_FONT]_60_bold:${titleEncoded},co_white,w_900,c_fit`,
    `l_text:[BRAND_FONT]_28:${descEncoded},co_rgb:AAAAAA,w_900,c_fit,y_80`,
    `f_jpg,q_auto,w_1200,h_630`,
    `${template}.jpg`,
  ].join('/');
}
```

---

## STRUCTURED DATA / JSON-LD {#jsonld}

Output all relevant JSON-LD schemas. Include in `<head>` of each page type.

### Organization Schema (all pages — in root layout)
```typescript
// lib/structured-data.ts
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '[BRAND_NAME]',
  url: '[SITE_URL]',
  logo: '[SITE_URL]/logo.png',
  description: '[BRAND_DESCRIPTION]',
  sameAs: [
    'https://twitter.com/[BRAND_TWITTER]',
    'https://linkedin.com/company/[BRAND_LINKEDIN]',
    'https://instagram.com/[BRAND_INSTAGRAM]',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: '[BRAND_EMAIL]',
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '[BRAND_NAME]',
  url: '[SITE_URL]',
  potentialAction: {
    '@type': 'SearchAction',
    target: '[SITE_URL]/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

// Software / SaaS product schema (if applicable)
export const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '[PRODUCT_NAME]',
  applicationCategory: 'BusinessApplication',
  offers: {
    '@type': 'Offer',
    price: '[STARTING_PRICE]',
    priceCurrency: 'USD',
  },
  operatingSystem: 'Web',
  description: '[PRODUCT_DESCRIPTION]',
};

// Reusable render function for any framework
export function renderJsonLd(schema: object): string {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}
```

### FAQ Schema (for FAQ sections)
```typescript
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}
```

### BreadcrumbList Schema
```typescript
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, url }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: url,
    })),
  };
}
```

---

## SITEMAP + ROBOTS.TXT {#sitemap}

### Next.js (app/sitemap.ts)
```typescript
import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourdomain.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ];

  // Dynamic pages (if CMS-driven blog/posts)
  // const posts = await fetchFromCMS();
  // const dynamicPages = posts.map(post => ({
  //   url: `${siteUrl}/blog/${post.slug}`,
  //   lastModified: post.updatedAt,
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.7,
  // }));

  return [...staticPages /*, ...dynamicPages */];
}
```

### app/robots.ts
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourdomain.com';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

### Astro (public/robots.txt + sitemap integration)
```javascript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yourdomain.com',
  integrations: [sitemap()],
});
// Generates /sitemap-index.xml automatically from all pages
```

---

## ANALYTICS INTEGRATION {#analytics}

### GA4 — Next.js

```typescript
// components/Analytics.tsx
'use client';
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function Analytics() {
  if (!GA_ID || process.env.NODE_ENV !== 'production') return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
          function gtag(){dataLayer.push(arguments);}
          gtag('js',new Date());
          gtag('config','${GA_ID}',{send_page_view:false});`}
      </Script>
    </>
  );
}
```

```typescript
// lib/analytics.ts — Event tracking helpers
declare const gtag: (...args: unknown[]) => void;

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof gtag === 'undefined') return;
  gtag('event', eventName, params);
}

export function trackPageView(url: string) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'page_view', { page_path: url });
}

// Standard events — call these at the right moments:
export const events = {
  ctaClick:       (location: string)      => trackEvent('cta_click', { location }),
  formSubmit:     (formName: string)      => trackEvent('form_submit', { form_name: formName }),
  videoPlay:      (videoId: string)       => trackEvent('video_play', { video_id: videoId }),
  scrollDepth:    (percent: number)       => trackEvent('scroll_depth', { percent }),
  outboundClick:  (url: string)           => trackEvent('outbound_click', { url }),
  featureView:    (featureName: string)   => trackEvent('feature_view', { feature: featureName }),
};
```

### Hotjar Integration
```typescript
// components/Hotjar.tsx — Heatmaps + session recording
'use client';
import Script from 'next/script';

const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID;

export default function Hotjar() {
  if (!HOTJAR_ID || process.env.NODE_ENV !== 'production') return null;
  return (
    <Script id="hotjar" strategy="afterInteractive">
      {`(function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${HOTJAR_ID},hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
    </Script>
  );
}
```

### Scroll Depth Tracking (GA4)
```typescript
// Automatically track 25/50/75/100% scroll depth
export function initScrollDepthTracking() {
  const milestones = [25, 50, 75, 100];
  const fired = new Set<number>();

  window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    milestones.forEach(ms => {
      if (scrolled >= ms && !fired.has(ms)) {
        fired.add(ms);
        events.scrollDepth(ms);
      }
    });
  }, { passive: true });
}
```

### Environment Variables for Analytics
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=XXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=         # Optional
```

---

## CORE WEB VITALS {#vitals}

### web-vitals library setup (Next.js)
```typescript
// app/layout.tsx — report to GA4
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

function sendToGA(metric: { name: string; value: number; id: string }) {
  if (typeof gtag === 'undefined') return;
  gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id,
    non_interaction: true,
  });
}

// Call in client component
onCLS(sendToGA); onFCP(sendToGA); onINP(sendToGA);
onLCP(sendToGA); onTTFB(sendToGA);
```

### Performance Targets (include in README)
```
LCP  (Largest Contentful Paint): < 2.5s ✓ / 2.5–4s ⚠ / >4s ✗
INP  (Interaction to Next Paint): < 200ms ✓ / 200–500ms ⚠ / >500ms ✗
CLS  (Cumulative Layout Shift):   < 0.1 ✓ / 0.1–0.25 ⚠ / >0.25 ✗
TTFB (Time to First Byte):        < 800ms ✓ / 800–1800ms ⚠ / >1800ms ✗
FCP  (First Contentful Paint):    < 1.8s ✓ / 1.8–3s ⚠ / >3s ✗

Cinematic site budget warnings:
- Hero video:    < 3MB (WebM) / < 5MB (MP4)
- Hero image:    < 200KB (WebP via Cloudinary auto)
- 3D JS bundle:  < 150KB gzipped (Three.js tree-shaken)
- GSAP bundle:   < 50KB gzipped (import only used plugins)
- Total JS:      < 300KB gzipped (first load)
```

---

## SEO AUDIT CHECKLIST {#audit}

Run before Quality Gate (Phase 6):

```
META & CONTENT
[ ] Every page has unique <title> (50–60 chars)
[ ] Every page has unique meta description (150–160 chars)
[ ] No page has duplicate title or description
[ ] H1 exists exactly once per page — matches page intent
[ ] Heading hierarchy: H1 → H2 → H3 (no skipping)
[ ] All images have descriptive alt text
[ ] All links have descriptive text (no "click here")

TECHNICAL SEO
[ ] canonical URLs set on all pages
[ ] robots.txt exists and is correct
[ ] sitemap.xml generated and submitted
[ ] HTTPS enforced (redirect http → https)
[ ] www vs non-www: one canonical version
[ ] 404 page is custom and helpful
[ ] No broken internal links

SOCIAL / OG
[ ] og:title, og:description, og:image on all pages
[ ] og:image is 1200×630px minimum
[ ] Twitter card meta present
[ ] OG image tested in: Twitter Card Validator, LinkedIn Post Inspector

STRUCTURED DATA
[ ] Organization schema on homepage
[ ] Product/SoftwareApplication schema (if applicable)
[ ] FAQ schema on FAQ sections
[ ] BreadcrumbList on all interior pages
[ ] Validate at: https://validator.schema.org

PERFORMANCE (SEO SIGNALS)
[ ] LCP < 2.5s (test with PageSpeed Insights)
[ ] CLS < 0.1 (no layout shift on hero load)
[ ] Mobile-friendly test passing
[ ] No render-blocking scripts in <head>
[ ] Fonts: preconnect + font-display: swap

ANALYTICS
[ ] GA4 tracking verified (Realtime view shows traffic)
[ ] Key events firing: cta_click, form_submit, scroll_depth
[ ] Hotjar recording sessions (if configured)
```

---

## SITE VERIFICATION — ALL SEARCH ENGINES {#verification}

Verification proves to search engines you own the site. Generate ALL of these
in Phase 5.5 — even if the user doesn't plan to use Bing, it costs nothing
and takes 2 minutes to set up later.

### Verification meta tags (generated in app/layout.tsx)

```typescript
// app/layout.tsx — add to metadata export
export const metadata: Metadata = {
  // ... existing metadata
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? '',   // from Search Console
    yandex: process.env.YANDEX_VERIFICATION ?? '',        // from Yandex Webmaster
    other:  {
      // Bing uses a different meta name format
      'msvalidate.01': process.env.BING_SITE_VERIFICATION ?? '',
    },
  },
}
```

```env
# Add to .env.example — user fills in after creating accounts
GOOGLE_SITE_VERIFICATION=           # Google Search Console → Add property → HTML tag → content value
BING_SITE_VERIFICATION=             # Bing Webmaster Tools → Add site → XML file method OR meta tag value
YANDEX_VERIFICATION=                # Yandex Webmaster → Add site → meta tag value
```

**These render as:**
```html
<meta name="google-site-verification" content="[value]" />
<meta name="msvalidate.01" content="[value]" />
<meta name="yandex-verification" content="[value]" />
```

---

## INDEXNOW — INSTANT INDEXING API {#indexnow}

IndexNow is a protocol supported by Bing, Yandex, and indirectly Google
(via partnerships). When you publish or update a URL, you ping the IndexNow
API and search engines process it within minutes instead of waiting for
their next crawl (which can take days or weeks on new sites).

**Supported by:** Bing, Yandex, Seznam, Naver. Google has its own Indexing API
(for specific content types), covered separately below.

```bash
npm install crypto  # already in Node.js — no install needed
```

```env
INDEXNOW_KEY=         # generate below — a random 32-char hex string
```

### Generate your IndexNow key

```bash
# In your terminal — generate a random key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
# Copy the output → paste as INDEXNOW_KEY in .env
```

### Expose the key as a file (required by IndexNow spec)

```typescript
// app/[key]/route.ts — serves the key file at /[your-key-value]
// e.g. https://yourdomain.com/abc123def456...
import { NextRequest, NextResponse } from 'next/server'

// This route must match your INDEXNOW_KEY exactly
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const indexNowKey = process.env.INDEXNOW_KEY

  if (key !== indexNowKey) {
    return new NextResponse('Not found', { status: 404 })
  }

  return new NextResponse(indexNowKey, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
```

### IndexNow ping function — call after publishing content

```typescript
// lib/seo/indexnow.ts
const INDEXNOW_KEY = process.env.INDEXNOW_KEY!
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL!

export async function pingIndexNow(urls: string[]) {
  if (!INDEXNOW_KEY || process.env.NODE_ENV !== 'production') return

  const payload = {
    host:    new URL(SITE_URL).hostname,
    key:     INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}`,
    urlList: urls,
  }

  try {
    // Ping Bing (reaches Yandex + others automatically)
    const res = await fetch('https://www.bing.com/indexnow', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body:    JSON.stringify(payload),
    })

    if (res.ok) {
      console.log(`[IndexNow] Pinged ${urls.length} URL(s) → ${res.status}`)
    } else {
      console.error(`[IndexNow] Failed: ${res.status} ${await res.text()}`)
    }
  } catch (err) {
    console.error('[IndexNow] Error:', err)
  }
}

// Usage — call after any content publish or update:
// await pingIndexNow([
//   'https://yourdomain.com/blog/new-post',
//   'https://yourdomain.com/work/new-case-study',
// ])
```

### Auto-ping on CMS publish (Sanity webhook)

```typescript
// app/api/webhooks/cms/route.ts — extend to include IndexNow ping
import { pingIndexNow } from '@/lib/seo/indexnow'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  // ... existing signature verification

  const body = await request.json()
  const slug  = body.slug ?? body._id

  // 1. Revalidate ISR cache
  revalidateTag('cms-content')
  if (body._type === 'post') revalidatePath(`/blog/${slug}`)

  // 2. Ping IndexNow immediately after publish
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
  const newUrl  = body._type === 'post'
    ? `${siteUrl}/blog/${slug}`
    : `${siteUrl}/${slug}`

  await pingIndexNow([newUrl, `${siteUrl}/sitemap.xml`])

  return NextResponse.json({ ok: true })
}
```

---

## GOOGLE INDEXING API — FOR SPECIFIC CONTENT TYPES {#google-indexing-api}

Google's Indexing API is officially supported only for **Job Posting** and
**BroadcastEvent** (livestream) structured data. However, many sites use it
for general content and see fast indexing results.

```bash
# Only needed if using Google Indexing API
npm install googleapis
```

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=       # from Google Cloud Console service account
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY= # from service account JSON key file
```

```typescript
// lib/seo/google-indexing.ts
import { google } from 'googleapis'

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key:  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!
      ?.replace(/\\n/g, '\n'),   // fix escaped newlines in .env
  },
  scopes: ['https://www.googleapis.com/auth/indexing'],
})

export async function notifyGoogleIndex(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
  try {
    const client = await auth.getClient()
    const res = await (client as any).request({
      url:    'https://indexing.googleapis.com/v3/urlNotifications:publish',
      method: 'POST',
      data:   { url, type },
    })
    console.log(`[Google Indexing] ${type}: ${url} → ${res.status}`)
  } catch (err) {
    console.error('[Google Indexing] Error:', err)
  }
}
```

---

## OPEN GRAPH IMAGE GENERATION — AUTOMATIC {#og-images}

Next.js can generate OG images dynamically per page using the ImageResponse API.
This eliminates the need to manually create 1200×630 images for every post.

```typescript
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size    = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function BlogOGImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // Fetch post data
  const post = await getPostBySlug(slug)

  return new ImageResponse(
    (
      <div style={{
        width:      '100%',
        height:     '100%',
        display:    'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding:    '80px',
        background: '#0A0F1E',   // --color-bg
        fontFamily: 'system-ui',
      }}>
        {/* Brand accent bar */}
        <div style={{
          width:        '80px',
          height:       '6px',
          background:   '[BRAND_ACCENT_HEX]',
          marginBottom: '24px',
          borderRadius: '3px',
        }} />

        {/* Post title */}
        <div style={{
          fontSize:     post?.title && post.title.length > 50 ? 56 : 72,
          fontWeight:   700,
          color:        '#FFFFFF',
          lineHeight:   1.1,
          maxWidth:     '80%',
          marginBottom: '24px',
        }}>
          {post?.title ?? 'Untitled'}
        </div>

        {/* Brand name */}
        <div style={{
          fontSize:  28,
          color:     'rgba(255,255,255,0.5)',
          fontWeight: 500,
        }}>
          [BRAND_NAME]
        </div>
      </div>
    ),
    { ...size }
  )
}
```

---

## SITEMAP PING — NOTIFY GOOGLE ON DEPLOY {#sitemap-ping}

After every deploy, ping Google's sitemap endpoint to trigger a fresh crawl.
Add to your CI/CD or post-deploy hook:

```bash
# scripts/ping-sitemap.sh — run after every production deploy
#!/bin/bash
SITE_URL=${1:-$NEXT_PUBLIC_SITE_URL}
SITEMAP_URL="${SITE_URL}/sitemap.xml"

echo "Pinging Google with sitemap: $SITEMAP_URL"
curl -s "https://www.google.com/ping?sitemap=${SITEMAP_URL}" && echo "✓ Google pinged"

echo "Pinging Bing with sitemap: $SITEMAP_URL"
curl -s "https://www.bing.com/ping?sitemap=${SITEMAP_URL}" && echo "✓ Bing pinged"
```

```yaml
# .github/workflows/deploy.yml — add after deploy step
- name: Ping search engines
  run: |
    SITE_URL=${{ secrets.NEXT_PUBLIC_SITE_URL }}
    curl -s "https://www.google.com/ping?sitemap=${SITE_URL}/sitemap.xml"
    curl -s "https://www.bing.com/ping?sitemap=${SITE_URL}/sitemap.xml"
```

---

## SEO LAUNCH CHECKLIST — COMPLETE SUBMISSION PROTOCOL {#launch-checklist}

Output this checklist at the end of Phase 5.5. The user follows it
after deploying to production. Steps are ordered by impact and urgency.

```
╔══════════════════════════════════════════════════════════════╗
║  SEO LAUNCH PROTOCOL — Do this on deploy day                ║
╚══════════════════════════════════════════════════════════════╝

STEP 1 — VERIFY SITE IS CRAWLABLE (5 minutes)
  [ ] Open: https://search.google.com/search-console
  [ ] Add property → URL prefix → enter your exact domain
  [ ] Choose verification method: HTML tag (easiest for Next.js)
        Copy the content value → paste as GOOGLE_SITE_VERIFICATION in .env
        Redeploy → come back and click Verify
  [ ] Once verified: Settings → Crawl stats → confirm Googlebot can access

STEP 2 — SUBMIT SITEMAP TO GOOGLE (2 minutes)
  [ ] In Search Console: Sitemaps → Add sitemap → enter: sitemap.xml
  [ ] Click Submit
  [ ] Status should show "Success" within a few minutes
  [ ] Note: indexing of all pages can take 1–14 days regardless of submission

STEP 3 — SET UP BING WEBMASTER TOOLS (5 minutes)
  [ ] Open: https://www.bing.com/webmasters
  [ ] Sign in with Microsoft account → Add site → enter domain
  [ ] Verification: Auto-verify if you have Search Console access (fastest)
        OR: Meta tag method → copy value → paste as BING_SITE_VERIFICATION → redeploy
  [ ] After verify: Sitemaps → Submit sitemap → enter: /sitemap.xml
  [ ] Bing reaches Yahoo, DuckDuckGo — one submission covers all

STEP 4 — ACTIVATE INDEXNOW (3 minutes — if configured)
  [ ] Confirm INDEXNOW_KEY is set in .env.production
  [ ] Confirm the key file is accessible: https://yourdomain.com/[YOUR_KEY]
        Should return: your key as plain text
  [ ] Test: POST to https://www.bing.com/indexnow with your homepage URL
        Using: curl or the IndexNow test tool at indexnow.org/validator
  [ ] After first CMS publish: verify URLs appear in Bing within 10 minutes

STEP 5 — REQUEST GOOGLE INDEX (optional fast path — 1 minute)
  [ ] In Search Console: URL Inspection → enter homepage URL
  [ ] Click "Request indexing"
  [ ] Repeat for: /about, /work, /services, /blog (if exists)
  [ ] Note: this is a manual request, not a guarantee. Limit: ~10/day

STEP 6 — VALIDATE OPEN GRAPH (10 minutes)
  [ ] Facebook/Meta Sharing Debugger: https://developers.facebook.com/tools/debug
        Enter homepage URL → Fetch new information → confirm title, description, image
  [ ] Twitter/X Card Validator: https://cards-dev.twitter.com/validator
        Enter homepage URL → confirm card preview looks correct
  [ ] LinkedIn Post Inspector: https://www.linkedin.com/post-inspector
        Enter homepage URL → confirm preview image correct
  [ ] If OG image is wrong: purge cache in Meta Debugger, wait 5 min, recheck

STEP 7 — VALIDATE STRUCTURED DATA (5 minutes)
  [ ] Google Rich Results Test: https://search.google.com/test/rich-results
        Enter homepage URL → confirm Organization schema detected
  [ ] Schema Markup Validator: https://validator.schema.org
        Enter homepage URL → confirm no errors
  [ ] If blog exists: test a post URL → confirm Article schema detected

STEP 8 — REGISTER WITH YANDEX (3 minutes — if international audience)
  [ ] Open: https://webmaster.yandex.com
  [ ] Add site → verify via meta tag → paste YANDEX_VERIFICATION in .env → redeploy
  [ ] Submit sitemap: /sitemap.xml
  [ ] Yandex reaches Russia, CIS countries — worth 5 minutes if relevant market

STEP 9 — GOOGLE ANALYTICS VERIFICATION (5 minutes)
  [ ] Open GA4: https://analytics.google.com
  [ ] Realtime → Overview → open your site in a new tab → confirm active user appears
  [ ] Check: Events → confirm page_view, session_start firing
  [ ] Set up key events: cta_click, form_submit, scroll_depth (if not already done)
  [ ] Link GA4 to Search Console (in GA4: Admin → Search Console links)
        This shows which search queries bring traffic

STEP 10 — CORE WEB VITALS BASELINE (5 minutes)
  [ ] PageSpeed Insights: https://pagespeed.web.dev
        Enter homepage URL → run test → record baseline scores
        Target: Performance > 80, LCP < 2.5s, CLS < 0.1
  [ ] Save screenshot → compare monthly
  [ ] If score < 70: review mobile-layer.md → performance section

POST-LAUNCH MONITORING SCHEDULE:
  Day 1:  Check Search Console for crawl errors
  Day 3:  Check if homepage appears in "site:yourdomain.com" search
  Week 1: Check Bing Webmaster for any issues
  Week 2: Check Search Console → Coverage → Indexed pages count
  Month 1: Check Core Web Vitals report in Search Console
  Month 3: Review Search Console → Performance → which queries drive traffic
```

---

## ONGOING SEO — WHAT ACTUALLY MOVES RANKINGS {#ongoing}

After submission is done, rankings are built over months.
Set user expectations correctly:

```
WHAT INDEXING MEANS vs WHAT RANKING MEANS:
  Indexed = Google knows your page exists (happens in days–weeks)
  Ranked  = Google shows your page for specific searches (happens in months)
  These are two completely different things.

WHAT ACTUALLY DRIVES RANKINGS (in rough priority order):
  1. Content quality and relevance — does your page answer the search intent?
  2. Page experience (Core Web Vitals) — fast, stable, mobile-friendly
  3. Backlinks — other sites linking to you (hardest to control)
  4. Internal linking — how well your pages link to each other
  5. Technical SEO — all the stuff this skill generates (foundations, not silver bullets)

WHAT THE SKILL HANDLES:
  ✓ Technical foundations (meta, OG, JSON-LD, sitemap, robots.txt, canonical)
  ✓ Page experience (performance, mobile, accessibility)
  ✓ Submission to all major engines
  ✓ Automated pinging on content updates (IndexNow)

WHAT NEEDS ONGOING HUMAN WORK:
  Content — writing useful, search-relevant pages consistently
  Backlinks — earning or building links from other sites
  Search Console monitoring — catching issues before they compound
```
