# Cinematic Web — Mobile Layer

## TABLE OF CONTENTS
1. [Mobile-First Philosophy](#philosophy)
2. [iOS Safari — Known Issues and Fixes](#ios)
3. [Touch Patterns for Scroll Animation](#touch)
4. [Responsive Cinematic Layouts](#layouts)
5. [Performance on Mobile](#performance)
6. [Mobile Testing Checklist](#checklist)

---

## MOBILE-FIRST PHILOSOPHY {#philosophy}

Cinematic sites are designed for desktop first — the animations, the scale,
the depth. This is intentional. But every cinematic site must also work well
on mobile, even if the experience is simplified.

**The rule: mobile gets the content, desktop gets the cinema.**

```
DESKTOP:  Full GSAP animations, WebGL, parallax, horizontal scroll, chapter snap
MOBILE:   CSS transitions only, no WebGL, simplified scroll, vertical layout
```

Apply this progressively — start with the mobile version, enhance for desktop:

```css
/* Mobile base (default) */
.hero-canvas { display: none; }          /* WebGL off */
.scroll-scrub { display: none; }         /* Frame scrub off */

/* Desktop enhancement */
@media (hover: hover) and (min-width: 768px) {
  .hero-canvas { display: block; }
  .scroll-scrub { display: block; }
}
```

Use `(hover: hover)` not just `(min-width)` — tablets at wide widths are still touch devices.

---

## iOS SAFARI — KNOWN ISSUES AND FIXES {#ios}

### Issue 1 — The Address Bar Resize Problem (most common)

iOS Safari's address bar shows and hides as the user scrolls, changing
the viewport height. This causes:
- ScrollTrigger to miscalculate scroll positions
- `100vh` elements to jump when the bar hides/shows
- Pinned sections to snap to wrong positions

**Fix — never use `100vh` directly:**
```css
/* WRONG — jumps when iOS address bar shows/hides */
.hero {
  height: 100vh;
}

/* CORRECT — use dvh (dynamic viewport height) with vh fallback */
.hero {
  height: 100vh;           /* fallback for old browsers */
  height: 100dvh;          /* dynamic viewport height — iOS 15.4+ */
}

/* CORRECT — CSS variable approach (for JS animation targets) */
:root {
  --vh: 1vh;               /* updated by JS on resize */
}
.hero {
  height: calc(var(--vh, 1vh) * 100);
}
```

```typescript
// Set --vh CSS variable, update on resize
function setViewportHeight() {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

// Call on mount and on resize (debounced)
if (typeof window !== 'undefined') {
  setViewportHeight()
  let resizeTimer: ReturnType<typeof setTimeout>
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      setViewportHeight()
      // Refresh ScrollTrigger after resize
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh()
      }
    }, 150)
  })
}
```

### Issue 2 — ScrollTrigger Position Errors After Orientation Change

When user rotates device, ScrollTrigger positions are calculated from
the old viewport size.

**Fix:**
```typescript
// In your ScrollProvider or animation setup
window.addEventListener('orientationchange', () => {
  // Wait for browser to finish repainting after orientation change
  setTimeout(() => {
    ScrollTrigger.refresh(true)   // true = recalculate all positions
    lenis?.scrollTo(0, { immediate: true })  // scroll to top to reset
  }, 300)
})
```

### Issue 3 — Momentum Scrolling Fights Lenis

iOS has its own momentum scroll (inertia). When Lenis is active, these
two scroll systems can conflict causing stuttering or double-scroll.

**Fix — let Lenis handle mobile too, but with iOS-safe config:**
```typescript
const lenis = new Lenis({
  duration:        1.0,           // shorter on mobile (less inertia)
  easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel:     true,
  touchMultiplier: 2,             // increase touch sensitivity
  infinite:        false,
  // iOS-specific
  syncTouch:       true,          // sync Lenis to native iOS touch events
  syncTouchLerp:   0.075,         // lower = closer to native feel
})
```

### Issue 4 — backdrop-filter GPU Crash on iOS

Heavy `backdrop-filter: blur()` (glassmorphism) can cause iOS Safari
to crash or slow to a crawl, especially on older devices.

**Fix — limit blur on mobile:**
```css
.glass-card {
  backdrop-filter:         blur(20px);  /* desktop */
  -webkit-backdrop-filter: blur(20px);
}

@media (max-width: 768px) {
  .glass-card {
    backdrop-filter:         blur(8px);   /* reduced on mobile */
    -webkit-backdrop-filter: blur(8px);
    /* Consider removing blur entirely on very old devices */
  }
}

/* Use @supports to degrade gracefully */
@supports not (backdrop-filter: blur(1px)) {
  .glass-card {
    background: rgba(0, 0, 0, 0.85);  /* opaque fallback */
  }
}
```

### Issue 5 — Pinned Sections Break on iOS

GSAP `pin: true` can behave incorrectly on iOS when the address bar
changes height mid-pin, or when the user scrolls past a pinned element.

**Fix:**
```typescript
ScrollTrigger.create({
  trigger:       containerEl,
  pin:           true,
  anticipatePin: 1,              // ALWAYS add this with pin: true
  pinSpacing:    true,
  invalidateOnRefresh: true,     // recalculate on refresh
})
```

**If pinning still breaks on iOS — use position: sticky instead:**
```tsx
// For hero sections — position: sticky is more reliable on iOS than GSAP pin
<section style={{ height: '300vh', position: 'relative' }}>
  <div style={{
    position: 'sticky',
    top: 0,
    height: '100dvh',    // not 100vh
    overflow: 'hidden',
  }}>
    {/* Content that stays pinned */}
  </div>
</section>
```

### Issue 6 — Video Autoplay Blocked

iOS blocks autoplay for videos with audio. Since all cinematic videos
are muted loops, this should be fine — but the attributes must be exact.

```tsx
// REQUIRED — all four attributes, in this order
<video
  autoPlay      // must be camelCase in JSX
  muted         // REQUIRED for autoplay on iOS
  loop
  playsInline   // REQUIRED — prevents iOS from going fullscreen
  poster="/hero-poster.jpg"
  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
>
  <source src={videoUrl} type="video/mp4" />
</video>
```

### Issue 7 — `position: fixed` Inside Transforms

Any `position: fixed` element inside a transformed parent breaks on iOS
— it renders relative to the transformed ancestor, not the viewport.

**Fix — never put fixed elements inside GSAP-transformed containers:**
```tsx
// WRONG — CookieConsent banner inside the GSAP-animated page wrapper
<div ref={pageRef}>        {/* GSAP transforms this */}
  <CookieConsent />        {/* position: fixed — BROKEN on iOS */}
</div>

// CORRECT — fixed elements are siblings of animated containers
<div ref={pageRef}>        {/* GSAP transforms this */}
  <Hero />
  <Features />
</div>
<CookieConsent />          {/* outside the transformed container */}
```

---

## TOUCH PATTERNS FOR SCROLL ANIMATION {#touch}

### What to keep on mobile, what to remove

```
KEEP ON MOBILE:
  ✓ CSS transitions on scroll (IntersectionObserver triggers)
  ✓ Simple fade/slide reveals (opacity + transform, CSS only)
  ✓ Video loops (autoplay muted loop playsInline)
  ✓ Parallax at reduced speed (1–2 layers max, not 4–5)
  ✓ Sticky headers and footers
  ✓ Horizontal card scrolling (native overflow: auto, not GSAP)

REMOVE ON MOBILE (check isMobile or use media queries):
  ✗ WebGL scenes (too heavy — use CSS gradient fallback)
  ✗ GSAP scroll scrub (laggy on touch)
  ✗ Chapter snap with Observer (swipe navigation is fine, but snap is jarring)
  ✗ Horizontal story scroll driven by vertical scroll (confusing on touch)
  ✗ Cursor trail / cursor effects (touch devices have no cursor)
  ✗ Magnetic hover effects (no hover on touch)
  ✗ Heavy particle fields (GPU cost)
```

### Mobile-safe animation wrapper

```typescript
// lib/animation-mobile.ts
// Use this instead of direct GSAP calls for scroll animations

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return true  // SSR-safe default
  return !window.matchMedia('(hover: hover) and (min-width: 768px)').matches
}

export const isReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function mobileAwareAnimate(
  target: gsap.TweenTarget,
  desktopVars: gsap.TweenVars,
  mobileVars?: gsap.TweenVars
) {
  if (isReducedMotion()) {
    gsap.set(target, { opacity: 1, x: 0, y: 0, scale: 1 })
    return
  }
  if (isMobile() && mobileVars) {
    return gsap.to(target, mobileVars)
  }
  return gsap.to(target, desktopVars)
}
```

### Swipe-based navigation (mobile replacement for chapter snap)

```typescript
// Mobile swipe navigation — replaces GSAP Observer chapter snap
export function initMobileSwipe(options: {
  onSwipeUp:   () => void
  onSwipeDown: () => void
  threshold?:  number   // minimum px to trigger (default: 50)
}) {
  const { onSwipeUp, onSwipeDown, threshold = 50 } = options
  let startY = 0
  let isDragging = false

  const onTouchStart = (e: TouchEvent) => {
    startY     = e.touches[0].clientY
    isDragging = true
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (!isDragging) return
    isDragging = false

    const deltaY = startY - e.changedTouches[0].clientY

    if (Math.abs(deltaY) < threshold) return

    if (deltaY > 0) onSwipeUp()
    else onSwipeDown()
  }

  document.addEventListener('touchstart', onTouchStart, { passive: true })
  document.addEventListener('touchend',   onTouchEnd,   { passive: true })

  return () => {
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchend',   onTouchEnd)
  }
}
```

### IntersectionObserver reveals (CSS-only, mobile-safe)

```typescript
// lib/scroll-reveal.ts
// Use this instead of GSAP ScrollTrigger for simple fade-in reveals on mobile

export function initScrollReveals(selector = '[data-reveal]') {
  const elements = document.querySelectorAll<HTMLElement>(selector)
  if (!elements.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-revealed', 'true')
          observer.unobserve(entry.target)   // stop watching once revealed
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  )

  elements.forEach(el => observer.observe(el))

  return () => observer.disconnect()
}
```

```css
/* In globals.css — pairs with initScrollReveals */
[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

[data-reveal='fade-left']  { transform: translateX(-24px); }
[data-reveal='fade-right'] { transform: translateX(24px); }
[data-reveal='scale']      { transform: scale(0.95); }

[data-revealed='true'] {
  opacity:   1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity:    1;
    transform:  none;
    transition: none;
  }
}
```

---

## RESPONSIVE CINEMATIC LAYOUTS {#layouts}

### Hero — mobile adaptation

```css
/* Desktop: full viewport height with video background */
.hero {
  height: 100dvh;
  position: relative;
  overflow: hidden;
}

/* Mobile: image poster instead of video, reduced height */
@media (max-width: 767px) {
  .hero {
    height: 80dvh;           /* shorter on mobile */
    min-height: 500px;       /* never too short */
  }

  .hero-video {
    display: none;           /* hide video on mobile (poster shows) */
  }

  .hero-canvas {
    display: none;           /* hide WebGL on mobile */
  }

  .hero-headline {
    font-size: clamp(2.5rem, 12vw, 5rem);  /* scale down */
    text-align: center;
  }

  .hero-cta-group {
    flex-direction: column;  /* stack buttons vertically */
    align-items: center;
  }
}
```

### Typography scale — mobile-safe clamp values

```css
:root {
  /* Cinematic scale — always use clamp, never fixed px on headlines */
  --type-display: clamp(3rem,    8vw,  8rem);   /* hero H1 */
  --type-h1:      clamp(2.25rem, 5vw,  5rem);
  --type-h2:      clamp(1.75rem, 4vw,  3.5rem);
  --type-h3:      clamp(1.25rem, 2.5vw, 2rem);
  --type-body:    clamp(1rem,    1.1vw, 1.125rem);
  --type-small:   clamp(0.875rem, 0.9vw, 1rem);

  /* Spacing — mobile gets tighter padding */
  --section-py:   clamp(3rem, 8vw, 8rem);
  --container-px: clamp(1.25rem, 5vw, 2rem);
}
```

### Navigation — mobile hamburger pattern

```tsx
// components/layout/Nav.tsx
'use client'
import { useState, useEffect } from 'react'

export function Nav() {
  const [menuOpen, setMenuOpen]     = useState(false)
  const [scrolled, setScrolled]     = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [])

  return (
    <nav
      style={{
        position:   'fixed',
        top:        0,
        left:       0,
        right:      0,
        zIndex:     100,
        padding:    '1rem var(--container-px)',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(0,0,0,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.3s ease',
      }}
      suppressHydrationWarning
    >
      {/* Logo */}
      <a href="/" style={{ fontWeight: 700, fontSize: '1.25rem', textDecoration: 'none',
                            color: 'var(--color-text)' }}>
        [BRAND_NAME]
      </a>

      {/* Desktop links */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}
           className="nav-desktop">
        <a href="/work">Work</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="nav-hamburger"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        style={{ background: 'none', border: 'none', cursor: 'pointer',
                 color: 'var(--color-text)', padding: '0.5rem' }}
      >
        <div style={{ width: '24px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ display: 'block', height: '2px', background: 'currentColor',
                         transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                         transition: 'transform 0.2s ease' }} />
          <span style={{ display: 'block', height: '2px', background: 'currentColor',
                         opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s ease' }} />
          <span style={{ display: 'block', height: '2px', background: 'currentColor',
                         transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                         transition: 'transform 0.2s ease' }} />
        </div>
      </button>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div style={{
          position:   'fixed',
          inset:      0,
          background: 'var(--color-bg)',
          display:    'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap:        '2.5rem',
          zIndex:     99,
        }}>
          {['Work', 'About', 'Services', 'Contact'].map(item => (
            <a key={item} href={`/${item.toLowerCase()}`}
               onClick={() => setMenuOpen(false)}
               style={{ fontSize: '2rem', fontWeight: 700, textDecoration: 'none',
                        color: 'var(--color-text)' }}>
              {item}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
```

```css
/* Nav responsive CSS */
.nav-hamburger { display: none; }
.nav-desktop   { display: flex; }

@media (max-width: 767px) {
  .nav-hamburger { display: block; }
  .nav-desktop   { display: none; }
}
```

---

## PERFORMANCE ON MOBILE {#performance}

### Budget per mobile page load

```
MOBILE PERFORMANCE BUDGET (aim for LCP < 2.5s on 4G):

JavaScript (gzipped):     < 200KB total
  GSAP (core):            ~30KB
  Lenis:                  ~8KB
  Framer Motion:          ~45KB (consider if both GSAP + Framer loaded)
  Three.js (if needed):   ~160KB ← skip on mobile

CSS (gzipped):            < 30KB
Images (hero poster):     < 200KB WebP
Video (poster frame):     < 50KB WebP (used while video loads)
Web fonts:                < 100KB total (2 fonts max, subset to latin)

TOTAL PAGE WEIGHT TARGET: < 500KB initial load on mobile
```

### Font loading — mobile-safe strategy

```typescript
// app/fonts.ts — subset fonts for mobile
import { Inter, Playfair_Display } from 'next/font/google'

export const heading = Playfair_Display({
  subsets:  ['latin'],          // latin only — cuts file 60%
  weight:   ['400', '700'],     // only weights you use
  display:  'swap',             // show system font while loading
  variable: '--font-heading',
  preload:  true,
})

export const body = Inter({
  subsets:  ['latin'],
  weight:   ['400', '500', '600'],
  display:  'swap',
  variable: '--font-body',
  preload:  true,
})
```

### Conditional Three.js / WebGL loading

```typescript
// Never ship Three.js to mobile — it's 160KB that does nothing
// Use dynamic import with a mobile check

'use client'
import { useEffect, useRef } from 'react'

export function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Skip WebGL entirely on mobile
    const isTouch = !window.matchMedia('(hover: hover)').matches
    if (isTouch || window.innerWidth < 768) return

    // Check WebGL support
    const testCanvas = document.createElement('canvas')
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl')
    if (!gl) return

    // Dynamically import Three.js — mobile never downloads it
    import('@/lib/webglScrollScene').then(({ createWebGLScrollScene }) => {
      if (!containerRef.current) return
      const { destroy } = createWebGLScrollScene({ container: containerRef.current })
      return destroy
    })
  }, [])

  return <div ref={containerRef} suppressHydrationWarning style={{
    position: 'sticky', top: 0, width: '100vw', height: '100dvh'
  }} />
}
```

---

## MOBILE TESTING CHECKLIST {#checklist}

Run on every project before delivery. Test on real devices, not just DevTools.

### Device targets (test on at least one from each tier)

```
iOS (test these specifically):
  iPhone SE (2022)   — small screen, A15 chip
  iPhone 14          — standard flagship
  iPhone 14 Pro Max  — large notch, Dynamic Island
  iPad Air           — tablet, both orientations

Android:
  Samsung Galaxy S23 — flagship Android
  Pixel 7            — stock Android, good reference
  Mid-range Android  — budget device (crucial for performance)
```

### Checklist

```
VIEWPORT / SIZING
[ ] All sections use 100dvh not 100vh (iOS address bar fix)
[ ] --vh CSS variable updated on resize (for older iOS)
[ ] No horizontal scroll on any page
[ ] Text never overflows its container on small screens
[ ] Clamp() used on all headline font sizes

IOS SAFARI SPECIFIC
[ ] Test in iOS Safari (not Chrome on iOS — different engine)
[ ] Address bar show/hide doesn't cause content jump
[ ] Orientation change (portrait ↔ landscape) doesn't break layout
[ ] ScrollTrigger.refresh() called after orientationchange
[ ] No backdrop-filter crash (check older iPhone 11 or SE)
[ ] Video: autoPlay muted loop playsInline — all four attributes present

ANIMATIONS
[ ] All GSAP animations disabled on prefers-reduced-motion
[ ] WebGL disabled on mobile (CSS fallback shows)
[ ] Scroll scrub disabled on mobile
[ ] No cursor effects (no cursor on touch)
[ ] No magnetic hover effects
[ ] Parallax speed reduced to 30% of desktop value on mobile

NAVIGATION
[ ] Hamburger menu opens and closes correctly
[ ] Mobile menu closes on route change
[ ] Menu is accessible (aria-expanded, aria-label)
[ ] Touch targets are minimum 44×44px (iOS HIG requirement)
[ ] Nav doesn't overlap content when scrolled

PERFORMANCE (check in Chrome DevTools → Lighthouse → Mobile)
[ ] LCP < 2.5s on simulated 4G
[ ] Total blocking time < 300ms
[ ] No layout shift (CLS < 0.1)
[ ] Three.js not loaded on mobile (check Network tab)
[ ] GSAP ScrollTrigger properly cleaned up on unmount (no memory leak)
[ ] Images: next/image with proper sizes prop for mobile

FORMS (if present)
[ ] Touch keyboard doesn't obscure form fields
[ ] Font size ≥ 16px on inputs (iOS auto-zoom fix)
[ ] Submit button is reachable without zooming

CONTENT
[ ] Hero text readable at all mobile sizes (sufficient contrast on image)
[ ] CTA buttons full-width on small screens
[ ] Card grids collapse to single column ≤ 480px
[ ] Tables scroll horizontally (not overflow: hidden)
```

### Font size for iOS keyboard auto-zoom fix

```css
/* iOS zooms in if font-size < 16px on focus */
input, textarea, select {
  font-size: 16px;   /* minimum — prevents iOS auto-zoom */
}

/* If design requires smaller inputs: */
input {
  font-size: 16px;
  transform: scale(0.875);
  transform-origin: left center;
  /* This visually appears smaller while avoiding zoom */
}
```
