# Cinematic Web — Fullstack Scaffold

## TABLE OF CONTENTS
1. [How to Use This File](#how)
2. [Scaffold Decision Tree](#decision)
3. [Marketing / Portfolio Site](#marketing)
4. [SaaS Application](#saas)
5. [Internal Tool / Admin Panel](#internal)
6. [E-commerce](#ecommerce)
7. [Real-time App](#realtime)
8. [Monorepo (Frontend + Separate Backend)](#monorepo)
9. [Environment Variables Master Template](#env)
10. [Scaffold Command Generator](#commands)

---

## HOW TO USE THIS FILE {#how}

Read during Phase 4 after the Backend Decision Record is locked.
Output the complete folder tree for the chosen app type BEFORE writing any code.
Every file in the tree should be mentioned — even empty index files and placeholder components.
The tree defines the project. Code fills it in.

**Rule:** Never generate code for a file that is not in the scaffold tree.
**Rule:** Never skip the scaffold. Even simple marketing sites get the full tree output.
**Rule:** For Next.js 15 — the tree must include `middleware.ts` at the root (not inside `app/`).

---

## SCAFFOLD DECISION TREE {#decision}

```
What is the application type?
│
├── Marketing / Portfolio
│   Will users log in?
│   NO  → Marketing Scaffold (static/ISR, no auth)
│   YES → Marketing + Auth Scaffold (rare — e.g. member-only content)
│
├── SaaS Application
│   Backend?
│   ├── Supabase      → SaaS + Supabase Scaffold
│   ├── Neon/Drizzle  → SaaS + Neon Scaffold
│   └── PocketBase    → SaaS + PocketBase Scaffold
│
├── Internal Tool / Admin Panel
│   → Internal Tool Scaffold (invite-only auth, role-gated routes)
│
├── E-commerce
│   ├── Shopify Headless → E-commerce + Shopify Scaffold
│   └── Custom           → E-commerce + Medusa/Stripe Scaffold
│
└── Real-time App
    ├── Supabase Realtime → Realtime + Supabase Scaffold
    └── Convex            → Realtime + Convex Scaffold
```

---

## MARKETING / PORTFOLIO SITE {#marketing}

Use for: agency sites, portfolios, product landing pages, blogs, docs sites.
No user accounts. CMS optional. Contact forms via Server Actions + Resend.

```
[project-name]/
│
├── app/                               ← Next.js App Router root
│   ├── layout.tsx                     ← Root layout (fonts, analytics, consent)
│   ├── page.tsx                       ← Homepage
│   ├── globals.css                    ← CSS variables, resets, animation tokens
│   ├── error.tsx                      ← Route error boundary (client)
│   ├── global-error.tsx               ← Root layout error (client, includes html/body)
│   ├── not-found.tsx                  ← On-brand 404
│   ├── loading.tsx                    ← Suspense skeleton
│   │
│   ├── (marketing)/                   ← Public marketing pages route group
│   │   ├── about/page.tsx
│   │   ├── services/page.tsx
│   │   ├── work/page.tsx
│   │   ├── work/[slug]/page.tsx       ← Case study (await params — Next.js 15)
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   ├── contact/page.tsx
│   │   └── legal/
│   │       ├── privacy/page.tsx
│   │       └── terms/page.tsx
│   │
│   └── api/
│       ├── contact/route.ts           ← Contact form → Resend
│       ├── revalidate/route.ts        ← ISR revalidation (secret-gated)
│       └── health/route.ts            ← Uptime check
│
├── components/
│   ├── layout/
│   │   ├── Nav.tsx                    ← Navigation (desktop + mobile)
│   │   ├── Footer.tsx
│   │   └── CookieConsent.tsx          ← GDPR consent banner
│   ├── sections/                      ← Per-section components
│   │   ├── Hero/
│   │   │   ├── Hero.tsx
│   │   │   ├── HeroVideo.tsx          ← Cloudinary video loop
│   │   │   └── HeroCanvas.tsx         ← Three.js / WebGL (if paradigm needs it)
│   │   ├── Features/
│   │   ├── Work/
│   │   ├── About/
│   │   ├── Testimonials/
│   │   └── CTA/
│   ├── ui/                            ← Reusable design system components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   └── Spinner.tsx
│   └── seo/
│       ├── StructuredData.tsx         ← JSON-LD schema
│       └── OpenGraph.tsx
│
├── lib/
│   ├── cloudinary.ts                  ← Image/video helpers (transform URL builder)
│   ├── animation.ts                   ← GSAP + Lenis setup (single init — import everywhere)
│   ├── fonts.ts                       ← next/font configuration
│   ├── utils.ts                       ← cn(), formatDate(), slugify()
│   └── email.ts                       ← Resend email sender
│
├── server/
│   └── actions/
│       └── contact.ts                 ← 'use server' contact form handler
│
├── content/                           ← Static MDX content (if no CMS)
│   ├── blog/
│   └── work/
│
├── public/
│   ├── assets/                        ← User-provided static assets
│   ├── fonts/                         ← Self-hosted fonts (if not using next/font)
│   └── og/                            ← OG images
│
├── remotion/                          ← Remotion compositions (if asset pipeline uses it)
│   ├── Root.tsx
│   ├── compositions/
│   └── lib/brand.ts
│
├── types/
│   └── index.ts                       ← Global TypeScript types
│
├── hooks/
│   ├── useScrollProgress.ts
│   └── useMediaQuery.ts
│
├── middleware.ts                       ← Security headers, rate limiting (at project root)
├── next.config.ts                     ← Next.js 15 config (TypeScript)
├── tailwind.config.ts                 ← Tailwind 4 config (if using Tailwind)
├── tsconfig.json
├── package.json                       ← Exact pinned versions (from VERSION MANIFEST)
├── .env.example                       ← All env vars documented (no real values)
├── .env.local                         ← Actual values (gitignored)
├── .gitignore
├── .generation-prompts.json           ← Asset pipeline prompts (from Phase 3)
├── .generation-jobs.json              ← Active generation job IDs (gitignored)
└── README.md                          ← Setup, env vars, deploy instructions
```

---

## SAAS APPLICATION {#saas}

Use for: SaaS products, web apps with user accounts, subscription services.
Sub-scaffold varies by backend choice — see notes per section.

```
[project-name]/
│
├── app/
│   ├── layout.tsx                     ← Root layout (providers, fonts)
│   ├── globals.css
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── not-found.tsx
│   ├── loading.tsx
│   │
│   ├── (marketing)/                   ← Public — no auth required
│   │   ├── layout.tsx                 ← Marketing layout (signed-out nav)
│   │   ├── page.tsx                   ← Landing page
│   │   ├── pricing/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   └── changelog/page.tsx
│   │
│   ├── (auth)/                        ← Auth pages (redirect to dashboard if signed in)
│   │   ├── layout.tsx                 ← Redirect guard
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/page.tsx   ← Clerk catch-all OR custom form
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── verify/page.tsx            ← Email verification confirmation
│   │
│   ├── (onboarding)/                  ← First-time user setup
│   │   ├── layout.tsx                 ← Auth required, incomplete profile guard
│   │   └── onboarding/
│   │       ├── page.tsx               ← Step 1: profile
│   │       ├── workspace/page.tsx     ← Step 2: team/workspace
│   │       └── done/page.tsx          ← Step 3: confirm + redirect
│   │
│   ├── (dashboard)/                   ← Protected — auth required
│   │   ├── layout.tsx                 ← Auth check + dashboard shell (sidebar + nav)
│   │   ├── loading.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx               ← Main dashboard / overview
│   │   ├── account/
│   │   │   ├── page.tsx               ← Profile settings
│   │   │   └── billing/page.tsx       ← Stripe customer portal
│   │   ├── settings/
│   │   │   └── page.tsx               ← App settings
│   │   └── [feature]/                 ← Main app feature (replace with actual name)
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [id]/page.tsx
│   │
│   └── (admin)/                       ← Protected — admin role required
│       ├── layout.tsx                 ← Auth + role check
│       └── admin/
│           ├── page.tsx               ← Admin overview
│           ├── users/page.tsx         ← User management
│           ├── subscriptions/page.tsx
│           └── settings/page.tsx
│
│   └── api/
│       ├── auth/
│       │   ├── callback/route.ts      ← OAuth + magic link callback
│       │   └── signout/route.ts
│       ├── webhooks/
│       │   ├── stripe/route.ts        ← Payment events → subscription sync
│       │   └── clerk/route.ts         ← User sync (if using Clerk)
│       ├── upload/route.ts            ← File upload → Supabase Storage / S3
│       ├── revalidate/route.ts
│       └── health/route.ts
│
├── components/
│   ├── layout/
│   │   ├── MarketingNav.tsx           ← Signed-out nav
│   │   ├── DashboardShell.tsx         ← Sidebar + top nav wrapper
│   │   ├── DashboardNav.tsx           ← Top navigation bar
│   │   ├── DashboardSidebar.tsx       ← Left sidebar navigation
│   │   ├── Footer.tsx
│   │   └── CookieConsent.tsx
│   ├── marketing/                     ← Landing page sections
│   │   ├── Hero/
│   │   ├── Pricing/
│   │   ├── Features/
│   │   └── CTA/
│   ├── dashboard/                     ← Dashboard-specific components
│   │   ├── StatsCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── EmptyState.tsx
│   │   └── ActivityFeed.tsx
│   ├── auth/                          ← Auth-specific components
│   │   ├── SignInForm.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── UserMenu.tsx
│   │   └── RoleGate.tsx               ← Show/hide UI based on role
│   └── ui/                            ← Shared design system
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Dialog.tsx
│       ├── Input.tsx
│       ├── Label.tsx
│       ├── Select.tsx
│       ├── Table.tsx
│       ├── Badge.tsx
│       ├── Toast.tsx
│       ├── Skeleton.tsx
│       └── Spinner.tsx
│
├── lib/
│   ├── supabase/                      ← If using Supabase
│   │   ├── client.ts                  ← Browser client (Client Components)
│   │   ├── server.ts                  ← Server client (Server Components, Actions)
│   │   ├── admin.ts                   ← Admin client (service role — server only)
│   │   └── storage.ts                 ← File upload helpers
│   ├── db/                            ← If using Drizzle or Prisma
│   │   ├── index.ts                   ← DB client singleton
│   │   ├── schema.ts                  ← Table definitions
│   │   └── queries/                   ← Reusable query functions
│   │       ├── users.ts
│   │       ├── posts.ts
│   │       └── subscriptions.ts
│   ├── auth/
│   │   ├── session.ts                 ← Get current user (server + client)
│   │   ├── permissions.ts             ← can(role, resource, action) utility
│   │   └── middleware-helpers.ts
│   ├── stripe/
│   │   ├── client.ts                  ← Stripe SDK singleton
│   │   └── plans.ts                   ← Plan definitions + features
│   ├── cloudinary.ts
│   ├── animation.ts                   ← Single Lenis + GSAP init
│   ├── email.ts                       ← Resend helpers
│   ├── utils.ts
│   └── fonts.ts
│
├── server/                            ← Server-only code (never imported client-side)
│   ├── actions/
│   │   ├── auth.ts                    ← signUp, signIn, signOut, signInWithGoogle
│   │   ├── users.ts                   ← updateProfile, changeRole, deleteAccount
│   │   ├── posts.ts                   ← create, update, delete, publish
│   │   ├── uploads.ts                 ← processUpload, deleteAsset
│   │   └── stripe.ts                  ← createCheckoutSession, createPortalSession
│   ├── queries/                       ← Read-only data fetching for Server Components
│   │   ├── users.ts
│   │   ├── posts.ts
│   │   └── subscriptions.ts
│   └── services/                      ← Business logic (called by actions + API routes)
│       ├── email.ts                   ← Send transactional emails
│       ├── stripe.ts                  ← Stripe operations
│       └── notifications.ts           ← In-app + email notifications
│
├── hooks/                             ← Client-side React hooks
│   ├── useUser.ts                     ← Current user from session
│   ├── useSubscription.ts
│   ├── useScrollProgress.ts
│   └── useMediaQuery.ts
│
├── types/
│   ├── index.ts                       ← Shared TypeScript types
│   ├── supabase.ts                    ← Generated from: npx supabase gen types
│   └── api.ts                         ← API request/response types
│
├── supabase/                          ← Supabase local dev (if using Supabase)
│   ├── config.toml
│   ├── migrations/
│   │   └── 0001_initial.sql
│   └── seed.sql                       ← Dev seed data
│
├── remotion/                          ← If Remotion used in asset pipeline
│   ├── Root.tsx
│   └── compositions/
│
├── middleware.ts                       ← Auth protection + security headers (project root)
├── next.config.ts
├── tailwind.config.ts
├── drizzle.config.ts                  ← If using Drizzle
├── tsconfig.json
├── package.json
├── .env.example
├── .env.local
├── .gitignore
└── README.md
```

---

## INTERNAL TOOL / ADMIN PANEL {#internal}

Use for: staff dashboards, CMS admin panels, B2B client portals, ops tools.
Invite-only — no public sign-up. Role-gated throughout.

```
[project-name]/
│
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── not-found.tsx
│   ├── loading.tsx
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx             ← Email + password only (no social)
│   │   └── forgot-password/page.tsx
│   │
│   └── (app)/                         ← Everything requires auth
│       ├── layout.tsx                 ← Auth guard + app shell
│       ├── dashboard/page.tsx
│       ├── users/
│       │   ├── page.tsx               ← User list (admin only)
│       │   └── [id]/page.tsx          ← User detail
│       ├── content/                   ← Whatever the tool manages
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/
│       │       ├── page.tsx
│       │       └── edit/page.tsx
│       ├── reports/page.tsx
│       └── settings/page.tsx
│
│   └── api/
│       ├── auth/callback/route.ts
│       ├── invite/route.ts            ← Admin sends invite emails
│       └── health/route.ts
│
├── components/
│   ├── shell/
│   │   ├── AppShell.tsx               ← Sidebar + content area
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── BreadcrumbNav.tsx
│   ├── data/
│   │   ├── DataTable.tsx              ← Sortable, filterable, paginated
│   │   ├── FilterBar.tsx
│   │   └── ExportButton.tsx
│   ├── auth/
│   │   └── RoleGate.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Dialog.tsx
│       ├── Table.tsx
│       └── Badge.tsx
│
├── lib/
│   ├── supabase/                      ← client, server, admin
│   ├── auth/
│   │   ├── session.ts
│   │   └── permissions.ts            ← Granular permission checking
│   └── utils.ts
│
├── server/
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   └── invite.ts                 ← Send invite email + create pending user
│   └── queries/
│       └── users.ts
│
├── middleware.ts                      ← All routes protected by default
├── next.config.ts
├── package.json
├── .env.example
└── README.md
```

---

## E-COMMERCE {#ecommerce}

```
[project-name]/
│
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── not-found.tsx
│   ├── loading.tsx
│   │
│   ├── (shop)/                        ← Public storefront
│   │   ├── layout.tsx                 ← Shop nav (cart icon, search)
│   │   ├── page.tsx                   ← Homepage / hero
│   │   ├── products/
│   │   │   ├── page.tsx               ← Product grid
│   │   │   └── [handle]/page.tsx      ← Product detail (await params)
│   │   ├── collections/
│   │   │   └── [handle]/page.tsx
│   │   ├── search/page.tsx
│   │   └── about/page.tsx
│   │
│   ├── (checkout)/                    ← Checkout flow
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── order-confirmed/page.tsx
│   │
│   ├── (account)/                     ← Customer account (optional auth)
│   │   ├── layout.tsx                 ← Auth guard
│   │   ├── orders/page.tsx
│   │   └── profile/page.tsx
│   │
│   └── api/
│       ├── cart/route.ts
│       ├── checkout/route.ts
│       ├── webhooks/stripe/route.ts
│       └── revalidate/route.ts
│
├── components/
│   ├── shop/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── AddToCartButton.tsx
│   │   ├── Cart.tsx
│   │   ├── CartDrawer.tsx
│   │   └── PriceDisplay.tsx
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── OrderSummary.tsx
│   │   └── PaymentForm.tsx
│   └── ui/ ...
│
├── lib/
│   ├── shopify/                       ← Shopify Storefront API (if headless)
│   │   ├── client.ts
│   │   ├── queries/products.ts
│   │   └── queries/cart.ts
│   ├── stripe/                        ← Stripe (if custom e-commerce)
│   │   └── client.ts
│   ├── cart.ts                        ← Cart state management
│   └── utils.ts
│
├── middleware.ts
├── next.config.ts
└── package.json
```

---

## REAL-TIME APP {#realtime}

```
[project-name]/
│
├── app/
│   ├── layout.tsx                     ← Providers: auth, real-time subscription
│   ├── globals.css
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── not-found.tsx
│   │
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   │
│   └── (app)/
│       ├── layout.tsx                 ← Auth guard + realtime provider
│       ├── page.tsx                   ← Main realtime feature
│       └── [room]/page.tsx            ← Per-room / per-channel view
│
│   └── api/
│       ├── auth/callback/route.ts
│       └── health/route.ts
│
├── components/
│   ├── realtime/
│   │   ├── MessageList.tsx            ← Auto-scrolling message feed
│   │   ├── MessageInput.tsx
│   │   ├── PresenceIndicator.tsx      ← Who is online
│   │   ├── TypingIndicator.tsx
│   │   └── RealtimeProvider.tsx       ← Supabase channel subscription context
│   └── ui/ ...
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── realtime.ts               ← Channel subscription helpers
│   └── utils.ts
│
├── hooks/
│   ├── useRealtimeMessages.ts         ← Subscribe to messages channel
│   ├── usePresence.ts                 ← Online user tracking
│   └── useUser.ts
│
├── middleware.ts
├── next.config.ts
└── package.json
```

---

## MONOREPO (FRONTEND + SEPARATE BACKEND) {#monorepo}

Use when: mobile app also needs the API, Python backend preferred,
or clear frontend/backend team separation is required.

```
[project-name]/                        ← Monorepo root
│
├── apps/
│   ├── web/                           ← Next.js frontend (any scaffold above)
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── api/                           ← Express / FastAPI backend
│       ├── src/                       ← Express: TypeScript source
│       │   ├── index.ts               ← App entry + server
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── users.ts
│       │   │   └── posts.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts            ← JWT verification
│       │   │   ├── rateLimit.ts
│       │   │   └── errorHandler.ts
│       │   ├── services/
│       │   ├── db/
│       │   └── types/
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
│       │
│       ├── main.py                    ← FastAPI: Python entry (if Python backend)
│       ├── routers/
│       ├── models/
│       ├── schemas/
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/                          ← Shared code between apps
│   ├── types/                         ← Shared TypeScript types
│   │   ├── src/index.ts
│   │   └── package.json
│   └── utils/                         ← Shared utility functions
│       ├── src/index.ts
│       └── package.json
│
├── package.json                       ← Workspace root (npm/pnpm workspaces)
├── pnpm-workspace.yaml                ← If using pnpm
├── turbo.json                         ← If using Turborepo
├── docker-compose.yml                 ← Local dev: web + api + db
└── README.md
```

### docker-compose.yml for local monorepo dev:

```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: ./apps/web
    ports: ['3000:3000']
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3001
    depends_on: [api, db]

  api:
    build: ./apps/api
    ports: ['3001:3001']
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/app
      - NODE_ENV=development
    depends_on: [db]

  db:
    image: postgres:16-alpine
    ports: ['5432:5432']
    environment:
      POSTGRES_USER:     postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB:       app
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./apps/api/src/db/seed.sql:/docker-entrypoint-initdb.d/seed.sql

volumes:
  postgres_data:
```

---

## ENVIRONMENT VARIABLES MASTER TEMPLATE {#env}

### Zero-Budget .env.example
When budget = "zero", generate this minimal `.env.example`. Only include services that are free:

```env
# ─── APPLICATION ──────────────────────────────────────
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ─── SUPABASE (free tier — supabase.com, no credit card) ──
# 500MB Postgres · 50k MAU · 1GB storage · all free
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # server-side only

# ─── EMAIL (free — resend.com, no credit card) ────────────
# 3,000 emails/month free
RESEND_API_KEY=re_...
FROM_EMAIL=hello@yourdomain.com

# ─── ASSETS (free — no credit card) ──────────────────────
# Cloudinary: 25GB storage + 25GB bandwidth free
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# ─── IMAGE / VIDEO (free quota — aistudio.google.com) ─────
GOOGLE_AI_STUDIO_KEY=AIza...    # Veo 3 video + Imagen 3 images

# ─── STOCK FALLBACKS (completely free) ────────────────────
UNSPLASH_ACCESS_KEY=...          # unsplash.com/developers
PEXELS_API_KEY=...               # pexels.com/api

# ─── RATE LIMITING (free — upstash.com, no credit card) ───
# 10,000 commands/day free — enough for most contact forms
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...

# ─── MONITORING (free — sentry.io) ───────────────────────
# 5,000 errors/month free
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# ─── REVALIDATION SECRET ──────────────────────────────────
# Generate: openssl rand -base64 32
REVALIDATION_SECRET=...

# ─── PROJECT ──────────────────────────────────────────────
PROJECT_SLUG=my-project
```

**Total monthly cost: $0** — every service above has a genuinely free tier.

### Full .env.example (all budgets)
Never include actual values. Include comments explaining where to get each key.

```env
# ─── APPLICATION ─────────────────────────────────────────────────
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000        # Production: https://yourdomain.com
PROJECT_SLUG=my-project                          # Used for Cloudinary folder structure

# ─── SUPABASE (if using Supabase) ────────────────────────────────
# Get from: supabase.com → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...                 # ⚠ Server only — never expose to client

# ─── DATABASE (if using Neon/Drizzle or Prisma directly) ─────────
# Get from: neon.tech → Project → Connection string
DATABASE_URL=postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# ─── AUTH ─────────────────────────────────────────────────────────
# Clerk: clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...                   # Svix webhook secret for user sync
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Auth.js: generate with: openssl rand -base64 32
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...

# ─── EMAIL ────────────────────────────────────────────────────────
# Get from: resend.com → API Keys
RESEND_API_KEY=re_...
FROM_EMAIL=hello@yourdomain.com
REPLY_TO_EMAIL=support@yourdomain.com

# ─── PAYMENTS ─────────────────────────────────────────────────────
# Get from: dashboard.stripe.com → Developers → API Keys
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...                  # stripe listen --forward-to localhost:3000/api/webhooks/stripe
STRIPE_PRICE_ID_PRO=price_...                    # Your Pro plan price ID
STRIPE_PRICE_ID_ENTERPRISE=price_...

# ─── CLOUDINARY (asset delivery) ─────────────────────────────────
# Get from: cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name  # For client-side CldImage

# ─── ASSET GENERATION ─────────────────────────────────────────────
# Get from: aistudio.google.com → API Key
GOOGLE_AI_STUDIO_KEY=AIza...                     # Veo 3 video + Imagen 3 images (free quota)
RUNWAY_API_KEY=...                               # runway.ml → API (premium)

# Stock fallbacks (free):
UNSPLASH_ACCESS_KEY=...                          # unsplash.com/developers
PEXELS_API_KEY=...                               # pexels.com/api

# ─── MONITORING ───────────────────────────────────────────────────
# Get from: sentry.io → Project → DSN
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=sntrys_...                     # For source maps upload at build

# Get from: analytics.google.com → Data Streams
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...

# ─── RATE LIMITING ────────────────────────────────────────────────
# Get from: upstash.com → Redis → REST API
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...

# ─── CMS (if using headless CMS) ─────────────────────────────────
# Sanity:
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...
SANITY_WEBHOOK_SECRET=...

# Contentful:
CONTENTFUL_SPACE_ID=...
CONTENTFUL_ACCESS_TOKEN=...
CONTENTFUL_PREVIEW_ACCESS_TOKEN=...

# ─── INTERNAL / SECURITY ──────────────────────────────────────────
REVALIDATION_SECRET=...                          # generate: openssl rand -base64 32
CRON_SECRET=...                                  # For Vercel Cron authentication

# ─── POCKETBASE (if using PocketBase) ────────────────────────────
NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=...

# ─── CONVEX (if using Convex) ─────────────────────────────────────
NEXT_PUBLIC_CONVEX_URL=https://....convex.cloud
```

---

## SCAFFOLD COMMAND GENERATOR {#commands}

After outputting the folder tree, output these commands so the user
can run them immediately to create the structure:

### Next.js project initialisation

```bash
# Create Next.js 15 app (App Router, TypeScript, Tailwind)
npx create-next-app@latest [project-name] \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd [project-name]

# Install all dependencies at once (use exact versions from VERSION MANIFEST)
npm install \
  gsap@3.12.7 \
  lenis@1.3.4 \
  framer-motion@12.9.4 \
  cloudinary@2.6.1 \
  next-cloudinary@6.16.0 \
  resend@4.2.0 \
  zod@3.24.4 \
  @upstash/redis@1.34.6 \
  @upstash/ratelimit@2.0.5 \
  @sentry/nextjs@9.14.0

# Auth — choose one:
npm install @clerk/nextjs@latest              # Clerk
npm install @supabase/supabase-js @supabase/ssr  # Supabase Auth
npm install next-auth@beta @auth/drizzle-adapter  # Auth.js v5
npm install lucia arctic                      # Lucia

# Database — choose one:
npm install drizzle-orm @neondatabase/serverless  # Neon + Drizzle
npm install -D drizzle-kit
npm install @prisma/client && npx prisma init  # Prisma

# Supabase local dev (requires Docker):
npm install -D supabase
npx supabase init
npx supabase start

# Create folder structure
mkdir -p \
  app/\(marketing\) \
  app/\(auth\) \
  app/\(dashboard\) \
  app/\(admin\) \
  app/api/auth/callback \
  app/api/webhooks \
  components/layout \
  components/marketing \
  components/dashboard \
  components/auth \
  components/ui \
  lib/supabase \
  lib/auth \
  lib/stripe \
  server/actions \
  server/queries \
  server/services \
  hooks \
  types \
  supabase/migrations \
  remotion/compositions

# Create required Next.js files
touch app/error.tsx app/global-error.tsx app/not-found.tsx app/loading.tsx
touch middleware.ts
touch .env.local .env.example

# Initialise git
git init
git add .
git commit -m "feat: project scaffold"
```

### After scaffold — generate Supabase types

```bash
# After running migrations:
npx supabase gen types typescript \
  --project-id [your-project-ref] \
  --schema public \
  > types/supabase.ts
```

### After scaffold — set up Drizzle

```bash
# Push schema to database:
npx drizzle-kit push:pg

# Generate migration files:
npx drizzle-kit generate:pg

# Open visual DB browser:
npx drizzle-kit studio
```
