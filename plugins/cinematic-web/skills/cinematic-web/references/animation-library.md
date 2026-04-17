# Cinematic Web — Animation Library Reference

## TABLE OF CONTENTS
1. [Animation Selection Flow](#flow)
2. [Hero Animations](#hero) (6 types)
3. [Scroll Animations](#scroll) (7 types)
4. [3D & Interaction Animations](#3d) (6 types)
5. [Transition Animations](#transition) (4 types)
6. [Micro-interactions](#micro) (4 types)
7. [Paradigm × Animation Pairing Matrix](#matrix)
8. [Per-Section Default Recommendations](#sections)
9. [Motion Token System](#tokens)

---

## ANIMATION SELECTION FLOW {#flow}

In Phase 2, AFTER the Paradigm Brief is confirmed:

1. **Auto-recommend** a full animation stack based on paradigm + industry
2. Present it as the **Animation Plan** — one entry per page section
3. User can override any section's animation before proceeding
4. Lock the plan → Scene concepts are generated with this plan baked in

### Animation Plan Format

```
╔══════════════════════════════════════════════════════════════╗
║  ANIMATION PLAN — [Project Name]                            ║
║  Paradigm: [Paradigm] | Intensity: [N] | Lib: GSAP + Lenis ║
╠══════════════════════════════════════════════════════════════╣
║  SECTION          │ BEHAVIOR               │ CLASS  │ CODE  ║
╠══════════════════════════════════════════════════════════════╣
║  Page Enter       │ IMMERSIVE_ZOOM         │ A      │ FULL  ║
║  Hero             │ MULTI_STATE_HERO       │ E      │ FULL  ║
║  Hero BG          │ DEPTH_PARALLAX (layer) │ A      │ FULL  ║
║  Hero 3D          │ FLOATING_3D_ANCHOR     │ F      │ FULL  ║
║  Features         │ PROGRESSIVE_DISCLOSURE │ E      │ FULL  ║
║  Stats/Metrics    │ COUNTER_CINEMA         │ G      │ GEN   ║
║  Testimonials     │ INFINITE_LOOP_TRACK    │ H      │ FULL  ║
║  CTA              │ CINEMATIC_CURTAIN      │ C      │ FULL  ║
╠══════════════════════════════════════════════════════════════╣
║  Thread (all)     │ PROGRESS_THREAD        │ F      │ GEN   ║
║  FX (all)         │ GRAIN_REACTIVE         │ I      │ GEN   ║
║  Cursor           │ Custom cursor + trail  │ D      │ FULL  ║
║  Headlines        │ BLUR_FOCUS_TEXT        │ G      │ FULL  ║
║  Page transition  │ WIPE_TRANSITION        │ C      │ GEN   ║
╚══════════════════════════════════════════════════════════════╝
CODE: FULL = ready in reference files | GEN = written fresh in Phase 5
⚠ NOTE: [GSAP Club or paid plugin requirements flagged here]
Override any section? Type "change [section] to [behavior name]"
Or confirm to lock this plan.
```

**What makes a strong animation plan:**
- Hero uses a Class E or G behavior (not just parallax layers)
- At least one Class F thread behavior runs through all sections
- At least one Class I FX layer applied site-wide
- Typography has a named G-class reveal on every headline
- No two adjacent sections share the same behavior class

---

## HERO ANIMATIONS {#hero}

---

### IMMERSIVE ZOOM

**What it looks like:** Page loads completely dark/black. Over 1.5–2.5 seconds,
the scene slowly pushes in from the background — like a camera moving forward
through space. Text and UI fade in during or after the zoom.

**Best paradigm pairing:** Glassmorphism, Spatial Design, Aurora/Mesh
**Performance cost:** Low — CSS transform only

**GSAP Implementation:**
```javascript
// Immersive Zoom — hero entrance
gsap.timeline({ defaults: { ease: 'power2.out' }})
  .fromTo('.hero-scene', {
    scale: 1.12,
    opacity: 0,
  }, {
    scale: 1,
    opacity: 1,
    duration: 2.4,
  })
  .fromTo('.hero-headline', {
    opacity: 0,
    y: 24,
    filter: 'blur(8px)',
  }, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 1,
    stagger: 0.12,
  }, '-=1.2'); // overlap with zoom
```

**CSS support variables:**
```css
.hero-scene {
  will-change: transform, opacity;
  transform-origin: center center;
}
```

---

### SCROLL-SCRUBBED VIDEO

**What it looks like:** The hero video pauses on first frame. As the user scrolls
down, the video plays forward frame-by-frame — tied exactly to scroll position.
Scrolling back reverses the video. Like Apple's product reveal pages.

**Best paradigm pairing:** Motion Design System, Spatial Design, Skeuomorphism
**Performance cost:** Medium — requires requestAnimationFrame loop
**Warning:** Video must be stripped of audio, encoded at consistent bitrate for smooth scrub

**GSAP Implementation:**
```javascript
// Scroll-Scrubbed Video
const video = document.querySelector('.scrub-video');
video.pause();

gsap.to(video, {
  currentTime: video.duration,
  ease: 'none',
  scrollTrigger: {
    trigger: '.scrub-section',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1, // smooth scrub lag (seconds)
    pin: true,
  }
});

// Preload video for smooth scrub
video.addEventListener('loadedmetadata', () => {
  // Force decode all frames
  video.currentTime = 0.01;
});
```

**HTML:**
```html
<section class="scrub-section">
  <video class="scrub-video" muted playsinline preload="auto"
         src="[cloudinary-url]/f_auto,vc_auto,q_auto/video/scrub.mp4">
  </video>
</section>
```

---

### DEPTH PARALLAX

**What it looks like:** Multiple image/element layers in the hero each move at
different speeds on scroll — creating an illusion of 3D depth. Background moves
slowest, foreground fastest. Creates a "window into a world" feeling.

**Best paradigm pairing:** Glassmorphism, Spatial Design, Maximalism
**Performance cost:** Low-Medium — use transform not top/left

**GSAP Implementation:**
```javascript
// Depth Parallax — multi-layer
const layers = [
  { el: '.parallax-bg',   speed: 0.2 },  // slowest
  { el: '.parallax-mid',  speed: 0.5 },  // medium
  { el: '.parallax-fg',   speed: 0.8 },  // fastest
  { el: '.parallax-text', speed: 1.1 },  // beyond scroll speed
];

layers.forEach(({ el, speed }) => {
  gsap.to(el, {
    yPercent: -30 * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  });
});
```

---

### CINEMATIC CURTAIN

**What it looks like:** Two vertical panels cover the hero on page load.
They slide apart (left panel slides left, right panel slides right) revealing
the scene beneath — like a theatre curtain or a film clapperboard opening.

**Best paradigm pairing:** Brutalism, Motion Design System, Luxury/Skeuomorphism
**Performance cost:** Low — clip-path or translateX

**GSAP Implementation:**
```javascript
// Cinematic Curtain Reveal
const tl = gsap.timeline({ delay: 0.3 });

tl.to('.curtain-left', {
    xPercent: -100,
    duration: 1.2,
    ease: 'power4.inOut',
  })
  .to('.curtain-right', {
    xPercent: 100,
    duration: 1.2,
    ease: 'power4.inOut',
  }, '<') // same time as left
  .fromTo('.hero-content', {
    opacity: 0,
    scale: 0.96,
  }, {
    opacity: 1,
    scale: 1,
    duration: 0.8,
    ease: 'power2.out',
  }, '-=0.4');
```

**HTML Structure:**
```html
<div class="curtain-left"></div>   <!-- position: fixed, width: 50vw, left: 0 -->
<div class="curtain-right"></div>  <!-- position: fixed, width: 50vw, right: 0 -->
<section class="hero">
  <div class="hero-content">...</div>
</section>
```

---

### GRAVITY DROP

**What it looks like:** Headline words or characters fall from above the viewport,
decelerate, and land with a slight bounce — like physical objects dropping.
Can be per-word (dramatic) or per-character (intense/techy).

**Best paradigm pairing:** Brutalism, Claymorphism, Motion Design System
**Performance cost:** Low — CSS transform
**Note:** Per-character split requires GSAP SplitText (Club, $99/yr) OR manual span wrapping

**GSAP Implementation (manual word split — free):**
```javascript
// Gravity Drop — word by word (no SplitText needed)
const headline = document.querySelector('.hero-headline');
const words = headline.textContent.split(' ');
headline.innerHTML = words
  .map(word => `<span class="word" style="display:inline-block; overflow:hidden">
    <span class="word-inner" style="display:inline-block">${word}</span>
  </span>`)
  .join(' ');

gsap.fromTo('.word-inner', {
  yPercent: -120,
  opacity: 0,
}, {
  yPercent: 0,
  opacity: 1,
  duration: 0.9,
  ease: 'bounce.out', // or 'elastic.out(1, 0.5)' for springy
  stagger: 0.08,
  scrollTrigger: {
    trigger: '.hero-headline',
    start: 'top 85%',
  }
});
```

---

### MAGNETIC REVEAL

**What it looks like:** Hero content is invisible on load. As the user moves
their cursor across the screen, the hero content appears — following or
responding to cursor position. Premium, unexpected, interactive from first touch.

**Best paradigm pairing:** Motion Design System, Spatial Design, Agency/Brutalism
**Performance cost:** Low — JS mousemove + GSAP
**Mobile fallback:** Standard fade-in on load (no cursor on touch devices)

**Implementation:**
```javascript
// Magnetic Reveal
const hero = document.querySelector('.magnetic-hero');
const content = document.querySelector('.hero-content');

// Only on non-touch devices
if (window.matchMedia('(hover: hover)').matches) {
  gsap.set(content, { opacity: 0 });

  hero.addEventListener('mousemove', (e) => {
    const { clientX: x, clientY: y } = e;
    const { width, height } = hero.getBoundingClientRect();
    const xRatio = x / width;
    const yRatio = y / height;

    gsap.to(content, {
      opacity: 1,
      x: (xRatio - 0.5) * 30,
      y: (yRatio - 0.5) * 20,
      duration: 0.6,
      ease: 'power2.out',
    });
  });

  hero.addEventListener('mouseleave', () => {
    gsap.to(content, { x: 0, y: 0, opacity: 0.3, duration: 0.8 });
  });
} else {
  // Touch fallback
  gsap.set(content, { opacity: 1 });
}
```

---

## SCROLL ANIMATIONS {#scroll}

---

### PIN & ZOOM (Scroll Storytelling)

**What it looks like:** A section pins in place (stays fixed to viewport) while
the user scrolls. During that pinned scroll distance, the content inside zooms in,
animates, or tells a story. Scroll distance = story timeline.

**GSAP Implementation:**
```javascript
// Pin & Zoom — section stays while content animates on scroll
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.pin-section',
    start: 'top top',
    end: '+=200%',       // pins for 2x the viewport height of scroll
    scrub: 1,
    pin: true,
    anticipatePin: 1,
  }
});

tl.fromTo('.zoom-target', { scale: 1 }, { scale: 1.8, ease: 'none' })
  .fromTo('.reveal-text', { opacity: 0, y: 40 }, { opacity: 1, y: 0 }, 0.3);
```

---

### HORIZONTAL TRACK

**What it looks like:** While the page scrolls vertically, a row of cards/items
moves horizontally — like a conveyor belt or film strip. The user scrolls down
but content moves sideways.

**GSAP Implementation:**
```javascript
// Horizontal Track
const cards = gsap.utils.toArray('.track-card');
const totalWidth = cards.length * (cardWidth + gap);

gsap.to('.track-container', {
  x: -(totalWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.track-section',
    start: 'top top',
    end: () => `+=${totalWidth}`,
    scrub: 1,
    pin: true,
  }
});
```

---

### STAGGER CASCADE

**What it looks like:** Cards or elements appear one after another as user
scrolls — each slightly offset in time and direction. Creates rhythm and energy.

**GSAP Implementation:**
```javascript
// Stagger Cascade
gsap.fromTo('.cascade-item', {
  opacity: 0,
  y: 60,
  scale: 0.95,
}, {
  opacity: 1,
  y: 0,
  scale: 1,
  duration: 0.7,
  ease: 'power3.out',
  stagger: 0.12,
  scrollTrigger: {
    trigger: '.cascade-section',
    start: 'top 75%',
    toggleActions: 'play none none reverse',
  }
});
```

---

### COUNTER ROLL

**What it looks like:** Numbers animate from 0 (or a lower value) to their final
value as the section enters the viewport. Creates impact for statistics and metrics.

**GSAP Implementation:**
```javascript
// Counter Roll — no plugin needed
document.querySelectorAll('.counter').forEach(el => {
  const target = parseInt(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';

  gsap.fromTo({ val: 0 }, { val: target }, {
    duration: 2,
    ease: 'power2.out',
    onUpdate: function() {
      el.textContent = prefix + Math.round(this.targets()[0].val).toLocaleString() + suffix;
    },
    scrollTrigger: {
      trigger: el,
      start: 'top 80%',
      once: true,
    }
  });
});
```

**HTML:**
```html
<span class="counter" data-target="12000" data-prefix="" data-suffix="+">0+</span>
```

---

### SECTION WIPE

**What it looks like:** The next section wipes over the current one — like a
film transition. Can be directional (left, right, up, down) or use clip-path
for more dynamic shapes (diagonal, radial, iris).

**GSAP Implementation:**
```javascript
// Section Wipe — clip-path transition
const sections = gsap.utils.toArray('.wipe-section');

sections.forEach((section, i) => {
  if (i === 0) return;
  gsap.fromTo(section, {
    clipPath: 'inset(0 100% 0 0)',  // hidden right
  }, {
    clipPath: 'inset(0 0% 0 0)',    // fully visible
    ease: 'power4.inOut',
    duration: 1,
    scrollTrigger: {
      trigger: section,
      start: 'top 60%',
      toggleActions: 'play none none reverse',
    }
  });
});
```

---

### TEXT REVEAL (Cinematic)

**What it looks like:** Text lines reveal from behind a mask — characters or
words slide upward into view as if printed by an unseen press. Elegant, editorial.

**GSAP Implementation (no SplitText — free):**
```javascript
// Cinematic Text Reveal — line by line
document.querySelectorAll('.reveal-text').forEach(el => {
  // Wrap each line in overflow:hidden container
  const lines = el.innerHTML.split('<br>');
  el.innerHTML = lines
    .map(line => `<div class="line-wrap" style="overflow:hidden">
      <div class="line-inner">${line}</div>
    </div>`)
    .join('');

  gsap.fromTo(el.querySelectorAll('.line-inner'), {
    yPercent: 105,
  }, {
    yPercent: 0,
    duration: 0.9,
    ease: 'power4.out',
    stagger: 0.1,
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
    }
  });
});
```

---

### SCROLL-LINKED 3D

**What it looks like:** A Three.js or Spline 3D scene rotates, advances, or
transforms as the user scrolls. The 3D animation is a function of scroll position.

**Three.js + GSAP Implementation:**
```javascript
// Scroll-Linked 3D rotation
import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Assume scene, camera, renderer already initialized
const rotationProxy = { y: 0, x: 0 };

gsap.to(rotationProxy, {
  y: Math.PI * 2,    // full rotation on scroll
  x: Math.PI * 0.3,
  ease: 'none',
  scrollTrigger: {
    trigger: '.threejs-section',
    start: 'top center',
    end: 'bottom center',
    scrub: 1,
    onUpdate: () => {
      mesh.rotation.y = rotationProxy.y;
      mesh.rotation.x = rotationProxy.x;
      renderer.render(scene, camera);
    }
  }
});
```

---

## 3D & INTERACTION ANIMATIONS {#3d}

---

### 3D CARD HOVER

**What it looks like:** Cards tilt in the direction of the cursor on hover —
simulating a physical card being tilted toward a light source. Subtle but
instantly makes cards feel tactile and premium.

**Pure CSS + JS (no library needed):**
```javascript
// 3D Card Hover
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -12; // max 12deg tilt
    const rotateY = (x - centerX) / centerX * 12;

    card.style.transform =
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.transition = 'transform 0.1s ease';

    // Optional: move highlight with cursor
    const highlight = card.querySelector('.card-highlight');
    if (highlight) {
      highlight.style.opacity = '1';
      highlight.style.background =
        `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 60%)`;
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    card.style.transition = 'transform 0.5s ease';
    const highlight = card.querySelector('.card-highlight');
    if (highlight) highlight.style.opacity = '0';
  });
});
```

**CSS:**
```css
.tilt-card {
  transform-style: preserve-3d;
  will-change: transform;
}
.card-highlight {
  position: absolute; inset: 0;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
```

---

### CURSOR GRAVITY

**What it looks like:** Elements (buttons, icons, headings) subtly pull toward
the cursor as it approaches — like magnetic attraction. Elements spring back when
cursor leaves. Feels alive and premium.

**Implementation:**
```javascript
// Cursor Gravity — magnetic element attraction
document.querySelectorAll('.magnetic').forEach(el => {
  const strength = parseFloat(el.dataset.strength) || 0.4;

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    gsap.to(el, {
      x: dx * strength,
      y: dy * strength,
      duration: 0.4,
      ease: 'power2.out',
    });
  });

  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  });
});
```

**HTML:** `<button class="magnetic cta-btn" data-strength="0.3">Get Started</button>`

---

### LIQUID DISTORTION (WebGL)

**What it looks like:** Images or video warp and distort on hover — like
looking through water, heat haze, or a lens. Achieved via WebGL fragment shader.

**Three.js Shader Implementation:**
```javascript
// Liquid Distortion — GLSL fragment shader on image plane
const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float dist = distance(uv, uMouse);
    float strength = uHover * (1.0 / (dist * 8.0 + 1.0)) * 0.04;
    uv.x += sin(uv.y * 20.0 + uTime) * strength;
    uv.y += cos(uv.x * 20.0 + uTime) * strength;
    gl_FragColor = texture2D(uTexture, uv);
  }
`;
// Full implementation: load texture, create PlaneGeometry, animate uTime/uMouse uniforms
```

**Performance warning:** One shader per section max. GPU-intensive on mobile.
Always wrap in: `if (!window.matchMedia('(hover: hover)').matches) return;`

---

### PARTICLE SCATTER

**What it looks like:** On hover or click, elements disintegrate into particles
that scatter outward and then reform. Or particles drift continuously in the
background. Three.js particle system.

**Three.js Implementation (ambient particles):**
```javascript
// Ambient particle field
const geometry = new THREE.BufferGeometry();
const count = 2000;
const positions = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
}
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  size: 0.015,
  color: new THREE.Color(brandAccentHex),
  transparent: true,
  opacity: 0.6,
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Animate — gentle drift
function tick() {
  particles.rotation.y += 0.0003;
  particles.rotation.x += 0.0001;
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
```

---

## TRANSITION ANIMATIONS {#transition}

---

### PAGE TRANSITION (Route Change)

**Framework implementations:**

**Next.js (Framer Motion):**
```jsx
// app/layout.tsx
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  enter:   { opacity: 1, y: 0,  filter: 'blur(0px)',
             transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] }},
  exit:    { opacity: 0, y: -20, filter: 'blur(4px)',
             transition: { duration: 0.3 }},
};

export default function Layout({ children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.main variants={pageVariants} initial="initial"
                   animate="enter" exit="exit">
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
```

**Astro (View Transitions):**
```astro
---
import { ViewTransitions } from 'astro:transitions';
---
<head>
  <ViewTransitions />
</head>
<!-- Elements animate automatically. Custom: -->
<div transition:animate="slide">...</div>
<div transition:animate={customAnimation}>...</div>
```

---

## MICRO-INTERACTIONS {#micro}

### Custom Cursor
```javascript
// Custom branded cursor
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');

document.addEventListener('mousemove', (e) => {
  gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.5, ease: 'power2.out' });
  gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.1 });
});

// Expand on hover over interactive elements
document.querySelectorAll('a, button, .tilt-card').forEach(el => {
  el.addEventListener('mouseenter', () =>
    gsap.to(cursor, { scale: 2.5, duration: 0.3 }));
  el.addEventListener('mouseleave', () =>
    gsap.to(cursor, { scale: 1, duration: 0.3 }));
});
```

### Scroll Progress Indicator
```javascript
// Scroll progress bar
gsap.to('.progress-bar', {
  scaleX: 1,
  ease: 'none',
  transformOrigin: 'left center',
  scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 0.3 }
});
```

---

## PARADIGM × ANIMATION PAIRING MATRIX {#matrix}

| Animation Type | Glass | Neuro | Skeu | Clay | Brutal | Spatial | Motion | Data | Max | Aurora |
|---|---|---|---|---|---|---|---|---|---|---|
| Immersive Zoom | ★★★★★ | ★★ | ★★★ | ★★ | ★★★ | ★★★★★ | ★★★★ | ★★★ | ★★★ | ★★★★★ |
| Scroll Video | ★★★★ | ★★ | ★★★★ | ★★ | ★★ | ★★★★★ | ★★★★★ | ★★★ | ★★★ | ★★★ |
| Depth Parallax | ★★★★★ | ★★ | ★★★ | ★★★ | ★★ | ★★★★★ | ★★★★ | ★★ | ★★★★ | ★★★★★ |
| Curtain Reveal | ★★★ | ★★ | ★★★★ | ★★ | ★★★★★ | ★★★ | ★★★★★ | ★★ | ★★★★ | ★★★ |
| Gravity Drop | ★★★ | ★★ | ★★ | ★★★★★ | ★★★★★ | ★★★ | ★★★★ | ★★ | ★★★★ | ★★★ |
| 3D Card Hover | ★★★★★ | ★★★ | ★★★★ | ★★★★ | ★★ | ★★★★★ | ★★★★ | ★★★ | ★★★ | ★★★★ |
| Cursor Gravity | ★★★★ | ★★★ | ★★★ | ★★★ | ★★★★ | ★★★★★ | ★★★★★ | ★★★ | ★★★ | ★★★★ |
| Counter Roll | ★★ | ★★★ | ★★ | ★★ | ★★★★ | ★★★ | ★★★★ | ★★★★★ | ★★ | ★★ |
| Particle Scatter | ★★★★ | ★★ | ★★ | ★★★ | ★★★ | ★★★★★ | ★★★★ | ★★★★★ | ★★★ | ★★★★★ |
| Liquid Distort | ★★★★ | ★★ | ★★★★ | ★★ | ★★ | ★★★★ | ★★★★★ | ★★ | ★★★★ | ★★★★★ |

---

## PER-SECTION DEFAULT RECOMMENDATIONS {#sections}

When skill auto-recommends an animation plan, use this table as the base,
then modify based on paradigm pairing AND locked storyline behavior.
Override options now include all 9 behavior classes.

| Section | Default Animation | Override Options (any behavior class) |
|---|---|---|
| **Page Enter** | Immersive Zoom | Cinematic Curtain, CINEMATIC_BARS (Class I), Fade |
| **Hero** | Depth Parallax bg + Text Reveal | MULTI_STATE_HERO (E), BLUR_FOCUS_TEXT (G), FRAME_SCROLL (A), WebGL Camera Flight |
| **Hero 3D** | Cursor Gravity | FLOATING_3D_ANCHOR (F), Particle Scatter, Orbital |
| **Nav** | Fade Down on load | VELOCITY_TILT (I), Magnetic links hover |
| **Features** | Stagger Cascade | PROGRESSIVE_DISCLOSURE (E), INFINITE_LOOP_TRACK (H), Pin & Zoom |
| **Stats/Metrics** | Counter Roll | COUNTER_CINEMA (G), STICKY_COUNTER (F), Data chart draw |
| **Testimonials** | Horizontal Track | INFINITE_LOOP_TRACK (H), Stagger Cascade |
| **Portfolio/Work** | Horizontal Track | DEPTH_CARDS_3D (H), DRAG_EXPLORE (H), MASONRY_BUILD (H) |
| **About/Story** | Gravity Drop | STORY_SCROLL (C), VARIABLE_FONT_ANIMATE (G), BLUR_FOCUS_TEXT (G) |
| **Philosophy/Mission** | Master Timeline | TEXT_CINEMATIC (E), TEXT_MASK_REVEAL (G), WORD_STREAM (C) |
| **CTA** | Cinematic Curtain | MULTI_STATE_HERO (E), Immersive Zoom, VIGNETTE_REACTIVE (I) |
| **Footer** | Simple CSS fade | None — keep footer lightweight |
| **Page transition** | Framer fade+blur | WIPE_TRANSITION (C), GLITCH_TRANSITION (I), Section Wipe |
| **Cursor** | Custom cursor | CURSOR_TRAIL (D), CURSOR_SPOTLIGHT (I), CURSOR_DISTORT (I), Magnetic |
| **Hover (cards)** | 3D Card Hover | MAGNETIC_CARDS (B), ELASTIC_DRAG (B), Scale, Glow |
| **Background FX** | None | COLOR_TEMP_SHIFT (I), GRAIN_REACTIVE (I), AURORA_REACTIVE (D), NOISE_WAVE (D) |
| **Ambient layer** | None | FLOATING_3D_ANCHOR (F), AMBIENT_3D_FIELD (F), PROGRESS_THREAD (F) |

---

## SECTION VISUAL IDENTITY SYSTEM {#identity}

**This is mandatory.** Animation variety alone is not enough.
Every section must have its own visual personality — background, layout density,
type scale, color temperature, spacing rhythm, and component treatment.
Adjacent sections must NEVER share the same visual identity.
A site where every section looks like the same template is a generic site,
regardless of how good the animations are.

---

### Step 1 — Ask the User: Site Intensity Level

After the Animation Plan is confirmed (Phase 1.6), ask ONE question:

```
How intense should the visual variety be across sections?

  [1] CONSERVATIVE — Cohesive and refined. Sections share the same
      visual language but differ in layout and spacing. Safe for
      corporate, fintech, healthcare clients.

  [2] BALANCED — Distinct sections with clear personality shifts.
      Background treatments vary. Type scale contrasts. Some sections
      feel light, some heavy. Best for most projects.

  [3] BOLD — Significant contrast between sections. Dark/light flips.
      Full-bleed imagery mixed with stark whitespace. Layout grid breaks
      intentionally. Best for agencies, luxury, creative brands.

  [4] WILD — Maximum visual contrast. Each section is its own world.
      Unexpected layout shifts. Color explosions next to monochrome.
      Type at extreme scale. Sections that break the grid entirely.
      Best for portfolios, music, fashion, experimental brands.

Type 1, 2, 3, or 4 — or describe a mix (e.g. "3 for hero, 2 for the rest").
```

Store the answer in the ledger: `"siteIntensity": 3`

---

### Step 2 — Section Identity Cards

After intensity is set, generate a **Section Identity Card** for every section
on the page. Each card defines the visual personality of that section — not
just its animation.

#### Section Identity Card Template

```
SECTION: [Section name]
INTENSITY ROLE: [Anchor / Contrast / Breathing / Climax — see roles below]
─────────────────────────────────────────────────────
BACKGROUND:    [solid / gradient / image / video / texture / none]
               Color: [specific hex or CSS var]
               Treatment: [full bleed / contained / split / layered]

LAYOUT:        [single column / two column / asymmetric / full bleed / broken grid]
               Density: [open / balanced / dense / packed]
               Max-width: [contained 1280px / edge-to-edge / custom]

TYPOGRAPHY:    [Display / Editorial / Body / Mono / Mixed]
               H size: [clamp values — e.g. clamp(3rem, 8vw, 8rem)]
               Weight contrast: [heavy heading + light body / all heavy / all light]
               Color: [on-brand / inverted / accent / muted]

SPACING:       [tight (40px) / standard (80px) / generous (120px) / cinematic (160px+)]
               Vertical rhythm: [uniform / varied / intentionally broken]

COLOR TEMP:    [Cool / Neutral / Warm / Mixed]
               Brightness: [Dark / Mid / Light / High contrast]

COMPONENT STYLE: [Cards: glass / solid / outlined / naked / mixed]
                  [Images: contained / bleeding / overlapping / masked]
                  [Dividers: none / line / shape / color shift]

SPECIAL TREATMENT: [Any section-specific effect — grain overlay, noise,
                    split-color text, giant type behind content, etc.]

MOTION ASSIGNED: [from Animation Plan]
─────────────────────────────────────────────────────
CONTRAST CHECK: Previous section was [X] → this section is [Y] → contrast: [HIGH/MED/LOW]
If contrast is LOW → revise this section's identity before proceeding.
```

---

### Section Intensity Roles

Every section on the page plays one of four roles. No two adjacent sections
should share the same role. Use this to plan the full page rhythm:

**ANCHOR** — The section that establishes the baseline. Usually the hero.
Dense, dark, high-impact. Sets the visual register for the whole page.

**CONTRAST** — Deliberately breaks from what came before. If the hero is dark
and maximal, the contrast section is light and minimal. Or vice versa.
These create visual breathing room and make the eye reset.

**BREATHING** — Low-key, open, generous whitespace. Lets content speak.
No heavy backgrounds. Type-forward. Recovers the user's attention after
high-stimulus sections. Every page needs at least 1–2 of these.

**CLIMAX** — Second peak. Usually the CTA section or a key feature reveal.
Should match or exceed hero intensity. Not as long — short, punchy, high-contrast.
The page should have only one climax — more than one dilutes both.

**Typical 5-section page rhythm:**
```
Hero          → ANCHOR
Features      → BREATHING
Case Studies  → CONTRAST
Testimonials  → BREATHING
CTA           → CLIMAX
```

**Typical 8-section agency page rhythm:**
```
Hero          → ANCHOR    (dark, maximal, cinematic)
Social Proof  → BREATHING (light, open, logos only)
Services      → CONTRAST  (mid, editorial, type-heavy)
Selected Work → CLIMAX    (dark, full-bleed, immersive)
Process       → BREATHING (light, diagram-forward)
About         → CONTRAST  (warm, human, photography)
Testimonials  → BREATHING (neutral, quote-forward)
CTA           → CLIMAX    (dark, electric accent, direct)
```

---

### Intensity Level Blueprints

Use these as starting points when generating Section Identity Cards.

#### Level 1 — CONSERVATIVE

```
Adjacent sections differ by: layout and spacing only
Background: 2–3 values maximum (dark bg, white bg, subtle surface)
Type scale: consistent across sections (minor variation only)
Color: brand palette used consistently, no surprises
Section transitions: subtle fade or slide
Wild elements: none
```

#### Level 2 — BALANCED

```
Adjacent sections differ by: background + layout + type weight
Dark sections alternate with light sections regularly
Background: image or texture used in 1–2 sections
Type scale: hero gets display-scale, body sections get normal scale
Color: one section may use accent color as background
Section transitions: clean cuts or subtle wipes
Wild elements: one section may break the grid slightly
```

#### Level 3 — BOLD

```
Adjacent sections differ by: everything — color, density, layout, type
Dark/light alternation is the deliberate structural device
Full-bleed photography or video appears in 2–3 sections
Type scale: dramatic contrast — some sections use 10vw+ headlines
Color: one section inverts the palette entirely
Layout: at least one section breaks the container (bleeds to edge)
Section transitions: hard cuts, color flips, or shape wipes
Wild elements: one section has an unexpected layout (diagonal, overlap, etc.)
```

#### Level 4 — WILD

```
Adjacent sections: each is visually its own world
No two sections share the same background type
Type: extreme scale contrast — some sections have 1 word at 20vw
Color: does not need to follow the brand palette consistently
Layout: grid breaks are features, not bugs — overlapping, rotated, stacked
Textures: grain, noise, scanlines, halftone — used liberally
One section may feel like a completely different site intentionally
Section transitions: dramatic — full-color screen wipes, shape morphs
Wild elements: everything. Typography as image. Image as background. Text as texture.
```

---

### Adjacent Section Contrast Rules (Always Enforce)

Before finalising any Section Identity Card, check the pair:

```
DARK → must be followed by LIGHT or MID (never another DARK)
LIGHT → can be followed by DARK, MID, or ACCENT-BG
FULL BLEED IMAGE → must be followed by a text-forward, open section
DENSE (packed content) → must be followed by OPEN (generous whitespace)
HIGH TYPE SCALE (display) → must be followed by NORMAL type scale
ANIMATION-HEAVY → must be followed by CALM or STATIC section
HORIZONTAL scroll → must be followed by VERTICAL scroll section
```

Violation of any of these rules = revise the offending section's identity
before generating any code.

---

### Per-Section CSS Architecture

Each section gets its own CSS class with identity tokens — not just animation classes.
This is how visual variety is enforced in the code itself:

```css
/* ── Section Identity Token System ─────────────────────────── */

/* ANCHOR — hero or equivalent */
.section-anchor {
  --section-bg:       var(--color-bg);          /* dark */
  --section-text:     var(--color-text);
  --section-density:  dense;
  --section-py:       clamp(6rem, 12vw, 14rem);
  --section-type-scale: 1.4;                    /* larger than base */
}

/* BREATHING — open, light, recovers attention */
.section-breathing {
  --section-bg:       var(--color-surface);     /* light */
  --section-text:     var(--color-text);
  --section-density:  open;
  --section-py:       clamp(5rem, 10vw, 10rem);
  --section-type-scale: 1.0;
}

/* CONTRAST — flips from previous */
.section-contrast {
  --section-bg:       var(--color-surface-2);   /* mid */
  --section-text:     var(--color-text);
  --section-density:  balanced;
  --section-py:       clamp(4rem, 8vw, 8rem);
  --section-type-scale: 1.2;
}

/* CLIMAX — second peak, punchy */
.section-climax {
  --section-bg:       var(--color-accent);      /* accent color */
  --section-text:     var(--color-bg);          /* inverted */
  --section-density:  dense;
  --section-py:       clamp(6rem, 10vw, 12rem);
  --section-type-scale: 1.3;
}

/* ── Apply tokens inside each section ──────────────────────── */
section {
  background:  var(--section-bg);
  color:       var(--section-text);
  padding-block: var(--section-py);
}

/* Type scale modifier — applied per section */
.section-anchor h2   { font-size: calc(var(--type-h2) * var(--section-type-scale)); }
.section-climax h2   { font-size: calc(var(--type-h2) * var(--section-type-scale)); }
```

---

### Wild Section Patterns (Level 3–4 only)

Use these when intensity is 3 or 4. Each is a distinct visual device:

**Giant Background Type**
```css
/* Massive text behind content — creates depth and texture */
.section-giant-bg-type {
  position: relative;
  overflow: hidden;
}
.section-giant-bg-type::before {
  content: attr(data-bg-word); /* e.g. data-bg-word="SEEN" */
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(12rem, 30vw, 40rem);
  font-weight: 900;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255,255,255,0.06);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}
```

**Split Color Section**
```css
/* Left half one color, right half another — bold contrast */
.section-split {
  background: linear-gradient(
    to right,
    var(--color-bg) 50%,
    var(--color-surface) 50%
  );
}
```

**Diagonal Section Break**
```css
/* Section ends diagonally instead of horizontally */
.section-diagonal {
  clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%);
  margin-bottom: -4rem; /* overlap next section */
  padding-bottom: 8rem;
}
```

**Full Bleed Type**
```css
/* Single word or short phrase at extreme scale, full-bleed */
.section-type-bleed {
  display: grid;
  place-items: center;
  min-height: 60vh;
  overflow: hidden;
}
.section-type-bleed h2 {
  font-size: clamp(6rem, 18vw, 22rem);
  line-height: 0.85;
  text-align: center;
  width: 100%;
}
```

**Broken Grid Overlap**
```css
/* Elements intentionally break out of their container */
.section-broken-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  position: relative;
}
.broken-grid__image {
  grid-column: 1 / 8;
  grid-row: 1;
  z-index: 1;
}
.broken-grid__content {
  grid-column: 5 / 13; /* overlaps the image */
  grid-row: 1;
  z-index: 2;
  align-self: center;
  background: var(--section-bg);
  padding: 3rem;
}
```

---

## MOTION TOKEN SYSTEM {#tokens}

Always output this token block as part of the global CSS regardless of paradigm:

```css
:root {
  /* ─── DURATION TOKENS ──────────────────────────────── */
  --dur-instant:  0ms;
  --dur-fast:     150ms;
  --dur-standard: 300ms;
  --dur-slow:     500ms;
  --dur-crawl:    800ms;
  --dur-cinema:   1200ms;

  /* ─── EASING TOKENS ───────────────────────────────── */
  --ease-snap:    cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);
  --ease-cinema:  cubic-bezier(0.76, 0, 0.24, 1);
  --ease-elastic: cubic-bezier(0.68, -0.55, 0.27, 1.55);
  --ease-bounce:  cubic-bezier(0.34, 1.7, 0.64, 1);

  /* ─── MOTION SCALE (respects user preference) ─────── */
  --motion-scale: 1; /* Set to 0 via JS when prefers-reduced-motion */
}

/* Reduced motion — respects OS setting */
@media (prefers-reduced-motion: reduce) {
  :root { --motion-scale: 0; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## CLASS G — TYPOGRAPHY BEHAVIORS {#typography-behaviors}

### TEXT_MASK_REVEAL

Text hidden behind a growing shape that reveals on scroll.

```typescript
// lib/textMaskReveal.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initTextMaskReveal(sectionEl: HTMLElement) {
  const textEl = sectionEl.querySelector<HTMLElement>('.mask-text')
  const maskEl = sectionEl.querySelector<HTMLElement>('.mask-shape')
  if (!textEl || !maskEl) return

  // Set initial state — mask covers text
  gsap.set(maskEl, { scale: 0, transformOrigin: 'center center' })
  gsap.set(textEl, { clipPath: 'circle(0% at 50% 50%)' })

  ScrollTrigger.create({
    trigger:  sectionEl,
    start:    'top 70%',
    end:      'center center',
    scrub:    1,
    onUpdate: (self) => {
      const p = self.progress
      // Grow clip circle from 0 to fully revealed
      textEl.style.clipPath = `circle(${p * 75 + 5}% at 50% 50%)`
      // Mask shape shrinks as text reveals
      gsap.set(maskEl, { scale: 1 - p, opacity: 1 - p * 0.8 })
    }
  })
}
```

```css
.mask-text { color: var(--color-text); }
.mask-shape {
  position: absolute; inset: 0;
  background: var(--color-accent);
  border-radius: 50%;
  transform-origin: center;
}
```

---

### BLUR_FOCUS_TEXT

Headline sharpens from blur into focus as section enters.

```typescript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initBlurFocusText(sectionEl: HTMLElement) {
  const targets = sectionEl.querySelectorAll('[data-blur-focus]')

  targets.forEach((el, i) => {
    const delay = i * 0.08

    ScrollTrigger.create({
      trigger:  sectionEl,
      start:    'top 80%',
      end:      'top 20%',
      scrub:    1.5,
      onUpdate: (self) => {
        const blur = Math.max(0, (1 - self.progress) * 16)
        ;(el as HTMLElement).style.filter    = `blur(${blur}px)`
        ;(el as HTMLElement).style.opacity   = `${0.2 + self.progress * 0.8}`
        ;(el as HTMLElement).style.transform =
          `translateY(${(1 - self.progress) * 20}px)`
      }
    })
  })
}
```

```html
<h2 data-blur-focus>Your headline here</h2>
<p data-blur-focus>Your subline here</p>
```

---

### VARIABLE_FONT_ANIMATE

Font weight/width shifts on scroll. Requires a variable font with `wght` axis.

```typescript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initVariableFontAnimate(options: {
  trigger:   HTMLElement
  target:    HTMLElement
  weightRange?: [number, number]  // [min, max] e.g. [100, 900]
  widthRange?:  [number, number]  // [min, max] e.g. [75, 125] (requires wdth axis)
}) {
  const { trigger, target, weightRange = [100, 900], widthRange } = options

  ScrollTrigger.create({
    trigger,
    start:   'top bottom',
    end:     'bottom top',
    scrub:   2,
    onUpdate: (self) => {
      const weight = weightRange[0] + (weightRange[1] - weightRange[0]) * self.progress
      let settings = `"wght" ${Math.round(weight)}`
      if (widthRange) {
        const width = widthRange[0] + (widthRange[1] - widthRange[0]) * self.progress
        settings += `, "wdth" ${Math.round(width)}`
      }
      target.style.fontVariationSettings = settings
    }
  })
}
```

```css
/* Load a variable font that supports wght axis */
@font-face {
  font-family: 'BrandVariable';
  src: url('/fonts/brand-variable.woff2') format('woff2 supports variations'),
       url('/fonts/brand-variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}
.variable-headline {
  font-family: 'BrandVariable', sans-serif;
  font-variation-settings: "wght" 100;   /* starts thin */
}
```

---

### INFINITE_LOOP_TRACK (Class H)

Seamlessly looping horizontal content track. Built on GSAP ticker — not CSS animation.

```typescript
import gsap from 'gsap'

export function initInfiniteTrack(options: {
  trackEl:    HTMLElement     // the track container
  speed?:     number          // px per second (default: 80)
  direction?: 1 | -1          // 1 = left to right, -1 = right to left
  pauseOnHover?: boolean
}) {
  const { trackEl, speed = 80, direction = -1, pauseOnHover = true } = options

  // Clone items for seamless loop
  const items  = Array.from(trackEl.children) as HTMLElement[]
  const clones  = items.map(item => item.cloneNode(true) as HTMLElement)
  clones.forEach(c => trackEl.appendChild(c))

  const totalWidth = items.reduce((sum, el) => sum + el.offsetWidth, 0)
  let currentX     = 0
  let paused       = false

  const tick = (_time: number, deltaTime: number) => {
    if (paused) return
    currentX += (deltaTime / 1000) * speed * direction

    // Reset for seamless loop
    if (direction === -1 && currentX < -totalWidth) currentX += totalWidth
    if (direction ===  1 && currentX >  totalWidth) currentX -= totalWidth

    trackEl.style.transform = `translateX(${currentX}px)`
  }

  gsap.ticker.add(tick)

  if (pauseOnHover) {
    trackEl.addEventListener('mouseenter', () => { paused = true })
    trackEl.addEventListener('mouseleave', () => { paused = false })
  }

  return () => gsap.ticker.remove(tick)
}
```

```tsx
// Usage — multiple tracks, opposite directions
<div className="tracks-wrapper" style={{ overflow: 'hidden', padding: '2rem 0' }}>
  <div ref={track1Ref} style={{ display: 'flex', gap: '2rem', width: 'max-content' }}>
    {logos.map(l => <img key={l} src={l} alt="" style={{ height: '40px' }} />)}
  </div>
  <div ref={track2Ref} style={{ display: 'flex', gap: '2rem', width: 'max-content',
                                 marginTop: '1.5rem' }}>
    {stats.map(s => <div key={s}>{s}</div>)}
  </div>
</div>
```

---

## CLASS I — VISUAL FX BEHAVIORS {#visual-fx}

### COLOR_TEMP_SHIFT

Page color temperature transitions across sections — cold to warm or warm to cold.

```typescript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initColorTempShift(options: {
  coldColor: string   // hex — problem/start sections
  warmColor: string   // hex — solution/CTA sections
  property?: string   // CSS custom property to animate (default: --page-temp-bg)
}) {
  const { coldColor, warmColor, property = '--page-temp-overlay' } = options

  // Interpolate between cold and warm as user scrolls entire page
  ScrollTrigger.create({
    trigger:  document.body,
    start:    'top top',
    end:      'bottom bottom',
    scrub:    3,   // slow, gradual shift
    onUpdate: (self) => {
      const p = self.progress
      // Linear interpolation between cold and warm
      const cold = parseInt(coldColor.slice(1), 16)
      const warm = parseInt(warmColor.slice(1), 16)

      const r = Math.round(((cold >> 16) & 0xff) * (1-p) + ((warm >> 16) & 0xff) * p)
      const g = Math.round(((cold >>  8) & 0xff) * (1-p) + ((warm >>  8) & 0xff) * p)
      const b = Math.round(((cold       ) & 0xff) * (1-p) + ((warm       ) & 0xff) * p)

      document.documentElement.style.setProperty(
        property,
        `rgba(${r},${g},${b},${0.04 + p * 0.06})`  // subtle overlay
      )
    }
  })
}
```

```css
/* Apply as a fixed overlay */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: var(--page-temp-overlay, transparent);
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: color;  /* blend mode preserves content */
}
```

---

### CINEMATIC_BARS

Letterbox bars that appear as user scrolls deeper. The site "becomes a film."

```typescript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initCinematicBars(options: {
  maxBarHeight?: number  // px at maximum (default: 60)
  startAt?:      number  // 0-1 scroll progress to begin appearing (default: 0.1)
}) {
  const { maxBarHeight = 60, startAt = 0.1 } = options

  // Create the bars
  const topBar = document.createElement('div')
  const botBar = document.createElement('div')
  const styles: Partial<CSSStyleDeclaration> = {
    position:   'fixed',
    left:       '0',
    right:      '0',
    background: '#000',
    zIndex:     '9998',
    pointerEvents: 'none',
    height:     '0px',
    transition: 'none',
  }
  Object.assign(topBar.style, styles, { top: '0' })
  Object.assign(botBar.style, styles, { bottom: '0' })
  document.body.appendChild(topBar)
  document.body.appendChild(botBar)

  ScrollTrigger.create({
    trigger:  document.body,
    start:    'top top',
    end:      'bottom bottom',
    scrub:    2,
    onUpdate: (self) => {
      // Build up from startAt, peak at 70%, retract at 90% (CTA section opens up)
      let barProgress = 0
      if (self.progress > startAt && self.progress < 0.9) {
        barProgress = Math.min(1, (self.progress - startAt) / 0.5)
      } else if (self.progress >= 0.9) {
        barProgress = Math.max(0, 1 - (self.progress - 0.9) / 0.1)
      }

      const h = `${barProgress * maxBarHeight}px`
      topBar.style.height = h
      botBar.style.height = h
    }
  })

  return () => {
    topBar.remove()
    botBar.remove()
  }
}
```

---

### VELOCITY_TILT

Elements physically tilt based on how fast you scroll — not just position.

```typescript
import gsap from 'gsap'
import Lenis from 'lenis'

export function initVelocityTilt(options: {
  targets:     string    // CSS selector for elements to tilt
  maxTilt?:    number    // max degrees (default: 3)
  smoothing?:  number    // 0-1 how quickly it follows (default: 0.08)
}) {
  const { targets, maxTilt = 3, smoothing = 0.08 } = options

  const elements = document.querySelectorAll<HTMLElement>(targets)
  let  currentVelocity = 0
  let  targetVelocity  = 0
  let  lastScrollY     = window.scrollY

  const tick = () => {
    const scrollY    = window.scrollY
    const rawVel     = (scrollY - lastScrollY)
    lastScrollY      = scrollY

    // Smooth the velocity
    targetVelocity = rawVel
    currentVelocity += (targetVelocity - currentVelocity) * smoothing

    const tilt = Math.max(-maxTilt, Math.min(maxTilt, currentVelocity * 0.3))

    elements.forEach(el => {
      el.style.transform = `perspective(1000px) rotateX(${-tilt}deg)`
    })
  }

  gsap.ticker.add(tick)
  return () => gsap.ticker.remove(tick)
}
```

---

### DEPTH_OF_FIELD

Elements at different visual depths blur/sharpen as the page scrolls.

```typescript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Mark elements with data-depth="0.2" (0=sharp/foreground, 1=blurred/background)
export function initDepthOfField(sectionEl: HTMLElement) {
  const elements = sectionEl.querySelectorAll<HTMLElement>('[data-depth]')

  elements.forEach(el => {
    const depth    = parseFloat(el.dataset.depth ?? '0')
    const maxBlur  = depth * 8   // deeper = more blur

    ScrollTrigger.create({
      trigger:  sectionEl,
      start:    'top bottom',
      end:      'bottom top',
      scrub:    1,
      onUpdate: (self) => {
        // Blur peaks when section is far from center of viewport
        const distanceFromCenter = Math.abs(self.progress - 0.5) * 2
        const blur = distanceFromCenter * maxBlur
        el.style.filter  = `blur(${blur}px)`
        el.style.opacity = `${1 - distanceFromCenter * depth * 0.4}`
      }
    })
  })
}
```

```html
<!-- Usage: data-depth controls blur amount (0 = foreground/sharp, 1 = background/blurry) -->
<div class="section-hero">
  <div data-depth="0">Main headline — always sharp</div>
  <div data-depth="0.3">Secondary content — slight blur when off-center</div>
  <div data-depth="0.8">Background image — heavily blurred when off-center</div>
</div>
```

---

### CHROMATIC_ABERRATION (CSS-based)

RGB channel split that increases with scroll velocity. No WebGL required.

```css
/* In globals.css — the overlay technique */
.chromatic-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9997;
  /* Updated via JS */
}
```

```typescript
import gsap from 'gsap'

export function initChromaticAberration(options: {
  maxOffset?: number   // max px offset (default: 4)
  decay?:     number   // how fast it decays (default: 0.85)
}) {
  const { maxOffset = 4, decay = 0.85 } = options

  let velocity     = 0
  let lastScrollY  = window.scrollY
  let currentAb    = 0

  // Apply to specific elements marked with data-chromatic
  const targets = document.querySelectorAll<HTMLElement>('[data-chromatic]')

  const tick = () => {
    const scrollY = window.scrollY
    velocity      = scrollY - lastScrollY
    lastScrollY   = scrollY
    currentAb     = currentAb * decay + Math.abs(velocity) * (1 - decay)

    const offset = Math.min(maxOffset, currentAb * 0.4)

    targets.forEach(el => {
      if (offset < 0.5) {
        el.style.textShadow = 'none'
        return
      }
      // Separate R and B channels via text-shadow trick
      el.style.textShadow = `
        ${offset}px  0 rgba(255, 0, 0, 0.4),
        ${-offset}px 0 rgba(0, 0, 255, 0.4)
      `
    })
  }

  gsap.ticker.add(tick)
  return () => gsap.ticker.remove(tick)
}
```

---

### GLITCH_TRANSITION

Digital corruption effect between sections.

```typescript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initGlitchTransition(sectionEl: HTMLElement, options?: {
  duration?: number   // ms (default: 400)
  intensity?: number  // 1-10 (default: 5)
}) {
  const { duration = 400, intensity = 5 } = options ?? {}

  let triggered = false

  const runGlitch = () => {
    if (triggered) return
    triggered = true

    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      pointer-events: none; overflow: hidden;
    `
    document.body.appendChild(overlay)

    const steps = Math.floor(intensity * 3)
    const tl    = gsap.timeline({
      onComplete: () => {
        overlay.remove()
        setTimeout(() => { triggered = false }, 2000)
      }
    })

    // Generate glitch slices
    for (let i = 0; i < steps; i++) {
      const slice    = document.createElement('div')
      const sliceH   = Math.random() * 60 + 10
      const sliceTop = Math.random() * 100
      const offset   = (Math.random() - 0.5) * intensity * 20

      slice.style.cssText = `
        position: absolute;
        top: ${sliceTop}vh; height: ${sliceH}px;
        left: 0; right: 0;
        background: var(--color-accent);
        transform: translateX(${offset}px);
        opacity: 0.6;
        mix-blend-mode: difference;
      `
      overlay.appendChild(slice)

      tl.fromTo(slice,
        { scaleX: 1, opacity: 0.6 },
        { scaleX: 0, opacity: 0, duration: duration / 1000 * 0.3,
          delay: (i / steps) * (duration / 1000 * 0.6),
          ease: 'steps(3)' },
        0
      )
    }
  }

  ScrollTrigger.create({
    trigger:  sectionEl,
    start:    'top 60%',
    onEnter:  runGlitch,
  })
}
```

---

## IMPLEMENTATION STATUS — ALL BEHAVIORS {#status}

This table shows which behaviors have full code vs need Phase 5 generation.
When Phase 5 implements a behavior marked [GENERATE], Claude Code writes
fresh implementation code based on the behavior description in scene-prompts.md.

```
CLASS A — FRAME-SCROLL / SCRUB
  FRAME_SCROLL           [FULL CODE]  scrollytelling.md → Frame Extraction
  IMMERSIVE_ZOOM         [FULL CODE]  animation-library.md → Immersive Zoom
  PARALLAX_DEPTH         [FULL CODE]  animation-library.md → Depth Parallax
  DEPTH_LAYERS           [FULL CODE]  scrollytelling.md → Progress-Aware Sections
  SCROLL_WARP            [FULL CODE]  scrollytelling.md → Shader + Scroll
  PIN_REVEAL             [FULL CODE]  animation-library.md → Pin & Zoom
  SECTION_MORPH          [FULL CODE]  animation-library.md → Section Identity

CLASS B — OBJECT / PHYSICS
  EXPLODING_OBJECT       [FULL CODE]  animation-library.md → Particle Scatter
  GRAVITY_SCATTER        [FULL CODE]  animation-library.md → Gravity Drop
  MAGNETIC_PULL          [FULL CODE]  animation-library.md → Cursor Gravity
  ORBITAL_SPIN           [FULL CODE]  motion-code-library.md → Scroll-Linked 3D
  LIQUID_MORPH           [FULL CODE]  animation-library.md → Liquid Distortion
  MAGNETIC_CARDS         [FULL CODE]  animation-library.md → 3D Card Hover
  ELASTIC_DRAG           [GENERATE]   GSAP + CSS perspective. Use cursor position + spring lerp.
  WEIGHT_DROP            [GENERATE]   GSAP Gravity Drop with elasticity: 2, power: 4.

CLASS C — CINEMATIC / NARRATIVE
  CURTAIN_CUT            [FULL CODE]  animation-library.md → Cinematic Curtain
  DOLLY_PUSH             [FULL CODE]  animation-library.md → Pin & Zoom
  STORY_SCROLL           [FULL CODE]  scrollytelling.md → Horizontal Story Scroll
  CHAPTER_SNAP           [FULL CODE]  scrollytelling.md → Chapter Snap
  TYPEWRITER_REVEAL      [FULL CODE]  remotion-layer.md → TypeReveal
  WORD_STREAM            [FULL CODE]  scrollytelling.md → Master Timeline
  SCRAMBLE_TEXT          [GENERATE]   Cycle through random chars before resolving. 60fps interval.
  WIPE_TRANSITION        [GENERATE]   clip-path: inset(0 100% 0 0) → inset(0 0% 0 0) on enter.

CLASS D — ENVIRONMENTAL / AMBIENT
  AURORA_REACTIVE        [FULL CODE]  animation-library.md → Aurora/Mesh
  PARTICLE_FIELD         [FULL CODE]  animation-library.md → Particle Scatter
  NOISE_WAVE             [FULL CODE]  animation-library.md → Liquid Distortion
  BREATHING_SCALE        [FULL CODE]  animation-library.md → Breathing Scale
  CURSOR_TRAIL           [FULL CODE]  animation-library.md → Cursor Gravity
  CURSOR_SPOTLIGHT       [GENERATE]   radial-gradient centered on cursor, mix-blend-mode: screen.
  CURSOR_DISTORT         [GENERATE]   SVG feTurbulence filter updated on mousemove via JS.
  AMBIENT_VIDEO_REACT    [GENERATE]   video.playbackRate + filter: hue-rotate tied to scroll.

CLASS E — STORY / SEQUENTIAL
  MULTI_STATE_HERO       [FULL CODE]  scrollytelling.md → Multi-State Hero
  PROGRESSIVE_DISCLOSURE [FULL CODE]  scrollytelling.md → Progress-Aware Sections
  TEXT_CINEMATIC         [FULL CODE]  scrollytelling.md → Master Timeline (text-only)
  SCROLL_COUNTDOWN       [GENERATE]   ScrollTrigger scrub → SVG circle stroke-dashoffset or counter.
  STORY_BEAT             [GENERATE]   Chapter Snap variant. Pin between beats, gsap.timeline per beat.

CLASS F — PERSISTENT / THREAD
  FLOATING_3D_ANCHOR     [FULL CODE]  motion-code-library.md → Floating 3D Anchor
  PROGRESS_THREAD        [GENERATE]   Fixed vertical line, height = scrollProgress * 100vh.
  STICKY_COUNTER         [GENERATE]   Fixed element, value updates via ScrollTrigger onUpdate.
  AMBIENT_3D_FIELD       [FULL CODE]  scrollytelling.md → WebGL Scroll Scene
  SCROLL_COMPANION       [GENERATE]   Absolute positioned element, Y = scroll * 0.8. CSS only or GSAP.

CLASS G — TYPOGRAPHY / TEXT
  TEXT_MASK_REVEAL       [FULL CODE]  animation-library.md → Class G Typography
  VARIABLE_FONT_ANIMATE  [FULL CODE]  animation-library.md → Class G Typography
  KINETIC_TYPE           [GENERATE]   Matter.js + canvas. Import matter-js, create bodies per char.
  BLUR_FOCUS_TEXT        [FULL CODE]  animation-library.md → Class G Typography
  STAGGER_LINES          [FULL CODE]  animation-library.md → Stagger Cascade
  OVERSIZED_BG_TYPE      [FULL CODE]  animation-library.md → Wild Patterns
  SCRAMBLE_REVEAL        [GENERATE]   Same as SCRAMBLE_TEXT but character-by-character left to right.
  COUNTER_CINEMA         [GENERATE]   GSAP counter with elastic overshoot: gsap.to({val:0},{val:target, ease:'elastic.out(1,0.4)'})

CLASS H — LAYOUT / SPATIAL
  SPLIT_SCREEN_SCROLL    [GENERATE]   Two cols, each with independent ScrollTrigger scrub.
  INFINITE_LOOP_TRACK    [FULL CODE]  animation-library.md → Class H Layout
  DRAG_EXPLORE           [GENERATE]   Pointer events + inertia. GSAP Draggable plugin (Club).
  DEPTH_CARDS_3D         [GENERATE]   CSS perspective + translateZ per card. Hover: card comes forward.
  ACCORDION_RICH         [GENERATE]   max-height: 0 → max-height: 1000px + GSAP height tween.
  MASONRY_BUILD          [GENERATE]   Masonry grid + GSAP stagger from above with bounce ease.
  STICKY_SIDE_PANEL      [GENERATE]   position: sticky, top: 0. ScrollTrigger updates panel content.
  CIRCULAR_ARRANGEMENT   [GENERATE]   Items positioned with sin/cos. Rotation via scroll progress.

CLASS I — VISUAL FX
  CHROMATIC_ABERRATION   [FULL CODE]  animation-library.md → Class I Visual FX
  GRAIN_REACTIVE         [GENERATE]   SVG feTurbulence baseFrequency updated on scroll velocity.
  COLOR_TEMP_SHIFT       [FULL CODE]  animation-library.md → Class I Visual FX
  GLITCH_TRANSITION      [FULL CODE]  animation-library.md → Class I Visual FX
  CINEMATIC_BARS         [FULL CODE]  animation-library.md → Class I Visual FX
  DEPTH_OF_FIELD         [FULL CODE]  animation-library.md → Class I Visual FX
  VELOCITY_TILT          [FULL CODE]  animation-library.md → Class I Visual FX
  INK_SPREAD             [GENERATE]   SVG mask circle radius animated via GSAP on section enter.
  VIGNETTE_REACTIVE      [GENERATE]   Fixed radial-gradient overlay. Opacity tied to section role.
```

**[GENERATE] behaviors in Phase 5:**
When Phase 5 generates code for a [GENERATE] behavior, the implementation
note above tells Claude Code the exact approach. Write fresh, clean code
using that note as the starting point. Never say "implementation not available."
