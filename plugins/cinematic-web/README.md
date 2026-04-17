# 🎬 Cinematic Web Plugin

> **Agile full-stack web development skill** — fast-paced, MVP-first development of web experiences with opt-in support for advanced 'cinematic' features (3D, GSAP, complex scrolls).

## 🚀 The Agile Approach

This plugin avoids dragging you through lengthy waterfall-style interviews. Its core philosophy is the **80/20 Rule**: Get standard, high-performing web apps scaffolded instantly according to sensible defaults, then add advanced "cinematic" features cleanly on top.

With the new lightweight **Discovery** phase, it will just ask the minimum required questions to ensure zero incorrect assumptions, then it starts building!

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Imit96/imit-dev-plugins/tree/main/plugins/cinematic-web/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Compatible](https://img.shields.io/badge/Claude-claude.ai%20Skills-purple.svg)](https://claude.ai)

---

## 👥 The Specialist Team

This plugin operates with three built-in agent roles:
1. **Creative Director:** Focuses on overall aesthetics, transitions, and user experience. Ensures "wow factor".
2. **Cinema Architect:** Specializes in Three.js, WebGL, and advanced math for 3D interactions.
3. **Motion Designer:** Specializes in GSAP, Framer Motion, and Lenis for smooth scrolling and micro-interactions.

---

## What Is This?

**Cinematic Web** is a complete boilerplate and AI assistant suite focused on building modern web applications that stand out without being bloated. 

By default, it acts like a senior Next.js and Tailwind engineer. But when you ask it for "Cinematic" elements, it triggers specific references for complex animations and 3D scenes.

### Features
* **Lightweight Discovery:** Fast startup with no unneeded interrogation.
* **Opt-in Heavy Lifters:** Only introduces `framer-motion`, `gsap`, `lenis`, or `three.js` when explicitly requested.
* **On-Demand Reference Library:** 20+ documentation and layer references that guide the agent automatically. Includes caching strategy, auth layers, accessibility, scrollytelling, and motion libraries.
* **Agile Workflows:** Automatically infers logic from source code, skipping manual JSON ledger management.

---

## Quick Start

### Installation

**Method 1: Direct Install (Recommended)**
1. Open [Claude.ai](https://claude.ai)
2. Go to **Settings → Skills → Install Skill**
3. Upload the `.skill` file from the [Releases](https://github.com/Imit96/imit-dev-plugins/tree/main/plugins/cinematic-web/releases)
4. Start a new conversation

**Method 2: Use via Agent CLI**
```bash
/plugin install cinematic-web@imit-dev-plugins
```

### First Use

Trigger the skill with phrases like:
```
"I want to build a landing page for my new SaaS"
"Create a 3D portfolio website"
"Build me a Next.js site but add cinematic smooth scrolling"
```

---

## Roadmap

- [ ] v1.1 — Expansion of Scrollytelling reference patterns
- [ ] v1.2 — Dedicated shader library
- [ ] v1.3 — React Server Components (RSC) exclusive animation patterns

---

## Architecture

```
cinematic-web/
├── SKILL.md                    # Core instructions & Agile approach
└── references/                 # Auto-loaded context libraries
    ├── scrollytelling.md
    ├── motion-code-library.md
    ├── scene-prompts.md
    └── ...                     # 26 other reference docs
```

---

## Author 

Built by **Imit** using Claude AI's skill system.

**Skill name:** `cinematic-web`  
**License:** MIT
