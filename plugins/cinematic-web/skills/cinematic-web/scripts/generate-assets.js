#!/usr/bin/env node
/**
 * cinematic-web — Asset Generation Pipeline v2
 * =============================================
 * Generates images AND videos, extracts frames for scroll animation,
 * processes seamless loops, and uploads everything to Cloudinary.
 *
 * VIDEO MODES:
 *   loop      — seamless looping hero video (default)
 *   scrub     — frame-by-frame scroll animation (Apple-style)
 *   cinematic — standard cinematic clip
 *
 * USAGE:
 *   node scripts/generate-assets.js --phase hero --api veo3
 *   node scripts/generate-assets.js --phase hero --api veo3 --video-mode scrub
 *   node scripts/generate-assets.js --type video --prompt "..." --output hero-loop
 *   node scripts/generate-assets.js --type image --prompt "..." --output hero-bg
 *   node scripts/generate-assets.js --extract-frames --video tmp/hero.mp4 --fps 24
 *   node scripts/generate-assets.js --phase all
 *   node scripts/generate-assets.js --list-jobs
 *
 * REQUIREMENTS:
 *   npm install cloudinary        (always)
 *   brew install ffmpeg           (macOS — for frame extraction)
 *   sudo apt install ffmpeg       (Linux — for frame extraction)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');

// ── CLI Parser ────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const out  = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      out[key]  = args[i+1] && !args[i+1].startsWith('--') ? args[++i] : true;
    }
  }
  return out;
}

// ── Help ──────────────────────────────────────────────────────────
function printHelp() {
  console.log(`
cinematic-web Asset Pipeline v2

PHASE GENERATION:
  --phase [hero|sections|all]     Generate all assets for a phase
  --api   [veo3|veo2|runway|imagen3|dalle3|unsplash]
  --video-mode [loop|scrub|cinematic]   default: loop

SINGLE ASSET:
  --type [image|video] --prompt "..." --output [name]

FRAME EXTRACTION (scroll scrub animation):
  --extract-frames --video [path.mp4]   Extract frames from video
  --fps [24]                            Frame rate (default: 24)
  --make-loop                           Process seamless loop version

UTILITIES:
  --list-jobs      Show recent generation jobs
  --help           Show this help

FRAME EXTRACTION requires FFmpeg:
  macOS:   brew install ffmpeg
  Linux:   sudo apt install ffmpeg
  Windows: https://ffmpeg.org/download.html

VIDEO MODE NOTES:
  loop    — Veo generates a clip; pipeline crossfades end→start for seamless loop
  scrub   — Generates at 30fps, extracts all frames, uploads to Cloudinary,
            outputs a ready-to-use ScrollScrub React component
  cinematic — Standard clip, no loop processing

EXAMPLES:
  # Hero video loop (default):
  node scripts/generate-assets.js --phase hero --api veo3

  # Hero as scroll scrub (extracts frames automatically):
  node scripts/generate-assets.js --phase hero --api veo3 --video-mode scrub

  # Extract frames from existing video:
  node scripts/generate-assets.js --extract-frames --video tmp/hero-loop.mp4

  # Generate everything:
  node scripts/generate-assets.js --phase all
`);
}

// ── Env Loader ────────────────────────────────────────────────────
function loadEnv() {
  const candidates = [
    join(ROOT, '.env.local'),
    join(ROOT, '.env'),
    join(process.env.HOME ?? '', '.claude', '.env.cinematic-web'),
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf-8').split('\n')) {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
    console.log(`✓ Env loaded from ${p}`);
    return;
  }
}

// ── API Detection ─────────────────────────────────────────────────
function detectBestAPI(type = 'image') {
  if (type === 'video') {
    if (process.env.GOOGLE_AI_STUDIO_KEY) return 'veo3';
    if (process.env.RUNWAY_API_KEY)        return 'runway';
    if (process.env.REPLICATE_API_TOKEN)   return 'kling';
    return 'none';
  }
  if (process.env.OPENAI_API_KEY)       return 'dalle3';
  if (process.env.GOOGLE_AI_STUDIO_KEY) return 'imagen3';
  if (process.env.STABILITY_API_KEY)    return 'stability';
  if (process.env.UNSPLASH_ACCESS_KEY)  return 'unsplash';
  return 'none';
}

// ── FFmpeg Check ──────────────────────────────────────────────────
function checkFFmpeg() {
  try { execSync('ffmpeg -version', { stdio: 'pipe' }); return true; }
  catch { return false; }
}

// ── Cloudinary Upload ─────────────────────────────────────────────
async function uploadToCloudinary(filePath, publicId, resourceType = 'image') {
  const { cloud_name, api_key, api_secret } = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };
  if (!cloud_name || !api_key || !api_secret)
    throw new Error('Missing Cloudinary credentials. Check .env');

  const { v2: cloudinary } = await import('cloudinary');
  cloudinary.config({ cloud_name, api_key, api_secret });

  console.log(`  ↑ Uploading: ${publicId} (${resourceType})`);
  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicId, resource_type: resourceType,
    overwrite: true, tags: ['cinematic-web', 'generated'],
  });
  console.log(`  ✓ Live: ${result.secure_url}`);
  return result;
}

// ── File Download ─────────────────────────────────────────────────
async function downloadFile(url, destPath) {
  mkdirSync(dirname(destPath), { recursive: true });
  console.log(`  ↓ Downloading to ${destPath}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  await pipeline(res.body, createWriteStream(destPath));
  console.log('  ✓ Downloaded');
  return destPath;
}

// ── Spinner ───────────────────────────────────────────────────────
function spinner(msg) {
  const f = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  let i = 0;
  const t = setInterval(() => process.stdout.write(`\r${f[i++%f.length]} ${msg}`), 100);
  return {
    ok:   m => { clearInterval(t); console.log(`\r✓ ${m}      `); },
    fail: m => { clearInterval(t); console.log(`\r✗ ${m}      `); },
  };
}

// ── Poll ──────────────────────────────────────────────────────────
async function poll(checkFn, { interval = 10000, timeout = 600000, label = '' } = {}) {
  const start = Date.now();
  const s = spinner(`${label}...`);
  while (Date.now() - start < timeout) {
    const r = await checkFn();
    const status = r?.done ? 'DONE' : (r?.status ?? '').toUpperCase();
    if (r?.done || status === 'COMPLETE' || status === 'SUCCEEDED') {
      s.ok(`${label} — ${Math.round((Date.now()-start)/1000)}s`);
      return r;
    }
    if (status === 'FAILED' || status === 'ERROR') {
      s.fail(`${label} failed`);
      throw new Error(`Generation failed: ${JSON.stringify(r.error ?? r)}`);
    }
    await new Promise(r => setTimeout(r, interval));
  }
  s.fail(`${label} timed out`);
  throw new Error('Generation timeout — check .generation-jobs.json');
}

// ── Save Job ──────────────────────────────────────────────────────
function saveJob(id, meta) {
  const f = join(ROOT, '.generation-jobs.json');
  const j = existsSync(f) ? JSON.parse(readFileSync(f,'utf-8')) : {};
  j[id]   = { ...meta, startedAt: Date.now() };
  writeFileSync(f, JSON.stringify(j, null, 2));
}

// ── Video Prompt Enhancement ──────────────────────────────────────
function enhancePrompt(base, mode) {
  const instructions = {
    loop:      'seamlessly looping — first and last frame must match perfectly, motion is cyclical and continuous, subtle ambient motion suitable for background video',
    scrub:     'consistent linear motion from start to finish — no sudden changes, camera or subject moves steadily in one direction, high detail preserved throughout, action completes fully within the clip',
    cinematic: 'cinematic quality, dramatic lighting, strong shadows and highlights, deliberate professional camera movement',
  };
  return `${base}. ${instructions[mode] ?? instructions.cinematic}. No text, no watermarks, no people unless specified.`;
}

// ═══════════════════════════════════════════════════════════════
// VIDEO GENERATION
// ═══════════════════════════════════════════════════════════════

async function generateVideoVeo3(prompt, options = {}) {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) throw new Error('GOOGLE_AI_STUDIO_KEY not set');

  const mode     = options.videoMode ?? 'loop';
  const enhanced = enhancePrompt(prompt, mode);
  const dur      = options.duration ?? 8;
  const fps      = options.fps ?? (mode === 'scrub' ? 30 : 24);

  // Try Veo 3 first, fall back to Veo 2
  const models = ['veo-3.0-generate-001', 'veo-2.0-generate-001'];

  for (const model of models) {
    try {
      console.log(`\n🎬 Submitting to ${model}...`);
      console.log(`   Mode: ${mode} | Duration: ${dur}s | FPS: ${fps}`);
      console.log(`   Prompt: "${enhanced.substring(0,100)}..."`);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning?key=${apiKey}`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: enhanced, video: { durationSeconds: dur, fps } }],
            parameters: { aspectRatio: options.aspectRatio ?? '16:9', personGeneration: 'dont_allow', addWatermark: false },
          }),
        }
      );

      if (res.status === 404 && model !== models[models.length-1]) {
        console.log(`  ${model} not available — trying ${models[1]}...`);
        continue;
      }
      if (!res.ok) {
        const e = await res.text();
        throw new Error(`${model}: ${res.status} — ${e}`);
      }

      const job = await res.json();
      const opName = job.name;
      console.log(`  Job: ${opName}`);
      saveJob(opName, { type: 'video', api: model, mode, prompt: enhanced });

      const result = await poll(
        async () => {
          const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${apiKey}`);
          return await r.json();
        },
        { label: `Generating (${model})`, interval: 10000, timeout: 600000 }
      );

      return result.response?.videos?.[0];

    } catch (err) {
      if (model === models[models.length-1]) throw err;
      console.log(`  ${model} failed: ${err.message}`);
    }
  }
}

async function generateVideoRunway(prompt, options = {}) {
  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) throw new Error('RUNWAY_API_KEY not set');

  const mode     = options.videoMode ?? 'loop';
  const enhanced = enhancePrompt(prompt, mode);

  console.log('\n🎬 Submitting to Runway Gen-3...');

  const res = await fetch('https://api.runwayml.com/v1/image_to_video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gen3a_turbo', promptText: enhanced, duration: options.duration ?? 10, ratio: '1280:768' }),
  });

  if (!res.ok) throw new Error(`Runway: ${res.status} — ${await res.text()}`);
  const job = await res.json();
  saveJob(job.id, { type: 'video', api: 'runway', mode, prompt: enhanced });

  return await poll(
    async () => {
      const r = await fetch(`https://api.runwayml.com/v1/tasks/${job.id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      return await r.json();
    },
    { label: 'Generating (Runway)', interval: 15000, timeout: 600000 }
  );
}

async function generateVideo(api, prompt, options) {
  switch (api) {
    case 'veo3':
    case 'veo2':   return generateVideoVeo3(prompt, options);
    case 'runway': return generateVideoRunway(prompt, options);
    default:
      if (process.env.GOOGLE_AI_STUDIO_KEY) return generateVideoVeo3(prompt, options);
      throw new Error(`Unknown video API: ${api}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// IMAGE GENERATION
// ═══════════════════════════════════════════════════════════════

async function generateImageImagen3(prompt, options = {}) {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) throw new Error('GOOGLE_AI_STUDIO_KEY not set');
  console.log('\n🖼  Imagen 3...'); console.log(`   "${prompt.substring(0,80)}..."`);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
    {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances:  [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: options.aspectRatio ?? '16:9', personGeneration: 'dont_allow', addWatermark: false },
      }),
    }
  );
  if (!res.ok) throw new Error(`Imagen 3: ${res.status} — ${await res.text()}`);
  return (await res.json()).predictions ?? [];
}

async function generateImageDalle3(prompt, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  console.log('\n🖼  DALL·E 3...');

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: options.size ?? '1792x1024', quality: 'hd' }),
  });
  if (!res.ok) throw new Error(`DALL·E 3: ${res.status} — ${await res.text()}`);
  return (await res.json()).data;
}

async function fetchUnsplash(query) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error('UNSPLASH_ACCESS_KEY not set');
  const r = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`, {
    headers: { Authorization: `Client-ID ${key}` },
  });
  const d = await r.json();
  return [{ url: d.urls?.raw + '&w=2560&q=90' }];
}

async function generateImage(api, prompt, options = {}) {
  switch (api) {
    case 'imagen3':  return generateImageImagen3(prompt, options);
    case 'dalle3':   return generateImageDalle3(prompt, options);
    case 'unsplash': return fetchUnsplash(prompt);
    default:
      if (process.env.GOOGLE_AI_STUDIO_KEY) return generateImageImagen3(prompt, options);
      if (process.env.OPENAI_API_KEY)       return generateImageDalle3(prompt, options);
      if (process.env.UNSPLASH_ACCESS_KEY)  return fetchUnsplash(prompt);
      throw new Error(`No image API available. Set GOOGLE_AI_STUDIO_KEY, OPENAI_API_KEY, or UNSPLASH_ACCESS_KEY`);
  }
}

// ═══════════════════════════════════════════════════════════════
// FRAME EXTRACTION & SCROLL SCRUB
// ═══════════════════════════════════════════════════════════════

async function extractFrames(videoPath, options = {}) {
  if (!checkFFmpeg()) {
    console.error('\n✗ FFmpeg required for frame extraction.');
    console.error('  macOS:  brew install ffmpeg');
    console.error('  Linux:  sudo apt install ffmpeg\n');
    process.exit(1);
  }

  const fps        = parseInt(options.fps ?? 24);
  const name       = options.outputName ?? basename(videoPath, extname(videoPath));
  const framesDir  = join(ROOT, 'tmp', 'frames', name);
  const slug       = process.env.PROJECT_SLUG ?? 'cinematic-web';
  const cdnDir     = options.cloudinaryDir ?? `${slug}/frames/${name}`;

  mkdirSync(framesDir, { recursive: true });

  // Get video info
  const probe = JSON.parse(
    execSync(`ffprobe -v quiet -print_format json -show_streams "${videoPath}"`, { encoding: 'utf-8' })
  );
  const stream   = probe.streams.find(s => s.codec_type === 'video') ?? {};
  const duration = parseFloat(stream.duration ?? '0');
  const total    = Math.ceil(duration * fps);

  console.log(`\n🎞  Frame Extraction`);
  console.log(`   Source:   ${videoPath}`);
  console.log(`   Duration: ${duration.toFixed(2)}s`);
  console.log(`   FPS:      ${fps}`);
  console.log(`   Expected: ~${total} frames`);

  // Extract
  const cmd = `ffmpeg -i "${videoPath}" -vf "fps=${fps},scale=1920:-2" -q:v 2 -start_number 0 "${framesDir}/frame-%04d.jpg" -y`;
  const s = spinner('Extracting frames with FFmpeg');
  try {
    await execAsync(cmd);
    s.ok('Frames extracted');
  } catch (err) {
    s.fail('FFmpeg failed');
    throw new Error(err.message);
  }

  const files = readdirSync(framesDir).filter(f => f.endsWith('.jpg')).sort();
  console.log(`  ✓ ${files.length} frames extracted`);

  // Optional: make seamless loop version
  if (options.makeLoop) {
    await processSeamlessLoop(videoPath);
  }

  // Upload to Cloudinary
  if (options.upload !== false) {
    const { v2: cloudinary } = await import('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log(`\n  ↑ Uploading ${files.length} frames to Cloudinary (${cdnDir}/)`);
    let done = 0;
    const batch = 5;
    for (let i = 0; i < files.length; i += batch) {
      await Promise.all(files.slice(i, i+batch).map(async f => {
        await cloudinary.uploader.upload(join(framesDir, f), {
          public_id:     `${cdnDir}/${basename(f,'.jpg')}`,
          resource_type: 'image',
          overwrite:     true,
          format:        'jpg',
          quality:       'auto:good',
          tags:          ['cinematic-web','frame','scroll-scrub'],
        });
        done++;
      }));
      process.stdout.write(`\r  ↑ Uploaded ${done}/${files.length}...`);
    }
    console.log(`\r  ✓ All ${files.length} frames on Cloudinary          `);
  }

  // Generate manifest + component
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const base  = `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto`;
  const manifest = {
    meta: { totalFrames: files.length, fps, duration, cdnDir },
    frames: files.map((f, i) => ({
      index: i,
      url:   `${base}/${cdnDir}/${basename(f,'.jpg')}`,
    })),
  };

  const manifestPath  = join(ROOT, 'tmp', `${name}-manifest.json`);
  const componentPath = join(ROOT, 'tmp', `ScrollScrub${toPascal(name)}.tsx`);

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  writeFileSync(componentPath, buildScrollScrubComponent(name, manifest));

  console.log(`\n  ✓ Manifest:  ${manifestPath}`);
  console.log(`  ✓ Component: ${componentPath}`);
  console.log('\n  Next: copy both files into your project, import the component.');

  return { framesDir, files, manifest, manifestPath, componentPath };
}

async function processSeamlessLoop(videoPath) {
  const out = videoPath.replace(/\.\w+$/, '-loop.mp4');
  const cmd = `ffmpeg -i "${videoPath}" -filter_complex "[0:v]split=2[main][lp];[lp]trim=0:1,setpts=PTS-STARTPTS[ls];[main][ls]xfade=fade:duration=1:offset=7[out]" -map "[out]" -c:v libx264 -crf 18 "${out}" -y`;
  try {
    await execAsync(cmd);
    console.log(`  ✓ Seamless loop: ${out}`);
    return out;
  } catch {
    console.log('  ⚠ Seamless loop skipped');
    return videoPath;
  }
}

function toPascal(str) {
  return str.replace(/([-_\s]+\w)/g, m => m.slice(-1).toUpperCase()).replace(/^\w/, c => c.toUpperCase());
}

function buildScrollScrubComponent(name, manifest) {
  const pascal = toPascal(name);
  const frameUrls = JSON.stringify(manifest.frames.map(f => f.url), null, 2);
  const scrollH   = Math.max(300, manifest.meta.totalFrames * 5);

  return `'use client'
/**
 * ScrollScrub${pascal} — Auto-generated by cinematic-web
 * Plays ${manifest.meta.totalFrames} frames frame-by-frame as user scrolls.
 * Scroll distance: ${scrollH}vh
 *
 * Usage: <ScrollScrub${pascal} />
 * Add children to overlay content on the scrub canvas.
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const FRAMES: string[] = ${frameUrls}
const TOTAL = ${manifest.meta.totalFrames}

export function ScrollScrub${pascal}({ children }: { children?: React.ReactNode }) {
  const ref    = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const curr   = useRef(0)

  useEffect(() => {
    if (!ref.current || !canvas.current) return
    const ctx = canvas.current.getContext('2d')
    if (!ctx) return

    canvas.current.width  = window.innerWidth
    canvas.current.height = window.innerHeight

    // Preload all frames
    let loaded = 0
    const imgs = FRAMES.map((src, i) => {
      const img = new Image()
      img.onload = () => {
        loaded++
        if (i === 0) ctx.drawImage(img, 0, 0, canvas.current!.width, canvas.current!.height)
        if (loaded === TOTAL) ScrollTrigger.refresh()
      }
      img.src = src
      return img
    })

    function draw(index: number) {
      const img = imgs[Math.max(0, Math.min(index, TOTAL - 1))]
      if (img.complete && canvas.current) {
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height)
        ctx.drawImage(img, 0, 0, canvas.current.width, canvas.current.height)
      }
    }

    const proxy = { frame: 0 }
    const gsapCtx = gsap.context(() => {
      gsap.to(proxy, {
        frame: TOTAL - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
          onUpdate: () => {
            const f = Math.round(proxy.frame)
            if (f !== curr.current) { curr.current = f; draw(f) }
          },
        },
      })
    }, ref)

    const resize = () => {
      if (!canvas.current) return
      canvas.current.width  = window.innerWidth
      canvas.current.height = window.innerHeight
      draw(curr.current)
    }
    window.addEventListener('resize', resize)

    return () => {
      gsapCtx.revert()
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div ref={ref} suppressHydrationWarning style={{ height: '${scrollH}vh', position: 'relative' }}>
      <canvas ref={canvas} suppressHydrationWarning
        style={{ position: 'sticky', top: 0, width: '100vw', height: '100vh', display: 'block' }} />
      {children && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      zIndex: 10, pointerEvents: 'none' }}>
          {children}
        </div>
      )}
    </div>
  )
}
`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  loadEnv();
  const args = parseArgs();

  if (args.help)         { printHelp(); return; }
  if (args['list-jobs']) {
    const f = join(ROOT, '.generation-jobs.json');
    if (!existsSync(f)) { console.log('No jobs.'); return; }
    console.table(Object.entries(JSON.parse(readFileSync(f,'utf-8'))).map(([id,j]) => ({
      id: id.slice(0,50)+'...', ...j, age: `${Math.round((Date.now()-j.startedAt)/1000)}s ago`,
    })));
    return;
  }

  // Frame extraction only
  if (args['extract-frames'] && args.video) {
    await extractFrames(args.video, {
      fps:      args.fps ?? 24,
      makeLoop: args['make-loop'] === true,
      upload:   args['no-upload'] !== true,
    });
    return;
  }

  const tmpDir    = join(ROOT, 'tmp');
  const videoMode = args['video-mode'] ?? 'loop';
  mkdirSync(tmpDir, { recursive: true });

  // Single asset
  if (args.prompt && args.output) {
    const type   = args.type ?? 'image';
    const slug   = process.env.PROJECT_SLUG ?? 'cinematic-web';
    const api    = args.api ?? detectBestAPI(type);
    const pubId  = `${slug}/${type === 'video' ? 'video' : 'images'}/${args.output}`;

    console.log(`\n🎬 cinematic-web Pipeline | ${type} | ${api}${type==='video' ? ` | ${videoMode}` : ''}`);

    if (type === 'video') {
      const result = await generateVideo(api, args.prompt, { videoMode });
      const url    = result?.url ?? result?.output?.[0] ?? result?.uri;
      if (!url) throw new Error('No video URL in result');
      const fp = join(tmpDir, `${args.output}.mp4`);
      await downloadFile(url, fp);
      await uploadToCloudinary(fp, pubId, 'video');

      if (videoMode === 'scrub' || args['extract-frames']) {
        await extractFrames(fp, { fps: args.fps ?? 24, outputName: args.output,
          cloudinaryDir: `${slug}/frames/${args.output}`, upload: true });
      }
      if (videoMode === 'loop' && checkFFmpeg()) {
        await processSeamlessLoop(fp);
      }
    } else {
      const result = await generateImage(api, args.prompt, {});
      const fp     = join(tmpDir, `${args.output}.jpg`);
      if (result[0]?.bytesBase64Encoded) {
        writeFileSync(fp, Buffer.from(result[0].bytesBase64Encoded, 'base64'));
      } else {
        await downloadFile(result[0]?.url ?? result[0], fp);
      }
      await uploadToCloudinary(fp, pubId, 'image');
    }
    console.log(`\n✅ Done — ${pubId}`);
    return;
  }

  // Phase-based generation
  const promptsFile = join(ROOT, '.generation-prompts.json');
  if (!existsSync(promptsFile)) {
    console.error('\n❌ No .generation-prompts.json found.');
    console.log('   Complete Phase 3 with Claude to generate this file.');
    console.log('   Or use: --type [image|video] --prompt "..." --output [name]');
    process.exit(1);
  }

  const prompts = JSON.parse(readFileSync(promptsFile, 'utf-8'));
  const phase   = args.phase ?? 'all';
  const assets  = phase === 'all'
    ? Object.values(prompts).flat()
    : (prompts[phase] ?? []);

  if (!assets.length) { console.log(`No assets for phase: ${phase}`); return; }

  const vAPI = args.api ?? detectBestAPI('video');
  const iAPI = args.api ?? detectBestAPI('image');
  const vids  = assets.filter(a => a.type === 'video');
  const imgs  = assets.filter(a => a.type !== 'video');

  console.log(`\n🎬 cinematic-web Pipeline | phase: ${phase}`);
  console.log(`   ${assets.length} assets (${vids.length} videos, ${imgs.length} images)`);
  console.log(`   Video API: ${vAPI} | Image API: ${iAPI}`);

  if (vids.length && vAPI === 'none') {
    console.warn('\n  ⚠ No video API key. Videos will be skipped.');
    console.warn('  Set GOOGLE_AI_STUDIO_KEY for free Veo 3 access.');
  }

  const results = [];
  for (const asset of assets) {
    try {
      const isVideo = asset.type === 'video';
      const isRemotion = asset.type === 'remotion';
      const api     = isVideo ? vAPI : iAPI;
      const mode    = asset.videoMode ?? videoMode;

      console.log(`\n[${assets.indexOf(asset)+1}/${assets.length}] ${asset.name} (${isVideo?'video':'image'}${isVideo?` · ${mode}`:''})`);

      if (isVideo && api === 'none') {
        console.log('   Skipped — no video API');
        continue;
      }

      let fp;
      if (isVideo) {
        const result = await generateVideo(api, asset.prompt, { duration: asset.duration??8, videoMode: mode, fps: asset.fps??24 });
        const url = result?.url ?? result?.output?.[0] ?? result?.uri;
        if (!url) throw new Error('No video URL');
        fp = join(tmpDir, `${asset.output}.mp4`);
        await downloadFile(url, fp);
        await uploadToCloudinary(fp, asset.cloudinaryId, 'video');

        if (mode === 'scrub' || asset.extractFrames) {
          await extractFrames(fp, { fps: asset.fps??24, outputName: asset.output,
            cloudinaryDir: `${asset.cloudinaryId}-frames`, upload: true });
        }
        if (mode === 'loop' && checkFFmpeg()) {
          await processSeamlessLoop(fp);
        }
      } else if (asset.type === 'remotion') {
        // Remotion asset — render locally or via Lambda
        console.log(`\n  Remotion composition: ${asset.composition}`);
        console.log(`  This renders locally — no API credits needed.`);
        console.log(`\n  To render this asset:`);
        console.log(`    Preview:  npx remotion studio`);
        if (asset.extractFrames) {
          console.log(`    Frames:   npx remotion render ${asset.composition} out/frames/${asset.output}/ --image-format=jpeg`);
          console.log(`    Then run: node scripts/generate-assets.js --extract-frames --frames-dir out/frames/${asset.output}/ --output ${asset.output}`);
        } else {
          console.log(`    Render:   npx remotion render ${asset.composition} out/${asset.output}.mp4`);
          console.log(`    Lambda:   npx remotion lambda render ${asset.composition}`);
        }
        if (asset.notes) console.log(`\n  Note: ${asset.notes}`);
        results.push({ name: asset.name, status: 'ok', note: 'Remotion — render locally' });
        continue;
      } else {
        const result = await generateImage(api, asset.prompt, asset.options ?? {});
        fp = join(tmpDir, `${asset.output}.jpg`);
        mkdirSync(tmpDir, { recursive: true });
        if (result[0]?.bytesBase64Encoded) {
          writeFileSync(fp, Buffer.from(result[0].bytesBase64Encoded, 'base64'));
        } else {
          await downloadFile(result[0]?.url ?? result[0], fp);
        }
        await uploadToCloudinary(fp, asset.cloudinaryId, 'image');
      }

      results.push({ name: asset.name, status: 'ok' });
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
      results.push({ name: asset.name, status: 'failed', error: err.message });
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════');
  results.forEach(r => console.log(`  ${r.status==='ok'?'✓':'✗'} ${r.name}${r.error?` — ${r.error}`:''}`));
  console.log(`\n  ${results.filter(r=>r.status==='ok').length}/${results.length} assets generated`);
}

main().catch(err => { console.error('\n❌', err.message); process.exit(1); });
