# MZ Studio — Official Website

> Precision-built digital products. A boutique software studio for ambitious companies.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

---

## Overview

This is the official marketing website for **MZ Studio** — a boutique software engineering studio specializing in:

- **Portfolio & Personal Sites** — high-performance, design-forward websites that represent brands honestly
- **Internal Business Systems** — custom CRM, dashboards, and enterprise tooling built for real workflows
- **Educational Platforms** — LMS, course delivery systems, and interactive learning environments

Live at: [mzltd.tech](https://mzltd.tech)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 (utility + CSS variables) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| Theme | next-themes (dark/light system) |
| Deployment | Vercel |

---

## Features

- **Scroll-hijack Process section** with 3D blueprint transition and per-step panel animations
- **Interactive Services cards** with 3D mouse-tilt and domain-specific mockup visuals
- **Projects case study gallery** with modal detail view and iframe previews
- **Dark/light mode** with smooth system detection
- **Unified background grid system** (40px square grid across all sections, diagonal stripes in Hero only)
- **Fully responsive** — mobile-first layout
- **Privacy Policy & Terms of Service** — legally accurate, Egypt-governed
- **Animated logo ticker** of technical infrastructure

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Home page (section assembly)
│   ├── privacy/page.tsx    # Privacy policy
│   └── terms/page.tsx      # Terms of service
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Services.tsx
│   │   ├── Projects.tsx
│   │   ├── LogoTicker.tsx
│   │   ├── Process.tsx
│   │   ├── Team.tsx
│   │   └── CTA.tsx
│   ├── ui/
│   │   └── LinearBackground.tsx
│   └── providers/
│       └── theme-provider.tsx
public/
├── mz-logo.png
├── team/
└── favicon*.png
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Local Development

```bash
# Clone the repo
git clone https://github.com/Ezzio11/mz.git
cd mz

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm run start
```

---

## Design System

All colors are managed through CSS custom properties in `globals.css`:

```css
--background     /* Page background */
--foreground     /* Primary text */
--surface        /* Card/panel background */
--muted          /* Secondary text */
--primary        /* Brand accent (lime green) */
--border         /* Borders and dividers */
--dashboard-bg   /* Dark panel backgrounds */
```

---

## Contact

**hello@mzltd.tech** · Cairo, Egypt · Operating Globally

---

© 2026 MZ Studio. All rights reserved. Proprietary — see [LICENSE](./LICENSE).
