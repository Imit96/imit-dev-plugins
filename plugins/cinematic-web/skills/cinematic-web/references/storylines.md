# Cinematic Web — Storyline Architecture

## WHAT IS A STORYLINE?

A storyline is the narrative structure of a page — HOW the story is told,
not just what it looks like. It answers: what journey does the visitor take
from landing to CTA? What sequence of emotions does the page deliver?

Every great cinematic site has a storyline. Most sites don't. The difference
is felt immediately: one pulls you through, the other is just content.

**When to present storylines:** Phase 1.7 (after section identity) before Phase 2.
The storyline determines section order, scroll behavior, and which capabilities are used.

---

## HOW TO PRESENT STORYLINES TO THE USER

After Phase 1.7 is locked, say:

```
Before we generate your scene concepts, let's decide the narrative arc
of the site — how it tells its story as the user scrolls.

Here are storyline directions that match your brand. Each uses different
cinematic techniques to create a different emotional journey.
Pick one or describe your own.
```

Then present 3 storyline options drawn from the catalog below,
matched to the brand tone and application type.

---

## STORYLINE CATALOG

Each storyline has:
- NARRATIVE ARC — the emotional journey
- SECTION ORDER — how the page is structured
- PRIMARY SCROLL BEHAVIOR — the main cinematic technique
- CAPABILITIES USED — which skill features this showcases
- BEST FOR — which industries and brand tones fit

---

### STORYLINE 01 — "THE AWAKENING"
*Darkness into light. The world before, then the world after.*

```
NARRATIVE ARC:
  The visitor enters a dark, quiet world.
  Something stirs — a hint of what's possible.
  The hero reveals itself: the product, the brand, the vision.
  The world transforms. This is the after.
  The visitor is invited to step through.

EMOTIONAL JOURNEY:
  Intrigue → curiosity → revelation → desire → action

SECTION ORDER:
  1. DARK HERO     — full-screen black with subtle ambient motion
  2. THE PROBLEM   — painful, restrained, almost uncomfortable
  3. THE REVEAL    — dramatic color shift, brand floods in
  4. THE SOLUTION  — cinematic showcase of product/service
  5. PROOF         — client results, testimonials
  6. INVITATION    — warm CTA, the door is open

PRIMARY SCROLL BEHAVIOR:
  CHAPTER_SNAP — each section is a chapter, full viewport, snaps into place
  The color temperature shifts from cold to warm as user progresses

CAPABILITIES USED:
  ✦ Chapter Snap with Observer (scrollytelling.md)
  ✦ Section color temperature progression (cold #0A0F1E → warm #1A0F0A)
  ✦ Cinematic Curtain entry per chapter
  ✦ WebGL aurora that changes color with chapter progress
  ✦ Remotion BrandReveal composition for the hero moment

BEST FOR:
  SaaS products with a clear before/after
  Health/wellness brands
  Financial products (wealth creation narrative)
  Any brand selling transformation
  Tone: dramatic · confident · empathetic

SAMPLE HEADLINE PROGRESSION:
  Section 1: "The way things are." (small, quiet)
  Section 3: "[BRAND NAME]" (giant, sudden)
  Section 6: "Begin." (one word, one action)
```

---

### STORYLINE 02 — "THE EXPEDITION"
*We're going somewhere. Come with us.*

```
NARRATIVE ARC:
  The visitor joins a journey in progress.
  The destination is shown first — make it desirable.
  The path is revealed — each section is a milestone.
  The team, the process, the proof — all along the route.
  Arrival: the visitor has made the journey. Now: join for real.

EMOTIONAL JOURNEY:
  Excitement → trust-building → belonging → confidence → commitment

SECTION ORDER:
  1. THE DESTINATION  — where you'll end up (hero)
  2. MILESTONE 1      — first capability / benefit
  3. MILESTONE 2      — second capability / benefit
  4. MILESTONE 3      — third capability / benefit
  5. THE CREW         — team / process / how it works
  6. PROOF POINTS     — who's already arrived (testimonials)
  7. DEPARTURE GATE   — CTA ("start your journey")

PRIMARY SCROLL BEHAVIOR:
  STORY_SCROLL — horizontal narrative driven by vertical scroll
  Each milestone is a horizontal chapter; scroll down = travel forward

CAPABILITIES USED:
  ✦ Horizontal Story Scroll (scrollytelling.md)
  ✦ Progress-aware sections (scrollytelling.md)
  ✦ Scroll-linked 3D object — rotates as user travels (motion-code-library.md)
  ✦ Counter Roll — stats counting up as milestones are reached
  ✦ Parallax depth layers — sense of forward motion

BEST FOR:
  Agencies and studios (showing the build process)
  SaaS with a clear onboarding journey
  E-commerce with a story (artisan, craft, farm-to-table)
  Startups building something ambitious
  Tone: adventurous · optimistic · forward-moving
```

---

### STORYLINE 03 — "THE EVIDENCE"
*Show everything. Hold nothing back.*

```
NARRATIVE ARC:
  No setup. No warmup. Lead with the most impressive thing.
  Then prove it, again and again, from every angle.
  The visitor becomes a believer through accumulated evidence.
  The CTA is inevitable — they're already convinced.

EMOTIONAL JOURNEY:
  Instant impact → growing confidence → overwhelm (good) → certainty → action

SECTION ORDER:
  1. STRONGEST WORK   — best case study or product moment (no headline needed)
  2. HEADLINE         — now they're ready to hear what this is
  3. WORK REEL        — horizontal scroll of portfolio/product
  4. NUMBERS          — data, stats, outcomes (the proof layer)
  5. VOICES           — what clients say (social proof)
  6. THE ASK          — simple, direct CTA (they already want it)

PRIMARY SCROLL BEHAVIOR:
  FRAME_SCROLL hero → HORIZONTAL track for work reel → MASTER_TIMELINE
  Frame scrub on entry: the first image assembles itself as you scroll in

CAPABILITIES USED:
  ✦ Scroll Scrub Frame Sequence — hero image assembles frame by frame
  ✦ Horizontal Track — portfolio scrolls sideways
  ✦ Counter Roll — stats animate when reached
  ✦ Gravity Drop — testimonials fall into place
  ✦ Veo 3 video — case study hero clips autoplay on enter
  ✦ WebGL particle field — ambient energy throughout

BEST FOR:
  Creative agencies and studios
  Portfolio sites
  Products with strong visual results
  Brands that have impressive numbers
  Tone: confident · direct · results-driven
```

---

### STORYLINE 04 — "THE PHILOSOPHY"
*We believe something. Everything follows from that belief.*

```
NARRATIVE ARC:
  A single belief is stated at the top, as a provocation.
  The consequences of that belief unfold as the user scrolls.
  Each section is a chapter of the philosophy in action.
  The visitor either agrees or leaves. Those who stay are ideal clients.
  The CTA is an invitation to share the belief.

EMOTIONAL JOURNEY:
  Curiosity (is this my belief?) → recognition → alignment → desire → belonging

SECTION ORDER:
  1. THE BELIEF       — one sentence, giant, full screen
  2. WHY IT MATTERS   — the consequence of the belief
  3. HOW WE ACT ON IT — the methodology
  4. WHO WE DO IT FOR — the ideal client portrait
  5. PROOF            — the belief in action (results)
  6. THE INVITATION   — "if you believe this too..."

PRIMARY SCROLL BEHAVIOR:
  MASTER_TIMELINE — entire page is one continuous scrubbed timeline
  Text reveals progressively. The site breathes as you scroll.

CAPABILITIES USED:
  ✦ Scroll-Driven Master Timeline (scrollytelling.md)
  ✦ Text word-by-word reveal synced to scroll progress
  ✦ Aurora background that shifts with scroll progress
  ✦ Section fade-center (sections peak and fade as user passes)
  ✦ Remotion TypeReveal composition for belief statement

BEST FOR:
  Consulting firms and advisors
  Mission-driven companies
  Luxury brands with strong aesthetic philosophy
  Founders who have a strong point of view
  Tone: intellectual · opinionated · selective · confident
```

---

### STORYLINE 05 — "THE CINEMA"
*You are watching a film. The product is the star.*

```
NARRATIVE ARC:
  The site opens like a film — dark, deliberate, cinematic score implied.
  The product/service is introduced like a character.
  The user watches it perform across different scenes.
  The final scene: the invitation to step into the story.

EMOTIONAL JOURNEY:
  Awe → intrigue → admiration → aspiration → desire → action

SECTION ORDER:
  1. OPENING SHOT     — full-screen video or WebGL (no text, pure visual)
  2. TITLE CARD       — brand name appears after 3-4 seconds
  3. ACT I: THE WORLD — the context this product exists in
  4. ACT II: THE HERO — the product/service in detail
  5. ACT III: IMPACT  — what changes when you use it
  6. CREDITS          — team, process, proof
  7. THE AFTER-CREDITS — unexpected CTA (subvert the form)

PRIMARY SCROLL BEHAVIOR:
  CHAPTER_SNAP — full-viewport chapters snap like film frames
  Each chapter has its own complete visual identity

CAPABILITIES USED:
  ✦ Veo 3 opening shot — 8-12s atmospheric video, no UI
  ✦ Chapter Snap with cinematic enter/leave animations
  ✦ Remotion BrandReveal — title card moment
  ✦ WebGL camera flight — ACT I to ACT II transition
  ✦ Section identity system — each ACT is a different visual world
  ✦ Remotion BrandReel — as client deliverable after session

BEST FOR:
  Premium consumer products
  Luxury brands
  Creative studios
  Film/media companies
  High-end real estate
  Tone: cinematic · premium · art-directed · slow · deliberate
```

---

### STORYLINE 06 — "THE ORIGIN"
*Where we came from makes what we are inevitable.*

```
NARRATIVE ARC:
  The site begins in the past — a problem, a moment, a founder's realization.
  It moves through time: the build, the pivots, the breakthroughs.
  It arrives at the present: this product, this team, this result.
  The future is offered to the visitor: become part of the story.

EMOTIONAL JOURNEY:
  Recognition (of the problem) → empathy → trust → inspiration → action

SECTION ORDER:
  1. THE FOUNDING MOMENT   — the exact moment the idea was born
  2. THE PROBLEM           — what they saw that others missed
  3. THE EARLY DAYS        — raw, honest, before it was polished
  4. THE BREAKTHROUGH      — when it clicked
  5. TODAY                 — the result (product/service)
  6. THE NEXT CHAPTER      — the visitor joins the story

PRIMARY SCROLL BEHAVIOR:
  HORIZONTAL STORY SCROLL — the timeline moves left to right as user scrolls down
  Year markers appear on the progress bar

CAPABILITIES USED:
  ✦ Horizontal Story Scroll with year markers (scrollytelling.md)
  ✦ Photo parallax — historical images move at different speeds
  ✦ Counter Roll — years in business, people helped, etc.
  ✦ Typewriter reveal — the founding moment types itself
  ✦ Section temperature shift — past is cool/desaturated, present is warm/vivid

BEST FOR:
  Founder-led brands with a strong origin story
  Companies with an interesting history
  Non-profits and mission-driven organizations
  Brands where authenticity is core to the value
  Tone: authentic · human · warm · earned · honest
```

---

### STORYLINE 07 — "THE CONTRAST"
*Everything you've seen. Then this.*

```
NARRATIVE ARC:
  The visitor is shown the industry standard — the familiar, the expected.
  Then: a hard cut. Everything flips.
  The alternative is revealed. The contrast is the message.
  The rest of the site lives in the alternative world.

EMOTIONAL JOURNEY:
  Familiarity → boredom/recognition → disruption → delight → loyalty

SECTION ORDER:
  1. THE OLD WAY        — intentionally generic, almost boring (the joke)
  2. THE CUT            — hard transition, everything changes
  3. THE NEW WAY        — the brand's approach, fully expressed
  4. SIDE BY SIDE       — direct comparison (optional, if confident)
  5. RESULTS            — what the new way produces
  6. JOIN THE SHIFT     — CTA framed as choosing a side

PRIMARY SCROLL BEHAVIOR:
  SECTION_MORPH — the visual style literally transforms between sections
  Split color on the transition section (half old, half new)

CAPABILITIES USED:
  ✦ Section Morph with clip-path (animation-library.md)
  ✦ Split Color section at the contrast moment (animation-library.md)
  ✦ Wild section pattern — Diagonal Break between old/new
  ✦ Intensity shift: Section 1 is Level 1, Section 3 is Level 4
  ✦ Color inversion on the cut — entire palette flips

BEST FOR:
  Disruptive brands entering established markets
  Agencies competing against big firms
  Products that are genuinely different
  Brands with confidence in their differentiation
  Tone: provocative · confident · irreverent · direct
```

---

### STORYLINE 08 — "THE WORLD"
*Immerse first. Explain later.*

```
NARRATIVE ARC:
  The visitor doesn't land on a page — they enter a world.
  No immediate explanation. Pure immersion.
  The world reveals its logic gradually through exploration.
  By the time explanation arrives, the visitor is already inside.

EMOTIONAL JOURNEY:
  Immersion → discovery → wonder → understanding → belonging

SECTION ORDER:
  1. THE WORLD ENTRY   — full-screen WebGL scene, no text, 3D space
  2. THE FIRST DETAIL  — a single element of the world explained
  3. THE EXPANSION     — the world grows as you scroll (camera flies forward)
  4. THE INHABITANTS   — the people/clients/uses that live here
  5. THE INVITATION    — "step inside permanently"

PRIMARY SCROLL BEHAVIOR:
  WebGL Camera Flight — scroll drives camera through 3D space
  The entire journey is a continuous camera move through one scene

CAPABILITIES USED:
  ✦ WebGL Scroll Scene with camera flight (scrollytelling.md)
  ✦ Particle tunnel — camera flies through branded particles
  ✦ Fog clears with scroll — reveals depth progressively
  ✦ Floating 3D objects — branded geometry along the path
  ✦ Shader warp on section transitions (scrollytelling.md)
  ✦ Remotion HeroLoop — the world as a video artifact

BEST FOR:
  Gaming / entertainment brands
  Luxury / experiential products
  Creative technology companies
  Brands where the experience IS the product
  Tone: immersive · mysterious · premium · technical · otherworldly
```

---

## HOW TO CHOOSE THE RIGHT STORYLINE

Present this decision matrix when multiple storylines seem to fit:

```
USER ASKED "WHICH STORYLINE IS RIGHT FOR ME?" — use this:

Does the brand have a strong founding story?
  YES → Storyline 06 (The Origin)

Is the product solving a well-known frustrating problem?
  YES → Storyline 01 (The Awakening) or 07 (The Contrast)

Is the brand visually portfolio-driven (show the work)?
  YES → Storyline 03 (The Evidence)

Is there a clear multi-step process or journey?
  YES → Storyline 02 (The Expedition)

Is the founder / brand strongly opinionated?
  YES → Storyline 04 (The Philosophy)

Is this a premium / luxury / immersive experience?
  YES → Storyline 05 (The Cinema) or 08 (The World)

Still unclear after these? → Default to Storyline 03 (The Evidence).
  It works for every industry and showcases the widest range of capabilities.
```

---

## STORYLINE → CAPABILITY MATRIX

Which storyline showcases which skill capabilities.
Use this when recommending storylines to users who want to see specific features.

| Storyline | Ch.Snap | Horiz | Master TL | WebGL | Frame Scrub | Remotion | Multi-State | Float 3D | Typography | Visual FX |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 01 Awakening  | ✦ | · | · | ✦ | · | ✦ | ✦ | · | · | COLOR_TEMP |
| 02 Expedition | · | ✦ | · | · | · | · | · | · | · | · |
| 03 Evidence   | · | ✦ | ✦ | · | ✦ | · | · | · | G | · |
| 04 Philosophy | · | · | ✦ | · | · | ✦ | · | · | TEXT_MASK | · |
| 05 Cinema     | ✦ | · | · | ✦ | · | ✦ | ✦ | ✦ | · | CINEMATIC_BARS |
| 06 Origin     | · | ✦ | · | · | · | · | · | F | BLUR_FOCUS | · |
| 07 Contrast   | · | · | · | · | · | · | · | · | · | GLITCH |
| 08 The World  | · | · | · | ✦ | · | ✦ | · | ✦ | · | DEPTH_OF_FIELD |

**Recommended behavior spread per storyline (for Phase 2 concept cards):**
```
Storyline 01 → Primary: C (CHAPTER_SNAP) | FX: I (COLOR_TEMP_SHIFT) | Thread: E (MULTI_STATE_HERO)
Storyline 02 → Primary: C (STORY_SCROLL) | FX: none | Thread: F (PROGRESS_THREAD)
Storyline 03 → Primary: A (FRAME_SCROLL) | FX: none | Secondary: H (DEPTH_CARDS_3D)
Storyline 04 → Primary: G (TEXT_MASK_REVEAL) | FX: none | Secondary: E (TEXT_CINEMATIC)
Storyline 05 → Primary: C (CHAPTER_SNAP) | FX: I (CINEMATIC_BARS) | Thread: F (FLOATING_3D_ANCHOR)
Storyline 06 → Primary: C (STORY_SCROLL) | FX: none | Secondary: G (BLUR_FOCUS_TEXT)
Storyline 07 → Primary: A (SECTION_MORPH) | FX: I (GLITCH_TRANSITION) | Secondary: B (EXPLODING_OBJECT)
Storyline 08 → Primary: D (PARTICLE_FIELD) | FX: I (DEPTH_OF_FIELD) | Thread: F (AMBIENT_3D_FIELD)
```

To showcase the **most** capabilities → Storyline 05 (Cinema) or 03 (Evidence).
To showcase **new** behaviors (Class E/F/G/H/I) → Storyline 04 (Philosophy) or 08 (The World).
