# Cinematic Web — Deployment Layer

## TABLE OF CONTENTS
1. [Phase 7 — Deployment Flow](#flow)
2. [Environment Architecture](#environments)
3. [Vercel Deployment](#vercel)
4. [Netlify Deployment](#netlify)
5. [Cloudflare Pages](#cloudflare)
6. [Railway / Fly.io (with backend)](#backend-hosting)
7. [CI/CD Pipeline — GitHub Actions](#ci)
8. [Environment Variable Management](#env)
9. [Performance Monitoring](#monitoring)
10. [Deployment Checklist](#checklist)

---

## PHASE 7 — DEPLOYMENT FLOW {#flow}

Run after Quality Gate (Phase 6). Ask user:

1. "Which hosting platform?" → Vercel / Netlify / Cloudflare Pages / Railway / Fly.io / Other
2. "Do you have a custom domain? (yes/no — provide domain if yes)"
3. "Do you need a staging environment? (yes = separate preview URL before production)"
4. "GitHub / GitLab / Bitbucket? (for CI/CD and automatic deploys)"
5. "Do you need automatic deploy notifications? (Slack channel webhook? Email?)"

Then output:
- Platform-specific config files
- GitHub Actions workflow (if GitHub selected)
- Environment variable checklist for the hosting platform
- DNS configuration guide (if custom domain)
- First-deploy step-by-step guide

---

## ENVIRONMENT ARCHITECTURE {#environments}

Every project uses 3 environments minimum:

```
LOCAL              STAGING (Preview)           PRODUCTION
─────────────────────────────────────────────────────────
.env.local         .env.staging                .env.production
localhost:3000     preview.yourdomain.com      yourdomain.com
Any branch         main / staging branch       main branch (protected)
Real API keys?     Real keys (test data)       Real keys (live data)
Cloudinary test?   Cloudinary dev folder       Cloudinary prod folder
Analytics off      Analytics off               Analytics ON
Debug logging on   Debug logging off           Debug logging off
CMS preview mode   CMS preview allowed         CMS publish only
```

### .env Structure per Environment
```bash
# .env.example (committed to git — no real values)

# ── ENVIRONMENT ──────────────────────────────────────────────────
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production   # 'local' | 'staging' | 'production'

# ── SITE ─────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# ── CLOUDINARY ───────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# ── GENERATION APIs ──────────────────────────────────────────────
GOOGLE_AI_STUDIO_KEY=
OPENAI_API_KEY=
RUNWAY_API_KEY=
REPLICATE_API_TOKEN=
STABILITY_API_KEY=
UNSPLASH_ACCESS_KEY=
PEXELS_API_KEY=

# ── CMS ──────────────────────────────────────────────────────────
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=
SANITY_PREVIEW_SECRET=

# Contentful
CONTENTFUL_SPACE_ID=
CONTENTFUL_ACCESS_TOKEN=
CONTENTFUL_PREVIEW_TOKEN=
CONTENTFUL_MANAGEMENT_TOKEN=

# Strapi
NEXT_PUBLIC_STRAPI_URL=https://cms.yourdomain.com
STRAPI_API_TOKEN=

# Payload / Custom
PAYLOAD_URL=
MONGODB_URI=
PAYLOAD_SECRET=

# ── DATABASE (if applicable) ─────────────────────────────────────
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# ── ANALYTICS ────────────────────────────────────────────────────
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_HOTJAR_ID=

# ── DEPLOYMENT / WEBHOOKS ────────────────────────────────────────
DEPLOY_HOOK_URL=
DEPLOY_HOOK_SECRET=
REVALIDATE_SECRET=
SLACK_WEBHOOK_URL=
CUSTOM_WEBHOOK_URL=
CUSTOM_WEBHOOK_SECRET=

# ── EMAIL (contact forms) ─────────────────────────────────────────
RESEND_API_KEY=
FROM_EMAIL=noreply@yourdomain.com
```

---

## VERCEL DEPLOYMENT {#vercel}

Recommended for: Next.js (native), Nuxt, SvelteKit, Astro

### vercel.json
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options",           "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options",    "value": "nosniff" },
        { "key": "X-XSS-Protection",          "value": "1; mode=block" },
        { "key": "Referrer-Policy",           "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy",        "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/sitemap.xml", "destination": "/api/sitemap" }
  ],
  "redirects": [
    { "source": "/home", "destination": "/", "permanent": true }
  ]
}
```

### Vercel Setup Steps
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login and link project
vercel login
vercel link

# 3. Pull env vars from Vercel to local
vercel env pull .env.local

# 4. Add all env vars to Vercel dashboard
vercel env add CLOUDINARY_CLOUD_NAME production
vercel env add CLOUDINARY_API_KEY production
# ... repeat for all vars

# 5. Deploy to production
vercel --prod

# 6. Set up custom domain
vercel domains add yourdomain.com
# Then update DNS: add CNAME record pointing to cname.vercel-dns.com
```

### Vercel Preview Deploys (automatic staging)
Every PR automatically gets a preview URL. Configure in vercel.json:
```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "staging": true
    }
  }
}
```

---

## NETLIFY DEPLOYMENT {#netlify}

Recommended for: Astro, SvelteKit, plain HTML, any static site

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"          # or "dist" for Astro/SvelteKit
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/home"
  to = "/"
  status = 301

[[plugins]]
  package = "@netlify/plugin-nextjs"   # if Next.js

[context.staging]
  command = "npm run build:staging"
  [context.staging.environment]
    NEXT_PUBLIC_ENVIRONMENT = "staging"
```

### Netlify Setup Steps
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:import .env.production   # Import all env vars
netlify deploy --prod                # First production deploy
```

---

## CLOUDFLARE PAGES {#cloudflare}

Recommended for: plain HTML, Astro, SvelteKit, any static site needing global edge

### wrangler.toml (for Cloudflare Workers + Pages Functions)
```toml
name = "[PROJECT_SLUG]"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

[vars]
NEXT_PUBLIC_ENVIRONMENT = "production"
```

### _headers (public/_headers)
```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Cache-Control: public, max-age=0, must-revalidate

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=86400
```

### _redirects (public/_redirects)
```
/home  /  301
/old-page  /new-page  301
```

---

## RAILWAY / FLY.IO — BACKEND HOSTING {#backend-hosting}

Use when: project has a custom backend (Express, FastAPI, Strapi self-hosted, Payload CMS)

### Railway (easiest — Git-based deploy)

**railway.toml:**
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[environments.production]
PORT = "3000"
NODE_ENV = "production"
```

**railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30
  }
}
```

### Health Check Endpoint (always include)
```typescript
// app/api/health/route.ts (Next.js) — or Express route
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
  });
}
```

### Fly.io (for Docker-based backends)
```toml
# fly.toml
app = "[project-slug]-api"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

---

## CI/CD PIPELINE — GITHUB ACTIONS {#ci}

### .github/workflows/deploy.yml
```yaml
name: Deploy

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  # ── QUALITY CHECKS ────────────────────────────────────────────
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test --if-present

  # ── ACCESSIBILITY AUDIT ───────────────────────────────────────
  accessibility:
    name: Accessibility Audit
    runs-on: ubuntu-latest
    needs: quality
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci && npm run build
      - run: npx pa11y-ci --sitemap http://localhost:3000/sitemap.xml
        env:
          NEXT_PUBLIC_SITE_URL: http://localhost:3000

  # ── DEPLOY TO VERCEL ──────────────────────────────────────────
  deploy-vercel:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    needs: quality
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID:     ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      - name: Notify Slack on success
        if: success()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
          -H 'Content-Type: application/json' \
          -d '{"text":"✅ [PROJECT_NAME] deployed to production successfully!"}'
      - name: Notify Slack on failure
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
          -H 'Content-Type: application/json' \
          -d '{"text":"🔴 [PROJECT_NAME] production deploy FAILED. Check GitHub Actions."}'

  # ── LIGHTHOUSE CI ─────────────────────────────────────────────
  lighthouse:
    name: Lighthouse Performance Check
    runs-on: ubuntu-latest
    needs: deploy-vercel
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            https://yourdomain.com
            https://yourdomain.com/about
          budgetPath: ./.lighthouse-budget.json
          uploadArtifacts: true
```

### .lighthouse-budget.json
```json
[
  {
    "path": "/*",
    "resourceSizes": [
      { "resourceType": "script",    "budget": 300 },
      { "resourceType": "image",     "budget": 2000 },
      { "resourceType": "stylesheet","budget": 100 },
      { "resourceType": "video",     "budget": 5000 }
    ],
    "timings": [
      { "metric": "interactive",            "budget": 3500 },
      { "metric": "first-contentful-paint", "budget": 1800 },
      { "metric": "largest-contentful-paint","budget": 2500 }
    ],
    "scores": [
      { "category": "performance",   "minScore": 80 },
      { "category": "accessibility", "minScore": 90 },
      { "category": "best-practices","minScore": 90 },
      { "category": "seo",           "minScore": 90 }
    ]
  }
]
```

---

## ENVIRONMENT VARIABLE MANAGEMENT {#env}

### Secrets Required in GitHub Actions
Add these in GitHub → Settings → Secrets → Actions:
```
VERCEL_TOKEN          ← From Vercel account settings
VERCEL_ORG_ID         ← From vercel.json after `vercel link`
VERCEL_PROJECT_ID     ← From vercel.json after `vercel link`
SLACK_WEBHOOK_URL     ← From Slack app configuration
CLOUDINARY_API_SECRET ← Never expose this publicly
SANITY_API_TOKEN      ← Write token (keep secret)
SUPABASE_SERVICE_ROLE_KEY ← Super admin key (keep secret)
```

### .env Validation (run on startup — prevents silent failures)
```typescript
// lib/env.ts — Validate required env vars on boot
const required = [
  'NEXT_PUBLIC_SITE_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
] as const;

const optional = [
  'GOOGLE_AI_STUDIO_KEY',
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'NEXT_PUBLIC_HOTJAR_ID',
] as const;

export function validateEnv() {
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\nSee .env.example for reference.`
    );
  }
  const missingOptional = optional.filter(key => !process.env[key]);
  if (missingOptional.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn(`Optional env vars not set (some features disabled):\n${missingOptional.map(k => `  - ${k}`).join('\n')}`);
  }
}
```

---

## PERFORMANCE MONITORING {#monitoring}

### Vercel Analytics (free, zero config)
```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Uptime Monitoring (free options)
```
Better Uptime:  betteruptime.com — free tier, 3min checks, Slack alerts
UptimeRobot:    uptimerobot.com — free tier, 5min checks, email alerts
Checkly:        checklyhq.com — free tier, monitors + Lighthouse CI

Add to README: "Set up uptime monitoring at [chosen tool] for yourdomain.com"
```

---

## DEPLOYMENT CHECKLIST {#checklist}

```
PRE-DEPLOY
[ ] All env vars in hosting platform dashboard (not just .env.local)
[ ] .env.example is up to date with all required keys
[ ] Production domain configured in hosting platform
[ ] Cloudinary production folder assets uploaded
[ ] Custom domain DNS pointed to hosting platform
[ ] SSL certificate active (automatic on Vercel/Netlify/Cloudflare)
[ ] robots.txt and sitemap.xml accessible at /robots.txt and /sitemap.xml

FIRST DEPLOY
[ ] Visit every page and confirm renders correctly
[ ] Hero video loads and loops (check in Safari + Chrome)
[ ] All animations trigger correctly
[ ] Forms submit successfully (test with real email)
[ ] GA4 Realtime shows traffic after first page view
[ ] Cloudinary images loading with correct transformations
[ ] 3D elements render (test on mobile — check fallback)

POST-DEPLOY
[ ] Run Lighthouse: performance ≥ 80, accessibility ≥ 90, SEO ≥ 90
[ ] Run axe-core: 0 critical or serious accessibility violations
[ ] Submit sitemap.xml to Google Search Console
[ ] Set up uptime monitoring
[ ] Verify Slack/email deploy notifications working
[ ] Test preview deploys: push a branch → confirm preview URL generates
[ ] Check Web Vitals in Vercel/Netlify dashboard after 24 hours

SECURITY
[ ] Security headers present (X-Frame-Options, CSP, etc.)
[ ] API routes protected (no unauthenticated sensitive data)
[ ] Cloudinary API secret NOT in any client-side code or public env var
[ ] .env files in .gitignore — confirm with: git ls-files .env
[ ] No API keys in git history: git log -p | grep -i "api_key\|secret\|password"
```
