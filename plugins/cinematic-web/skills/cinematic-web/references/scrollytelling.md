# Cinematic Web — Scrollytelling Reference

## TABLE OF CONTENTS
1. [Scrollytelling vs Scroll-Triggered](#difference)
2. [When to Use Each Pattern](#when)
3. [Scroll-Driven Master Timeline](#master)
4. [Chapter Snap (CHAPTER_SNAP)](#chapter)
5. [Horizontal Story Scroll (STORY_SCROLL)](#horizontal)
6. [Progress-Aware Sections](#progress)
7. [WebGL Scroll Scene — Three.js Camera Flight](#webgl)
8. [Shader + Scroll — Reality Warp Effect](#shader)
9. [Three.js + Lenis Integration (Critical)](#lenis)
10. [Scroll Scene State Machine](#statemachine)
11. [Performance Rules for Scrollytelling](#performance)
12. [Framework Wrappers](#wrappers)

---

## SCROLLYTELLING VS SCROLL-TRIGGERED {#difference}

```
SCROLL-TRIGGERED (what most sites do)
  User scrolls → element enters viewport → animation plays once
  "This section animates when it appears"
  Tool: gsap.from() + ScrollTrigger with toggleActions

SCROLLYTELLING (what cinematic sites do)
  Scroll position IS the playhead
  Every pixel of scroll = a specific frame of the experience
  The page doesn't animate when scrolled — it IS the animation
  Tool: scrub: true — scroll drives the timeline continuously
```

The key technical difference: `toggleActions` plays an animation.
`scrub: true` maps scroll position to animation progress.
Scrub is always what you want for cinematic scrollytelling.

---

## WHEN TO USE EACH PATTERN {#when}

```
MASTER TIMELINE        → Entire page tells one continuous story
                         Best for: landing pages, brand narratives, product reveals

CHAPTER SNAP           → Distinct scenes, each demands full attention
                         Best for: agencies, portfolios, feature showcases

HORIZONTAL STORY       → Timeline, process, portfolio sequence
                         Best for: case studies, timelines, product walkthroughs

PROGRESS-AWARE         → Section content reacts to how deep user is in it
                         Best for: feature reveals, comparison sections, maps

WEBGL SCROLL SCENE     → Camera travels through 3D space as user scrolls
                         Best for: product launches, luxury brands, immersive intros

SHADER + SCROLL        → Reality distorts / warps with scroll
                         Best for: creative agencies, music, experimental brands
```

---

## SCROLL-DRIVEN MASTER TIMELINE {#master}

The entire page is one GSAP timeline. Scroll is the playhead.
Every section's animation is a labelled segment on the same timeline.
This creates the "page plays like a film" effect — nothing happens independently.

```typescript
// lib/masterTimeline.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

// ── Individual section animations ──────────────────────────────
// Each returns a GSAP timeline (NOT attached to scroll yet)

function heroAnimation(): gsap.core.Timeline {
  return gsap.timeline()
    .fromTo('.hero-headline', { opacity: 0, y: 60, filter: 'blur(12px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power4.out' })
    .fromTo('.hero-sub', { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
    .fromTo('.hero-cta', { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, '-=0.3')
}

function featuresAnimation(): gsap.core.Timeline {
  return gsap.timeline()
    .fromTo('.features-label', { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' })
    .fromTo('.feature-card', { opacity: 0, y: 80, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7,
        ease: 'power3.out', stagger: 0.15 }, '-=0.2')
}

function productAnimation(): gsap.core.Timeline {
  return gsap.timeline()
    .fromTo('.product-reveal', { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power4.inOut' })
    .fromTo('.product-details', { opacity: 0, x: 60 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
}

function ctaAnimation(): gsap.core.Timeline {
  return gsap.timeline()
    .fromTo('.cta-bg', { scale: 1.1 }, { scale: 1, duration: 1, ease: 'power2.out' })
    .fromTo('.cta-headline', { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' }, '-=0.5')
    .fromTo('.cta-btn', { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(3)' }, '-=0.2')
}

// ── Master timeline builder ─────────────────────────────────────
export function buildMasterTimeline(containerRef: React.RefObject<HTMLElement>) {
  const master = gsap.timeline({
    scrollTrigger: {
      trigger:   containerRef.current,
      start:     'top top',
      end:       'bottom bottom',
      scrub:     1.5,     // lag in seconds — higher = smoother but less responsive
      pin:       false,   // page scrolls normally, timeline just tracks it
    }
  })

  // Add each section's animation at the right scroll progress point
  // Progress values: 0 = page top, 1 = page bottom
  master
    .add(heroAnimation(),    0)      // starts immediately
    .add(featuresAnimation(), 0.2)   // starts at 20% scroll
    .add(productAnimation(),  0.5)   // starts at 50% scroll
    .add(ctaAnimation(),      0.8)   // starts at 80% scroll

  return master
}

// ── React hook ─────────────────────────────────────────────────
export function useMasterTimeline(containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!containerRef.current) return
    const tl = buildMasterTimeline(containerRef)
    // Refresh after fonts/images load
    const timer = setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => { tl.kill(); clearTimeout(timer) }
  }, [])
}
```

```tsx
// app/page.tsx — usage
'use client'
import { useRef } from 'react'
import { useMasterTimeline } from '@/lib/masterTimeline'

export default function Page() {
  const pageRef = useRef<HTMLDivElement>(null)
  useMasterTimeline(pageRef)

  return (
    // IMPORTANT: total height determines scroll distance
    // Each section should be 100vh minimum for breathing room
    <div ref={pageRef} suppressHydrationWarning>
      <section className="hero"    style={{ height: '100vh' }}>...</section>
      <section className="features" style={{ height: '100vh' }}>...</section>
      <section className="product"  style={{ height: '100vh' }}>...</section>
      <section className="cta"      style={{ height: '80vh'  }}>...</section>
    </div>
  )
}
```

**Scrub value guide:**
- `scrub: true` — instant tracking, feels mechanical
- `scrub: 0.5` — slight lag, feels responsive
- `scrub: 1.5` — smooth lag, cinematic feel (recommended)
- `scrub: 3`   — heavy lag, dream-like slow follow

---

## CHAPTER SNAP (CHAPTER_SNAP) {#chapter}

Each section snaps into viewport. Scroll locks until the section's animation
plays fully. Then allows next scroll. Like turning pages, but cinematic.

```typescript
// lib/chapterSnap.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Observer } from 'gsap/Observer'

gsap.registerPlugin(ScrollTrigger, Observer)

interface Chapter {
  el:       HTMLElement
  onEnter:  (direction: 1 | -1) => gsap.core.Timeline
  onLeave?: (direction: 1 | -1) => gsap.core.Timeline
}

export function initChapterSnap(chapters: Chapter[]) {
  let currentChapter = 0
  let animating      = false

  function goTo(index: number, direction: 1 | -1) {
    if (animating || index < 0 || index >= chapters.length) return
    animating = true

    const leaving  = chapters[currentChapter]
    const entering = chapters[index]

    const leaveTL  = leaving.onLeave?.(direction)
    const enterTL  = entering.onEnter(direction)

    // Set initial state for entering chapter
    gsap.set(entering.el, { zIndex: 1 })
    gsap.set(leaving.el,  { zIndex: 0 })

    // Play leave → then enter
    const seq = gsap.timeline({
      onComplete: () => {
        animating      = false
        currentChapter = index
      }
    })

    if (leaveTL) seq.add(leaveTL)
    seq.add(enterTL)
  }

  // Capture scroll intent with Observer (works with Lenis + touch)
  const observer = Observer.create({
    type:           'wheel,touch,pointer',
    wheelSpeed:     -1,
    onDown:         () => goTo(currentChapter - 1, -1),
    onUp:           () => goTo(currentChapter + 1,  1),
    tolerance:      10,
    preventDefault: true,
  })

  // Initialize first chapter
  chapters[0].onEnter(1).play()

  return {
    goTo,
    getCurrentChapter: () => currentChapter,
    cleanup: () => {
      observer.kill()
      gsap.killTweensOf(chapters.map(c => c.el))
    },
  }

// ── Chapter animation presets ───────────────────────────────────
export const chapterEnter = {
  // Wipe in from right
  wipeRight: (el: HTMLElement): gsap.core.Timeline =>
    gsap.timeline()
      .fromTo(el, { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'power4.inOut' }),

  // Fade + scale up from center
  emerge: (el: HTMLElement): gsap.core.Timeline =>
    gsap.timeline()
      .fromTo(el, { opacity: 0, scale: 1.08 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }),

  // Slide up from below
  riseUp: (el: HTMLElement): gsap.core.Timeline =>
    gsap.timeline()
      .fromTo(el, { yPercent: 100 },
        { yPercent: 0, duration: 1, ease: 'power4.out' }),

  // Film cut — instant switch + content animates in
  hardCut: (el: HTMLElement, content: string): gsap.core.Timeline =>
    gsap.timeline()
      .set(el, { opacity: 1 })
      .fromTo(content, { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 }),
}

export const chapterLeave = {
  wipeLeft: (el: HTMLElement): gsap.core.Timeline =>
    gsap.timeline()
      .to(el, { clipPath: 'inset(0 0 0 100%)', duration: 0.8, ease: 'power4.in' }),

  fadeDown: (el: HTMLElement): gsap.core.Timeline =>
    gsap.timeline()
      .to(el, { opacity: 0, y: -40, duration: 0.6, ease: 'power3.in' }),

  shrink: (el: HTMLElement): gsap.core.Timeline =>
    gsap.timeline()
      .to(el, { scale: 0.95, opacity: 0, duration: 0.8, ease: 'power3.in' }),
}
```

```tsx
// usage in page component
'use client'
import { useEffect, useRef } from 'react'
import { initChapterSnap, chapterEnter, chapterLeave } from '@/lib/chapterSnap'

export default function StoryPage() {
  const chapterRefs = [
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
  ]

  useEffect(() => {
    const elements = chapterRefs.map(r => r.current!).filter(Boolean)
    if (elements.length === 0) return

    const chapters = elements.map((el, i) => ({
      el,
      onEnter: (dir: 1 | -1) =>
        dir === 1
          ? chapterEnter.riseUp(el)
          : chapterEnter.wipeRight(el),
      onLeave: (dir: 1 | -1) =>
        dir === 1
          ? chapterLeave.fadeDown(el)
          : chapterLeave.shrink(el),
    }))

    const { cleanup } = initChapterSnap(chapters)

    return () => {
      cleanup()               // kills Observer + all GSAP tweens
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {chapterRefs.map((ref, i) => (
        <section
          key={i}
          ref={ref}
          suppressHydrationWarning
          style={{
            position: 'absolute',
            inset: 0,
            // All chapters stacked — chapter snap controls visibility
          }}
        >
          Chapter {i + 1} content
        </section>
      ))}
    </div>
  )
}
```

---

## HORIZONTAL STORY SCROLL (STORY_SCROLL) {#horizontal}

Vertical scroll drives horizontal narrative. The user scrolls down;
the page travels sideways. Classic for portfolios, timelines, process flows.

```typescript
// lib/horizontalStory.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initHorizontalStory(options: {
  wrapper:    string   // selector for the outer scroll container
  track:      string   // selector for the horizontal track
  items?:     string   // selector for individual items (enables snap-to-item)
  snapToItems?: boolean
}) {
  const { wrapper, track, items, snapToItems = true } = options

  const wrapperEl = document.querySelector<HTMLElement>(wrapper)
  const trackEl   = document.querySelector<HTMLElement>(track)
  if (!wrapperEl || !trackEl) return

  // Total horizontal distance to travel
  const totalWidth = trackEl.scrollWidth - window.innerWidth

  // Base horizontal scroll
  const tween = gsap.to(trackEl, {
    x:    -totalWidth,
    ease: 'none',
    scrollTrigger: {
      trigger:   wrapperEl,
      start:     'top top',
      end:       () => `+=${totalWidth}`,
      scrub:     1,
      pin:       true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    }
  })

  // Snap-to-item (optional — snaps to each card as you scroll)
  if (snapToItems && items) {
    const itemEls = gsap.utils.toArray<HTMLElement>(items)
    ScrollTrigger.create({
      trigger:   wrapperEl,
      start:     'top top',
      end:       () => `+=${totalWidth}`,
      pin:       true,
      snap: {
        snapTo:   (value) => {
          // Find nearest item breakpoint
          const itemWidth  = totalWidth / (itemEls.length - 1)
          const nearestIdx = Math.round(value * (itemEls.length - 1))
          return nearestIdx / (itemEls.length - 1)
        },
        duration: { min: 0.2, max: 0.6 },
        ease:     'power2.out',
        delay:    0.1,
      },
    })
  }

  // Reveal content inside each item as it enters horizontal viewport
  if (items) {
    gsap.utils.toArray<HTMLElement>(items).forEach((item, i) => {
      const content = item.querySelectorAll('.story-item-content > *')
      gsap.fromTo(content, {
        opacity: 0,
        y:       30,
      }, {
        opacity: 1,
        y:       0,
        duration: 0.6,
        ease:    'power3.out',
        stagger:  0.08,
        scrollTrigger: {
          trigger:        item,
          containerAnimation: tween,   // KEY: tells ScrollTrigger this is inside horizontal scroll
          start:          'left 80%',
          toggleActions:  'play none none reverse',
        },
      })
    })
  }

  return tween
}
```

```tsx
// usage
<div className="story-wrapper" style={{ height: '100vh', overflow: 'hidden' }}>
  <div className="story-track" style={{
    display: 'flex',
    height: '100%',
    width:  'max-content',  // expands to fit all items
    gap:    '0px',
  }}>
    {projects.map((p, i) => (
      <div key={i} className="story-item" style={{
        width:    '100vw',
        height:   '100vh',
        flexShrink: 0,
        position: 'relative',
      }}>
        <div className="story-item-content">
          <h2>{p.title}</h2>
          <p>{p.description}</p>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## PROGRESS-AWARE SECTIONS {#progress}

Each section knows exactly what percentage through it the user is (0–1).
Internal elements animate continuously based on depth, not just on entry.

```typescript
// lib/progressSections.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initProgressSection(sectionEl: HTMLElement) {
  // Proxy object tracks section progress 0→1
  const state = { progress: 0 }

  ScrollTrigger.create({
    trigger: sectionEl,
    start:   'top bottom',
    end:     'bottom top',
    scrub:   true,
    onUpdate: (self) => {
      state.progress = self.progress

      // Update all progress-aware children
      sectionEl.querySelectorAll<HTMLElement>('[data-progress]').forEach(el => {
        const type = el.dataset.progress

        switch (type) {
          case 'parallax': {
            const speed  = parseFloat(el.dataset.speed ?? '0.3')
            const offset = (state.progress - 0.5) * speed * 200
            el.style.transform = `translateY(${offset}px)`
            break
          }
          case 'fade-center': {
            // Fades in as section centers, fades out as it leaves
            const opacity = 1 - Math.abs(state.progress - 0.5) * 2
            el.style.opacity = Math.max(0, opacity).toString()
            break
          }
          case 'scale': {
            const scale = 0.8 + state.progress * 0.4
            el.style.transform = `scale(${scale})`
            break
          }
          case 'rotate': {
            const degrees = parseFloat(el.dataset.degrees ?? '360')
            el.style.transform = `rotate(${state.progress * degrees}deg)`
            break
          }
          case 'reveal-width': {
            el.style.clipPath = `inset(0 ${(1 - state.progress) * 100}% 0 0)`
            break
          }
          case 'counter': {
            const target = parseInt(el.dataset.target ?? '100')
            el.textContent = Math.round(state.progress * target).toLocaleString()
            break
          }
        }
      })
    }
  })

  return state
}
```

```html
<!-- Usage — HTML attributes drive the behavior -->
<section data-progress-section>

  <!-- Parallax: moves at 40% of scroll speed -->
  <div data-progress="parallax" data-speed="0.4">Background image</div>

  <!-- Fades in when centered, fades out when leaving -->
  <h2 data-progress="fade-center">This section's headline</h2>

  <!-- Width reveals as section scrolls into view -->
  <div data-progress="reveal-width" class="progress-bar">
    <div class="bar-fill"></div>
  </div>

  <!-- Counter counts to target -->
  <span data-progress="counter" data-target="2847">0</span>

</section>
```

---

## WEBGL SCROLL SCENE — THREE.JS CAMERA FLIGHT {#webgl}

A Three.js scene where camera position, rotation, fog, and object transforms
are all driven by scroll progress. The user "flies through" the scene as they scroll.

```typescript
// lib/webglScrollScene.ts
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface SceneConfig {
  container:     HTMLElement
  cameraPath?:   { start: THREE.Vector3; end: THREE.Vector3 }
  fogConfig?:    { color: number; near: number; far: number }
  brandColors?:  { primary: string; accent: string }
  onProgress?:   (progress: number, scene: THREE.Scene) => void
}

export function createWebGLScrollScene(config: SceneConfig) {
  const { container, brandColors } = config

  // ── Scene setup ──────────────────────────────────────────────
  const scene    = new THREE.Scene()
  const camera   = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha:     true,    // transparent background — CSS bg shows through
  })

  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.appendChild(renderer.domElement)

  // ── Fog ──────────────────────────────────────────────────────
  const fogCfg = config.fogConfig ?? { color: 0x0a0f1e, near: 1, far: 20 }
  scene.fog = new THREE.FogExp2(fogCfg.color, 0.08)

  // ── Lights ───────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)

  const pointLight1 = new THREE.PointLight(
    brandColors?.accent ?? 0x4fffb0,
    2,
    30
  )
  pointLight1.position.set(5, 5, 5)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(
    brandColors?.primary ?? 0x6366f1,
    1.5,
    20
  )
  pointLight2.position.set(-5, -3, -5)
  scene.add(pointLight2)

  // ── Geometry — particle field ─────────────────────────────────
  const particleCount = 2000
  const positions     = new Float32Array(particleCount * 3)
  const colors        = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    // Spread particles in a tube the camera flies through
    positions[i * 3]     = (Math.random() - 0.5) * 20   // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20   // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50   // z — deep tunnel

    // Alternate brand colors per particle
    const usePrimary = Math.random() > 0.5
    const color = new THREE.Color(
      usePrimary
        ? (brandColors?.primary ?? '#6366f1')
        : (brandColors?.accent  ?? '#4fffb0')
    )
    colors[i * 3]     = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  const particleGeo  = new THREE.BufferGeometry()
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particleGeo.setAttribute('color',    new THREE.BufferAttribute(colors,    3))

  const particleMat  = new THREE.PointsMaterial({
    size:         0.08,
    vertexColors: true,
    transparent:  true,
    opacity:      0.7,
    sizeAttenuation: true,
  })

  const particles = new THREE.Points(particleGeo, particleMat)
  scene.add(particles)

  // ── Floating objects along the path ──────────────────────────
  const floatingObjects: THREE.Mesh[] = []
  const geometries = [
    new THREE.IcosahedronGeometry(0.3, 0),
    new THREE.OctahedronGeometry(0.25, 0),
    new THREE.TetrahedronGeometry(0.28, 0),
  ]

  for (let i = 0; i < 20; i++) {
    const geo  = geometries[i % geometries.length]
    const mat  = new THREE.MeshPhongMaterial({
      color:       i % 2 === 0
        ? (brandColors?.accent  ?? '#4fffb0')
        : (brandColors?.primary ?? '#6366f1'),
      wireframe:   Math.random() > 0.5,
      transparent: true,
      opacity:     0.6,
    })
    const mesh = new THREE.Mesh(geo, mat)

    mesh.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      -i * 2.5
    )
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      0
    )
    scene.add(mesh)
    floatingObjects.push(mesh)
  }

  // ── Camera starting position ──────────────────────────────────
  camera.position.set(0, 0, 10)

  // ── Scroll-driven camera flight ───────────────────────────────
  const cameraProxy = {
    posZ:     10,
    posY:     0,
    posX:     0,
    rotX:     0,
    fogDensity: 0.08,
  }

  const cameraPath = config.cameraPath ?? {
    start: new THREE.Vector3(0, 0, 10),
    end:   new THREE.Vector3(0, 2, -40),
  }

  ScrollTrigger.create({
    trigger: container,
    start:   'top top',
    end:     'bottom bottom',
    scrub:   2,
    onUpdate: (self) => {
      const p = self.progress

      // Camera flies forward (negative Z) and rises slightly
      camera.position.z = THREE.MathUtils.lerp(cameraPath.start.z, cameraPath.end.z, p)
      camera.position.y = THREE.MathUtils.lerp(cameraPath.start.y, cameraPath.end.y, p)
      camera.position.x = Math.sin(p * Math.PI * 2) * 1.5  // gentle weave

      // Subtle rotation looking slightly ahead
      camera.rotation.x = p * 0.1
      camera.rotation.y = Math.sin(p * Math.PI) * 0.1

      // Fog clears as camera advances — reveals depth
      ;(scene.fog as THREE.FogExp2).density = THREE.MathUtils.lerp(0.12, 0.03, p)

      // Point lights follow camera position
      pointLight1.position.z = camera.position.z + 5
      pointLight2.position.z = camera.position.z - 5

      // Custom progress callback
      config.onProgress?.(p, scene)
    }
  })

  // ── Render loop (connected to Lenis — see section below) ──────
  let rafId: number
  const clock = new THREE.Clock()

  function tick() {
    const elapsed = clock.getElapsedTime()

    // Rotate floating objects
    floatingObjects.forEach((obj, i) => {
      obj.rotation.x += 0.003 * (i % 2 === 0 ? 1 : -1)
      obj.rotation.y += 0.005 * (i % 3 === 0 ? 1 : -1)
    })

    // Slowly rotate particle field
    particles.rotation.z = elapsed * 0.02

    renderer.render(scene, camera)
    rafId = requestAnimationFrame(tick)
  }

  tick()

  // ── Resize handler ────────────────────────────────────────────
  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    ScrollTrigger.refresh()
  }
  window.addEventListener('resize', onResize)

  // ── Cleanup ───────────────────────────────────────────────────
  function destroy() {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', onResize)
    renderer.dispose()
    particleGeo.dispose()
    particleMat.dispose()
    floatingObjects.forEach(obj => {
      obj.geometry.dispose()
      ;(obj.material as THREE.Material).dispose()
    })
    ScrollTrigger.getAll().forEach(t => t.kill())
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement)
    }
  }

  return { scene, camera, renderer, destroy }
}
```

```tsx
// React component wrapper — with error handling and mobile guard
'use client'
import { useEffect, useRef, useState } from 'react'
import { createWebGLScrollScene } from '@/lib/webglScrollScene'

export function WebGLScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [webglFailed, setWebglFailed] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Guard: skip WebGL on mobile — too heavy
    if (window.innerWidth < 768) {
      setWebglFailed(true)
      return
    }

    // Guard: check WebGL support before attempting
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) {
      setWebglFailed(true)
      console.warn('WebGL not supported — falling back to CSS background')
      return
    }

    let sceneCleanup: (() => void) | null = null

    try {
      const { destroy } = createWebGLScrollScene({
        container: containerRef.current,
        brandColors: {
          primary: '[BRAND_PRIMARY_HEX]',
          accent:  '[BRAND_ACCENT_HEX]',
        },
        onProgress: (p, scene) => {
          // Custom logic at specific scroll points
        }
      })
      sceneCleanup = destroy
    } catch (err) {
      console.error('WebGL scene failed to initialise:', err)
      setWebglFailed(true)
    }

    return () => {
      try {
        sceneCleanup?.()
      } catch (err) {
        console.warn('WebGL cleanup error (non-critical):', err)
      }
    }
  }, [])

  // Fallback: CSS aurora if WebGL unavailable
  if (webglFailed) {
    return (
      <div
        suppressHydrationWarning
        style={{
          position: 'sticky', top: 0,
          width: '100vw', height: '100vh',
          background: 'radial-gradient(ellipse at 20% 50%, [BRAND_PRIMARY_HEX]44, transparent 60%), #0a0f1e',
        }}
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      ref={containerRef}
      suppressHydrationWarning
      style={{ position: 'sticky', top: 0, width: '100vw', height: '100vh', zIndex: 0 }}
      aria-hidden="true"
    />
  )
}

// In the page — WebGL scene is sticky while content scrolls above it
// The section needs height for the scroll distance
export function WebGLScrollSection() {
  return (
    <section style={{ height: '400vh', position: 'relative' }}>
      <WebGLScrollHero />
      {/* Overlay content that appears on top of WebGL */}
      <div style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
        <h2 style={{ position: 'absolute', top: '50vh' }}>Scroll through the scene</h2>
      </div>
    </section>
  )
}
```

---

## SHADER + SCROLL — REALITY WARP EFFECT {#shader}

A GLSL fragment shader applied to a full-screen plane. Scroll progress
updates the shader uniforms — the image/background warps and distorts.

```typescript
// lib/shaderScroll.ts
import * as THREE from 'three'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Warp shader — distorts image with scroll-driven intensity
const warpFragmentShader = `
  uniform sampler2D uTexture;
  uniform float     uProgress;   // 0-1 scroll progress
  uniform float     uTime;       // elapsed time for wobble
  uniform vec2      uMouse;      // cursor position 0-1
  varying vec2      vUv;

  void main() {
    vec2 uv = vUv;

    // Warp intensity increases with scroll
    float warpStrength = uProgress * 0.06;

    // Barrel distortion — edges warp as center stays stable
    vec2 center = uv - 0.5;
    float dist  = length(center);
    uv += center * dist * warpStrength * 2.0;

    // Wave distortion — ripple across the image
    float wave = sin(uv.y * 20.0 + uTime * 1.5) * warpStrength * 0.3;
    uv.x += wave;

    // Chromatic aberration — splits RGB channels with scroll
    float aberration = uProgress * 0.008;
    vec4 r = texture2D(uTexture, uv + vec2( aberration, 0.0));
    vec4 g = texture2D(uTexture, uv);
    vec4 b = texture2D(uTexture, uv - vec2( aberration, 0.0));

    // Vignette darkens edges — intensifies with scroll
    float vignette = 1.0 - dist * uProgress * 1.5;
    vignette = clamp(vignette, 0.0, 1.0);

    gl_FragColor = vec4(r.r, g.g, b.b, 1.0) * vignette;
  }
`

// Noise / grain shader — adds cinematic grain that evolves with scroll
const grainFragmentShader = `
  uniform sampler2D uTexture;
  uniform float     uProgress;
  uniform float     uTime;
  varying vec2      vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec4 color = texture2D(uTexture, vUv);

    // Grain increases with scroll progress
    float grainAmount = uProgress * 0.15;
    float grain = random(vUv + uTime * 0.1) * grainAmount;

    // Film burn — slight warm shift at edges
    float dist = length(vUv - 0.5);
    float burn = dist * uProgress * 0.3;

    gl_FragColor = vec4(
      color.rgb + grain - burn,
      color.a
    );
  }
`

export function createShaderScroll(options: {
  container:   HTMLElement
  imageUrl:    string
  shader?:     'warp' | 'grain' | 'custom'
  customFrag?: string
}) {
  const { container, imageUrl, shader = 'warp', customFrag } = options

  const scene    = new THREE.Scene()
  const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  // Load texture
  const texture = new THREE.TextureLoader().load(imageUrl)

  const uniforms = {
    uTexture:  { value: texture },
    uProgress: { value: 0 },
    uTime:     { value: 0 },
    uMouse:    { value: new THREE.Vector2(0.5, 0.5) },
  }

  const frag = customFrag
    ?? (shader === 'grain' ? grainFragmentShader : warpFragmentShader)

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: frag,
    uniforms,
  })

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  scene.add(plane)

  // Scroll drives uProgress
  ScrollTrigger.create({
    trigger:  container,
    start:    'top bottom',
    end:      'bottom top',
    scrub:    1,
    onUpdate: (self) => {
      uniforms.uProgress.value = self.progress
    },
  })

  // Mouse drives uMouse
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect()
    uniforms.uMouse.value.x = (e.clientX - rect.left) / rect.width
    uniforms.uMouse.value.y = 1 - (e.clientY - rect.top) / rect.height
  })

  const clock = new THREE.Clock()
  let   rafId: number

  function tick() {
    uniforms.uTime.value = clock.getElapsedTime()
    renderer.render(scene, camera)
    rafId = requestAnimationFrame(tick)
  }
  tick()

  return {
    destroy: () => {
      cancelAnimationFrame(rafId)
      renderer.dispose()
      material.dispose()
      texture.dispose()
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement)
    }
  }
}
```

---

## THREE.JS + LENIS INTEGRATION (CRITICAL) {#lenis}

> **CANONICAL LENIS SETUP lives in `motion-code-library.md` → Global Setup section.**
> Do NOT create a second `initLenis()` — import from `lib/animation.ts`.
> This section covers the additional scroll proxy config needed when Three.js is present.

Without this integration Three.js and Lenis fight over the RAF loop and
ScrollTrigger reads the wrong scroll position. Animations stutter or skip.

```typescript
// lib/animation.ts — the ONE place Lenis is initialised (import everywhere else)
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export function initFullAnimationSystem() {
  const lenis = new Lenis({
    duration:        1.2,
    easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel:     true,
    wheelMultiplier: 0.8,
    touchMultiplier: 2,
  })

  // Connect Lenis scroll position to ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update)

  // Single RAF via GSAP ticker — Lenis and GSAP share one loop
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // Tell ScrollTrigger to read from Lenis — not window.scrollY
  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop: (value?: number) => {
      if (typeof value === 'number') {
        lenis.scrollTo(value, { immediate: true })
      }
      return lenis.scroll
    },
    getBoundingClientRect: () => ({
      top: 0, left: 0,
      width:  window.innerWidth,
      height: window.innerHeight,
    }),
  })

  // Three.js plug-in — use this instead of Three.js own RAF
  function connectThreeToGSAP(renderFn: (time: number) => void) {
    gsap.ticker.add(renderFn)
    return () => gsap.ticker.remove(renderFn)
  }

  return {
    lenis,
    connectThreeToGSAP,
    destroy: () => {
      lenis.destroy()
      gsap.ticker.lagSmoothing(60, 16)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }
}
```

**Three.js render loop — NEVER use its own RAF when Lenis is active:**

```typescript
// WRONG — competing RAF = jank
function animate() { requestAnimationFrame(animate); renderer.render(scene, camera) }
animate()

// CORRECT — one RAF via GSAP ticker
const { connectThreeToGSAP } = initFullAnimationSystem()
const disconnect = connectThreeToGSAP((_time) => {
  mesh.rotation.y += 0.01
  renderer.render(scene, camera)
})
// On unmount:
disconnect()
```

```typescript
// lib/animation.ts — the correct Lenis + Three.js + ScrollTrigger integration
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export function initFullAnimationSystem() {
  // 1. Create Lenis
  const lenis = new Lenis({
    duration:       1.2,
    easing:         (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel:    true,
    wheelMultiplier: 0.8,
    touchMultiplier: 2,
  })

  // 2. Connect Lenis scroll position to ScrollTrigger
  // CRITICAL: ScrollTrigger must read from Lenis, not window.scrollY
  lenis.on('scroll', ScrollTrigger.update)

  // 3. Connect Lenis to GSAP ticker (single RAF loop)
  // This prevents double-RAF which causes jank with Three.js
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })

  // 4. Disable GSAP's own lagSmoothing (Lenis handles this)
  gsap.ticker.lagSmoothing(0)

  // 5. Tell ScrollTrigger to use Lenis's scroll position
  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop:    (value) => {
      if (arguments.length) {
        lenis.scrollTo(value as number, { immediate: true })
      }
      return lenis.scroll
    },
    getBoundingClientRect: () => ({
      top: 0, left: 0,
      width:  window.innerWidth,
      height: window.innerHeight,
    }),
  })

  // 6. When Three.js canvas is present — sync its RAF with GSAP ticker
  // This prevents Three.js from creating its own RAF loop that fights Lenis
  function connectThreeToGSAP(threeRenderFn: (time: number) => void) {
    gsap.ticker.add(threeRenderFn)
    return () => gsap.ticker.remove(threeRenderFn)
  }

  return { lenis, connectThreeToGSAP }
}

// Usage in a component with both Lenis + Three.js
export function useAnimationSystem() {
  useEffect(() => {
    const { lenis, connectThreeToGSAP } = initFullAnimationSystem()

    // If Three.js scene exists — connect its render to GSAP ticker
    // const { renderer, scene, camera } = initThreeScene()
    // const disconnectThree = connectThreeToGSAP(() => renderer.render(scene, camera))

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 300)

    return () => {
      lenis.destroy()
      gsap.ticker.lagSmoothing(60, 16)  // restore defaults
      clearTimeout(refreshTimer)
      // disconnectThree()
    }
  }, [])
}
```

**Three.js render loop — NEVER use its own `requestAnimationFrame` when Lenis is active:**

```typescript
// WRONG — creates a competing RAF loop that fights Lenis
function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
animate() // ← never do this with Lenis

// CORRECT — plug Three.js into GSAP ticker
gsap.ticker.add(() => {
  // Update Three.js objects
  mesh.rotation.y += 0.01
  // Render
  renderer.render(scene, camera)
})
// To stop: gsap.ticker.remove(yourFunction)
```

---

## SCROLL SCENE STATE MACHINE {#statemachine}

For complex scrollytelling with distinct states (not just linear progress),
use a state machine that fires at specific scroll thresholds.

```typescript
// lib/scrollStateMachine.ts
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface ScrollState {
  id:       string
  start:    number  // 0-1 scroll progress
  end:      number  // 0-1 scroll progress
  onEnter:  (direction: 'forward' | 'backward') => void
  onLeave:  (direction: 'forward' | 'backward') => void
  onUpdate?: (progress: number) => void // 0-1 within this state
}

export function createScrollStateMachine(
  container: HTMLElement,
  states: ScrollState[]
) {
  states.forEach(state => {
    ScrollTrigger.create({
      trigger:  container,
      start:    `${state.start * 100}% top`,
      end:      `${state.end * 100}% top`,
      onEnter:       () => state.onEnter('forward'),
      onLeaveBack:   () => state.onLeave('backward'),
      onEnterBack:   () => state.onEnter('backward'),
      onLeave:       () => state.onLeave('forward'),
      onUpdate: (self) => {
        const localProgress = self.progress
        state.onUpdate?.(localProgress)
      },
    })
  })
}

// Example: 4 distinct story states across a page section
createScrollStateMachine(sectionEl, [
  {
    id:    'intro',
    start: 0,
    end:   0.25,
    onEnter:  () => showIntroContent(),
    onLeave:  () => hideIntroContent(),
    onUpdate: (p) => { introEl.style.opacity = String(1 - p * 2) }
  },
  {
    id:    'reveal',
    start: 0.25,
    end:   0.5,
    onEnter:  () => triggerRevealAnimation(),
    onLeave:  () => {},
    onUpdate: (p) => { revealEl.style.clipPath = `inset(0 ${(1-p)*100}% 0 0)` }
  },
  {
    id:    'feature',
    start: 0.5,
    end:   0.75,
    onEnter:  () => showFeatureCards(),
    onLeave:  () => hideFeatureCards(),
    onUpdate: (p) => updateFeatureProgress(p)
  },
  {
    id:    'cta',
    start: 0.75,
    end:   1.0,
    onEnter:  () => animateCTA(),
    onLeave:  () => {},
  }
])
```

---

## PERFORMANCE RULES FOR SCROLLYTELLING {#performance}

Scrollytelling is the most GPU/CPU-intensive pattern on the site.
Break any of these rules and you get jank.

```
COMPOSITOR-ONLY ANIMATIONS (60fps guaranteed)
  Use ONLY: transform (translate, scale, rotate) and opacity
  Never animate: width, height, top, left, margin, padding, border
  Never animate: background-color (use opacity on a colored overlay instead)
  Why: compositor-only props don't trigger layout recalculation

WILL-CHANGE (use sparingly — not on everything)
  Add to elements that animate on scroll:
    will-change: transform     ← for GSAP-animated elements
    will-change: opacity       ← for fade elements
  Never: will-change: all      ← GPU memory explosion
  Remove will-change after animation completes:
    el.style.willChange = 'auto'

RAF BUDGET
  One RAF loop total — Lenis + GSAP ticker handle it
  Three.js plugs into GSAP ticker (never its own RAF)
  Remotion is server-side — no RAF cost on live site

SCROLLTRIGGER REFRESH
  Call ScrollTrigger.refresh() after:
    - Fonts load (may change heights)
    - Images load (may change heights)
    - Dynamic content added to page
    - Window resize (ScrollTrigger handles this but verify)
  Wrap in setTimeout 100-300ms to let layout settle

MOBILE PERFORMANCE
  WebGL scroll scenes: disable on mobile (check window.innerWidth < 768)
  Shader effects: disable on mobile (GPU cost too high)
  Chapter snap + Observer: works well on mobile (touch-native)
  Parallax: reduce layers to 2 max on mobile (vs 4-5 on desktop)
  Master timeline scrub: works on mobile — no special handling needed

THREE.JS OPTIMIZATION
  Use BufferGeometry (never Geometry — deprecated)
  Dispose: geometry.dispose() + material.dispose() + texture.dispose()
  Reuse materials across similar meshes
  Use instanced rendering for 10+ identical objects
  Set renderer.setPixelRatio(Math.min(devicePixelRatio, 2)) — cap at 2x

GSAP SCROLLTRIGGER
  Use markers: true during dev to visualize trigger points
  Use invalidateOnRefresh: true for responsive layouts
  Use anticipatePin: 1 on pinned sections to prevent flash
  Use scrub: 1-2 not scrub: true (adds smooth lag)
```

---

## FRAMEWORK WRAPPERS {#wrappers}

### Next.js — Complete scrollytelling provider

```tsx
// providers/ScrollProvider.tsx
'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Observer } from 'gsap/Observer'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, Observer)

interface ScrollContextType {
  lenis:    Lenis | null
  progress: number        // 0-1 overall page scroll progress
}

const ScrollContext = createContext<ScrollContextType>({ lenis: null, progress: 0 })

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef    = useRef<Lenis | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const lenis = new Lenis({
      duration:        1.2,
      easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel:     true,
      wheelMultiplier: 0.8,
    })

    lenisRef.current = lenis

    lenis.on('scroll', ({ progress: p }: { progress: number }) => {
      setProgress(p)
      ScrollTrigger.update()
    })

    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop: (value) => {
        if (arguments.length) lenis.scrollTo(value as number, { immediate: true })
        return lenis.scroll
      },
      getBoundingClientRect: () => ({
        top: 0, left: 0,
        width:  window.innerWidth,
        height: window.innerHeight,
      }),
    })

    const timer = setTimeout(() => ScrollTrigger.refresh(), 300)

    return () => {
      lenis.destroy()
      gsap.ticker.lagSmoothing(60, 16)
      clearTimeout(timer)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <ScrollContext.Provider value={{ lenis: lenisRef.current, progress }}>
      {children}
    </ScrollContext.Provider>
  )
}

export const useScroll = () => useContext(ScrollContext)
```

```tsx
// app/layout.tsx — wrap everything
import { ScrollProvider } from '@/providers/ScrollProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ScrollProvider>
          {children}
        </ScrollProvider>
      </body>
    </html>
  )
}
```

### SvelteKit
```typescript
// lib/scroll.ts
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { writable } from 'svelte/store'

export const scrollProgress = writable(0)

export function initScroll() {
  const lenis = new Lenis({ duration: 1.2, smoothWheel: true })
  lenis.on('scroll', ({ progress }: { progress: number }) => {
    scrollProgress.set(progress)
    ScrollTrigger.update()
  })
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}
```

### Vue / Nuxt
```typescript
// plugins/scroll.client.ts
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  const lenis = new Lenis({ duration: 1.2, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)

  return { provide: { lenis } }
})
```

---

## MULTI_STATE_HERO {#multistategold}

The hero pins to the viewport. As the user scrolls, it cycles through
3–5 distinct message states — each a complete micro-story — before finally
releasing and allowing scroll to continue. This forces the user to engage
with the most important content before seeing anything else.

Used by Apple for every major product launch. Arguably the highest-converting
hero pattern on the web when the messaging sequence is strong.

**Content requirement:** Each state needs a complete message: headline + subline + optional visual.
States must build on each other — each one should make the next feel inevitable.

```typescript
// lib/multiStateHero.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface HeroState {
  headline:    string
  subline?:    string
  accent?:     string           // accent color shift per state
  visualClass?: string          // CSS class applied to visual element
}

export function initMultiStateHero(options: {
  containerEl:  HTMLElement     // the outer scroll container
  heroEl:       HTMLElement     // the pinned hero element
  states:       HeroState[]     // 3-5 states — no more, no less
  scrubHeight?: number          // vh per state (default: 100)
  onStateChange?: (index: number, direction: 1|-1) => void
}) {
  const { containerEl, heroEl, states, scrubHeight = 100, onStateChange } = options
  const totalHeight = states.length * scrubHeight

  // Set scroll container height
  containerEl.style.height = `${totalHeight}vh`

  // Hero sticks to viewport for the entire scroll distance
  heroEl.style.position = 'sticky'
  heroEl.style.top = '0'
  heroEl.style.height = '100dvh'
  heroEl.style.overflow = 'hidden'

  // Grab text elements
  const headline  = heroEl.querySelector<HTMLElement>('.hero-headline')
  const subline   = heroEl.querySelector<HTMLElement>('.hero-subline')
  const visual    = heroEl.querySelector<HTMLElement>('.hero-visual')
  const progress  = heroEl.querySelector<HTMLElement>('.hero-progress')

  let currentState = 0

  function transitionTo(index: number, direction: 1 | -1) {
    if (index === currentState || index < 0 || index >= states.length) return
    const prev = currentState
    currentState = index
    const state = states[index]

    const tl = gsap.timeline()

    // Exit current content
    tl.to([headline, subline].filter(Boolean), {
      opacity:   0,
      y:         direction === 1 ? -30 : 30,
      duration:  0.3,
      ease:      'power2.in',
    })

    // Update content mid-transition
    tl.add(() => {
      if (headline) headline.textContent = state.headline
      if (subline && state.subline) subline.textContent = state.subline
      if (visual && state.visualClass) {
        visual.className = `hero-visual ${state.visualClass}`
      }
      if (state.accent) {
        heroEl.style.setProperty('--hero-accent', state.accent)
      }

      // Update progress dots
      const dots = heroEl.querySelectorAll('.hero-progress-dot')
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === index)
      })
    })

    // Enter new content
    tl.fromTo([headline, subline].filter(Boolean), {
      opacity: 0,
      y:       direction === 1 ? 30 : -30,
    }, {
      opacity:  1,
      y:        0,
      duration: 0.5,
      ease:     'power3.out',
    })

    onStateChange?.(index, direction)
  }

  // Scroll drives state transitions
  const proxy = { stateIndex: 0 }

  ScrollTrigger.create({
    trigger:  containerEl,
    start:    'top top',
    end:      'bottom bottom',
    scrub:    false,            // not scrubbed — snaps between states
    onUpdate: (self) => {
      const targetState = Math.round(self.progress * (states.length - 1))
      if (targetState !== currentState) {
        const direction = targetState > currentState ? 1 : -1
        transitionTo(targetState, direction)
      }
    },
  })

  // Scroll indicator — show user there is more to scroll
  const indicator = heroEl.querySelector<HTMLElement>('.hero-scroll-indicator')
  ScrollTrigger.create({
    trigger:  containerEl,
    start:    'top top',
    end:      `${scrubHeight}vh top`,
    onLeave:  () => { if (indicator) indicator.style.opacity = '0' },
    onEnterBack: () => { if (indicator) indicator.style.opacity = '1' },
  })

  return {
    goTo: (index: number) => transitionTo(index, index > currentState ? 1 : -1),
    getCurrentState: () => currentState,
  }
}
```

```tsx
// components/sections/MultiStateHero.tsx
'use client'
import { useEffect, useRef } from 'react'
import { initMultiStateHero } from '@/lib/multiStateHero'

// States come from the locked Brand Brief + Storyline
const HERO_STATES = [
  {
    headline:    '[State 1 — core promise]',
    subline:     '[Supporting line — who this is for]',
    visualClass: 'state-1',
    accent:      'var(--color-accent)',
  },
  {
    headline:    '[State 2 — key proof point]',
    subline:     '[Specific number or outcome]',
    visualClass: 'state-2',
    accent:      'var(--color-primary)',
  },
  {
    headline:    '[State 3 — the invitation]',
    subline:     '[What happens when they act]',
    visualClass: 'state-3',
    accent:      'var(--color-accent)',
  },
]

export function MultiStateHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef      = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !heroRef.current) return

    const { goTo } = initMultiStateHero({
      containerEl: containerRef.current,
      heroEl:      heroRef.current,
      states:      HERO_STATES,
      scrubHeight: 80,   // 80vh per state = 240vh total for 3 states
    })

    return () => {
      // ScrollTrigger cleanup handled by scrollytelling system
    }
  }, [])

  return (
    // Outer container — provides scroll distance
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Inner hero — sticks to viewport */}
      <div ref={heroRef} suppressHydrationWarning
           style={{ display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '0 var(--container-px)' }}>

        {/* Progress dots — shows which state user is on */}
        <div className="hero-progress" style={{
          position: 'absolute', bottom: '2rem', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: '0.5rem',
        }}>
          {HERO_STATES.map((_, i) => (
            <div key={i} className={`hero-progress-dot ${i === 0 ? 'active' : ''}`}
                 style={{
                   width: '8px', height: '8px', borderRadius: '50%',
                   background: 'rgba(255,255,255,0.3)',
                   transition: 'background 0.3s ease, transform 0.3s ease',
                 }} />
          ))}
        </div>

        {/* Content — updated by JS on state transition */}
        <div className="hero-visual state-1" style={{ marginBottom: '3rem' }} />

        <h1 className="hero-headline" suppressHydrationWarning
            style={{ fontSize: 'var(--type-display)', textAlign: 'center',
                     fontWeight: 900, lineHeight: 1.05 }}>
          {HERO_STATES[0].headline}
        </h1>

        <p className="hero-subline" suppressHydrationWarning
           style={{ fontSize: 'var(--type-h3)', textAlign: 'center',
                    color: 'var(--color-text-muted)', maxWidth: '50ch',
                    marginTop: '1rem' }}>
          {HERO_STATES[0].subline}
        </p>

        {/* Scroll hint — fades out after first state */}
        <div className="hero-scroll-indicator"
             style={{ position: 'absolute', bottom: '4rem',
                      fontSize: '0.875rem', color: 'var(--color-text-muted)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '0.5rem',
                      transition: 'opacity 0.3s ease' }}>
          <span>Scroll to explore</span>
          <div style={{ width: '1px', height: '40px',
                        background: 'var(--color-text-muted)',
                        animation: 'scroll-line 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    </div>
  )
}
```

**Content rules for MULTI_STATE_HERO:**
- Exactly 3–5 states. Never fewer (not enough story), never more (user fatigues)
- Each headline: 4–8 words maximum. This is forced — transitions happen fast
- States must build a sequential argument: Promise → Proof → Invitation
- Never repeat a word between states — each state must feel distinctly different
- State 1: hooks (the promise). State 2: proves (the evidence). Final state: invites (the CTA)
