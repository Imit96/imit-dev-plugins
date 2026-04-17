# Cinematic Web — API Tier Reference

---

## API SELECTION DECISION TREE

**IMPORTANT — Two parallel decisions, not one:**
Video generation (AI-generated footage) and motion graphics (code-rendered)
serve different use cases. Ask both questions, not just one.

### Decision A — What type of video does this scene need?

```
Is the motion organic / photorealistic?
  (fire, water, smoke, nature, lifestyle, textures)
  YES → Use AI VIDEO GENERATION (Veo 3 / Runway)

Is the motion precise / brand-controlled?
  (logo reveal, type animation, geometric motion, data viz,
   scroll scrub with exact timing, motion graphics)
  YES → Use REMOTION (code-rendered, free, brand-accurate)

Is it a scroll scrub sequence with specific behavior?
  YES, needs exact control   → Remotion (render frames)
  YES, atmospheric/organic   → Veo 3 scrub mode + FFmpeg

Not sure?
  → Generate a Remotion composition first (free, instant)
    Then compare with Veo 3 output and pick the better one
```

### Decision B — Which AI video API?

```
Has RUNWAY_API_KEY?
  YES → Runway Gen-3 (best AI quality, most cinematic)

Has GOOGLE_AI_STUDIO_KEY?
  YES → Veo 3 (default, free quota, strong atmospheric)
  → DEFAULT IF NOTHING ELSE SELECTED

Has KLING via REPLICATE_API_TOKEN?
  YES → Kling 1.6 (good product/object motion)

Has NOTHING?
  → Remotion only (free) + CSS animations + Spline
```

### Decision C — Which image API?

```
Has OPENAI_API_KEY (DALL·E 3)?
  YES → DALL·E 3 (strong composition, editorial style)

Has GOOGLE_AI_STUDIO_KEY?
  YES → Imagen 3 (cinematic quality, same key as Veo 3)

Has STABILITY_API_KEY?
  YES → Flux Pro (highest texture detail)

Has UNSPLASH_ACCESS_KEY?
  YES → Unsplash (fallback, free, requires attribution)

Has NOTHING?
  → Pexels free + CSS-only atmospheric effects
```

---

## REMOTION TIER — BRAND-ACCURATE MOTION GRAPHICS

> Full implementation: read `references/remotion-layer.md`

**Cost:** Free to render locally. Remotion Lambda ~$0.004/min rendered.
**When to use:** Motion graphics, logo reveals, type animations, scroll scrub
sequences, client preview renders, brand reels, anything that can be built in code.
**Key advantage:** Uses real brand colors, real typography, real data.
No AI hallucination. Renders the same way every time.

**Phase 3 decision — always ask:**
```
Does this scene require atmospheric/organic footage? → Veo 3
Does this scene require precise brand-controlled motion? → Remotion
Does the client need a brand motion reel deliverable? → Remotion
Is the scroll scrub a specific geometric/typographic sequence? → Remotion
Zero API budget? → Remotion only (free)
```

**Quick Remotion commands (copy into Phase 3 output):**
```bash
# Install Remotion in project
npm install @remotion/cli remotion @remotion/player @remotion/lambda

# Preview composition in browser (live, instant)
npx remotion studio

# Render to video file
npx remotion render [CompositionId] out/hero-loop.mp4

# Extract frames for scroll scrub
npx remotion render [CompositionId] --image-format=jpeg out/frames/

# Lambda render (fast, cloud)
npx remotion lambda render [CompositionId]
```

---

## TIER 1 — PREMIUM (Best Quality)

### Runway Gen-3 Alpha
- **Use for:** Hero video loops, transition videos, product cinematics
- **Cost:** ~$0.05–$0.10/second of video. ~$15–$50/month for typical project
- **Quality:** Best-in-class motion, prompt adherence, cinematic feel
- **Limit:** 5–10 second clips. Not seamless loop native — post-process needed
- **Setup:**
  ```bash
  npm install runwayml
  ```
  ```env
  RUNWAY_API_KEY=your_key_here
  ```
- **Seamless loop tip:** Generate start frame + end frame matching, or use img2vid with same start/end image
- **Docs:** https://docs.runwayml.com

### DALL·E 3 (OpenAI)
- **Use for:** Hero section images, product mockups, editorial photography style
- **Cost:** $0.04–$0.08/image (1024×1024 to 1792×1024)
- **Quality:** Strong composition, text rendering (if needed), creative scenarios
- **Setup:**
  ```bash
  npm install openai
  ```
  ```env
  OPENAI_API_KEY=your_key_here
  ```

---

## TIER 2 — MID (Great Balance of Quality & Cost)

### Kling AI 1.6
- **Use for:** Hero video loops, especially product motion, smooth camera work
- **Cost:** Credit-based (~$10–$30/month for moderate use)
- **Quality:** Excellent motion consistency, strong for slow-motion atmospheric
- **API Access:** Via Replicate or direct Kling API
  ```bash
  npm install replicate
  ```
  ```env
  REPLICATE_API_TOKEN=your_token_here
  ```

### Stability AI / Flux Pro
- **Use for:** Section backgrounds, textures, abstract art, atmospheric images
- **Cost:** ~$0.003–$0.05/image depending on model
- **Quality:** Highest image detail and texture quality of all image models
- **Setup:**
  ```bash
  npm install @stability-ai/sdk
  # or via Replicate for Flux
  ```

---

## TIER 3 — DEFAULT FREE (Google Veo 3 + Imagen 3)

### Google Veo 3 (Primary default — best free option)
- **Use for:** Hero video loops, scroll scrub source videos, cinematic section backgrounds
- **Cost:** Free quota via AI Studio. Production via Vertex AI: ~$0.35/second
- **Quality:** Significantly better than Veo 2 — richer motion, better prompt adherence
- **Modes:** Loop (hero bg), Scrub (frame extraction), Cinematic (standard clip)
- **Duration:** Up to 8 seconds per clip at 24fps or 30fps
- **Resolution:** 1080p
- **Fallback:** Script automatically tries Veo 2 if Veo 3 not available on account
- **Setup:**
  ```env
  GOOGLE_AI_STUDIO_KEY=your_key_here
  ```
- **Docs:** https://ai.google.dev
- **Warning:** Quota varies by account tier. Batch across days for large projects.

### Google Imagen 3 (Images — same key as Veo)
- **Use for:** Hero images, section backgrounds, product/editorial photography style
- **Cost:** Free quota via AI Studio
- **Setup:** Same `GOOGLE_AI_STUDIO_KEY` — no additional setup needed

---

## CRITICAL — .generation-prompts.json FORMAT {#prompts-format}

**This is why video was not generating.** Phase 3 MUST output the prompts file
with `"type": "video"` explicitly set on video assets. Without this flag,
the pipeline generates images for everything.

Every Phase 3 output MUST produce a `.generation-prompts.json` in the project root.
The skill generates this file during Phase 3. Template:

```json
{
  "hero": [
    {
      "name":        "Hero Video Loop",
      "type":        "video",
      "videoMode":   "loop",
      "output":      "hero-loop",
      "cloudinaryId":"[PROJECT_SLUG]/video/hero-loop",
      "duration":    8,
      "fps":         24,
      "prompt":      "[Full cinematic video prompt from scene brief]"
    },
    {
      "name":        "Hero Background Image",
      "type":        "image",
      "output":      "hero-bg",
      "cloudinaryId":"[PROJECT_SLUG]/images/hero-bg",
      "aspectRatio": "16:9",
      "prompt":      "[Still image prompt — used as video poster / fallback]"
    }
  ],
  "sections": [
    {
      "name":        "Features Background",
      "type":        "image",
      "output":      "features-bg",
      "cloudinaryId":"[PROJECT_SLUG]/images/features-bg",
      "aspectRatio": "16:9",
      "prompt":      "[Section background prompt]"
    },
    {
      "name":        "Work Section Scrub",
      "type":        "video",
      "videoMode":   "scrub",
      "extractFrames": true,
      "output":      "work-scrub",
      "cloudinaryId":"[PROJECT_SLUG]/video/work-scrub",
      "duration":    8,
      "fps":         30,
      "prompt":      "[Smooth linear motion prompt for frame scrubbing]"
    }
  ],
  "pages": [
    {
      "name":        "About Page Hero",
      "type":        "image",
      "output":      "about-hero",
      "cloudinaryId":"[PROJECT_SLUG]/images/about-hero",
      "prompt":      "[About page hero image prompt]"
    }
  ]
}
```

### VIDEO MODE RULES — tell skill which mode to use per video:

| Behavior from Animation Plan | videoMode to set | extractFrames |
|---|---|---|
| `FRAME_SCROLL` | `"scrub"` | `true` |
| `SCROLL_SCRUBBED_VIDEO` | `"scrub"` | `true` |
| Hero background loop | `"loop"` | `false` |
| `CINEMATIC_CURTAIN` trigger | `"cinematic"` | `false` |
| Any non-interactive video | `"loop"` | `false` |

When `videoMode: "scrub"` and `extractFrames: true`, the pipeline:
1. Generates the video via Veo 3
2. Downloads the mp4
3. Runs FFmpeg to extract all frames as JPGs
4. Uploads all frames to Cloudinary at `[cloudinaryId]-frames/`
5. Generates a `ScrollScrub[Name].tsx` React component ready to drop in

### PHASE 3 OUTPUT INSTRUCTION FOR SKILL:

When generating Phase 3 asset prompts, always:
1. Check the Animation Plan (Phase 1.6) for `FRAME_SCROLL` or `SCROLL_SCRUBBED_VIDEO` behaviors
2. For any section with those behaviors → set `"type": "video"`, `"videoMode": "scrub"`, `"extractFrames": true`
3. For the hero → always output BOTH a `"type": "video"` (loop) AND a `"type": "image"` (poster/fallback)
4. Write the full `.generation-prompts.json` file to the project root during Phase 3
5. Never assume the user will add video assets manually — always include them

### Google Veo 2 (via Vertex AI / AI Studio)
- **Use for:** Hero video loops — strong atmospheric and cinematic output
- **Cost:** Free quota via AI Studio (currently ~10 videos/day)
            Vertex AI pricing: ~$0.35/second after free quota
- **Quality:** Very strong for atmospheric/abstract loops. Excellent motion
- **Limit:** Up to 8 seconds per clip. 720p–1080p
- **Setup (AI Studio — free tier):**
  ```env
  GOOGLE_AI_STUDIO_KEY=your_key_here
  ```
  ```javascript
  import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_KEY);
  // Use the Veo 2 model endpoint when available in SDK
  ```
- **Vertex AI setup (production):**
  ```bash
  npm install @google-cloud/aiplatform
  ```
  ```env
  GOOGLE_CLOUD_PROJECT=your_project_id
  GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
  ```
- **Docs:** https://ai.google.dev / https://cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos
- **Warning:** Quota limits may affect large projects. Batch video generation across days.

### Imagen 3 (via Google AI Studio)
- **Use for:** Hero images, section backgrounds, product mockups
- **Cost:** Free quota via AI Studio
- **Quality:** Strong cinematic photography style, good for lifestyle and atmospheric
- **Setup:** Same key as Veo 2 — same SDK
  ```javascript
  const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" });
  const result = await model.generateImages({ prompt: "...", numberOfImages: 1 });
  ```

---

## TIER 4 — ZERO COST FALLBACK

When user has NO API keys or budget = zero, use this tier. Communicate clearly that
visual quality will be lower but can still be cinematic with the right code techniques.

### Unsplash API (Images)
- **Cost:** Free with attribution (Unsplash license)
- **Quality:** High-quality photography — good cinematic options available
- **Setup:**
  ```env
  UNSPLASH_ACCESS_KEY=your_key_here
  ```
  ```javascript
  // Fetch cinematic photo matching scene brief
  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }}
  );
  ```
- **Attribution note:** Must credit photographer. Include in footer/image caption.
- **Register:** https://unsplash.com/developers (free)

### Pexels API (Video + Images)
- **Cost:** Free, no attribution required
- **Quality:** Good stock video library, cinematic options available
- **Use for:** Hero video fallback when no generation API available
  ```env
  PEXELS_API_KEY=your_key_here
  ```
- **Register:** https://www.pexels.com/api/ (free)

### Spline Free Tier (3D)
- **Use for:** 3D elements in hero
- **Cost:** Free — with Spline branding on free tier
- **Limit:** Embed via iframe or Spline Viewer SDK
- **Upgrade:** $16/month to remove branding (recommend for client work)
  ```bash
  npm install @splinetool/react-spline
  # or
  npm install @splinetool/runtime
  ```
- **Warning:** WebGL heavy — always provide static fallback image

### GSAP Free Tier (Animation)
- **Use for:** Scroll animations, text reveals, timeline animations
- **Cost:** Free for personal/non-commercial. Club at $99/yr for commercial + premium plugins
- **Free plugins:** ScrollTrigger, ScrollTo, Draggable, Flip, Observer (all free)
- **Club-only plugins:** SplitText, MorphSVG, ScrollSmoother, MotionPathPlugin
- **Recommendation:** Free tier covers 90% of cinematic scroll needs
  ```bash
  npm install gsap
  ```
- **License warning:** Always flag to user if site is commercial — Club required

---

## CLOUDINARY SETUP (ALL TIERS)

Cloudinary is the asset delivery layer for ALL tiers.

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm install cloudinary next-cloudinary  # for Next.js
# or
npm install cloudinary @nuxtjs/cloudinary  # for Nuxt
# or
npm install cloudinary  # for others
```

**Free tier:** 25GB storage, 25GB bandwidth/month, auto transformations
**Folder structure for all projects:**
```
/{project-slug}/
  ├── hero/
  │   ├── hero-bg.jpg
  │   └── hero-fg.png
  ├── video/
  │   └── hero-loop.mp4
  ├── sections/
  │   ├── about-bg.jpg
  │   ├── features-bg.jpg
  │   └── cta-bg.jpg
  └── pages/
      ├── about/
      ├── product/
      └── contact/
```

**Standard transformations to use:**
- Images: `f_auto,q_auto,w_auto` (auto format, quality, width)
- Video: `f_auto,vc_auto,q_auto` (auto codec, quality)
- Hero (large): `f_auto,q_auto,w_2560,c_fill`
- Thumbnail: `f_auto,q_auto,w_800,h_450,c_fill`

---

## GENERATION QUEUE STRATEGY {#queue}

### The Problem
Video generation takes 2–5 minutes. Never make the user wait idle.

### The Solution — Parallel Workflow
```
Phase 2 approved → OUTPUT video prompt + START generation → MOVE to Phase 4 simultaneously
Phase 4 complete → CHECK generation status → if READY: Phase 5 | if PENDING: continue Phase 5, add video last
```

### Status Tracking
After submitting a generation job, save to `.generation-jobs.json`:
```json
{
  "operations/abc123": {
    "type": "video",
    "api": "veo2",
    "asset": "hero-loop",
    "status": "GENERATING",
    "startedAt": 1710000000000,
    "prompt": "..."
  }
}
```

Check status any time: `node scripts/generate-assets.js --status operations/abc123`

### Retry Policy
- Generation failure → auto-retry once with same prompt
- Second failure → fall back to next API tier in chain
- All APIs fail → use CSS-only animation for that component, flag in README

### Expected Wait Times Per API
| API       | Typical Wait | Max Wait | Retry After |
|-----------|-------------|----------|-------------|
| Veo 2     | 2–4 min     | 10 min   | 30s between polls |
| Runway    | 3–5 min     | 15 min   | 15s between polls |
| Kling     | 2–4 min     | 10 min   | 20s between polls |
| Imagen 3  | 15–30 sec   | 2 min    | 10s between polls |
| DALL·E 3  | 10–20 sec   | 1 min    | immediate response |

### User Communication Template
When queuing a generation, tell the user:
```
🎬 Hero video prompt submitted to [API]. Estimated wait: ~[N] minutes.
   Job ID saved to .generation-jobs.json
   Check status: node scripts/generate-assets.js --status [JOB_ID]

   Moving to Phase 4 (tech stack) while it generates.
   The video will be ready to wire in during Phase 5.
```
