# Cinematic Web — Backend Layer

## TABLE OF CONTENTS
1. [Application Type → Backend Recommendation Matrix](#matrix)
2. [Phase 4B — Backend Interview](#interview)
3. [Supabase — Full Setup](#supabase)
4. [Neon + DrizzleORM](#drizzle)
5. [Prisma + PostgreSQL](#prisma)
6. [tRPC (Next.js native)](#trpc)
7. [PocketBase](#pocketbase)
8. [Convex](#convex)
9. [Express.js / Fastify](#express)
10. [FastAPI / Django](#python)
11. [Next.js API Routes + Server Actions](#nextjs-api)
12. [Database Schema Patterns](#schemas)
13. [Server Actions Architecture](#actions)
14. [API Route Organisation](#routes)

---

## APPLICATION TYPE → BACKEND RECOMMENDATION MATRIX {#matrix}

Run this during Phase 4B after application type is confirmed:

```
APPLICATION TYPE          RECOMMENDED STACK              WHY
─────────────────────────────────────────────────────────────────
Marketing / Portfolio     Next.js API Routes only        No DB needed. Forms → Resend.
                          + Resend (email)               Static site or ISR.
                          + Sanity/Contentful (CMS)

SaaS (solo/small team)    Supabase + Next.js             Auth + DB + Storage + Realtime.
                          + tRPC (optional)              Free tier covers early growth.
                          + Clerk (if multi-tenant)

SaaS (scale/enterprise)   Neon + DrizzleORM + Next.js    Serverless Postgres scales
                          + Auth.js v5 or Clerk           better than Supabase at volume.
                          + Redis (Upstash)               Cheaper long-term.

Internal tool / Admin     Supabase + Next.js             RLS handles permissions natively.
                          + Supabase Auth (roles)         Fast to build, easy to maintain.

B2B / Multi-tenant SaaS   Next.js + Neon + DrizzleORM   Multi-tenant DB patterns.
                          + Clerk (orgs built-in)         Org management is free in Clerk.

Ecommerce                 Next.js + Shopify Headless     Inventory, payments handled.
                          OR Medusa.js + Neon             Full-stack control option.
                          + Stripe

Real-time app             Convex + Next.js               Real-time is first-class.
(chat, collab, live)      OR Supabase Realtime            Both are TypeScript-native.

Python-first team         FastAPI + Neon/Supabase         Python backend, JS frontend.
                          + Next.js frontend              Full separation of concerns.

MVP / Hackathon           PocketBase + Next.js            Zero config. Single binary.
                          + PocketBase Auth               Deployed in minutes.

Budget = zero             Supabase free tier              Most generous free tier.
                          + Next.js + Vercel              All free. Production-ready.
```

---

## PHASE 4B — BACKEND INTERVIEW {#interview}

Run this as part of Phase 4. Present questions in two groups.

**GROUP A — What are we building?**

```
1. Application type (pick closest):
   A) Marketing/portfolio — no user accounts needed
   B) Content-driven site — blog, docs, news (CMS-driven)
   C) SaaS / web app — users have accounts, dashboards
   D) Internal tool / admin panel — staff only
   E) E-commerce — products, cart, checkout
   F) Real-time app — chat, live updates, collaboration
   G) Mixed — marketing site + app (different route groups)

2. Will users need to log in?
   YES → go to auth questions (see auth-layer.md)
   NO  → skip auth entirely

3. What data needs to be stored?
   (ask user to list: user profiles, posts, products, orders, etc.)
   → This drives the database schema generation in Phase 5

4. Budget for backend services (monthly)?
   $0        → Supabase free + Vercel free + PocketBase self-hosted
   < $50/mo  → Supabase Pro OR Neon + PlanetScale free
   < $200/mo → Any Tier 1 stack
   Open      → Best tool for the job, no constraints
```

**GROUP B — Technical decisions:**

```
5. Preferred language for backend logic?
   TypeScript (default) → Next.js API routes / tRPC / Drizzle
   Python               → FastAPI or Django REST
   No preference        → skill recommends

6. Does the app need real-time features?
   (live updates, notifications, chat, presence)
   YES → Supabase Realtime OR Convex
   NO  → standard REST/Server Actions

7. Will there be file uploads?
   YES → Supabase Storage OR Cloudinary (already configured) OR S3
   NO  → skip

8. Will there be background jobs?
   (email queues, scheduled tasks, webhooks processing)
   YES → add Inngest (serverless) OR BullMQ + Redis
   NO  → skip

9. Does this need a separate API server
   (mobile app, third-party integrations, or non-Next.js frontend)?
   YES → Express/Fastify OR FastAPI (separate backend)
   NO  → Next.js Server Actions + API Routes are sufficient
```

**After interview — output the Backend Decision Record:**
```
╔══════════════════════════════════════════════════════════╗
║  BACKEND DECISION RECORD                                ║
╠══════════════════════════════════════════════════════════╣
║ APP TYPE:      [type]                                   ║
║ DATABASE:      [Supabase | Neon | Prisma | PocketBase]  ║
║ AUTH:          [Clerk | Supabase Auth | Auth.js | None] ║
║ API LAYER:     [Server Actions | tRPC | REST | GraphQL] ║
║ REALTIME:      [Supabase | Convex | Pusher | None]      ║
║ FILE STORAGE:  [Supabase | Cloudinary | S3 | None]      ║
║ BACKGROUND:    [Inngest | BullMQ | None]                ║
║ SEPARATE API:  [Yes → Express/FastAPI | No]             ║
╚══════════════════════════════════════════════════════════╝
```

---

## SUPABASE — FULL SETUP {#supabase}

### Install

```bash
npm install @supabase/supabase-js @supabase/ssr
npx supabase init           # creates supabase/ folder
npx supabase start          # starts local Supabase (Docker required)
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-side only — never expose
```

### Client setup (Next.js 15 — four clients for four contexts)

```typescript
// lib/supabase/client.ts — browser client (Client Components)
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// lib/supabase/server.ts — server client (Server Components, Server Actions)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()  // Next.js 15: cookies() is async

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:    ()     => cookieStore.getAll(),
        setAll:    (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore: Server Components cannot set cookies
          }
        },
      },
    }
  )
}
```

```typescript
// lib/supabase/admin.ts — admin client (service role — server only)
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
// Use only in trusted server contexts — bypasses RLS
```

```typescript
// middleware.ts — refreshes sessions on every request (REQUIRED)
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:    ()     => request.cookies.getAll(),
        setAll:    (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // Refresh session — do NOT add logic between createServerClient and getUser
  const { data: { user } } = await supabase.auth.getUser()

  // Protect routes that require auth
  const protectedPaths = ['/dashboard', '/account', '/admin']
  const isProtected = protectedPaths.some(p =>
    request.nextUrl.pathname.startsWith(p))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### Generate TypeScript types from Supabase schema

```bash
npx supabase gen types typescript \
  --project-id [project-ref] \
  --schema public \
  > types/supabase.ts
```

### Supabase Storage setup

```typescript
// lib/supabase/storage.ts
import { createClient } from './server'

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean }
) {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType ?? file instanceof File ? file.type : 'application/octet-stream',
      upsert: options?.upsert ?? false,
    })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)
  return data
}

export async function getPublicUrl(bucket: string, path: string) {
  const supabase = await createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteFile(bucket: string, paths: string[]) {
  const supabase = await createClient()
  const { error } = await supabase.storage.from(bucket).remove(paths)
  if (error) throw new Error(`Storage delete failed: ${error.message}`)
}
```

---

## NEON + DRIZZLEORM {#drizzle}

Best for: serverless Postgres, scales better than Supabase at volume, modern DX.

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

```env
DATABASE_URL=postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Schema definition

```typescript
// lib/db/schema.ts — single source of truth for all tables
import {
  pgTable, uuid, text, timestamp, boolean,
  integer, pgEnum, index, uniqueIndex,
} from 'drizzle-orm/pg-core'

// ── Enums ────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role',
  ['admin', 'editor', 'author', 'viewer'])

export const statusEnum = pgEnum('status',
  ['draft', 'in_review', 'published', 'archived'])

// ── Users ────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:        uuid('id').primaryKey().defaultRandom(),
  email:     text('email').unique().notNull(),
  name:      text('name').notNull(),
  role:      userRoleEnum('role').default('viewer').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
}))

// ── Posts (example content type) ────────────────────────────
export const posts = pgTable('posts', {
  id:          uuid('id').primaryKey().defaultRandom(),
  title:       text('title').notNull(),
  slug:        text('slug').unique().notNull(),
  excerpt:     text('excerpt'),
  body:        text('body'),
  status:      statusEnum('status').default('draft').notNull(),
  authorId:    uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx:      uniqueIndex('posts_slug_idx').on(table.slug),
  statusIdx:    index('posts_status_idx').on(table.status),
  authorIdx:    index('posts_author_idx').on(table.authorId),
  publishedIdx: index('posts_published_idx').on(table.publishedAt),
}))

// Relations
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
```

### Drizzle client

```typescript
// lib/db/index.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

### Query patterns

```typescript
// lib/db/queries/posts.ts
import { db } from '@/lib/db'
import { posts, users } from '@/lib/db/schema'
import { eq, desc, and, ilike } from 'drizzle-orm'

export async function getPublishedPosts(limit = 10, offset = 0) {
  return db
    .select({
      id:          posts.id,
      title:       posts.title,
      slug:        posts.slug,
      excerpt:     posts.excerpt,
      publishedAt: posts.publishedAt,
      author: {
        name:      users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset)
}

export async function getPostBySlug(slug: string) {
  const result = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, 'published')))
    .limit(1)

  return result[0] ?? null
}

export async function createPost(data: NewPost) {
  const result = await db.insert(posts).values(data).returning()
  return result[0]
}

export async function updatePost(id: string, data: Partial<NewPost>) {
  const result = await db
    .update(posts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning()
  return result[0]
}
```

### Drizzle config + migrations

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  schema:    './lib/db/schema.ts',
  out:       './supabase/migrations',
  driver:    'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
```

```bash
# Generate migration
npx drizzle-kit generate:pg

# Apply migration
npx drizzle-kit push:pg

# Open studio (visual DB browser)
npx drizzle-kit studio
```

---

## PRISMA + POSTGRESQL {#prisma}

Best for: established teams, complex relations, excellent migration tooling.

```bash
npm install prisma @prisma/client
npx prisma init
```

### Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  EDITOR
  AUTHOR
  VIEWER
}

enum PostStatus {
  DRAFT
  IN_REVIEW
  PUBLISHED
  ARCHIVED
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      UserRole @default(VIEWER)
  avatarUrl String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}

model Post {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  excerpt     String?
  body        String?
  status      PostStatus @default(DRAFT)
  author      User?      @relation(fields: [authorId], references: [id])
  authorId    String?
  publishedAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([slug])
  @@index([status])
  @@index([authorId])
}
```

### Prisma client singleton (Next.js safe)

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## TRPC (NEXT.JS NATIVE) {#trpc}

Best for: end-to-end TypeScript type safety. API types shared between client/server.

```bash
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next
npm install @tanstack/react-query zod
```

### Router setup

```typescript
// server/trpc.ts — base setup
import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Context — runs on every request
export async function createContext(opts?: CreateNextContextOptions) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError
          ? error.cause.flatten() : null,
      },
    }
  },
})

export const router          = t.router
export const publicProcedure = t.procedure

// Auth-protected procedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, user: ctx.user } })
})

// Admin-only procedure
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  const { data: profile } = await ctx.supabase
    .from('users').select('role').eq('id', ctx.user.id).single()
  if (profile?.role !== 'admin')
    throw new TRPCError({ code: 'FORBIDDEN' })
  return next({ ctx: { ...ctx, user: ctx.user } })
})
```

```typescript
// server/routers/posts.ts
import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const postsRouter = router({
  getAll: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10),
                      cursor: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('posts')
        .select('*, author:users(name, avatar_url)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(input.limit)
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data
    }),

  create: protectedProcedure
    .input(z.object({
      title:   z.string().min(3).max(200),
      slug:    z.string().regex(/^[a-z0-9-]+$/),
      excerpt: z.string().max(300).optional(),
      body:    z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('posts')
        .insert({ ...input, author_id: ctx.user.id })
        .select().single()
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data
    }),
})
```

---

## POCKETBASE {#pocketbase}

Best for: MVPs, solo projects, zero-config backends. Single binary, self-hosted.

```bash
# Download PocketBase binary from pocketbase.io
# Start: ./pocketbase serve
npm install pocketbase
```

```typescript
// lib/pocketbase.ts
import PocketBase from 'pocketbase'

// Server-side admin client
export function createPBAdmin() {
  const pb = new PocketBase(process.env.POCKETBASE_URL!)
  pb.autoCancellation(false)
  return pb
}

// Authenticate as admin (for server actions)
export async function getPBAdmin() {
  const pb = createPBAdmin()
  await pb.admins.authWithPassword(
    process.env.POCKETBASE_ADMIN_EMAIL!,
    process.env.POCKETBASE_ADMIN_PASSWORD!
  )
  return pb
}

// Client-side — stores auth in localStorage
let clientPB: PocketBase | null = null
export function getPBClient() {
  if (!clientPB) {
    clientPB = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!)
  }
  return clientPB
}
```

---

## CONVEX {#convex}

Best for: real-time apps. TypeScript-first, no SQL, reactive queries.

```bash
npm install convex
npx convex dev  # starts Convex dev server + syncs schema
```

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    email:     v.string(),
    name:      v.string(),
    role:      v.union(v.literal('admin'), v.literal('user')),
    avatarUrl: v.optional(v.string()),
  }).index('by_email', ['email']),

  posts: defineTable({
    title:     v.string(),
    slug:      v.string(),
    body:      v.optional(v.string()),
    status:    v.union(v.literal('draft'), v.literal('published')),
    authorId:  v.id('users'),
  }).index('by_slug', ['slug'])
    .index('by_author', ['authorId']),
})

// convex/posts.ts — queries and mutations
import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const getPublished = query({
  handler: async (ctx) => {
    return ctx.db.query('posts')
      .withIndex('by_status') // needs status index
      .filter(q => q.eq(q.field('status'), 'published'))
      .collect()
  }
})

export const create = mutation({
  args: { title: v.string(), slug: v.string(), authorId: v.id('users') },
  handler: async (ctx, args) => {
    return ctx.db.insert('posts', { ...args, status: 'draft' })
  }
})
```

---

## EXPRESS.JS / FASTIFY {#express}

Best for: separate API server, mobile backend, complex custom logic.

### Express setup with TypeScript

```typescript
// server/index.ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { errorHandler } from './middleware/errorHandler'
import { authRouter } from './routes/auth'
import { postsRouter } from './routes/posts'

const app = express()

// Security
app.use(helmet())
app.use(cors({
  origin:      process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
  credentials: true,
}))
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  limit:    100,
  message:  { error: 'Too many requests' },
}))

app.use(express.json({ limit: '1mb' }))

// Health check
app.get('/health', (_req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
}))

// Routes
app.use('/api/auth',  authRouter)
app.use('/api/posts', postsRouter)

// Error handler (must be last)
app.use(errorHandler)

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => console.log(`API running on port ${PORT}`))
```

```typescript
// server/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code:  err.code,
    })
  }

  console.error('[Unhandled Error]', err)

  return res.status(500).json({
    error: 'Internal server error',
    code:  'INTERNAL_ERROR',
  })
}
```

### Route with validation

```typescript
// server/routes/posts.ts
import { Router } from 'express'
import { z } from 'zod'
import { AppError } from '../middleware/errorHandler'
import { requireAuth, requireRole } from '../middleware/auth'
import { db } from '../db'

const router = Router()

const createPostSchema = z.object({
  title:   z.string().min(3).max(200),
  slug:    z.string().regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(300).optional(),
  body:    z.string().optional(),
})

router.get('/', async (req, res, next) => {
  try {
    const posts = await db.query.posts.findMany({
      where: (p, { eq }) => eq(p.status, 'published'),
      orderBy: (p, { desc }) => desc(p.publishedAt),
    })
    res.json(posts)
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const parsed = createPostSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR')
    }
    const post = await db.insert(posts).values({
      ...parsed.data,
      authorId: req.user!.id,
    }).returning()
    res.status(201).json(post[0])
  } catch (err) {
    next(err)
  }
})

export { router as postsRouter }
```

---

## FASTAPI / DJANGO {#python}

Best for: Python-first teams, ML/AI integrations, data-heavy backends.

```python
# main.py — FastAPI setup
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
from database import init_db, get_db
from routers import posts, auth, users
from models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()   # create tables on startup
    yield

app = FastAPI(
    title="[PROJECT_NAME] API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",       # Swagger UI
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://[domain].com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,  prefix="/api/auth",  tags=["auth"])
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/health")
async def health():
    return {"status": "ok"}
```

```python
# requirements.txt
fastapi==0.115.0
uvicorn==0.32.0
sqlalchemy==2.0.36
alembic==1.14.0
asyncpg==0.30.0
python-jose==3.3.0
passlib==1.7.4
pydantic==2.10.0
pydantic-settings==2.6.1
httpx==0.27.2
```

---

## NEXT.JS API ROUTES + SERVER ACTIONS {#nextjs-api}

For projects where no separate backend is needed — everything lives in Next.js.

### Server Action pattern (forms, mutations)

```typescript
// server/actions/posts.ts
'use server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const createPostSchema = z.object({
  title:   z.string().min(3).max(200),
  slug:    z.string().regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(300).optional(),
})

export async function createPost(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Validate
  const parsed = createPostSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }
  }

  // Insert
  const { data, error } = await supabase
    .from('posts')
    .insert({ ...parsed.data, author_id: user.id })
    .select()
    .single()

  if (error) {
    console.error('[createPost]', error)
    return { error: 'Failed to create post. Please try again.' }
  }

  // Revalidate affected pages
  revalidatePath('/blog')
  revalidateTag('posts')

  // Redirect to new post
  redirect(`/dashboard/posts/${data.id}`)
}
```

### API Route Handler (REST endpoint)

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit  = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const { data, error, count } = await supabase
      .from('posts')
      .select('*, author:users(name)', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ data, total: count, limit, offset })
  } catch (err) {
    console.error('[GET /api/posts]', err)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    // validate, insert...

    return NextResponse.json({ data: 'created' }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/posts]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

## DATABASE SCHEMA PATTERNS {#schemas}

### SaaS — subscriptions + teams

```sql
-- Subscriptions table (Stripe webhooks update this)
CREATE TABLE subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id   TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan                 TEXT NOT NULL DEFAULT 'free',
  status               TEXT NOT NULL DEFAULT 'active',
  current_period_end   TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Teams / Organisations (multi-tenant)
CREATE TABLE teams (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  plan       TEXT DEFAULT 'free',
  owner_id   UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id  UUID REFERENCES teams(id)  ON DELETE CASCADE,
  user_id  UUID REFERENCES users(id)  ON DELETE CASCADE,
  role     TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);
```

### Stripe webhook handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body, signature, process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await supabaseAdmin.from('subscriptions').upsert({
          stripe_subscription_id: sub.id,
          stripe_customer_id:     sub.customer as string,
          status:                 sub.status,
          plan:                   sub.items.data[0]?.price.lookup_key ?? 'free',
          current_period_end:     new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end:   sub.cancel_at_period_end,
          updated_at:             new Date().toISOString(),
        })
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabaseAdmin.from('subscriptions')
          .update({ status: 'canceled', plan: 'free' })
          .eq('stripe_subscription_id', sub.id)
        break
      }
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Stripe webhook handler]', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}

// Stripe requires raw body — disable body parser
export const config = { api: { bodyParser: false } }
```

---

## SERVER ACTIONS ARCHITECTURE {#actions}

```
server/
├── actions/               ← All 'use server' mutations
│   ├── auth.ts            ← sign-in, sign-up, sign-out
│   ├── posts.ts           ← create, update, delete, publish
│   ├── users.ts           ← update profile, change role
│   ├── uploads.ts         ← file upload to Supabase Storage
│   └── stripe.ts          ← create checkout session, portal
├── queries/               ← Read-only data fetching (Server Components)
│   ├── posts.ts
│   ├── users.ts
│   └── subscriptions.ts
└── services/              ← Business logic (called by actions + queries)
    ├── email.ts           ← Resend email sending
    ├── stripe.ts          ← Stripe SDK calls
    └── storage.ts         ← File processing before upload
```

---

## API ROUTE ORGANISATION {#routes}

```
app/api/
├── auth/
│   ├── callback/route.ts         ← OAuth callback (Supabase / Auth.js)
│   └── signout/route.ts          ← Sign out + clear cookies
├── posts/
│   ├── route.ts                  ← GET (list), POST (create)
│   └── [id]/route.ts             ← GET, PUT, DELETE single post
├── users/
│   ├── route.ts                  ← GET all users (admin)
│   └── [id]/route.ts             ← GET, PUT, DELETE single user
├── webhooks/
│   ├── stripe/route.ts           ← Stripe payment events
│   ├── clerk/route.ts            ← Clerk user sync events
│   └── cms/route.ts              ← CMS publish → ISR revalidation
├── upload/route.ts               ← File upload proxy → Supabase Storage
├── revalidate/route.ts           ← Manual ISR revalidation (secret-gated)
└── health/route.ts               ← Uptime check endpoint
```

---

## STRIPE PAYMENTS — FULL INTEGRATION {#stripe}

> Add to Phase 4B when user confirms payments/subscriptions are needed.
> Always ask: "Does this project need payments?" — do not assume.

### Decision first

```
One-time payments  → Stripe Payment Links OR Checkout Session
Subscriptions      → Stripe Checkout → Billing Portal → Webhooks
Marketplace        → Stripe Connect (out of scope for this skill — flag it)
Usage-based        → Stripe Metered Billing (complex — flag it)
```

### Install

```bash
npm install stripe @stripe/stripe-js
```

```env
STRIPE_PUBLISHABLE_KEY=pk_test_...     # safe to expose (client-side)
STRIPE_SECRET_KEY=sk_test_...          # server only — never expose
STRIPE_WEBHOOK_SECRET=whsec_...        # from: stripe listen --forward-to localhost:3000/...
STRIPE_PRICE_ID_PRO=price_...          # from Stripe dashboard → Products
STRIPE_PRICE_ID_TEAM=price_...
```

### Stripe client singleton

```typescript
// lib/stripe/client.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript:  true,
})

// Plan definitions — map price IDs to features
export const PLANS = {
  free: {
    name:       'Free',
    priceId:    null,
    price:      0,
    features:   ['5 projects', 'Basic templates', 'Community support'],
    limits:     { projects: 5, teamMembers: 1 },
  },
  pro: {
    name:       'Pro',
    priceId:    process.env.STRIPE_PRICE_ID_PRO!,
    price:      2900,   // cents ($29/mo)
    features:   ['Unlimited projects', 'All templates', 'Priority support'],
    limits:     { projects: Infinity, teamMembers: 5 },
  },
  team: {
    name:       'Team',
    priceId:    process.env.STRIPE_PRICE_ID_TEAM!,
    price:      7900,   // cents ($79/mo)
    features:   ['Everything in Pro', 'Team management', 'SSO'],
    limits:     { projects: Infinity, teamMembers: Infinity },
  },
} as const

export type PlanKey = keyof typeof PLANS
```

### Checkout Session — Server Action

```typescript
// server/actions/stripe.ts
'use server'
import { redirect } from 'next/navigation'
import { stripe, PLANS } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export async function createCheckoutSession(planKey: 'pro' | 'team') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const plan = PLANS[planKey]
  if (!plan.priceId) throw new Error('Invalid plan')

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id, email, name')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email!,
      name:  profile?.name ?? undefined,
      metadata: { supabase_uid: user.id },
    })
    customerId = customer.id

    // Save customer ID immediately
    await supabase.from('users').update({
      stripe_customer_id: customerId
    }).eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer:             customerId,
    mode:                 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price:    plan.priceId,
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?success=true`,
    cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?cancelled=true`,
    subscription_data: {
      metadata: { supabase_uid: user.id },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  })

  if (!session.url) throw new Error('Failed to create checkout session')
  redirect(session.url)
}

export async function createBillingPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('users').select('stripe_customer_id').eq('id', user.id).single()

  if (!profile?.stripe_customer_id) redirect('/pricing')

  const session = await stripe.billingPortal.sessions.create({
    customer:   profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`,
  })

  redirect(session.url)
}
```

### Webhook handler — complete subscription sync

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

// Stripe requires raw body — no JSON parsing
export const runtime = 'nodejs'

async function upsertSubscription(sub: Stripe.Subscription) {
  const uid = sub.metadata?.supabase_uid
  if (!uid) return

  const priceId = sub.items.data[0]?.price.id
  const plan = Object.entries({
    [process.env.STRIPE_PRICE_ID_PRO  ?? '']: 'pro',
    [process.env.STRIPE_PRICE_ID_TEAM ?? '']: 'team',
  }).find(([id]) => id === priceId)?.[1] ?? 'free'

  await supabaseAdmin.from('subscriptions').upsert({
    user_id:                uid,
    stripe_customer_id:     sub.customer as string,
    stripe_subscription_id: sub.id,
    plan,
    status:                 sub.status,
    current_period_end:     new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end:   sub.cancel_at_period_end,
    updated_at:             new Date().toISOString(),
  }, { onConflict: 'user_id' })
}

export async function POST(request: NextRequest) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[Stripe] Webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      // New subscription or upgrade/downgrade
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await upsertSubscription(event.data.object as Stripe.Subscription)
        break

      // Subscription cancelled (at period end or immediately)
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabaseAdmin.from('subscriptions')
          .update({ status: 'canceled', plan: 'free', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // Payment failed — update status, trigger dunning email
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId   = invoice.subscription as string
        await supabaseAdmin.from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subId)
        // TODO: send dunning email via Resend
        break
      }

      // Payment succeeded — ensure status is active
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subId   = invoice.subscription as string
        if (subId) {
          await supabaseAdmin.from('subscriptions')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subId)
        }
        break
      }

      // Checkout completed — customer may have been created
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Session
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await upsertSubscription(sub)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Stripe] Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}
```

### Pricing page component

```tsx
// app/(marketing)/pricing/page.tsx
import { createCheckoutSession } from '@/server/actions/stripe'
import { PLANS } from '@/lib/stripe/client'

export default function PricingPage() {
  return (
    <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
      <h1>Simple, transparent pricing</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
                    gap: '2rem', maxWidth: '1000px', margin: '4rem auto' }}>
        {Object.entries(PLANS).map(([key, plan]) => (
          <div key={key} style={{
            border:       '1px solid var(--color-border)',
            borderRadius: '12px',
            padding:      '2rem',
            background:   key === 'pro' ? 'var(--color-surface)' : 'transparent',
          }}>
            <h2>{plan.name}</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '1rem 0' }}>
              {plan.price === 0 ? 'Free' : `$${plan.price / 100}/mo`}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0' }}>
              {plan.features.map(f => <li key={f} style={{ marginBottom: '0.5rem' }}>✓ {f}</li>)}
            </ul>
            {plan.priceId ? (
              <form action={createCheckoutSession.bind(null, key as 'pro' | 'team')}>
                <button type="submit" style={{
                  width:         '100%',
                  padding:       '0.875rem',
                  background:    'var(--color-accent)',
                  color:         'var(--color-bg)',
                  border:        'none',
                  borderRadius:  '8px',
                  fontSize:      '1rem',
                  fontWeight:    600,
                  cursor:        'pointer',
                }}>
                  Get started
                </button>
              </form>
            ) : (
              <a href="/sign-up" style={{
                display:       'block',
                width:         '100%',
                padding:       '0.875rem',
                border:        '1px solid var(--color-border)',
                borderRadius:  '8px',
                textDecoration:'none',
                color:         'var(--color-text)',
              }}>
                Start free
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
```

### Billing dashboard — customer portal button

```tsx
// app/(dashboard)/billing/page.tsx
import { createBillingPortalSession } from '@/server/actions/stripe'
import { createClient } from '@/lib/supabase/server'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end, cancel_at_period_end')
    .single()

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1>Billing</h1>

      <div style={{ background: 'var(--color-surface)', borderRadius: '12px',
                    padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>Current plan</p>
            <p style={{ margin: '0.25rem 0 0', textTransform: 'capitalize',
                        color: 'var(--color-accent)', fontSize: '1.25rem' }}>
              {subscription?.plan ?? 'free'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Status: {subscription?.status ?? 'active'}
            </p>
            {subscription?.current_period_end && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem',
                          color: 'var(--color-text-muted)' }}>
                Renews {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {subscription?.cancel_at_period_end && (
          <p style={{ color: '#f59e0b', marginTop: '1rem', fontSize: '0.875rem' }}>
            ⚠ Your subscription will cancel at the end of the billing period.
          </p>
        )}
      </div>

      <form action={createBillingPortalSession} style={{ marginTop: '1.5rem' }}>
        <button type="submit" style={{
          padding:      '0.875rem 2rem',
          border:       '1px solid var(--color-border)',
          borderRadius: '8px',
          background:   'transparent',
          color:        'var(--color-text)',
          cursor:       'pointer',
          fontSize:     '1rem',
        }}>
          Manage subscription →
        </button>
      </form>
    </div>
  )
}
```

### Check subscription in Server Components

```typescript
// lib/stripe/subscription.ts
import { createClient } from '@/lib/supabase/server'
import { PLANS, type PlanKey } from './client'

export async function getUserPlan(): Promise<PlanKey> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'

  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .single()

  // Only count active or trialing subscriptions
  if (data?.status === 'active' || data?.status === 'trialing') {
    return (data.plan as PlanKey) ?? 'free'
  }

  return 'free'
}

export async function requirePlan(minimumPlan: PlanKey) {
  const userPlan  = await getUserPlan()
  const planOrder = ['free', 'pro', 'team'] as const
  const hasAccess = planOrder.indexOf(userPlan) >= planOrder.indexOf(minimumPlan)

  if (!hasAccess) {
    // Redirect to upgrade page
    const { redirect } = await import('next/navigation')
    redirect(`/pricing?upgrade=${minimumPlan}`)
  }
}

// Usage in a Server Component:
// await requirePlan('pro')  ← redirects to /pricing if user is on free
```

### Local testing with Stripe CLI

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
stripe trigger invoice.payment_failed

# Test checkout (creates real test session)
# Use card: 4242 4242 4242 4242 / any future date / any CVC
```

### Stripe Phase 4B checklist addition

When Phase 4B detects payments are needed, add to Backend Decision Record:
```
PAYMENTS: [Stripe Checkout | Stripe Payment Links | none]
BILLING:  [Subscriptions | One-time | Usage-based | none]
PLANS:    [list plan names and prices]
```
