# Cinematic Web — Design Paradigm Reference

## TABLE OF CONTENTS
1. [Phase 1.5 Flow — How to Run Paradigm Selection](#flow)
2. [Paradigm Catalog](#catalog) (11 paradigms)
3. [Hybrid Combination Rules](#hybrid)
4. [CSS Architecture Per Paradigm](#css)
5. [Layout Structure Per Paradigm](#layout)
6. [Paradigm × Industry Compatibility Matrix](#matrix)

---

## PHASE 1.5 FLOW — HOW TO RUN PARADIGM SELECTION {#flow}

Run this immediately after the Brand Brief is approved (between Phase 1 and Phase 2).

### Step A — Recommend 2–3 Paradigms

Based on the Brand Brief (industry, tone, color palette, audience), recommend 2–3
paradigms with a one-line rationale each. Format:

```
Based on your Brand Brief — [brand name], [tone adjectives], [industry] —
here are my recommended design paradigms:

★ RECOMMENDED: [Paradigm 1]
  Why: [One sentence connecting brand tone to paradigm character]

◈ ALSO FITS: [Paradigm 2]
  Why: [One sentence]

◇ WILDCARD: [Paradigm 3] — only if you want to break expectations
  Why: [One sentence — why this is a bold but interesting choice]

Or I can show you all 11 paradigms with descriptions if you want to explore first.
Would you like to pick one of these, see all options, or mix two together?
```

### Step B — Show All (if requested)

If user wants to see all paradigms, present the Paradigm Menu:

```
┌─────────────────────────────────────────────────────────────┐
│  VISUAL DESIGN PARADIGM MENU                                │
│  Pick one as your base — or name two to create a Hybrid    │
├──────────────────┬──────────────────────────────────────────┤
│ 1. Glassmorphism │ Frosted glass, blur, translucent layers  │
│ 2. Neumorphism   │ Soft emboss, tactile, light-source UI    │
│ 3. Skeuomorphism │ Real materials, physical texture, depth  │
│ 4. Claymorphism  │ Puffy 3D, pastel, playful, rounded       │
│ 5. Brutalism     │ Raw, stark, no decoration, aggressive    │
│ 6. Flat 2.0      │ Bold color, icon-forward, clean motion   │
│ 7. Spatial Design│ Depth layers, floating panels, Apple-era │
│ 8. Motion System │ Animation IS the UI — motion-first       │
│ 9. Data-Driven   │ Charts, metrics, live data as design     │
│ 10. Maximalism   │ Layered, dense, collage, high energy     │
│ 11. Aurora/Mesh  │ Gradient blobs, organic color, glow      │
└──────────────────┴──────────────────────────────────────────┘
Type a number, a name, or two numbers to create a Hybrid (e.g. "1+7")
```

### Step C — Confirm & Output Paradigm Brief

Once selection is made (single or hybrid), output a **Paradigm Brief**:

```
╔══════════════════════════════════════════════════════════╗
║  DESIGN PARADIGM: [Name] [+ Name if Hybrid]             ║
╚══════════════════════════════════════════════════════════╝

CHARACTER:    [2 sentences on what this paradigm feels like]
CSS SYSTEM:   [Key CSS techniques that define this paradigm]
LAYOUT LOGIC: [How sections, cards, and grids are structured]
COMPONENT DNA: [What buttons, cards, inputs look like]
CINEMATIC PAIRING: [How this paradigm interacts with video/3D/animation]
WARNINGS:     [Any accessibility, performance, or licensing concerns]

[If Hybrid: BLEND LOGIC — which elements come from each paradigm and why]
```

Ask: *"Does this paradigm direction feel right? Confirm to proceed to Scene Concepts."*

---

## PARADIGM CATALOG {#catalog}

---

### 1. GLASSMORPHISM

**Character:** Depth through translucency. UI elements feel like frosted glass
suspended in front of cinematic backgrounds. Light refracts through them.
Best when there's something beautiful behind the glass worth seeing through.

**Visual Signature:**
- `backdrop-filter: blur(12px–24px)` on cards and panels
- Semi-transparent backgrounds: `rgba(255,255,255,0.08)` to `rgba(255,255,255,0.15)`
- Subtle border: `1px solid rgba(255,255,255,0.18)`
- Inner shadow: `inset 0 1px 0 rgba(255,255,255,0.2)`
- Outer glow (optional): `box-shadow: 0 8px 32px rgba(0,0,0,0.37)`

**CSS Architecture:**
```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-blur: 16px;
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
  --glass-highlight: rgba(255, 255, 255, 0.2);
}
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: 16px;
}
```

**Layout Structure:**
- Dark or video background fills 100vw — glass cards float above it
- Cards never touch edges — generous margin creates floating effect
- Nav: always glass (sticky, frosted)
- Hero: full-bleed video or gradient behind glass headline panel
- Sections: glass cards on subtle gradient or blurred bg

**Component DNA:**
- Buttons: glass fill on hover, solid on primary CTA only
- Cards: glass with 1px border, slight inner glow on hover
- Inputs: glass bg, bright focus border
- Modal/drawer: heavy blur, glass panel

**Cinematic Pairing:** ★★★★★ Perfect — video backgrounds become part of the design
**Animation Pairings:** Depth Parallax, Cinematic Curtain, Immersive Zoom
**Best For:** SaaS, luxury tech, fintech, music/events, creative studio
**Avoid When:** Mobile-first strict (backdrop-filter is GPU heavy), or when brand is warm/earthy
**Safari / Browser Fallback System (MANDATORY for Glassmorphism):**
```css
/* Step 1: Feature detection — always use @supports */
.glass-card {
  /* Fallback: solid surface for browsers without backdrop-filter */
  background: rgba(20, 24, 40, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
}

/* Step 2: Enhancement for supporting browsers */
@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
  }
}

/* Step 3: Safari-specific GPU boost (prevents flicker on scroll) */
@supports (-webkit-backdrop-filter: blur(1px)) {
  .glass-card {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}
```

**Safari Version Compatibility:**
| Safari | backdrop-filter | Notes |
|--------|----------------|-------|
| 9–13   | ❌ None        | Solid bg fallback active |
| 14–15  | ✅ `-webkit-` only | Works with prefix |
| 16+    | ✅ Both        | Full support |
| iOS 15+| ✅ With prefix | Test on real device |

**Performance rules:**
- Max 3–4 glass elements visible simultaneously (GPU limit)
- Never apply `backdrop-filter` to elements with `position: fixed` on iOS — causes paint storms
- Use `will-change: backdrop-filter` sparingly — only on elements that animate
- Reduce blur radius on mobile: `--glass-blur: 8px` (vs 16px desktop)

---

### 2. NEUMORPHISM

**Character:** UI that looks pressed into or extruded from the same surface.
Soft, tactile, monochromatic. Like carved stone or molded plastic.

**Visual Signature:**
- Dual-shadow technique: light shadow top-left, dark shadow bottom-right
- All elements same background color as parent — depth via shadow only
- Extremely low contrast — monochromatic palette
- Rounded corners on everything

**CSS Architecture:**
```css
:root {
  --neu-bg: #E0E5EC;
  --neu-shadow-light: #FFFFFF;
  --neu-shadow-dark: #A3B1C6;
  --neu-radius: 16px;
}
.neu-raised {
  background: var(--neu-bg);
  border-radius: var(--neu-radius);
  box-shadow: 6px 6px 12px var(--neu-shadow-dark),
             -6px -6px 12px var(--neu-shadow-light);
}
.neu-inset {
  box-shadow: inset 6px 6px 12px var(--neu-shadow-dark),
              inset -6px -6px 12px var(--neu-shadow-light);
}
```

**Layout Structure:**
- Light or mid-tone background (never dark — shadows need visible surface)
- No background images behind UI — surface IS the design
- Cards look pressed into the page surface
- Toggle buttons: pressed = inset, default = raised

**Component DNA:**
- Buttons: raised → inset on active
- Cards: raised, no borders
- Inputs: inset wells
- Icons: matching surface color with shadows

**Cinematic Pairing:** ★★☆☆☆ Poor — kills video backgrounds (need solid surface)
**Animation Pairings:** 3D Card Hover (subtle), Counter Roll, Stagger Cascade
**Best For:** Health/wellness apps, meditation tools, dashboard UI
**Avoid When:** Dark brand, video hero, high-contrast identity
**Warnings:**
- ⚠️ ACCESSIBILITY RISK — naturally low contrast. MUST run WCAG check.
- Add high-contrast mode toggle if used on any public-facing site
- Inform user of this risk before proceeding

---

### 3. SKEUOMORPHISM

**Character:** Digital design that mimics physical objects — stitched leather,
wood grain, metal knobs, paper textures. Pre-flat-design era, but used
intentionally now as a craft statement.

**CSS Architecture:**
```css
:root {
  --sku-texture-wood: url('/assets/textures/wood-grain.jpg');
  --sku-texture-leather: url('/assets/textures/leather.jpg');
  --sku-metal-gradient: linear-gradient(145deg, #d4d4d4, #a0a0a0);
  --sku-stitch-color: rgba(0,0,0,0.3);
}
/* Metal button example */
.metal-btn {
  background: var(--sku-metal-gradient);
  border: 1px solid #888;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4);
  text-shadow: 0 -1px 0 rgba(0,0,0,0.4);
}
```

**Layout Structure:**
- Sections look like physical environments (desk surface, framed displays)
- Background textures replace flat color
- UI chrome: bezels, frames, shadows that simulate physical depth

**Cinematic Pairing:** ★★★☆☆ Strong with macro material video (leather, wood, metal)
**Animation Pairings:** Scroll-Scrubbed Video (material reveals), 3D Card Hover
**Best For:** Whiskey/spirits brands, artisan products, music/audio tools, luxury goods
**Avoid When:** SaaS, tech products, modern startup

---

### 4. CLAYMORPHISM

**Character:** Chunky, inflated 3D shapes that look like they're made of soft clay.
Bright pastels, heavy drop shadows, maximum border-radius. Joyful and approachable.

**CSS Architecture:**
```css
:root {
  --clay-shadow: 8px 8px 0px rgba(0,0,0,0.15);
  --clay-radius: 24px;
  --clay-pastel-1: #FFD6E0;
  --clay-pastel-2: #C8F0F9;
  --clay-pastel-3: #D4F0C0;
  --clay-highlight: rgba(255,255,255,0.6);
}
.clay-card {
  border-radius: var(--clay-radius);
  box-shadow: var(--clay-shadow);
  background: var(--clay-pastel-1);
  /* Inner highlight for inflated 3D feel */
  position: relative;
  overflow: hidden;
}
.clay-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  background: linear-gradient(to bottom, var(--clay-highlight), transparent);
  border-radius: inherit;
}
```

**Layout Structure:**
- Cards are large, rounded, pastel-filled — no sharp edges anywhere
- Generous whitespace — elements don't crowd each other
- 3D Spline clay objects as hero or section accents
- Background: soft pastel gradient or white

**Cinematic Pairing:** ★★★☆☆ Works with Spline 3D clay models in hero
**Animation Pairings:** Gravity Drop (bouncy ease), Stagger Cascade (springy)
**Best For:** Children's products, edtech, consumer apps, wellness for youth
**Avoid When:** Fintech, luxury, B2B SaaS, any "serious" brand

---

### 5. BRUTALISM

**Character:** Raw, confrontational, anti-decoration. Exposed grid structure.
Typography at maximum scale. No border-radius. No softness. Zero apology.
Used intentionally as a cultural statement — not accidental ugliness.

**CSS Architecture:**
```css
:root {
  --brut-black: #000000;
  --brut-white: #FFFFFF;
  --brut-accent: #FF0000; /* or any ONE electric color */
  --brut-border: 3px solid #000;
  --brut-grid-gap: 4px;
}
* { border-radius: 0 !important; } /* Brutalism rule */
.brut-card {
  border: var(--brut-border);
  background: var(--brut-white);
  box-shadow: 6px 6px 0 var(--brut-black); /* Offset shadow — no blur */
  padding: 2rem;
}
.brut-card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 9px 9px 0 var(--brut-black);
}
```

**Layout Structure:**
- Exposed CSS Grid — gaps visible as part of design
- Typography MUCH larger than conventional — hero H1 can be 15vw+
- Sections separated by thick borders, not whitespace
- Asymmetric layouts — intentional misalignment
- Marquee / ticker elements common

**Component DNA:**
- Buttons: solid fill, no radius, hard offset shadow, uppercase
- Cards: bordered boxes, offset shadow
- Nav: borderlined, text-only links, no subtle states

**Cinematic Pairing:** ★★☆☆☆ Contrast works — B&W video, harsh cuts
**Animation Pairings:** Section Wipe, Gravity Drop (hard bounce, no ease)
**Best For:** Creative agencies, art/design studios, music labels, fashion avant-garde
**Avoid When:** Any brand that needs to feel trustworthy, warm, or approachable

---

### 6. SPATIAL DESIGN (Apple Vision Pro era)

**Character:** UI exists in 3D space. Panels float at different depth layers.
Depth blur on background elements. Light-adaptive surfaces. Motion is the interface.

**CSS Architecture:**
```css
:root {
  --spatial-depth-1: translateZ(0px);
  --spatial-depth-2: translateZ(20px);
  --spatial-depth-3: translateZ(60px);
  --spatial-blur-bg: blur(40px);
  --spatial-glass: rgba(255,255,255,0.12);
  --spatial-border: rgba(255,255,255,0.15);
}
.spatial-container {
  perspective: 1200px;
  transform-style: preserve-3d;
}
.spatial-panel {
  transform: var(--spatial-depth-2);
  background: var(--spatial-glass);
  backdrop-filter: var(--spatial-blur-bg);
  border: 1px solid var(--spatial-border);
  border-radius: 20px;
}
```

**Layout Structure:**
- Multiple Z-axis layers — foreground, midground, background
- Background layers: blurred and darkened (depth-of-field simulation)
- Foreground: sharp, floating panels
- Navigation: spatial sidebar or floating top bar — not traditional
- Scroll: parallax depth layers mandatory

**Cinematic Pairing:** ★★★★★ Native pairing — spatial = cinematic by default
**Animation Pairings:** Depth Parallax, 3D Card Hover, Scroll-Linked 3D, Orbital Product
**Best For:** Tech products, VR/AR tools, premium SaaS, forward-thinking brands
**Avoid When:** Content-heavy sites, SEO-critical blogs, accessibility-first projects
**Warnings:** Heavy WebGL — always include `prefers-reduced-motion` fallback

---

### 7. MOTION DESIGN SYSTEM

**Character:** Animation is the primary design element — not decoration. Every
state change is a choreographed transition. The brand lives in motion, not static frames.

**CSS Architecture:**
```css
:root {
  /* Motion tokens — the design system of time */
  --motion-instant:  0ms;
  --motion-fast:     150ms;
  --motion-standard: 300ms;
  --motion-slow:     500ms;
  --motion-crawl:    800ms;

  /* Easing library */
  --ease-snap:    cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);
  --ease-cinema:  cubic-bezier(0.76, 0, 0.24, 1);
  --ease-elastic: cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
/* Every interactive element uses motion tokens */
.btn { transition: transform var(--motion-fast) var(--ease-snap),
                   background var(--motion-standard) var(--ease-smooth); }
```

**Layout Structure:**
- Sections designed as animation stages — static layout secondary to motion state
- Elements have defined enter/idle/exit states
- Page transitions are first-class — not afterthoughts
- Every scroll position has a defined animation state

**Cinematic Pairing:** ★★★★★ Native — motion system + video = full cinematic control
**Animation Pairings:** All animation types — this paradigm IS the animation system
**Best For:** Creative studios, product demos, interactive storytelling, brand campaigns
**Avoid When:** Performance-constrained environments, content-first sites

---

### 8. DATA-DRIVEN UI

**Character:** Numbers, charts, and live metrics ARE the design. Data visualization
is aesthetic, not utilitarian. Precision and density create visual richness.

**CSS Architecture:**
```css
:root {
  --data-grid: 1px solid rgba(255,255,255,0.08);
  --data-accent: #00FF88;       /* Electric readout color */
  --data-bg: #080C14;           /* Near-black base */
  --data-surface: #0F1623;      /* Card surface */
  --data-label: rgba(255,255,255,0.4);
  --mono-font: 'JetBrains Mono', 'Fira Code', monospace;
}
.data-card {
  background: var(--data-surface);
  border: 1px solid rgba(255,255,255,0.08);
  font-family: var(--mono-font);
}
.data-readout {
  font-family: var(--mono-font);
  color: var(--data-accent);
  font-variant-numeric: tabular-nums;
}
```

**Layout Structure:**
- Dense grid layouts — information-rich, little whitespace
- Monospace typography for all data readouts
- Chart/graph components as hero section elements
- Ticker strips, live counters, progress indicators as decoration

**Cinematic Pairing:** ★★★☆☆ Abstract data viz as video/Three.js hero
**Animation Pairings:** Counter Roll, Scroll-Linked 3D (graph draws on scroll)
**Best For:** Fintech, analytics tools, crypto/web3, SaaS dashboards, AI products
**Avoid When:** Consumer lifestyle brands, health/wellness, luxury fashion

---

### 9. MAXIMALISM

**Character:** More is more. Layered visuals, rich texture, high-density composition.
Editorial and expressive — influenced by print design, collage, and contemporary art.

**CSS Architecture:**
```css
:root {
  --max-layer-1: z-index 1;     /* Background texture */
  --max-layer-2: z-index 2;     /* Image collage */
  --max-layer-3: z-index 3;     /* Typography */
  --max-layer-4: z-index 4;     /* Overlay elements */
  --max-mix-mode: mix-blend-mode: multiply; /* or overlay, screen */
}
.max-hero {
  position: relative;
  overflow: hidden;
}
/* Layered elements use mix-blend-mode to interact with each other */
.max-overlay-text {
  mix-blend-mode: overlay;
  color: white;
  font-size: clamp(4rem, 10vw, 12rem);
}
```

**Layout Structure:**
- Overlapping elements — text over images over texture
- Mix-blend-mode used extensively for layer interaction
- Typography at dramatic sizes — can break out of containers
- No clean whitespace — density is intentional

**Cinematic Pairing:** ★★★★☆ Multiple overlapping video layers with blend modes
**Animation Pairings:** Horizontal Track, Depth Parallax, Stagger Cascade
**Best For:** Fashion, music, art, culture, creative agencies, editorial brands
**Avoid When:** Any product that needs clarity of message above visual impact

---

### 10. AURORA / GRADIENT MESH

**Character:** Living, breathing color. Organic gradient blobs animate slowly
beneath UI. Color IS the atmosphere. Feels alive without video.

**CSS Architecture:**
```css
:root {
  --aurora-1: #6366F1;
  --aurora-2: #EC4899;
  --aurora-3: #06B6D4;
  --aurora-4: #8B5CF6;
}
.aurora-bg {
  background: radial-gradient(ellipse at 20% 50%, var(--aurora-1) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, var(--aurora-2) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 80%, var(--aurora-3) 0%, transparent 50%),
              #000;
  animation: aurora-shift 8s ease-in-out infinite alternate;
}
@keyframes aurora-shift {
  0%   { filter: hue-rotate(0deg) saturate(1); }
  100% { filter: hue-rotate(30deg) saturate(1.2); }
}
```

**WebGL Enhancement (Three.js):**
Use a custom shader for animated mesh gradient — produces significantly richer output
than CSS gradients alone. Provide as progressive enhancement over CSS fallback.

**Cinematic Pairing:** ★★★★☆ No video needed — aurora IS the cinematic element
**Animation Pairings:** Depth Parallax, Cursor Gravity (aurora follows cursor)
**Best For:** AI products, creative SaaS, music/audio, modern startups
**Avoid When:** Brands with strict color guidelines, print-heavy identity

---

### 11. FLAT DESIGN 2.0

**Character:** Bold color blocks, strong iconography, clean motion. Updated flat
design with micro-interactions, subtle depth, and deliberate typographic scale.

**CSS Architecture:**
```css
:root {
  --flat-primary: [from brand palette];
  --flat-surface: #FFFFFF;
  --flat-border: #E5E7EB;
  --flat-shadow: 0 1px 3px rgba(0,0,0,0.1); /* minimal depth */
}
/* Cards: barely any shadow — surface-forward */
.flat-card {
  background: var(--flat-surface);
  border: 1px solid var(--flat-border);
  border-radius: 8px;
  box-shadow: var(--flat-shadow);
}
```

**Cinematic Pairing:** ★★☆☆☆ Motion graphics style video works; live-action doesn't fit
**Animation Pairings:** Stagger Cascade, Counter Roll, Section Wipe
**Best For:** Productivity apps, simple marketing sites, broad consumer products

---

## HYBRID COMBINATION RULES {#hybrid}

### Valid Hybrid Pairs (Tested Combinations)

| Combination | Blend Logic | Result Character |
|---|---|---|
| **Glass + Spatial** | Glass cards at multiple Z-depths | Premium immersive — best pairing overall |
| **Aurora + Glass** | Aurora as background, glass as UI layer | Alive, modern, dreamy |
| **Data-Driven + Spatial** | Data panels floating in 3D space | Sci-fi dashboard aesthetic |
| **Motion System + Any** | Motion tokens applied to any paradigm's components | Elevates anything |
| **Brutalism + Maximalism** | Raw grid + dense layering + bold type | Maximum visual aggression |
| **Claymorphism + Aurora** | Pastel clay shapes + soft gradient bg | Joyful and premium |
| **Skeuomorphism + Spatial** | Material textures with depth layers | Rich, tactile, immersive |
| **Glass + Flat 2.0** | Glass for hero/nav, flat for content sections | Practical premium |

### Invalid / Risky Pairs (Warn User)

| Combination | Problem |
|---|---|
| Neumorphism + Dark mode | Dual shadows disappear on dark backgrounds |
| Brutalism + Claymorphism | Philosophical contradiction — explain and ask if intentional |
| Skeuomorphism + Data-Driven | Clashing visual languages — jarring |
| Neumorphism + Glassmorphism | Both fight for surface attention |

### Hybrid CSS Architecture Rule

When blending two paradigms, establish **Primary** and **Accent** roles:
- **Primary paradigm:** Defines the overall surface system (background, cards, sections)
- **Accent paradigm:** Applies to specific elements (nav, hero, CTAs, or hover states)

Document this clearly in the Paradigm Brief:
```
BLEND: Glassmorphism (Primary) + Spatial Design (Accent)
Primary applies to: All cards, section backgrounds, nav
Accent applies to: Hero section depth layers, 3D element, scroll behavior
Where they meet: Hero glass panel floats in spatial Z-depth environment
```

---

## PARADIGM × INDUSTRY COMPATIBILITY MATRIX {#matrix}

| Paradigm | SaaS | Luxury | Health | Fintech | Agency | Ecom | Real Est. |
|---|---|---|---|---|---|---|---|
| Glassmorphism | ★★★★ | ★★★★★ | ★★★ | ★★★★ | ★★★★ | ★★★ | ★★★★ |
| Neumorphism | ★★ | ★★★ | ★★★★ | ★★ | ★★ | ★★ | ★★ |
| Skeuomorphism | ★ | ★★★★★ | ★★ | ★ | ★★★ | ★★★★ | ★★★ |
| Claymorphism | ★★ | ★ | ★★★ | ★ | ★★ | ★★★ | ★ |
| Brutalism | ★★ | ★★ | ★ | ★ | ★★★★★ | ★★★ | ★ |
| Flat 2.0 | ★★★★ | ★★ | ★★★★ | ★★★ | ★★★ | ★★★★ | ★★★ |
| Spatial Design | ★★★★★ | ★★★★ | ★★★ | ★★★★ | ★★★★ | ★★★ | ★★★★★ |
| Motion System | ★★★★ | ★★★★★ | ★★★ | ★★★ | ★★★★★ | ★★★★ | ★★★ |
| Data-Driven | ★★★★★ | ★★ | ★★ | ★★★★★ | ★★★ | ★★ | ★★ |
| Maximalism | ★★ | ★★★★ | ★ | ★ | ★★★★★ | ★★★★ | ★★ |
| Aurora/Mesh | ★★★★★ | ★★★ | ★★★ | ★★★ | ★★★★ | ★★★ | ★★★ |
