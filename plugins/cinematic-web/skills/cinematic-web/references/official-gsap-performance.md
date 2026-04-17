# Official GSAP Performance Logic

Official GSAP performance skill — focusing on smooth 60fps, transforms over layout, and reducing jank.

## 🎨 Compositor over Layout
The most critical performance rule for web animation: **Animate properties that remain on the compositor.**

- ✅ **Prefer:** `x`, `y`, `scale`, `rotation`, `opacity`, `autoAlpha`.
- ❌ **Avoid:** `width`, `height`, `top`, `left`, `margin`, `padding` (these trigger layout/paint and cause jank).

## 🚀 Optimized Update (quickTo)
For properties that update many times per second (like a mouse follower), use `gsap.quickTo()` instead of creating a new tween every frame.

```javascript
let xTo = gsap.quickTo(".follower", "x", { duration: 0.4, ease: "power3" });

window.addEventListener("mousemove", (e) => {
  xTo(e.pageX);
});
```

## ⚡ Batching & Staggers
- Use **stagger** instead of many individual tweens with delays.
- Use `ScrollTrigger.batch()` for long lists to avoid simultaneous calculation of hundreds of triggers.

## 📦 Layer Promotion (will-change)
Use `will-change: transform;` in CSS on elements that will animate. This hints to the browser to promote the element to its own layer.

## 🧹 Cleanup & Pruning
- Pause or kill off-screen animations.
- Use `ScrollTrigger.refresh()` only when absolutely necessary (debounced).
- Ensure all tweens are properly cleaned up in SPA/React environments to prevent memory leaks on detached nodes.

## ✅ Best Practices Summary
- Animate **transform** and **opacity** only.
- Minimize simultaneous work on low-end devices.
- Batch reads and writes; let GSAP handle the writes for efficiency.
- Reuse timelines where possible.
