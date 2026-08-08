# KEELCODE.md

## What this is

`mz` is the marketing/company website for **MZ** (mzfortech.com) — "Research. Software. Knowledge." — a research-driven tech company in Cairo. A single-page marketing site with heavy animation (GSAP scroll choreography, Lenis smooth scrolling, ogl WebGL shader backgrounds, a three.js 3D logo) plus an AI/agent discoverability layer (`llms.txt`, markdown content negotiation, `public/.well-known/`). One product is showcased: "Occhio", an Arabic-first OCR, currently IN DEVELOPMENT.

## Stack

- **Next.js 16.2.10** (App Router, root-level, no `src/`) + **React 19** + **TypeScript 5.9** (strict)
- **npm** (package-lock.json v3) — single package, no workspaces
- Animation: GSAP 3.15 + @gsap/react, Lenis 1.3; WebGL: ogl, three + @react-three/fiber 9 + drei 10; icons: lucide-react
- Styling: plain **CSS modules + CSS custom properties** (no Tailwind, no CSS-in-JS)

> **Warning (AGENTS.md):** This Next.js version has breaking changes vs. common training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. E.g. there is no `middleware.ts` — it is `proxy.ts` at the project root.

## Commands

```sh
npm install       # install deps
npm run dev       # next dev
npm run build     # next build (includes typecheck — tsconfig is noEmit)
npm run start     # next start
npm run lint      # eslint (flat config; only quality gate)
```

- **No tests exist** — no test framework, no test script, no `*.test.*` files. Do not assume vitest/jest.
- **No typecheck script** — `tsc` runs via `next build`; ad hoc: `npx tsc --noEmit`.
- **No CI, no git hooks, no prettier.** Deploy is manual (Vercel). Commits are loosely Conventional Commits (`feat: ...`, `fix: ...`).

## Structure

| Path | Role |
|---|---|
| `app/` | Routes: `/` (page.tsx), `/logo`, `/privacy`, `/start`, `/work/nested-united`, `not-found`. Global `layout.tsx`, `template.tsx` (page-transition wipe), `globals.css` (design tokens) |
| `components/` | Feature folders `<FeatureName>/<FeatureName>.tsx` + `<FeatureName>.module.css`; `sections/` for page sections (WorkGrid); `nested/` is legacy/archived sub-site |
| `lib/` | Shared utilities: `gsap.ts` (GSAP/ScrollTrigger registration), `projects.ts` (PROJECTS data model), `useReducedMotion.ts` |
| `public/` | Static assets: `content.md`, `llms.txt`, `sitemap.xml`, `robots.txt`, `mz.svg`, `nested/` project assets, `.well-known/` agent-discovery files |
| `docs/` | `PERFORMANCE_AUDIT.md` (perf/craft audit — read for known regressions and dead code), `MZLOGO3D_FIX_PLAN.md` |
| `proxy.ts` | Next 16 middleware replacement: markdown content negotiation + AI-discovery `Link` headers |
| Config | `next.config.ts` (security/AI headers, AVIF/WebP), `tsconfig.json`, `eslint.config.mjs`, `svgo.config.js` |

## Key files to read first

1. `docs/PERFORMANCE_AUDIT.md` — best orientation: heavy components mapped to file:line, open regressions, dead code
2. `app/page.tsx` — homepage composition and deferred-hydration/perf-gating patterns
3. `app/template.tsx` + `components/TransitionLink/TransitionLink.tsx` — custom page-transition system (exit overlay → router.push → entry wipe → `mz-transition-done` event)
4. `components/DarkVeil/DarkVeil.tsx` — the ogl shader background reused across pages
5. `lib/gsap.ts` + `lib/projects.ts` — animation registration and the work/projects data model

## Conventions

- **Alias:** `@/*` maps to the **project root** (not `src/`); code lives at top level. Imports mix `@/` and relative — no enforced ordering.
- **Naming:** component folders/files PascalCase, paired with a `.module.css`; hooks `useXxx` in `lib/`; UPPER_SNAKE constants; both named and default exports in use. Style: double quotes, semicolons, 2-space indent.
- **Routing:** App Router route folders, lowercase.
- **State:** React only (`useState`/`useEffect`/`useRef`) plus a window-level `CustomEvent` bus (`mz-transition-done` / `mz-transition-start`). No redux/zustand. Animation coordinated via GSAP + Lenis (Lenis ↔ GSAP ticker bridge in `SmoothScrolling`).
- **Styling:** CSS custom properties in `app/globals.css` (`--color-acid-green`, `--color-brand-yellow`, radius/spacing tokens), dark default theme with `:root[data-theme="light"]` override; fonts via next/font (Geist, JetBrains Mono, Cormorant Garamond, Red Hat Display).
- **Env vars:** none used; `.env*` fully gitignored, no `.env.example`. Site URL `https://mzfortech.com` is hardcoded in `next.config.ts`, `app/layout.tsx`, `proxy.ts`.
- **Performance is a first-class concern:** heavy WebGL/animation components are deferred and gated (reduced-motion, power, `mz-transition-done`). Keep that pattern for new animated work; avoid adding to the homepage's six concurrent GPU contexts.

## Gotchas

- `next.config.ts:reactStrictMode` is on.
- `svgo.config.js` is CommonJS (`module.exports`); `eslint.config.mjs` is ESM.
- `--color-acid-green-rgb` in `globals.css:11` looks stale (`0, 255, 65` vs hex `#88b600`) — pre-existing quirk, don't "fix" silently.
- The dynamic `[slug]` work route was deliberately removed; `/work/nested-united` is a static case-study page.
