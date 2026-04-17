# Cinematic Web — Remotion Layer

## TABLE OF CONTENTS
1. [What Remotion Is and When to Use It](#what)
2. [Project Setup](#setup)
3. [Decision Matrix — Remotion vs Veo 3](#matrix)
4. [Composition Templates](#templates)
   - Hero Loop
   - Scroll Scrub Frame Sequence
   - Logo / Brand Reveal
   - Typography Animation
   - Aurora / Gradient Mesh Motion
   - Data-Driven Motion Graphics
5. [Rendering — Local and Lambda](#render)
6. [Frame Extraction for Scroll Scrub](#frames)
7. [Remotion Player — In-Site Preview](#player)
8. [Brand Reel Composition](#reel)
9. [Peak Seen — Client Preview Feature](#preview)
10. [Phase 3 Integration](#phase3)

---

## WHAT REMOTION IS AND WHEN TO USE IT {#what}

Remotion renders React components to video. Every frame is a React render.
Animations are mathematical — not recorded, not AI-generated. This means:

- Brand colors are always exactly right (#hex, CSS vars, design tokens)
- Typography uses the actual project font (Google Fonts, variable fonts)
- Timing is frame-perfect — not approximate
- Renders identically every time — no AI variation
- Free to render locally — no API cost
- Can use real data — counters, charts, live metrics animate accurately

**Use Remotion when the motion IS the design:**
logo assemblies, headline reveals, scroll scrub sequences, motion graphics,
brand reels, client preview renders, data visualizations.

**Use Veo 3 when the footage IS the atmosphere:**
liquid, fire, smoke, nature, organic textures, lifestyle footage, anything
that needs photorealism or organic motion impossible to code.

**They are complementary, not competing.**
A typical cinematic site uses both:
- Veo 3 for the atmospheric hero background loop
- Remotion for the scroll scrub sequence and client brand reel

---

## PROJECT SETUP {#setup}

```bash
# Install in the project
npm install remotion @remotion/cli @remotion/player

# For Lambda rendering (production / fast)
npm install @remotion/lambda

# Initialize Remotion folder structure
npx remotion init
# Creates: remotion/ folder with Root.tsx entry point
```

```
project/
├── remotion/
│   ├── Root.tsx              ← Register all compositions here
│   ├── compositions/
│   │   ├── HeroLoop.tsx      ← Hero background loop
│   │   ├── ScrollScrub.tsx   ← Frame sequence for scroll animation
│   │   ├── BrandReveal.tsx   ← Logo / brand mark animation
│   │   ├── TypeReveal.tsx    ← Headline animation
│   │   └── BrandReel.tsx     ← 30s client deliverable reel
│   └── lib/
│       ├── brand.ts          ← Brand tokens (from Brand Brief)
│       └── easing.ts         ← Custom easing functions
└── remotion.config.ts        ← Remotion config
```

```typescript
// remotion.config.ts
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('angle'); // better GPU compatibility
```

```typescript
// remotion/lib/brand.ts — load from project Brand Brief
// Replace values with actual Brand Brief output from Phase 1

export const brand = {
  // Colors
  primary:    'var(--color-primary)',   // or hardcode: '#0A0F1E'
  secondary:  'var(--color-secondary)',
  accent:     'var(--color-accent)',    // e.g. '#4FFFB0'
  bg:         'var(--color-bg)',
  text:       'var(--color-text)',

  // Hardcoded for video rendering (CSS vars don't work in Remotion)
  // Copy from Brand Brief palette — exact hex values
  primaryHex:  '[BRAND_PRIMARY_HEX]',
  accentHex:   '[BRAND_ACCENT_HEX]',
  bgHex:       '[BRAND_BG_HEX]',

  // Typography
  headingFont: '[BRAND_HEADING_FONT]',  // e.g. 'Neue Haas Grotesk Display'
  bodyFont:    '[BRAND_BODY_FONT]',

  // Identity
  name:        '[BRAND_NAME]',
  tagline:     '[BRAND_TAGLINE]',
  headline:    '[BRAND_HEADLINE]',
};
```

```typescript
// remotion/Root.tsx — register all compositions
import { Composition } from 'remotion';
import { HeroLoop }    from './compositions/HeroLoop';
import { ScrollScrub } from './compositions/ScrollScrub';
import { BrandReveal } from './compositions/BrandReveal';
import { BrandReel }   from './compositions/BrandReel';

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="HeroLoop"
        component={HeroLoop}
        durationInFrames={240}  // 10s at 24fps — adjust per scene
        fps={24}
        width={1920}
        height={1080}
      />
      <Composition
        id="ScrollScrub"
        component={ScrollScrub}
        durationInFrames={480}  // 20s at 24fps — more frames = smoother scrub
        fps={24}
        width={1920}
        height={1080}
      />
      <Composition
        id="BrandReveal"
        component={BrandReveal}
        durationInFrames={120}  // 5s at 24fps
        fps={24}
        width={1920}
        height={1080}
      />
      <Composition
        id="BrandReel"
        component={BrandReel}
        durationInFrames={720}  // 30s at 24fps
        fps={24}
        width={1920}
        height={1080}
      />
    </>
  );
}
```

---

## DECISION MATRIX — REMOTION VS VEO 3 {#matrix}

| Scene requirement | Remotion | Veo 3 | Winner |
|---|---|---|---|
| Brand colors exact | ✅ Perfect | ⚠ Approximate | Remotion |
| Specific font/typography | ✅ Real font | ❌ Can't control | Remotion |
| Scroll scrub with exact timing | ✅ Frame-perfect | ⚠ Needs FFmpeg | Remotion |
| Logo assembly / reveal | ✅ Geometric, exact | ⚠ Inconsistent | Remotion |
| Counter / number animation | ✅ Real data | ❌ Hallucinated | Remotion |
| Atmospheric fog / smoke | ❌ Can't generate | ✅ Excellent | Veo 3 |
| Organic liquid / water | ❌ Can't generate | ✅ Excellent | Veo 3 |
| Nature / lifestyle footage | ❌ No footage | ✅ Photorealistic | Veo 3 |
| Particle system (geometric) | ✅ Three.js + Remotion | ⚠ Unpredictable | Remotion |
| Aurora / gradient animation | ✅ CSS/WebGL | ⚠ Approximate | Remotion |
| Cost per render | ✅ Free (local) | ⚠ API credits | Remotion |
| Client reel / deliverable | ✅ Brand-perfect | ⚠ Variable | Remotion |
| Preview before API spend | ✅ Instant | ❌ No preview | Remotion |

---

## COMPOSITION TEMPLATES {#templates}

---

### HERO LOOP COMPOSITION

For: hero background video loop, geometric/abstract motion, brand-colored atmosphere.

```tsx
// remotion/compositions/HeroLoop.tsx
import {
  AbsoluteFill, interpolate, useCurrentFrame,
  useVideoConfig, spring, Easing,
} from 'remotion';
import { brand } from '../lib/brand';

export function HeroLoop() {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const progress = frame / durationInFrames;

  // Blob positions — using sine waves for seamless loop
  const blob1X = interpolate(Math.sin(progress * Math.PI * 2), [-1, 1], [10, 70]);
  const blob1Y = interpolate(Math.cos(progress * Math.PI * 2), [-1, 1], [20, 60]);
  const blob2X = interpolate(Math.cos(progress * Math.PI * 2 + 1), [-1, 1], [30, 80]);
  const blob2Y = interpolate(Math.sin(progress * Math.PI * 2 + 2), [-1, 1], [10, 70]);
  const blob3X = interpolate(Math.sin(progress * Math.PI * 2 + 3), [-1, 1], [20, 60]);
  const blob3Y = interpolate(Math.cos(progress * Math.PI * 2 + 1), [-1, 1], [40, 80]);

  // Hue rotation for aurora effect
  const hueShift = interpolate(progress, [0, 1], [0, 30]);

  return (
    <AbsoluteFill style={{ backgroundColor: brand.bgHex, overflow: 'hidden' }}>

      {/* Aurora blobs — seamlessly looping via sine/cosine */}
      <div style={{
        position: 'absolute',
        width: '60%', height: '60%',
        left: `${blob1X}%`, top: `${blob1Y}%`,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: brand.primaryHex,
        filter: `blur(120px) hue-rotate(${hueShift}deg)`,
        opacity: 0.5,
      }} />

      <div style={{
        position: 'absolute',
        width: '50%', height: '50%',
        left: `${blob2X}%`, top: `${blob2Y}%`,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: brand.accentHex,
        filter: `blur(100px)`,
        opacity: 0.4,
      }} />

      <div style={{
        position: 'absolute',
        width: '40%', height: '40%',
        left: `${blob3X}%`, top: `${blob3Y}%`,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: brand.secondaryHex ?? brand.primaryHex,
        filter: `blur(90px)`,
        opacity: 0.35,
      }} />

      {/* Grain overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
        opacity: 0.08,
      }} />

    </AbsoluteFill>
  );
}
```

---

### SCROLL SCRUB FRAME SEQUENCE

For: precise scroll-driven animation where exact visual control matters.
Output: 480 frames (at 24fps = 20 seconds worth of content to scrub through)

```tsx
// remotion/compositions/ScrollScrub.tsx
import {
  AbsoluteFill, interpolate, useCurrentFrame,
  useVideoConfig, spring, Sequence,
} from 'remotion';
import { brand } from '../lib/brand';

export function ScrollScrub() {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Normalize 0-1 for the full sequence
  const progress = frame / durationInFrames;

  // ── ACT 1 (frames 0-120): Reveal ─────────────────────────────
  const act1Progress = Math.min(1, frame / 120);

  // Hero shape expands from center
  const shapeScale = interpolate(act1Progress, [0, 1], [0, 1], {
    easing: Easing.out(Easing.cubic),
  });

  // Headline letters slide up
  const textY = interpolate(act1Progress, [0, 1], [100, 0], {
    easing: Easing.out(Easing.quart),
  });
  const textOpacity = interpolate(act1Progress, [0, 0.3, 1], [0, 0, 1]);

  // ── ACT 2 (frames 120-360): Transformation ────────────────────
  const act2Frame    = Math.max(0, frame - 120);
  const act2Progress = Math.min(1, act2Frame / 240);

  // Shape morphs — color shift
  const colorProgress = interpolate(act2Progress, [0, 1], [0, 1]);
  const r1 = parseInt(brand.primaryHex.slice(1,3), 16);
  const r2 = parseInt(brand.accentHex.slice(1,3), 16);
  const g1 = parseInt(brand.primaryHex.slice(3,5), 16);
  const g2 = parseInt(brand.accentHex.slice(3,5), 16);
  const b1 = parseInt(brand.primaryHex.slice(5,7), 16);
  const b2 = parseInt(brand.accentHex.slice(5,7), 16);
  const r  = Math.round(r1 + (r2 - r1) * colorProgress);
  const g  = Math.round(g1 + (g2 - g1) * colorProgress);
  const b  = Math.round(b1 + (b2 - b1) * colorProgress);

  // Rotation during act 2
  const rotation = interpolate(act2Progress, [0, 1], [0, 180]);

  // Scale pulse
  const pulse = 1 + 0.05 * Math.sin(act2Progress * Math.PI * 4);

  // ── ACT 3 (frames 360-480): Resolution ───────────────────────
  const act3Frame    = Math.max(0, frame - 360);
  const act3Progress = Math.min(1, act3Frame / 120);

  // Final state — settle into brand identity
  const finalOpacity = interpolate(act3Progress, [0, 1], [1, 1]);
  const finalScale   = interpolate(act3Progress, [0, 1], [pulse, 1], {
    easing: Easing.out(Easing.elastic(1, 0.8)),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: brand.bgHex }}>

      {/* Central animated shape */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: '400px', height: '400px',
        transform: `translate(-50%, -50%)
                    scale(${frame < 360 ? shapeScale * pulse : finalScale})
                    rotate(${rotation}deg)`,
        borderRadius: frame < 240 ? '50%' : '20%',
        background: `rgb(${r}, ${g}, ${b})`,
        opacity: finalOpacity,
        transition: 'border-radius 0.5s',
      }} />

      {/* Brand name */}
      <div style={{
        position: 'absolute',
        bottom: '20%', left: '50%',
        transform: `translateX(-50%) translateY(${textY}px)`,
        opacity: textOpacity,
        fontFamily: brand.headingFont,
        fontSize: '80px',
        fontWeight: 700,
        color: brand.text ?? '#FFFFFF',
        letterSpacing: '-0.02em',
        whiteSpace: 'nowrap',
      }}>
        {brand.name}
      </div>

      {/* Progress indicator (remove if not needed) */}
      <div style={{
        position: 'absolute',
        bottom: '8%', left: '50%',
        transform: 'translateX(-50%)',
        width: '200px', height: '2px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '1px',
      }}>
        <div style={{
          width: `${progress * 100}%`,
          height: '100%',
          background: brand.accentHex,
          borderRadius: '1px',
        }} />
      </div>

    </AbsoluteFill>
  );
}
```

---

### LOGO / BRAND REVEAL

For: animated brand mark that assembles on load. Client deliverable or hero overlay.

```tsx
// remotion/compositions/BrandReveal.tsx
import {
  AbsoluteFill, interpolate, useCurrentFrame,
  useVideoConfig, spring, Easing,
} from 'remotion';
import { brand } from '../lib/brand';

export function BrandReveal() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (0-1s): Background fades in
  const bgOpacity = spring({ frame, fps, config: { damping: 200 }, from: 0, to: 1 });

  // Phase 2 (0.5s-2s): Accent line sweeps in from left
  const lineWidth = interpolate(frame, [fps * 0.5, fps * 1.5], [0, 100], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quart),
  });

  // Phase 3 (1s-2.5s): Brand name slides up and fades in
  const nameY       = interpolate(frame, [fps, fps * 2], [40, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quart),
  });
  const nameOpacity = interpolate(frame, [fps, fps * 1.5], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Phase 4 (2s-3s): Tagline fades in
  const tagOpacity = interpolate(frame, [fps * 2, fps * 3], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Phase 5 (4s-5s): Subtle hold — everything stays

  return (
    <AbsoluteFill style={{
      backgroundColor: brand.bgHex,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: bgOpacity,
    }}>

      {/* Accent line — sweeps in */}
      <div style={{
        width: `${lineWidth}%`,
        maxWidth: '400px',
        height: '3px',
        backgroundColor: brand.accentHex,
        marginBottom: '32px',
        borderRadius: '2px',
      }} />

      {/* Brand name */}
      <div style={{
        fontFamily: brand.headingFont,
        fontSize:   '96px',
        fontWeight: 800,
        color:      '#FFFFFF',
        letterSpacing: '-0.03em',
        transform:  `translateY(${nameY}px)`,
        opacity:    nameOpacity,
        lineHeight: 1,
      }}>
        {brand.name}
      </div>

      {/* Tagline */}
      <div style={{
        fontFamily:    brand.bodyFont,
        fontSize:      '22px',
        fontWeight:    400,
        color:         `rgba(255,255,255,0.55)`,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginTop:     '24px',
        opacity:       tagOpacity,
      }}>
        {brand.tagline}
      </div>

    </AbsoluteFill>
  );
}
```

---

### TYPOGRAPHY ANIMATION (CINEMATIC TEXT REVEAL)

For: hero headline that types itself, words that drop in, characters that scatter.

```tsx
// remotion/compositions/TypeReveal.tsx
import {
  AbsoluteFill, interpolate, useCurrentFrame,
  useVideoConfig, Easing,
} from 'remotion';
import { brand } from '../lib/brand';

interface TypeRevealProps {
  headline?: string;
  mode?: 'typewriter' | 'word-drop' | 'char-scatter';
}

export function TypeReveal({
  headline = brand.headline,
  mode = 'word-drop',
}: TypeRevealProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const words = headline.split(' ');

  if (mode === 'word-drop') {
    return (
      <AbsoluteFill style={{
        backgroundColor: brand.bgHex,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '0.25em',
        padding: '0 10%',
        overflow: 'hidden',
      }}>
        {words.map((word, i) => {
          // Each word drops in with a stagger
          const delay   = i * (fps * 0.12);
          const wordY   = interpolate(frame, [delay, delay + fps * 0.5], [80, 0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            easing: Easing.out(Easing.quart),
          });
          const wordOp  = interpolate(frame, [delay, delay + fps * 0.3], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });

          return (
            <div key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
              <div style={{
                fontFamily:    brand.headingFont,
                fontSize:      'clamp(48px, 8vw, 100px)',
                fontWeight:    800,
                color:         '#FFFFFF',
                letterSpacing: '-0.02em',
                transform:     `translateY(${wordY}px)`,
                opacity:       wordOp,
                display:       'inline-block',
              }}>
                {word}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }

  if (mode === 'typewriter') {
    const totalChars = headline.length;
    const charsToShow = Math.floor(
      interpolate(frame, [0, durationInFrames * 0.7], [0, totalChars], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        easing: Easing.linear,
      })
    );
    const visibleText = headline.slice(0, charsToShow);
    const cursorBlink = frame % (fps * 0.5) < fps * 0.25;

    return (
      <AbsoluteFill style={{
        backgroundColor: brand.bgHex,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 10%',
      }}>
        <div style={{
          fontFamily:    brand.headingFont,
          fontSize:      '80px',
          fontWeight:    700,
          color:         '#FFFFFF',
          letterSpacing: '-0.02em',
        }}>
          {visibleText}
          {cursorBlink && (
            <span style={{ color: brand.accentHex, marginLeft: '4px' }}>|</span>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  return null;
}
```

---

### AURORA / GRADIENT MESH MOTION

For: living color background — paradigm "Aurora/Mesh". Better than CSS because
it renders to video, loads instantly, no GPU cost on the live site.

```tsx
// remotion/compositions/AuroraLoop.tsx
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface AuroraProps {
  colors?: string[];
  speed?: number;
}

export function AuroraLoop({
  colors = ['#6366F1', '#EC4899', '#06B6D4'],
  speed  = 1,
}: AuroraProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = (frame / durationInFrames) * speed;

  // Each blob traces an independent sine/cosine path — seamlessly looping
  const blobs = colors.map((color, i) => ({
    color,
    x: 20 + 60 * (0.5 + 0.5 * Math.sin(p * Math.PI * 2 + i * 2.1)),
    y: 20 + 60 * (0.5 + 0.5 * Math.cos(p * Math.PI * 2 + i * 1.7)),
    size: 45 + 15 * Math.sin(p * Math.PI * 2 + i * 0.9),
    opacity: 0.4 + 0.15 * Math.sin(p * Math.PI * 4 + i),
  }));

  // Hue rotation for extra life
  const hue = interpolate(Math.sin(p * Math.PI * 2), [-1, 1], [-20, 20]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden', filter: `hue-rotate(${hue}deg)` }}>
      {blobs.map((b, i) => (
        <div key={i} style={{
          position: 'absolute',
          left:   `${b.x}%`,
          top:    `${b.y}%`,
          width:  `${b.size}%`,
          height: `${b.size}%`,
          transform:    'translate(-50%, -50%)',
          borderRadius: '50%',
          background:   b.color,
          filter:       'blur(100px)',
          opacity:      b.opacity,
        }} />
      ))}
    </AbsoluteFill>
  );
}
```

---

### DATA-DRIVEN MOTION GRAPHICS

For: stats sections, counter animations, chart reveals — using real data.

```tsx
// remotion/compositions/DataReveal.tsx
import {
  AbsoluteFill, interpolate, useCurrentFrame,
  useVideoConfig, Easing, spring,
} from 'remotion';
import { brand } from '../lib/brand';

interface Stat { label: string; value: number; prefix?: string; suffix?: string; }

const STATS: Stat[] = [
  { label: 'Brands transformed', value: 140,  suffix: '+'  },
  { label: 'Countries reached',  value: 32,   suffix: ''   },
  { label: 'Years of craft',     value: 8,    suffix: ''   },
  { label: 'Avg. traffic lift',  value: 340,  suffix: '%'  },
];

export function DataReveal() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{
      backgroundColor: brand.bgHex,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows:    '1fr 1fr',
      padding: '80px',
      gap: '40px',
    }}>
      {STATS.map((stat, i) => {
        const delay = i * fps * 0.2;

        // Counter counts up
        const count = Math.round(
          interpolate(frame, [delay, delay + fps * 1.5], [0, stat.value], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          })
        );

        // Card slides up
        const cardY  = interpolate(frame, [delay, delay + fps * 0.6], [40, 0], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          easing: Easing.out(Easing.quart),
        });
        const cardOp = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });

        return (
          <div key={i} style={{
            transform: `translateY(${cardY}px)`,
            opacity:   cardOp,
            display:   'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '32px',
            borderRadius: '16px',
            border: `1px solid rgba(255,255,255,0.08)`,
            background: 'rgba(255,255,255,0.03)',
          }}>
            <div style={{
              fontFamily:    brand.headingFont,
              fontSize:      '72px',
              fontWeight:    800,
              color:         brand.accentHex,
              letterSpacing: '-0.02em',
              lineHeight:    1,
            }}>
              {stat.prefix}{count}{stat.suffix}
            </div>
            <div style={{
              fontFamily: brand.bodyFont,
              fontSize:   '18px',
              color:      'rgba(255,255,255,0.5)',
              marginTop:  '12px',
            }}>
              {stat.label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
```

---

## RENDERING — LOCAL AND LAMBDA {#render}

### ⚠ BUDGET WARNING — Read Before Rendering

```
LOCAL RENDER (your machine / free):
  Simple composition  (10s @ 24fps = 240 frames)  →  1–5 min    ← fine
  ScrollScrub         (20s @ 24fps = 480 frames)  →  5–15 min   ← acceptable
  BrandReel           (30s @ 24fps = 720 frames)  →  15–45 min  ← slow on older machines
  Full frame sequence (480 frames as JPGs)         →  5–20 min   ← CPU intensive

  Machine matters: M-series Mac = fast. Older Intel / budget laptop = slow.
  Never render a full BrandReel locally right before a deadline.

LAMBDA RENDER (AWS / ~$0.004/min / fast):
  Any composition    →  1–4 min regardless of length
  240-frame HeroLoop →  ~$0.001 (essentially free)
  720-frame BrandReel→  ~$0.003 (essentially free)

FOR ZERO-BUDGET USERS:
  Render short previews locally (--frames=0-48 to check the first 2 seconds)
  Use Lambda for final output — setup takes 20 min once, then renders are instant
  Lambda is ~$0.004/min — a 30s reel costs less than $0.001
  AWS free tier covers Lambda invocations — first 1M requests/month free

RECOMMENDATION:
  Development →  Local render of short frame range (--frames=0-48)
  Preview     →  Remotion Player in browser (instant, zero cost)
  Final output→  Lambda render (fast + cheap)
  Never:          Render full compositions locally on battery power
```

### Local Render (Development / Small Projects)

```bash
# Preview in browser — live update as you code
npx remotion studio

# Render single composition to mp4
npx remotion render HeroLoop out/hero-loop.mp4

# Render with custom settings
npx remotion render HeroLoop out/hero-loop.mp4 \
  --codec=h264 \
  --crf=18 \
  --fps=24

# Render to image sequence (for scroll scrub)
npx remotion render ScrollScrub out/frames/ \
  --image-format=jpeg \
  --jpeg-quality=90

# Render specific frame range
npx remotion render HeroLoop out/preview.mp4 \
  --frames=0-48
```

### Lambda Render (Production / Fast / Scalable)

```bash
# Install Lambda dependencies
npm install @remotion/lambda

# One-time setup — deploys Remotion to your AWS account
npx remotion lambda functions deploy --memory=3008 --timeout=240

# Render on Lambda (much faster than local for long compositions)
npx remotion lambda render \
  --region=us-east-1 \
  HeroLoop \
  out/hero-loop.mp4

# Render frame sequence on Lambda
npx remotion lambda render \
  --region=us-east-1 \
  ScrollScrub \
  out/frames/ \
  --image-format=jpeg
```

```env
# Add to .env for Lambda
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
REMOTION_FUNCTION_NAME=remotion-render-[version]
```

**Lambda cost:** ~$0.004 per minute of rendered video.
A 10-second HeroLoop at 24fps = 240 frames ≈ $0.001. Essentially free.

---

## FRAME EXTRACTION FOR SCROLL SCRUB {#frames}

When you render a Remotion ScrollScrub composition, you get a numbered image
sequence directly — no FFmpeg needed. Then upload to Cloudinary and use the
same `ScrollScrub[Name].tsx` component generated by the pipeline.

```bash
# Render frames directly from Remotion (no FFmpeg needed for Remotion-sourced content)
npx remotion render ScrollScrub out/scroll-frames/ \
  --image-format=jpeg \
  --jpeg-quality=90

# Then upload using the pipeline
node scripts/generate-assets.js \
  --extract-frames \
  --video-source remotion \
  --frames-dir out/scroll-frames/ \
  --output scroll-scrub-hero
```

Or upload manually via Cloudinary CLI:
```bash
# Install Cloudinary CLI
npm install -g cloudinary-cli

# Upload entire frames folder
cld upload_dir out/scroll-frames/ \
  --folder "[PROJECT_SLUG]/frames/scroll-hero" \
  --resource_type image \
  --format jpg \
  --quality auto:good
```

---

## REMOTION PLAYER — IN-SITE PREVIEW {#player}

The `@remotion/player` package lets you embed a Remotion composition directly
in your Next.js site — no video file needed. For Peak Seen's "preview before
you commit API credits" feature, this is the key component.

```tsx
// components/RemotionPreview.tsx
'use client';
import { Player } from '@remotion/player';
import { HeroLoop } from '@/remotion/compositions/HeroLoop';

interface Props {
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
}

export function RemotionPreview({ autoPlay = true, controls = false, loop = true }: Props) {
  return (
    <Player
      component={HeroLoop}
      durationInFrames={240}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={24}
      style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px' }}
      autoPlay={autoPlay}
      controls={controls}
      loop={loop}
    />
  );
}
```

**Usage in hero section — shows the live Remotion animation instead of a video:**
```tsx
// Before the video asset is generated — show Remotion preview
// After generation — swap to the Cloudinary video URL
// This eliminates the "waiting for generation" dead time

import { RemotionPreview } from '@/components/RemotionPreview';

export function Hero() {
  const heroVideoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;

  return (
    <section className="hero">
      {heroVideoUrl ? (
        <video autoPlay muted loop playsInline poster="/hero-poster.jpg">
          <source src={heroVideoUrl} type="video/mp4" />
        </video>
      ) : (
        // Remotion live preview — instant, no API call
        <RemotionPreview />
      )}
    </section>
  );
}
```

---

## BRAND REEL COMPOSITION {#reel}

A complete 30-second brand motion reel — premium client deliverable.
Sections: brand reveal → selected work teasers → services → CTA.

```tsx
// remotion/compositions/BrandReel.tsx
import {
  AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig,
  interpolate, spring, Audio, staticFile,
} from 'remotion';
import { brand } from '../lib/brand';
import { BrandReveal } from './BrandReveal';
import { DataReveal  } from './DataReveal';
import { TypeReveal  } from './TypeReveal';

export function BrandReel() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Reel structure:
  // 0-5s:   Brand reveal (logo + name)
  // 5-12s:  Selected work showcase
  // 12-20s: Stats / data reveal
  // 20-27s: Services list
  // 27-30s: CTA + brand mark hold

  return (
    <AbsoluteFill>
      {/* Section 1: Brand Reveal (0-5s) */}
      <Sequence from={0} durationInFrames={fps * 5}>
        <BrandReveal />
      </Sequence>

      {/* Section 2: Work showcase (5-12s) */}
      <Sequence from={fps * 5} durationInFrames={fps * 7}>
        <WorkShowcase />
      </Sequence>

      {/* Section 3: Stats (12-20s) */}
      <Sequence from={fps * 12} durationInFrames={fps * 8}>
        <DataReveal />
      </Sequence>

      {/* Section 4: Headline CTA (20-30s) */}
      <Sequence from={fps * 20} durationInFrames={fps * 10}>
        <TypeReveal headline={brand.headline} mode="word-drop" />
      </Sequence>
    </AbsoluteFill>
  );
}

function WorkShowcase() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Placeholder project cards — replace with real project data
  const projects = [
    { name: 'Meridian Ventures', type: 'Brand Identity', year: '2024' },
    { name: 'Nova Luxury',       type: 'UI/UX + Web',    year: '2024' },
    { name: 'Arc Studios',       type: 'Motion + Brand', year: '2023' },
  ];

  return (
    <AbsoluteFill style={{
      backgroundColor: brand.bgHex,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '32px',
      padding: '80px',
    }}>
      {projects.map((p, i) => {
        const delay  = i * fps * 0.3;
        const slideX = interpolate(frame, [delay, delay + fps * 0.5], [-60, 0], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        const op     = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });

        return (
          <div key={i} style={{
            transform: `translateX(${slideX}px)`,
            opacity:   op,
            display:   'flex',
            alignItems: 'center',
            gap: '40px',
            width: '100%',
            maxWidth: '900px',
          }}>
            <div style={{
              fontFamily:    brand.headingFont,
              fontSize:      '48px',
              fontWeight:    700,
              color:         '#FFFFFF',
              flex:          1,
            }}>
              {p.name}
            </div>
            <div style={{
              fontFamily:    brand.bodyFont,
              fontSize:      '20px',
              color:         'rgba(255,255,255,0.5)',
              whiteSpace:    'nowrap',
            }}>
              {p.type} — {p.year}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
```

---

## PEAK SEEN — CLIENT PREVIEW FEATURE {#preview}

When Peak Seen becomes a SaaS, Remotion enables this premium workflow:

```
User completes Phase 1 (Brand Brief) + Phase 1.5 (Paradigm) + Phase 2 (Scene concept)
          ↓
Remotion generates a 10-second preview using their exact brand colors,
their exact headline, their chosen paradigm's visual language
          ↓
User sees their site concept LIVE in the browser — instant, no API credits
          ↓
User approves → THEN Veo 3 generates the full-quality atmospheric video
          ↓
Cost savings: user doesn't waste credits on concepts they don't like
```

```tsx
// This is the "preview before commit" component for Peak Seen web app
// props come directly from the Phase 1-2 ledger

import { Player } from '@remotion/player';
import { PreviewComposition } from '@/remotion/compositions/PreviewComposition';

interface LedgerBrand {
  primaryHex: string;
  accentHex:  string;
  bgHex:      string;
  name:       string;
  headline:   string;
  paradigm:   string;
}

export function ScenePreview({ brand }: { brand: LedgerBrand }) {
  return (
    <div>
      <Player
        component={PreviewComposition}
        inputProps={{ brand }}  // Pass ledger data into composition
        durationInFrames={240}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={24}
        style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px' }}
        autoPlay
        loop
      />
      <p>This preview uses your exact brand colors and headline.
         Approve to generate the full cinematic version.</p>
    </div>
  );
}
```

---

## PHASE 3 INTEGRATION {#phase3}

When the skill generates Phase 3 asset prompts and a Remotion composition
is appropriate (see decision matrix), add to `.generation-prompts.json`:

```json
{
  "hero": [
    {
      "name":        "Hero Atmosphere Loop (Veo 3)",
      "type":        "video",
      "videoMode":   "loop",
      "output":      "hero-loop",
      "cloudinaryId":"[SLUG]/video/hero-loop",
      "prompt":      "[atmospheric/organic prompt — Veo 3]"
    },
    {
      "name":        "Hero Motion Graphics (Remotion)",
      "type":        "remotion",
      "composition": "HeroLoop",
      "output":      "hero-remotion",
      "cloudinaryId":"[SLUG]/video/hero-remotion",
      "durationInFrames": 240,
      "fps": 24,
      "notes": "Brand-accurate aurora loop. Edit remotion/lib/brand.ts then run: npx remotion render HeroLoop out/hero-remotion.mp4"
    }
  ],
  "scrub": [
    {
      "name":        "Scroll Scrub Frames (Remotion)",
      "type":        "remotion",
      "composition": "ScrollScrub",
      "output":      "scroll-scrub",
      "cloudinaryId":"[SLUG]/frames/scroll-scrub",
      "durationInFrames": 480,
      "fps": 24,
      "extractFrames": true,
      "notes": "Render frames: npx remotion render ScrollScrub out/frames/ --image-format=jpeg"
    }
  ]
}
```

**When skill sees `"type": "remotion"` in the prompts file, output:**
```
REMOTION ASSET: [name]
─────────────────────────────────
Composition: [composition name]
Location:    remotion/compositions/[name].tsx

This asset renders locally — no API credits needed.
The composition uses your exact brand tokens from remotion/lib/brand.ts

To render:
  Preview:  npx remotion studio
  Render:   npx remotion render [composition] out/[output].mp4
  Frames:   npx remotion render [composition] out/frames/ --image-format=jpeg
  Lambda:   npx remotion lambda render [composition]

Edit remotion/lib/brand.ts to update colors, fonts, and copy.
All values come from your Brand Brief (Phase 1).
```
