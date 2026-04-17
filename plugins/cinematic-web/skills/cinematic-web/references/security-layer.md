# Cinematic Web — Security Layer

## TABLE OF CONTENTS
1. [Content Security Policy](#csp)
2. [API Route Rate Limiting](#ratelimit)
3. [Input Sanitization](#sanitize)
4. [Dependency Audit](#audit)
5. [Environment Security](#env)
6. [Security Checklist](#checklist)

---

## CONTENT SECURITY POLICY {#csp}

CSP for cinematic sites is complex — GSAP, Cloudinary, Spline, Google Fonts, and
inline scripts all need explicit allowlisting. This template handles them all:

```typescript
// lib/security/csp.ts
export function buildCSP(options: {
  useSpline?:     boolean;
  useGoogleFonts?:boolean;
  useGA4?:        boolean;
  useHotjar?:     boolean;
  cloudName?:     string;
  nonce:          string;
}): string {
  const {
    useSpline = false, useGoogleFonts = true,
    useGA4 = false, useHotjar = false,
    cloudName = '', nonce,
  } = options;

  const directives: Record<string, string[]> = {
    'default-src':  ["'self'"],
    'script-src':   [
      "'self'",
      `'nonce-${nonce}'`,  // For inline scripts (theme init, etc.)
      // GSAP (loaded from npm — same origin)
      // Spline
      ...(useSpline ? ['https://prod.spline.design'] : []),
      // Google Analytics
      ...(useGA4 ? [
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
      ] : []),
      // Hotjar
      ...(useHotjar ? ['https://static.hotjar.com', 'https://script.hotjar.com'] : []),
    ],
    'style-src':    [
      "'self'",
      "'unsafe-inline'",  // Required for GSAP inline transforms
      ...(useGoogleFonts ? ['https://fonts.googleapis.com'] : []),
    ],
    'font-src':     [
      "'self'",
      'data:',
      ...(useGoogleFonts ? ['https://fonts.gstatic.com'] : []),
    ],
    'img-src':      [
      "'self'",
      'data:',
      'blob:',
      `https://res.cloudinary.com`,
      'https://images.unsplash.com',
      'https://images.pexels.com',
      ...(useGA4 ? ['https://www.google-analytics.com'] : []),
      ...(useHotjar ? ['https://*.hotjar.com'] : []),
    ],
    'media-src':    [
      "'self'",
      'blob:',
      'https://res.cloudinary.com',
    ],
    'connect-src':  [
      "'self'",
      'https://res.cloudinary.com',
      'https://api.cloudinary.com',
      ...(useSpline ? ['https://prod.spline.design'] : []),
      ...(useGA4 ? [
        'https://www.google-analytics.com',
        'https://region1.google-analytics.com',
      ] : []),
      ...(useHotjar ? ['https://*.hotjar.com', 'https://*.hotjar.io', 'wss://*.hotjar.com'] : []),
    ],
    'worker-src':   ["'self'", 'blob:'],
    'child-src':    ["'self'", 'blob:'],
    'frame-src':    [
      "'self'",
      ...(useSpline ? ['https://prod.spline.design', 'https://my.spline.design'] : []),
    ],
    'object-src':   ["'none'"],
    'base-uri':     ["'self'"],
    'form-action':  ["'self'"],
    'upgrade-insecure-requests': [],
  };

  return Object.entries(directives)
    .map(([key, values]) =>
      values.length > 0 ? `${key} ${values.join(' ')}` : key
    )
    .join('; ');
}
```

### Apply CSP — Next.js Middleware
```typescript
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { buildCSP } from '@/lib/security/csp';
import crypto from 'crypto';

export function middleware(request: NextRequest) {
  const nonce = crypto.randomBytes(16).toString('base64');
  const csp   = buildCSP({
    nonce,
    useSpline:      process.env.USE_SPLINE === 'true',
    useGoogleFonts: true,
    useGA4:         !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    useHotjar:      !!process.env.NEXT_PUBLIC_HOTJAR_ID,
    cloudName:      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });

  const response = NextResponse.next({
    request: { headers: new Headers({ ...Object.fromEntries(request.headers), 'x-nonce': nonce }) },
  });

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options',           'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options',    'nosniff');
  response.headers.set('Referrer-Policy',           'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy',        'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-XSS-Protection',          '1; mode=block');

  return response;
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon).*)'] };
```

---

## API ROUTE RATE LIMITING {#ratelimit}

```typescript
// lib/security/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different limits per endpoint type
export const limits = {
  // Contact / waitlist forms: 3 per 10 min
  form: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '10 m'),
                        prefix: 'rl_form' }),
  // General API: 60 per min
  api:  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, '1 m'),
                        prefix: 'rl_api' }),
  // Auth endpoints: 10 per 15 min
  auth: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '15 m'),
                        prefix: 'rl_auth' }),
};

// Middleware wrapper
export async function withRateLimit(
  request: Request,
  limiter: Ratelimit,
  handler: () => Promise<Response>
): Promise<Response> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          ?? request.headers.get('x-real-ip')
          ?? 'unknown';

  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    return Response.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit':     String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset':     String(reset),
          'Retry-After':           String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  const response = await handler();
  response.headers.set('X-RateLimit-Limit',     String(limit));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  return response;
}
```

---

## INPUT SANITIZATION {#sanitize}

```bash
npm install dompurify isomorphic-dompurify
```

```typescript
// lib/security/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

// Sanitize rich text from CMS before rendering
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p','br','strong','em','u','s','h2','h3','h4',
                   'ul','ol','li','a','blockquote','code','pre'],
    ALLOWED_ATTR: ['href','target','rel','class'],
    FORBID_ATTR:  ['style','onerror','onload'],
    FORBID_TAGS:  ['script','iframe','object','embed','form'],
    ADD_ATTR:     ['target'],
    FORCE_BODY:   true,
  });
}

// Force external links to open safely
export function sanitizeExternalLinks(html: string): string {
  return html.replace(
    /<a\s+href="(https?:\/\/[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  );
}

// Sanitize plain text inputs (strip any HTML)
export function sanitizePlainText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
```

---

## DEPENDENCY AUDIT {#audit}

```bash
# Add to package.json scripts:
"audit":        "npm audit --audit-level=moderate",
"audit:fix":    "npm audit fix",
"outdated":     "npm outdated",

# Add to CI pipeline (runs on every push):
# - run: npm audit --audit-level=moderate
```

```yaml
# .github/workflows/security.yml
name: Security Audit
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9am
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm audit --audit-level=moderate
      - name: Check for known vulnerabilities
        uses: snyk/actions/node@master
        env: { SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }} }
        with: { args: --severity-threshold=medium }
```

---

## ENVIRONMENT SECURITY {#env}

```bash
# scripts/audit-env.sh — Run before deploy
#!/bin/bash
echo "Checking for exposed secrets..."

# Check no .env files are committed
if git ls-files | grep -E '\.env$|\.env\.local$|\.env\.production$'; then
  echo "❌ ERROR: .env files are tracked in git!"
  exit 1
fi

# Check no API keys in git history
PATTERNS=("api_key" "api_secret" "secret_key" "access_token" "PRIVATE_KEY")
for pattern in "${PATTERNS[@]}"; do
  if git log -p | grep -i "$pattern=" | grep -v "example\|placeholder\|your_"; then
    echo "⚠ WARNING: Possible secret in git history matching: $pattern"
  fi
done

# Check all required public vars are set (not secret)
REQUIRED_PUBLIC=("NEXT_PUBLIC_SITE_URL" "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME")
for var in "${REQUIRED_PUBLIC[@]}"; do
  if [ -z "${!var}" ]; then
    echo "⚠ WARNING: $var is not set"
  fi
done

echo "✓ Environment security check complete"
```

---

## SECURITY CHECKLIST {#checklist}

```
HEADERS
[ ] Content-Security-Policy set (no unsafe-eval — GSAP works without it)
[ ] X-Frame-Options: SAMEORIGIN
[ ] X-Content-Type-Options: nosniff
[ ] Referrer-Policy: strict-origin-when-cross-origin
[ ] Permissions-Policy: camera=(), microphone=(), geolocation=()
[ ] HTTPS enforced (no mixed content)
[ ] HSTS header (if custom domain — add via hosting platform)

API SECURITY
[ ] Rate limiting on all form endpoints (3 per 10 min)
[ ] Rate limiting on all public API routes (60 per min)
[ ] Auth endpoints rate limited separately (10 per 15 min)
[ ] No sensitive data in API error responses (no stack traces)
[ ] API keys in server-side only (never NEXT_PUBLIC_ for secrets)

INPUT HANDLING
[ ] All user text inputs sanitized with DOMPurify before storage/render
[ ] CMS rich text sanitized before rendering (even from trusted CMS)
[ ] External links: rel="noopener noreferrer" + target="_blank"
[ ] File uploads (if any): type validation + size limits + virus scan

DEPENDENCIES
[ ] npm audit: 0 critical, 0 high vulnerabilities
[ ] Package versions pinned (no ^ or ~ — exact versions)
[ ] Dependency audit runs in CI on every push
[ ] Weekly Snyk or Dependabot alerts configured

ENVIRONMENT
[ ] .env files in .gitignore (verified: git ls-files | grep .env)
[ ] No secrets in git history (verified: git log -p | grep -i secret)
[ ] Cloudinary API secret: server-side only (not NEXT_PUBLIC_)
[ ] Supabase service role key: server-side only
[ ] Resend API key: server-side only
[ ] All public env vars: truly non-sensitive (safe to expose)

FORMS
[ ] CSRF protection (Next.js Server Actions have built-in CSRF)
[ ] Honeypot field in every form
[ ] Rate limiting per IP
[ ] Email content sanitized (no HTML injection via user input)

CMS
[ ] CMS API tokens scoped to minimum permissions needed
[ ] Preview tokens separate from production tokens
[ ] Webhook endpoints validate signatures before processing
[ ] Admin panel behind authentication (no public CMS access)
```
