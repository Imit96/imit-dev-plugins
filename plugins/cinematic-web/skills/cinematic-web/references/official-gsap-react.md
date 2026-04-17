# Official GSAP React Logic

Official GSAP skill for working with React and Next.js. Focuses on the `useGSAP()` hook, cleanup, and context safety.

## 📦 Installation
```bash
npm install gsap @gsap/react
```

## 🪝 The useGSAP() Hook
Always prefer `useGSAP()` over `useEffect()` or `useLayoutEffect()`. It handles cleanup (reverting animations) automatically.

```javascript
import { useGSAP } from "@gsap/react";

useGSAP(() => {
  gsap.to(".box", { x: 100 });
}, { scope: containerRef }); // Scoped selectors!
```

## 🎯 Scoping & Refs
Always use a `scope` (ref or element) so that selector strings (like `".box"`) only target elements *inside* your component.

## 🛡️ Context Safety
If you create animations in event handlers (like a click handler), they aren't part of the initial `useGSAP` execution and won't be automatically cleaned up. Use **contextSafe**:

```javascript
const { contextSafe } = useGSAP({ scope: container });

const onClick = contextSafe(() => {
  gsap.to(".box", { rotation: 180 });
});
```

## 🚀 Server-Side Rendering (Next.js)
GSAP runs strictly in the browser. 
- All GSAP code must stay inside `useGSAP` or `useEffect`.
- If importing plugins, register them inside the client lifecycle.
- Use `gsap.registerPlugin(useGSAP)` to initialize properly.

## ✅ Best Practices
- **Cleanup:** If NOT using `@gsap/react`, always use `gsap.context()` inside `useEffect` and return `ctx.revert()`.
- **Targeting:** Never use global selectors without a `scope`.
- **SSR:** Never call `gsap.*` at the top level of a file where it might run during server rendering.
