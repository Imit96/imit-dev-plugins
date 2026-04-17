# Cinematic Web — Motion Code Library

## TABLE OF CONTENTS
1. [How to Use This Library](#usage)
2. [Global Setup — GSAP + Lenis + ScrollTrigger](#global)
3. [Glassmorphism Animations](#glass)
4. [Spatial Design Animations](#spatial)
5. [Brutalism Animations](#brutal)
6. [Aurora / Gradient Mesh Animations](#aurora)
7. [Motion Design System Animations](#motion)
8. [Data-Driven UI Animations](#data)
9. [Claymorphism Animations](#clay)
10. [Universal Components](#universal)
11. [React / Next.js Wrappers](#react)
12. [Vue / Nuxt Wrappers](#vue)
13. [Svelte Wrappers](#svelte)

---

## HOW TO USE THIS LIBRARY {#usage}

In Phase 5 (code generation), after the paradigm and animation plan are locked:
1. Read the **Global Setup** section — always output this first
2. Read the **Paradigm-specific** section matching the confirmed paradigm
3. Read the **Framework Wrapper** matching the user's stack
4. Compose the final output by combining: global setup + paradigm blocks + framework wrappers
5. Replace all `[BRAND_*]` tokens with values from the locked Brand Brief

**Performance rule:** Always check mobile before adding any WebGL/3D block.
Always wrap in `prefers-reduced-motion` guard. Always use will-change sparingly.

---

## GLOBAL SETUP — GSAP + LENIS + SCROLLTRIGGER {#global}

Output this in every project regardless of paradigm. Goes in `lib/animation.ts` or `js/main.js`.

**CRITICAL SAFETY RULES — read before using any code in this library:**
- All GSAP must be inside `useEffect` / `onMounted` — never at module level
- Every `gsap.context()` must have a scope ref as second argument
- Every `useEffect` with GSAP must return `() => ctx.revert()`
- Add `suppressHydrationWarning` to every element GSAP touches
- Never use `gsap.killTweensOf('*')` — use `ctx.revert()` instead
- Always call `ScrollTrigger.refresh()` 100–150ms after mount
- Violating these causes `removeChild` crashes and hydration errors

```typescript
// lib/animation.ts — Global animation bootstrap
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, Observer);

// ── Lenis smooth scroll (pairs with GSAP ScrollTrigger) ──────────
export function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.8,
  });

  // Connect Lenis to GSAP ticker
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Refresh ScrollTrigger when Lenis scrolls
  lenis.on('scroll', ScrollTrigger.update);

  return lenis;
}

// ── Safe animation hook (React / Next.js) ────────────────────────
// Use this pattern in EVERY animated component — no exceptions
export function useGSAP(
  animationFn: (ctx: gsap.Context) => void,
  containerRef: React.RefObject<HTMLElement>,
  deps: unknown[] = []
) {
  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(animationFn, containerRef) // scoped!

    // Refresh ScrollTrigger after layout settles
    const timer = setTimeout(() => ScrollTrigger.refresh(), 150)

    return () => {
      ctx.revert()           // kills all tweens + ScrollTriggers in scope
      clearTimeout(timer)
    }
  }, deps)
}

// ── Reduced motion guard ─────────────────────────────────────────
export const reducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

export function safeAnimate(
  target: gsap.TweenTarget,
  vars: gsap.TweenVars,
  fallback?: gsap.TweenVars
) {
  if (reducedMotion) {
    gsap.set(target, fallback ?? { opacity: 1 });
    return;
  }
  return gsap.to(target, vars);
}

// ── Touch device detection (client-side only) ────────────────────
export const isTouch =
  typeof window !== 'undefined'
    ? !window.matchMedia('(hover: hover)').matches
    : true; // default to touch-safe on server

// ── Init all on mount ────────────────────────────────────────────
export function initAnimations() {
  if (reducedMotion) return;
  const lenis = initLenis();
  return lenis;
}
```

**Safe component template — copy this for every animated section:**
```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function AnimatedSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return                    // guard

    const ctx = gsap.context(() => {            // scoped context
      // put ALL gsap code inside here
      gsap.from('.item', {
        opacity: 0, y: 40, stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: 'top 80%' }
      })
    }, ref)                                     // scope = this component only

    const timer = setTimeout(() => ScrollTrigger.refresh(), 150)

    return () => {                              // always clean up
      ctx.revert()
      clearTimeout(timer)
    }
  }, [])

  return (
    <section ref={ref} suppressHydrationWarning>
      {children}
    </section>
  )
}
```



**CSS motion tokens — output in every `globals.css`:**
```css
/* ── Motion Design Tokens ─────────────────────────────────────── */
:root {
  --dur-instant:  0ms;
  --dur-fast:     150ms;
  --dur-standard: 300ms;
  --dur-slow:     500ms;
  --dur-crawl:    800ms;
  --dur-cinema:   1200ms;
  --dur-epic:     2400ms;

  --ease-snap:    cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:  cubic-bezier(0.40, 0.00, 0.20, 1.00);
  --ease-cinema:  cubic-bezier(0.76, 0.00, 0.24, 1.00);
  --ease-elastic: cubic-bezier(0.68, -0.55, 0.27, 1.55);
  --ease-bounce:  cubic-bezier(0.34, 1.70, 0.64, 1.00);
  --ease-sharp:   cubic-bezier(0.4, 0, 0.6, 1);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

---

## GLASSMORPHISM ANIMATIONS {#glass}

### Glass Hero — Immersive Zoom + Depth Parallax

```typescript
// components/Hero/GlassHero.animation.ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reducedMotion } from '@/lib/animation';

export function initGlassHero() {
  if (reducedMotion) return;

  // ── Page enter: zoom out from deep in the scene ───────────────
  const enterTl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  enterTl
    .fromTo('.glass-hero__scene', { scale: 1.15, opacity: 0 },
      { scale: 1, opacity: 1, duration: 2.4 })
    .fromTo('.glass-hero__panel', {
      opacity: 0, y: 30,
      backdropFilter: 'blur(0px)',
      webkitBackdropFilter: 'blur(0px)',
    }, {
      opacity: 1, y: 0,
      backdropFilter: 'blur(var(--glass-blur))',
      webkitBackdropFilter: 'blur(var(--glass-blur))',
      duration: 1.2,
    }, '-=1.4')
    .fromTo('.glass-hero__headline > *', {
      opacity: 0, y: 20, filter: 'blur(6px)',
    }, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      stagger: 0.1, duration: 0.8,
    }, '-=0.8');

  // ── Scroll: parallax depth layers ─────────────────────────────
  const layers = [
    { selector: '.glass-parallax--bg',   speed: 0.15 },
    { selector: '.glass-parallax--mid',  speed: 0.4  },
    { selector: '.glass-parallax--fg',   speed: 0.7  },
    { selector: '.glass-hero__panel',    speed: 0.9  },
  ];
  layers.forEach(({ selector, speed }) => {
    gsap.to(selector, {
      yPercent: -40 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: '.glass-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}
```

**CSS for Glass Hero:**
```css
.glass-hero {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  display: grid;
  place-items: center;
}
.glass-hero__scene {
  position: absolute;
  inset: -10%;           /* Oversized for zoom-out room */
  will-change: transform, opacity;
}
.glass-hero__scene video,
.glass-hero__scene img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.glass-hero__panel {
  position: relative;
  z-index: 2;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: var(--glass-shadow),
              inset 0 1px 0 var(--glass-highlight);
  padding: clamp(2rem, 5vw, 4rem);
  will-change: opacity, transform;
}
```

### Glass Card Hover — Tilt + Glow
```typescript
export function initGlassCardHover() {
  if (reducedMotion || isTouch) return;

  document.querySelectorAll<HTMLElement>('.glass-card').forEach(card => {
    const glow = card.querySelector<HTMLElement>('.glass-card__glow');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -10;
      const rotY = ((x - cx) / cx) * 10;

      gsap.to(card, {
        rotateX: rotX, rotateY: rotY, scale: 1.02,
        duration: 0.4, ease: 'power2.out',
        transformPerspective: 900,
      });
      if (glow) {
        glow.style.background =
          `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.12), transparent 65%)`;
        gsap.to(glow, { opacity: 1, duration: 0.3 });
      }
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0, scale: 1,
        duration: 0.6, ease: 'elastic.out(1, 0.5)',
      });
      if (glow) gsap.to(glow, { opacity: 0, duration: 0.4 });
    });
  });
}
```

---

## SPATIAL DESIGN ANIMATIONS {#spatial}

### Spatial Depth Stack — Multi-layer parallax + scroll-linked 3D

```typescript
// Spatial: Z-depth layers that respond to cursor + scroll
export function initSpatialDepth() {
  if (reducedMotion) return;

  // ── Cursor-driven depth shift ─────────────────────────────────
  if (!isTouch) {
    const depthLayers = document.querySelectorAll<HTMLElement>('[data-depth]');

    window.addEventListener('mousemove', (e) => {
      const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
      const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;

      depthLayers.forEach(layer => {
        const depth = parseFloat(layer.dataset.depth ?? '0.2');
        gsap.to(layer, {
          x: xRatio * depth * 30,
          y: yRatio * depth * 20,
          rotateY: xRatio * depth * 5,
          duration: 0.8,
          ease: 'power2.out',
        });
      });
    });
  }

  // ── Scroll-driven depth separation ───────────────────────────
  gsap.to('.spatial-bg', {
    yPercent: -20, scale: 1.05,
    ease: 'none',
    scrollTrigger: {
      trigger: '.spatial-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });

  // ── Floating panel entrance ───────────────────────────────────
  gsap.fromTo('.spatial-panel', {
    opacity: 0,
    z: -80,
    rotateX: 8,
  }, {
    opacity: 1, z: 0, rotateX: 0,
    duration: 1.4,
    ease: 'power3.out',
    stagger: 0.15,
    delay: 0.6,
  });
}
```

**HTML Data Attributes:**
```html
<!-- Depth values: 0.1 (far background) → 1.0 (closest foreground) -->
<div class="spatial-bg"     data-depth="0.1"><!-- video/image bg --></div>
<div class="spatial-mid"    data-depth="0.4"><!-- 3D element --></div>
<div class="spatial-panel"  data-depth="0.7"><!-- glass UI panel --></div>
<div class="spatial-fg"     data-depth="1.0"><!-- CTA / headline --></div>
```

---

## BRUTALISM ANIMATIONS {#brutal}

### Brutalism: Hard cuts, no ease, maximum impact

```typescript
export function initBrutalismHero() {
  if (reducedMotion) return;

  // ── Snap-in: No ease — hard mechanical entrance ───────────────
  const tl = gsap.timeline({ defaults: { ease: 'none', duration: 0.15 } });
  tl
    .fromTo('.brutal-hero__headline', { x: -120, opacity: 0 },
      { x: 0, opacity: 1 })
    .fromTo('.brutal-hero__sub', { x: 120, opacity: 0 },
      { x: 0, opacity: 1 }, '+=0.05')
    .fromTo('.brutal-cta', { y: 60, opacity: 0 },
      { y: 0, opacity: 1 }, '+=0.05')
    .fromTo('.brutal-border-line', { scaleX: 0 },
      { scaleX: 1, duration: 0.3, transformOrigin: 'left' }, '-=0.1');
}

// Brutalism scroll: section borders stamp in
export function initBrutalScrollStamps() {
  gsap.utils.toArray<HTMLElement>('.brutal-section').forEach(section => {
    const border = section.querySelector('.brutal-stamp-border');
    gsap.fromTo(border, { scaleY: 0 }, {
      scaleY: 1,
      transformOrigin: 'top',
      duration: 0.2,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
    });
  });
}

// Brutalism: Marquee ticker (always running)
export function initBrutalMarquee() {
  const track = document.querySelector<HTMLElement>('.marquee-track');
  if (!track) return;
  const content = track.innerHTML;
  track.innerHTML += content; // duplicate for seamless loop
  gsap.to(track, {
    xPercent: -50,
    ease: 'none',
    duration: 20,
    repeat: -1,
  });
}

// Brutalism card hover — hard offset shadow shift
// (Pure CSS — no JS needed for this one)
```

**CSS — Brutalism card hover (pure CSS, no JS):**
```css
.brutal-card {
  border: 3px solid var(--brut-black);
  box-shadow: 6px 6px 0 var(--brut-black);
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}
.brutal-card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 9px 9px 0 var(--brut-black);
}
.brutal-card:active {
  transform: translate(3px, 3px);
  box-shadow: 3px 3px 0 var(--brut-black);
}
```

---

## AURORA / GRADIENT MESH ANIMATIONS {#aurora}

### Aurora: Living background + cursor-reactive blobs

```typescript
export function initAuroraBackground() {
  if (reducedMotion) {
    // Static fallback — just show the gradient, no animation
    return;
  }

  // ── CSS Aurora — animate hue rotation slowly ──────────────────
  gsap.to('.aurora-bg', {
    filter: 'hue-rotate(40deg) saturate(1.3)',
    duration: 8,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  });

  // ── Blob morphing — each blob drifts independently ───────────
  document.querySelectorAll<HTMLElement>('.aurora-blob').forEach((blob, i) => {
    gsap.to(blob, {
      x: `random(-60, 60)`,
      y: `random(-40, 40)`,
      scale: `random(0.85, 1.15)`,
      duration: `random(6, 12)`,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: i * 1.5,
    });
  });

  // ── Cursor-reactive: nearest blob follows cursor subtly ───────
  if (!isTouch) {
    window.addEventListener('mousemove', (e) => {
      const blob = document.querySelector<HTMLElement>('.aurora-blob--reactive');
      if (!blob) return;
      gsap.to(blob, {
        x: (e.clientX / window.innerWidth - 0.5) * 120,
        y: (e.clientY / window.innerHeight - 0.5) * 80,
        duration: 2,
        ease: 'power1.out',
      });
    });
  }
}
```

**CSS — Aurora blobs:**
```css
.aurora-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: #000;
  overflow: hidden;
}
.aurora-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  will-change: transform;
}
.aurora-blob--1 {
  width: 50vw; height: 50vw;
  background: [BRAND_PRIMARY];
  top: -10%; left: -10%;
}
.aurora-blob--2 {
  width: 40vw; height: 40vw;
  background: [BRAND_SECONDARY];
  top: 40%; right: -5%;
}
.aurora-blob--3 {
  width: 35vw; height: 35vw;
  background: [BRAND_ACCENT];
  bottom: -10%; left: 30%;
}
.aurora-blob--reactive { will-change: transform; }
```

---

## MOTION DESIGN SYSTEM ANIMATIONS {#motion}

### Complete motion-first component system

```typescript
// Every element has enter / idle / exit states
// This system drives ALL animation — nothing is ad-hoc

type MotionState = 'enter' | 'idle' | 'exit';

const motionStates: Record<string, Record<MotionState, gsap.TweenVars>> = {
  heroHeadline: {
    enter: { opacity: 1, y: 0, filter: 'blur(0px)',
             duration: 1.2, ease: 'power4.out' },
    idle:  { y: 0 },
    exit:  { opacity: 0, y: -40, filter: 'blur(8px)',
             duration: 0.5, ease: 'power2.in' },
  },
  card: {
    enter: { opacity: 1, y: 0, scale: 1,
             duration: 0.6, ease: 'power3.out' },
    idle:  { scale: 1 },
    exit:  { opacity: 0, y: 20, scale: 0.97,
             duration: 0.3, ease: 'power2.in' },
  },
  cta: {
    enter: { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' },
    idle:  { scale: 1 },
    exit:  { opacity: 0, scale: 0.95, duration: 0.2 },
  },
};

export function applyMotionState(
  selector: string,
  state: MotionState,
  component: keyof typeof motionStates
) {
  const vars = motionStates[component][state];
  if (reducedMotion) {
    gsap.set(selector, state === 'enter' ? { opacity: 1 } : { opacity: 0 });
    return;
  }
  if (state === 'enter') {
    gsap.fromTo(selector,
      { opacity: 0, y: 40, scale: 0.97, filter: 'blur(4px)' },
      vars
    );
  } else {
    gsap.to(selector, vars);
  }
}

// ── Page transition system ────────────────────────────────────────
export function pageExit(onComplete: () => void) {
  gsap.to('main', {
    opacity: 0, y: -20, filter: 'blur(4px)',
    duration: 0.35, ease: 'power2.in',
    onComplete,
  });
}
export function pageEnter() {
  gsap.fromTo('main',
    { opacity: 0, y: 20, filter: 'blur(4px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)',
      duration: 0.6, ease: 'power3.out' }
  );
}
```

---

## DATA-DRIVEN UI ANIMATIONS {#data}

### Data: Counter roll, chart draw, live metric pulse

```typescript
// ── Animated counter ─────────────────────────────────────────────
export function initCounters() {
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach(el => {
    const target   = parseFloat(el.dataset.counter ?? '0');
    const prefix   = el.dataset.prefix  ?? '';
    const suffix   = el.dataset.suffix  ?? '';
    const decimals = parseInt(el.dataset.decimals ?? '0');
    const proxy    = { val: 0 };

    gsap.to(proxy, {
      val: target,
      duration: 2.2,
      ease: 'power2.out',
      onUpdate() {
        el.textContent =
          prefix + proxy.val.toFixed(decimals).toLocaleString() + suffix;
      },
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        once: true,
      },
    });
  });
}

// ── Metric pulse (live-feeling readout) ──────────────────────────
export function initMetricPulse() {
  document.querySelectorAll<HTMLElement>('.metric-live').forEach(el => {
    // Subtle glow pulse to imply live data
    gsap.to(el, {
      textShadow: '0 0 12px [BRAND_ACCENT]',
      repeat: -1,
      yoyo: true,
      duration: 1.8,
      ease: 'sine.inOut',
    });
  });
}

// ── SVG line chart draw on scroll ────────────────────────────────
export function initChartDraw() {
  document.querySelectorAll<SVGPathElement>('.chart-path').forEach(path => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: path.closest('svg'),
        start: 'top 75%',
        once: true,
      },
    });
  });
}
```

---

## CLAYMORPHISM ANIMATIONS {#clay}

### Clay: Bouncy, springy, inflated feel

```typescript
export function initClayAnimations() {
  if (reducedMotion) return;

  // ── Bouncy entrance: cards inflate into view ──────────────────
  gsap.fromTo('.clay-card', {
    scale: 0.6, opacity: 0, y: 40,
  }, {
    scale: 1, opacity: 1, y: 0,
    duration: 0.8,
    ease: 'elastic.out(1.2, 0.5)',
    stagger: 0.1,
    scrollTrigger: {
      trigger: '.clay-section',
      start: 'top 70%',
    },
  });

  // ── Clay hover: squish and release ───────────────────────────
  if (!isTouch) {
    document.querySelectorAll<HTMLElement>('.clay-card').forEach(card => {
      card.addEventListener('mouseenter', () =>
        gsap.to(card, { scale: 1.06, duration: 0.3, ease: 'back.out(3)' }));
      card.addEventListener('mouseleave', () =>
        gsap.to(card, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' }));
      card.addEventListener('mousedown', () =>
        gsap.to(card, { scale: 0.96, scaleX: 1.03, duration: 0.1 }));
      card.addEventListener('mouseup', () =>
        gsap.to(card, { scale: 1.06, scaleX: 1, duration: 0.4, ease: 'back.out(2)' }));
    });
  }
}
```

---

## UNIVERSAL COMPONENTS {#universal}

These work with ANY paradigm. Always include them.

### Stagger Cascade (universal section reveal)
```typescript
export function initStaggerCascade() {
  const groups = document.querySelectorAll('[data-stagger-group]');
  groups.forEach(group => {
    const items = group.querySelectorAll('[data-stagger-item]');
    const delay  = parseFloat((group as HTMLElement).dataset.staggerDelay ?? '0.1');
    const fromY  = parseInt((group as HTMLElement).dataset.fromY ?? '50');

    gsap.fromTo(items, {
      opacity: 0, y: fromY,
    }, {
      opacity: 1, y: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: delay,
      scrollTrigger: {
        trigger: group,
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
    });
  });
}
```

### Custom Cursor (paradigm-aware)
```typescript
export function initCustomCursor(options: {
  size?: number;
  color?: string;
  blend?: GlobalCompositeOperation | string;
  expandOnHover?: boolean;
}) {
  if (isTouch) return;

  const { size = 20, color = '[BRAND_ACCENT]', blend = 'difference', expandOnHover = true } = options;

  const cursor    = document.createElement('div');
  const cursorDot = document.createElement('div');
  cursor.className = 'cursor-ring';
  cursorDot.className = 'cursor-dot';
  document.body.appendChild(cursor);
  document.body.appendChild(cursorDot);

  const cursorStyles = `
    .cursor-ring, .cursor-dot {
      position: fixed; top: 0; left: 0;
      pointer-events: none; z-index: 9999;
      border-radius: 50%; mix-blend-mode: ${blend};
    }
    .cursor-ring { width: ${size}px; height: ${size}px;
      border: 2px solid ${color}; }
    .cursor-dot  { width: 5px; height: 5px;
      background: ${color}; }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = cursorStyles;
  document.head.appendChild(styleEl);

  window.addEventListener('mousemove', (e) => {
    gsap.to(cursor,    { x: e.clientX - size/2, y: e.clientY - size/2, duration: 0.45, ease: 'power2.out' });
    gsap.to(cursorDot, { x: e.clientX - 2.5,    y: e.clientY - 2.5,    duration: 0.1 });
  });

  if (expandOnHover) {
    document.querySelectorAll('a, button, [data-cursor-expand]').forEach(el => {
      el.addEventListener('mouseenter', () =>
        gsap.to(cursor, { scale: 2.5, duration: 0.3, ease: 'power2.out' }));
      el.addEventListener('mouseleave', () =>
        gsap.to(cursor, { scale: 1, duration: 0.4, ease: 'back.out(2)' }));
    });
  }
}
```

### Magnetic Button (universal)
```typescript
export function initMagneticElements() {
  if (isTouch) return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach(el => {
    const strength = parseFloat(el.dataset.magnetic ?? '0.35');

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top  + rect.height / 2);
      gsap.to(el, { x: dx * strength, y: dy * strength,
                    duration: 0.4, ease: 'power2.out' });
    });

    el.addEventListener('mouseleave', () =>
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }));
  });
}
```

### Scroll Progress Bar (universal)
```typescript
export function initScrollProgress() {
  const bar = document.querySelector<HTMLElement>('.scroll-progress');
  if (!bar) return;

  gsap.to(bar, {
    scaleX: 1, ease: 'none',
    transformOrigin: 'left center',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
    },
  });
}
```

**CSS for scroll progress:**
```css
.scroll-progress {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 3px;
  background: [BRAND_ACCENT];
  transform-origin: left;
  transform: scaleX(0);
  z-index: 1000;
  will-change: transform;
}
```

---

## REACT / NEXT.JS WRAPPERS {#react}

```tsx
// hooks/useGSAP.ts — Safe GSAP in React/Next.js
'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGSAPAnimation(
  animationFn: (ctx: gsap.Context) => void,
  deps: unknown[] = []
) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(animationFn, containerRef);
    return () => ctx.revert(); // Cleanup on unmount — critical in Next.js
  }, deps);

  return containerRef;
}

// Usage in component:
// const ref = useGSAPAnimation((ctx) => { initGlassHero(); }, []);
// <section ref={ref as any}>...</section>
```

```tsx
// components/AnimatedSection.tsx — Universal scroll reveal wrapper
'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Props {
  children: React.ReactNode;
  animation?: 'cascade' | 'fade' | 'slide' | 'zoom';
  delay?: number;
  className?: string;
}

export default function AnimatedSection({
  children, animation = 'fade', delay = 0, className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const from: gsap.TweenVars = {
      fade:    { opacity: 0 },
      slide:   { opacity: 0, y: 50 },
      zoom:    { opacity: 0, scale: 0.95 },
      cascade: { opacity: 0, y: 40 },
    }[animation];

    const to: gsap.TweenVars = {
      opacity: 1, y: 0, scale: 1,
      duration: 0.8, ease: 'power3.out', delay,
      scrollTrigger: { trigger: el, start: 'top 78%',
                       toggleActions: 'play none none reverse' },
    };

    const ctx = gsap.context(() => gsap.fromTo(el, from, to), el);
    return () => ctx.revert();
  }, [animation, delay]);

  return <div ref={ref} className={className}>{children}</div>;
}
```

---

## VUE / NUXT WRAPPERS {#vue}

```typescript
// composables/useAnimation.ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onMounted, onUnmounted, ref } from 'vue';

gsap.registerPlugin(ScrollTrigger);

export function useScrollReveal(options: {
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  trigger?: string;
}) {
  const el = ref<HTMLElement | null>(null);

  onMounted(() => {
    if (!el.value) return;
    gsap.fromTo(el.value,
      options.from ?? { opacity: 0, y: 40 },
      {
        ...(options.to ?? { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }),
        scrollTrigger: {
          trigger: el.value,
          start: options.trigger ?? 'top 78%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });

  onUnmounted(() => ScrollTrigger.getAll().forEach(t => t.kill()));

  return { el };
}
```

---

## SVELTE WRAPPERS {#svelte}

```svelte
<!-- lib/AnimateOnScroll.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  export let animation: 'fade' | 'slide' | 'zoom' = 'slide';
  export let delay = 0;
  let el: HTMLDivElement;

  onMount(() => {
    const from = {
      fade:  { opacity: 0 },
      slide: { opacity: 0, y: 50 },
      zoom:  { opacity: 0, scale: 0.95 },
    }[animation];

    gsap.fromTo(el, from, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.8, ease: 'power3.out', delay,
      scrollTrigger: { trigger: el, start: 'top 78%' },
    });
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  });
</script>

<div bind:this={el}><slot /></div>
```

---

## THREE.JS DEPTH — PRODUCTION PATTERNS {#threejs}

> For scroll-driven Three.js, also read `references/scrollytelling.md` → WebGL Scroll Scene

### Rule: Always plug Three.js into GSAP ticker — never its own RAF

```typescript
// lib/three-setup.ts — base Three.js setup that integrates with Lenis + GSAP
import * as THREE from 'three'
import gsap from 'gsap'

export function createThreeScene(container: HTMLElement) {
  const scene    = new THREE.Scene()
  const camera   = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  )
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.appendChild(renderer.domElement)

  camera.position.z = 5

  // Resize handler
  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
  window.addEventListener('resize', onResize)

  // CORRECT: plug render into GSAP ticker — not requestAnimationFrame
  const tick = () => renderer.render(scene, camera)
  gsap.ticker.add(tick)

  return {
    scene, camera, renderer,
    destroy: () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement)
    }
  }
}
```

---

### Cursor-Reactive 3D Object (Hero Element)

```typescript
// 3D object that tilts toward cursor — premium hero element
import * as THREE from 'three'
import gsap from 'gsap'
import { createThreeScene } from './three-setup'

export function createCursorReactive3D(container: HTMLElement) {
  const { scene, camera, renderer, destroy } = createThreeScene(container)

  // Brand-colored geometric mesh
  const geo = new THREE.IcosahedronGeometry(1.5, 1)
  const mat = new THREE.MeshPhongMaterial({
    color:     '[BRAND_PRIMARY_HEX]',
    emissive:  '[BRAND_ACCENT_HEX]',
    emissiveIntensity: 0.2,
    wireframe: false,
    shininess: 100,
  })
  const mesh = new THREE.Mesh(geo, mat)
  scene.add(mesh)

  // Wireframe overlay for depth
  const wireMat = new THREE.MeshBasicMaterial({
    color:     '[BRAND_ACCENT_HEX]',
    wireframe: true,
    transparent: true,
    opacity:   0.15,
  })
  const wireMesh = new THREE.Mesh(geo, wireMat)
  scene.add(wireMesh)

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.4))
  const pointLight = new THREE.PointLight('[BRAND_ACCENT_HEX]', 2, 20)
  pointLight.position.set(3, 3, 3)
  scene.add(pointLight)

  // Cursor tracking — smooth lerp to mouse position
  const target = { x: 0, y: 0 }
  const current = { x: 0, y: 0 }

  const onMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect()
    target.x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2
    target.y = ((e.clientY - rect.top)  / rect.height - 0.5) * -2
  }
  window.addEventListener('mousemove', onMouseMove)

  // Idle rotation when no cursor
  let idleTime = 0

  // Add to GSAP ticker via parent createThreeScene's tick
  // We need to patch the ticker to include animation logic
  const animateTick = (time: number) => {
    // Smooth lerp toward cursor
    current.x += (target.x - current.x) * 0.05
    current.y += (target.y - current.y) * 0.05

    // Apply rotation — cursor controls Y rotation, X for tilt
    mesh.rotation.y     = current.x * 0.8
    mesh.rotation.x     = current.y * 0.5
    wireMesh.rotation.y = mesh.rotation.y
    wireMesh.rotation.x = mesh.rotation.x

    // Slow idle drift
    mesh.rotation.z += 0.002
    wireMesh.rotation.z = mesh.rotation.z

    // Floating motion
    mesh.position.y     = Math.sin(time * 0.5) * 0.1
    wireMesh.position.y = mesh.position.y

    // Light orbits
    pointLight.position.x = Math.sin(time * 0.3) * 4
    pointLight.position.z = Math.cos(time * 0.3) * 4

    renderer.render(scene, camera)
  }

  gsap.ticker.add(animateTick)

  return {
    destroy: () => {
      gsap.ticker.remove(animateTick)
      window.removeEventListener('mousemove', onMouseMove)
      geo.dispose()
      mat.dispose()
      wireMat.dispose()
      destroy()
    }
  }
}
```

---

### Scroll-Linked 3D (Object rotates with scroll)

```typescript
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createThreeScene } from './three-setup'

export function createScrollLinked3D(
  container: HTMLElement,
  sectionEl: HTMLElement
) {
  const { scene, camera, renderer, destroy } = createThreeScene(container)

  // Product / hero mesh
  const geo  = new THREE.TorusKnotGeometry(1, 0.3, 128, 32)
  const mat  = new THREE.MeshPhongMaterial({
    color:    '[BRAND_PRIMARY_HEX]',
    emissive: '[BRAND_ACCENT_HEX]',
    emissiveIntensity: 0.3,
    shininess: 80,
  })
  const mesh = new THREE.Mesh(geo, mat)
  scene.add(mesh)
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))

  const rimLight = new THREE.DirectionalLight('[BRAND_ACCENT_HEX]', 1.5)
  rimLight.position.set(-3, 2, -3)
  scene.add(rimLight)

  // Scroll controls rotation — proxy object for smooth interpolation
  const rotProxy = { y: 0, x: 0, scale: 0.8 }

  ScrollTrigger.create({
    trigger: sectionEl,
    start:   'top bottom',
    end:     'bottom top',
    scrub:   1.5,
    onUpdate: (self) => {
      const p = self.progress
      // Full 360° Y rotation across the scroll range
      rotProxy.y = p * Math.PI * 2
      // Slight X tilt — peaks at midpoint
      rotProxy.x = Math.sin(p * Math.PI) * 0.5
      // Scale in from 0.8 to 1.1 then back to 1
      rotProxy.scale = p < 0.5
        ? 0.8 + p * 0.6
        : 1.1 - (p - 0.5) * 0.2
    }
  })

  const animateTick = () => {
    // Smooth lerp from proxy to actual mesh
    mesh.rotation.y += (rotProxy.y - mesh.rotation.y) * 0.08
    mesh.rotation.x += (rotProxy.x - mesh.rotation.x) * 0.08
    mesh.scale.setScalar(
      mesh.scale.x + (rotProxy.scale - mesh.scale.x) * 0.08
    )
    renderer.render(scene, camera)
  }

  gsap.ticker.add(animateTick)

  return {
    destroy: () => {
      gsap.ticker.remove(animateTick)
      geo.dispose(); mat.dispose()
      destroy()
    }
  }
}
```

---

### Instanced Mesh (100+ objects, one draw call)

For particle fields, star backgrounds, and grid animations that need
many objects without destroying performance.

```typescript
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function createInstancedField(container: HTMLElement, count = 500) {
  const scene    = new THREE.Scene()
  const camera   = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)
  camera.position.z = 8

  // Single geometry + material — instanced = one GPU draw call for all 500
  const geo = new THREE.SphereGeometry(0.04, 6, 6)
  const mat = new THREE.MeshBasicMaterial({ color: '[BRAND_ACCENT_HEX]' })
  const instances = new THREE.InstancedMesh(geo, mat, count)

  const dummy    = new THREE.Object3D()
  const positions: number[] = []

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 16
    const y = (Math.random() - 0.5) * 10
    const z = (Math.random() - 0.5) * 10
    positions.push(x, y, z)

    dummy.position.set(x, y, z)
    dummy.updateMatrix()
    instances.setMatrixAt(i, dummy.matrix)
  }

  instances.instanceMatrix.needsUpdate = true
  scene.add(instances)

  // Scroll rotates the field
  let scrollProgress = 0
  ScrollTrigger.create({
    trigger: container,
    start:   'top bottom',
    end:     'bottom top',
    scrub:   2,
    onUpdate: (self) => { scrollProgress = self.progress }
  })

  const animateTick = (time: number) => {
    instances.rotation.y = scrollProgress * Math.PI * 2
    instances.rotation.x = Math.sin(time * 0.3) * 0.1

    // Individual instance animation — pulse in/out with scroll
    for (let i = 0; i < count; i++) {
      const scale = 0.8 + Math.sin(time + i * 0.1) * 0.2 * scrollProgress
      dummy.position.set(positions[i*3], positions[i*3+1], positions[i*3+2])
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      instances.setMatrixAt(i, dummy.matrix)
    }
    instances.instanceMatrix.needsUpdate = true
    renderer.render(scene, camera)
  }

  gsap.ticker.add(animateTick)

  return {
    destroy: () => {
      gsap.ticker.remove(animateTick)
      geo.dispose(); mat.dispose(); instances.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement)
    }
  }
}
```

---

### Three.js Cleanup Checklist (prevent memory leaks)

Every Three.js component MUST dispose of resources on unmount:

```typescript
// Complete disposal pattern — copy into every Three.js component
function disposeThreeScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  // Traverse all objects in the scene
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      // Dispose geometry
      obj.geometry.dispose()

      // Dispose material(s)
      if (Array.isArray(obj.material)) {
        obj.material.forEach(mat => {
          disposeMaterial(mat)
        })
      } else {
        disposeMaterial(obj.material)
      }
    }
  })

  // Dispose renderer
  renderer.dispose()
  renderer.forceContextLoss()
}

function disposeMaterial(mat: THREE.Material) {
  mat.dispose()
  // Dispose all textures on the material
  Object.values(mat).forEach(value => {
    if (value instanceof THREE.Texture) {
      value.dispose()
    }
  })
}
```

---

## FLOATING_3D_ANCHOR — Persistent 3D Thread Through Page {#floating3d}

A 3D object that persists across ALL page sections, repositioning and morphing
as the user scrolls. It is not tied to one section — it IS the page's visual spine.

**The concept:** In the hero, the object is large and centred — the star of the show.
As the user scrolls into subsequent sections, it scales down, drifts to a corner,
and morphs its geometry or material to reflect each section's emotional tone.
At the CTA, it reasserts itself. The user always knows where they are in the story
because this object maps the emotional temperature of each section.

**Design decisions before coding:**
- What is the object? (brand mark geometry, abstract form, product shape, logo abstraction)
- How does it morph per section? (shape, color, wireframe/solid, scale, opacity)
- Where does it live in each section? (centred hero → top-right features → full CTA)

```typescript
// lib/floating3DAnchor.ts
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface SectionConfig {
  sectionEl:    HTMLElement
  position:     { x: number; y: number; z: number }  // 3D position
  scale:        number
  rotationY:    number
  color:        string            // hex
  wireframe:    boolean
  opacity:      number
  morphTarget?: number            // 0-1, drives morph between base geometry variants
}

export function createFloating3DAnchor(options: {
  container:    HTMLElement       // full-page overlay container
  brandColor:   string
  accentColor:  string
  sections:     SectionConfig[]
}) {
  const { container, brandColor, accentColor, sections } = options

  // ── Scene ────────────────────────────────────────────────────
  const scene    = new THREE.Scene()
  const camera   = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)  // transparent background
  container.appendChild(renderer.domElement)
  camera.position.z = 5

  // ── Geometries — morph between these ─────────────────────────
  const geometries = [
    new THREE.IcosahedronGeometry(1, 1),     // Hero state — energetic, complex
    new THREE.OctahedronGeometry(1, 0),      // Feature state — sharp, precise
    new THREE.TetrahedronGeometry(1, 0),     // Problem state — aggressive, angular
    new THREE.SphereGeometry(0.8, 32, 32),  // Solution state — smooth, complete
    new THREE.TorusGeometry(0.7, 0.3, 8, 20), // CTA state — connected, looping
  ]

  // ── Material — animated via uniforms ──────────────────────────
  const material = new THREE.MeshPhongMaterial({
    color:       new THREE.Color(brandColor),
    wireframe:   false,
    transparent: true,
    opacity:     1,
    shininess:   100,
  })

  const mesh = new THREE.Mesh(geometries[0], material)
  scene.add(mesh)

  // Wireframe overlay
  const wireMat = new THREE.MeshBasicMaterial({
    color:       new THREE.Color(accentColor),
    wireframe:   true,
    transparent: true,
    opacity:     0.15,
  })
  const wireMesh = new THREE.Mesh(geometries[0], wireMat)
  scene.add(wireMesh)

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.4))
  const rimLight = new THREE.DirectionalLight(new THREE.Color(accentColor), 1.5)
  rimLight.position.set(-3, 2, 2)
  scene.add(rimLight)

  // ── Proxy for smooth animation ─────────────────────────────
  const proxy = {
    posX: 0, posY: 0, posZ: 0,
    scale: 1,
    rotY: 0,
    opacity: 1,
  }

  // ── Per-section ScrollTriggers ──────────────────────────────
  sections.forEach((section, i) => {
    const geomIndex = Math.min(i, geometries.length - 1)

    ScrollTrigger.create({
      trigger:  section.sectionEl,
      start:    'top 60%',
      end:      'bottom 40%',
      onEnter:  () => transitionToSection(section, geomIndex, 'forward'),
      onEnterBack: () => transitionToSection(section, geomIndex, 'back'),
    })
  })

  function transitionToSection(
    cfg: SectionConfig,
    geomIndex: number,
    _direction: 'forward' | 'back'
  ) {
    const color = new THREE.Color(cfg.color)

    gsap.to(proxy, {
      posX:    cfg.position.x,
      posY:    cfg.position.y,
      scale:   cfg.scale,
      opacity: cfg.opacity,
      duration: 1.2,
      ease:    'power3.inOut',
      onUpdate: () => {
        mesh.position.set(proxy.posX, proxy.posY, proxy.posZ)
        wireMesh.position.copy(mesh.position)
        mesh.scale.setScalar(proxy.scale)
        wireMesh.scale.setScalar(proxy.scale)
        ;(material as THREE.MeshPhongMaterial).opacity = proxy.opacity
        ;(wireMat as THREE.MeshBasicMaterial).opacity  = proxy.opacity * 0.15
      },
    })

    // Swap geometry
    if (mesh.geometry !== geometries[geomIndex]) {
      gsap.to(mesh.scale, {
        x: 0, y: 0, z: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          mesh.geometry     = geometries[geomIndex]
          wireMesh.geometry = geometries[geomIndex]
          gsap.to(mesh.scale, { x: cfg.scale, y: cfg.scale, z: cfg.scale,
            duration: 0.6, ease: 'back.out(2)' })
        }
      })
    }

    // Color transition
    gsap.to(material.color, {
      r: color.r, g: color.g, b: color.b,
      duration: 0.8, ease: 'power2.inOut',
    })

    material.wireframe = cfg.wireframe
  }

  // ── Idle rotation via GSAP ticker ──────────────────────────
  const tick = (time: number) => {
    mesh.rotation.y    += 0.003
    mesh.rotation.x    += 0.001
    wireMesh.rotation.y = mesh.rotation.y
    wireMesh.rotation.x = mesh.rotation.x
    renderer.render(scene, camera)
  }
  gsap.ticker.add(tick)

  // ── Resize ──────────────────────────────────────────────────
  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }
  window.addEventListener('resize', onResize)

  return {
    destroy: () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geometries.forEach(g => g.dispose())
      material.dispose()
      wireMat.dispose()
      ScrollTrigger.getAll().forEach(t => t.kill())
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement)
    }
  }
}
```

```tsx
// components/layout/FloatingAnchor.tsx — place in root layout
'use client'
import { useEffect, useRef, useState } from 'react'
import { createFloating3DAnchor } from '@/lib/floating3DAnchor'

export function FloatingAnchor() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Mobile guard + WebGL check
    if (window.innerWidth < 768) return
    const test = document.createElement('canvas')
    if (!test.getContext('webgl2') && !test.getContext('webgl')) return

    // Wait for all sections to be in the DOM
    const timer = setTimeout(() => setReady(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!ready || !containerRef.current) return

    const sections = [
      { el: document.querySelector<HTMLElement>('.section-hero')! },
      { el: document.querySelector<HTMLElement>('.section-features')! },
      { el: document.querySelector<HTMLElement>('.section-about')! },
      { el: document.querySelector<HTMLElement>('.section-cta')! },
    ].filter(s => s.el)

    if (!sections.length) return

    const { destroy } = createFloating3DAnchor({
      container:   containerRef.current,
      brandColor:  '[BRAND_PRIMARY_HEX]',
      accentColor: '[BRAND_ACCENT_HEX]',
      sections: [
        { sectionEl: sections[0].el, position: { x: 0, y: 0, z: 0 },
          scale: 1.2, rotationY: 0, color: '[ACCENT_HEX]', wireframe: false, opacity: 1 },
        { sectionEl: sections[1].el, position: { x: 3.5, y: 1.5, z: 0 },
          scale: 0.4, rotationY: 0.3, color: '[PRIMARY_HEX]', wireframe: true, opacity: 0.7 },
        { sectionEl: sections[2].el, position: { x: -3, y: -1, z: 0 },
          scale: 0.5, rotationY: -0.2, color: '[ACCENT_HEX]', wireframe: false, opacity: 0.5 },
        { sectionEl: sections[3].el, position: { x: 0, y: 0, z: 0 },
          scale: 1.0, rotationY: 0, color: '[ACCENT_HEX]', wireframe: false, opacity: 1 },
      ],
    })

    return () => destroy()
  }, [ready])

  return (
    <div ref={containerRef} suppressHydrationWarning aria-hidden="true"
         style={{
           position: 'fixed',
           inset:    0,
           zIndex:   0,           // behind all content
           pointerEvents: 'none', // never blocks clicks
         }} />
  )
}

// In app/layout.tsx — add FloatingAnchor as a sibling to the page content
// <FloatingAnchor />
// <main>{children}</main>
```

**Design guidance for FLOATING_3D_ANCHOR positions:**
```
HERO section:      center (x:0, y:0)   scale: 1.0–1.5  ← dominant, commanding
FEATURE sections:  far right (x:3–4)   scale: 0.3–0.5  ← accent, not distracting
ABOUT section:     far left (x:-3–4)   scale: 0.4–0.6  ← intimate, human-scale
PROBLEM section:   top right (x:3,y:2) scale: 0.2–0.3  ← small, retreating
SOLUTION section:  center (x:0, y:0.5) scale: 0.8      ← returning, growing
CTA section:       center (x:0, y:0)   scale: 1.0–1.2  ← full presence again
```

---

## CINEMATIC HERO — BASELINE COMPONENT {#hero-baseline}

Every hero section generated by this skill starts from this baseline.
This is the MINIMUM. Add the locked behavior ON TOP of this foundation.
Never ship less than this. A hero with less than this is generic.

```tsx
// components/sections/Hero/Hero.tsx — BASELINE
// Replace [LOCKED_BEHAVIOR] with the actual behavior from LEDGER.json
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Always register — no exceptions
gsap.registerPlugin(ScrollTrigger)

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const headlineRef  = useRef<HTMLHeadingElement>(null)
  const sublineRef   = useRef<HTMLParagraphElement>(null)
  const ctaRef       = useRef<HTMLDivElement>(null)
  const bgRef        = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {

      // ── 1. PAGE ENTER: Immersive zoom + headline reveal ──────
      // This is the minimum hero entrance. Locked behavior adds on top.
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(bgRef.current, {
        scale:   1.08,
        opacity: 0,
      }, {
        scale:   1,
        opacity: 1,
        duration: 2.0,
      })
      .fromTo(headlineRef.current, {
        opacity: 0,
        y:       40,
        filter:  'blur(12px)',
      }, {
        opacity:  1,
        y:        0,
        filter:   'blur(0px)',
        duration: 1.0,
        stagger:  0.08,
      }, '-=1.2')
      .fromTo(sublineRef.current, {
        opacity: 0,
        y:       20,
      }, {
        opacity:  1,
        y:        0,
        duration: 0.8,
      }, '-=0.6')
      .fromTo(ctaRef.current, {
        opacity: 0,
        y:       16,
      }, {
        opacity:  1,
        y:        0,
        duration: 0.6,
      }, '-=0.4')

      // ── 2. SCROLL PARALLAX: Background drifts slower than content ─
      // Every hero should have this as a minimum scroll response
      ScrollTrigger.create({
        trigger:     containerRef.current,
        start:       'top top',
        end:         'bottom top',
        scrub:       1.5,
        onUpdate:    (self) => {
          gsap.set(bgRef.current, {
            y: self.progress * 120,  // background drifts up slower
          })
          gsap.set([headlineRef.current, sublineRef.current], {
            y:       self.progress * 60,
            opacity: 1 - self.progress * 1.5,
          })
        },
      })

      // ── 3. CURSOR PROXIMITY: Subtle tilt toward cursor ────────
      // Add life to hero — it breathes with cursor movement
      const onMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return
        const rect    = containerRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width  / 2
        const centerY = rect.top  + rect.height / 2
        const rotX    = ((e.clientY - centerY) / rect.height) * -6
        const rotY    = ((e.clientX - centerX) / rect.width)  *  6

        gsap.to(bgRef.current, {
          rotateX:  rotX,
          rotateY:  rotY,
          duration: 1.2,
          ease:     'power2.out',
        })
      }

      containerRef.current?.addEventListener('mousemove', onMouseMove)

      // ── 4. [LOCKED_BEHAVIOR]: Add implementation here ─────────
      // Read LEDGER.json → decisions.animations.hero
      // Find the behavior in animation-library.md or scrollytelling.md
      // Paste the full implementation code from that reference
      // Example for MULTI_STATE_HERO:
      //   import { initMultiStateHero } from '@/lib/multiStateHero'
      //   initMultiStateHero({ containerEl: ..., states: HERO_STATES })

    }, containerRef)

    return () => {
      ctx.revert()
      containerRef.current?.removeEventListener('mousemove', () => {})
    }
  }, [])

  return (
    <section
      ref={containerRef}
      suppressHydrationWarning
      style={{
        position: 'relative',
        height:   '100dvh',
        overflow: 'hidden',
        display:  'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background layer — video, image, WebGL canvas, or gradient */}
      <div ref={bgRef} suppressHydrationWarning
           style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {/* Insert: <video autoPlay muted loop playsInline poster="/hero-poster.jpg">
                     <source src={heroVideoUrl} type="video/mp4" />
                   </video>
            OR: Cloudinary <CldImage> fill priority
            OR: <HeroCanvas /> (Three.js / WebGL scene) */}
      </div>

      {/* Overlay — tints background for text legibility */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
      }} />

      {/* Hero content */}
      <div style={{
        position:  'relative',
        zIndex:    2,
        textAlign: 'center',
        padding:   '0 var(--container-px)',
        maxWidth:  '1200px',
      }}>
        <h1
          ref={headlineRef}
          suppressHydrationWarning
          style={{
            fontSize:    'var(--type-display)',
            fontWeight:  900,
            lineHeight:  1.05,
            margin:      0,
            letterSpacing: '-0.03em',
            color:       'var(--color-text)',
          }}
        >
          {/* Content from locked Brand Brief → headline */}
        </h1>

        <p
          ref={sublineRef}
          suppressHydrationWarning
          style={{
            fontSize:   'var(--type-h3)',
            color:      'var(--color-text-muted)',
            maxWidth:   '55ch',
            margin:     '1.5rem auto 0',
            lineHeight: 1.55,
          }}
        >
          {/* Content from locked Brand Brief → hero subline */}
        </p>

        <div ref={ctaRef} suppressHydrationWarning
             style={{ display: 'flex', gap: '1rem', justifyContent: 'center',
                      marginTop: '2.5rem', flexWrap: 'wrap' }}>
          <a href="#contact" style={{
            display:       'inline-flex',
            alignItems:    'center',
            padding:       '0.875rem 2.25rem',
            background:    'var(--color-accent)',
            color:         'var(--color-bg)',
            borderRadius:  'var(--radius-pill)',
            fontWeight:    600,
            fontSize:      '1rem',
            textDecoration:'none',
            transition:    'transform 0.2s ease, box-shadow 0.2s ease',
          }}>
            {/* CTA from locked Brand Brief */}
          </a>
        </div>
      </div>

      {/* Scroll indicator — fades out as user scrolls */}
      <div suppressHydrationWarning
           style={{ position: 'absolute', bottom: '2rem', left: '50%',
                    transform: 'translateX(-50%)', display: 'flex',
                    flexDirection: 'column', alignItems: 'center',
                    gap: '0.5rem', color: 'var(--color-text-muted)',
                    fontSize: '0.75rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', opacity: 0.6 }}>
        <span>Scroll</span>
        <div style={{
          width:     '1px', height: '40px',
          background:'currentColor',
          animation: 'scroll-indicator 1.5s ease-in-out infinite',
        }} />
      </div>

      <style>{`
        @keyframes scroll-indicator {
          0%, 100% { transform: scaleY(1); opacity: 0.6; }
          50% { transform: scaleY(0.4); opacity: 0.2; }
        }
      `}</style>
    </section>
  )
}
```

**Hero component checklist — before moving to next section:**
```
[ ] useEffect wraps ALL GSAP code
[ ] gsap.context() used with containerRef as scope
[ ] ctx.revert() returned from useEffect
[ ] suppressHydrationWarning on every element GSAP touches
[ ] Immersive zoom entrance implemented (not just opacity)
[ ] ScrollTrigger parallax scroll response implemented
[ ] Locked behavior from LEDGER.json added at step 4
[ ] Video: autoPlay muted loop playsInline (if video hero)
[ ] Poster image set on video (no flash before video loads)
[ ] Scroll indicator present and fades on scroll
[ ] Error boundary wrapping this component (from error-handling-layer.md)
[ ] Mobile: video hidden, static poster shows on < 768px
```
