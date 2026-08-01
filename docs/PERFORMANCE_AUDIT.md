# MZ — Performance & Interaction Audit

**Scope:** `app/`, `components/`, `lib/`, `public/`, `next.config.ts`, `package.json`
**Date:** 2026-08-01
**Commit:** `f5c96bd`
**Method:** Static read of source. Every claim below cites a file and line. Where I could not verify something, I say so explicitly rather than assume.

---

## 1. Current Stack Assessment

| Package | Version | Where it's used | Verdict |
|---|---|---|---|
| `next` | 16.2.10 | — | Justified |
| `react` / `react-dom` | 19.2.7 | — | Justified |
| `gsap` + `@gsap/react` | 3.15 | `lib/gsap.ts`, `app/page.tsx`, `CustomCursor`, `Preloader`, `TransitionLink`, `ServicesAccordion` | Justified — this is the primary motion system |
| `lenis` | 1.3.25 | `SmoothScrolling.tsx` (root) | Justified, misconfigured (§3.2) |
| `three` + `@react-three/fiber` + `@react-three/drei` | 0.185 / 9.6 / 10.7 | `MzLogo3D.tsx` only | Justified for the hero, but unsplit (§2.1) |
| `ogl` | 1.0.11 | `DarkVeil.tsx`, `Grainient.tsx` | Justified — correct choice, far lighter than three for fullscreen shaders |
| `framer-motion` | 12.42.2 | **`app/template.tsx` only** | **Technical debt** — see below |
| `lucide-react` | 1.24.0 | — | Second icon library |
| `react-icons` | 5.7.0 | — | Third-party icon library #2 |
| `jsdom` | 29.1.1 | **Nothing** | **Dead dependency** |
| `tailwindcss` + `@tailwindcss/postcss` | 4 | **Nothing** | **Dead config surface** |
| `svg-path-bounding-box` | 1.0.4 | Not found in `app/`, `components/`, `lib/` | Likely dead — verify before removing |

### What's honest technical debt

**`framer-motion` exists to animate five `<div>`s.**
`app/template.tsx` is the only consumer. It animates 5 columns from `y: -15vh` to `y: -130vh` with a cubic bezier — and the comment on line 55 literally says `// Exact match for power4.inOut`, i.e. it is deliberately reproducing a GSAP ease. GSAP is already loaded on every page via `lib/gsap.ts`. You are shipping an entire second animation runtime to duplicate an easing curve you already have.

**Tailwind is installed but not wired.**
There is no `postcss.config.*` in the repo and no `@import "tailwindcss"` in `app/globals.css`. The dependency and its PostCSS plugin are installed and do nothing. All styling is CSS Modules + `globals.css` custom properties — which is a perfectly good choice. Commit to it.

**`jsdom` is in `dependencies`, not `devDependencies`, and is imported nowhere.** It is one of the heaviest packages on npm. It won't reach the browser bundle (nothing imports it), but it bloats `node_modules`, install time, and your deployment image.

**Two icon libraries.** `lucide-react` and `react-icons` both present. Pick one.

**`components/Preloader/Preloader.tsx` is dead code.** Grep for `Preloader` outside its own directory returns nothing — it is not mounted in `layout.tsx`, `template.tsx`, or `page.tsx`. This matters because line 11 does a module-load-time `fetch('/mz.svg')` — and `public/mz.svg` is **928KB**. Since the module is never imported, that fetch never fires today. But the file is a loaded gun: import it once and you add a 928KB blocking fetch plus `@react-three/drei`'s `useProgress` to your critical path. Delete it or finish it.

### What's justified

The `ogl` choice for `DarkVeil` and `Grainient` is correct — using `three` for a fullscreen quad shader would be a mistake, and you avoided it. The data-oriented `Float32Array` particle layout in `DataStreamHero.tsx` (lines 42–117), including the sort-by-size pass to batch `ctx.font` state changes, is genuinely good engineering. `Waves.tsx` has a real mobile point budget (line 174: `TARGET_POINTS = isMobile ? 600 : 2000`). Somebody here knows what they're doing. The problems below are gaps in coverage, not incompetence.

---

## 2. Critical Performance Issues

Four issues materially hurt Core Web Vitals or perceived smoothness. Ranked by impact.

### 2.1 — The entire homepage is one client bundle with zero code splitting

**What it is.** `app/page.tsx` line 1 is `"use client"`. Lines 2–22 statically import `DataStreamHero`, `Waves`, `OcrScanner`, `DarkVeil`, `MzLogo3D`, `ServicesAccordion`, `PremiumShowcase`, `Manifesto`, `WorkGrid`, `PillNav`, `Footer`. `MzLogo3D.tsx` in turn statically imports `three`, `@react-three/fiber`, `@react-three/drei`, and `three/examples/jsm/loaders/SVGLoader.js`.

`grep -rn "next/dynamic" app components` returns **nothing**. There is not a single dynamic import in the codebase.

**Why it hurts.** `three` + `drei` + `fiber` is roughly 600KB+ minified before your own code. It all lands in the initial JS payload for `/`, is parsed and compiled on the main thread before hydration completes, and blocks INP/TBT. This is your single largest CWV cost. It hurts worst on exactly the device you care about — a 2022 mid-range Android parses JS 4–6× slower than a desktop.

The irony: `MzLogo3D` is already gated at runtime (`app/page.tsx` line 198, `{isReadyForHeavy && <MzLogo3D .../>}`), so you deliberately delay *rendering* it — but you still *download and parse* the whole of three.js up front. The gate buys you nothing on bundle cost.

**Exact fix.** Convert the runtime gate into a load-time gate.

```tsx
// app/page.tsx — replace the static import on line 14
import dynamic from "next/dynamic";

const MzLogo3D = dynamic(() => import("@/components/Logo/MzLogo3D"), {
  ssr: false,
  loading: () => null,
});
```

Do the same for the other below-the-fold heavy components. `DarkVeil` is in the hero and should stay static; `Waves`, `OcrScanner` and `ServicesAccordion` (which pulls `ServicesBento` → `Grainient` → `ogl`) should not be:

```tsx
const Waves        = dynamic(() => import("@/components/Waves/Waves"), { ssr: false });
const OcrScanner   = dynamic(() => import("@/components/OcrScanner/OcrScanner").then(m => m.OcrScanner), { ssr: false });
const ServicesAccordion = dynamic(() => import("@/components/ServicesAccordion/ServicesAccordion"), { ssr: false });
```

Because `MzLogo3D` is already behind `isReadyForHeavy`, the dynamic chunk won't even begin fetching until the page transition completes — exactly the behaviour you want.

---

### 2.2 — A 196KB inline SVG logo renders in the root layout on every route

**What it is.** `components/Logo/MzLogo.tsx` is **196KB** in 18 lines — a wall of hardcoded `<path d="M0 0 C5.93951327 -0.04190541 ...">` data with 8-decimal-precision coordinates. It is rendered in `app/layout.tsx` (line 60) inside the fixed-position header link, so it is on **every single page**.

**Why it hurts.** This 196KB is not an image the browser can cache separately, defer, or lazy-load. It is JSX. It ships in the client bundle *and* is serialized into the RSC/HTML payload on every navigation. It inflates HTML transfer size, parse time, and DOM node count — for a mark displayed at `100×100px` on desktop and `40px` tall on mobile (`globals.css` lines 109–112).

Many of these paths are also visually meaningless at that size. Lines 6–11 include paths like `<path d="M0 0 C0.99 0.495 0.99 0.495 2 1 ..." fill="#121213"/>` — 16-unit-tall shards in a 1254-unit viewBox, rendering at well under one physical pixel. There is even an empty path: `<path d="" fill="#000000" transform="translate(0,0)"/>`.

**Exact fix.** This should be a static asset, not a component. Two steps:

```bash
# 1. Extract to a file and simplify. svgo will drop the empty path,
#    round coordinates to 2dp, and merge paths.
npx svgo --precision=2 --multipass -i public/mz-logo.svg -o public/mz-logo.min.svg
```

```tsx
// 2. app/layout.tsx — replace <MzLogo /> with a real image
import Image from "next/image";

<Image
  src="/mz-logo.min.svg"
  alt="MZ"
  width={100}
  height={100}
  priority
  className="layout-logo-img"
/>
```

Expect the 196KB to drop to single-digit KB, cached independently of your JS, and removed from every HTML payload. If you need `currentColor` behaviour for the `mix-blend-mode: difference` treatment in `globals.css`, keep the CSS filter approach already on line 92 (`filter: brightness(0) invert(1)`) — it works on an `<img>` exactly as it does on inline SVG.

---

### 2.3 — `DarkVeil` runs forever at 2× DPR and never pauses

**What it is.** `components/DarkVeil/DarkVeil.tsx` is the fullscreen WebGL shader behind the hero (`app/page.tsx` line 180). Two problems, both verified by grep:

1. Line 109: `dpr: Math.min(window.devicePixelRatio, 2)`
2. There is **no `IntersectionObserver` and no `visibilitychange` listener** anywhere in the file. The only listeners are `resize` (line 141) and the unconditional `requestAnimationFrame(loop)` on line 177.

**Why it hurts.** At `dpr: 2` on a 1080p phone you are running a per-pixel noise + scanline + warp fragment shader over ~2.1M fragments, every frame, forever. It continues at full rate when the user has scrolled a full viewport past the hero, and it continues when the browser tab is in the background.

This is inconsistent with the rest of your own codebase, which gets this right: `Grainient.tsx` caps at `dpr: Math.min(window.devicePixelRatio || 1, 1)` (line 194) and has both an `IntersectionObserver` (line 271) and a `visibilitychange` handler (line 284). `Waves.tsx` has an IO gate (line 355). `DataStreamHero.tsx` has an IO gate (line 203). `DarkVeil` is the one component that was missed.

**Exact fix.** Port the exact pattern from `Grainient.tsx` into `DarkVeil.tsx`.

```ts
// components/DarkVeil/DarkVeil.tsx — line 109
const renderer = new Renderer({
  dpr: Math.min(window.devicePixelRatio || 1, 1.5), // 2 -> 1.5; use 1 if you can accept it
});
```

```ts
// Replace the bare `frame = requestAnimationFrame(loop)` (line 177) with gated start/stop.
let frame = 0;
let isVisible = true;
let isPageVisible = !document.hidden;

const tryStart = () => {
  if (isVisible && isPageVisible && frame === 0) frame = requestAnimationFrame(loop);
};
const tryStop = () => {
  if (frame !== 0) { cancelAnimationFrame(frame); frame = 0; }
};

const io = new IntersectionObserver(
  ([entry]) => { isVisible = entry.isIntersecting; isVisible ? tryStart() : tryStop(); },
  { threshold: 0 }
);
io.observe(container);

const onVisibility = () => {
  isPageVisible = !document.hidden;
  isPageVisible ? tryStart() : tryStop();
};
document.addEventListener("visibilitychange", onVisibility);

tryStart();

// in the cleanup return:
tryStop();
io.disconnect();
document.removeEventListener("visibilitychange", onVisibility);
```

---

### 2.4 — `Waves` registers a `{ passive: false }` touchmove listener on `window` and never calls `preventDefault`

**What it is.** `components/Waves/Waves.tsx` line 377:

```ts
window.addEventListener('touchmove', onTouchMove, { passive: false });
```

`onTouchMove` (lines 337–340) reads `e.touches[0]` and calls `updateMouse`. Grep for `preventDefault` in the file returns **nothing**.

**Why it hurts.** `passive: false` tells the browser "this handler *might* call `preventDefault()`, so you must not start scrolling until it returns." The browser therefore disables its off-main-thread scroll fast path for every touchmove on the entire window — including on pages and sections where `Waves` isn't even visible. You pay the full cost and get zero benefit, because the handler never cancels anything.

This is a direct, measurable cause of scroll jank on touch devices, and it applies site-wide because the listener is on `window`, not the container.

**Exact fix.** Two lines.

```ts
// components/Waves/Waves.tsx line 377
window.addEventListener('touchmove', onTouchMove, { passive: true });
```

```ts
// and the matching removal on line 383 — options must match to remove correctly
window.removeEventListener('touchmove', onTouchMove);
```

While you are in this file: `updateMouse` (line 341) calls `container.getBoundingClientRect()` on **every** mousemove and touchmove. That is a forced synchronous layout read on the highest-frequency events in the browser. Cache it — you already have `boundingRef` populated by `setSize()` (line 161), so use it:

```ts
function updateMouse(x: number, y: number) {
  if (!container) return;
  const rect = boundingRef.current;   // was: container.getBoundingClientRect()
  const mouse = mouseRef.current;
  mouse.x = x - rect.left;
  mouse.y = y - rect.top;
  // ...
}
```

You will need `setSize()` to store `left`/`top` into `boundingRef` alongside width/height.

---

## 3. Animation & Motion Audit

### 3.1 — Hero scroll animations are unreachable dead code ⚠️

This is the most important finding in this section, and it is a correctness bug, not a performance one.

In `app/page.tsx`, the `useGSAP` callback beginning at line 51 contains this at lines 108–112:

```tsx
window.addEventListener('mz-transition-done', playWhenReady, { once: true });

return () => {
  window.removeEventListener('mz-transition-done', playWhenReady);
};

// Hero Parallax on Scroll
gsap.to(".hero-word", {
  scale: 0.85, opacity: 0, y: -100, ease: "none",
  scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true }
});

// Partners Animation
gsap.to("[data-partner-logo]", { opacity: 0.6, x: 0, duration: 1, ... });

const caseItems = gsap.utils.toArray(".case-item") as HTMLElement[];
caseItems.forEach(item => { gsap.fromTo(item, { ... }); });
```

**Everything after the `return` never executes.** The hero word parallax, the partner-logo reveal, and the case-item scroll reveals do not exist at runtime. You have the code, you're paying for it in bundle size, and none of it runs.

You can confirm this is unintended: the `prefers-reduced-motion` branch at line 56 explicitly resets `.hero-word, .hero-subtext, .scroll-indicator-line, .case-item` — the author clearly believed all four were being animated.

The reason it isn't visually obvious is that `.caseItem` in `page.module.css` (line 609) has no `opacity: 0` initial state, so the items render normally — they just never animate in.

**Fix.** Move the cleanup to the end of the callback.

```tsx
useGSAP(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) { /* ... unchanged ... */ return; }

  const playHeroAnimation = () => { /* ... unchanged ... */ };

  gsap.set(".hero-word-inner", { y: 30, opacity: 0 });
  gsap.set(".hero-subtext, .hero-desc, .hero-scroll-wrapper, .hero-action-wrapper", { opacity: 0, y: 10 });

  const playWhenReady = () => {
    window.removeEventListener('mz-transition-done', playWhenReady);
    playHeroAnimation();
  };
  window.addEventListener('mz-transition-done', playWhenReady, { once: true });

  // --- everything that was previously dead now lives here ---
  gsap.to(".hero-word", {
    scale: 0.85, opacity: 0, y: -100, ease: "none",
    scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true },
  });

  gsap.to("[data-partner-logo]", { opacity: 0.6, x: 0, duration: 1 /* ... */ });

  const caseItems = gsap.utils.toArray(".case-item") as HTMLElement[];
  caseItems.forEach((item) => { gsap.fromTo(item, /* ... */); });

  // --- cleanup last ---
  return () => {
    window.removeEventListener('mz-transition-done', playWhenReady);
  };
});
```

Note `useGSAP` already reverts tweens/ScrollTriggers created inside its scope, so you do not need to kill them manually.

**When you enable these, audit the properties.** `scale`, `opacity` and `y` are all compositor-friendly. Good. But the reduced-motion branch resets `filter: "blur(0px)"`, implying a blur animation exists somewhere — and `page.module.css` line 1145 declares `will-change: opacity, transform, filter`. **Animating `filter: blur()` on scroll-scrub is not GPU-cheap**; it forces a re-rasterisation per frame and is a known killer on Mali/Adreno mid-range GPUs. If you reintroduce a scrubbed blur, cap it (`blur(0px) → blur(4px)` max), or drop it on mobile via `gsap.matchMedia()`.

---

### 3.2 — Lenis and ScrollTrigger are not integrated

**Config smell.** `SmoothScrolling.tsx` line 44:

```tsx
<ReactLenis root options={{ lerp: 0.06, duration: 1.1, smoothWheel: true }}>
```

`lerp` and `duration` are mutually exclusive in Lenis — when `lerp` is set it takes precedence and `duration` is ignored. So `duration: 1.1` is doing nothing, and your actual feel is governed by `lerp: 0.06`, which is very low. A lerp that low produces a long, floaty tail that reads as *lag* rather than *smoothness* on a slower device, because the visual position trails the input by many frames. For a premium feel, `0.1`–`0.125` is the range most SOTD sites sit in.

**The real problem: no ScrollTrigger integration.** Grep across the codebase finds no `lenis.on('scroll', ScrollTrigger.update)` and no `ScrollTrigger.scrollerProxy`. `SmoothScrolling.tsx` only calls `ScrollTrigger.refresh()` after a route change (line 32).

ScrollTrigger therefore updates from native scroll events while Lenis is driving the scroll position in its own rAF. It broadly *works* — Lenis calls `window.scrollTo`, so native events do fire — but the two run on separate ticks, so scrubbed animations land one frame behind the smoothed scroll position. This is precisely the "almost smooth but subtly off" feeling that separates a shortlist entry from a winner. It will become obvious the moment you fix §3.1 and the `scrub: true` hero parallax starts running.

**Fix.**

```tsx
// components/SmoothScrolling/SmoothScrolling.tsx
import { ReactLenis, useLenis } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

function LenisGsapBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // 1. Drive ScrollTrigger from Lenis' own scroll callback
    lenis.on("scroll", ScrollTrigger.update);

    // 2. Drive Lenis from GSAP's ticker so both share one rAF loop
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
    };
  }, [lenis]);

  return null;
}
```

Mount `<LenisGsapBridge />` alongside `<ScrollToTopOnRouteChange />`. Then disable Lenis' internal rAF so it isn't running twice:

```tsx
<ReactLenis root options={{ lerp: 0.11, smoothWheel: true, autoRaf: false }}>
```

This collapses two independent rAF loops into one and removes the one-frame scrub lag. It is the single highest-leverage change for perceived smoothness in this codebase.

---

### 3.3 — Seven simultaneous WebGL contexts

Counting live contexts on `/`:

| Component | Contexts | Source |
|---|---|---|
| `DarkVeil` | 1 | `app/page.tsx` line 180 |
| `MzLogo3D` (three.js) | 1 | `app/page.tsx` line 198 |
| `Grainient` in `ServicesBento` | 3 | `ServicesBento.tsx` lines 51, 82, 122 |
| `Grainient` in `DesktopServiceCard` | 1 | line 19 |
| `Grainient` in `MobileServiceCard` | 1 | line 23 |
| **Total** | **7** | |

**Why it hurts.** Mobile Chrome caps live WebGL contexts (commonly 8, sometimes fewer under memory pressure) and evicts the oldest with a `webglcontextlost` event. Nothing in `Grainient.tsx` or `DarkVeil.tsx` listens for `webglcontextlost`, so an evicted context leaves a permanently blank card with no recovery. At 7 contexts you are one component away from this happening on real devices.

Each context also carries fixed cost: its own GL state, its own framebuffer allocation, its own shader compile (the `Grainient` fragment shader includes a 2D value-noise function, compiled 5 times over).

**To `Grainient`'s credit** it does the right things per-instance: `dpr` capped at 1 (line 194), `IntersectionObserver` (line 271), `visibilitychange` (line 284), a `WeakMap` to keep the context alive across re-renders (line 151), and uniform updates that never rebuild the context. The design is sound. There are just too many of them.

**Fix — pick one:**

- **(a) Preferred.** These are decorative card backgrounds. Render the shader **once** to an offscreen canvas and reuse it as a CSS `background-image` on the other four, or share a single context and render 5 viewports into it via `gl.viewport` + `gl.scissor`.
- **(b) Cheapest.** Only `DesktopServiceCard` **or** `MobileServiceCard` is visible at a given breakpoint — confirm they are mutually exclusive at render time (not just CSS-hidden), which drops you to 6. Then gate the three `ServicesBento` instances so only the hovered/active card runs a live shader and the rest show a static first-frame snapshot.
- **(c) Minimum viable.** Add context-loss recovery so a lost context is not a permanent visual bug:

```ts
// components/Grainient/Grainient.tsx — after `const canvas = gl.canvas as HTMLCanvasElement;`
const onLost = (e: Event) => { e.preventDefault(); tryStop(); };
canvas.addEventListener("webglcontextlost", onLost, false);
// remember to removeEventListener in cleanup
```

---

### 3.4 — `Grainient`'s `paused` prop does not work

`Grainient.tsx` Effect 3 (lines 352–359) fires on `paused` changes and does this:

```ts
window.dispatchEvent(new Event('grainient-toggle'));
```

**Nothing listens for `grainient-toggle`.** Grep confirms zero listeners. Effect 1's `tryStart`/`tryStop` closures only consult `pausedRef.current` at the moment they happen to be called (via the IO or visibility handlers) — so pausing a visible, foregrounded `Grainient` has no effect at all.

**Fix.** Delete Effect 3 and drive it from a real effect:

```ts
// Replace Effect 3 entirely
useEffect(() => {
  const container = containerRef.current;
  if (!container) return;
  const ctx = ctxMap.get(container);
  if (!ctx) return;
  ctx.setPaused?.(paused);   // expose setPaused from Effect 1 via the ctxMap entry
}, [paused]);
```

and in Effect 1, store the controls on the map entry:

```ts
ctxMap.set(container, {
  renderer, program, mesh,
  setPaused: (p: boolean) => { pausedRef.current = p; p ? tryStop() : tryStart(); },
});
```

Also in Effect 2: `updateUniforms` allocates three `new Float32Array` per call and calls `resolveColor` ×3, each of which runs `getComputedStyle(document.documentElement)` — a forced style recalculation. This runs on every theme change across all 5 instances (15 `getComputedStyle` calls). Resolve the three colours **once** at the `MutationObserver` level and pass the resulting arrays down, and mutate the existing `Float32Array` in place (`u.uColor1.value.set([r,g,b])`) instead of reallocating.

---

### 3.5 — `DataStreamHero`: 1500 `fillText` calls per frame

`DataStreamHero.tsx` targets 1500 particles (line 56) and calls `ctx.fillText(...)` once per particle per frame (line 197).

**Assessment against the 60fps mid-range Android bar: this will not make it.** Canvas 2D text rendering is the most expensive primitive in the API — each call involves glyph lookup, shaping, and rasterisation. 1500 of them per frame gives you a ~0.011ms budget per glyph to hit 16.7ms. A 2022 mid-range Android will not do that.

The physics loop itself is well written (typed arrays, squared-distance comparison on line 171 avoiding `sqrt` in the common case, size-sorted to batch `ctx.font` writes). The bottleneck is purely the glyph rasterisation.

**Fix — render glyphs once to a sprite atlas, then `drawImage`:**

```ts
// Build once, after fonts are ready. One offscreen canvas holding each symbol
// at each distinct size. ~17 symbols x a handful of sizes = a small atlas.
const atlas = document.createElement('canvas');
const actx = atlas.getContext('2d')!;
// ... draw each SYMBOLS[i] at each size into a known cell ...

// Then in the hot loop, replace ctx.fillText(...) with:
ctx.drawImage(atlas, cellX, cellY, cellW, cellH, px, py, cellW, cellH);
```

`drawImage` from a canvas source is a straight blit — typically 5–15× faster than `fillText`. Combine with a device-tier particle budget:

```ts
const isLowEnd = navigator.hardwareConcurrency <= 4 || window.innerWidth < 768;
const TARGET_PARTICLES = isLowEnd ? 400 : 1500;
```

**Separate bug in the same file.** Line 195:

```ts
ctx.font = `${currentSize}px "Cormorant Garamond", serif`;
```

`Cormorant_Garamond` is loaded through `next/font/google` in `app/layout.tsx` (line 17), which generates a **hashed family name** (e.g. `__Cormorant_Garamond_a1b2c3`) and exposes it only via the `--font-serif` CSS variable. The literal string `"Cormorant Garamond"` does not match any registered family, so this canvas silently falls back to generic `serif`. Fix by reading the variable:

```ts
const serif = getComputedStyle(document.documentElement)
  .getPropertyValue('--font-serif').trim() || 'serif';
// hoist out of the loop, then:
ctx.font = `${currentSize}px ${serif}`;
```

Also add a `visibilitychange` guard — this component has IO gating (line 203) but keeps running when the tab is backgrounded.

---

### 3.6 — `GradualBlur`: five stacked `backdrop-filter` layers

`GradualBlur.tsx` lines 185–213 generate `divCount` absolutely-positioned divs, each with `backdropFilter: blur(Npx)`. `PremiumShowcase.tsx` instantiates it with `divCount={5}`, `height="35vh"`, `strength={2}`, `exponential`, `position: sticky`.

**Why it hurts.** `backdrop-filter` is among the most expensive compositor operations on mobile GPUs — it requires reading back and blurring everything painted behind the element. Five of them stacked means five separate backdrop reads over a 35vh sticky region, re-evaluated on every scroll frame because the content behind is moving.

**Mitigating factor I could not fully verify:** it is passed `className={styles.desktopBlur}`. The name implies it is hidden below a breakpoint. **Confirm this**, and if it isn't hard-gated, gate it:

```css
/* components/PremiumShowcase/PremiumShowcase.module.css */
@media (max-width: 768px) {
  .desktopBlur { display: none; }
}
```

`display: none` (not `opacity: 0` or `visibility: hidden`) is required — the latter two still incur the backdrop cost. On desktop, drop `divCount` from 5 to 3; the visual difference in a gradient blur ramp is imperceptible and you remove 40% of the passes.

---

### 3.7 — Page transitions serialise a full second before navigation starts

`TransitionLink.tsx` builds a 5-column overlay, runs a 0.9s GSAP timeline with a 0.04s stagger (total ≈1.06s), and only then:

```ts
await tl.play();
window.scrollTo(0, 0);
router.push(href, { scroll: true });
```

`await` on a GSAP timeline is valid — GSAP 3 `Animation` implements `.then()` — so this works as written. The problem is ordering: the network request for the next route does not begin until the wipe has fully finished. You are adding ~1.06s to every internal navigation on top of the actual navigation time.

**Fix.** Start the navigation in parallel with the animation, and prefetch on intent:

```tsx
const handleTransition = async (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  const targetUrl = new URL(href, window.location.href);
  if (targetUrl.pathname === window.location.pathname) return;

  // ... build overlay as before ...

  const tl = gsap.timeline();
  tl.to(cols, { y: "-15vh", duration: 0.9, ease: "power4.inOut", stagger: 0.04 });

  // Kick the navigation off immediately — React will suspend and swap
  // when ready, while the wipe covers the screen.
  router.push(href, { scroll: true });

  await tl;
  window.scrollTo(0, 0);
};

// and on the <Link>:
onMouseEnter={() => router.prefetch(href)}
```

The overlay covers the viewport for the whole wipe, so an early swap is invisible — you just stop paying for it twice.

---

### 3.8 — What's already correct

Credit where due, so you don't "fix" these:

- **`CustomCursor`** uses `gsap.quickTo` on `x`/`y` (lines 28–29) — transform-only, no layout, correctly disabled on touch via `matchMedia("(hover: none)")` (line 19), and it mirrors state into refs (lines 13–14) to avoid a React re-render per mousemove. This is textbook.
- **`template.tsx`** animates only `y` on 5 divs — compositor-only. The comment at line 78 explaining why children are *not* wrapped in a `motion.div` (it would break `position: fixed` and ScrollTrigger) shows real understanding.
- **`Waves`** mobile point budget (line 174) and IO gate with `rootMargin: '100px'` (line 371) are both right.
- **`MzLogo3D`** uses drei's `PerformanceMonitor` with adaptive `dpr` starting at `1.0` (line 428) — adaptive quality is exactly the correct strategy for the mid-range Android target.

---

## 4. Asset Pipeline

### 4.1 Images

**Current state.** `public/` totals ~4.5MB across 7 raster/vector assets:

| File | Size | Used by |
|---|---|---|
| `green_glass.jpg` | **2.27 MB** | `PremiumShowcase.tsx` line 21 |
| `mz.svg` | **948 KB** | `Preloader.tsx` line 11 (dead code) |
| `logo.png` | 444 KB | Not referenced in `app/` or `components/` |
| `mz-logo.png` | 360 KB | Not referenced |
| `mz-logo.svg` | 197 KB | Not referenced |
| `nested-logo.png` | 151 KB | `app/page.tsx` line 312 |
| `ef-logo.png` | 77 KB | `app/page.tsx` line 318 |
| `logo-watermark.png` | 45 KB | Not referenced |
| `feps-logo.png` | 36 KB | `app/page.tsx` line 315 |

`next/image` is used in only two files: `app/work/[slug]/page.tsx` and `PremiumShowcase.tsx`.

**What's wrong.**

**(a) A 2.27MB below-the-fold image is marked `priority` *and* `loading="eager"`.** `PremiumShowcase.tsx` lines 20–28:

```tsx
<Image src="/green_glass.jpg" fill sizes="..." priority loading="eager" ... />
```

`PremiumShowcase` renders *after* the sticky hero (`app/page.tsx` line 258) — it is not the LCP element. `priority` injects a `<link rel="preload">` into `<head>`, so this image competes for bandwidth with the actual hero at the exact moment LCP is being decided. `priority` and `loading="eager"` are also redundant — `priority` already implies eager.

**Fix:**
```tsx
<Image
  src="/green_glass.jpg"
  alt="Abstract Green Glass 3D Shape"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  quality={70}
  className={styles.demoImage}
/>
```
Drop `priority` and `loading` entirely — the default lazy behaviour is correct here. Then re-encode the source; 2.27MB for a decorative abstract render is 10× more than needed:
```bash
# Source is displayed at 33vw on desktop — 1600px wide is generous
npx sharp-cli -i public/green_glass.jpg -o public/green_glass.webp resize 1600 -- webp --quality 72
```

**(b) Partner logos have no intrinsic dimensions and will shift layout.** `app/page.tsx` lines 312–318:

```tsx
<Image src="/nested-logo.png" alt="Nested" width={300} height={140}
       style={{ width: "auto", height: "auto" }} />
```

Setting **both** `width: auto` and `height: auto` in CSS discards the aspect-ratio box that `width`/`height` were supposed to reserve. The browser has no dimensions until the PNG decodes → guaranteed CLS. `ef-logo` additionally has `transform: scale(1.5)` (line 318), meaning the layout box and the painted size disagree by 50%.

**Fix:** pin one axis and let the other derive.
```tsx
<Image src="/nested-logo.png" alt="Nested" width={300} height={140}
       style={{ height: "40px", width: "auto" }} />
```
And bake the 1.5× into the `ef-logo.png` asset itself rather than a transform, so the layout box is honest.

**(c) Four unreferenced logo files totalling ~1.05MB** (`logo.png`, `mz-logo.png`, `mz-logo.svg`, `logo-watermark.png`). They aren't downloaded by users, but they are deployed. Delete or move out of `public/`.

**(d) No `images` config in `next.config.ts`.** The entire config is `headers()`. Add explicit modern formats:

```ts
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  async headers() { /* ... unchanged ... */ },
};
```

AVIF typically lands 30–50% below WebP on exactly this kind of smooth gradient render.

### 4.2 Fonts

**Current state.** `app/layout.tsx` loads three Google families via `next/font/google`:

```tsx
const geistSans = Geist({ variable: "--font-geist", subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ variable: "--font-serif",
  weight: ["400","500","600","700"], subsets: ["latin"] });
```

**What's right (don't change it):** `next/font/google` self-hosts the files at build time, so there is **no render-blocking request to `fonts.googleapis.com`** and no third-party connection. It also defaults to `font-display: swap` and auto-generates a size-adjusted fallback to minimise font-swap CLS. Your font strategy is already ahead of most sites — the two items below are refinements, not failures.

**What's wrong.**

**(a) Geist is requested with all 9 weights.** Geist is a variable font. When you pass an explicit `weight` array to `next/font/google`, Next fetches **static instances** — one file per weight — instead of a single variable file. That is 9 WOFF2 downloads where 1 would do.

**Fix — omit `weight` to get the variable font:**
```tsx
const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});
```
Your CSS keeps working unchanged: `--font-base: var(--font-geist)` and any `font-weight: 100–900` now interpolates from the single variable file.

**(b) Cormorant is preloaded but barely used.** It backs `--font-tnh` / `--font-serif`, consumed by the TNH-themed sections and (intended) by the `DataStreamHero` canvas — none of which are above the fold. Four weights are preloaded on every route including `/privacy`.

**Fix:** trim to the weights actually used and opt out of preload:
```tsx
const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  weight: ["400", "600"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
```
Do the same `preload: false` for `jetbrainsMono` — grep shows `--font-mono` is used for small UI details (the preloader counter, code labels), never for LCP text.

### 4.3 Video

None. Nothing to fix.

### 4.4 Third-party scripts

**No `<script>` tags, no analytics, no tag manager, no embeds.** `app/layout.tsx` has an empty `<head>`. This is genuinely excellent and rare — protect it.

**One caveat.** `MzLogo3D.tsx` line 460:

```tsx
<Environment preset="forest" environmentIntensity={0.6} />
```

drei's `Environment` **presets are not bundled** — they are fetched at runtime from the `pmndrs/drei-assets` CDN. So despite having no `<script>` tags, your hero's 3D lighting depends on an uncontrolled third-party origin, and the HDR environment map is a multi-MB download that gates the logo's appearance. If that CDN is slow or blocked (corporate networks, some regions), your hero degrades silently.

**Fix:** self-host the HDR.
```bash
mkdir -p public/hdr
# download the forest HDR once from the drei-assets repo, then:
```
```tsx
<Environment files="/hdr/forest_1k.hdr" environmentIntensity={0.6} />
```
Use a 1k `.hdr` — for a blurred metallic reflection nobody will ever see the difference between 1k and 4k, and it's roughly a 10× size reduction. Add a `<link rel="preconnect">` only if you decide to keep the CDN.

---

## 5. Mobile Experience

### 5.1 Pinch-zoom is disabled — accessibility failure

`app/layout.tsx` lines 28–33:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
```

`maximumScale: 1` + `userScalable: false` blocks pinch-to-zoom. This is a **WCAG 2.1 SC 1.4.4 (Resize Text) failure**, it is flagged by Lighthouse's accessibility audit under `[user-scalable="no"] is used`, and it is the kind of thing an Awwwards jury member with an accessibility eye will notice immediately.

There is no upside. The usual justification — preventing iOS input-focus zoom — is solved by ensuring form inputs are ≥16px, not by disabling zoom for everyone.

**Fix:**
```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};
```

### 5.2 `100vh` on mobile causes the toolbar jump

Two places:
- `page.module.css` line 9: `.hero { min-height: 100vh; }`
- `app/page.tsx` line 173: `<div style={{ position: "sticky", top: 0, height: "100vh", ... }}>`

On mobile browsers with collapsing toolbars, `100vh` resolves to the *largest* viewport height, so the hero is taller than the visible area on load and the layout jumps when the toolbar hides.

**Fix — use small/dynamic viewport units with a fallback:**
```css
.hero {
  min-height: 100vh;   /* fallback */
  min-height: 100svh;  /* mobile-correct */
}
```
```tsx
<div style={{ position: "sticky", top: 0, height: "100svh", width: "100%", zIndex: 1, overflow: "hidden" }}>
```
Use `svh` (small viewport height) for the sticky hero specifically — `dvh` would resize continuously as the toolbar animates, which retriggers layout on every scroll frame.

### 5.3 Touch targets below the minimum

`page.module.css` lines 42–56:

```css
.heroWord {
  font-size: clamp(0.75rem, 1.2vw, 1.1rem);
  letter-spacing: 0.5em;
  pointer-events: auto;
}
.heroWord a { pointer-events: auto; }
```

At the mobile end of that clamp the text is **12px** with no padding. The `RESEARCH.` word wraps an external link to `nullhypothesis.dev` (`app/page.tsx` line 205) — a real, tappable target roughly 12–16px tall. The WCAG 2.5.5 / iOS HIG / Material minimum is **44×44px**.

**Fix:**
```css
.heroWord a {
  display: inline-block;
  padding: 0.75rem 0.5rem;   /* pushes the hit area past 44px without moving the glyphs */
  margin: -0.75rem -0.5rem;
}
```

### 5.4 `prefers-reduced-motion` is honoured in 2 of ~10 places

Grep across the entire codebase finds only two checks:
- `app/page.tsx` line 53
- `components/ScaleReveal/ScaleReveal.tsx` line 19

There is **no `@media (prefers-reduced-motion: reduce)` block anywhere in CSS** — not in `globals.css`, not in any module.

So a user who has explicitly requested reduced motion still receives: Lenis smooth scrolling, the `DarkVeil` fullscreen shader, `Waves` cursor-reactive canvas, 5 × `Grainient` animated shaders, the `DataStreamHero` particle field, the full-screen 5-column page wipe in `template.tsx` **and** `TransitionLink`, and the 3D logo. For a motion-sensitive user this is close to worst-case.

**Fix — three layers.**

**(1) A global CSS backstop in `globals.css`:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**(2) A shared hook** (`lib/useReducedMotion.ts`) so every canvas/WebGL component can bail out identically:
```ts
export function prefersReducedMotion() {
  return typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
```
Then in `DarkVeil`, `Waves`, `Grainient`, and `DataStreamHero`, render one static frame and skip the rAF loop:
```ts
if (prefersReducedMotion()) {
  renderer.render({ scene: mesh });  // single frame, then stop
  return;                            // never start the loop
}
```

**(3) Disable Lenis and shorten the wipe:**
```tsx
// SmoothScrolling.tsx
<ReactLenis root options={{ lerp: 0.11, smoothWheel: !prefersReducedMotion(), autoRaf: false }}>
```
```tsx
// template.tsx — collapse the 0.9s wipe to a near-instant cut
transition={{ duration: prefersReducedMotion() ? 0.01 : 0.9, ... }}
```

### 5.5 Desktop-only features on mobile

- **`CustomCursor`** correctly no-ops on touch (`matchMedia("(hover: none)")`, line 19). ✅
- **`Waves`** has a `touchmove` handler feeding cursor-reactive physics — so on mobile the wave distortion follows the user's finger *while they scroll*, which reads as an unintentional glitch rather than an effect. Combined with the `passive: false` problem (§2.4), the cleanest fix is to drop the touch handler entirely and let `Waves` run its ambient animation on mobile.
- **`DataStreamHero`** attaches only `mousemove`/`mouseleave` on the canvas (lines 219–220), so on mobile the particle field renders but never reacts. It costs 1500 `fillText`/frame for a static-looking effect. Gate it off below 768px, or cut the budget hard (§3.5).
- **`MzLogo3D`** — the drei `PerformanceMonitor` adaptive-DPR approach is the right call. Verify the floor: `useState(1.0)` as the starting DPR is good; confirm `PerformanceMonitor` is allowed to drop it to ~0.6 on a struggling device.

---

## 6. The 10 Highest-Impact Changes

Ranked by (impact ÷ effort). All estimates in hours.

| # | Change | Impact | Effort |
|---|---|---|---|
| 1 | Fix the dead-code `return` in `app/page.tsx` `useGSAP` | Perceived smoothness — restores 3 missing animations | **0.25h** |
| 2 | `Waves` touchmove → `passive: true`; cache `getBoundingClientRect` | Scroll jank site-wide on mobile / INP | **0.5h** |
| 3 | Drop `priority`/`loading="eager"` from `green_glass.jpg`; re-encode to WebP | **LCP** — removes a 2.27MB preload competing with the hero | **0.5h** |
| 4 | Bridge Lenis ↔ ScrollTrigger; `lerp` 0.06 → 0.11; `autoRaf: false` | Perceived smoothness — single biggest "premium feel" win | **1h** |
| 5 | Add IO + `visibilitychange` gating to `DarkVeil`; DPR 2 → 1.5 | Sustained FPS, battery, background CPU | **1h** |
| 6 | `next/dynamic` for `MzLogo3D`, `Waves`, `ServicesAccordion`, `OcrScanner` | **TBT / INP** — removes ~600KB from the initial bundle | **1.5h** |
| 7 | Replace 196KB inline `MzLogo` with an optimised `<Image>` | **LCP / TBT** — shrinks every HTML payload on every route | **1.5h** |
| 8 | Remove `maximumScale`/`userScalable`; `100vh` → `100svh`; touch-target padding | A11y score, mobile CLS, jury perception | **1h** |
| 9 | Global reduced-motion CSS + bail-outs in the 4 canvas components | A11y + FPS for motion-sensitive users | **2h** |
| 10 | Self-host the drei `Environment` HDR; prune dead deps (`jsdom`, tailwind, `Preloader`) | Removes 3rd-party dependency from hero; install/deploy size | **2h** |

**Total: ~11.25 hours.**

### Code for the top 5

**1 — `app/page.tsx`**: move the `return () => {...}` cleanup block from line ~110 to the end of the `useGSAP` callback. Full snippet in §3.1.

**2 — `components/Waves/Waves.tsx`**
```ts
// line 377
window.addEventListener('touchmove', onTouchMove, { passive: true });
// line 383 — options must match
window.removeEventListener('touchmove', onTouchMove);
```

**3 — `components/PremiumShowcase/PremiumShowcase.tsx`**
```tsx
<Image
  src="/green_glass.webp"
  alt="Abstract Green Glass 3D Shape"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  quality={70}
  className={styles.demoImage}
/>
```

**4 — `components/SmoothScrolling/SmoothScrolling.tsx`**: add the `LenisGsapBridge` component and set `autoRaf: false`. Full snippet in §3.2.

**5 — `components/DarkVeil/DarkVeil.tsx`**: add the `tryStart`/`tryStop` + `IntersectionObserver` + `visibilitychange` block. Full snippet in §2.3.

---

## 7. Awwwards-Specific Gaps

Setting performance aside — this is about what a judge registers in the first 10 seconds.

### 7.1 The work section has no work in it

`public/work/` is **empty**. `lib/projects.ts` contains no image, cover, or thumbnail fields (grep for `image|cover|thumb|src` returns nothing). `components/sections/WorkGrid.tsx` contains no `<Image>` or `<img>` (same grep, nothing).

For a studio site, the portfolio is the argument. A text-only list of project names — however elegantly typeset — reads as an unfinished site, and it is the single most likely reason for a rejection regardless of how good the shader work is. **This is the biggest gap in the entire audit.** Every SOTD winner in this category leads with imagery: case study covers, hover-preview video, an interactive grid.

You already have `components/ProjectPreview/` scaffolded. Finish it.

### 7.2 The hero communicates the brand but not the craft

The hero is: three words (`RESEARCH. SOFTWARE. KNOWLEDGE.`), a subtext (`In that order.`), a description, a scroll indicator, a `DarkVeil` shader, and a 3D logo. The copy is strong and confident — that's genuinely good.

But the *interaction* is passive. With §3.1 unfixed, the hero words don't even parallax on scroll. There is no pointer-reactive element in the hero except the `DarkVeil` shader's warp, which at `warpAmount={0.5}` and `speed={0.2}` is subtle to the point of being unnoticeable on first load.

You have `components/VariableProximity/` in the codebase — a variable-font proximity effect — and it is not used on the hero. That is precisely the kind of "first 10 seconds" moment that reads as craft. Applying it to the three hero words, driven by the variable Geist axis you'd unlock in §4.2, is a high-signal, low-cost win.

### 7.3 The theme system is built but unreachable

`globals.css` lines 40–63 define a complete `:root[data-theme="light"]` palette — an "Architectural Neutral Canvas" with its own background gradient, border, text and footer tokens. `DataStreamHero` (line 27), `Grainient` (line 333) and others all wire up `MutationObserver`s watching `data-theme`.

`app/layout.tsx` line 50 hardcodes `data-theme="dark"`, and **there is no theme toggle anywhere in the UI**.

So you have built and are paying the runtime cost for a full theming system — including 6+ `MutationObserver`s — that no user can ever trigger. Either ship the toggle (it's a genuinely distinctive detail given how considered the light palette is) or remove the observers. Half-built features are worse than either alternative.

### 7.4 Missing polish that judges look for

- **No custom `404`.** There is no `app/not-found.tsx`. Judges do try broken URLs.
- **No `loading.tsx`** for the `/work/[slug]` route — navigation to a case study has no designed loading state, just the transition wipe followed by a pop-in.
- **No OG image.** `app/layout.tsx` metadata has `title` and `description` only. No `openGraph`, no `twitter` card. When your submission link gets shared in the jury Slack, it renders as a bare URL.
- **`metadata` is minimal.** No `metadataBase`, no canonical, no `keywords`. You have an elaborate `llms.txt` / `.well-known` AI-discoverability layer in `next.config.ts` (30+ lines of `Link` headers) but no Open Graph tags. The priorities are inverted — those AI headers are speculative; OG cards are how humans actually encounter your site.

**Fix:**
```tsx
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://mzfortech.com"),
  title: "MZ | Research. Software. Knowledge.",
  description: "Research-driven technology company. Cairo, Egypt.",
  openGraph: {
    title: "MZ | Research. Software. Knowledge.",
    description: "Research-driven technology company. Cairo, Egypt.",
    url: "https://mzfortech.com",
    siteName: "MZ",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};
```

### 7.5 The transition is strong — lean into it

The 5-column wipe with the yellow accent stripes (`template.tsx` + `TransitionLink.tsx`) is the most distinctive interaction on the site, and the entry/exit choreography is carefully matched (the `-15vh` handoff on `template.tsx` line 51 is a nice piece of work). But it is currently the *only* signature interaction, it costs a full second per navigation (§3.7), and with the work section empty most visitors will trigger it once or twice at most. Fixing 7.1 makes this transition pay for itself.

---

## 8. Build Order

Sequenced so that risky changes land alone and cheap wins land first. Each phase is independently shippable.

### Phase 0 — Zero-risk corrections (~1.25h)

**Do first because they're free, and #1 changes what you're measuring.**

1. Fix the `useGSAP` dead-code `return` (§3.1)
2. `Waves` `passive: true` + cached rect (§2.4)
3. Drop `priority`/`eager` from `green_glass.jpg` (§4.1a)

**Reasoning:** #1 activates three animations that don't currently exist. You must land this *before* profiling anything, or you'll be measuring a page that isn't the page you're shipping. #2 and #3 are one-line changes with no visual consequence.

**→ Capture a Lighthouse mobile trace here. This is your real baseline.**

### Phase 1 — Motion foundation (~2h)

4. Lenis ↔ ScrollTrigger bridge, `lerp` → 0.11, `autoRaf: false` (§3.2)
5. `DarkVeil` IO + visibility gating, DPR → 1.5 (§2.3)

**Reasoning:** #4 must come after #0.1 — bridging ScrollTrigger only matters once you actually have live ScrollTriggers, and you'll want to feel the scrub with the bridge in place. #4 also touches the global scroll loop, so it needs to land alone and be tested across every route before anything else moves. #5 is isolated to one component and frees the GPU headroom that makes Phase 2's measurements meaningful.

### Phase 2 — Bundle surgery (~3h)

6. `next/dynamic` for the heavy components (§2.1)
7. Replace inline `MzLogo` with `<Image>` (§2.2)

**Reasoning:** These are the two largest CWV wins but also the two most likely to cause a visual regression — #6 changes mount timing (watch for hydration flashes on `Waves` and `ServicesAccordion`), #7 changes how the logo's `mix-blend-mode: difference` treatment renders. Land them **separately**, in this order, with a visual check between. Doing bundle work after Phase 1 means the runtime is already stable, so any regression is unambiguously attributable to the split.

### Phase 3 — Mobile & accessibility (~3h)

8. Viewport / `svh` / touch targets (§5.1–5.3)
9. Reduced-motion: global CSS + the 4 canvas bail-outs (§5.4)

**Reasoning:** #9 depends on #5 (`DarkVeil`) and #6 (dynamic imports) already being in place — you want to add the reduced-motion bail-out to `DarkVeil`'s start/stop logic *after* that logic exists, not write it twice. #8 is independent but grouped here because both need a real-device pass and it's efficient to test them together.

### Phase 4 — Assets & cleanup (~2h)

10. Self-host the drei HDR (§4.4)
11. Geist → variable font; `preload: false` on Cormorant/JetBrains (§4.2)
12. `images.formats` in `next.config.ts`; partner-logo dimensions (§4.1b, 4.1d)
13. Delete: `jsdom`, tailwind + `@tailwindcss/postcss`, `Preloader.tsx`, the 4 unreferenced logo files (§1)

**Reasoning:** Deliberately last. #13 in particular is the kind of change that looks safe and isn't — verify `svg-path-bounding-box` really is unused before removing it, and confirm nothing imports `Preloader` after Phase 2's dynamic-import refactor. Doing cleanup at the end means you're deleting from a codebase you've just re-verified, not from one you're about to restructure.

### Phase 5 — Awwwards gaps (separate track)

14. Populate `public/work/` and finish `ProjectPreview` (§7.1) — **start this in parallel now; it's content-blocked, not code-blocked**
15. Ship or delete the light theme (§7.3)
16. `VariableProximity` on the hero words (§7.2) — after #11, so the variable axis is available
17. OG image, `not-found.tsx`, `loading.tsx` (§7.4)

**Reasoning:** #14 is the highest-value item in the entire document and the only one that isn't primarily an engineering task. Its lead time is asset production, so it should be kicked off on day one and run alongside Phases 0–4. Everything else in this phase is polish that only reads as polish once the work section exists.

### Phase-gate

Re-measure at the end of Phase 0 (baseline), Phase 2 (bundle), and Phase 4 (final). Target device profile: throttled 4× CPU, Slow 4G, 412×915 viewport — approximating a 2022 mid-range Android. If a phase doesn't move the number it was supposed to move, stop and investigate before continuing.

---

## Appendix — Claims I could not verify

Stated explicitly so nothing here is taken as established:

- **`svg-path-bounding-box`** — searched `app/`, `components/`, `lib/`, `proxy.ts`; no import found. It may be used by a build script or a file outside those paths. Verify before removing.
- **`GradualBlur`'s `desktopBlur` class** — I did not read `PremiumShowcase.module.css`. The class name implies a desktop-only gate; confirm it is `display: none` below 768px rather than `opacity: 0`.
- **`MzLogo3D`'s SVG source** — the file imports `SVGLoader` (line 21). The only large SVG in `public/` is `mz.svg` (948KB). I did not confirm the fetch URL inside the component. If it does load `mz.svg`, that 948KB should be run through `svgo` and path-simplified before extrusion — parsing that many paths into geometry is expensive independent of the download.
- **`DesktopServiceCard` / `MobileServiceCard` exclusivity** — I assumed both may mount simultaneously when counting 7 WebGL contexts. If they're conditionally rendered (not just CSS-hidden), the real count is 6.
- **`MzLogo3D`'s `PerformanceMonitor` bounds** — I read the import and the `dpr` state initialiser (line 428) but not the full adaptive configuration. Confirm the lower DPR bound is permissive enough (~0.6) to rescue a struggling device.
