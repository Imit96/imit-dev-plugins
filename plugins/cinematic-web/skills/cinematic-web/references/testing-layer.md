# Cinematic Web — Testing Layer

## TABLE OF CONTENTS
1. [Playwright E2E Setup](#playwright)
2. [Critical Path Tests](#tests)
3. [Visual Regression — Chromatic](#chromatic)
4. [Axe-Core in CI](#axe)
5. [Cross-Browser Matrix](#browsers)
6. [Animation Smoke Tests](#animation)

---

## PLAYWRIGHT E2E SETUP {#playwright}

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium firefox webkit
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:  './tests/e2e',
  timeout:  30_000,
  retries:  process.env.CI ? 2 : 0,
  reporter: [['html'], ['github']],
  use: {
    baseURL:        process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    screenshot:     'only-on-failure',
    video:          'retain-on-failure',
    trace:          'retain-on-failure',
    actionTimeout:  10_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run build && npm start',
    url:     'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

---

## CRITICAL PATH TESTS {#tests}

```typescript
// tests/e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {

  test('loads and hero is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/[BRAND_NAME]/);
    await expect(page.getByRole('banner')).toBeVisible();
    // Hero headline visible
    const hero = page.locator('.hero-headline, h1').first();
    await expect(hero).toBeVisible();
    await expect(hero).not.toBeEmpty();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav).toBeVisible();
    // All nav links reachable
    const links = nav.getByRole('link');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('CTA button is clickable', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /[CTA_TEXT]/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toBeEnabled();
  });

  test('hero video loads or fallback shows', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Either video loaded OR fallback image is visible
    const video = page.locator('video.hero-video');
    const fallback = page.locator('.hero-bg--fallback, img.hero-bg');
    const videoExists = await video.count() > 0;
    if (videoExists) {
      // Video should not have error
      const videoError = await video.evaluate((v: HTMLVideoElement) => v.error);
      expect(videoError).toBeNull();
    } else {
      await expect(fallback.first()).toBeVisible();
    }
  });

  test('cookie banner appears on first visit', async ({ page, context }) => {
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.waitForTimeout(1000); // Banner has 800ms delay
    const banner = page.getByRole('dialog', { name: /cookie/i });
    await expect(banner).toBeVisible();
  });

  test('contact form submits correctly', async ({ page }) => {
    await page.goto('/contact');
    await page.fill('input[name="name"]',    'Test User');
    await page.fill('input[name="email"]',   'test@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message with enough content.');
    await page.click('button[type="submit"]');
    // Success state
    const success = page.getByRole('status').or(page.locator('.form-success'));
    await expect(success).toBeVisible({ timeout: 10_000 });
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    // First Tab should focus skip link
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveAttribute('href', '#main-content');
  });

  test('is mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    // No horizontal scroll
    const bodyWidth   = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1);
  });

});

test.describe('Performance', () => {
  test('page loads within budget', async ({ page }) => {
    const metrics: Record<string, number> = {};
    page.on('metrics', (m) => Object.assign(metrics, m));
    await page.goto('/');
    // LCP proxy: main image loaded
    const lcp = await page.evaluate(() =>
      new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1].startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => resolve(9999), 5000);
      })
    );
    expect(lcp).toBeLessThan(3000); // 3 second budget
  });
});
```

---

## VISUAL REGRESSION — CHROMATIC {#chromatic}

```bash
npm install -D chromatic @storybook/react
```

```yaml
# .github/workflows/chromatic.yml
name: Visual Regression
on: [push]
jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - name: Run Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitZeroOnChanges: true  # Don't fail on visual changes — just flag
          onlyChanged: true        # Only test changed components
```

**Free tier:** Chromatic 5,000 snapshots/month. Enough for most component libraries.

---

## AXE-CORE IN CI {#axe}

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES_TO_TEST = ['/', '/about', '/contact', '/pricing'];

for (const path of PAGES_TO_TEST) {
  test(`${path} has no critical accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('.cookie-banner') // Banner tested separately
      .analyze();

    // Fail on critical and serious — warn on moderate
    const critical = results.violations.filter(v =>
      v.impact === 'critical' || v.impact === 'serious'
    );

    if (critical.length > 0) {
      console.error('Accessibility violations:', JSON.stringify(critical, null, 2));
    }

    expect(critical).toHaveLength(0);
  });
}
```

---

## CROSS-BROWSER MATRIX {#browsers}

```
TEST MATRIX — run before every production deploy:

┌────────────────────────────────────────────────────────────────┐
│ BROWSER          │ CRITICAL CHECKS                            │
├────────────────────────────────────────────────────────────────┤
│ Chrome (latest)  │ All features — primary development browser │
│ Firefox (latest) │ backdrop-filter fallback, GSAP, Spline     │
│ Safari (15+)     │ -webkit-backdrop-filter, video autoplay    │
│ Safari iOS       │ video playsinline, touch events, viewport  │
│ Chrome Android   │ Animation performance, touch scroll        │
│ Edge             │ Same as Chrome — spot check                │
└────────────────────────────────────────────────────────────────┘

GLASSMORPHISM SAFARI CHECK:
  CSS: backdrop-filter AND -webkit-backdrop-filter present?   [ ]
  @supports fallback renders correctly in Safari 14?          [ ]
  Test URL: browserstack.com (free trial) or actual device

VIDEO AUTOPLAY:
  Chrome: autoplay muted → plays                              [ ]
  Safari iOS: autoplay muted playsinline → plays              [ ]
  Firefox: autoplay muted → plays                             [ ]
  Data saver mode: video paused → fallback shows              [ ]
```

---

## ANIMATION SMOKE TESTS {#animation}

```typescript
// tests/e2e/animations.spec.ts
import { test, expect } from '@playwright/test';

test('hero animation runs on load', async ({ page }) => {
  await page.goto('/');
  // Wait for animation to complete
  await page.waitForTimeout(3000);
  // Hero content should be visible after animation
  const heroContent = page.locator('.hero-content, .hero-headline').first();
  await expect(heroContent).toBeVisible();
  // Check opacity is 1 (animation completed)
  const opacity = await heroContent.evaluate(el =>
    parseFloat(getComputedStyle(el).opacity)
  );
  expect(opacity).toBeGreaterThan(0.9);
});

test('reduced motion disables animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  // Content should be immediately visible, no animation delay
  const heroContent = page.locator('.hero-content').first();
  await expect(heroContent).toBeVisible({ timeout: 1000 });
  const opacity = await heroContent.evaluate(el =>
    parseFloat(getComputedStyle(el).opacity)
  );
  expect(opacity).toBe(1);
});
```

---

## UNIT TESTING — VITEST + SERVER ACTIONS {#vitest}

Vitest is the recommended unit test runner for Next.js 15 projects.
Faster than Jest, native ESM support, compatible with Vite's transform pipeline.

### Install

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

### vitest.config.ts

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles:  ['./tests/setup.ts'],
    globals:     true,
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation globally
vi.mock('next/navigation', () => ({
  useRouter:     () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname:   () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect:      vi.fn(),
  notFound:      vi.fn(),
}))

// Mock next/headers globally
vi.mock('next/headers', () => ({
  headers:  vi.fn(() => new Map()),
  cookies:  vi.fn(() => ({ get: vi.fn(), set: vi.fn(), getAll: vi.fn(() => []) })),
}))
```

### Add to package.json scripts

```json
{
  "scripts": {
    "test":       "vitest",
    "test:run":   "vitest run",
    "test:ui":    "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## SUPABASE MOCKING — SERVER ACTIONS AND QUERIES {#supabase-mocks}

The key challenge: Server Actions use the server Supabase client which reads cookies.
In tests, there are no real cookies. Mock the client, not the network.

### Mock factory

```typescript
// tests/mocks/supabase.ts
import { vi } from 'vitest'

// Chainable mock builder — mirrors Supabase's fluent API
function createChainableMock(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'insert', 'update', 'delete', 'upsert',
                   'eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'like',
                   'ilike', 'in', 'is', 'filter', 'order', 'limit',
                   'range', 'single', 'maybeSingle', 'returns']

  methods.forEach(m => {
    chain[m] = vi.fn(() => chain)
  })

  // Terminal methods that resolve the promise
  ;(chain as Record<string, unknown>).then = vi.fn(
    (resolve: (val: unknown) => void) => Promise.resolve(resolvedValue).then(resolve)
  )

  return chain
}

// Create mock Supabase client
export function createMockSupabaseClient(overrides: {
  user?:    Record<string, unknown> | null
  data?:    unknown
  error?:   Record<string, unknown> | null
} = {}) {
  const { user = null, data = null, error = null } = overrides
  const resolved = { data, error }

  return {
    auth: {
      getUser:             vi.fn(() => Promise.resolve({ data: { user }, error: null })),
      signInWithPassword:  vi.fn(() => Promise.resolve({ data: {}, error: null })),
      signUp:              vi.fn(() => Promise.resolve({ data: { user }, error: null })),
      signOut:             vi.fn(() => Promise.resolve({ error: null })),
      signInWithOAuth:     vi.fn(() => Promise.resolve({ data: { url: 'https://oauth.url' }, error: null })),
    },
    from: vi.fn(() => createChainableMock(resolved)),
    storage: {
      from: vi.fn(() => ({
        upload:      vi.fn(() => Promise.resolve({ data, error })),
        download:    vi.fn(() => Promise.resolve({ data: new Blob(), error })),
        remove:      vi.fn(() => Promise.resolve({ data, error })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://cdn.example.com/file.jpg' } })),
        list:        vi.fn(() => Promise.resolve({ data: [], error })),
      })),
    },
  }
}
```

### Mock in tests

```typescript
// tests/actions/posts.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient } from '../mocks/supabase'

// Mock the server Supabase client module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { createPost, getPublishedPosts } from '@/server/actions/posts'

describe('createPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a post when user is authenticated', async () => {
    const mockPost = {
      id:        'post-123',
      title:     'Test Post',
      slug:      'test-post',
      author_id: 'user-123',
      status:    'draft',
      created_at: new Date().toISOString(),
    }

    const supabase = createMockSupabaseClient({
      user: { id: 'user-123', email: 'test@example.com' },
      data: mockPost,
    })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const formData = new FormData()
    formData.set('title', 'Test Post')
    formData.set('slug',  'test-post')

    const result = await createPost(null, formData)

    // Should have queried users table first to verify role
    expect(supabase.from).toHaveBeenCalledWith('posts')
    // Should return success (no error key)
    expect(result).not.toHaveProperty('error')
  })

  it('returns error when user is not authenticated', async () => {
    const supabase = createMockSupabaseClient({ user: null })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const formData = new FormData()
    formData.set('title', 'Test Post')
    formData.set('slug',  'test-post')

    const result = await createPost(null, formData)

    expect(result).toHaveProperty('error')
    expect(result.error).toMatch(/unauthorized/i)
  })

  it('returns validation error for invalid slug', async () => {
    const supabase = createMockSupabaseClient({
      user: { id: 'user-123' },
    })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const formData = new FormData()
    formData.set('title', 'Test Post')
    formData.set('slug',  'INVALID SLUG WITH SPACES')  // ← invalid

    const result = await createPost(null, formData)

    expect(result).toHaveProperty('error')
  })
})

describe('getPublishedPosts', () => {
  it('returns published posts', async () => {
    const mockPosts = [
      { id: '1', title: 'Post One', slug: 'post-one', status: 'published' },
      { id: '2', title: 'Post Two', slug: 'post-two', status: 'published' },
    ]

    const supabase = createMockSupabaseClient({ data: mockPosts })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const posts = await getPublishedPosts()

    expect(posts).toHaveLength(2)
    expect(posts[0].title).toBe('Post One')
  })
})
```

### Testing React components with auth state

```typescript
// tests/components/UserNav.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UserNav } from '@/components/auth/UserNav'

// Mock Clerk hooks (if using Clerk)
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({
    user:     { firstName: 'Test', emailAddresses: [{ emailAddress: 'test@test.com' }], imageUrl: '' },
    isLoaded: true,
  })),
  useAuth:     vi.fn(() => ({ signOut: vi.fn() })),
  SignOutButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('UserNav', () => {
  it('shows user email when loaded', () => {
    render(<UserNav />)
    expect(screen.getByText('test@test.com')).toBeInTheDocument()
  })

  it('shows skeleton when not loaded', () => {
    const { useUser } = await import('@clerk/nextjs')
    vi.mocked(useUser).mockReturnValueOnce({ user: null, isLoaded: false } as never)
    const { container } = render(<UserNav />)
    expect(container.querySelector('.nav-skeleton')).toBeInTheDocument()
  })
})
```

### Testing Stripe webhook handler

```typescript
// tests/api/stripe-webhook.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/webhooks/stripe/route'
import { NextRequest } from 'next/server'
import { createMockSupabaseClient } from '../mocks/supabase'

vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: createMockSupabaseClient({ data: null }),
}))

import { stripe } from '@/lib/stripe/client'

describe('Stripe webhook handler', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects invalid signature', async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockImplementationOnce(() => {
      throw new Error('Invalid signature')
    })

    const req = new NextRequest('https://example.com/api/webhooks/stripe', {
      method:  'POST',
      body:    '{"type":"test"}',
      headers: { 'stripe-signature': 'invalid' },
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('handles subscription.created event', async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce({
      type: 'customer.subscription.created',
      data: {
        object: {
          id:                  'sub_123',
          customer:            'cus_123',
          status:              'active',
          current_period_end:  Math.floor(Date.now()/1000) + 2592000,
          cancel_at_period_end: false,
          items: { data: [{ price: { id: process.env.STRIPE_PRICE_ID_PRO ?? 'price_pro' } }] },
          metadata: { supabase_uid: 'user-123' },
        },
      },
    } as never)

    const req = new NextRequest('https://example.com/api/webhooks/stripe', {
      method:  'POST',
      body:    '{}',
      headers: { 'stripe-signature': 'valid_sig' },
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
```

### CI integration — run tests on every PR

```yaml
# .github/workflows/test.yml (add to existing CI or create new)
name: Tests

on:
  pull_request:
    branches: [main, staging]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run
        env:
          NEXT_PUBLIC_SUPABASE_URL:      ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          # Other env vars as needed — use GitHub Secrets
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: always()
```

### What to test vs what not to test

```
ALWAYS TEST (unit):
  ✓ Server Actions — all happy paths + auth failure + validation failure
  ✓ Utility functions (slugify, formatDate, can())
  ✓ Zod schemas — valid input passes, invalid input fails with right message
  ✓ Permission utilities (can(role, resource, action))
  ✓ Stripe plan mapping (price ID → plan name)

ALWAYS TEST (E2E with Playwright):
  ✓ Sign-up → email verify → sign-in flow
  ✓ Contact form submission → email arrives
  ✓ Checkout → success page
  ✓ 404 page renders correctly

SKIP UNIT TESTS (test E2E instead):
  ✗ Next.js page components (too coupled to routing)
  ✗ API route handlers (use E2E or integration tests)
  ✗ GSAP animations (test visually / with Playwright screenshot diff)
  ✗ Cloudinary uploads (mock or integration test only)

SKIP ENTIRELY:
  ✗ Third-party SDKs (Supabase, Stripe, Clerk — they test their own code)
  ✗ UI snapshot tests for frequently changing components
  ✗ CSS / styling tests (visual regression is better — use Chromatic)
```
