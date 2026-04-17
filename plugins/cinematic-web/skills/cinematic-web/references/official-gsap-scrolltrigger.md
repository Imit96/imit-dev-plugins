# Official GSAP ScrollTrigger Logic

Official GSAP skill for ScrollTrigger — scroll-linked animations, pinning, scrub, and triggers. 

## 🔌 Registration
ScrollTrigger is a plugin. Always register it once:
```javascript
gsap.registerPlugin(ScrollTrigger);
```

## 🎯 Config Properties
| Property | Description |
|----------|-------------|
| **trigger** | Element that defines where the ScrollTrigger starts. |
| **start / end** | Viewport vs trigger position (e.g., `"top bottom"`). |
| **scrub** | `true` links progress to scroll; `number` adds a smooth lag. |
| **pin** | Pin the element while active. |
| **toggleActions** | `onEnter`, `onLeave`, `onEnterBack`, `onLeaveBack` behavior. |
| **containerAnimation** | Tie vertical scroll to a horizontal "fake" scroll timeline. |

## 🏗️ Pinning & Scrolled Timelines
Use pinning to stick content to the viewport while an internal timeline plays:

```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".section",
    start: "top top",
    end: "+=2000",
    scrub: 1,
    pin: true
  }
});

tl.to(".box", { x: 500 });
```

## ⚡ Batching (Performance)
`ScrollTrigger.batch()` creates one ScrollTrigger per target and batches their callbacks. It's much more performant than creating hundreds of individual triggers.

```javascript
ScrollTrigger.batch(".card", {
  interval: 0.1,
  batchMax: 4,
  onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1 }),
});
```

## ✅ Best Practices
- **Don't Nest:** Never put a ScrollTrigger on a *child* tween of a timeline; put it on the *timeline itself*.
- **Refresh Order:** Create ScrollTriggers in the order they appear on the page (top to bottom).
- **containerAnimation:** Always use `ease: "none"` for fake horizontal scroll to ensure 1:1 scroll sync.
- **Refresh:** Call `ScrollTrigger.refresh()` after dynamic layout changes (content injection, images loading).
- **Cleanup:** Always `kill()` triggers in cleanup functions (or use `@gsap/react`).
