# Cinematic Web — Cookie Consent & GDPR Layer

## TABLE OF CONTENTS
1. [Legal Requirement Overview](#legal)
2. [Consent Categories](#categories)
3. [Consent Store — localStorage](#store)
4. [Cookie Banner Component](#banner)
5. [Conditional Script Loading](#conditional)
6. [Geo-Detection for EU Users](#geo)
7. [Framework Implementations](#frameworks)
8. [Consent Checklist](#checklist)

---

## LEGAL REQUIREMENT OVERVIEW {#legal}

```
WHO NEEDS THIS:
  ✓ Any site with Google Analytics, Hotjar, or Facebook Pixel
  ✓ Any site that stores non-essential cookies
  ✓ Any site with visitors from EU, UK, or California

WHO MIGHT NOT NEED IT:
  ✗ Completely static site, no analytics, no tracking cookies
  ✗ First-party analytics only (Plausible, Fathom — privacy-first, no consent needed)

FRAMEWORK:
  EU/UK:        GDPR — explicit opt-in required before non-essential cookies
  California:   CCPA — opt-out model (banner optional but recommended)
  Everywhere:   Safest approach: treat all users as EU for simplicity

PENALTY RISK:
  GDPR violations: up to €20M or 4% of global revenue
  Practical risk for small sites: low but growing
  Recommendation: always implement — it's 1-2 hours of work
```

**Privacy-first analytics (no consent needed):**
- Plausible Analytics: $9/mo, GDPR-compliant, no cookies, no consent banner needed
- Fathom Analytics: $14/mo, same model
- If user wants zero compliance burden → recommend Plausible over GA4

---

## CONSENT CATEGORIES {#categories}

```typescript
// lib/consent.ts
export type ConsentCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences';

export interface ConsentState {
  given:      boolean;         // Has user interacted with banner?
  necessary:  true;            // Always true — can't be refused
  analytics:  boolean;         // GA4, Hotjar — requires consent
  marketing:  boolean;         // Facebook Pixel, etc.
  preferences:boolean;         // Personalisation cookies
  timestamp:  number;          // When consent was given
  version:    string;          // Consent policy version — bump when policy changes
}

export const CONSENT_VERSION = '1.0'; // Increment when privacy policy changes

export const DEFAULT_CONSENT: ConsentState = {
  given:       false,
  necessary:   true,
  analytics:   false,
  marketing:   false,
  preferences: false,
  timestamp:   0,
  version:     CONSENT_VERSION,
};
```

---

## CONSENT STORE {#store}

```typescript
// lib/consent.ts (continued)
const CONSENT_KEY = '[PROJECT_SLUG]_consent';

export function getConsent(): ConsentState {
  if (typeof window === 'undefined') return DEFAULT_CONSENT;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return DEFAULT_CONSENT;
    const stored: ConsentState = JSON.parse(raw);
    // Invalidate if policy version changed
    if (stored.version !== CONSENT_VERSION) return DEFAULT_CONSENT;
    return stored;
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function saveConsent(consent: Partial<ConsentState>) {
  const current = getConsent();
  const updated: ConsentState = {
    ...current,
    ...consent,
    necessary: true,       // Always force true
    given: true,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(updated));
  // Dispatch event so other components can react
  window.dispatchEvent(new CustomEvent('consent-updated', { detail: updated }));
  return updated;
}

export function acceptAll() {
  return saveConsent({ analytics: true, marketing: true, preferences: true });
}

export function rejectAll() {
  return saveConsent({ analytics: false, marketing: false, preferences: false });
}

export function hasConsent(category: ConsentCategory): boolean {
  return getConsent()[category];
}

// Check if banner should show
export function needsBanner(): boolean {
  const consent = getConsent();
  return !consent.given;
}
```

---

## COOKIE BANNER COMPONENT {#banner}

```tsx
// components/CookieBanner.tsx
'use client';
import { useState, useEffect } from 'react';
import {
  needsBanner, acceptAll, rejectAll,
  saveConsent, type ConsentCategory,
} from '@/lib/consent';

export default function CookieBanner() {
  const [show, setShow]           = useState(false);
  const [expanded, setExpanded]   = useState(false);
  const [prefs, setPrefs] = useState({
    analytics: false, marketing: false, preferences: false,
  });

  useEffect(() => {
    // Small delay — don't interrupt first paint
    const timer = setTimeout(() => setShow(needsBanner()), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const handleAcceptAll = () => {
    acceptAll();
    setShow(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setShow(false);
  };

  const handleSavePrefs = () => {
    saveConsent(prefs);
    setShow(false);
  };

  const togglePref = (cat: ConsentCategory) => {
    if (cat === 'necessary') return;
    setPrefs(p => ({ ...p, [cat]: !p[cat as keyof typeof p] }));
  };

  return (
    <>
      {/* Backdrop for expanded state */}
      {expanded && (
        <div className="consent-backdrop" onClick={() => setExpanded(false)}
             aria-hidden="true" />
      )}

      <div className="consent-banner" role="dialog"
           aria-modal="true"
           aria-label="Cookie preferences"
           aria-live="polite">

        <div className="consent-banner__content">
          <div className="consent-banner__text">
            <strong>We use cookies</strong>
            <p>
              We use cookies and similar technologies to provide a better experience,
              analyze traffic, and serve relevant content.
              {' '}
              <a href="/privacy" className="consent-link">Privacy Policy</a>
            </p>
          </div>

          {!expanded && (
            <div className="consent-banner__actions">
              <button onClick={handleRejectAll}   className="consent-btn consent-btn--ghost">
                Reject all
              </button>
              <button onClick={() => setExpanded(true)} className="consent-btn consent-btn--outline">
                Manage preferences
              </button>
              <button onClick={handleAcceptAll}   className="consent-btn consent-btn--primary"
                      data-magnetic>
                Accept all
              </button>
            </div>
          )}

          {expanded && (
            <div className="consent-preferences">
              {/* Necessary — always on */}
              <ConsentToggle
                id="necessary" label="Necessary" alwaysOn
                description="Required for the site to function. Cannot be disabled."
              />
              {/* Analytics */}
              <ConsentToggle
                id="analytics" label="Analytics"
                checked={prefs.analytics}
                onChange={() => togglePref('analytics')}
                description="Helps us understand how visitors use the site (Google Analytics)."
              />
              {/* Marketing */}
              <ConsentToggle
                id="marketing" label="Marketing"
                checked={prefs.marketing}
                onChange={() => togglePref('marketing')}
                description="Used to show relevant ads and track campaign effectiveness."
              />
              {/* Preferences */}
              <ConsentToggle
                id="preferences" label="Preferences"
                checked={prefs.preferences}
                onChange={() => togglePref('preferences')}
                description="Remembers your settings like theme and language."
              />

              <div className="consent-banner__actions">
                <button onClick={handleRejectAll}   className="consent-btn consent-btn--ghost">
                  Reject all
                </button>
                <button onClick={handleSavePrefs}   className="consent-btn consent-btn--primary">
                  Save preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ConsentToggle({ id, label, description, checked, onChange, alwaysOn }: {
  id: string; label: string; description: string;
  checked?: boolean; onChange?: () => void; alwaysOn?: boolean;
}) {
  return (
    <div className="consent-toggle-row">
      <div className="consent-toggle-info">
        <label htmlFor={`consent-${id}`} className="consent-toggle-label">
          {label}
          {alwaysOn && <span className="consent-always-on"> — Always active</span>}
        </label>
        <p className="consent-toggle-desc">{description}</p>
      </div>
      <button
        id={`consent-${id}`}
        role="switch"
        aria-checked={alwaysOn ? true : checked}
        aria-label={`${label} cookies`}
        onClick={alwaysOn ? undefined : onChange}
        disabled={alwaysOn}
        className={`consent-switch ${(alwaysOn || checked) ? 'consent-switch--on' : ''}`}
      >
        <span className="consent-switch__thumb" />
      </button>
    </div>
  );
}
```

**CSS — paradigm-neutral, works with all:**
```css
.consent-banner {
  position: fixed; bottom: 1.5rem; left: 1rem; right: 1rem;
  max-width: 560px; margin: 0 auto;
  z-index: 9999;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  padding: 1.5rem;
}
/* Glassmorphism override */
.paradigm-glass .consent-banner {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-color: var(--glass-border);
}
.consent-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 9998;
}
.consent-banner__text strong { display: block; margin-bottom: 4px; }
.consent-banner__text p { font-size: 0.875rem; color: var(--color-text-muted); margin: 0; }
.consent-link { color: var(--color-accent); }
.consent-banner__actions {
  display: flex; gap: 8px; flex-wrap: wrap; margin-top: 1rem;
}
.consent-btn { padding: 8px 16px; border-radius: 8px; font-size: 0.875rem;
               cursor: pointer; font-weight: 500; transition: all var(--dur-fast); }
.consent-btn--primary { background: var(--color-accent); color: var(--color-bg); border: none; }
.consent-btn--outline { background: transparent; border: 1px solid var(--color-border); color: var(--color-text); }
.consent-btn--ghost   { background: transparent; border: none; color: var(--color-text-muted); }
.consent-preferences  { margin-top: 1rem; display: flex; flex-direction: column; gap: 12px; }
.consent-toggle-row   { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.consent-toggle-label { font-weight: 600; font-size: 0.875rem; }
.consent-toggle-desc  { font-size: 0.8rem; color: var(--color-text-muted); margin: 2px 0 0; }
.consent-switch {
  flex-shrink: 0; width: 44px; height: 24px;
  border-radius: 12px; border: none; cursor: pointer;
  background: var(--color-border); position: relative;
  transition: background var(--dur-fast);
}
.consent-switch--on { background: var(--color-accent); }
.consent-switch__thumb {
  position: absolute; top: 2px; left: 2px;
  width: 20px; height: 20px; border-radius: 50%;
  background: white;
  transition: transform var(--dur-fast) var(--ease-spring);
}
.consent-switch--on .consent-switch__thumb { transform: translateX(20px); }
.consent-switch:disabled { opacity: 0.6; cursor: not-allowed; }
```

---

## CONDITIONAL SCRIPT LOADING {#conditional}

```typescript
// lib/analytics-loader.ts — Only loads after consent
import { hasConsent } from './consent';

let analyticsLoaded = false;
let hotjarLoaded    = false;

export function loadAnalyticsIfConsented() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!analyticsLoaded && hasConsent('analytics') && GA_ID) {
    // Dynamically inject GA4
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: unknown[]) { (window as any).dataLayer.push(args); }
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA_ID, { send_page_view: true });
      analyticsLoaded = true;
    };
  }

  const HJ_ID = process.env.NEXT_PUBLIC_HOTJAR_ID;
  if (!hotjarLoaded && hasConsent('analytics') && HJ_ID) {
    // Inject Hotjar
    const f = window as any;
    f.hj = f.hj || function(...args: unknown[]) { (f.hj.q = f.hj.q || []).push(args); };
    f._hjSettings = { hjid: HJ_ID, hjsv: 6 };
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://static.hotjar.com/c/hotjar-${HJ_ID}.js?sv=6`;
    document.head.appendChild(s);
    hotjarLoaded = true;
  }
}

// Call this on:
// 1. Page load (if consent already given)
// 2. After user accepts consent in banner
window.addEventListener('consent-updated', () => loadAnalyticsIfConsented());
```

```tsx
// components/ConsentLoader.tsx — Wires everything together
'use client';
import { useEffect } from 'react';
import { loadAnalyticsIfConsented } from '@/lib/analytics-loader';

export default function ConsentLoader() {
  useEffect(() => {
    // Load on mount if already consented
    loadAnalyticsIfConsented();

    // Load when consent is updated
    const handler = () => loadAnalyticsIfConsented();
    window.addEventListener('consent-updated', handler);
    return () => window.removeEventListener('consent-updated', handler);
  }, []);
  return null; // No UI
}

// Add to app/layout.tsx:
// <CookieBanner />
// <ConsentLoader />
```

---

## GEO-DETECTION FOR EU USERS {#geo}

```typescript
// lib/geo.ts — Show banner only for EU/UK users (optional optimisation)
// Reduces banner friction for US-only sites
export async function isEUUser(): Promise<boolean> {
  // Cloudflare headers (available if using Cloudflare)
  const cfCountry = document.cookie.match(/cf-country=([A-Z]{2})/)?.[1];
  if (cfCountry) {
    return EU_COUNTRIES.has(cfCountry);
  }

  // Fallback: show banner to everyone (safest)
  return true;
}

const EU_COUNTRIES = new Set([
  'AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI',
  'FR','GR','HR','HU','IE','IT','LT','LU','LV','MT',
  'NL','PL','PT','RO','SE','SI','SK',
  'GB', // UK (post-Brexit UK GDPR)
  'NO','IS','LI', // EEA
  'CH', // Switzerland (Swiss FADP)
]);

// In CookieBanner:
// const [show, setShow] = useState(false);
// useEffect(() => {
//   isEUUser().then(isEU => {
//     if (isEU || needsBanner()) setTimeout(() => setShow(needsBanner()), 800);
//   });
// }, []);
```

---

## CONSENT CHECKLIST {#checklist}

```
LEGAL
[ ] Privacy Policy page exists and is linked from banner
[ ] Privacy Policy mentions all cookies/tracking used
[ ] Consent version defined — will increment when policy changes
[ ] No analytics scripts load before user gives consent

BANNER UX
[ ] Banner appears after 800ms delay (not on first paint)
[ ] "Reject all" is equally prominent as "Accept all" (GDPR requirement)
[ ] "Manage preferences" allows granular control
[ ] Banner is keyboard navigable (Tab + Enter/Space)
[ ] Banner is screen reader accessible (role="dialog", aria-modal)
[ ] Banner doesn't block content on mobile

CONSENT PERSISTENCE
[ ] Consent saved to localStorage with timestamp and version
[ ] Consent version mismatch → re-show banner (policy changed)
[ ] Consent persists across page navigation
[ ] Consent persists on return visit

CONDITIONAL LOADING
[ ] GA4 does NOT load until analytics consent given
[ ] Hotjar does NOT load until analytics consent given
[ ] Marketing pixels (if any) gated by marketing consent
[ ] ConsentLoader fires loadAnalyticsIfConsented on consent-updated event
[ ] Test: open DevTools Network tab → analytics scripts NOT in requests on first visit

CCPA (US/California)
[ ] "Do Not Sell My Personal Information" link in footer (if applicable)
[ ] Opt-out mechanism functional (rejectAll saves to localStorage)

TESTING
[ ] Clear localStorage → banner appears
[ ] Accept all → analytics scripts load in Network tab
[ ] Reject all → no analytics scripts load
[ ] Manage preferences → save analytics only → only GA4 loads, Hotjar doesn't
[ ] Return visit with consent given → banner doesn't show again
[ ] Bump CONSENT_VERSION → banner re-appears for existing users
```
