# Cinematic Web — Content Strategy Layer

## TABLE OF CONTENTS
1. [Why Content Is Always Short — The Root Problem](#problem)
2. [Phase 5 Content Generation Protocol](#protocol)
3. [Content Briefs — Per Page Type](#briefs)
4. [Copy Frameworks Per Industry](#frameworks)
5. [Content Depth Checklist](#checklist)
6. [When to Flag a Content Strategist](#strategist)

---

## WHY CONTENT IS ALWAYS SHORT — THE ROOT PROBLEM {#problem}

Generated sites are visually strong but content-thin by default because:

1. The skill generates structure and placeholder copy simultaneously —
   placeholders are always shorter than real copy
2. Discovery questions focus on brand direction, not content inventory
3. No content audit happens before code generation
4. Section copy is written to fit the component, not to serve the user

**The fix:** Run content generation as a dedicated sub-phase inside Phase 5,
BEFORE the component code is written. Content drives layout, not the reverse.

---

## PHASE 5 CONTENT GENERATION PROTOCOL {#protocol}

### Step 5.0 — READ THE LEDGER BEFORE WRITING A SINGLE WORD

Content is the last thing generated but the first thing shaped by every design decision.
Before asking content inventory questions, read these locked decisions from LEDGER.json:

```
READ FROM LEDGER:
  storyline.id         → determines section order + narrative arc
  storyline.sections   → the exact sections to write content for
  paradigm.base        → determines copy density (see paradigm matrix below)
  paradigm.intensity   → determines word count caps (see intensity matrix below)
  animations.hero      → determines headline length constraint
  brand.tone           → determines voice and register
  brand.headline       → the approved H1 (do not rewrite unless user asks)
```

Then adapt the entire content approach based on those values BEFORE asking any questions.

---

### Step 5.0A — Paradigm × Copy Density Matrix

Different paradigms demand radically different copy approaches.
Never write dense prose for a Brutalism site. Never write fragments for an Organic site.

```
PARADIGM              COPY DENSITY    HEADLINE STYLE       BODY TEXT APPROACH
─────────────────────────────────────────────────────────────────────────────
Brutalism             SPARSE          1–3 word provocations No body text per section
                                      "Wrong." "Different." Fragment. Then silence.
                                      "Everyone else."

Motion Design System  BALANCED        5–8 word benefit      1–2 sentence max per point
                                      Clear, direct, active  Bullet-scannable

Glassmorphism         EDITORIAL       6–10 word headlines   Short refined paragraphs
                                      Sophisticated, layered 30–50 words per section

Maximalism            DENSE-LAYERED   Multiple simultaneous  Overlapping text layers
                                      text elements OK       Density is the aesthetic

Minimalism            ULTRA-SPARSE    4–6 words maximum     Single sentence or nothing
                                      Every word earns its   Long whitespace pauses
                                      place

Organic / Natural     FLOWING         8–14 word lines        Paragraph prose acceptable
                                      Warm, unhurried        Stories over bullet lists

Geometric             PRECISE         Exact numbers/facts    Technical specificity
                                      "97 components."       Data as poetry
                                      "Built in 14 days."

Dark Editorial        LITERARY        6–12 word headlines    Full paragraphs allowed
                                      Evocative, metaphoric  Voice-led writing

Retro / Nostalgic     CONVERSATIONAL  Casual, warm           Friendly prose
                                      "Hey, you're here."    First person OK

Cyberpunk / Tech      FRAGMENTED      3–6 word fragments     Code-style, truncated
                                      Uppercase acceptable   System log aesthetic

Luxury                MINIMALIST+     3–5 words per section  Prose only if truly earned
                                      Nothing obvious stated  Implication over statement
```

---

### Step 5.0B — Intensity × Word Count

Intensity from Phase 1.7 overrides the standard word count table.
High intensity = less text per section. The visual carries the weight.

```
INTENSITY   HERO HEADLINE   HERO SUB      SECTION BODY    CTA COPY
───────────────────────────────────────────────────────────────────
1 (Conserv) 6–10 words      20–35 words   60–100 words    25–40 words
2 (Balanced) 5–8 words      15–25 words   40–80 words     15–30 words
3 (Bold)    4–6 words       10–18 words   20–50 words     8–15 words
4 (Wild)    2–4 words       6–12 words    5–20 words      3–8 words
```

**Intensity 4 copy rule:** If it can be said in 3 words, say it in 3 words.
If it can't be said in 3 words — use a visual instead of words.

---

### Step 5.0C — Animation × Copy Constraints

Every animation type has hard copy constraints. Violating them breaks the animation.

```
ANIMATION TYPE          CONSTRAINT                    REASON
──────────────────────────────────────────────────────────────────────────────
TYPEWRITER_REVEAL       Headline ≤ 8 words            Longer = slow, boring reveal
WORD_STREAM             Headline ≤ 6 words            Each word is a scroll beat
SCRAMBLE_TEXT           Headline ≤ 5 words            Scramble loses impact on long text
GRAVITY_SCATTER         List items: 2–4 words each    Must be scannable as they "land"
CHAPTER_SNAP            Per chapter: ≤ 40 words total A chapter is read fast or not read
STORY_SCROLL            Per section: ≤ 25 words       User is traveling, not reading
MULTI_STATE_HERO        Per state: ≤ 8 words headline Each state is a micro-moment
MASTER_TIMELINE         Per segment: ≤ 20 words       Sync'd to scroll progress
TEXT_CINEMATIC          Entire section: ≤ 12 words    Full screen = one thought
PROGRESSIVE_DISCLOSURE  Per reveal: ≤ 15 words        Each reveal is a beat
CURTAIN_CUT             Headline: 3–6 words            Impact depends on brevity
PARALLAX_DEPTH          Any length works              Copy not constrained by parallax
AURORA_REACTIVE         Any length works              Ambient — copy is independent
FLOATING_3D_ANCHOR      Section body: ≤ 50 words      3D element demands visual space
```

---

### Step 5.0D — Storyline × Content Structure

Each storyline has a defined section order from Phase 1.8. Content must follow that order
exactly and serve each section's narrative role.

```
STORYLINE 01 — THE AWAKENING
  Section 1 (HERO/ANCHOR):     Problem language. What hurts right now. 2–4 words.
  Section 2 (BREATHING):       Amplify the pain. 1–2 short sentences.
  Section 3 (CONTRAST/CLIMAX): THE REVEAL. Brand name. Product. 1 headline, 1 subline.
  Section 4 (CONTRAST):        Solution proof. Features as outcomes. 3 items max.
  Section 5 (BREATHING):       Social proof. Numbers + short testimonials.
  Section 6 (CLIMAX):          Invitation. Warm, not pushy. 1 CTA, 1 subline.
  Copy rule: Sections 1-2 must make the reader slightly uncomfortable. That's the point.

STORYLINE 02 — THE EXPEDITION
  Each milestone section gets: Milestone name + 1 outcome sentence + 1 visual.
  The section order reads like a progress report: "First we..., Then we..., Finally..."
  Copy rule: Active verbs only. "We analyze" not "Analysis is performed."

STORYLINE 03 — THE EVIDENCE
  Section 1 (HERO/ANCHOR):     ONE powerful visual. NO copy. Let it land.
  Section 2 (BREATHING):       Now the headline. Now you can explain.
  Section 3 (CONTRAST):        Work shown, not described. Caption ≤ 15 words each.
  Section 4 (BREATHING):       Numbers only. Stats as a visual language.
  Section 5 (BREATHING):       Client voices. Specific outcomes only.
  Section 6 (CLIMAX):          Short, confident ask. They're already convinced.
  Copy rule: If you're tempted to explain something — add another case study instead.

STORYLINE 04 — THE PHILOSOPHY
  Section 1 (HERO/ANCHOR):     The belief. 1 declarative sentence. Max 10 words.
  Each following section:      Consequence + evidence + implication. 3 moves.
  CTA section:                 "If you believe this too..." — not "buy now."
  Copy rule: Never explain the belief. State it. Evidence proves it.

STORYLINE 05 — THE CINEMA
  Section 1 (ANCHOR):          No copy. Pure visual. 3–5 seconds minimum.
  Section 2:                   Brand name only. Typography as the statement.
  Subsequent sections:         Short act-title + 1 supporting line each.
  Copy rule: Write for the pause, not the read. Reader sees → feels → reads.

STORYLINE 06 — THE ORIGIN
  Timeline content:            Each moment = date + 1 sentence. No more.
  Founding moment:             The exact words. Specific. Granular. Real.
  Today section:               Product description can be fuller here.
  Copy rule: Specificity builds credibility. "2019" not "a few years ago."

STORYLINE 07 — THE CONTRAST
  Section 1 (OLD WAY):         Bland, expected language. On purpose. The joke.
  Section 2 (CONTRAST):        Visual flip only — let the contrast speak.
  Section 3 (NEW WAY):         Your language. Your voice. Complete freedom.
  Copy rule: The old way section should feel generic — that's the point.

STORYLINE 08 — THE WORLD
  Hero and first sections:     No copy. Allow the world to be experienced.
  First text moment:           Short label. Orient the user.
  Copy rule: When in doubt, write less. The world does the talking.
```

---

### Step 5.0E — Content Inventory Questions

NOW ask the inventory questions — after reading the ledger and applying all matrices:

```
Based on your locked storyline ([STORYLINE NAME]) and paradigm ([PARADIGM]):

Your section order is: [list from storyline]
Your copy style is: [X words per section, Y density from paradigm]

I need content for these specific sections:

[List each section with its word count target from intensity matrix
 and its animation constraint from Step 5.0C]

For each section, tell me:
1. What is the core message of this section? (1 sentence)
2. What proof do you have for it? (stat, quote, outcome, or visual)
3. Is there anything the reader is skeptical about here?

If you cannot answer — I will generate placeholder content matching
the storyline's narrative arc and flag which sections need real content.
```

If generated copy falls below these minimums — expand it. Never ship thin content.

---

## CONTENT BRIEFS — PER PAGE TYPE {#briefs}

### Homepage Brief

```
╔══════════════════════════════════════════════════════════════╗
║  HOMEPAGE CONTENT BRIEF                                     ║
╠══════════════════════════════════════════════════════════════╣
║ HERO                                                        ║
║   H1: [under 8 words — main promise]                       ║
║   H2: [15–25 words — who + outcome]                        ║
║   Body: [30–50 words — credibility or specificity]         ║
║   CTA 1: [verb phrase — 2–4 words]                         ║
║   CTA 2: [secondary action — 2–4 words]                    ║
║                                                              ║
║ SOCIAL PROOF BAR (below hero)                               ║
║   Logo 1–6: [client or partner logos]                      ║
║   OR Stat 1–3: [number + label, e.g. "140+ brands"]        ║
║                                                              ║
║ SERVICES / WHAT WE DO (3–6 items)                           ║
║   Each item: [name] + [40–60 word description]             ║
║   Link: → [page or anchor]                                  ║
║                                                              ║
║ SELECTED WORK (3–6 case study teasers)                      ║
║   Each: [client name] + [industry] + [year] + [60–80 word  ║
║         result summary] + [cover image]                     ║
║                                                              ║
║ ABOUT / PHILOSOPHY (brief section)                          ║
║   [80–120 words — why the studio exists, what they believe] ║
║                                                              ║
║ TESTIMONIALS (2–4)                                          ║
║   Each: [quote 40–70 words] + [name, role, company]        ║
║                                                              ║
║ CTA SECTION                                                 ║
║   Headline: [provocation or invitation — 6–12 words]        ║
║   Body: [20–40 words — what happens next]                   ║
║   CTA: [primary action]                                     ║
╚══════════════════════════════════════════════════════════════╝
```

### About Page Brief

```
╔══════════════════════════════════════════════════════════════╗
║  ABOUT PAGE CONTENT BRIEF                                   ║
╠══════════════════════════════════════════════════════════════╣
║ ORIGIN STORY (120–200 words)                                ║
║   Why was this studio / company started?                    ║
║   What problem did the founder see that others ignored?     ║
║   What was the turning point or founding moment?            ║
║                                                              ║
║ PHILOSOPHY / BELIEFS (3–4 belief statements)                ║
║   Each: [bold statement] + [40–60 word explanation]        ║
║   Format: "We believe [X] because [Y]"                      ║
║                                                              ║
║ PROCESS (4–6 steps)                                         ║
║   Each: [step name] + [30–50 word description]              ║
║   What makes this process different from competitors?        ║
║                                                              ║
║ TEAM (if applicable)                                        ║
║   Each member: [name] + [role] + [50–80 word bio]          ║
║   What unique perspective do they bring?                    ║
║                                                              ║
║ BY THE NUMBERS (3–5 stats)                                  ║
║   [number + label] — must be real, not generic              ║
║   Examples: years in operation, projects completed,         ║
║   countries reached, industries served, awards won          ║
║                                                              ║
║ CLIENTS / PARTNERS                                          ║
║   Logos with optional brief context                         ╠══════════════════════════════════════════════════════════════╣
║ CTA                                                         ║
║   [What do you want someone who just read this to do?]      ║
╚══════════════════════════════════════════════════════════════╝
```

### Services / Work Page Brief

```
╔══════════════════════════════════════════════════════════════╗
║  SERVICES PAGE CONTENT BRIEF                                ║
╠══════════════════════════════════════════════════════════════╣
║ INTRO (60–100 words)                                        ║
║   What problem category do your services solve?             ║
║   Who is the ideal client for each service?                 ║
║                                                              ║
║ EACH SERVICE (repeat per service):                          ║
║   Name: [service name]                                      ║
║   Problem: [what the client is suffering without this]      ║
║   Solution: [what you do, specifically]                     ║
║   Outcome: [what the client has after — measurable if poss] ║
║   Deliverables: [bullet list — 4–8 specific outputs]        ║
║   Case study link: [related project if applicable]          ║
║   Price signal: [starting from / custom / on request]       ║
║                                                              ║
║ HOW WE WORK TOGETHER (the engagement model)                 ║
║   [60–100 words on what working with you actually looks like]║
║                                                              ║
║ FAQ (4–6 questions)                                         ║
║   The questions clients always ask before signing           ║
║   Each answer: [40–80 words — direct, honest]               ║
╚══════════════════════════════════════════════════════════════╝
```

### Case Study / Work Page Brief

```
╔══════════════════════════════════════════════════════════════╗
║  CASE STUDY CONTENT BRIEF                                   ║
╠══════════════════════════════════════════════════════════════╣
║ OVERVIEW (50–80 words)                                      ║
║   Client: [name + what they do in one sentence]             ║
║   Challenge: [the problem they came with]                   ║
║   Scope: [what services were involved]                      ║
║   Timeline: [duration]                                      ║
║                                                              ║
║ THE CHALLENGE (100–150 words)                               ║
║   What was broken, missing, or not working?                 ║
║   What was at stake for the client?                         ║
║   Why had previous solutions failed?                        ║
║                                                              ║
║ THE APPROACH (100–150 words)                                ║
║   What was your thinking / strategy?                        ║
║   What made your approach different?                        ║
║   What decisions were made and why?                         ║
║                                                              ║
║ THE WORK (visuals-heavy — light copy)                       ║
║   3–8 images / screens / mockups with brief captions        ║
║   Caption: [20–30 words explaining what the viewer sees]    ║
║                                                              ║
║ THE RESULTS (most important section)                        ║
║   3–5 quantified outcomes if possible:                      ║
║   "X% increase in Y" / "Launched in Z weeks" / "N new leads"║
║   Quote from client: [40–60 words, specific outcome]        ║
║                                                              ║
║ NEXT PROJECT LINK                                           ║
║   [next case study name + teaser image]                     ║
╚══════════════════════════════════════════════════════════════╝
```

---

## COPY FRAMEWORKS PER INDUSTRY {#frameworks}

### Creative Agency / Portfolio

**Voice:** Confident, not arrogant. Show don't tell. Specific over vague.
**Avoid:** "We're passionate about..." / "We help brands..." / "Creative solutions"
**Use instead:** Outcomes, named clients, specific numbers, strong opinions

**Hero formulas that work:**
```
Formula A: [Adjective] [noun] for [specific audience]
  → "Cinematic identities for brands ready to be unforgettable"

Formula B: [Verb] [outcome]
  → "We make brands impossible to ignore"

Formula C: Provocation
  → "Most agencies design for approval. We design for impact."
```

**Services copy formula:**
```
[Service name]
Not just [what everyone offers] — but [what makes yours different].
We [specific action] so your [client outcome].

Example:
Brand Identity
Not just logos and colour palettes — but the visual language your brand
speaks in every room it enters. We build identities that hold their
ground at any scale, in any medium.
```

### SaaS / Tech Product

**Voice:** Clear, confident, technically credible but human
**Avoid:** "Next-generation" / "AI-powered" / "seamless" / "robust"
**Use instead:** Specific features, time saved, user outcomes

### Luxury / Fashion / Lifestyle

**Voice:** Spare, precise, evocative. Fewer words carry more weight.
**Avoid:** Paragraphs. Lists. Explanation.
**Use instead:** Fragments. Single powerful words. Silence between ideas.

### Health / Wellness

**Voice:** Warm, empowering, evidence-adjacent
**Avoid:** Medical claims, fear-based language
**Use instead:** Transformation language, community, agency

---

## CONTENT DEPTH CHECKLIST {#checklist}

Run before Phase 5 code generation begins:

```
HOMEPAGE
[ ] Hero H1: benefit-forward, under 8 words, not generic
[ ] Hero sub: names the audience AND the outcome
[ ] Services: each item has 40+ words of real description
[ ] Work section: each project has a 60+ word result summary
[ ] Testimonials: specific outcomes, not vague praise
[ ] About teaser: says WHY this studio exists, not just what it does
[ ] CTA: stakes are clear — what happens if they don't act?

ABOUT
[ ] Origin story present (120+ words)
[ ] At least 3 belief statements with explanations
[ ] Process section: what makes it different?
[ ] Stats: real numbers, not round placeholders

SERVICES
[ ] Each service: problem + solution + outcome (not just description)
[ ] Deliverables listed specifically
[ ] FAQ included (4+ questions clients actually ask)

CASE STUDIES
[ ] Challenge described with stakes
[ ] Approach explains the thinking, not just the output
[ ] Results: at least one number or measurable outcome
[ ] Client quote: specific, not generic praise

ALL PAGES
[ ] No section exceeds its animation copy constraint (see Step 5.0C table)
[ ] No lorem ipsum or [PLACEHOLDER] text in final output
[ ] Every CTA has a clear reason why now
[ ] Meta description is 150–160 chars and benefit-forward
```

---

## WHEN TO FLAG A CONTENT STRATEGIST {#strategist}

The skill should explicitly recommend bringing in a human content strategist when:

```
FLAG IF:
[ ] Client cannot answer the content brief questions above
[ ] No case studies or measurable outcomes exist yet
[ ] The brand has no clear positioning against competitors
[ ] Services are described in deliverables only (no outcomes)
[ ] The target audience is "everyone" or similarly vague
[ ] There is no existing content to build from (no blog, no deck, no docs)
[ ] The project involves 10+ pages of original copy
[ ] The client is entering a new market with no proof points yet

TELL THE USER:
"Content strategy is outside the scope of what this skill generates well
at scale. The structure and copy frameworks above give you a strong start,
but a dedicated content strategist will produce significantly better copy
than AI generation alone — especially for case studies, about pages, and
conversion-critical sections. Budget 2–4 weeks and $1,500–$5,000 for
professional content strategy on a full agency site."
```

**Recommended approach when flagging:**
1. Generate all content structure and section frameworks
2. Output the complete content brief as a fillable document
3. Mark sections with `[CONTENT STRATEGIST RECOMMENDED]`
4. Generate strong placeholder copy that demonstrates the tone and length needed
5. Include notes on what a real strategist should address in each section
