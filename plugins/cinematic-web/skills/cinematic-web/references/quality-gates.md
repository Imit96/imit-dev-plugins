# Cinematic Web — Quality Gate Reference

Run this in Phase 6. Output each section as a checklist with PASS / FAIL / NEEDS REVIEW.
Flag everything that needs user action — never silently skip.

---

## SECTION 1 — VISUAL QUALITY

```
[ ] Hero video plays automatically on page load (autoplay, muted, loop, playsinline)
[ ] Hero video has a poster image (shows before video loads — prevents flash)
[ ] Video loops seamlessly (first frame ≈ last frame within ±100ms)
[ ] Scroll animations trigger at correct viewport thresholds (not too early, not too late)
[ ] All text is legible over video/image backgrounds (contrast ratio ≥ 4.5:1)
[ ] Color palette is consistent — no sections using off-brand colors
[ ] Typography hierarchy is correct: H1 > H2 > H3 > Body (sizes, weights)
[ ] CTA button is visually distinct from all other elements on the page
[ ] 3D element renders on load — not laggy, not blocking text
[ ] 3D has a static image fallback for unsupported browsers / reduced motion
[ ] Mobile: Hero section looks intentional on 375px width (not just "scaled down desktop")
[ ] Spacing: No section is cramped — minimum 80px vertical padding on sections
```

**If FAIL on any visual item:** Note what needs fixing and whether it's a code fix or an asset fix.

---

## SECTION 2 — CODE QUALITY

```
[ ] No hardcoded hex colors anywhere in component files (all via CSS custom properties)
[ ] No inline style attributes except animation-related transforms
[ ] All Cloudinary images use the helper function (not raw URL strings)
[ ] All Cloudinary URLs include transformation parameters (f_auto, q_auto minimum)
[ ] All environment variables are in .env.example (none hardcoded)
[ ] GSAP ScrollTrigger is registered before use: ScrollTrigger.register()
[ ] GSAP animations are wrapped in useEffect / onMounted / DOMContentLoaded
[ ] Video component: all four attributes present: autoplay muted loop playsinline
[ ] No console.log statements left in production code
[ ] No TODO comments left unresolved in final output
[ ] TypeScript: no `any` types (if using TS)
[ ] Imports are organized (external → internal → styles)
```

### NEXT.JS 15 COMPATIBILITY CHECK (run before delivery on every Next.js project)

```bash
# Breaking change 1: headers() / cookies() must be awaited
grep -rn "headers()\." app/ lib/ actions/
grep -rn "cookies()\." app/ lib/ actions/
# Any result = crash in production. Fix: const h = await headers(); h.get(...)

# Breaking change 2: params must be awaited in page/layout/route handlers
grep -rn "params\." app/ | grep -v "await\|Promise"
# Any page using params.slug without await = runtime error in Next.js 15

# Breaking change 3: fetch without explicit cache config
grep -rn "fetch(" app/ lib/ | grep -v "cache:\|revalidate:\|no-store\|force-cache"
# Silent: data may not cache as expected. Always be explicit in Next.js 15.

# App Router required files check
test -f app/error.tsx         && echo "OK error.tsx"         || echo "MISSING app/error.tsx"
test -f app/global-error.tsx  && echo "OK global-error.tsx"  || echo "MISSING app/global-error.tsx"
test -f app/not-found.tsx     && echo "OK not-found.tsx"     || echo "MISSING app/not-found.tsx"
test -f app/loading.tsx       && echo "OK loading.tsx"       || echo "MISSING app/loading.tsx"

# useFormState removed in React 19
grep -rn "useFormState" src/ app/ components/
# Must be: useActionState from 'react'

# Config file name
test -f next.config.js && echo "WARN: rename next.config.js to next.config.ts"
```

**Checklist:**
```
[ ] No synchronous headers() or cookies() — must be awaited
[ ] All dynamic params typed as Promise<{...}> and awaited
[ ] All fetch() calls have explicit cache / revalidate config
[ ] app/error.tsx exists with 'use client' directive
[ ] app/global-error.tsx exists with <html><body> tags
[ ] app/not-found.tsx on-brand, links back to home
[ ] app/loading.tsx exists for major routes
[ ] useActionState used (not useFormState from react-dom)
[ ] next.config.ts (not next.config.js)
```

---

### HYDRATION ERROR PREVENTION (Next.js — check every component)

Hydration errors are the most common production failure in cinematic Next.js sites.
Run this check before delivery on every Next.js project:

```bash
# Find the most common hydration causes:
grep -rn "style={{}}"           src/ app/ components/   # empty style objects
grep -rn "typeof window"        src/ app/ components/   # SSR/client branch
grep -rn "Date.now()"           src/ app/ components/   # random per-render
grep -rn "Math.random()"        src/ app/ components/   # random per-render
grep -rn "new Date()"           src/ app/ components/   # locale mismatch risk
grep -rn "localStorage"         src/ app/ components/   # client-only API
grep -rn "window\."             src/ app/ components/   # client-only API
```

**Fix patterns — apply to every flagged instance:**

```tsx
// ── Empty style object (most common cause) ────────────────────
// BAD:
<div style={{}}>

// GOOD — remove it entirely if empty, or add suppressHydrationWarning:
<div>
// OR if GSAP will mutate it:
<div suppressHydrationWarning>

// ── Browser-only APIs (typeof window, localStorage, window.*) ─
// BAD:
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// GOOD — use useEffect for client-only values:
const [isMobile, setIsMobile] = useState(false);
useEffect(() => {
  setIsMobile(window.innerWidth < 768);
}, []);

// ── GSAP animations touching DOM styles ───────────────────────
// BAD — GSAP sets inline styles that SSR didn't render:
gsap.set('.hero', { opacity: 0 }); // at module level

// GOOD — always inside useEffect:
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.set('.hero', { opacity: 0 });
    gsap.to('.hero', { opacity: 1, duration: 1 });
  });
  return () => ctx.revert(); // cleanup on unmount
}, []);

// ── Date formatting (locale mismatch between server and client) ─
// BAD:
<span>{new Date().toLocaleDateString()}</span>

// GOOD:
<time suppressHydrationWarning dateTime={iso}>
  {new Date(iso).toLocaleDateString()}
</time>

// ── Root layout — always include on html and body ──────────────
<html lang="en" suppressHydrationWarning>
  <body suppressHydrationWarning className="grain">
```

**After fixing — confirm clean build:**
```bash
npm run build
# Must show: ✓ Compiled successfully
# Must show: 0 errors
# No "Warning: Prop `style` did not match" in output

# Then check runtime:
npm run start
# Open browser console — must be 0 hydration errors
```

**Next.js version check:**
```bash
# Check if Next.js is outdated (run quarterly)
npm outdated next

# If outdated, update:
npm install next@latest react@latest react-dom@latest
npm run build  # confirm no breaking changes
```

---

### REMOVECHILD / DOM MUTATION ERROR PREVENTION

This error — `NotFoundError: Failed to execute 'removeChild' on 'Node'` —
means something moved or deleted a DOM node that React was still tracking.
Run this checklist on every Next.js project before delivery:

```bash
# Find GSAP used outside useEffect (server-side execution = crash)
grep -rn "gsap\." src/ app/ components/ | grep -v "useEffect\|onMounted\|import\|//\|ctx\." | head -20

# Find GSAP without cleanup (missing ctx.revert = removeChild on unmount)
grep -rn "gsap.context" src/ app/ components/
# Every occurrence above must have a matching: return () => ctx.revert()

# Find global GSAP selectors (not scoped to a ref)
grep -rn "gsap.context(() =>" src/ app/ components/ | grep -v ", ref\|, container\|, section"
# Every gsap.context call must have a second argument (the scope ref)

# Find ScrollTrigger without refresh
grep -rn "ScrollTrigger" src/ app/ components/ | grep -v "refresh\|register\|import"
# Must have at least one ScrollTrigger.refresh() call after mount
```

**Fix template — apply to every animated component:**
```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function AnimatedSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return              // guard: DOM must exist

    const ctx = gsap.context(() => {      // create scoped context
      gsap.from('.animated-item', {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
        }
      })
    }, ref)                               // scope to THIS component only

    return () => ctx.revert()            // cleanup: prevents removeChild
  }, [])

  return (
    <section ref={ref} suppressHydrationWarning>
      {children}
    </section>
  )
}
```

**Checklist:**
```
[ ] Every gsap.context() has a ref as second argument (scoped)
[ ] Every useEffect with GSAP returns () => ctx.revert()
[ ] No GSAP calls outside useEffect / onMounted
[ ] suppressHydrationWarning on container ref element
[ ] suppressHydrationWarning on elements GSAP directly animates
[ ] ScrollTrigger.refresh() called 100–150ms after mount
[ ] Lenis: lenis.destroy() in useEffect cleanup
[ ] Three.js / Spline: renderer.dispose() in useEffect cleanup
[ ] No gsap.killTweensOf('*') — use ctx.revert() instead
```

```
[ ] Hero video file size: under 5MB for the loop (recommend WebM + MP4 fallback)
[ ] Hero video: WebM format served to Chrome/Firefox, MP4 to Safari
    → Use Cloudinary: f_auto,vc_auto handles this automatically
[ ] All images below the fold: loading="lazy" attribute set
[ ] Hero image: loading="eager" or preloaded in <head>
[ ] Google Fonts: using next/font or equivalent — no render-blocking font requests
[ ] font-display: swap set on all custom fonts
[ ] 3D (Spline/Three.js): loaded dynamically (lazy import) — not in main bundle
[ ] GSAP: imported only what's used (not the entire GSAP package if using modules)
[ ] No layout shift on page load (video/image dimensions defined before load)
[ ] prefers-reduced-motion: ALL animations respect this media query
```

**Performance budget targets:**
- Largest Contentful Paint (LCP): < 2.5 seconds
- Cumulative Layout Shift (CLS): < 0.1
- Total Blocking Time (TBT): < 300ms
- Hero video: < 5MB, ideally < 3MB

---

## SECTION 4 — ACCESSIBILITY

```
[ ] Hero video: no autoplay audio (muted is set)
[ ] Hero video: pause control available (user can stop it)
[ ] All images have meaningful alt text (not empty, not "image")
[ ] All interactive elements reachable via keyboard (Tab order logical)
[ ] Focus styles visible (not outline: none without replacement)
[ ] Color contrast: text on brand colors meets WCAG AA (≥ 4.5:1)
[ ] Heading hierarchy: page has exactly one H1
[ ] Skip to main content link available (for screen readers)
[ ] Animated elements: prefers-reduced-motion respected
[ ] 3D element: described via aria-label if interactive
```

---

## SECTION 4B — DESIGN PARADIGM, ANIMATION & ANTI-GENERIC VERIFICATION

### Paradigm Consistency
```
[ ] CSS custom properties match the confirmed paradigm system
    (e.g. Glassmorphism: --glass-bg, --glass-blur, --glass-border present and used)
[ ] No paradigm "leakage" — wrong-paradigm components haven't crept in
    (e.g. Brutalism site should have zero border-radius anywhere)
[ ] Hybrid blend is consistent — Primary paradigm dominates as designed
[ ] Component DNA matches paradigm: buttons, cards, inputs all follow paradigm rules
[ ] Neumorphism (if used): WCAG contrast check run — flagged if failing
```

### ⚠️ ANIMATION IMPLEMENTATION VERIFICATION — Run against LEDGER.json

This is the most important quality check. Read LEDGER.json first.

```
STEP 1 — Verify locked behavior was implemented:
  [ ] Read ledger: decisions.animations.hero = [behavior name]
  [ ] Search generated code for that behavior's key function or class name
      CHAPTER_SNAP     → search for: Observer, snap, gsap.to section
      MULTI_STATE_HERO → search for: heroStates, transitionTo, state cycling
      FLOATING_3D_ANCHOR → search for: THREE.Scene, fixed canvas, section scroll
      FRAME_SCROLL     → search for: frames array, scrub, currentFrame
      PARALLAX_DEPTH   → search for: multiple layers, different y values
  [ ] If not found: FAIL — the locked behavior was never implemented.
      Do not mark this as passing. Implement the behavior before delivery.

STEP 2 — Verify Lenis + ScrollTrigger are both active:
  [ ] lib/animation.ts exists and initialises Lenis
  [ ] Lenis uses gsap.ticker (not requestAnimationFrame directly)
  [ ] At least 3 elements use ScrollTrigger in the codebase
  [ ] GSAP is imported and plugins registered in animation.ts

STEP 3 — Verify no forbidden generic patterns exist:
  [ ] Search for: transition: opacity — if the hero uses this as its
      primary animation, FAIL. Opacity-only hero = generic output.
  [ ] Search for: whileInView={{ opacity: 1 }} — if this appears more
      than twice, animation plan is not implemented. FAIL.
  [ ] Search for: animation: fadeIn — CSS keyframe fadeIn on hero = FAIL.
  [ ] Verify hero component file is > 80 lines — a real cinematic hero
      with GSAP ScrollTrigger cannot be written in fewer lines. If < 80,
      the implementation is likely too simple.

STEP 4 — Verify section variety:
  [ ] No two adjacent sections use the same animation class
  [ ] Intensity 3-4 projects: at least one wild pattern (oversized type,
      split color, diagonal break, or full-bleed type) is present
  [ ] Every section has a distinct visual identity (not just different text)

STEP 5 — Verify typography is animated:
  [ ] Hero headline: uses a named behavior (not just fade-up)
      Acceptable: TEXT_MASK_REVEAL, BLUR_FOCUS_TEXT, WORD_STREAM, SCRAMBLE_REVEAL,
      STAGGER_LINES, TYPEWRITER_REVEAL, COUNTER_CINEMA, or VARIABLE_FONT_ANIMATE
      Not acceptable: simple opacity + translateY as the only reveal
  [ ] At least one section body text has a stagger or reveal animation
```

### Anti-Generic Final Check
```
After all the above — answer these questions:
  Q: If a designer saw this site, would they say "that's impressive"?
     If the honest answer is NO → it needs more work before delivery.

  Q: Does this site have at least ONE moment that makes the user stop scrolling?
     If the honest answer is NO → add one. The CLIMAX section should do this.

  Q: Is there anything on this page that couldn't be built by a
     standard web developer in an afternoon using Bootstrap?
     If the honest answer is NO → the cinematic layer is missing.
```

### Technical Animation Checks
```
[ ] Motion token CSS variables defined: --dur-fast, --dur-mid, --dur-slow,
    --ease-cinematic, --ease-spring, --ease-entry
[ ] No hardcoded durations in component files — all use motion tokens
[ ] prefers-reduced-motion disables ALL non-essential animations
[ ] GSAP ScrollTrigger.refresh() called after any dynamic content loads
[ ] Custom cursor disabled on touch devices (hover:hover media query guard)
[ ] 3D Card Hover disabled on touch devices
[ ] Particle/WebGL: performance guard in place (reduce or disable on mobile)
[ ] Page transitions: no scroll position jump or layout flash
```

---

## SECTION 5 — LICENSING & LEGAL

```
[ ] GSAP: Is this a commercial project?
    → If YES and using free GSAP: WARN USER — Club license ($99/yr) required
    → If using only ScrollTrigger/basic plugins: free tier OK for commercial
[ ] Cloudinary: Estimated asset size within 25GB free tier?
    → Calculate: (num_images × avg_size) + (num_videos × avg_size)
    → Flag if over 20GB (approaching limit)
[ ] AI-generated images: User informed of commercial use terms?
    → DALL·E 3: Commercial use allowed (OpenAI Terms)
    → Midjourney: Commercial use requires paid plan
    → Stable Diffusion: Permissive license, check model card
    → Imagen 3 / Veo 2: Google AI Terms — commercial use allowed
[ ] Unsplash images: Attribution present if required?
    → Unsplash license: Attribution not required, but recommended
[ ] Pexels video: No attribution required — OK for commercial
[ ] Spline: Free tier shows Spline branding — OK for dev, not for client delivery
    → WARN if free tier detected on client project
[ ] Third-party fonts: License confirmed for web use?
    → Google Fonts: Always free for web use
    → Custom fonts: User must confirm license
```

---

## SECTION 5B — FORMS & SECURITY

```
FORMS
[ ] Honeypot field present in every form (aria-hidden, tabIndex=-1)
[ ] Time-based spam check implemented (_t hidden field)
[ ] Rate limiting active (Upstash Redis) — not just honeypot
[ ] Zod validation on server side — client validation is UX, server is security
[ ] Error messages specific: "Invalid email" not "Error occurred"
[ ] Success state accessible: role="status" or role="alert" focused on submit
[ ] Form resets after successful submission
[ ] Required fields marked with aria-required="true" + visible indicator
[ ] No sensitive data in URL params (form action uses POST not GET)
[ ] Email delivery tested end-to-end with a real submission

SECURITY
[ ] CSP headers present (X-Frame-Options, X-Content-Type-Options minimum)
[ ] No API keys in client-side code or NEXT_PUBLIC_ vars (except safe ones)
[ ] No API keys committed to git: run: git log -p | grep -i "api_key\|secret"
[ ] DOMPurify sanitizing any CMS rich text rendered as HTML
[ ] API routes return 429 on rate limit (not silent failure)
[ ] Input max lengths enforced server-side (not just client-side maxLength attr)
[ ] .env files in .gitignore — verify: git ls-files | grep ".env"
[ ] node_modules not committed — verify: git ls-files | grep "node_modules"
[ ] npm audit run: npm audit --audit-level=high (0 high/critical vulns)
```

## SECTION 5C — DARK MODE (if enabled)

```
[ ] :root defines all --color-* tokens for light mode
[ ] [data-theme="dark"] or .dark overrides all tokens for dark mode
[ ] prefers-color-scheme detected and applied on first load (before hydration flash)
[ ] Manual toggle stores preference in localStorage
[ ] No hardcoded colors in components (all use CSS vars)
[ ] Glassmorphism: dark variant uses darker glass-bg value
[ ] Neumorphism dark: contrast check passed (or feature disabled for dark mode)
[ ] Images: Cloudinary dark-mode variants or e_brightness:-20 applied if needed
[ ] Dark/light mode tested in both system preference AND manual toggle
[ ] Meta theme-color updated when mode switches
[ ] OG image readable in both modes
```

## SECTION 5D — COOKIE CONSENT & ANALYTICS (if analytics keys present)

```
[ ] Cookie banner appears on first visit (no analytics fire before consent)
[ ] Banner dismissed = preference stored (does not reappear on reload)
[ ] GA4 script NOT loaded until analytics consent granted
[ ] Hotjar NOT loaded until analytics consent granted
[ ] "Accept all" grants all categories
[ ] "Reject all" or "Necessary only" denies non-essential
[ ] Consent can be withdrawn (settings accessible after banner dismissed)
[ ] Consent includes version — bump version string when policy changes
[ ] RESEND_AUDIENCE_ID not used without email consent
[ ] Test: open in incognito → banner shows → accept → GA4 fires → reload → no banner
[ ] Test: open in incognito → banner shows → reject → GA4 does NOT fire
```

## SECTION 5E — ERROR HANDLING

```
[ ] ErrorBoundary wraps: Hero, 3D element, video player, contact form
[ ] Hero video: fallback poster image shows on video load failure
[ ] 3D element: static image fallback shows on WebGL crash
[ ] Cloudinary image: next/image has a valid fallback src or onError handler
[ ] Form: server error shows user-friendly message (not "Internal Server Error")
[ ] CMS API timeout: page renders with placeholder content, not blank
[ ] Sentry initialized (if configured) — test with Sentry.captureException()
[ ] No unhandled promise rejections in browser console on any page
[ ] Error boundaries tested: temporarily throw error in component, confirm fallback renders
[ ] 404 page exists and is on-brand (not default framework 404)
[ ] 500 page exists for unexpected server errors
```

## SECTION 5F — CACHING & PERFORMANCE

```
ISR / SSR
[ ] Revalidate times set per page type (not all using same value)
[ ] On-demand revalidation webhook configured for CMS (fire on publish)
[ ] Homepage: revalidate ≤ 3600s
[ ] Blog listing: revalidate ≤ 300s

ASSETS
[ ] Cloudinary images: f_auto,q_auto minimum on all images
[ ] Hero image: eager loading (not lazy)
[ ] All below-fold images: loading="lazy"
[ ] Fonts: font-display: swap on all custom fonts
[ ] Video: preload="metadata" (not "auto" — saves bandwidth)
[ ] JS chunks: dynamic imports for 3D, heavy components

BROWSER CACHE
[ ] Static assets served with Cache-Control: max-age=31536000, immutable
[ ] API responses that change rarely: stale-while-revalidate headers
[ ] No Cache-Control: no-cache on static files (big perf hit)

METRICS
[ ] Lighthouse run: performance ≥ 80, accessibility ≥ 90
[ ] Bundle analyzer run: no unexpectedly large chunks
[ ] Hero video: < 5MB (check with: ls -lh public/videos/)
```

---

## SECTION 6 — DELIVERY CHECKLIST

Before calling the project complete, confirm:

```
[ ] README.md is complete with:
    - Project overview
    - Prerequisites (Node version, etc.)
    - Environment variable setup instructions
    - Cloudinary account setup steps
    - API key acquisition links (with cost notes)
    - Local dev setup: npm install && npm run dev
    - Deploy instructions for chosen platform
[ ] .env.example has every variable used in the project
[ ] All Cloudinary upload paths documented (user knows where to upload assets)
[ ] Asset generation prompts saved in /prompts/ folder for user to re-run later
[ ] Any unresolved NEEDS REVIEW items clearly listed for user
[ ] Next steps document: what the user should do immediately after receiving the code
```

---

## FINAL SUMMARY OUTPUT FORMAT

After running the quality gate, output:

```
═══════════════════════════════════════════
  DELIVERY SUMMARY — [Project Name]
═══════════════════════════════════════════

WHAT WAS BUILT:
  [Brief paragraph — framework, pages, key features, APIs integrated]

VISUAL CONCEPT:
  [One sentence naming the scene concept used]

PASSES: [N] items
WARNINGS: [N] items (listed below)
NEEDS HUMAN ACTION: [N] items (listed below)

─── WARNINGS ──────────────────────────────
[List each warning with recommended action]

─── NEEDS HUMAN ACTION ────────────────────
[List each item the user must do manually, with clear instructions]

─── IMMEDIATE NEXT STEPS ──────────────────
1. Copy .env.example to .env.local and fill in your API keys
2. Upload assets to Cloudinary at the paths specified in README
3. Run: npm install && npm run dev
4. [Any project-specific steps]

─── OPTIONAL ENHANCEMENTS ─────────────────
[2–3 ideas for what could make this even better — with effort estimates]
═══════════════════════════════════════════
```
