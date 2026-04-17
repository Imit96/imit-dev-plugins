# UI/UX Intelligence (Pro Max Standards)

This document contains the 99 master guidelines for professional UI/UX design, synthesized from world-class standards (Apple HIG, Material Design, WCAG).

## 🚨 MANDATORY: Pre-Delivery Checklist
Before delivering any UI code or finalizing a scene, you MUST verify these items:

### Visual Quality
- [ ] **No Emoji as Icons**: Use vector-based icons only (SVG, Lucide, etc.).
- [ ] **Icon Consistency**: All icons must belong to the same visual family (stroke weight, style).
- [ ] **Stability**: Pressed-state visuals do not shift layout bounds or cause jitter.
- [ ] **Theme Integrity**: Semantic tokens used for all colors; no hardcoded hex.

### Interaction
- [ ] **Feedback**: All tappable elements provide visual feedback (ripple/opacity) within 150ms.
- [ ] **Target Size**: All touch targets meet minimum >=44pt (iOS) or >=48dp (Android).
- [ ] **Motion Rhythm**: Micro-interactions stay within the 150-300ms range.
- [ ] **Accessibility Hierarchy**: Screen reader focus order matches visual order.

### Layout & Light/Dark Mode
- [ ] **Contrast**: Primary text contrast >=4.5:1; secondary >=3:1 in BOTH modes.
- [ ] **Scrim Intensity**: Modal scrims are strong enough (40-60% black) to isolate content.
- [ ] **Safe Areas**: Headers, tab bars, and bottom CTAs respect safe-area notches/gestures.
- [ ] **Rhythm**: Consistent 8dp (or 4dp) spacing scale used across all dimensions.

---

## 🧠 The 9 Domains of Excellence

### 1. Accessibility (CRITICAL)
- **Contrast**: 4.5:1 minimum for normal text.
- **Focus**: Visible focus rings on all interactive elements.
- **Reduced Motion**: Respect `prefers-reduced-motion`; disable decorative animations.
- **Dynamic Type**: Support system text scaling without layout breakage.

### 2. Touch & Interaction (CRITICAL)
- **Hit Area**: Expand `hitSlop` beyond visual bounds for small icons.
- **No Hover Reliance**: Primary actions must be accessible via tap.
- **Gesture Conflict**: Avoid horizontal swipes on main content due to OS back-swipes.
- **Haptics**: Use confirmation haptics for success/error (Apple HIG).

### 3. Performance (HIGH)
- **CLS Control**: Declare width/height on images to reserve space and prevent layout shifts (CLS < 0.1).
- **Virtualization**: Use for lists with >50 items.
- **Main Thread**: Keep per-frame work <16ms (60fps).
- **Critical CSS**: Prioritize above-the-fold styles.

### 4. Layout (HIGH)
- **Mobile-First**: Design for 375px first, then scale up.
- **Viewport**: Never disable zoom.
- **Visual Hierarchy**: Establish through size and spacing, not just color.
- **Safe Areaawareness**: Keep touch targets away from notch/gesture bar.

### 5. Typography & Color
- **Line Height**: 1.5–1.75 for body text.
- **Line Length**: 35–60 characters (mobile) / 60–75 (desktop).
- **Semantic Tokens**: Define `primary`, `surface`, `on-surface`, `error` rather than raw HSL/Hex.
- **Tabular figures**: Use for data/timers to prevent layout jitter.

### 6. Animation
- **Meaning over Decoration**: Motion must convey context (e.g., slide-in from right = forward).
- **Spring Physics**: Use for natural-feeling interactions (Apple Fluid).
- **Shared Elements**: Use for visual continuity between screens.
- **Interruptible**: Animations must cancel/stop immediately if user interrupts.

### 7. Forms & Feedback
- **Persistent Labels**: No placeholder-only labels.
- **Inline Validation**: Validate on blur, not keystroke.
- **Progress Density**: Use progressive disclosure for complex forms.

### 8. Navigation
- **Limit Items**: Bottom Nav max 5 items.
- **State Preservation**: Restore scroll position when navigating back.
- **Deep Linking**: All key screens must have reachable URLs.

### 9. Data Visualization
- **Type Selection**: Line for trends, Bar for comparison, Donut for small proportions.
- **Legend Location**: Near the chart, not detached.
- **Table Alternative**: Provide non-visual data lookup for screen readers.
