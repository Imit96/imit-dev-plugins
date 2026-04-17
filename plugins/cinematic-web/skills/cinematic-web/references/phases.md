# Cinematic Web — Phase Reference

---

## PHASE 0: DISCOVERY INTERVIEW

Run these 10 questions. You may group Q1–Q3 together, Q4–Q6 together, Q7–Q10 together.
Never ask all 10 at once. Wait for answers before the next group.

**GROUP A — The Project**
1. What is the name of the brand, product, or company this site is for?
2. In one sentence, what does it do or sell?
3. Who is the target audience? (Be specific: age range, profession, mindset, goal)

**GROUP B — The Vision**
4. What emotion should a visitor feel within the first 5 seconds of landing on the site?
5. Are there any sites (competitors or inspirations) whose visual style you admire? (URLs welcome)
6. What is the ONE thing you most want visitors to do on the site? (The primary CTA)

**GROUP C — The Constraints**
7. What is your monthly budget for tools and services?
   This covers: hosting, database, auth, video generation, email, monitoring.
   A) **Zero — completely free only.** Every tool must have a free tier.
   B) **Micro (<$20/mo)** — free tools + one or two low-cost upgrades.
   C) **Starter (<$50/mo)** — comfortable with standard SaaS pricing.
   D) **Growth (<$200/mo)** — open to professional tiers where it adds real value.
   E) **Open** — best tool for the job, cost is not the deciding factor.

   *Note: Many excellent free tiers exist. A "Zero" budget still produces production-quality sites.*

8. What pages does the site need beyond the homepage? (About / Product / Pricing / Contact / Blog / etc.)
9. Do you have existing brand assets? (Logo, colors, fonts, photos — yes/no, and which)
10. Is there a launch deadline or specific tech stack you're committed to?

**After interview:** Summarize what you've learned in a short paragraph, confirm with the user,
then proceed to Phase 1.

### BUDGET ROUTING — Apply immediately after Q7 answer

Store budget tier in ledger: `"budget": "zero" | "micro" | "starter" | "growth" | "open"`

**A — ZERO BUDGET routing (every decision downstream uses free-only options):**
```
VIDEO:        Pexels free stock (no generation API needed)
              OR Remotion (renders locally, zero API cost)
IMAGES:       Unsplash free API + attribution
              OR Pexels free API (no attribution needed)
3D/ANIMATION: GSAP free tier (warn: Club needed for commercial use)
              Spline free tier (branding on free plan)
DATABASE:     Supabase free (500MB, 50k MAU)
              OR PocketBase self-hosted (completely free, needs $5/mo server)
AUTH:         Supabase Auth (free, built into free Supabase plan)
HOSTING:      Vercel hobby (free)
              OR Netlify free (100GB bandwidth/mo)
              OR Cloudflare Pages (free, unlimited bandwidth)
EMAIL:        Resend free (3,000 emails/mo, 1 domain)
MONITORING:   Sentry free (5k errors/mo)
CMS:          Sanity free (3 users, 10GB assets)
              OR no CMS — MDX files in repo
TOTAL COST:   $0/mo ← confirm this is achievable for their use case
```

**B — MICRO BUDGET routing (<$20/mo total):**
```
VIDEO:        Google Veo 3 free quota (Google AI Studio)
IMAGES:       Imagen 3 (same free key)
DATABASE:     Supabase free OR Neon free (3GB)
AUTH:         Supabase Auth (free)
HOSTING:      Vercel hobby (free)
EMAIL:        Resend free
EXTRAS:       $5–20 for one upgrade (e.g. remove Spline branding, or PocketBase VPS)
TOTAL COST:   ~$5–20/mo
```

**C — STARTER routing (<$50/mo):**
```
VIDEO:        Google Veo 3 free quota + pay-as-you-go overage
DATABASE:     Supabase Pro ($25/mo) OR Neon Launch ($19/mo)
AUTH:         Supabase Auth (included) OR Clerk free (10k MAU)
HOSTING:      Vercel Pro ($20/mo) for better limits
EMAIL:        Resend free → Pro if needed
TOTAL COST:   ~$25–50/mo
```

**D/E — GROWTH / OPEN:** No restrictions. Recommend best tool per job.

### ZERO BUDGET — Full Production-Ready Stack

Output this exact stack when budget = "zero". Everything listed is free forever
(not trial, not credit card required, not "free for 30 days"):

```
STACK          SERVICE           FREE LIMIT         WHERE TO SIGN UP
────────────────────────────────────────────────────────────────────────
Hosting        Vercel Hobby      Unlimited deploys  vercel.com
               OR Cloudflare Pages Unlimited BW     pages.cloudflare.com
Database       Supabase Free     500MB Postgres      supabase.com
               50k MAU, 1GB storage
Auth           Supabase Auth     50k MAU            (included in Supabase)
Email          Resend Free       3k emails/mo        resend.com
Images         Unsplash API      Unlimited reads     unsplash.com/developers
               Pexels API        Unlimited reads     pexels.com/api
Video          Pexels Video      Unlimited reads     pexels.com/api
               Remotion (local)  Free render         remotion.dev
AI Generation  Google AI Studio  Free daily quota    aistudio.google.com
               (Veo 3 + Imagen 3)
Animation      GSAP Free         Unlimited           gsap.com ⚠ see below
3D             Spline Free       Limited, has branding spline.design
Asset CDN      Cloudinary Free   25GB storage        cloudinary.com
               25GB bandwidth/mo
Monitoring     Sentry Free       5k errors/mo        sentry.io
CMS            Sanity Free       3 users, 10GB       sanity.io
               OR MDX files      Unlimited           (in your repo)
Analytics      Plausible         Self-host           plausible.io (or GA4 free)
               OR GA4            Unlimited           analytics.google.com

⚠ GSAP COMMERCIAL USE: GSAP free tier requires GSAP Club ($99/yr) for
  commercial projects (sites that generate revenue). Always flag this:
  "GSAP is free for personal projects. If this site generates revenue,
   a GSAP Club license ($99/yr) is required. Add this to the budget?"
  If user declines → replace GSAP with Framer Motion (always free) or CSS animations.

TOTAL: $0/mo — every item above has a free tier that works for real production use.
```

---

## PHASE 0: PRD PARSING CHECKLIST

When a PRD file is provided, extract the following. Mark [FOUND] or [MISSING] for each:

- [ ] Product/brand name
- [ ] Product description (what it does)
- [ ] Target audience / user personas
- [ ] Core value propositions (usually listed as features or benefits)
- [ ] Tone of voice guidelines (if any)
- [ ] Brand colors or design tokens (if any)
- [ ] Competitor references (if any)
- [ ] Required pages or sections
- [ ] Technical requirements or constraints
- [ ] Launch timeline

For any [MISSING] items critical to Phase 1, ask targeted follow-up questions before proceeding.

---

## PHASE 0: URL / SITE ANALYSIS

When a URL is provided:

1. Attempt to fetch and analyze the page content, meta tags, and CSS variables
2. Extract: brand name, tagline, primary CTA, dominant colors (from meta or visible UI), font families
3. Identify the industry from content context
4. Note: what works visually, what could be elevated cinematically
5. Present findings as a "Site Audit" before the Brand Brief:
   - Current strengths (what to keep or amplify)
   - Cinematic opportunities (what to transform)
   - Weaknesses to fix (unclear messaging, weak hierarchy, low visual impact)

If the URL is blocked (Cloudflare / bot protection): Ask the user to paste the page text,
or upload a screenshot, and proceed with what's available.

---

## PHASE 1: BRAND BRIEF FORMATTING

Present the Brand Brief in this exact structure:

```
═══════════════════════════════════════════
  BRAND BRIEF — [Brand Name]
═══════════════════════════════════════════

INDUSTRY:        [Detected industry]
AUDIENCE:        [One-sentence description]
TONE:            [Adjective 1] · [Adjective 2] · [Adjective 3]

─── VISUAL IDENTITY ───────────────────────
PRIMARY COLOR:   #XXXXXX — [name, e.g. "Deep Obsidian"]
SECONDARY:       #XXXXXX — [name]
ACCENT:          #XXXXXX — [name]
NEUTRAL:         #XXXXXX — [name]
BACKGROUND:      #XXXXXX — [name]

HEADING FONT:    [Font name] — [Google Fonts link or system alternative]
BODY FONT:       [Font name] — [Google Fonts link or system alternative]
FONT PAIRING NOTE: [One line on why these work together]

─── MESSAGING ─────────────────────────────
HEADLINE:        "[Proposed H1 — under 8 words]"
TAGLINE:         "[Short punchy line — under 12 words]"
HERO LINE:       "[First sentence a visitor reads — 1–2 sentences max]"
PRIMARY CTA:     "[Button label — 2–4 words]"
SECONDARY CTA:   "[Optional secondary action]"

─── THEME DIRECTION ───────────────────────
[One paragraph: the feeling, the world, the experience the site creates.
Written like a creative director's brief — evocative, directional, specific.]

═══════════════════════════════════════════
```

After presenting: "Does this Brand Brief feel right? Confirm or edit any elements before we
generate your 3 cinematic scene concepts."

---

## PHASE 3: ASSET PIPELINE DETAIL

### 3B — Image Prompt Output Format

For each image asset, output a structured prompt block:

```
ASSET: Hero Background
PLATFORM: [Imagen 3 / DALL·E 3 / Flux / Stability]
DIMENSIONS: 2560×1440 (16:9)
PROMPT:
  [Highly detailed cinematic prompt — reference lighting, mood, camera angle,
   color temperature, subject matter, negative space for text overlay, no text in image]
NEGATIVE PROMPT: [text, watermark, people's faces unless intentional, cartoon, CGI plastic]
CLOUDINARY PATH: /{project-slug}/hero/hero-bg.jpg
TRANSFORMATION: f_auto,q_auto,w_2560
```

### 3B — Video Prompt Output Format

```
ASSET: Hero Video Loop
PLATFORM: [Veo 2 / Runway Gen-3 / Kling 1.6]
DURATION: 8–12 seconds (seamless loop)
RESOLUTION: 1080p
PROMPT:
  [Cinematic video prompt — describe motion, camera movement, atmosphere,
   what enters/exits frame, pacing. Reference the Final Scene Brief directly.]
LOOP NOTE: [How to make first and last frame match for seamless loop]
CLOUDINARY PATH: /{project-slug}/video/hero-loop.mp4
TRANSFORMATION: f_auto,vc_auto,q_auto
```

### 3C — Unsplash Fallback Format

```javascript
// Unsplash API placeholder — replace with generated asset when ready
const HERO_IMAGE = `https://api.unsplash.com/photos/random?query=${SEARCH_TERM}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
// Search term used: "[specific cinematic search term matching scene brief]"
// Attribution required: Unsplash license
```

---

## PHASE 5: CODE OUTPUT STANDARDS

### Next.js 15 App Router — Required Files (Always Generate)

Every Next.js 15 project MUST include these files. Generate them before any page code.
Missing any of these causes unhandled crashes visible to users.

```
app/
├── error.tsx              ← Catches runtime errors in routes (client component)
├── global-error.tsx       ← Catches errors in root layout (client component)
├── not-found.tsx          ← Custom 404 page
├── loading.tsx            ← Suspense loading state for each route segment
└── (routes)/
    └── [slug]/
        ├── page.tsx       ← MUST await params (Next.js 15 breaking change)
        └── not-found.tsx  ← Route-level 404
```

**error.tsx — Always generate this:**
```tsx
// app/error.tsx
'use client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Report to Sentry if configured
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error)
    }
    console.error('Route error:', error)
  }, [error])

  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', margin: 0 }}>
        Something went wrong
      </h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '40ch', margin: 0 }}>
        An unexpected error occurred. Our team has been notified.
      </p>
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
    </main>
  )
}
```

**global-error.tsx — Catches root layout failures:**
```tsx
// app/global-error.tsx
'use client'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  // Must include <html> and <body> — root layout is bypassed
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0a0f1e', color: '#fff',
                     fontFamily: 'system-ui, sans-serif',
                     display: 'flex', alignItems: 'center',
                     justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            [BRAND_NAME] is temporarily unavailable
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
            We are working to restore service. Please try again shortly.
          </p>
          <button onClick={reset}
                  style={{ padding: '0.75rem 2rem', background: '[BRAND_ACCENT_HEX]',
                           border: 'none', borderRadius: '6px',
                           cursor: 'pointer', fontSize: '1rem' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
```

**not-found.tsx — On-brand 404:**
```tsx
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {/* Large 404 — uses brand accent */}
      <div style={{
        fontSize: 'clamp(6rem, 20vw, 16rem)',
        fontWeight: 900,
        lineHeight: 1,
        color: 'transparent',
        WebkitTextStroke: '2px var(--color-accent)',
        letterSpacing: '-0.04em',
        userSelect: 'none',
      }}>
        404
      </div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: 0 }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '36ch', margin: 0 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          padding: '0.875rem 2rem',
          background: 'var(--color-accent)',
          color: 'var(--color-bg)',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
        }}
      >
        Back to home
      </Link>
    </main>
  )
}
```

**loading.tsx — Suspense skeleton:**
```tsx
// app/loading.tsx  (also create per-route as needed)
export default function Loading() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Brand-colored spinner — no animation library needed */}
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--color-surface)',
        borderTopColor: 'var(--color-accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
```

**Dynamic route pages — MUST await params in Next.js 15:**
```tsx
// app/blog/[slug]/page.tsx
// WRONG (breaks in Next.js 15):
// export default function Page({ params }: { params: { slug: string } }) {

// CORRECT — params is a Promise in Next.js 15:
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

// generateMetadata also receives awaited params
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  // fetch post data...
  return {
    title: slug,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params  // ← await the Promise

  // if not found:
  // notFound()  ← triggers not-found.tsx

  return <article>...</article>
}
```

---

### Output Order (Always Follow This)
1. `README.md` — Project overview, setup, env vars, Cloudinary config, deploy
2. `.env.example` — All required environment variables
3. Config files — `next.config.ts` / `nuxt.config.ts` / `astro.config.mjs` / `svelte.config.js`
4. `package.json` — With all dependencies listed (use VERSION MANIFEST from stack-configs.md)
5. Global CSS — Variables, typography, resets, animation tokens
6. **App Router required files** — `error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx`
7. Layout/Shell — Nav, page wrapper, footer
8. **Hero Section** — (Most important — full cinematic treatment)
9. Remaining sections in page order
10. Secondary pages (if requested)
11. Asset integration layer — Cloudinary helpers, image/video components

### Code Quality Standards
- All colors via CSS custom properties (`--color-primary`, etc.) — no hardcoded hex in components
- All animation durations via CSS custom properties (`--duration-slow: 0.8s`)
- Cloudinary images via helper function — never raw URL strings in JSX/templates
- Scroll animations initialized only after `DOMContentLoaded` or `onMounted`
- `prefers-reduced-motion` media query wraps all non-essential animations
- Video: `autoplay muted loop playsinline` — always. Poster image fallback required.
- 3D elements: wrapped in feature-detection check, static fallback provided

### GSAP Safety Rules (prevents removeChild + hydration errors)

These rules are NON-NEGOTIABLE in every generated component. Violating any
of these is the primary cause of the `removeChild` and hydration runtime errors.

**Rule 1 — Always scope GSAP to a ref, never to document or global selectors:**
```tsx
// WRONG — selects globally, can grab nodes React doesn't expect
gsap.to('.hero-title', { opacity: 1 })

// CORRECT — scoped to the component's own DOM subtree
const ref = useRef<HTMLDivElement>(null)
const ctx = gsap.context(() => {
  gsap.to('.hero-title', { opacity: 1 }) // only matches inside ref
}, ref)
```

**Rule 2 — Every useEffect with GSAP must return ctx.revert():**
```tsx
// WRONG — no cleanup, causes removeChild on unmount
useEffect(() => {
  gsap.to('.card', { opacity: 1 })
}, [])

// CORRECT — always clean up
useEffect(() => {
  if (!containerRef.current) return
  const ctx = gsap.context(() => {
    gsap.to('.card', { opacity: 1, stagger: 0.1 })
  }, containerRef)
  return () => ctx.revert() // kills all tweens + ScrollTriggers in this context
}, [])
```

**Rule 3 — ScrollTrigger.refresh() after layout settles:**
```tsx
useEffect(() => {
  const timer = setTimeout(() => ScrollTrigger.refresh(), 150)
  return () => clearTimeout(timer)
}, [])
```

**Rule 4 — Never use GSAP outside useEffect / onMounted:**
```tsx
// WRONG — runs on server, node doesn't exist yet
const tl = gsap.timeline()
tl.to('.hero', { opacity: 1 })

// CORRECT — always deferred to client
useEffect(() => {
  const ctx = gsap.context(() => {
    const tl = gsap.timeline()
    tl.to('.hero', { opacity: 1 })
  }, containerRef)
  return () => ctx.revert()
}, [])
```

**Rule 5 — suppressHydrationWarning on every element GSAP touches:**
```tsx
// Any element GSAP will animate needs this attribute
// so React doesn't panic when inline styles appear
<div ref={containerRef} suppressHydrationWarning>
  <h1 className="hero-title" suppressHydrationWarning>
    {headline}
  </h1>
</div>
```

**Rule 6 — Lenis connects to GSAP ticker — never its own requestAnimationFrame:**
```tsx
// WRONG — creates a competing RAF loop that fights GSAP ScrollTrigger
useEffect(() => {
  const lenis = new Lenis({ duration: 1.2 })
  const raf = (time: number) => {
    lenis.raf(time)
    requestAnimationFrame(raf)        // ← never do this with GSAP
  }
  requestAnimationFrame(raf)
  return () => lenis.destroy()
}, [])

// CORRECT — single RAF via GSAP ticker (from lib/animation.ts)
// Never initialise Lenis in a component — import from lib/animation.ts
import { initFullAnimationSystem } from '@/lib/animation'

useEffect(() => {
  const { lenis } = initFullAnimationSystem()
  return () => lenis.destroy()
}, [])
```
Every major section of generated code gets a comment block:
```javascript
/* ═══════════════════════════════════════════
   HERO SECTION — Cinematic Web
   Scene: [concept name from Phase 2]
   Animation: [library used + key technique]
   Assets: [Cloudinary paths used]
   3D: [Spline/Three.js/CSS-only]
   ═══════════════════════════════════════════ */
```

### Pause Points During Code Output
Pause and ask for feedback after:
- Hero section (most important checkpoint)
- Navigation and global styles
- First secondary section
- Final secondary page (if any)
Never output more than ~150 lines of code without pausing.
