#!/usr/bin/env node
/**
 * cinematic-web — Environment Validator
 * =======================================
 * Run this before starting dev or deploying.
 * Fails fast with clear instructions if required vars are missing.
 *
 * Usage:
 *   node scripts/validate-env.js
 *   node scripts/validate-env.js --strict   (fail on optional too)
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const args      = process.argv.slice(2);
const strict    = args.includes('--strict');

// Load .env files
function loadEnv() {
  for (const file of ['.env.local', '.env', '.env.production']) {
    const path = join(ROOT, file);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
      }
    }
    return file;
  }
  return null;
}

const envFile = loadEnv();
console.log(`\n🔍 cinematic-web Environment Validator`);
console.log(`   Env file: ${envFile ?? 'none found — using process.env only'}\n`);

// ── Variable Definitions ──────────────────────────────────────────
const REQUIRED = [
  { key: 'CLOUDINARY_CLOUD_NAME',             desc: 'Cloudinary cloud name',        link: 'cloudinary.com/console' },
  { key: 'CLOUDINARY_API_KEY',                desc: 'Cloudinary API key',           link: 'cloudinary.com/console' },
  { key: 'CLOUDINARY_API_SECRET',             desc: 'Cloudinary API secret',        link: 'cloudinary.com/console' },
  { key: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', desc: 'Cloudinary cloud (public)',    link: 'cloudinary.com/console' },
  { key: 'NEXT_PUBLIC_SITE_URL',              desc: 'Site URL (e.g. https://...)',  link: null },
];

const GENERATION_APIS = [
  { key: 'GOOGLE_AI_STUDIO_KEY', desc: 'Google AI Studio (Veo 3 + Imagen 3)', link: 'aistudio.google.com' },
  { key: 'OPENAI_API_KEY',       desc: 'OpenAI (DALL·E 3)',                    link: 'platform.openai.com/api-keys' },
  { key: 'RUNWAY_API_KEY',       desc: 'Runway Gen-3 (premium video)',         link: 'runwayml.com' },
  { key: 'REPLICATE_API_TOKEN',  desc: 'Replicate (Kling AI video)',           link: 'replicate.com/account' },
  { key: 'STABILITY_API_KEY',    desc: 'Stability AI / Flux (images)',         link: 'stability.ai' },
  { key: 'UNSPLASH_ACCESS_KEY',  desc: 'Unsplash (free stock photos)',         link: 'unsplash.com/developers' },
  { key: 'PEXELS_API_KEY',       desc: 'Pexels (free stock video)',            link: 'pexels.com/api' },
];

// ── Database / Backend (one group per backend type) ───────────────
const SUPABASE_VARS = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL',      desc: 'Supabase project URL',     link: 'supabase.com/dashboard' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', desc: 'Supabase anon key',        link: 'supabase.com/dashboard → Settings → API' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY',     desc: 'Supabase service role key (server only)', link: 'supabase.com/dashboard → Settings → API' },
];

const DATABASE_VARS = [
  { key: 'DATABASE_URL', desc: 'Postgres connection string (Neon/Supabase/local)', link: 'neon.tech or supabase.com' },
];

// ── Auth providers (check whichever is in use) ────────────────────
const AUTH_VARS = [
  { key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', desc: 'Clerk publishable key',           link: 'clerk.com/dashboard → API Keys' },
  { key: 'CLERK_SECRET_KEY',                  desc: 'Clerk secret key',                link: 'clerk.com/dashboard → API Keys' },
  { key: 'CLERK_WEBHOOK_SECRET',              desc: 'Clerk webhook secret (user sync)', link: 'clerk.com → Webhooks' },
  { key: 'AUTH_SECRET',                       desc: 'Auth.js secret (openssl rand -base64 32)', link: null },
];

// ── Payments ──────────────────────────────────────────────────────
const STRIPE_VARS = [
  { key: 'STRIPE_PUBLISHABLE_KEY',  desc: 'Stripe publishable key',  link: 'dashboard.stripe.com → Developers' },
  { key: 'STRIPE_SECRET_KEY',       desc: 'Stripe secret key',       link: 'dashboard.stripe.com → Developers' },
  { key: 'STRIPE_WEBHOOK_SECRET',   desc: 'Stripe webhook secret',   link: 'dashboard.stripe.com → Webhooks' },
];

const OPTIONAL = [
  { key: 'NEXT_PUBLIC_GA_MEASUREMENT_ID',    desc: 'Google Analytics 4',              group: 'Analytics' },
  { key: 'NEXT_PUBLIC_HOTJAR_ID',            desc: 'Hotjar heatmaps',                 group: 'Analytics' },
  { key: 'RESEND_API_KEY',                   desc: 'Resend (forms/email)',             group: 'Email' },
  { key: 'FROM_EMAIL',                       desc: 'From email address',               group: 'Email' },
  { key: 'TO_EMAIL',                         desc: 'Notification recipient',           group: 'Email' },
  { key: 'UPSTASH_REDIS_REST_URL',           desc: 'Upstash Redis URL (rate limiting)',group: 'Security' },
  { key: 'UPSTASH_REDIS_REST_TOKEN',         desc: 'Upstash Redis token',             group: 'Security' },
  { key: 'REVALIDATION_SECRET',              desc: 'ISR revalidation secret',         group: 'CMS' },
  { key: 'CRON_SECRET',                      desc: 'Vercel Cron auth secret',         group: 'CMS' },
  { key: 'NEXT_PUBLIC_SENTRY_DSN',           desc: 'Sentry error monitoring',         group: 'Monitoring' },
  { key: 'SENTRY_AUTH_TOKEN',                desc: 'Sentry source maps token',        group: 'Monitoring' },
  { key: 'SLACK_WEBHOOK_URL',                desc: 'Slack deploy notifications',      group: 'Deploy' },
];

// ── Checks ────────────────────────────────────────────────────────
let hasErrors   = false;
let hasWarnings = false;

function check(vars, label, failOnMissing = true) {
  console.log(`── ${label} ${'─'.repeat(Math.max(0, 40 - label.length))}`);
  let sectionPass = true;

  for (const { key, desc, link, group } of vars) {
    const val   = process.env[key];
    const isSet = val && val.length > 0 &&
                  !['your_key_here', 'placeholder', 'xxx'].includes(val.toLowerCase());

    if (isSet) {
      const masked = val.substring(0, 4) + '•'.repeat(Math.min(val.length - 4, 16));
      console.log(`  ✓ ${key.padEnd(42)} ${masked}`);
    } else {
      if (failOnMissing) {
        console.log(`  ✗ ${key.padEnd(42)} MISSING${link ? ` → ${link}` : ''}`);
        hasErrors   = true;
        sectionPass = false;
      } else {
        console.log(`  ○ ${key.padEnd(42)} not set${link ? ` (${link})` : ''}`);
        hasWarnings = true;
      }
    }
  }
  console.log();
  return sectionPass;
}

// Check at least one generation API is set
function checkGenerationAPIs() {
  console.log('── Generation APIs (at least one required) ──────────');
  const available = GENERATION_APIS.filter(({ key }) => {
    const val = process.env[key];
    return val && val.length > 0 && !['your_key_here','placeholder'].includes(val.toLowerCase());
  });

  if (available.length === 0) {
    console.log('  ✗ No generation API keys found!');
    console.log('    Without at least one, asset generation is disabled.');
    console.log('    Free option: aistudio.google.com → get GOOGLE_AI_STUDIO_KEY');
    console.log('    Free fallback: unsplash.com/developers → get UNSPLASH_ACCESS_KEY\n');
    hasErrors = true;
    return false;
  }

  for (const { key, desc, link } of GENERATION_APIS) {
    const val = process.env[key];
    const set = val && val.length > 0;
    if (set) {
      const masked = val.substring(0, 4) + '•'.repeat(Math.min(val.length - 4, 12));
      console.log(`  ✓ ${key.padEnd(42)} ${masked}  ← ${desc}`);
    } else {
      console.log(`  ○ ${key.padEnd(42)} not set`);
    }
  }
  console.log(`\n  Active tier: ${detectTier()}\n`);
  return true;
}

function detectTier() {
  if (process.env.RUNWAY_API_KEY)       return '★★★★★ Runway (premium)';
  if (process.env.GOOGLE_AI_STUDIO_KEY) return '★★★★☆ Google Veo 3 + Imagen 3 (default)';
  if (process.env.OPENAI_API_KEY)       return '★★★☆☆ DALL·E 3 (images only)';
  if (process.env.UNSPLASH_ACCESS_KEY)  return '★★☆☆☆ Unsplash (stock photos only)';
  return '✗ No generation API';
}

// Run all checks
check(REQUIRED,    'Required Variables');
checkGenerationAPIs();

// Conditionally check backend vars based on what's in .env
const hasSupabase  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const hasDatabase  = process.env.DATABASE_URL;
const hasClerk     = process.env.CLERK_SECRET_KEY;
const hasAuthJS    = process.env.AUTH_SECRET;
const hasStripe    = process.env.STRIPE_SECRET_KEY;

if (hasSupabase)  check(SUPABASE_VARS, 'Supabase Variables');
if (hasDatabase)  check(DATABASE_VARS, 'Database Variables');
if (hasClerk || hasAuthJS) check(AUTH_VARS, 'Auth Variables', false);
if (hasStripe)    check(STRIPE_VARS,   'Stripe Variables');

check(OPTIONAL,    'Optional Variables', strict);

// ── Summary ───────────────────────────────────────────────────────
console.log('═'.repeat(55));
if (!hasErrors) {
  console.log('\n  ✅ Environment is ready!\n');
  if (hasWarnings) {
    console.log('  Some optional features are disabled (missing keys above).');
    console.log('  This is fine — they have graceful fallbacks.\n');
  }
  process.exit(0);
} else {
  console.log('\n  ❌ Environment has missing required variables.\n');
  console.log('  1. Copy .env.example to .env.local');
  console.log('  2. Fill in the missing values');
  console.log('  3. Run this script again\n');
  process.exit(1);
}
