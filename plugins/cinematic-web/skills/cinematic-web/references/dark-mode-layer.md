# Cinematic Web — Dark Mode Layer

## TABLE OF CONTENTS
1. [Dark Mode Decision Flow](#decision)
2. [CSS Architecture — Dual Mode System](#css)
3. [Paradigm Dark Mode Feasibility](#feasibility)
4. [Toggle System — Detection + Persistence](#toggle)
5. [Framework Implementations](#frameworks)
6. [Cloudinary Dark Mode Images](#cloudinary)
7. [Dark Mode Checklist](#checklist)

---

## DARK MODE DECISION FLOW {#decision}

Ask in Phase 1.5 (after paradigm selection): "Do you want dark mode support?"

If YES, also ask:
- "Default mode: dark or light?" (system preference is default if unsure)
- "Show a manual toggle in the nav? (yes/no)"

Check paradigm compatibility (see feasibility matrix below) before confirming.
Neumorphism + dark = HIGH RISK — warn explicitly before proceeding.

---

## CSS ARCHITECTURE — DUAL MODE SYSTEM {#css}

### Design Principle
All colors live in CSS custom properties. Dark mode swaps the values — component
code never changes. Zero dark-mode-specific component variants needed.

### Root Variable System
```css
/* globals.css — always output this structure */

/* ── Light mode (default) ──────────────────────────────────── */
:root {
  /* Surfaces */
  --color-bg:           #FFFFFF;
  --color-surface:      #F8F9FA;
  --color-surface-2:    #F1F3F5;
  --color-border:       #E5E7EB;
  --color-border-strong:#D1D5DB;

  /* Text */
  --color-text:         #111827;
  --color-text-muted:   #6B7280;
  --color-text-subtle:  #9CA3AF;
  --color-text-inverse: #FFFFFF;

  /* Brand (same in both modes — override if needed) */
  --color-primary:      [BRAND_PRIMARY];
  --color-secondary:    [BRAND_SECONDARY];
  --color-accent:       [BRAND_ACCENT];
  --accent-rgb:         [R], [G], [B];  /* for rgba() usage */

  /* Semantic */
  --color-success:      #16A34A;
  --color-warning:      #D97706;
  --color-error:        #DC2626;
  --color-info:         #2563EB;

  /* Shadows */
  --shadow-sm:  0 1px 2px rgba(0,0,0,0.06);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg:  0 8px 32px rgba(0,0,0,0.12);
  --shadow-xl:  0 16px 48px rgba(0,0,0,0.16);

  /* Glassmorphism (light) */
  --glass-bg:        rgba(255,255,255,0.72);
  --glass-border:    rgba(255,255,255,0.40);
  --glass-blur:      16px;
  --glass-shadow:    0 8px 32px rgba(0,0,0,0.12);
  --glass-highlight: rgba(255,255,255,0.60);
}

/* ── Dark mode ─────────────────────────────────────────────── */
[data-theme="dark"] {
  /* Surfaces */
  --color-bg:           #0A0F1E;
  --color-surface:      #111827;
  --color-surface-2:    #1F2937;
  --color-border:       #1F2937;
  --color-border-strong:#374151;

  /* Text */
  --color-text:         #F9FAFB;
  --color-text-muted:   #9CA3AF;
  --color-text-subtle:  #6B7280;
  --color-text-inverse: #111827;

  /* Shadows (lighter in dark — visible against dark bg) */
  --shadow-sm:  0 1px 2px rgba(0,0,0,0.30);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.40);
  --shadow-lg:  0 8px 32px rgba(0,0,0,0.50);
  --shadow-xl:  0 16px 48px rgba(0,0,0,0.60);

  /* Glassmorphism (dark) */
  --glass-bg:        rgba(255,255,255,0.06);
  --glass-border:    rgba(255,255,255,0.10);
  --glass-blur:      20px;
  --glass-shadow:    0 8px 32px rgba(0,0,0,0.50);
  --glass-highlight: rgba(255,255,255,0.08);
}

/* ── System preference fallback ────────────────────────────── */
/* Applies when no [data-theme] is set — respects OS setting */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg:           #0A0F1E;
    --color-surface:      #111827;
    --color-surface-2:    #1F2937;
    --color-border:       #1F2937;
    --color-border-strong:#374151;
    --color-text:         #F9FAFB;
    --color-text-muted:   #9CA3AF;
    --color-text-subtle:  #6B7280;
    --color-text-inverse: #111827;
    --shadow-sm:  0 1px 2px rgba(0,0,0,0.30);
    --shadow-md:  0 4px 12px rgba(0,0,0,0.40);
    --shadow-lg:  0 8px 32px rgba(0,0,0,0.50);
    --glass-bg:        rgba(255,255,255,0.06);
    --glass-border:    rgba(255,255,255,0.10);
    --glass-blur:      20px;
    --glass-shadow:    0 8px 32px rgba(0,0,0,0.50);
    --glass-highlight: rgba(255,255,255,0.08);
  }
}
```

---

## PARADIGM DARK MODE FEASIBILITY {#feasibility}

```
┌──────────────────────────────────────────────────────────────────┐
│ PARADIGM          │ DARK MODE │ NOTES                           │
├──────────────────────────────────────────────────────────────────┤
│ Glassmorphism     │ ★★★★★    │ Better in dark — native fit     │
│ Spatial Design    │ ★★★★★    │ Depth reads much better on dark │
│ Aurora / Mesh     │ ★★★★★    │ Glows need dark background      │
│ Data-Driven UI    │ ★★★★★    │ Usually dark-first by design    │
│ Motion System     │ ★★★★☆    │ Works well — adjust easing vis. │
│ Brutalism         │ ★★★★☆    │ Invert: white border on black   │
│ Maximalism        │ ★★★☆☆    │ Colors need rebalancing in dark │
│ Flat Design 2.0   │ ★★★☆☆    │ Works but needs palette rethink │
│ Claymorphism      │ ★★☆☆☆    │ Pastels lose character in dark  │
│ Skeuomorphism     │ ★★☆☆☆    │ Textures need dark variants     │
│ Neumorphism       │ ★☆☆☆☆    │ ⚠ AVOID — dual shadows fail     │
│                   │           │ on dark; contrast almost 0      │
└──────────────────────────────────────────────────────────────────┘
```

### Neumorphism Dark Mode — If User Insists
```css
/* Modified neumorphism for dark — uses colored shadows not light/dark */
[data-theme="dark"] .neu-raised {
  background: #1E2A3A;
  box-shadow: 6px 6px 12px #111820,
             -6px -6px 12px #2B3C54;
  /* MUST run contrast check — text on this surface is often <3:1 */
}
```
**Always warn:** "Neumorphism in dark mode will very likely fail WCAG contrast.
A high-contrast mode toggle is strongly recommended if you proceed."

### Brutalism Dark Mode
```css
/* Invert the core: white surfaces, black borders on dark bg */
[data-theme="dark"] .brutal-card {
  background: transparent;
  border: 3px solid #FFFFFF;
  box-shadow: 6px 6px 0 #FFFFFF;
  color: #FFFFFF;
}
[data-theme="dark"] .brutal-card:hover {
  background: #FFFFFF;
  color: #000000;
}
```

---

## TOGGLE SYSTEM {#toggle}

### Theme Detection and Persistence Script
```typescript
// lib/theme.ts
export type Theme = 'light' | 'dark' | 'system';

export function getInitialTheme(): 'light' | 'dark' {
  // 1. Check localStorage preference
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light') return 'light';
  if (stored === 'dark')  return 'dark';
  // 2. Fall back to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark' : 'light';
}

export function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  // Sync meta theme-color for mobile browsers
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'dark' ? '#0A0F1E' : '#FFFFFF');
  }
}

export function persistTheme(theme: Theme) {
  localStorage.setItem('theme', theme);
}

export function initTheme() {
  const theme = getInitialTheme();
  applyTheme(theme);
  // Listen for system changes (if user hasn't overridden)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('theme') === 'system' || !localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}
```

### Inline Script (prevents flash of wrong theme — add to `<head>` before anything)
```html
<!-- MUST be inline — not deferred, not async -->
<script>
  (function() {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'dark' || (!stored && prefersDark) ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```

### Toggle Button Component
```tsx
// components/ThemeToggle.tsx
'use client';
import { useEffect, useState } from 'react';
import { getInitialTheme, applyTheme, persistTheme } from '@/lib/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyTheme(next);
    persistTheme(next);
  };

  // Prevent hydration mismatch — render nothing until mounted
  if (!mounted) return <div style={{ width: 40, height: 24 }} aria-hidden />;

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-pressed={theme === 'dark'}
      className="theme-toggle"
    >
      {theme === 'light' ? (
        <span aria-hidden>🌙</span>
      ) : (
        <span aria-hidden>☀️</span>
      )}
    </button>
  );
}
```

---

## FRAMEWORK IMPLEMENTATIONS {#frameworks}

### Next.js — Add to app/layout.tsx
```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FFFFFF" />
        {/* Inline theme script — prevents FOUC */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){var s=localStorage.getItem('theme'),
          d=window.matchMedia('(prefers-color-scheme:dark)').matches,
          t=s==='dark'||(!s&&d)?'dark':'light';
          document.documentElement.setAttribute('data-theme',t);})();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Astro — Add to Layout.astro
```astro
<html lang="en">
<head>
  <meta name="theme-color" content="#FFFFFF">
  <script is:inline>
    const theme = localStorage.getItem('theme') ??
      (window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  </script>
</head>
```

### SvelteKit — Add to +layout.svelte
```svelte
<svelte:head>
  <meta name="theme-color" content="#FFFFFF" />
</svelte:head>
<script>
  // In app.html, before </head>:
  // %sveltekit.head%
  // <script>/* inline theme script */</script>
</script>
```

---

## CLOUDINARY DARK MODE IMAGES {#cloudinary}

For images that need dark/light variants, use Cloudinary's `e_brightness` and
`e_colorize` transformations or upload separate dark variants.

```typescript
// lib/cloudinary.ts
export function getImageUrl(
  publicId: string,
  options: { width?: number; theme?: 'light' | 'dark' } = {}
) {
  const { width = 'auto', theme = 'light' } = options;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // Dark mode: reduce brightness slightly, increase contrast
  const darkTransform = theme === 'dark'
    ? 'e_brightness:-10,e_contrast:10,' : '';

  return `https://res.cloudinary.com/${cloudName}/image/upload/${darkTransform}f_auto,q_auto,w_${width}/${publicId}`;
}

// Usage:
// const src = getImageUrl('project/hero-bg', { width: 2560, theme: currentTheme });
```

### CSS Image Dark Mode (filter-based — no separate upload needed)
```css
/* Images that work better inverted/dimmed in dark mode */
[data-theme="dark"] .hero-illustration {
  filter: brightness(0.85) saturate(0.9);
}
[data-theme="dark"] .section-graphic {
  filter: brightness(0.8);
}
/* Never apply to photography — ruins skin tones */
```

---

## DARK MODE CHECKLIST {#checklist}

```
CSS SYSTEM
[ ] All colors use CSS custom properties (no hardcoded hex in components)
[ ] [data-theme="dark"] overrides defined for all --color-* variables
[ ] @media prefers-color-scheme fallback defined
[ ] Inline theme script in <head> (no flash of wrong theme on load)
[ ] meta theme-color updates on toggle

COMPONENTS
[ ] Nav: dark variant tested (glass nav on dark bg)
[ ] Hero: text contrast on dark bg passes WCAG AA
[ ] Cards: surface color changes correctly in dark
[ ] Forms: input fields readable in dark (bg, border, text)
[ ] Buttons: CTA readable in both modes
[ ] Footer: dark variant confirmed
[ ] Code blocks (if any): syntax highlighting works in dark

IMAGES
[ ] Hero bg image works in both modes (or has dark variant)
[ ] Illustrations: not too bright in dark mode (filter if needed)
[ ] Logo: has dark variant OR uses CSS-maskable SVG
[ ] OG images: generated in default mode (light usually safer for social)

TOGGLE
[ ] Toggle button in nav (if requested)
[ ] aria-label updates on toggle ("Switch to dark/light mode")
[ ] aria-pressed reflects current state
[ ] Theme persists across page navigation
[ ] Theme persists on return visit (localStorage)
[ ] System preference change triggers update (if no manual override)

ACCESSIBILITY
[ ] Both modes pass WCAG AA contrast (run both through checker)
[ ] Neumorphism dark: high-contrast mode toggle available
[ ] Focus rings visible in both modes
[ ] Reduced motion: theme transition is instant (no animation if preferred)

PERFORMANCE
[ ] No layout shift on theme apply (inline script prevents FOUC)
[ ] Theme CSS: no extra network request (all in globals.css)
[ ] Cloudinary: same image URL works in both modes (no duplicate fetches)
```
