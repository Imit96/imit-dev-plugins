# Cinematic Web — Auth Layer

## TABLE OF CONTENTS
1. [Auth Decision Matrix](#matrix)
2. [Phase 4C — Auth Interview](#interview)
3. [Clerk — Best DX, Multi-tenant](#clerk)
4. [Supabase Auth — Free, Built-in](#supabase)
5. [Auth.js v5 — Open Source, Flexible](#authjs)
6. [Lucia Auth — Lightweight, Full Control](#lucia)
7. [Firebase Auth](#firebase)
8. [Route Protection Patterns](#protection)
9. [Role-Based Access Control (RBAC)](#rbac)
10. [Auth Checklist](#checklist)

---

## AUTH DECISION MATRIX {#matrix}

```
CONDITION                        RECOMMENDED    WHY
──────────────────────────────────────────────────────────────────
Using Supabase backend           Supabase Auth  Built-in, free, RLS-native
Need multi-tenant / orgs         Clerk          Org management built-in
Budget = zero                    Supabase Auth  Free up to 50k MAU
Need social login fast           Clerk          Drop-in UI components
Full control over session        Auth.js v5     Open source, any DB adapter
Minimal dependency footprint     Lucia          No magic, clear code
Already on Firebase              Firebase Auth  Same ecosystem
Python backend                   Supabase Auth  Works with any frontend
Need SMS / MFA out of box        Clerk          Best MFA support
```

---

## PHASE 4C — AUTH INTERVIEW {#interview}

Run this if user answered YES to "will users need to log in?"

```
AUTH QUESTIONS:

1. What sign-in methods do you need?
   [ ] Email + password
   [ ] Magic link (passwordless)
   [ ] Google / GitHub / Apple (social)
   [ ] Phone / SMS
   [ ] SSO / SAML (enterprise)

2. Do you need user organisations or teams?
   (multiple users sharing a workspace / account)
   YES → Clerk (org management built-in, free)
   NO  → any provider

3. Do you need user roles beyond admin/user?
   (e.g. admin, editor, manager, viewer, API-only)
   YES → build custom roles table + RLS
   NO  → provider-level roles are sufficient

4. Do you need to show/hide UI based on login state?
   YES → always (answered by session detection in layout)

5. Where do users go after login?
   Dashboard → /dashboard
   Previous page → redirectTo param
   Onboarding flow → /onboarding (if new user)

6. Is this app invite-only or open registration?
   Open  → normal sign-up flow
   Invite-only → disable sign-up, send invite emails

7. Do you need a user profile / settings page?
   YES → /account page with update form
```

**After interview — output the Auth Decision Record:**
```
╔══════════════════════════════════════════════════╗
║  AUTH DECISION RECORD                           ║
╠══════════════════════════════════════════════════╣
║ PROVIDER:     [Clerk | Supabase | Auth.js | ...]║
║ METHODS:      [email | magic-link | google | ...] ║
║ ORGS/TEAMS:   [Yes | No]                        ║
║ ROLES:        [admin/user | custom RBAC]         ║
║ POST-LOGIN:   [/dashboard | /onboarding | /]     ║
║ REGISTRATION: [open | invite-only]              ║
╚══════════════════════════════════════════════════╝
```

---

## CLERK — BEST DX, MULTI-TENANT {#clerk}

**Cost:** Free up to 10k MAU. $25/mo after. Orgs included free.
**Use when:** SaaS product, teams/orgs needed, want fastest setup.

```bash
npm install @clerk/nextjs
```

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### Middleware — protect routes

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/blog(.*)',
  '/api/webhooks(.*)',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Public routes — no auth needed
  if (isPublicRoute(req)) return

  // Admin routes — check role
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth()
    if (sessionClaims?.metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // All other routes — require auth
  await auth.protect()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### Root layout — ClerkProvider

```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
```

### Sign-in and sign-up pages

```tsx
// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
    }}>
      <SignIn
        appearance={{
          elements: {
            card:            { background: 'var(--glass-bg)',
                               backdropFilter: 'blur(16px)',
                               border: '1px solid var(--glass-border)' },
            headerTitle:     { color: 'var(--color-text)' },
            socialButtonsBlockButton: { border: '1px solid var(--color-border)' },
          },
        }}
      />
    </main>
  )
}

// app/(auth)/sign-up/[[...sign-up]]/page.tsx — same pattern with <SignUp />
```

### Get user in Server Components

```typescript
// Server Component
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()

  return <div>Hello {user?.firstName}</div>
}
```

### Get user in Client Components

```tsx
'use client'
import { useUser, useAuth, SignOutButton } from '@clerk/nextjs'

export function UserNav() {
  const { user, isLoaded } = useUser()
  const { signOut } = useAuth()

  if (!isLoaded) return <div className="nav-skeleton" />

  return (
    <div>
      <img src={user?.imageUrl} alt={user?.fullName ?? ''} />
      <span>{user?.emailAddresses[0]?.emailAddress}</span>
      <SignOutButton>
        <button>Sign out</button>
      </SignOutButton>
    </div>
  )
}
```

### Sync Clerk users to your database (webhook)

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const headerPayload = await headers()
  const svixId        = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body    = JSON.stringify(payload)

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  let event: WebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id':        svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  switch (event.type) {
    case 'user.created': {
      await supabaseAdmin.from('users').insert({
        id:         event.data.id,
        email:      event.data.email_addresses[0]?.email_address,
        name:       `${event.data.first_name} ${event.data.last_name}`.trim(),
        avatar_url: event.data.image_url,
        role:       'viewer',
      })
      break
    }
    case 'user.updated': {
      await supabaseAdmin.from('users').update({
        name:       `${event.data.first_name} ${event.data.last_name}`.trim(),
        avatar_url: event.data.image_url,
        updated_at: new Date().toISOString(),
      }).eq('id', event.data.id)
      break
    }
    case 'user.deleted': {
      if (event.data.id) {
        await supabaseAdmin.from('users').delete().eq('id', event.data.id)
      }
      break
    }
  }

  return new Response('OK', { status: 200 })
}
```

---

## SUPABASE AUTH — FREE, BUILT-IN {#supabase}

**Cost:** Free up to 50k MAU. Best when already using Supabase DB.

### Sign-up / Sign-in — Server Actions

```typescript
// server/actions/auth.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signUpSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name:     z.string().min(2, 'Name required'),
})

export async function signUp(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const parsed = signUpSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { email, password, name } = parsed.data

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },                          // stored in auth.users.raw_user_meta_data
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) return { error: { form: error.message } }

  // Create profile in public.users table
  if (data.user) {
    await supabase.from('users').insert({
      id:    data.user.id,
      email: email,
      name:  name,
      role:  'viewer',
    })
  }

  return { success: 'Check your email to confirm your account.' }
}

export async function signIn(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email:    formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: 'Invalid email or password' }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (error) return { error: error.message }
  if (data.url) redirect(data.url)
}
```

### Auth callback route

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code         = searchParams.get('code')
  const redirectTo   = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${redirectTo}`)
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
}
```

### Get user — server and client patterns

```typescript
// Server Component — get authenticated user
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) redirect('/sign-in')

  // Get full profile from public.users
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return <div>Hello {profile?.name}</div>
}
```

```tsx
// Client Component — use hook
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

---

## AUTH.JS V5 — OPEN SOURCE, FLEXIBLE {#authjs}

**Cost:** Free. Open source. Works with any database adapter.
**Use when:** Want full control, no vendor lock-in, complex auth flows.

```bash
npm install next-auth@beta @auth/drizzle-adapter
# or: @auth/prisma-adapter @auth/supabase-adapter
```

```typescript
// auth.ts — central Auth.js config
import NextAuth from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Resend from 'next-auth/providers/resend'
import { db } from '@/lib/db'
import { users, sessions, accounts, verificationTokens } from '@/lib/db/schema'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable:              users,
    sessionsTable:           sessions,
    accountsTable:           accounts,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId:     process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from:   process.env.FROM_EMAIL!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      // Include role in session so client can access it
      session.user.id   = user.id
      session.user.role = (user as any).role ?? 'viewer'
      return session
    },
  },
  pages: {
    signIn:  '/sign-in',
    signOut: '/sign-out',
    error:   '/auth/error',
  },
})
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

```typescript
// middleware.ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn    = !!req.auth
  const isProtected   = req.nextUrl.pathname.startsWith('/dashboard')

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl))
  }
})

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] }
```

---

## LUCIA AUTH — LIGHTWEIGHT, FULL CONTROL {#lucia}

**Cost:** Free. No magic. You write the session logic.
**Use when:** Learning, full control needed, specific custom requirements.

```bash
npm install lucia arctic   # arctic = OAuth providers for Lucia
```

```typescript
// lib/auth/lucia.ts
import { Lucia } from 'lucia'
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle'
import { db } from '@/lib/db'
import { sessions, users } from '@/lib/db/schema'

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  },
  getUserAttributes: (attrs) => ({
    email: attrs.email,
    name:  attrs.name,
    role:  attrs.role,
  }),
})

// lib/auth/session.ts — read session in Server Components
import { cookies } from 'next/headers'
import { cache } from 'react'

export const validateRequest = cache(async () => {
  const cookieStore = await cookies()
  const sessionId   = cookieStore.get(lucia.sessionCookieName)?.value ?? null

  if (!sessionId) return { user: null, session: null }

  const { user, session } = await lucia.validateSession(sessionId)

  try {
    const cookieStoreWrite = await cookies()
    if (session?.fresh) {
      cookieStoreWrite.set(
        lucia.sessionCookieName,
        lucia.createSessionCookie(session.id).serialize(),
        { httpOnly: true, secure: true, sameSite: 'lax', path: '/' }
      )
    }
    if (!session) {
      cookieStoreWrite.set(
        lucia.sessionCookieName,
        lucia.createBlankSessionCookie().serialize(),
        { httpOnly: true, secure: true, sameSite: 'lax', path: '/' }
      )
    }
  } catch { /* can't set cookies in read-only contexts */ }

  return { user, session }
})
```

---

## FIREBASE AUTH {#firebase}

**Cost:** Free (generous limits). Google ecosystem.

```bash
npm install firebase firebase-admin
```

```typescript
// lib/firebase/client.ts
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

const app  = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)

// lib/firebase/admin.ts — server-side
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'

const adminApp = getApps().length
  ? getApps()[0]!
  : initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK!)) })

export const adminAuth = getAdminAuth(adminApp)
```

---

## ROUTE PROTECTION PATTERNS {#protection}

### Next.js App Router — route groups for access control

```
app/
├── (public)/               ← No auth required
│   ├── layout.tsx          ← Public layout (nav with sign-in button)
│   ├── page.tsx            ← Landing / homepage
│   ├── blog/
│   └── pricing/
│
├── (auth)/                 ← Auth pages (redirect if already signed in)
│   ├── layout.tsx          ← Redirect to /dashboard if authed
│   ├── sign-in/
│   └── sign-up/
│
├── (dashboard)/            ← Protected — requires auth
│   ├── layout.tsx          ← Auth check + dashboard shell
│   ├── dashboard/page.tsx
│   ├── account/page.tsx
│   └── settings/page.tsx
│
└── (admin)/                ← Protected — requires admin role
    ├── layout.tsx          ← Auth check + role check
    └── admin/
        ├── users/page.tsx
        └── posts/page.tsx
```

### Dashboard layout — server-side auth check

```tsx
// app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) redirect('/sign-in?redirectTo=/dashboard')

  const { data: profile } = await supabase
    .from('users')
    .select('name, role, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="dashboard-shell">
      <DashboardNav user={{ ...user, ...profile }} />
      <main className="dashboard-main">{children}</main>
    </div>
  )
}
```

### Admin layout — role check

```tsx
// app/(admin)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return <>{children}</>
}
```

---

## ROLE-BASED ACCESS CONTROL (RBAC) {#rbac}

### Frontend — hide UI based on role

```tsx
// components/auth/RoleGate.tsx
'use client'

type Role = 'admin' | 'editor' | 'author' | 'viewer'

const ROLE_HIERARCHY: Record<Role, number> = {
  admin:  4,
  editor: 3,
  author: 2,
  viewer: 1,
}

interface RoleGateProps {
  children: React.ReactNode
  minimumRole: Role
  userRole?: Role
  fallback?: React.ReactNode
}

export function RoleGate({
  children,
  minimumRole,
  userRole = 'viewer',
  fallback = null,
}: RoleGateProps) {
  const hasAccess = ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Usage:
// <RoleGate minimumRole="editor" userRole={user.role}>
//   <DeleteButton />
// </RoleGate>
```

### Backend — permission check utility

```typescript
// lib/auth/permissions.ts
type Role     = 'admin' | 'editor' | 'author' | 'viewer'
type Resource = 'posts' | 'users' | 'media' | 'settings'
type Action   = 'create' | 'read' | 'update' | 'delete' | 'publish'

const PERMISSIONS: Record<Role, Partial<Record<Resource, Action[]>>> = {
  admin: {
    posts:    ['create', 'read', 'update', 'delete', 'publish'],
    users:    ['create', 'read', 'update', 'delete'],
    media:    ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update'],
  },
  editor: {
    posts:    ['create', 'read', 'update', 'publish'],
    users:    ['read'],
    media:    ['create', 'read', 'update'],
    settings: ['read'],
  },
  author: {
    posts:    ['create', 'read', 'update'],
    media:    ['create', 'read'],
  },
  viewer: {
    posts: ['read'],
    media: ['read'],
  },
}

export function can(role: Role, resource: Resource, action: Action): boolean {
  return PERMISSIONS[role]?.[resource]?.includes(action) ?? false
}

// In Server Action:
// if (!can(userRole, 'posts', 'publish')) throw new Error('Forbidden')
```

---

## AUTH CHECKLIST {#checklist}

```
SETUP
[ ] Provider configured (Clerk / Supabase / Auth.js / Lucia)
[ ] Environment variables set (.env.example updated)
[ ] Callback URL configured in provider dashboard
[ ] Webhook endpoint configured (Clerk sync / Supabase hooks)

MIDDLEWARE
[ ] middleware.ts created at project root (not in app/)
[ ] Protected routes listed and tested
[ ] Admin routes separately protected with role check
[ ] Redirect to sign-in includes ?redirectTo for post-auth UX

ROUTE GROUPS
[ ] (public) group — marketing pages
[ ] (auth) group — sign-in, sign-up (redirects if already authed)
[ ] (dashboard) group — server-side auth check in layout
[ ] (admin) group — server-side role check in layout

DATABASE SYNC
[ ] User created in public.users on sign-up
[ ] User updated on profile change
[ ] Webhook verified with secret (Clerk svix / Supabase JWT)

FRONTEND
[ ] Sign-in / sign-up pages on-brand (using brand palette)
[ ] Loading state while auth state resolves
[ ] Signed-in nav vs signed-out nav
[ ] Profile/account page at /account
[ ] Sign-out button clears session and redirects to /

SECURITY
[ ] Passwords hashed (built-in to Clerk / Supabase)
[ ] Sessions expire (configure session duration)
[ ] CSRF protected (built-in to Auth.js, manual for Supabase)
[ ] Rate limit on sign-in endpoint (Upstash)
[ ] Email verification required before dashboard access
[ ] Sensitive operations require re-authentication

RBAC
[ ] Role stored in database + session
[ ] RoleGate component used for UI-level hiding
[ ] Server Actions check role before mutations
[ ] API routes check role before sensitive operations
[ ] Supabase RLS uses auth.uid() for row-level protection
```
