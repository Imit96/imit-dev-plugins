# Cinematic Web — Post-Launch Layer

## Phase 9: What Happens After Deploy

Most developers ship and move on. The sites that improve and generate compounding
returns are the ones with a structured post-launch practice. Phase 9 exists to make
sure what was built actually performs, and keeps improving.

---

## TABLE OF CONTENTS
1. [First 48 Hours — Launch Monitoring](#48hours)
2. [Weekly Health Checks](#weekly)
3. [Reading Sentry Errors Intelligently](#sentry)
4. [Performance Monitoring](#performance)
5. [Package Upgrade Strategy](#upgrades)
6. [User Feedback Integration](#feedback)
7. [Content Updates Without Code Changes](#content)
8. [When to Trigger a Redesign](#redesign)
9. [Post-Launch Checklist](#checklist)

---

## FIRST 48 HOURS — LAUNCH MONITORING {#48hours}

The 48 hours after launch are when the real data arrives. Things that worked
in development often fail in production at real traffic.

### What to monitor immediately

```bash
# 1. Watch Sentry for new errors in real-time
# dashboard.sentry.io → Your project → Issues → Sort by "First seen"
# Any error appearing > 5 times in first 6 hours needs investigation

# 2. Check Vercel build and function logs
vercel logs --follow   # streams live production logs

# 3. Confirm analytics is firing
# Google Analytics → Realtime → Overview
# Should see at least 1 active user within first hour of sharing

# 4. Test critical paths on production (not localhost)
# - Contact form submits and email arrives
# - Sign-up flow completes (if auth)
# - Checkout completes with test card (if Stripe)
# - Video loads and loops seamlessly
# - All navigation links resolve (no 404s)
```

### Quick smoke test script

```bash
#!/bin/bash
# scripts/smoke-test.sh — run after every deploy
SITE=${1:-https://yourdomain.com}

echo "Testing: $SITE"

# Check homepage returns 200
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE")
echo "Homepage: $STATUS"

# Check critical pages
for PAGE in /about /contact /blog /pricing; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE$PAGE")
  echo "$PAGE: $STATUS"
done

# Check API health
HEALTH=$(curl -s "$SITE/api/health" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','unknown'))")
echo "API health: $HEALTH"

# Check sitemap
SITEMAP=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/sitemap.xml")
echo "Sitemap: $SITEMAP"

echo "Done."
```

---

## WEEKLY HEALTH CHECKS {#weekly}

Run these every Monday morning — takes 10 minutes, catches problems before clients notice.

```
PERFORMANCE
[ ] Lighthouse score on homepage (target: Performance > 80)
[ ] Core Web Vitals in Search Console (LCP, CLS, INP — all should be green)
[ ] Vercel Analytics — p75 LCP this week vs last week
[ ] Check if any new images added without next/image optimization

ERRORS
[ ] Sentry: new errors this week vs last week (trend should be flat or down)
[ ] Any new errors > 10 occurrences? → investigate immediately
[ ] Check error rate % (errors/total requests) — flag if > 0.1%
[ ] Review any 500 errors in Vercel function logs

SEO
[ ] Google Search Console: coverage errors? (404, soft 404, server error)
[ ] New pages indexed? (check Coverage → Valid)
[ ] Any manual actions or security issues flagged?

UPTIME
[ ] Check uptime monitor (Better Uptime / UptimeRobot) — any downtime incidents?
[ ] Check response times — p95 should be < 800ms

SECURITY
[ ] npm audit (check for new vulnerabilities in dependencies)
[ ] Review Supabase → Auth → Users (any suspicious signups if open registration)
[ ] Check Stripe → Fraud Insights (any suspicious payments)
```

---

## READING SENTRY ERRORS INTELLIGENTLY {#sentry}

Most Sentry errors fall into 4 categories. Here's how to read and prioritise them:

### Category 1 — GSAP / Animation errors

```
Common errors:
  "Cannot read properties of null (reading 'addEventListener')"
  → Element unmounted before animation started
  Fix: Add null check at start of useEffect

  "ScrollTrigger: Cannot add event listener on null"
  → ScrollTrigger.create() called before DOM exists
  Fix: Ensure ScrollTrigger.refresh() is called after fonts load

  "gsap.context is not a function"
  → GSAP imported before registerPlugin
  Fix: Move registerPlugin() to the top of the file, before any gsap.* calls
```

### Category 2 — Supabase / Auth errors

```
Common errors:
  "JWT expired"
  → Session not refreshing (middleware not running correctly)
  Fix: Verify middleware.ts is at project root, not inside app/

  "Row-level security policy violation"
  → User trying to access data they don't own, or missing RLS policy
  Fix: Check which table / which policy is failing in Supabase logs

  "Failed to fetch" from Supabase
  → Usually a network issue or rate limit
  Fix: Add retry logic; check Supabase dashboard for outages
```

### Category 3 — Next.js hydration / rendering

```
Common errors:
  "Hydration failed because server rendered HTML didn't match client"
  → Fix: grep for typeof window, Math.random, Date.now — suppress or move to useEffect

  "Error: NEXT_NOT_FOUND"
  → notFound() was called outside a Server Component
  Fix: Call notFound() only inside async Server Components

  "Dynamic server usage: headers"
  → headers() called in static route
  Fix: Add force-dynamic: 'force-dynamic' or use generateStaticParams
```

### Category 4 — Stripe / Payment errors

```
Common errors:
  "Webhook signature verification failed"
  → Usually STRIPE_WEBHOOK_SECRET is wrong or body was parsed before verification
  Fix: Ensure route.ts reads raw body (export const runtime = 'nodejs')

  "No such customer"
  → Stripe customer deleted but still in database
  Fix: Handle in webhook: on customer.deleted → clear stripe_customer_id in DB

  "This object cannot be accessed right now"
  → Test mode key used against live mode object (or vice versa)
  Fix: Ensure test/live key pairs match in .env
```

---

## PERFORMANCE MONITORING {#performance}

### Vercel Analytics — what to watch

```typescript
// Already included if using @vercel/analytics
// Dashboard: vercel.com → Your Project → Analytics

// Key metrics to track weekly:
// p75 LCP (Largest Contentful Paint) → target < 2.5s
// p75 FID / INP (Interaction) → target < 200ms
// p75 CLS (Cumulative Layout Shift) → target < 0.1

// If LCP is high — check:
// 1. Is the hero image/video preloaded?
// 2. Is next/image priority={true} set on hero image?
// 3. Is Cloudinary delivering images with f_auto,q_auto?
// 4. Is the hero video poster loading before the video?
```

### When performance degrades — diagnostic commands

```bash
# Run Lighthouse from CLI (more accurate than DevTools)
npm install -g @lhci/cli
lhci collect --url=https://yourdomain.com
lhci assert

# Check bundle size
npm run build
# Look at Route (Size) — any page > 500KB needs investigation

# Check what's in the bundle
npm install -D @next/bundle-analyzer
# Add to next.config.ts:
# const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true })
# module.exports = withBundleAnalyzer(nextConfig)
ANALYZE=true npm run build
```

---

## PACKAGE UPGRADE STRATEGY {#upgrades}

### Quarterly upgrade process (takes ~2 hours)

```bash
# 1. Check what's outdated
npm outdated

# 2. Check for security vulnerabilities
npm audit

# 3. Update patch and minor versions (safe — no breaking changes)
npx npm-check-updates -u --target patch
npm install
npm run build  # must pass before proceeding

# 4. Update minor versions
npx npm-check-updates -u --target minor
npm install
npm run build
npm run test   # run E2E tests if configured

# 5. Major versions — update one at a time, read changelog first
# Example: Next.js major update
npm install next@latest
# Read: nextjs.org/docs/upgrading
# Run codemods: npx @next/codemod@latest upgrade
npm run build

# 6. Commit and deploy to staging first
git add package.json package-lock.json
git commit -m "chore: quarterly dependency updates"
git push origin staging
# test on staging → then merge to main
```

### Packages that need special care on upgrade

```
NEXT.JS major    → Check: app router changes, server action changes,
                   run codemod: npx @next/codemod@latest upgrade
                   Breaking changes doc: nextjs.org/docs/upgrading

GSAP major       → Check: ScrollTrigger API changes, plugin compatibility
                   Test all scroll animations manually after upgrade

REACT major      → Check: deprecated APIs (forwardRef removal, etc.)
                   Test hydration, Suspense, concurrent features

FRAMER MOTION major → Check: motion() API changes, animation prop changes

SUPABASE-JS major → Check: auth helper API changes, RLS policy format
                    Test: sign-in, sign-up, protected routes

AUTH.JS major    → Critical — session format and callback API changes
                    Test: full auth flow after upgrade

STRIPE major     → Check: API version, webhook event format changes
                    Test: checkout, webhook handler, billing portal

DRIZZLE major   → Check: query API changes, migration format
                   Always run migrations on staging before production
```

### Security patches — never delay

```bash
# Any package with high/critical severity → patch within 24 hours
npm audit --audit-level=high

# Force-patch without updating major version
npm audit fix

# If npm audit fix breaks things — use overrides in package.json:
# "overrides": { "vulnerable-package": "^2.0.0" }
```

---

## USER FEEDBACK INTEGRATION {#feedback}

### Setting up feedback collection

```typescript
// Simple feedback widget — no external service needed
// app/components/FeedbackWidget.tsx
'use client'
import { useState } from 'react'

type Rating = 1 | 2 | 3 | 4 | 5

export function FeedbackWidget() {
  const [rating, setRating]     = useState<Rating | null>(null)
  const [comment, setComment]   = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function submit() {
    if (!rating) return
    await fetch('/api/feedback', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        rating,
        comment,
        page:      window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    })
    setSubmitted(true)
  }

  if (submitted) return (
    <div style={{ position: 'fixed', bottom: '1rem', right: '1rem',
                  background: 'var(--color-surface)', padding: '1rem',
                  borderRadius: '8px', fontSize: '0.875rem' }}>
      Thanks for the feedback ✓
    </div>
  )

  return (
    <div style={{ position: 'fixed', bottom: '1rem', right: '1rem',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  padding: '1rem', borderRadius: '12px', width: '240px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
        How's your experience?
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {([1,2,3,4,5] as Rating[]).map(n => (
          <button key={n} onClick={() => setRating(n)} style={{
            width: '36px', height: '36px', borderRadius: '50%',
            border: `2px solid ${rating === n ? 'var(--color-accent)' : 'var(--color-border)'}`,
            background: rating === n ? 'var(--color-accent)' : 'transparent',
            color: rating === n ? 'var(--color-bg)' : 'var(--color-text)',
            cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
          }}>{n}</button>
        ))}
      </div>
      {rating && rating <= 3 && (
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="What could be better?"
          style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem',
                   borderRadius: '6px', border: '1px solid var(--color-border)',
                   background: 'transparent', color: 'var(--color-text)',
                   resize: 'none', minHeight: '60px', boxSizing: 'border-box' }}
        />
      )}
      <button onClick={submit} disabled={!rating} style={{
        marginTop: '0.5rem', width: '100%', padding: '0.625rem',
        background: 'var(--color-accent)', color: 'var(--color-bg)',
        border: 'none', borderRadius: '6px', cursor: 'pointer',
        fontSize: '0.875rem', fontWeight: 600,
        opacity: rating ? 1 : 0.5,
      }}>
        Submit
      </button>
    </div>
  )
}
```

### Reading feedback systematically

```
WEEK 1–4 after launch: collect, don't act
  Gather at least 20 responses before making changes
  Resist the urge to fix every piece of feedback immediately
  Note patterns — if 5 people say the same thing, it's signal

WEEK 4+: categorise and prioritise
  Category A: Bugs / broken functionality → fix immediately
  Category B: Confusion / unclear UX → plan for next iteration
  Category C: Feature requests → log, evaluate monthly
  Category D: Design preferences → evaluate carefully (1 person ≠ most users)
```

---

## CONTENT UPDATES WITHOUT CODE CHANGES {#content}

If CMS was configured — content editors should never need a developer.

### Triggering revalidation after CMS publish

```typescript
// Sanity webhook → triggers ISR revalidation
// app/api/revalidate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidation-secret')
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const slug = body._id ?? body.slug

    // Revalidate specific paths
    if (body._type === 'post') {
      revalidatePath(`/blog/${slug}`)
      revalidatePath('/blog')
    }
    if (body._type === 'page') {
      revalidatePath(`/${slug}`)
    }
    if (body._type === 'globalSettings') {
      revalidatePath('/', 'layout')   // entire site layout
    }

    // Or revalidate by tag (more targeted)
    revalidateTag('cms-content')

    return NextResponse.json({ revalidated: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
```

---

## WHEN TO TRIGGER A REDESIGN {#redesign}

Signs that a cinematic site needs more than content updates:

```
PERFORMANCE signals:
  LCP > 3s despite optimization attempts → architecture problem
  Lighthouse score < 60 after 3 months of care → tech debt
  Bundle size > 2MB despite tree-shaking → import audit needed

BUSINESS signals:
  Conversion rate < 1% for 3+ months → content/CTA problem
  Bounce rate > 80% → hook/first impression problem
  Average session < 30s → content depth problem

TECHNICAL signals:
  > 50 Sentry errors per day after 6 months → accumulated debt
  Next.js 2+ major versions behind → migration is cheaper than patches
  Team spends > 20% of time on maintenance → refactor time

BRAND signals:
  Brand identity has evolved significantly
  A major competitor launches a significantly better site
  The site no longer matches the company's market positioning
```

---

## POST-LAUNCH CHECKLIST {#checklist}

```
DAY 1 (deploy day)
[ ] Smoke test: all pages return 200, API /health returns ok
[ ] Contact form: submit real test email → confirm receipt
[ ] Analytics: at least one pageview showing in GA4 realtime
[ ] Stripe: test checkout with 4242 4242 4242 4242
[ ] Sentry: trigger a test error → confirm it appears in dashboard
[ ] Verify sitemap.xml is accessible: https://yourdomain.com/sitemap.xml
[ ] Verify robots.txt is accessible: https://yourdomain.com/robots.txt

SEO SUBMISSION — follow the 10-step protocol in seo-layer.md:
[ ] Step 1: Google Search Console → verify site + submit sitemap
[ ] Step 2: Bing Webmaster Tools → verify site + submit sitemap
[ ] Step 3: IndexNow key file accessible → test with indexnow.org/validator
[ ] Step 4: Request indexing for top 10 URLs in Search Console → URL Inspection
[ ] Step 5: Validate OG tags → developers.facebook.com/tools/debug
[ ] Step 6: Validate structured data → search.google.com/test/rich-results
[ ] Step 7: Link GA4 to Search Console → Admin → Search Console links
[ ] Step 8: Run PageSpeed Insights → record baseline scores

[ ] Set up uptime monitor (Better Uptime or UptimeRobot)

WEEK 1
[ ] Review all Sentry errors → fix any > 10 occurrences
[ ] Check Google Search Console for coverage errors
[ ] Run Lighthouse on mobile → target > 70 performance
[ ] Check Core Web Vitals (LCP, CLS, INP) in Search Console
[ ] Confirm video loads and loops correctly on real mobile device
[ ] Test on iOS Safari specifically (not just Chrome)

MONTH 1
[ ] Review analytics: top pages, exit pages, conversion path
[ ] Run npm audit → patch any high/critical vulnerabilities
[ ] Review feedback if widget installed
[ ] Check if any new Sentry error patterns emerged
[ ] Confirm all scheduled jobs / cron tasks are running

QUARTERLY
[ ] Run npm-check-updates → update patch + minor versions
[ ] Review and rotate API keys (generate new, update, delete old)
[ ] Check if Cloudinary storage/bandwidth approaching free tier limits
[ ] Check if Supabase approaching row limits or bandwidth
[ ] Lighthouse audit → compare to baseline
[ ] Review Google Analytics goals → is conversion improving?
[ ] Check for Next.js major version updates → plan migration if needed
```
