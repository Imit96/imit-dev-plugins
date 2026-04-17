# Cinematic Web — Scene Treatment Reference

---

## CONCEPT CARD TEMPLATE

Generate 3 concept cards. Each must follow this exact structure:

```
╔═══════════════════════════════════════════════════════╗
║  CONCEPT [N]: "[Evocative Concept Name]"              ║
╚═══════════════════════════════════════════════════════╝

MOOD:
  [2–3 sentences describing the emotional world of this concept.
   What does it feel like to be inside this site? Reference films,
   architecture, materials, time of day — be specific and evocative.]

COLOR STORY:
  Dominant:   #XXXXXX — [name] — [role, e.g. "fills 70% of hero"]
  Supporting: #XXXXXX — [name] — [role]
  Accent:     #XXXXXX — [name] — [where it appears, e.g. "CTA only"]
  Note: [One line on the emotional logic of this palette]

CAMERA LANGUAGE:
  [How does the "camera" move? Slow push-in, aerial drift, orbital spin,
   static with depth-of-field layers, handheld intimate, etc. Describe
   the opening motion the user experiences in the first 3 seconds.]

LIGHTING STYLE:
  [Single source? Ambient? Volumetric rays? Rim-lit? Color gels?
   What time of day/environment does the lighting evoke?]

MOTION SIGNATURE:
  [The repeating motion motif across the site. E.g.: "Text reveals like
   classified documents being unsealed, character by character." Or:
   "Elements surface from below like objects rising through deep water."
   This signature must apply to headlines, cards, and section transitions.]

HERO VIDEO LOOP:
  [Describe what plays behind the hero text. 8–12 seconds. Seamless loop.
   What is the subject? What motion occurs? What changes? What doesn't?
   Example: "A single candle flame in ultra-slow motion, occasionally
   catching a breath of air — deep black surround, warm amber core."]

3D ELEMENT:
  [What 3D element appears, if any? Where? How does it behave?
   If no 3D: explain why and what replaces it (parallax layers, etc.)
   Library: Spline / Three.js / Rive / CSS 3D / None]

SCROLL BEHAVIOR:
  [How does the page transition between sections? Snap scroll? Smooth?
   What happens to the hero as user scrolls — scale up, fade out,
   parallax? Does the video freeze on a frame? Does 3D respond to scroll?]

BACKGROUND TEXTURE / FX:
  [Grain overlay? Noise shader? Glassmorphism? Grid lines? Vignette?
   Any CSS or WebGL post-processing effects?]

CTA STYLE:
  Primary button: [Shape, fill, hover behavior, text style]
  Hover FX: [What happens on hover — sweep, glow, lift, etc.]
  Micro-interaction: [Any cursor or proximity effect?]

TYPOGRAPHY FEEL:
  [How does the type behave? Large and editorial? Small and precise?
   Stacked? Centered? Animated on reveal? Mixed weights for drama?]

CONCEPT TAGLINE:
  "[A unique 8–12 word line that could only belong to THIS concept.
   Not the brand tagline — the cinematic direction in words.]"

APIS NEEDED:      [List which APIs this concept requires]
EST. COST:        [Free / ~$X per generation run]
COMPLEXITY:       [Low / Medium / High — and what makes it complex]
BEST FOR:         [Industry types or brand vibes this concept suits best]
```

---

## THE 3-CONCEPT CONTRAST RULE

The 3 concepts must represent genuinely different creative territories.
Use this contrast framework to ensure separation:

| Dimension | Concept 1 | Concept 2 | Concept 3 |
|---|---|---|---|
| Temperature | Cold / Neutral | Warm | Neutral / Mixed |
| Density | Minimal | Maximal | Balanced |
| Energy | Still / Slow | Dynamic | Rhythmic |
| Light | Dark-dominant | Light-dominant | Contrast-heavy |
| 3D | Yes | Optional | No (motion-only) |

If two concepts feel too similar, replace one. The user should be able to feel
the difference immediately from reading the cards — not just see slight variations.

---

## MANDATORY BEHAVIOR DIVERSITY RULE ← CRITICAL

**Each concept MUST use a different primary scroll/interaction behavior.**
Never assign the same behavior class to more than one concept.

### Behavior Class Library — COMPLETE SYSTEM

**IMPORTANT — Storyline alignment:** Before assigning behavior classes,
read the locked storyline from the LEDGER. The storyline's PRIMARY SCROLL BEHAVIOR
must appear in at least one of the 3 concepts. Never assign behaviors that directly
contradict the locked storyline.

---

**Class A — Frame-scroll / Scrub behaviors (non-video, scroll-driven)**
- `FRAME_SCROLL` — Video scrubbed frame-by-frame with scroll position (Apple-style)
- `IMMERSIVE_ZOOM` — Page zooms slowly into the scene as user scrolls
- `PARALLAX_DEPTH` — 3–5 independent layers drift at different scroll speeds
- `PIN_REVEAL` — Section pins; content wipes/reveals through a masked window on scroll
- `SECTION_MORPH` — Each scroll section morphs shape/color (clip-path driven)
- `DEPTH_LAYERS` — Foreground/mid/background travel at distinct speeds, creating 3D depth
- `SCROLL_WARP` — WebGL shader distortion that intensifies with scroll velocity

**Class B — Object / Physics behaviors**
- `EXPLODING_OBJECT` — Product/logo shatters into particles, reassembles on scroll
- `GRAVITY_SCATTER` — Elements fall from top, land with physics bounce on load
- `MAGNETIC_PULL` — Objects near cursor are pulled toward it, spring back on leave
- `ORBITAL_SPIN` — 3D object orbits or rotates in response to scroll progress
- `LIQUID_MORPH` — SVG/WebGL shape continuously morphs between forms
- `MAGNETIC_CARDS` — Grid cards tilt toward cursor in 3D (CSS perspective + JS)
- `ELASTIC_DRAG` — UI elements stretch elastically toward cursor, snap back on release
- `WEIGHT_DROP` — Heavy elements fall with exaggerated gravity, settle with bounce

**Class C — Cinematic / Narrative behaviors**
- `CURTAIN_CUT` — Two panels wipe apart on load like a film clapperboard
- `DOLLY_PUSH` — Camera appears to push forward through the scene (CSS scale + blur)
- `STORY_SCROLL` — Long horizontal narrative that advances on vertical scroll
- `CHAPTER_SNAP` — Full-viewport snap scroll; each section is a film "chapter"
- `TYPEWRITER_REVEAL` — Headline types itself character by character on load
- `WORD_STREAM` — Words of a headline appear one-by-one in sync with scroll progress
- `SCRAMBLE_TEXT` — Text scrambles through random characters before resolving into words
- `WIPE_TRANSITION` — Colored sweep wipes across viewport between sections (hard cut feel)

**Class D — Environmental / Ambient behaviors**
- `AURORA_REACTIVE` — Gradient background shifts in real-time based on cursor position
- `PARTICLE_FIELD` — Ambient particle system reacts to cursor with gentle attraction
- `NOISE_WAVE` — Perlin noise drives background texture that evolves continuously
- `BREATHING_SCALE` — Entire hero breathes (slow scale in/out, 4s cycle, infinite)
- `CURSOR_TRAIL` — Custom cursor leaves a fading trail matching the brand accent
- `CURSOR_SPOTLIGHT` — Dark page; cursor creates a moving spotlight revealing content beneath
- `CURSOR_DISTORT` — Cursor creates ripple/lens-distortion in the background as it moves
- `AMBIENT_VIDEO_REACT` — Video background responds to scroll (speed, hue, blur increase)

**Class E — Story / Sequential behaviors (NEW)**
*These behaviors control how a section delivers information over time or scroll distance.*

- `MULTI_STATE_HERO` — Hero pins to viewport; scrolling cycles through 3–5 distinct
  message states before the section releases. Each state is a complete micro-story.
  The user must engage with all states before proceeding. (See scrollytelling.md)

- `PROGRESSIVE_DISCLOSURE` — Content appears piece by piece on scroll within a pinned
  section. Diagrams, specs, or features unlock sequentially. The full picture only
  appears after the user has scrolled through all reveals.

- `STORY_BEAT` — Page is divided into beats (like a screenplay). Each beat is a pinned
  moment with its own atmosphere, text, and motion. Scroll between beats is instant;
  scroll within a beat drives the beat's animation.

- `SCROLL_COUNTDOWN` — A hero element counts down (or builds up) as user scrolls.
  Progress bar, number counter, or expanding shape. Reaching 100% triggers the reveal.

- `TEXT_CINEMATIC` — Full-screen text only, no images. Words appear, linger, fade.
  Scroll drives the reading pace. Site feels like a film's opening text crawl.
  Most powerful for philosophy/manifesto brands.

**Class F — Persistent / Thread behaviors (NEW)**
*These behaviors create elements that follow the user across multiple sections,
providing visual continuity and narrative threading across the entire page.*

- `FLOATING_3D_ANCHOR` — A 3D object (brand mark, product, geometric form) persists
  across ALL sections. It repositions and morphs its shape/scale/material as the user
  moves through sections. In the hero: large and dominant. In features: small corner
  accent. At CTA: full prominence again. The object IS the narrative thread.
  (See motion-code-library.md → Three.js Depth section)

- `PROGRESS_THREAD` — A visible progress indicator threads through the entire page
  (vertical line, expanding dot, filling bar). It updates with each section and can
  display section names or story beat labels.

- `STICKY_COUNTER` — A stat or metric stays visible across sections and counts/updates
  as the user scrolls. E.g. "Revenue generated: $0 → $2.4M" as user reads the story.

- `AMBIENT_3D_FIELD` — A persistent 3D particle / geometry field that stays behind all
  sections. Its density, color, and motion respond to each section's emotional tone.
  Dark and sparse in problem sections. Bright and energetic in solution sections.

- `SCROLL_COMPANION` — A character, mascot, or abstract form that walks/floats down
  the page alongside the user. Positioned in the margin, it reacts to content.
  Used in onboarding flows, educational sites, storytelling brands.

---

**Class G — Typography / Text behaviors (NEW)**
*These behaviors make the TYPE itself the cinematic experience.
Text is not just content — it is the animation.*

- `TEXT_MASK_REVEAL` — Text is hidden behind a shape (circle, rectangle, custom path).
  As user scrolls into the section, the shape grows and uncovers the text beneath.
  The reveal shape can be the brand logo, an accent blob, or a geometric form.

- `VARIABLE_FONT_ANIMATE` — A variable font's weight, width, or slant axis animates
  continuously with scroll progress. The headline morphs from ultra-thin to ultra-bold
  (or vice versa) as the user passes through the section. Requires a variable font.

- `KINETIC_TYPE` — Individual letters, words, or lines have physical properties.
  They bounce, collide with each other, fall under gravity, repel from cursor.
  Built with Matter.js or GSAP Physics2D. High energy, gaming/music brands.

- `BLUR_FOCUS_TEXT` — Headline starts heavily blurred (blur: 20px) and sharpens
  into perfect focus as the section enters the viewport. Reverse on exit. Creates
  the sensation of a camera lens focusing on the most important message.

- `STAGGER_LINES` — Body text or list items appear line-by-line in smooth succession.
  Each line slides up and fades in with a 100–150ms stagger. Works for manifestos,
  philosophy sections, or anywhere prose needs to feel deliberate and earned.

- `OVERSIZED_BG_TYPE` — Massive letters (30–40vw each) fill the background.
  The visible page content scrolls over the top while the giant type stays fixed
  or moves at a slower parallax rate. Creates depth and brand presence simultaneously.

- `SCRAMBLE_REVEAL` — Characters scramble through random glyphs before resolving
  into the final word, character by character from left to right. Creates the
  impression of a system decrypting or a transmission becoming clear.
  Best for: tech brands, cyberpunk, data companies.

- `COUNTER_CINEMA` — Stats count up not just numerically but cinematically —
  the counter starts below the target and overshoots slightly before settling
  (spring physics on numbers). Pairs with a large font and minimal context.

---

**Class H — Layout / Spatial behaviors (NEW)**
*These behaviors change HOW content is arranged in space, not just how it animates.*

- `SPLIT_SCREEN_SCROLL` — Viewport is divided vertically. Left and right columns
  scroll at independent speeds or lock/unlock independently. As one side reaches
  its end, the other catches up. Used for before/after, comparison, dual narrative.

- `INFINITE_LOOP_TRACK` — A horizontal track of content loops seamlessly and
  continuously (logos, testimonials, capabilities, stats). Speed slows on hover.
  Always the same direction. Multiple tracks can move opposite directions simultaneously.
  Built with GSAP ticker — never CSS animation (more control, smoother on all devices).

- `DRAG_EXPLORE` — User click-drags horizontally to explore content. Not scroll-driven —
  the user physically grabs and pulls the content like a physical object. Momentum
  carries the movement after release. Replaces horizontal scroll on touch devices.

- `DEPTH_CARDS_3D` — Cards in a portfolio/feature grid are arranged in 3D Z-space.
  Cards in the "background" are smaller and blurred. Hover or scroll brings individual
  cards forward while others recede. Built with CSS perspective or Three.js.

- `ACCORDION_RICH` — Accordion sections that don't just show text on open — they
  expand to reveal full sections with images, animations, and nested layouts.
  The accordion IS the content architecture. Opening one collapses others smoothly.

- `MASONRY_BUILD` — A masonry grid that builds itself on scroll. Items fall into
  their positions from above with staggered timing. Each item lands with a subtle
  bounce. The grid assembles like a mosaic being constructed in real time.

- `STICKY_SIDE_PANEL` — A side panel or sidebar sticks to the viewport while the
  main content scrolls. The panel updates its content based on which main section
  is in view. Used for: documentation, editorial, feature comparisons.

- `CIRCULAR_ARRANGEMENT` — Navigation, features, or team members arranged in a
  circle. The circle rotates on scroll or cursor position. Each item expands when
  centred/highlighted. Creates the sense of rotation through options.

---

**Class I — Visual FX / Post-Processing behaviors (NEW)**
*These apply a layer of visual processing to the page as a whole or to specific sections.
They are the "film stock" that defines the aesthetic of the entire experience.*

- `CHROMATIC_ABERRATION` — RGB channels separate based on scroll velocity.
  Scrolling fast = strong RGB split across the entire page. Settling to a stop = channels
  merge back into alignment. Makes the page feel like a high-speed film scan.
  Built with a CSS backdrop-filter or Three.js post-processing pass.

- `GRAIN_REACTIVE` — Film grain overlay intensity increases with scroll speed.
  Slow browsing = clean, smooth. Fast scrolling = heavy grain, cinematic texture.
  On mobile: fixed grain level (no velocity tracking). Uses SVG feTurbulence filter.

- `COLOR_TEMP_SHIFT` — The page's color temperature transitions across sections.
  Cold blue at the top (problem). Neutral in the middle (solution). Warm amber at
  the bottom (outcome). Built via CSS custom property transitions on scroll.
  Subtle but transformative — users feel the emotional shift without understanding why.

- `GLITCH_TRANSITION` — Between sections, a brief (200–400ms) digital glitch:
  RGB channel displacement, horizontal scan artifacts, pixel corruption.
  Not random — triggered on specific section entries for maximum impact.
  Best for: cyberpunk, tech brands, music, anything that should feel raw.

- `CINEMATIC_BARS` — Black letterbox bars (top and bottom) that appear as the user
  scrolls deeper into the site. At the hero: full screen. By the mid-page: 10% bars.
  At the final CTA: the bars retract, releasing the full frame for the close.
  Creates a literal "entering a film" sensation as the site unfolds.

- `DEPTH_OF_FIELD` — Elements at different Z-positions blur or sharpen based on
  where the user is in the page. Hero foreground elements are sharp; background blurs.
  As the user scrolls, different "focal planes" come into focus and recede.
  CSS: `filter: blur()` on layers. Three.js: post-processing DepthOfField pass.

- `VELOCITY_TILT` — All page elements tilt slightly in the direction of scroll
  velocity. Scrolling fast down = everything tilts forward. Stopping = tilt eases
  back to neutral. The page physically responds to movement, not just position.
  Creates sensation of weight and physics in a 2D page.

- `INK_SPREAD` — Section backgrounds begin as a single ink droplet and spread
  outward to fill the section as it enters the viewport. Built with SVG mask +
  CSS clip-path animation or WebGL shader. Works beautifully for about sections,
  origin stories, and reveal moments. Best on dark-background sections.

- `VIGNETTE_REACTIVE` — Page vignette (darkened edges) reacts to content.
  Intense/problem sections: heavy vignette (focus inward).
  Solution/CTA sections: vignette lifts (world opens up, lightens).
  Built with a fixed CSS radial gradient that transitions opacity.

---

### How to Assign — Complete Rules (All 6 Classes + Optional FX)

```
DEFAULT SPREAD — 3 concepts, use these combinations:
  Most projects:    Concept 1: A or G  |  Concept 2: C or E  |  Concept 3: B or H
  SaaS / product:   Concept 1: E       |  Concept 2: A       |  Concept 3: H
  Agency/portfolio: Concept 1: G       |  Concept 2: C       |  Concept 3: F
  Luxury/fashion:   Concept 1: I       |  Concept 2: E       |  Concept 3: D
  Tech/startup:     Concept 1: B       |  Concept 2: G       |  Concept 3: I

LAYER RULES:
  Class F (Thread) → always optional, can layer on ANY concept
  Class I (Visual FX) → always optional, can layer on ANY concept
  A concept can have: 1 Primary (A/B/C/D/E/G/H) + 1 Thread (F) + 1 FX (I)

STORYLINE ALIGNMENT:
  Storyline 01 (Awakening)   → C (CHAPTER_SNAP) + I (COLOR_TEMP_SHIFT) + E
  Storyline 02 (Expedition)  → C (STORY_SCROLL) + H (INFINITE_LOOP_TRACK) + F
  Storyline 03 (Evidence)    → A (FRAME_SCROLL) + H (DEPTH_CARDS_3D) + G
  Storyline 04 (Philosophy)  → G (TEXT_MASK_REVEAL) + E (TEXT_CINEMATIC) + I
  Storyline 05 (Cinema)      → C (CHAPTER_SNAP) + I (CINEMATIC_BARS) + F
  Storyline 06 (Origin)      → C (STORY_SCROLL) + G (BLUR_FOCUS_TEXT) + F
  Storyline 07 (Contrast)    → A (SECTION_MORPH) + I (GLITCH_TRANSITION) + B
  Storyline 08 (The World)   → D (PARTICLE_FIELD) + I (DEPTH_OF_FIELD) + F

```

```
CONCEPT [N]: "[Name]"
PRIMARY BEHAVIOR:  [Class A/B/C/D/E/G/H] — [BEHAVIOR_NAME]
THREAD BEHAVIOR:   [Class F — BEHAVIOR_NAME]  (optional)
VISUAL FX:         [Class I — FX_NAME]  (optional)
─────────────────────────────────────────────────────────
```

Before generating 3 concept cards:
```
1. Read LEDGER.json → check "storyline.id" → note the primary scroll behavior
2. Assign one class per concept — default spread: A, C, E (shows best range)
3. The storyline's primary behavior must appear in at least ONE concept
4. Never repeat a class OR behavior across the 3 concepts
5. Consider one Class F (persistent) behavior as a LAYER on top of any concept
   (Class F behaviors work alongside primary behaviors, not instead of them)
6. Document assigned behavior at top of concept card
```

**Recommended spreads by storyline:**
```
Storyline 01 (Awakening)    → Class C (CHAPTER_SNAP) + A + E
Storyline 02 (Expedition)   → Class C (STORY_SCROLL) + B + F
Storyline 03 (Evidence)     → Class A (FRAME_SCROLL) + C + E
Storyline 04 (Philosophy)   → Class E (TEXT_CINEMATIC) + C + D
Storyline 05 (Cinema)       → Class C (CHAPTER_SNAP) + D + F (FLOATING_3D_ANCHOR)
Storyline 06 (Origin)       → Class C (STORY_SCROLL) + E + F (PROGRESS_THREAD)
Storyline 07 (Contrast)     → Class A (SECTION_MORPH) + C + B
Storyline 08 (The World)    → Class D + A + F (AMBIENT_3D_FIELD)
```

**Class F is always optional but powerful:** A Class F behavior added to any concept
turns a good site into a cohesive cinematic world. Recommend it whenever:
- The brand is luxury / premium / high-production
- The storyline has 5+ sections (continuity threading adds value)
- The user said they want it to "feel like one world"

```
CONCEPT [N]: "[Name]"
PRIMARY BEHAVIOR: [Class A/B/C/D/E] — [BEHAVIOR_NAME]
THREAD BEHAVIOR: [Class F — BEHAVIOR_NAME] (optional layer)
────────────────────────────────────────────────────────
```

### Behavior → Code Mapping (all 9 classes, 60+ behaviors)

| Behavior | Code Location |
|---|---|
| `FRAME_SCROLL` | scrollytelling.md → Frame Extraction |
| `IMMERSIVE_ZOOM` | animation-library.md → Immersive Zoom |
| `PARALLAX_DEPTH` | animation-library.md → Depth Parallax |
| `DEPTH_LAYERS` | scrollytelling.md → Progress-Aware Sections |
| `SCROLL_WARP` | scrollytelling.md → Shader + Scroll |
| `EXPLODING_OBJECT` | animation-library.md → Particle Scatter |
| `GRAVITY_SCATTER` | animation-library.md → Gravity Drop |
| `MAGNETIC_PULL` | animation-library.md → Cursor Gravity |
| `ORBITAL_SPIN` | motion-code-library.md → Scroll-Linked 3D |
| `LIQUID_MORPH` | animation-library.md → Liquid Distortion |
| `MAGNETIC_CARDS` | animation-library.md → 3D Card Hover |
| `ELASTIC_DRAG` | animation-library.md → Cursor Gravity (elastic) |
| `WEIGHT_DROP` | animation-library.md → Gravity Drop (heavy) |
| `CURTAIN_CUT` | animation-library.md → Cinematic Curtain |
| `DOLLY_PUSH` | animation-library.md → Pin & Zoom |
| `STORY_SCROLL` | scrollytelling.md → Horizontal Story Scroll |
| `CHAPTER_SNAP` | scrollytelling.md → Chapter Snap |
| `TYPEWRITER_REVEAL` | remotion-layer.md → TypeReveal |
| `WORD_STREAM` | scrollytelling.md → Master Timeline |
| `SCRAMBLE_TEXT` | animation-library.md → Class G |
| `WIPE_TRANSITION` | animation-library.md → Section Wipe |
| `AURORA_REACTIVE` | animation-library.md → Aurora/Mesh |
| `PARTICLE_FIELD` | animation-library.md → Particle Scatter |
| `CURSOR_SPOTLIGHT` | animation-library.md → Class I Visual FX |
| `CURSOR_DISTORT` | animation-library.md → Cursor Gravity |
| `AMBIENT_VIDEO_REACT` | animation-library.md → Scroll-Scrubbed Video |
| `MULTI_STATE_HERO` | scrollytelling.md → Multi-State Hero |
| `PROGRESSIVE_DISCLOSURE` | scrollytelling.md → Progress-Aware |
| `TEXT_CINEMATIC` | scrollytelling.md → Master Timeline |
| `SCROLL_COUNTDOWN` | scrollytelling.md → Progress-Aware |
| `STORY_BEAT` | scrollytelling.md → Chapter Snap |
| `FLOATING_3D_ANCHOR` | motion-code-library.md → Floating 3D Anchor |
| `PROGRESS_THREAD` | animation-library.md → Class H |
| `STICKY_COUNTER` | animation-library.md → Counter Roll |
| `AMBIENT_3D_FIELD` | scrollytelling.md → WebGL Scroll Scene |
| `SCROLL_COMPANION` | motion-code-library.md → Three.js |
| `TEXT_MASK_REVEAL` | animation-library.md → Class G Typography |
| `VARIABLE_FONT_ANIMATE` | animation-library.md → Class G Typography |
| `KINETIC_TYPE` | animation-library.md → Class G Typography |
| `BLUR_FOCUS_TEXT` | animation-library.md → Class G Typography |
| `STAGGER_LINES` | animation-library.md → Stagger Cascade |
| `OVERSIZED_BG_TYPE` | animation-library.md → Wild Patterns |
| `SCRAMBLE_REVEAL` | animation-library.md → Class G Typography |
| `COUNTER_CINEMA` | animation-library.md → Counter Roll |
| `SPLIT_SCREEN_SCROLL` | animation-library.md → Class H Layout |
| `INFINITE_LOOP_TRACK` | animation-library.md → Class H Layout |
| `DRAG_EXPLORE` | animation-library.md → Class H Layout |
| `DEPTH_CARDS_3D` | animation-library.md → 3D Card Hover + Three.js |
| `ACCORDION_RICH` | animation-library.md → Class H Layout |
| `MASONRY_BUILD` | animation-library.md → Stagger Cascade + Gravity |
| `STICKY_SIDE_PANEL` | animation-library.md → Class H Layout |
| `CIRCULAR_ARRANGEMENT` | motion-code-library.md → Three.js |
| `CHROMATIC_ABERRATION` | animation-library.md → Class I Visual FX |
| `GRAIN_REACTIVE` | animation-library.md → Class I Visual FX |
| `COLOR_TEMP_SHIFT` | animation-library.md → Class I Visual FX |
| `GLITCH_TRANSITION` | animation-library.md → Class I Visual FX |
| `CINEMATIC_BARS` | animation-library.md → Class I Visual FX |
| `DEPTH_OF_FIELD` | animation-library.md → Class I Visual FX |
| `VELOCITY_TILT` | animation-library.md → Class I Visual FX |
| `INK_SPREAD` | animation-library.md → Class I Visual FX |
| `VIGNETTE_REACTIVE` | animation-library.md → Class I Visual FX |

---

## VIDEO LOOP PROMPT FORMULAS

### Formula 1 — Abstract / Atmospheric
```
[Subject] in [environment] — [camera movement] — [lighting description] —
ultra slow motion — no text — [color temperature] dominant —
seamless loop — [duration]s — cinematic [aspect ratio]
```
Example: "Liquid mercury pooling and flowing over matte black glass — static camera,
extreme macro — cool blue-white light from below — ultra slow motion — no text —
silver and black dominant — seamless loop — 10s — cinematic 16:9"

### Formula 2 — Product / Object Focus
```
[Product/object] [action/state] in [environment] — [camera movement] —
[lighting] — photorealistic — no people — [mood] atmosphere —
seamless loop — [duration]s
```

### Formula 3 — Environmental / Landscape
```
[Environment] [time of day] — [weather/atmosphere] — [camera movement] —
no people — [color palette] tones — cinematic depth of field —
subtle motion only — seamless loop — [duration]s
```

---

## CONCEPT NAMING CONVENTIONS

Concept names should be evocative two-word pairs that hint at the mood:
- "The Quiet Authority" (minimal, dark, corporate power)
- "The Golden Hour" (warm, optimistic, lifestyle)
- "Deep Signal" (tech, precise, electric)
- "Soft Architect" (organic, editorial, luxe)
- "The Mercury Line" (sleek, modern, motion-forward)
- "Wild Precision" (energetic but controlled, sport/health)
- "Amber Protocol" (warm tech, human-centered SaaS)
- "Void & Bloom" (dramatic contrast, fashion/beauty)

Name the concept before writing the card. The name should guide the rest.

---

## POST-CONCEPT BLEND INSTRUCTIONS

If the user selects elements from multiple concepts, produce a **Final Scene Brief**:

```
╔═══════════════════════════════════════════════════════╗
║  FINAL SCENE BRIEF — [Project Name]                   ║
╚═══════════════════════════════════════════════════════╝

DERIVED FROM: Concept [X] base + [specific elements] from Concept [Y]

[Rewrite a single unified card using the blended elements.
 Resolve any conflicts (e.g. if one was warm and one was cold,
 decide: split between sections? or create a new bridge tone?)
 The Final Scene Brief is what Phase 3 builds from — it must be
 internally consistent and complete.]
```
