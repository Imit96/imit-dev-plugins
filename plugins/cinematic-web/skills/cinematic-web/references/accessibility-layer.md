# Cinematic Web — Accessibility Layer

## TABLE OF CONTENTS
1. [Phase 5.6 — Accessibility Flow](#flow)
2. [WCAG 2.1 AA Compliance Checklist](#wcag)
3. [Color Contrast System](#contrast)
4. [ARIA Patterns for Cinematic Components](#aria)
5. [Keyboard Navigation System](#keyboard)
6. [Screen Reader Patterns](#screenreader)
7. [Reduced Motion System](#motion)
8. [Focus Management](#focus)
9. [Form Accessibility](#forms)
10. [Accessibility Testing Tools](#testing)

---

## PHASE 5.6 — ACCESSIBILITY FLOW {#flow}

Run alongside Phase 5 code generation. Accessibility is not an afterthought —
it is built into every component as it is generated.

**Non-negotiables (always implement regardless of budget/timeline):**
- prefers-reduced-motion respected by ALL animations
- Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI
- All images have meaningful alt text
- All interactive elements keyboard accessible
- Single H1 per page, logical heading hierarchy

**Warn user if design paradigm creates accessibility risk:**
- Neumorphism → naturally low contrast (always flag)
- Glassmorphism on light bg → text over glass can fail contrast
- Custom cursor → must not replace default cursor for keyboard users
- Video autoplay → must be muted, must have pause control

---

## WCAG 2.1 AA COMPLIANCE CHECKLIST {#wcag}

### Perceivable
```
IMAGES & MEDIA
[ ] All <img> have descriptive alt text (empty alt="" only for decorative images)
[ ] Videos have captions or transcripts (if content-bearing)
[ ] Decorative video/animation: aria-hidden="true"
[ ] Background images: text over them passes contrast (≥4.5:1)
[ ] Icons: either aria-label or aria-hidden + adjacent visible text

COLOR & CONTRAST
[ ] Body text on background: ≥ 4.5:1 contrast ratio
[ ] Large text (18pt+): ≥ 3:1 contrast ratio
[ ] UI components (borders, focus rings): ≥ 3:1 contrast ratio
[ ] Text does not depend on color alone to convey meaning
[ ] Charts/graphs: not color-only differentiation (use pattern + label)

ADAPTABLE CONTENT
[ ] Page content meaningful when CSS disabled
[ ] Reading order in DOM matches visual order
[ ] Responsive: content reflows at 320px width without horizontal scroll
[ ] Text can be resized 200% without loss of content
```

### Operable
```
KEYBOARD ACCESS
[ ] All interactive elements reachable via Tab
[ ] Tab order follows logical visual flow
[ ] No keyboard traps (user can always Tab away)
[ ] Custom components implement ARIA keyboard patterns (see ARIA section)
[ ] Keyboard shortcuts documented if used

FOCUS INDICATORS
[ ] Visible focus indicator on every focusable element
[ ] Focus indicator passes 3:1 contrast against adjacent colors
[ ] Never: outline: none without a custom replacement

TIMING & MOTION
[ ] No content flashes more than 3 times per second
[ ] Auto-playing video: user can pause/stop/hide it
[ ] Moving content: can be paused (via prefers-reduced-motion or button)
[ ] Session timeouts: user warned 20 seconds before timeout

NAVIGATION
[ ] Skip to main content link (first focusable element on page)
[ ] Page title is descriptive and unique
[ ] Navigation consistent across pages
[ ] Current page indicated in nav (aria-current="page")
```

### Understandable
```
LANGUAGE
[ ] lang attribute on <html>: <html lang="en">
[ ] Lang changes for phrases in other languages: lang="fr"

ERROR HANDLING (FORMS)
[ ] Errors identified in text (not color alone)
[ ] Error messages describe what went wrong AND how to fix
[ ] Required fields indicated before submission
[ ] Labels associated with inputs (not placeholder-only)

PREDICTABLE
[ ] No unexpected context changes on focus
[ ] Nav consistent across all pages
[ ] Components that look the same behave the same
```

### Robust
```
[ ] Valid HTML (no broken tags, duplicate IDs)
[ ] ARIA roles, states, and properties used correctly
[ ] Status messages programmatically determinable (aria-live)
[ ] Works with NVDA + Chrome, VoiceOver + Safari (test these two)
```

---

## COLOR CONTRAST SYSTEM {#contrast}

### Contrast Calculation Helper
```typescript
// lib/accessibility.ts
function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(hex1: string, hex2: string): number {
  const parse = (hex: string) => {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return luminance(r, g, b);
  };
  const l1 = parse(hex1);
  const l2 = parse(hex2);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

export function checkContrast(textHex: string, bgHex: string) {
  const ratio = contrastRatio(textHex, bgHex);
  return {
    ratio: ratio.toFixed(2),
    aaLargeText:  ratio >= 3.0,
    aaNormalText: ratio >= 4.5,
    aaaLargeText: ratio >= 4.5,
    aaaNormalText:ratio >= 7.0,
  };
}
```

### Brand Contrast Validation (run during Phase 1 Brand Brief)
```typescript
// Auto-check brand palette during Brand Brief generation:
const paletteChecks = [
  { text: BRAND_TEXT_ON_PRIMARY,  bg: BRAND_PRIMARY,    label: 'Text on Primary' },
  { text: BRAND_TEXT_ON_DARK,     bg: BRAND_BG,         label: 'Text on Background' },
  { text: BRAND_ACCENT,           bg: BRAND_BG,         label: 'Accent on Background' },
  { text: '#FFFFFF',              bg: BRAND_CTA_COLOR,  label: 'White on CTA' },
];

paletteChecks.forEach(({ text, bg, label }) => {
  const result = checkContrast(text, bg);
  if (!result.aaNormalText) {
    console.warn(`⚠ CONTRAST FAIL: ${label} — ${result.ratio}:1 (need 4.5:1)`);
    // Suggest alternative: darken or lighten until passing
  }
});
```

### High Contrast Mode Support
```css
/* Support Windows High Contrast Mode */
@media (forced-colors: active) {
  .glass-card { border: 2px solid ButtonText; background: Canvas; }
  .cta-btn    { forced-color-adjust: none; }
  *:focus      { outline: 3px solid Highlight; }
}
```

---

## ARIA PATTERNS FOR CINEMATIC COMPONENTS {#aria}

### Animated Hero Section
```html
<!-- Hero section with background video -->
<section aria-labelledby="hero-headline" role="banner">

  <!-- Video: decorative — hidden from screen readers -->
  <video autoplay muted loop playsinline
         aria-hidden="true" focusable="false"
         poster="/hero-poster.jpg">
    <source src="[CLOUDINARY_URL]/hero-loop.webm" type="video/webm">
    <source src="[CLOUDINARY_URL]/hero-loop.mp4"  type="video/mp4">
  </video>

  <!-- Pause button for video (accessibility requirement) -->
  <button class="video-pause-btn"
          aria-label="Pause background video"
          aria-pressed="false">
    <!-- icon -->
  </button>

  <!-- Content: visible to all users -->
  <div class="hero-content">
    <h1 id="hero-headline">[HEADLINE]</h1>
    <p>[HERO_LINE]</p>
    <a href="/get-started" class="cta-btn magnetic" data-magnetic="0.3">
      [CTA_TEXT]
      <span class="sr-only">— [brief clarification if needed]</span>
    </a>
  </div>

</section>
```

### 3D Element (Spline/Three.js)
```html
<!-- 3D element: non-interactive decoration -->
<div class="hero-3d"
     aria-hidden="true"
     focusable="false"
     role="presentation">
  <!-- Spline embed or Three.js canvas -->
  <canvas></canvas>
</div>

<!-- If 3D IS interactive (e.g. clickable product viewer): -->
<div class="product-3d"
     role="img"
     aria-label="Interactive 3D view of [PRODUCT_NAME] — drag to rotate">
  <canvas></canvas>
  <p class="sr-only">
    3D model of [PRODUCT_NAME]. Use arrow keys or drag to rotate.
    Press Escape to stop interaction.
  </p>
</div>
```

### Animated Navigation
```html
<nav aria-label="Main navigation">
  <button class="nav-toggle"
          aria-expanded="false"
          aria-controls="nav-menu"
          aria-label="Open navigation menu">
    <!-- hamburger icon: aria-hidden -->
  </button>

  <ul id="nav-menu" role="list">
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
    <!-- Dropdown -->
    <li>
      <button aria-expanded="false" aria-haspopup="true"
              aria-controls="products-submenu">
        Products
      </button>
      <ul id="products-submenu" role="list" hidden>
        <li><a href="/product-1">Product 1</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

### Custom Cursor
```css
/* Custom cursor must not replace system cursor for keyboard users */
/* Only apply on devices with fine pointer (mouse) */
@media (pointer: fine) {
  body { cursor: none; }
  .cursor-ring, .cursor-dot { display: block; }
}
@media (pointer: coarse) {
  .cursor-ring, .cursor-dot { display: none; }
}
```

### Tilt Card (3D hover)
```html
<!-- 3D tilt card: the tilt is purely visual — ensure content is accessible regardless -->
<article class="tilt-card glass-card"
         aria-label="[Card content description if no visible title]">
  <div class="card-highlight" aria-hidden="true"></div>
  <h3>[Card Title]</h3>
  <p>[Card description]</p>
  <a href="[url]" class="card-link">
    [Link text]
    <span class="sr-only">about [Card Title]</span>
  </a>
</article>
```

### Live Announcements (status messages)
```html
<!-- For dynamic content changes (counter updates, form feedback) -->
<div aria-live="polite" aria-atomic="true" class="sr-only" id="status-announcer">
  <!-- JS updates this: document.getElementById('status-announcer').textContent = 'Message sent!' -->
</div>

<!-- For urgent messages (errors): -->
<div aria-live="assertive" aria-atomic="true" class="sr-only" id="error-announcer">
</div>
```

---

## KEYBOARD NAVIGATION SYSTEM {#keyboard}

### Skip Navigation (always first element in body)
```html
<!-- First element in <body> — visible on focus -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<nav>...</nav>
<main id="main-content" tabindex="-1">...</main>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: var(--color-accent);
  color: var(--color-bg);
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  z-index: 9999;
  transition: top var(--dur-fast) var(--ease-snap);
}
.skip-link:focus { top: 0; }
```

### Focus Ring System (paradigm-aware)
```css
/* Universal focus ring — override browser defaults properly */
:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

/* Glass paradigm: focus ring on glass cards */
.glass-card:focus-visible {
  outline: 2px solid var(--glass-border);
  box-shadow: 0 0 0 4px rgba(255,255,255,0.3),
              var(--glass-shadow);
}

/* Brutalism: hard focus (matches the paradigm character) */
.brutal-card:focus-visible {
  outline: 3px solid var(--brut-accent);
  outline-offset: 0;
  box-shadow: 6px 6px 0 var(--brut-accent);
}

/* Remove only when providing custom replacement — NEVER just: */
/* :focus { outline: none; } ← NEVER do this */
```

### Keyboard Event Handlers (custom interactive components)
```typescript
// Keyboard handler for custom dropdown/modal
export function handleDropdownKeys(
  e: KeyboardEvent,
  { open, close, focusFirst, focusLast, focusNext, focusPrev }:
  { open: () => void; close: () => void;
    focusFirst: () => void; focusLast: () => void;
    focusNext: () => void; focusPrev: () => void }
) {
  switch (e.key) {
    case 'Enter':
    case ' ':       e.preventDefault(); open();      break;
    case 'Escape':                       close();     break;
    case 'ArrowDown': e.preventDefault(); focusNext(); break;
    case 'ArrowUp':   e.preventDefault(); focusPrev(); break;
    case 'Home':      e.preventDefault(); focusFirst();break;
    case 'End':       e.preventDefault(); focusLast(); break;
    case 'Tab':       close();                         break;
  }
}
```

---

## SCREEN READER PATTERNS {#screenreader}

### Screen Reader Only Utility Class (always include)
```css
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
/* Visible when focused (for skip links etc.) */
.sr-only-focusable:focus { all: unset; /* then re-apply visible styles */ }
```

### Icon Accessibility Pattern
```html
<!-- Icon with visible label (preferred) -->
<button>
  <svg aria-hidden="true" focusable="false">...</svg>
  Get Started
</button>

<!-- Icon-only button (require aria-label) -->
<button aria-label="Close menu">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>

<!-- Decorative icon in text -->
<p>
  <svg aria-hidden="true" focusable="false">...</svg>
  This feature saves you time
</p>
```

---

## REDUCED MOTION SYSTEM {#motion}

```typescript
// lib/motion.ts — Central reduced motion handling
export const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// GSAP global reduced motion setup — call once on init
export function applyReducedMotionDefaults() {
  if (!prefersReducedMotion) return;

  // Override GSAP defaults: instant, no easing
  gsap.defaults({ duration: 0, ease: 'none' });

  // Kill all ScrollTriggers (no scroll-linked animation)
  ScrollTrigger.getAll().forEach(t => t.kill());

  // Set all animated elements to their end state immediately
  gsap.set('[data-animate]', { clearProps: 'all' });
  gsap.set('.glass-hero__panel', { opacity: 1 });
  gsap.set('.hero-headline > *', { opacity: 1 });
}

// Video pause on reduced motion
export function applyReducedMotionToMedia() {
  if (!prefersReducedMotion) return;
  document.querySelectorAll('video[autoplay]').forEach(video => {
    (video as HTMLVideoElement).pause();
  });
}
```

### Pause Video Button (accessibility requirement for autoplay)
```tsx
// components/VideoPauseButton.tsx
'use client';
import { useState, useRef } from 'react';

export function VideoPauseButton({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement> }) {
  const [paused, setPaused] = useState(false);

  const toggle = () => {
    if (!videoRef.current) return;
    if (paused) { videoRef.current.play();  setPaused(false); }
    else        { videoRef.current.pause(); setPaused(true);  }
  };

  return (
    <button onClick={toggle}
            aria-label={paused ? 'Play background video' : 'Pause background video'}
            aria-pressed={paused}
            className="video-pause-btn">
      {paused ? '▶' : '⏸'}
    </button>
  );
}
```

---

## FORM ACCESSIBILITY {#forms}

```html
<!-- Accessible form pattern — always use this structure -->
<form novalidate aria-labelledby="form-title">
  <h2 id="form-title">Contact Us</h2>

  <!-- Error summary (shown on submit if errors) -->
  <div role="alert" aria-live="assertive" id="form-errors" hidden>
    <p>Please fix the following errors:</p>
    <ul><!-- Error links populated by JS --></ul>
  </div>

  <div class="field-group">
    <label for="name">
      Full Name
      <span aria-hidden="true" class="required-marker">*</span>
    </label>
    <input type="text" id="name" name="name"
           required
           aria-required="true"
           aria-describedby="name-error"
           autocomplete="name" />
    <span id="name-error" class="error-msg" role="alert" aria-live="polite" hidden>
      Please enter your full name
    </span>
  </div>

  <div class="field-group">
    <label for="email">
      Email Address
      <span aria-hidden="true" class="required-marker">*</span>
    </label>
    <input type="email" id="email" name="email"
           required aria-required="true"
           aria-describedby="email-hint email-error"
           autocomplete="email" />
    <span id="email-hint" class="field-hint">
      We'll never share your email
    </span>
    <span id="email-error" class="error-msg" role="alert" aria-live="polite" hidden>
      Please enter a valid email address
    </span>
  </div>

  <button type="submit" aria-describedby="submit-status">
    Send Message
  </button>
  <span id="submit-status" aria-live="polite" class="sr-only"></span>
</form>
```

---

## ACCESSIBILITY TESTING TOOLS {#testing}

Include in README:

```
AUTOMATED TESTING (run in CI):
  axe-core:    npm install --save-dev @axe-core/playwright
               → Catches ~30-40% of WCAG issues automatically
  Lighthouse:  Built into Chrome DevTools → Accessibility score
  Pa11y:       npm install -g pa11y → CLI accessibility audit

MANUAL TESTING:
  Keyboard:    Tab through entire page. Every action achievable without mouse?
  NVDA:        Free Windows screen reader → test with Chrome
               Download: nvaccess.org
  VoiceOver:   Built into macOS/iOS → test with Safari
               Cmd+F5 to enable
  Color:       Colour Contrast Analyser (free): paciellogroup.com

BROWSER EXTENSIONS:
  axe DevTools:        Chrome/Firefox extension — real-time issue detection
  WAVE:                webaim.org/resources/wave — visual overlay of issues
  Accessibility Insights: Microsoft — detailed guided testing

ONLINE VALIDATORS:
  WebAIM Contrast Checker: webaim.org/resources/contrastchecker
  Schema Validator:        validator.schema.org
  HTML Validator:          validator.w3.org

MINIMUM PASS CRITERIA before delivery:
  [ ] axe-core: 0 critical or serious violations
  [ ] Lighthouse accessibility: ≥ 90
  [ ] Keyboard test: all interactive elements reachable
  [ ] Contrast: all text passes AA (≥ 4.5:1 normal, ≥ 3:1 large)
  [ ] VoiceOver/NVDA: hero and primary nav readable correctly
```
