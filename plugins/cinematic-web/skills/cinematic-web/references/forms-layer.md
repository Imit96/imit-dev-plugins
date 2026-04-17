# Cinematic Web — Forms Layer

## TABLE OF CONTENTS
1. [Form Service Selection](#selection)
2. [Resend API — Transactional Email](#resend)
3. [Zod Validation Schemas](#zod)
4. [Spam Protection — Honeypot + Rate Limiting](#spam)
5. [Server Actions — Next.js](#actions)
6. [Form UI — Per Paradigm](#ui)
7. [Form Types — Contact / Waitlist / Newsletter](#types)
8. [Formspree + Netlify Forms (no-code options)](#nocode)
9. [Form Testing Checklist](#testing)

---

## FORM SERVICE SELECTION {#selection}

Ask user in Phase 4:

```
How should form submissions be handled?

A) Resend API — transactional email (recommended, $0 free tier)
   → Full control, beautiful emails, great DX
B) Formspree — no backend needed ($0 free, 50 submissions/mo)
   → Dead simple, works with any framework
C) Netlify Forms — zero config if hosting on Netlify
   → Free 100 submissions/mo, spam filtering built in
D) Custom backend (Express / FastAPI) — you handle everything

Register:
  Resend:    resend.com (100 emails/day free)
  Formspree: formspree.io (free tier)
```

---

## RESEND API — TRANSACTIONAL EMAIL {#resend}

### Setup
```bash
npm install resend zod @upstash/ratelimit @upstash/redis
```

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
TO_EMAIL=hello@yourdomain.com
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Email Templates
```typescript
// lib/email/templates.ts
export function contactEmailHtml(data: {
  name: string; email: string; message: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <title>New Contact Form Submission</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .card { background: #fff; border-radius: 8px; padding: 32px; max-width: 560px; margin: 0 auto; }
        .label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .value { font-size: 16px; color: #111; margin-bottom: 24px; line-height: 1.5; }
        .accent { color: [BRAND_ACCENT]; }
        .footer { font-size: 12px; color: #aaa; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1 style="font-size:20px;margin:0 0 24px">
          New message from <span class="accent">[BRAND_NAME]</span>
        </h1>
        <div class="label">Name</div>
        <div class="value">${data.name}</div>
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
        <div class="label">Message</div>
        <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
        <div class="footer">Sent via [BRAND_NAME] contact form</div>
      </div>
    </body>
    </html>
  `;
}

export function confirmationEmailHtml(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: system-ui, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .card { background: #fff; border-radius: 8px; padding: 32px; max-width: 560px; margin: 0 auto; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1 style="font-size:20px">Thanks, ${name}! 👋</h1>
        <p>We received your message and will get back to you within 1–2 business days.</p>
        <p style="color:#888;font-size:14px">— The [BRAND_NAME] team</p>
      </div>
    </body>
    </html>
  `;
}
```

---

## ZOD VALIDATION SCHEMAS {#zod}

```typescript
// lib/validations/forms.ts
import { z } from 'zod';

// ── Contact Form ────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  subject: z
    .string()
    .min(4, 'Subject must be at least 4 characters')
    .max(200, 'Subject is too long')
    .optional(),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message is too long (max 2000 characters)')
    .trim(),
  // Honeypot — must be empty
  website: z.string().max(0, 'Bot detected').optional(),
});

// ── Waitlist Form ───────────────────────────────────────────────
export const waitlistSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  name: z.string().min(1).max(100).trim().optional(),
  role: z.enum(['founder', 'developer', 'designer', 'marketer', 'other']).optional(),
  website: z.string().max(0).optional(), // honeypot
});

// ── Newsletter Form ─────────────────────────────────────────────
export const newsletterSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  website: z.string().max(0).optional(), // honeypot
});

// Type exports
export type ContactFormData = z.infer<typeof contactSchema>;
export type WaitlistFormData = z.infer<typeof waitlistSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
```

---

## SPAM PROTECTION {#spam}

### Honeypot Field
```tsx
// Always include in every form — hidden from real users, filled by bots
<div aria-hidden="true" style={{ display: 'none' }}>
  <label htmlFor="website">Website (leave blank)</label>
  <input
    type="text"
    id="website"
    name="website"
    tabIndex={-1}
    autoComplete="off"
  />
</div>
```

### Rate Limiting — Upstash Redis
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 3 submissions per IP per 10 minutes
export const formRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  analytics: true,
  prefix: 'form_submit',
});

// Usage in API route / Server Action:
// const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
// const { success, reset } = await formRateLimit.limit(ip);
// if (!success) return rateLimitResponse(reset);
```

### Rate Limit Response Helper
```typescript
export function rateLimitResponse(reset: number) {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  return Response.json(
    { error: 'Too many submissions. Please try again in a few minutes.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}
```

**Rate limiting — choose based on budget:**

```
budget = zero   → Option A: Upstash free tier (10k commands/day — enough for most contact forms)
                  Option B: Vercel KV free tier (if on Vercel)
                  Option C: In-memory map (single instance only — serverless-unsafe, dev only)
budget = micro+ → Upstash Pay-as-you-go ($0.20 per 100k commands)
```

**Option A — Upstash free tier (recommended free option, production-safe):**
```typescript
// Upstash free: 10k commands/day, 256MB — sign up free at upstash.com (no card needed)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis }     from '@upstash/redis';

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const formRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'), // 3 submissions per 10 minutes per IP
  analytics: false,  // disable to save command quota on free tier
});
```

**Option B — Vercel KV (free if deployed on Vercel):**
```typescript
import { kv } from '@vercel/kv';

export async function checkRateLimit(ip: string, max = 3, windowMs = 600_000) {
  const key   = `rate:contact:${ip}`
  const now   = Date.now()
  const count = await kv.incr(key)

  if (count === 1) await kv.pexpire(key, windowMs) // set expiry only on first hit

  return { allowed: count <= max, remaining: Math.max(0, max - count) }
}
```

**Option C — In-memory (zero cost, zero setup, but resets on cold start):**
Only use for: local development OR single-instance deployments (VPS, not serverless).
```typescript
// lib/rate-limit-memory.ts — NOT safe for serverless (Vercel, Netlify functions)
// Each serverless invocation is isolated — shared state does not persist
const attempts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(ip: string, max = 3, windowMs = 600_000): boolean {
  const now  = Date.now()
  const data = attempts.get(ip)

  if (!data || now > data.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  data.count++
  return data.count <= max
}
// ⚠ Zero-budget serverless alternative: use Upstash free tier instead
```

---

## SERVER ACTIONS — NEXT.JS {#actions}

```typescript
// app/actions/contact.ts
'use server';

import { contactSchema } from '@/lib/validations/forms';
import { Resend } from 'resend';
import { formRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { contactEmailHtml, confirmationEmailHtml } from '@/lib/email/templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export type ContactFormState = {
  status: 'idle' | 'success' | 'error' | 'rate_limited';
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {

  // 1. Rate limit check (Next.js 15: headers() is async — must await)
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim()
          ?? headersList.get('x-real-ip')
          ?? 'anonymous';
  const { success: withinLimit, reset } = await formRateLimit.limit(ip);
  if (!withinLimit) {
    return {
      status: 'rate_limited',
      message: `Too many submissions. Try again in ${Math.ceil((reset - Date.now()) / 1000 / 60)} minutes.`,
    };
  }

  // 2. Parse and validate
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please fix the errors below.',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, message, subject } = parsed.data;

  // 3. Honeypot check (already validated in Zod but double-check)
  if (raw.website) {
    // Silently succeed to not reveal bot detection
    return { status: 'success', message: "Thanks! We'll be in touch soon." };
  }

  try {
    // 4. Send notification to team
    await resend.emails.send({
      from:    process.env.FROM_EMAIL!,
      to:      process.env.TO_EMAIL!,
      subject: `[${subject ?? 'Contact'}] from ${name}`,
      html:    contactEmailHtml({ name, email, message }),
      replyTo: email,
    });

    // 5. Send confirmation to user
    await resend.emails.send({
      from:    process.env.FROM_EMAIL!,
      to:      email,
      subject: "We got your message!",
      html:    confirmationEmailHtml(name),
    });

    return { status: 'success', message: "Thanks! We'll be in touch soon." };

  } catch (err) {
    console.error('Contact form error:', err);
    return {
      status: 'error',
      message: 'Something went wrong. Please try again or email us directly.',
    };
  }
}
```

### Form Component (React)
```tsx
// components/forms/ContactForm.tsx
'use client';
import { useActionState, useRef } from 'react';
import { submitContactForm, type ContactFormState } from '@/app/actions/contact';

const initial: ContactFormState = { status: 'idle', message: '' };

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitContactForm, initial);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset form on success
  if (state.status === 'success' && formRef.current) {
    formRef.current.reset();
  }

  return (
    <form ref={formRef} action={action} noValidate aria-label="Contact form">

      {/* Status announcer for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {state.message}
      </div>

      {/* Success state */}
      {state.status === 'success' && (
        <div role="alert" className="form-success">
          <p>{state.message}</p>
        </div>
      )}

      {/* Error summary */}
      {state.status === 'error' && !state.errors && (
        <div role="alert" className="form-error-banner">
          <p>{state.message}</p>
        </div>
      )}

      {/* Name */}
      <div className="field-group">
        <label htmlFor="name">
          Name <span aria-hidden="true" className="required">*</span>
        </label>
        <input
          type="text" id="name" name="name"
          required aria-required="true"
          aria-invalid={!!state.errors?.name}
          aria-describedby={state.errors?.name ? 'name-error' : undefined}
          autoComplete="name"
        />
        {state.errors?.name && (
          <span id="name-error" role="alert" className="field-error">
            {state.errors.name[0]}
          </span>
        )}
      </div>

      {/* Email */}
      <div className="field-group">
        <label htmlFor="email">
          Email <span aria-hidden="true" className="required">*</span>
        </label>
        <input
          type="email" id="email" name="email"
          required aria-required="true"
          aria-invalid={!!state.errors?.email}
          aria-describedby={state.errors?.email ? 'email-error' : undefined}
          autoComplete="email"
        />
        {state.errors?.email && (
          <span id="email-error" role="alert" className="field-error">
            {state.errors.email[0]}
          </span>
        )}
      </div>

      {/* Message */}
      <div className="field-group">
        <label htmlFor="message">
          Message <span aria-hidden="true" className="required">*</span>
        </label>
        <textarea
          id="message" name="message" rows={5}
          required aria-required="true"
          aria-invalid={!!state.errors?.message}
          aria-describedby={state.errors?.message ? 'message-error' : 'message-hint'}
        />
        <span id="message-hint" className="field-hint">Minimum 20 characters</span>
        {state.errors?.message && (
          <span id="message-error" role="alert" className="field-error">
            {state.errors.message[0]}
          </span>
        )}
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" style={{ display: 'none' }}>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" disabled={pending} aria-busy={pending} data-magnetic="0.3">
        {pending ? 'Sending...' : 'Send Message'}
      </button>

    </form>
  );
}
```

---

## FORM UI — PER PARADIGM {#ui}

```css
/* ── Base form variables (all paradigms use these) ─────────── */
:root {
  --form-radius:    8px;
  --form-border:    1px solid var(--color-border);
  --form-focus:     2px solid var(--color-accent);
  --form-error-bg:  rgba(239, 68, 68, 0.08);
  --form-error-clr: #ef4444;
  --form-success-bg:rgba(34, 197, 94, 0.08);
  --form-success-clr:#16a34a;
}

/* ── Field base ─────────────────────────────────────────────── */
.field-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
label { font-size: 0.875rem; font-weight: 500; color: var(--color-text); }
.required { color: var(--color-accent); margin-left: 2px; }
input, textarea {
  width: 100%; padding: 12px 16px;
  font-size: 1rem; font-family: inherit;
  border: var(--form-border); border-radius: var(--form-radius);
  background: var(--color-surface);
  color: var(--color-text);
  transition: border-color var(--dur-fast) var(--ease-snap),
              box-shadow var(--dur-fast) var(--ease-snap);
}
input:focus-visible, textarea:focus-visible {
  outline: none; border: var(--form-focus);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.15);
}
input[aria-invalid="true"], textarea[aria-invalid="true"] {
  border-color: var(--form-error-clr);
}

/* ── Glassmorphism form ─────────────────────────────────────── */
.paradigm-glass input,
.paradigm-glass textarea {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  color: white;
}
.paradigm-glass input::placeholder,
.paradigm-glass textarea::placeholder { color: rgba(255,255,255,0.4); }

/* ── Brutalism form ─────────────────────────────────────────── */
.paradigm-brutal input,
.paradigm-brutal textarea {
  border: 3px solid var(--brut-black);
  border-radius: 0;
  box-shadow: 4px 4px 0 var(--brut-black);
}
.paradigm-brutal input:focus-visible,
.paradigm-brutal textarea:focus-visible {
  outline: none; box-shadow: 6px 6px 0 var(--brut-accent);
  border-color: var(--brut-accent);
}

/* ── Feedback states ────────────────────────────────────────── */
.form-success {
  background: var(--form-success-bg); color: var(--form-success-clr);
  border: 1px solid currentColor; border-radius: var(--form-radius);
  padding: 16px; margin-bottom: 20px;
}
.form-error-banner {
  background: var(--form-error-bg); color: var(--form-error-clr);
  border: 1px solid currentColor; border-radius: var(--form-radius);
  padding: 16px; margin-bottom: 20px;
}
.field-error { font-size: 0.8rem; color: var(--form-error-clr); }
.field-hint  { font-size: 0.8rem; color: var(--color-text-muted); }

/* Loading state on submit button */
button[aria-busy="true"] { opacity: 0.7; cursor: not-allowed; }
button[aria-busy="true"]::after {
  content: ''; display: inline-block;
  width: 12px; height: 12px; margin-left: 8px;
  border: 2px solid currentColor; border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

---

## FORM TYPES {#types}

### Waitlist Form (minimal)
```tsx
// components/forms/WaitlistForm.tsx
'use client';
import { useActionState } from 'react';
import { submitWaitlist, type WaitlistState } from '@/app/actions/waitlist';

const initial: WaitlistState = { status: 'idle', message: '' };

export default function WaitlistForm() {
  const [state, action, pending] = useActionState(submitWaitlist, initial);

  if (state.status === 'success') {
    return (
      <div role="status" className="waitlist-success">
        <p>🎉 You're on the list! We'll notify you at launch.</p>
      </div>
    );
  }

  return (
    <form action={action} className="waitlist-form" aria-label="Join waitlist">
      <div aria-live="polite" className="sr-only">{state.message}</div>
      <div className="waitlist-row">
        <label htmlFor="wl-email" className="sr-only">Email address</label>
        <input
          type="email" id="wl-email" name="email"
          placeholder="your@email.com"
          required aria-required="true"
          aria-invalid={!!state.errors?.email}
          autoComplete="email"
        />
        <div aria-hidden="true" style={{ display: 'none' }}>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <button type="submit" disabled={pending} aria-busy={pending} data-magnetic>
          {pending ? 'Joining...' : 'Join Waitlist'}
        </button>
      </div>
      {state.errors?.email && (
        <span role="alert" className="field-error">{state.errors.email[0]}</span>
      )}
    </form>
  );
}
```

---

## FORMSPREE + NETLIFY FORMS {#nocode}

### Formspree (any framework)
```html
<!-- Replace YOUR_FORM_ID from formspree.io dashboard -->
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <input type="hidden" name="_subject" value="New message from [BRAND_NAME]" />
  <input type="text" name="_gotcha" style="display:none" /> <!-- honeypot -->
  <input type="text"  name="name"    required placeholder="Your name" />
  <input type="email" name="email"   required placeholder="Your email" />
  <textarea name="message" required placeholder="Your message"></textarea>
  <button type="submit">Send</button>
</form>
```

### Netlify Forms (Netlify hosting only)
```html
<form name="contact" method="POST" data-netlify="true" data-netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="contact" />
  <p style="display:none">
    <label>Don't fill this out: <input name="bot-field" /></label>
  </p>
  <input type="text"  name="name"    required />
  <input type="email" name="email"   required />
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
```

---

## FORM TESTING CHECKLIST {#testing}

```
FUNCTIONAL
[ ] Form submits successfully with valid data
[ ] Team receives notification email with correct data
[ ] User receives confirmation email
[ ] Form resets after successful submission
[ ] Error states appear correctly for each invalid field
[ ] Rate limit triggers after 3 submissions in 10 min (test with same IP)
[ ] Honeypot silently succeeds when website field is filled

ACCESSIBILITY
[ ] All fields have associated <label> elements
[ ] Required fields marked with aria-required="true"
[ ] Error messages use role="alert" and are announced by screen reader
[ ] Error field highlighted with aria-invalid="true"
[ ] Form success announced via aria-live region
[ ] All fields keyboard navigable in logical order
[ ] Submit button shows loading state (aria-busy="true") while pending

SECURITY
[ ] Honeypot field present and hidden from visual users
[ ] Rate limiting active on API route / server action
[ ] No sensitive data in error messages (no stack traces to user)
[ ] Email content sanitized (no HTML injection via user input)
[ ] RESEND_API_KEY only in server-side code (never client bundle)

EMAIL
[ ] Notification email: correct subject, name, email, message
[ ] Confirmation email: correct name, brand voice matches site
[ ] Both emails tested in Gmail, Outlook, Apple Mail
[ ] Resend dashboard shows successful delivery
```
