# Style & Design Intelligence

Professional frameworks for selecting and implementing UI styles, typography pairing, and color systems.

## 🎭 Style Selection Framework

| Style | Characteristics | Best For | Implementation Logic |
|-------|----------------|----------|----------------------|
| **Minimalism** | High whitespace, content-first, extreme clarity. | SaaS, Portfolio, Tools | No borders; use spacing for separation. |
| **Glassmorphism** | Frosted glass (backdrop-blur), sublte borders, vibrant backgrounds. | Immersive, Modern Web | `backdrop-filter: blur(10px)`, white-20 border. |
| **Bento Grid** | Modular, card-based boxes of varying sizes. | Dashboards, Landing Pages | CSS Grid; identical border-radius and gaps. |
| **Neo-Brutalism** | Bold outlines, vibrant colors, hard shadows. | Creative, Gen-Z, Fintech | 2px solid black border; #000 4px shadow offset. |
| **Claymorphism** | Rounded shapes, inner/outer shadows (inflated look). | Playful, EdTech, Kids | `box-shadow: inset 2px 2px 4px ...` |

## 🎨 Professional Color Palettes
Apply these semantic patterns to maintain brand integrity:

- **Primary**: Brand identity (CTA, branding).
- **Surface/Background**: Neutral grounding (900 for dark mode, 50 for light).
- **Success/Error/Warning**: Functional signals (Check contrast specifically for these).

### Anti-Pattern: Raw Hex
❌ `background: #f3f3f3;`
✅ `background: var(--surface-100);`

## 🔠 Typography Intelligence

### Pairings logic:
- **Heading (Sans) + Body (Sans)**: Clean, modern, functional (e.g., Inter + Roboto).
- **Heading (Serif) + Body (Sans)**: Editorial, premium, high-contrast (e.g., Playfair + Inter).
- **Monospace**: For data, technical details, or specific technical branding (e.g., JetBrains Mono).

### Hierarchy standards:
1. **Display (H1)**: Bold, 110-120% line-height.
2. **Body**: Regular, 150-175% line-height.
3. **Labels**: Medium weight, all-caps or small-caps for utility.

## 💎 Effects Intelligence
- **Shadows**: Use 3-4 distinct levels (Soft, Floating, High). Avoid harsh black shadows.
- **Gradients**: Max 2-3 colors. Use HSL to ensure color transitions don't hit "the gray zone."
- **Blur**: Use for context isolation (modals/drawers), not just decoration.
