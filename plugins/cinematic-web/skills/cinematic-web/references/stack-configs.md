# Cinematic Web — Stack Configuration Reference

---

## FRAMEWORK RECOMMENDATION LOGIC

When user says "suggest one for my project":

| Project Type | Recommended Framework | Reason |
|---|---|---|
| SaaS / App marketing | **Next.js** | SSR for SEO, React ecosystem, Vercel deploy |
| Portfolio / Agency | **Astro** | Zero JS by default, fastest load, island architecture |
| E-commerce (headless) | **Next.js** | Shopify / Medusa integration, ISR for catalog |
| Content-heavy / Blog | **Nuxt.js** (Vue) or **Astro** | Content collections, great DX |
| Interactive / App-like | **SvelteKit** | Smallest bundle, reactive, great animation perf |
| One-page / Campaign | **Plain HTML** | Zero build overhead, max control, Vite optional |
| Unsure / First project | **Next.js** | Largest community, most tutorials, solid defaults |

---

## ANIMATION LIBRARY SELECTION MATRIX

| Framework | Complexity | Recommended | Notes |
|---|---|---|---|
| Next.js / React | High (cinematic) | **GSAP** + **Framer Motion** | GSAP for scroll, Framer for component animation |
| Next.js / React | Medium | **Framer Motion** only | Clean DX, declarative, SSR-safe |
| Next.js / React | Low | **CSS + Intersection Observer** | Zero bundle cost |
| Astro | High | **GSAP** + Astro View Transitions | GSAP works in islands |
| Astro | Medium | **AOS** or **CSS animations** | Lightweight, no framework needed |
| Nuxt / Vue | High | **GSAP** + **@vueuse/motion** | Best Vue animation combo |
| Nuxt / Vue | Medium | **@vueuse/motion** | Vue-native, clean API |
| SvelteKit | High | **GSAP** + Svelte transitions | GSAP for complex, Svelte for simple |
| SvelteKit | Medium | **Svelte transitions** + **fly/fade** | Zero overhead, built-in |
| Plain HTML | High | **GSAP** + **Lenis** (smooth scroll) | Full control |
| Plain HTML | Medium | **AOS** | Simple setup, CDN available |
| Any | Mobile-first strict | **CSS only** + `@keyframes` | Best performance budget |

**Lenis (smooth scroll):** Free, works with any framework, pairs perfectly with GSAP ScrollTrigger
```bash
npm install lenis
```

---

## 3D ELEMENT DECISION MATRIX

```
Is this a luxury / portfolio / product showcase?
  YES → Use Spline (visual impact, no code complexity)

Is this SaaS / tech / data product?
  YES → Is the team comfortable with Three.js?
    YES → Three.js (particle system, shader, wireframe)
    NO  → Spline (embed a pre-built scene)

Is this a brand with an animated mascot/icon?
  YES → Rive (interactive animated vector graphics)

Is performance budget strict? (mobile-first, low-bandwidth region)
  YES → CSS 3D transforms only OR no 3D

Is this a one-page campaign / marketing?
  YES → CSS 3D (perspective transforms, card flips) — no lib needed

Complexity = Low / Marketing?
  → No 3D — cinematic via video + parallax layers
```

---

## NEXT.JS SCAFFOLD

```
my-project/
├── app/
│   ├── layout.tsx          ← Root layout, fonts, Cloudinary provider
│   ├── page.tsx            ← Homepage
│   ├── about/page.tsx
│   ├── globals.css         ← CSS variables, typography, resets
│   └── fonts.ts            ← next/font setup
├── components/
│   ├── Hero/
│   │   ├── Hero.tsx        ← Cinematic hero with video + 3D
│   │   ├── HeroVideo.tsx   ← Cloudinary video component
│   │   └── Hero.module.css
│   ├── sections/
│   ├── ui/                 ← Buttons, cards, badges
│   └── layout/             ← Nav, Footer
├── lib/
│   ├── cloudinary.ts       ← Cloudinary helper functions
│   ├── animation.ts        ← GSAP setup, ScrollTrigger registration
│   └── fonts.ts
├── public/assets/          ← User-provided assets (not generated)
├── .env.local
├── .env.example
├── next.config.ts           ← TypeScript config (Next.js 15 default)
├── tailwind.config.ts       ← If using Tailwind 4
└── README.md
```

**next.config.ts — Next.js 15 compatible:**
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
    formats: ['image/avif', 'image/webp'],  // avif first — smaller files
  },
  // Turbopack is now default in Next.js 15 dev — this is the stable config key
  turbopack: {
    rules: {
      // Add any file transform rules here if needed
    },
  },
  // Logging — helps debug fetch caching in Next.js 15
  logging: {
    fetches: {
      fullUrl: true,       // logs full URL so you can see which fetches cache
    },
  },
  // Headers — security defaults (also set in vercel.json/netlify.toml)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
```

---

## ASTRO SCAFFOLD

```
my-project/
├── src/
│   ├── layouts/
│   │   └── Layout.astro    ← Root layout, head, global styles
│   ├── pages/
│   │   ├── index.astro     ← Homepage
│   │   └── about.astro
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── HeroVideo.astro
│   │   └── sections/
│   ├── styles/
│   │   ├── global.css      ← CSS variables, resets
│   │   └── animations.css
│   └── lib/
│       └── cloudinary.ts
├── public/assets/
├── astro.config.mjs
├── .env
└── README.md
```

**astro.config.mjs:**
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';    // if using React islands
import vue from '@astrojs/vue';        // if using Vue islands
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'static',                    // or 'server' if SSR needed
  image: { service: { entrypoint: 'astro/assets/services/sharp' } }
});
```

---

## SVELTEKIT SCAFFOLD

```
my-project/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte  ← Root layout
│   │   ├── +page.svelte    ← Homepage
│   │   └── about/+page.svelte
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Hero.svelte
│   │   │   └── sections/
│   │   ├── cloudinary.ts
│   │   └── animation.ts
│   └── app.css             ← Global styles + CSS variables
├── static/assets/          ← User-provided assets
├── svelte.config.js
├── vite.config.ts
├── .env
└── README.md
```

---

## PLAIN HTML SCAFFOLD

```
my-project/
├── index.html
├── about.html
├── css/
│   ├── variables.css       ← CSS custom properties (colors, type, spacing)
│   ├── reset.css
│   ├── typography.css
│   ├── animations.css      ← Keyframes and scroll animation classes
│   └── main.css            ← Component styles
├── js/
│   ├── main.js             ← Entry point, GSAP init, Lenis setup
│   ├── hero.js             ← Hero-specific animation and 3D
│   ├── scroll.js           ← ScrollTrigger setup per section
│   └── cloudinary.js       ← Asset URL builder helper
├── assets/                 ← User-provided assets
├── .env                    ← Loaded via Vite or manual config
└── README.md
```

---

## BACKEND CONFIG MATRIX

| Backend Choice | What to Scaffold |
|---|---|
| **Static only** | No API routes. Contact form → Formspree or Netlify Forms |
| **Sanity CMS** | `sanity.config.ts`, schema files, `@sanity/client` setup, GROQ queries |
| **Contentful** | `contentful` SDK, Content delivery API setup, type generation |
| **Strapi** | Docker-compose or Strapi Cloud setup, REST or GraphQL queries |
| **Supabase** | `@supabase/supabase-js`, Row-level security setup, auth config |
| **Firebase** | `firebase` SDK, Firestore rules, hosting config |
| **Express API** | `express`, CORS, env config, route structure scaffold |
| **FastAPI** | `main.py`, requirements.txt, CORS middleware, route scaffold |

---

## HOSTING RECOMMENDATION MATRIX

| Framework | Recommended Host | Free Tier | Notes |
|---|---|---|---|
| Next.js | **Vercel** | Yes (hobby) | Native Next.js support |
| Astro | **Netlify** or Vercel | Yes | Both work equally well |
| SvelteKit | **Vercel** or Netlify | Yes | Both have SvelteKit adapters |
| Nuxt | **Vercel** or **Netlify** | Yes | Nuxt hub on NuxtHub.dev also great |
| Plain HTML | **Netlify** or **Cloudflare Pages** | Yes | Fastest CDN edge delivery |
| Any + backend | **Railway** or **Fly.io** | Free tier | For Docker/Node/Python APIs |

---

## ENV VARIABLE TEMPLATE (.env.example)

```env
# ─── CLOUDINARY ────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=   # Client-side access (Next.js)

# ─── IMAGE/VIDEO GENERATION ────────────────────────────
GOOGLE_AI_STUDIO_KEY=                # Default: Veo 2 + Imagen 3
OPENAI_API_KEY=                      # Optional: DALL·E 3
RUNWAY_API_KEY=                      # Optional: Runway Gen-3
REPLICATE_API_TOKEN=                 # Optional: Kling via Replicate
STABILITY_API_KEY=                   # Optional: Stability AI

# ─── STOCK MEDIA (FALLBACK) ────────────────────────────
UNSPLASH_ACCESS_KEY=                 # Free: https://unsplash.com/developers
PEXELS_API_KEY=                      # Free: https://www.pexels.com/api/

# ─── CMS / BACKEND ────────────────────────────────────
NEXT_PUBLIC_SANITY_PROJECT_ID=       # If using Sanity
NEXT_PUBLIC_SANITY_DATASET=production
SUPABASE_URL=                        # If using Supabase
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CONTENTFUL_SPACE_ID=                 # If using Contentful
CONTENTFUL_ACCESS_TOKEN=

# ─── PROJECT ───────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://yoursite.com
PROJECT_SLUG=                        # Used for Cloudinary folder structure
```

---

## VERSION MANIFEST — PINNED EXACT VERSIONS {#versions}

Always use these exact versions in generated `package.json`. No `^` or `~` prefixes.
Updated: Q2 2026. Verify latest stable at npmjs.com before generating.

### NEXT.JS 15 BREAKING CHANGES — READ BEFORE GENERATING ANY CODE

Next.js 15 introduced several breaking changes that affect every generated file.
Apply these corrections automatically without being asked:

**CHANGE 1 — headers() and cookies() are async:**
```typescript
// WRONG (Next.js 14 style — breaks in Next.js 15)
const ip = headers().get('x-forwarded-for') ?? 'anonymous'

// CORRECT (Next.js 15+)
import { headers } from 'next/headers'
const headersList = await headers()
const ip = headersList.get('x-forwarded-for') ?? 'anonymous'

// In Server Actions specifically:
export async function myAction(formData: FormData) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? 'anonymous'
}
```

**CHANGE 2 — params and searchParams are Promises:**
```typescript
// WRONG (Next.js 14 style)
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params  // ← breaks in Next.js 15
}

// CORRECT (Next.js 15+)
export default async function Page({
  params,
  searchParams,
}: {
  params:       Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug }  = await params
  const { query } = await searchParams
}

// Client component alternative — use React.use()
'use client'
import { use } from 'react'
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
}
```

**CHANGE 3 — fetch() caching is opt-in (no automatic caching):**
```typescript
// WRONG — no longer cached by default in Next.js 15
fetch('/api/data')

// CORRECT — always be explicit
fetch('/api/data', { next: { revalidate: 60 } })     // cache 60s
fetch('/api/data', { cache: 'force-cache' })           // cache forever
fetch('/api/data', { cache: 'no-store' })              // never cache
```

**CHANGE 4 — React 19 APIs (use with Next.js 15):**
```typescript
// REMOVED: useFormState (react-dom/client) — use useActionState from react instead
// WRONG:
import { useFormState } from 'react-dom'
// CORRECT:
import { useActionState } from 'react'

// NEW: ref is now a prop (no forwardRef needed for simple cases)
// WRONG:
const Input = forwardRef<HTMLInputElement, Props>((props, ref) => <input ref={ref} {...props} />)
// CORRECT (React 19+):
function Input({ ref, ...props }: Props & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />
}

// NEW: use() hook for async data in client components
import { use } from 'react'
function ClientComponent({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise)  // suspends until resolved
}
```

**CHANGE 5 — Turbopack is default dev bundler:**
```bash
# Next.js 15 default dev command uses Turbopack
next dev  # now runs Turbopack automatically

# GSAP with Turbopack — always register plugins explicitly:
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Observer } from 'gsap/Observer'

// Must call registerPlugin before ANY use — Turbopack doesn't hoist
gsap.registerPlugin(ScrollTrigger, Observer)
```

```json
{
  "dependencies": {
    "next":                      "15.3.2",
    "react":                     "19.1.0",
    "react-dom":                 "19.1.0",
    "gsap":                      "3.12.7",
    "lenis":                     "1.3.4",
    "framer-motion":             "12.9.4",
    "cloudinary":                "2.6.1",
    "next-cloudinary":           "6.16.0",
    "resend":                    "4.2.0",
    "zod":                       "3.24.4",
    "@upstash/redis":            "1.34.6",
    "@upstash/ratelimit":        "2.0.5",
    "@sentry/nextjs":            "9.14.0",
    "swr":                       "2.3.3",
    "@tanstack/react-query":     "5.69.0",
    "isomorphic-dompurify":      "2.23.0",
    "@splinetool/react-spline":  "4.0.0",
    "@splinetool/runtime":       "1.9.54",
    "three":                     "0.176.0",
    "@types/three":              "0.176.0",
    "remotion":                  "4.0.285",
    "@remotion/cli":             "4.0.285",
    "@remotion/player":          "4.0.285"
  },
  "devDependencies": {
    "typescript":                "5.8.3",
    "@types/react":              "19.1.2",
    "@types/react-dom":          "19.1.2",
    "@types/node":               "22.15.3",
    "tailwindcss":               "4.1.4",
    "@tailwindcss/typography":   "0.5.16",
    "eslint":                    "9.25.0",
    "eslint-config-next":        "15.3.2",
    "@playwright/test":          "1.52.0",
    "@axe-core/playwright":      "4.10.1",
    "chromatic":                 "12.0.0"
  }
}
```

**Nuxt 3 versions:**
```json
{
  "dependencies": {
    "nuxt":              "3.16.2",
    "vue":               "3.5.13",
    "@nuxt/content":     "2.13.4",
    "@nuxtjs/cloudinary":"2.0.0"
  }
}
```

**Astro versions:**
```json
{
  "dependencies": {
    "astro":             "5.7.0",
    "@astrojs/react":   "4.2.1",
    "@astrojs/sitemap": "3.3.0",
    "@astrojs/tailwind":"5.1.3"
  }
}
```

**SvelteKit versions:**
```json
{
  "dependencies": {
    "@sveltejs/kit":            "2.21.1",
    "svelte":                   "5.28.2",
    "@sveltejs/adapter-vercel": "5.6.1"
  }
}
```

### Version Update Reminder
Every quarter run: `npm outdated` and update this manifest.
Always check: Next.js changelog, GSAP migration guides, Three.js migration guide.
Commit `package-lock.json` to git — never rely on version ranges alone.
