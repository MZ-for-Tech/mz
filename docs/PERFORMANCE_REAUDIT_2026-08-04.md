# Performance Re-Audit — 2026-08-04

Full re-audit after the MzLogo3D flicker/colour work. Measurements are from the
production build in `.next/` plus static import-graph analysis. Numbers marked
**(measured)** came from real file sizes; anything else is inferred from the
import graph and should be confirmed with a profile.

> **Note:** this supersedes the 2026-08-02 pass in `PERFORMANCE_AUDIT.md` for
> the topics it covers. That document is still the reference for the hero LCP
> regression (A1), reduced-motion gaps (A2), and the asset pipeline items — none
> of which are re-litigated here.

---

## 0. TL;DR — answering the `/work/nested-united` question directly

You suspected DarkVeil or the 3D logo. **Both are innocent.**

- `MzLogo3D` is imported only by `app/page.tsx:16` and `app/logo/page.tsx:1`.
  It is **not** in `layout.tsx` or `template.tsx`, so it genuinely does not load
  on `/work/nested-united`. **(measured — grep of the whole tree)**
- `DarkVeil` *is* pulled in via `Footer.tsx:7`, but it is gated behind an
  IntersectionObserver (`Footer.tsx:62`) and sits far below the fold, so it is
  not what you feel on first paint.

**The actual cause: that route ships a 948,581-byte HTML document.** **(measured)**

| Route | Prerendered HTML | RSC payload |
|---|---|---|
| **`/work/nested-united`** | **948,581 B** | **469,873 B** |
| `/` (homepage) | 278,314 B | 9,692 B |
| `/start` | 26,357 B | 9,606 B |
| `/privacy` | 21,949 B | 9,402 B |

That is ~1.4 MB of markup for a page whose entire image payload is only ~250 KB.
The browser must download, parse, and build a DOM for all of it before it can
paint — that is exactly the "bit of lag when it loads" you described.

### Where the 948 KB comes from

The `IconCollage` icons are **inline SVG path data compiled into components**:
**(measured)**

| File | Bytes | Longest `d=` attr |
|---|---|---|
| `ClaudeIcon.tsx` | **157,297** | 144,831 |
| `WavesIcon.tsx` | **114,995** | 114,074 |
| `BowlsIcon.tsx` | 29,361 | 23,081 |
| `GeminiIcon.tsx` | 23,993 | 22,120 |
| `TiktokIcon.tsx` | 18,602 | 17,532 |
| `DotsIcon.tsx` | 12,968 | 11,313 |
| `EyeIcon.tsx` | 6,551 | 5,997 |
| others | ~7,000 | — |

Two compounding problems:

1. **Three icons are rendered TWICE per page load.** `ClaudeIcon`, `TiktokIcon`
   and `LinesIcon` are rendered once inside `IconCollage`
   (`IconCollage.tsx:21, 42, 34`) **and again** directly on the page
   (`page.tsx:88, 102, 74`). `ClaudeIcon` alone is 157 KB of path data emitted
   twice → **~314 KB of duplicated markup**. This is the single biggest win.
2. **`WavesIcon.tsx` (114,995 B) is dead code.** The only references to it are
   its own definition and its own CSS import — nothing imports it. **(measured)**

### Fixes, ranked — all of these preserve motion and detail

**Hard constraint (from the earlier `mz.svg` disaster): never merge, remove, or
reorder paths, and never quantise colours.** Everything below respects that.
See §1 for why "compression" is two different operations and only one is safe.

First, how each icon actually animates — this determines what is safe to move
out of the HTML. **(measured)**

| Icon | Animation target | Can it become an external `.svg`? |
|---|---|---|
| `ClaudeIcon` (157 KB) | **one** `cartwheel` transform on a single wrapping `<g>` (`ClaudeIcon.module.css:9`) | **Yes** — animate the wrapper element instead |
| `GeminiIcon` (24 KB) | one `spark` on a single `<g>` | **Yes** — same pattern |
| `EyeIcon` (6.5 KB) | one `blink` on one path | Yes, but too small to bother |
| `TiktokIcon` | moves `.blackCircle` relative to `.redCircle` | No — animates internals |
| `BowlsIcon` | 6 animations on individual paths + colour swaps | No — must stay inline |
| `LinesIcon` | 4 `drawLine` stroke animations on separate lines | No — must stay inline |
| `CircleIcon` / `DotsIcon` / `SquareIcon` | per-element transforms/colour swaps | No — must stay inline |

The good news: the two biggest offenders (`ClaudeIcon` at 157 KB and
`GeminiIcon` at 24 KB) animate a **single wrapping group**, so moving them to
external files loses nothing — the cartwheel/spark is applied to the `<img>`
or wrapper `<div>` via CSS and looks identical. Icons that animate their
internals stay exactly as they are.

| # | Fix | Est. saving | Motion safe? | Effort |
|---|---|---|---|---|
| 1 | Stop double-rendering `ClaudeIcon`/`TiktokIcon`/`LinesIcon` (see below) | ~330 KB | **Yes — no visual change at all** | low |
| 2 | Delete dead `WavesIcon.tsx` + its CSS (imported nowhere) | 115 KB source | **Yes — it never renders** | trivial |
| 3 | Round coordinate precision in the icon paths (2dp, structure untouched) | ~40 % of what remains | **Yes — sub-pixel, invisible** | low |
| 4 | Move `ClaudeIcon` + `GeminiIcon` to external `.svg`, animate the wrapper | ~180 KB off the HTML | **Yes — single-group transform** | medium |

**Fix #1 is free and is the single biggest win.** `ClaudeIcon` (157 KB of path
data) is currently emitted into the HTML **twice** — once via `IconCollage`
(`IconCollage.tsx:21`) and again directly (`page.tsx:88`). Same for `TiktokIcon`
(`IconCollage.tsx:42` / `page.tsx:102`) and `LinesIcon` (`IconCollage.tsx:34` /
`page.tsx:74`). Two independent renders of identical artwork.

The fix keeps both on screen, animating, exactly as now — define the path data
**once** in an SVG `<symbol>` (or a hidden `<defs>` block) and have both call
sites reference it with `<use href="#claude-icon"/>`. Each `<use>` is a handful
of bytes, keeps its own CSS class, and animates independently. Nothing is
removed from the design; the bytes are just no longer duplicated.

---

## 1. `public/mz.svg` — 948 KB, and how to shrink it *without* losing detail

`public/mz.svg` and `public/mz.original.svg` are **byte-identical at 948,166 B
each**. **(measured)** The SVGO pass that `svgo.config.js` was added for never
took effect — an `.original` backup was made but the working copy was never
replaced. These two files are the only assets over 150 KB and together are 68 %
of the 2.8 MB `public/` directory.

This costs twice on the homepage: a **948 KB download**, and then `SVGLoader`
parses it into **480 `ExtrudeGeometry` instances on the main thread** — the
dominant cause of homepage TBT.

### Why the last attempt destroyed the logo

**"SVG compression" is two unrelated operations, and only one is destructive.**
Conflating them is what turned the logo into a single-colour mess:

| Operation | Effect | Verdict |
|---|---|---|
| Merging/removing paths, quantising colours, `convertShapeToPath`, `mergePaths` | Collapses the 480 paths and 305 colours that *are* the artwork | ☠️ **Never do this** |
| Rounding coordinate **precision** | Shortens number literals; geometry unchanged | ✅ **Safe** |

The paths currently carry values like `106.27734375` and `0.06571452` — **8
decimal places on a 1080-unit viewBox**, i.e. a precision of 0.00000001 px. Two
decimals is still ~100× finer than a single retina pixel. The extra digits are
pure file size describing detail no display or GPU can resolve.

### Measured proof that precision-only rounding is lossless

Rounding every numeric literal to 2 dp, touching nothing structural:
**(measured — run on a copy in `/tmp`, nothing committed)**

```
before bytes : 948,166
after  bytes : 543,893
reduction    : 42.6 %

INTEGRITY CHECK
paths   before/after : 480 / 480          ← no path merged or dropped
colours before/after : 305 / 305          ← every colour preserved
paint-order diff     : IDENTICAL          ← byte-for-byte same colour sequence
```

**42.6 % smaller with all 480 paths, all 305 colours, and the exact paint order
intact.** Paint order is the critical one: `Z_STEP` layering and the per-path
`polygonOffset` both key off path index, so any reordering would resurrect the
gold-slab bug.

### The safe recipe

Do **not** use SVGO's default preset — `mergePaths` and `convertPathData`'s
aggressive modes are what caused the damage. Either disable everything except
precision:

```js
// svgo.config.js — precision only, nothing structural
module.exports = {
  plugins: [
    { name: "cleanupNumericValues", params: { floatPrecision: 2 } },
    { name: "convertPathData", params: {
        floatPrecision: 2,
        // all structural rewrites OFF
        straightCurves: false, lineShorthands: false, curveSmoothShorthands: false,
        convertToZ: false, collapseRepeated: false, utilizeAbsolute: false,
    }},
  ],
};
```

…or skip SVGO entirely and use a plain regex pass that only ever rewrites number
literals — it cannot restructure anything by construction:

```js
// rounds every numeric literal to 2dp; touches no tags, attrs, or colours
s = s.replace(/-?\d+\.\d{3,}/g, m => String(Math.round(parseFloat(m) * 100) / 100));
```

**Mandatory verification before committing** (this is what was skipped last time):

```bash
grep -c '<path' public/mz.svg                                    # must be 480
grep -o 'fill="#[0-9A-Fa-f]*"' public/mz.svg | sort -u | wc -l    # must be 305
diff <(grep -o 'fill="#[0-9A-Fa-f]*"' public/mz.original.svg) \
     <(grep -o 'fill="#[0-9A-Fa-f]*"' public/mz.svg)              # must be empty
```

Keep `mz.original.svg` as the backup so a bad pass is always one `cp` from being
reverted. Then look at the logo before committing.

**Bigger win, zero risk to the artwork:** the 948 KB download and the 480-geometry
parse are separate costs. Even at 544 KB, `SVGLoader` still builds 480 extruded
geometries on the main thread every cold load. Caching the *parsed* result — or
building geometry in a worker — removes the TBT spike without touching the SVG
at all. The file already has a `globalMeshData` module-level cache
(`MzLogo3D.tsx:38`) that survives client-side navigation; it just cannot survive
a hard reload.

---

## 2. three.js ships on the homepage even before the logo renders

`app/page.tsx:16` imports `MzLogo3D` **statically**. That pulls `three` (26 MB
on disk, ~150 KB+ gzipped), `@react-three/fiber`, and `@react-three/drei` into
the homepage's initial JS chunk.

The `isReadyForHeavy` gate at `app/page.tsx:143` **only defers rendering, not
downloading** — the bundle is already fetched and parsed by then. `MzLogo3D`
also uses `import * as THREE from "three"` (`MzLogo3D.tsx:20`), a full namespace
import that defeats tree-shaking.

**Fix:** make it a real code-split, matching what the file already does for
`Waves`/`OcrScanner`/`ServicesAccordion`:

```tsx
const MzLogo3D = dynamic(() => import("@/components/Logo/MzLogo3D"), { ssr: false });
```

This is the highest-impact homepage change and is low-risk, because the
`isReadyForHeavy` gate already handles a late mount.

---

## 3. The R3F canvas renders continuously, even off-screen

`MzLogo3D.tsx` has **no `frameloop` prop** on `<Canvas>` **(measured — grep
returns nothing)**, so it defaults to `"always"`: it runs a full render every
animation frame forever, including when scrolled completely out of view. With
480 meshes and ~305 materials that is a permanent GPU + main-thread tax for the
whole session.

**Fix:** gate the loop on visibility. Either `frameloop="demand"` with
`invalidate()` from the existing `useFrame` animation, or simplest — wrap the
canvas in an IntersectionObserver and switch `frameloop` between `"always"` and
`"never"`. The component already tracks scroll, so the plumbing exists.

---

## 4. The `Environment preset="forest"` is a remote CDN fetch

`MzLogo3D.tsx:490` uses drei's `preset="forest"`, which downloads an HDR from
the drei CDN at runtime. That is a third-party network dependency on your
critical path, and it will block the logo's final appearance. Self-host a small
compressed HDR/EXR in `public/hdr/` and point `Environment files={...}` at it.

---

## 5. Footer's DarkVeil gate thrashes the WebGL context

`Footer.tsx:62` does `{isVisible && <DarkVeil …/>}` driven by an IO at
`Footer.tsx:37-48`. Because this mounts/unmounts the *component*, every scroll
past the footer **destroys and recreates a WebGL context and recompiles the
8-layer CPPN shader**. Shader compilation is one of the most expensive things
you can do at runtime, and this does it repeatedly.

`DarkVeil` already handles off-screen pausing correctly internally
(`DarkVeil.tsx:222-233` stops the rAF loop on IO + tab visibility). So the
Footer gate is not only unnecessary, it is actively harmful.

**Fix:** mount `DarkVeil` unconditionally in the Footer and let its own internal
IO pause the loop. Keeps one context alive, zero recompiles.

---

## 6. Global shell cost on every route

`app/layout.tsx` mounts four client subtrees on **every** route (lines 74, 75,
76, 90), which forces `gsap` (~72 KB), `ScrollTrigger` (~44 KB) and `lenis`
(~32 KB) into the shared bundle even for a text-only page like `/privacy`.

- **`WebMCP.tsx`** — cheap (returns `null`, no rAF/listeners), but its
  `useEffect` has **no cleanup**, so the registered tool context is never torn
  down.
- **`CustomCursor.tsx`** — runs on touch devices where there is no cursor. Gate
  on `matchMedia("(pointer: fine)")` and skip entirely otherwise.
- **`SmoothScrolling.tsx`** (lenis) — a permanent rAF loop on every route.
  Consider scoping it to routes that actually need scroll-driven animation.

---

## 7. Bundle / config gaps

- **`lucide-react` is 40 MB on disk and used for exactly 3 icons**
  (`ArrowLeft` in `app/work/nested-united/page.tsx:6`; `ArrowRight` +
  `Paperclip` in `app/start/page.tsx`). Inline those three as SVGs and drop the
  dependency, or at minimum add `optimizePackageImports`.
- **`next.config.ts` has no performance configuration at all** — no
  `optimizePackageImports`, no image `formats`/`deviceSizes`, no cache
  `headers`. Adding `experimental.optimizePackageImports: ['lucide-react',
  '@react-three/drei']` is a two-line, zero-risk win.
- No bundle analyzer wired up, so regressions like the 948 KB HTML go unnoticed.
  Worth adding `@next/bundle-analyzer` as a dev dependency.
- **Correction to earlier notes:** `framer-motion`, `tesseract.js` and
  `@react-three/postprocessing` are **not** in `package.json` — nothing to drop
  there. `ogl` (used by DarkVeil/Grainient) and `svg-path-bounding-box` are the
  only other non-obvious runtime deps.

---

## 8. WebGL context budget on the homepage

Browsers cap at roughly 16 live WebGL contexts and silently evict the oldest.
Worst case on the homepage: 1 (`DarkVeil` hero) + 1 (`DarkVeil` in Footer) + 1
(`MzLogo3D`) + N (`Grainient`, one per service card in `ServicesBento` —
`ServicesBento.tsx:51, 82, 122`, plus Desktop/MobileServiceCard). With enough
service cards this approaches the eviction threshold, which shows up as
randomly blank canvases.

**Note:** `Waves.tsx` is **not** WebGL — it uses a 2D canvas
(`Waves.tsx:143`), so it costs main-thread JS, not a context.

**Fix:** the `Grainient` instances are the ones to consolidate — either share a
single context across cards, or replace static-looking cards with a still image.

---

## 9. Recommended order of work

Ordered so that **nothing in the first six items can change how anything looks or
moves.** No path is merged, no colour quantised, no animation altered.

| # | Change | Impact | Visual/motion risk |
|---|---|---|---|
| 1 | De-duplicate `ClaudeIcon`/`TiktokIcon`/`LinesIcon` via `<symbol>`+`<use>` | ~330 KB off nested-united | **None** — same elements, same CSS, same motion |
| 2 | Delete dead `WavesIcon` (+ its CSS) | 115 KB source | **None** — never rendered |
| 3 | `dynamic()` import for `MzLogo3D` | three.js off homepage initial bundle | **None** — render already gated |
| 4 | `frameloop` gating on the R3F canvas | stops permanent GPU/CPU burn | **None** — only pauses when off-screen |
| 5 | Remove the Footer `DarkVeil` mount/unmount gate | no more shader recompiles | **None** — DarkVeil self-pauses |
| 6 | `optimizePackageImports`; inline the 3 `lucide-react` icons | bundle size | **None** |
| 7 | Precision-round `mz.svg` to 2 dp (§1 recipe + integrity checks) | 948 KB → 544 KB (**42.6 %, verified lossless**) | **None if the checks pass** — 480 paths / 305 colours / paint order all confirmed intact |
| 8 | Precision-round the icon paths the same way | ~40 % of remaining icon bytes | **None** — same technique |
| 9 | Cache/worker-ise the 480-geometry parse | removes homepage TBT spike | **None** — same geometry, built off the critical path |
| 10 | Move `ClaudeIcon` + `GeminiIcon` to external `.svg`, animate the wrapper | ~180 KB off HTML | **Low** — both animate one wrapping `<g>`, so the transform moves to the wrapper unchanged. Verify the cartwheel/spark visually. |
| 11 | Gate `CustomCursor` on `(pointer: fine)` | mobile CPU | **None** — no cursor exists there |
| 12 | Consolidate `Grainient` WebGL contexts | avoids context eviction | **Low** — verify cards still render |

Items 1–3 are cheap, carry zero visual risk, and account for most of the felt
improvement. **Item 7 is explicitly *not* the operation that broke the logo
before** — see §1 for the distinction between precision rounding (safe, proven)
and path merging (destructive, banned). Items 10 and 12 are the only ones that
warrant a look at the screen before committing.

---

## 10. How to verify

```bash
npm run build
find .next/server/app -name "*.html" -exec ls -l {} \; | awk '{print $5, $9}' | sort -rn
```

Re-run that after items 1–2 and confirm `nested-united.html` drops well below
500 KB. Then Lighthouse on `/work/nested-united` and `/` for TBT/LCP/INP before
and after.
