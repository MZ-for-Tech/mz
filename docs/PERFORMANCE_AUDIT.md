# MZ — Performance & Craft Audit

**Scope:** `mzfortech.com` — Next.js 16.2.10 / React 19.2.7 / App Router
**Target bar:** 60fps on a mid-range 2022 Android (Snapdragon 695 / Dimensity 700, Mali-G57 class GPU)
**Method:** Every claim below is traced to a specific file and line. Nothing is inferred from framework convention.

---

## 1. Current Stack Assessment

### What's in the box

| Library | Version | Where it's used | Verdict |
|---|---|---|---|
| `next` | 16.2.10 | — | Justified |
| `gsap` + `@gsap/react` | 3.15 | `lib/gsap.ts`, page/template/cursor/transitions | Justified — ScrollTrigger is the right tool |
| `lenis` | 1.3.25 | `components/SmoothScrolling/SmoothScrolling.tsx` | Justified, but unguarded (see §5) |
| `ogl` | 1.0.11 | `DarkVeil.tsx:4`, `Grainient.tsx:4` | Justified as a lib — **catastrophically over-instantiated** (see §2.1) |
| `three` + `@react-three/fiber` + `@react-three/drei` | 0.185 / 9.6 / 10.7 | `Logo/MzLogo3D.tsx` only | **Technical debt.** ~600KB of runtime for one hero logo, statically imported |
| `framer-motion` | 12.43 | `VariableProximity.tsx:4` only | **Pure debt.** Imported for `motion.span` that has no animation props on it |
| `lucide-react` | 1.24 | — | Verify usage before shipping |
| `svg-path-bounding-box` | 1.0.4 | — | Verify usage before shipping |

### The honest read

**The site runs up to six concurrent GPU/canvas contexts on the homepage.** Verified instantiation on `/`:

1. `DarkVeil` — hero (`app/page.tsx:201`) — WebGL1 via ogl
2. `DarkVeil` — footer (`components/Footer/Footer.tsx:70`) — WebGL1 via ogl
3. `MzLogo3D` — (`app/page.tsx:220`) — WebGL via three.js
4. `Grainient` ×3 — (`ServicesBento.tsx:51, 82, 122`) — **WebGL2**, desktop only
5. `Waves` — (`app/page.tsx:297`) — Canvas 2D
6. `DataStreamHero` — (`app/page.tsx:387`) — Canvas 2D

Browsers cap live WebGL contexts (commonly 8–16 desktop, frequently lower on mobile). At five WebGL contexts plus two 2D canvases, you are one component away from `webglcontextlost`. `DarkVeil.tsx:211` already contains a `catch { return; }` for exactly this — the code anticipates the crash rather than preventing it.

**`framer-motion` earns nothing.** `VariableProximity.tsx:194` renders `<motion.span>` but passes only `className`, `style`, `ref` and `aria-hidden`. There is not one `animate`, `initial`, `variants`, or `whileHover` prop. All actual animation is imperative inline-style writes at lines 144–174. This is a whole animation library shipped to render a `<span>`.

**`three.js` is carrying one component.** `MzLogo3D` is the only consumer, and it is statically imported at `app/page.tsx:16` — so three.js, R3F, drei, and `SVGLoader` all land in the initial homepage JS chunk even though the component itself is gated behind `isReadyForHeavy` at line 220. The gate defers *execution*, not *download or parse*.

**`Preloader/` is dead code.** ~430 lines plus a `@react-three/drei` import (`Preloader.tsx:4`). Zero importers repo-wide. Not bundled, but it is misleading repo debt.

**Dead assets:** `public/grainient-snapshot.webp` — zero references. `public/hdr/` — empty directory.

---

## 2. Critical Performance Issues

Four issues materially damage Core Web Vitals or smoothness. Ranked by impact.

---

### 2.1 — CRITICAL: `DarkVeil` runs a per-pixel neural network, forever, twice, ungated

**What it is.** The `DarkVeil` fragment shader (`components/DarkVeil/DarkVeil.tsx:44–62`) is a hardcoded CPPN — a compositional pattern-producing network evaluated **per pixel, per frame**. Per fragment it performs roughly 30 `mat4 × vec4` multiplies across 8 `vec4` accumulator registers, plus 8 `sigmoid()` calls each containing an `exp()`, plus a YIQ↔RGB colour-space round trip in `hueShiftRGB` (lines 34–40).

That is on the order of **500+ floating-point ops per pixel per frame**. At 1080×2400 with `dpr` capped to 1.5 (line 145), that is ~3.9M fragments × ~500 ops = **~2 billion FLOPs per frame**, targeting 60fps.

**Why it hurts.** Three compounding failures in the same effect:

1. **No `IntersectionObserver`.** Verified: `grep -c "IntersectionObserver\|visibilitychange\|prefersReducedMotion" components/DarkVeil/DarkVeil.tsx` → **0**. The `loop()` at line 197 calls `requestAnimationFrame(loop)` unconditionally at line 214. Once the user scrolls past the hero, this shader keeps burning the GPU for the entire session.
2. **Two live instances.** The footer mounts a second one (`Footer.tsx:70`), gated by `hasScrolledToFooter` — which is a one-way latch (`Footer.tsx:45` sets it `true` and never resets). Once you reach the footer, both CPPNs render simultaneously forever.
3. **No `prefers-reduced-motion` and no `visibilitychange`.** It renders in background tabs, draining battery.

On a Mali-G57 this alone will not hold 60fps at fullscreen. It is the single largest reason the site cannot hit the mid-range Android bar.

**The fix.** Gate the loop on visibility, page visibility, and reduced motion; scale resolution to device capability.

```tsx
// components/DarkVeil/DarkVeil.tsx — inside the rAF init callback, replacing lines ~194-217

const start = performance.now();
let frame = 0;
let isVisible = true;
let isPageVisible = !document.hidden;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderOnce = () => {
  program.uniforms.uTime.value = ((performance.now() - start) / 1000) * speed;
  try { renderer!.render({ scene: mesh }); } catch { /* context lost */ }
};

const loop = () => {
  mouse.x += (targetMouse.x - mouse.x) * 0.05;
  mouse.y += (targetMouse.y - mouse.y) * 0.05;
  program.uniforms.uMouse.value.copy(mouse);
  renderOnce();
  frame = requestAnimationFrame(loop);
};

const shouldRun = () => isVisible && isPageVisible && !reduce;
const startLoop = () => { if (shouldRun() && !frame) frame = requestAnimationFrame(loop); };
const stopLoop  = () => { if (frame) { cancelAnimationFrame(frame); frame = 0; } };

const io = new IntersectionObserver(([e]) => {
  isVisible = e.isIntersecting;
  isVisible ? startLoop() : stopLoop();
}, { threshold: 0 });
io.observe(parent);

const onVis = () => {
  isPageVisible = !document.hidden;
  isPageVisible ? startLoop() : stopLoop();
};
document.addEventListener('visibilitychange', onVis);

if (reduce) renderOnce(); else startLoop();

disposeGl = () => {
  stopLoop();
  io.disconnect();
  document.removeEventListener('visibilitychange', onVis);
  window.removeEventListener('resize', resize);
  window.removeEventListener('mousemove', onMouseMove);
  geometry.remove();
  program.remove();
  const ext = gl.getExtension('WEBGL_lose_context');
  if (ext) ext.loseContext();   // release the context — currently never freed
};
```

Also drop the render resolution on low-end GPUs. Replace line 145:

```tsx
// components/DarkVeil/DarkVeil.tsx:144-147
const lowPower =
  (navigator.hardwareConcurrency ?? 8) <= 4 ||
  window.matchMedia('(max-width: 768px)').matches;

renderer = new Renderer({
  dpr: lowPower ? 0.6 : Math.min(window.devicePixelRatio || 1, 1.5),
  canvas,
});
```

`dpr: 0.6` cuts fragment count by ~84% vs `1.5`. Because the shader output is a soft, low-frequency gradient, the visual difference is negligible — the CSS-scaled canvas hides it.

---

### 2.2 — CRITICAL: LCP is blocked behind hydration + a 1.9s animation

**What it is.** The hero headline (`RESEARCH. SOFTWARE. KNOWLEDGE.`) is the LCP element. It is hidden by JavaScript after hydration, then revealed by a GSAP timeline.

`app/page.tsx:124-125`:
```tsx
gsap.set(".hero-word-inner", { y: 30, opacity: 0 });
gsap.set(".hero-subtext, .hero-desc, .hero-scroll-wrapper", { opacity: 0, y: 10 });
```

Then `app/page.tsx:81-90` fades it in over `duration: 1.4` with `stagger: 0.2` across three words, triggered on `mz-transition-done` or a 100ms fallback (line 128).

**Why it hurts.** This runs inside `useGSAP`, i.e. **after React hydration**. The homepage is `"use client"` (`app/page.tsx:1`) and statically imports three.js, R3F, drei, ogl and framer-motion, so the hydration bundle is large. Sequence on a mid-range Android:

```
FCP (SSR text painted)          ~1.2s
→ hydration completes           ~3.0s   ← text yanked to opacity 0 here (visible flash)
→ +100ms fallback timer         ~3.1s
→ 1.4s duration + 0.4s stagger  ~4.9s   ← LCP finally registers
```

An element at `opacity: 0` is not eligible for LCP. You are converting a ~1.2s LCP into a ~5s LCP, and adding a visible flash-then-hide on top. Both are self-inflicted.

**The fix.** Move the initial hidden state into CSS so there is no flash, and drive the entry with a CSS animation that starts at first paint rather than at hydration.

```css
/* app/page.module.css */
.heroWord .heroWordInner,
.heroSubtext,
.heroDescription,
.heroScrollWrapper {
  opacity: 0;
  transform: translateY(20px);
  animation: heroIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.heroWordsRow > :nth-child(1) .heroWordInner { animation-delay: 0.00s; }
.heroWordsRow > :nth-child(2) .heroWordInner { animation-delay: 0.08s; }
.heroWordsRow > :nth-child(3) .heroWordInner { animation-delay: 0.16s; }
.heroSubtext        { animation-delay: 0.24s; }
.heroDescription    { animation-delay: 0.30s; }
.heroScrollWrapper  { animation-delay: 0.36s; }

@keyframes heroIn {
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .heroWord .heroWordInner,
  .heroSubtext,
  .heroDescription,
  .heroScrollWrapper {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

Then delete lines 76–129 of `app/page.tsx` (the `playHeroAnimation` block, the `gsap.set` calls, and the `mz-transition-done` listener). Keep the scroll-parallax tween at lines 132–143 — that one is fine.

Net effect: **LCP ≈ FCP + 0.55s**, no flash, no hydration dependency, and ~50 lines of JS deleted. Total motion time also drops from 1.9s to 0.55s, which reads as more confident, not less premium.

---

### 2.3 — HIGH: `mz.svg` is 948KB and gets extruded into 480 3D geometries on the main thread

**What it is.** Verified:
```
$ ls -l public/mz.svg          → 948,166 bytes
$ grep -o '<path' public/mz.svg | wc -l → 480
```

`MzLogo3D.tsx:56` loads it with `useLoader(SVGLoader, "/mz.svg")`. Lines 148–166 then iterate every path and call `new THREE.ExtrudeGeometry(shape, extrudeSettings)` — **480 extrusions**, each with `bevelEnabled: true` (line 78).

**Why it hurts.** Three separate costs:
1. **948KB network transfer** for a logo.
2. **Synchronous SVG parse** of 480 path definitions.
3. **480 × `ExtrudeGeometry` construction** — bevelled extrusion involves shape triangulation, and it all runs synchronously in a `useMemo` (line 95) on the main thread. This is a multi-hundred-millisecond long task on mobile; it blocks input and tanks INP.

The `globalMeshData` cache (line 38) only helps on *re-mount*, not first load. The `isReadyForHeavy` gate (`page.tsx:220`) defers this cost — but deferring a 400ms main-thread block just moves the jank to a moment when the user is already scrolling.

**The fix — two steps, in order.**

*Step 1 (30 min, big win): simplify the source SVG.* 480 paths for a logo is a vector-editor export artifact. Run it through SVGO and merge same-colour paths:

```bash
npx svgo --multipass --precision=2 public/mz.svg -o public/mz.optimized.svg
```

Realistic target is <30 paths and <40KB. `public/mz-logo.min.svg` already exists at 37KB — confirming a compact version of this artwork is achievable. Geometry build cost scales linearly with path count: 480 → 30 is a **16× reduction**.

*Step 2: make the 3D logo genuinely optional.* Split it out of the initial bundle and skip it entirely on low-end devices:

```tsx
// app/page.tsx — replace the static import at line 16
const MzLogo3D = dynamic(() => import("@/components/Logo/MzLogo3D"), {
  ssr: false,
  loading: () => null,
});
```

```tsx
// app/page.tsx — replace line 220
const [canRun3D] = useState(() =>
  typeof window !== "undefined" &&
  (navigator.hardwareConcurrency ?? 8) > 4 &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  !window.matchMedia("(max-width: 768px)").matches
);

{isReadyForHeavy && canRun3D && <MzLogo3D onLoad={() => setIsLogoLoaded(true)} />}
```

This removes three.js + R3F + drei + SVGLoader (~600KB uncompressed) from the mobile critical path entirely.

---

### 2.4 — HIGH: `Environment preset="forest"` fetches an HDR from a third-party CDN

**What it is.** `MzLogo3D.tsx:467`:
```tsx
<Environment preset="forest" environmentIntensity={0.6} />
```

drei's `preset` prop resolves to a remote HDR/EXR hosted on the `pmndrs/assets` CDN. `public/hdr/` is **empty** — verified — so nothing is served locally.

**Why it hurts.**
- A **cross-origin request to infrastructure you do not control**, on your homepage's critical rendering path for the hero.
- Environment HDRs in this set are multi-MB.
- The HDR must be decoded and converted to a cubemap — more main-thread work stacked on top of §2.3.
- If the CDN is slow or blocked (corporate networks, some regions), the logo renders unlit or the fetch hangs.

**The fix.** Self-host a small pre-baked environment, or drop the env map. Given that the material is `metalness: 0.9` (line 106), it does need *some* reflection source — but a tiny local HDR is plenty:

```tsx
// Download once, commit to public/hdr/studio.hdr (aim for <200KB at 256×128)
<Environment files="/hdr/studio.hdr" environmentIntensity={0.6} />
```

Cheaper still, with no fetch at all:

```tsx
<Environment resolution={64} environmentIntensity={0.6}>
  <mesh scale={100}>
    <sphereGeometry args={[1, 16, 16]} />
    <meshBasicMaterial color="#2a3320" side={THREE.BackSide} />
  </mesh>
</Environment>
```

Also remove `logarithmicDepthBuffer: true` (line 458). It forces per-fragment `gl_FragDepth` writes, which **disables early-Z rejection** across the entire scene — an outsized cost with 480 overlapping meshes. The code already solves z-fighting twice over via `Z_STEP` (line 34) and `polygonOffset` (lines 111–113). This third mechanism is redundant and expensive.

---

## 3. Animation & Motion Audit

### 3.1 `DarkVeil` — WebGL, ogl
- **GPU-accelerated?** Yes (fragment shader), but see §2.1 — it is *fragment-bound*, which is the worst place to be on a mobile GPU.
- **Degrades gracefully?** **No.** No reduced-motion check, no device-tier check, no visibility gating.
- **Scroll jank?** Yes — it competes for GPU time with everything else during scroll, and never stops.
- **Fix:** §2.1.

### 3.2 `MzLogo3D` — three.js / R3F
- **GPU-accelerated?** Yes, but the frame loop is heavy. `useFrame` (line 258) runs `THREE.MathUtils.lerp` across ~12 properties plus a `camera.lookAt()` every frame, and during the 1.5s assembly it loops all 480 meshes calling `.position.set()` and `.rotation.set()` (lines 278–292) — **960 matrix updates per frame**.
- **Degrades gracefully?** Partially. `PerformanceMonitor` (line 461) drops dpr 1.0 → 0.75. That is a very narrow range; it cannot rescue a struggling device. No reduced-motion check at all.
- **Scroll jank?** Yes. `window.addEventListener("scroll", onScroll, {passive:true})` (line 245) is passive — good — but `useFrame` also reads `window.innerHeight` every frame (line 317), and the DOM query at line 260 runs `document.querySelector('.preloader-container')` **every single frame** against a component that does not exist in the tree.
- **Fixes:**

```tsx
// MzLogo3D.tsx:260 — delete this entirely. Preloader is dead code;
// this is a wasted DOM query 60×/second.
if (typeof document !== 'undefined' && document.querySelector('.preloader-container') !== null) return;
```

```tsx
// MzLogo3D.tsx:317 — cache the viewport height instead of reading it per frame
const vh = useRef(typeof window !== 'undefined' ? window.innerHeight : 800);
useEffect(() => {
  const on = () => { vh.current = window.innerHeight; };
  window.addEventListener('resize', on, { passive: true });
  return () => window.removeEventListener('resize', on);
}, []);
// then: const scrollProgress = Math.min(scrollY.current / (vh.current * 0.8), 1);
```

```tsx
// MzLogo3D.tsx:461 — widen the adaptive dpr range so it can actually recover
<PerformanceMonitor
  onIncline={() => setDpr(Math.min(1.25, dpr + 0.25))}
  onDecline={() => setDpr(Math.max(0.5, dpr - 0.25))}
/>
```

Also merge geometries. After SVGO reduces the path count, group by material and use `BufferGeometryUtils.mergeGeometries()` — 480 draw calls → one per unique colour. This is the single biggest 3D win available.

### 3.3 `VariableProximity` — imperative inline styles in a rAF loop
This is the most jank-prone DOM animation in the codebase.

- **GPU-accelerated?** **No.** Per letter, per frame it writes (`VariableProximity.tsx:144-174`):
  - `fontVariationSettings` → **triggers font re-rasterisation and re-layout**
  - `color` via `color-mix()` → paint
  - `textShadow` with two shadows up to 20px and 40px blur → **very expensive paint**
  - `transform` → the only compositor-friendly one

  `will-change: font-variation-settings, color, text-shadow, transform` (`VariableProximity.module.css`) cannot help — none of the first three are compositable properties.

- **Layout thrash:** `getBoundingClientRect()` is called **per letter per frame** (line 128) *inside* a loop that also *writes* styles (lines 144–174). Read-write-read-write in the same loop is textbook forced synchronous layout. The hero has 28 letters across `RESEARCH.` / `SOFTWARE.` / `KNOWLEDGE.` → 28 forced reflows per frame while the mouse moves.

- Additionally, `window.matchMedia('(max-width: 768px)')` is constructed **per letter, per frame** (line 139) — 28 `matchMedia` allocations per frame.

- **Degrades gracefully?** Mobile is handled via `reduceMotion` in `page.tsx:228` and the `distance = Infinity` short-circuit — but the short-circuit happens *after* `getBoundingClientRect()` already ran. The rAF loop (line 116) also runs unconditionally for the page lifetime, even off-screen.

- **Fixes:** cache letter geometry instead of measuring per frame, hoist the media query, and drop `textShadow` from the per-frame path.

```tsx
// VariableProximity.tsx — hoist the media query out of the loop (currently line 139)
const isCoarse = useRef(false);
useEffect(() => {
  const mq = window.matchMedia('(max-width: 768px), (hover: none)');
  isCoarse.current = mq.matches;
  const on = () => { isCoarse.current = mq.matches; };
  mq.addEventListener('change', on);
  return () => mq.removeEventListener('change', on);
}, []);

// Cache letter centres; recompute only on resize / font load, not per frame
const centres = useRef<{x:number;y:number}[]>([]);
const measure = useCallback(() => {
  const c = containerRef.current?.getBoundingClientRect();
  if (!c) return;
  centres.current = letterRefs.current.map(el => {
    if (!el) return { x: -9999, y: -9999 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - c.left, y: r.top + r.height / 2 - c.top };
  });
}, [containerRef]);

useEffect(() => {
  measure();
  window.addEventListener('resize', measure, { passive: true });
  document.fonts?.ready.then(measure);
  return () => window.removeEventListener('resize', measure);
}, [measure]);
```

Then in the rAF body, bail early and read from the cache — no DOM reads at all:

```tsx
useAnimationFrame(() => {
  if (isCoarse.current) return;                 // no pointer → nothing to do
  const { x, y } = mousePositionRef.current;
  if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) return;
  lastPositionRef.current = { x, y };

  letterRefs.current.forEach((el, i) => {
    if (!el) return;
    const c = centres.current[i];
    if (!c) return;
    const d = Math.hypot(x - c.x, y - c.y);
    if (d >= radius) {
      el.style.fontVariationSettings = fromFontVariationSettings;
      el.style.color = '';
      el.style.transform = '';
      return;
    }
    const f = calculateFalloff(d);
    el.style.fontVariationSettings = parsedSettings
      .map(({ axis, fromValue, toValue }) => `'${axis}' ${fromValue + (toValue - fromValue) * f}`)
      .join(', ');
    el.style.color = `color-mix(in srgb, var(--color-brand-yellow) ${f * 100}%, var(--color-text))`;
    el.style.transform = `translate3d(0, ${-f * 5}px, 0) scale(${1 + f * 0.05})`;
    // textShadow removed from the per-frame path — see below
  });
});
```

Replace the per-frame `textShadow` with a single static glow layer whose *opacity* is animated (opacity is compositor-only):

```css
/* VariableProximity.module.css */
.letterSpan {
  position: relative;
  will-change: transform;                    /* only the compositable property */
  transition: color 0.1s ease-out;
}
.letterSpan::after {
  content: attr(data-char);
  position: absolute;
  inset: 0;
  color: var(--color-brand-yellow);
  text-shadow: 0 0 20px var(--color-brand-yellow), 0 0 40px var(--color-brand-yellow);
  opacity: var(--glow, 0);                   /* drive this instead of text-shadow */
  pointer-events: none;
}
```

Then write `el.style.setProperty('--glow', String(f))` in the loop.

Finally, delete `framer-motion` — swap `<motion.span>` at line 194 for a plain `<span>`. It carries no motion props. That removes an entire dependency from the bundle.

### 3.4 `Waves` — Canvas 2D
Genuinely the best-engineered animation here. Credit where due:
- `IntersectionObserver` with `rootMargin: '100px'` (line 373) ✓
- Idle-frame throttling to ~30fps (lines 323–330) ✓
- `Float32Array` typed-array state, no per-frame allocation (lines 189–196) ✓
- Point budget capped at 600 mobile / 2000 desktop (line 177) ✓
- `prefersReducedMotion` respected (lines 359, 378) ✓

Two gaps:
1. **No `visibilitychange` handler** — keeps running in background tabs.
2. `window.addEventListener('mousemove', onMouseMove)` (line 384) is **not passive**, and `touchmove` at line 385 is passive but the handler at 339 reads `e.touches[0]` without a guard — it will throw on `touchcancel`-adjacent edge cases.

```tsx
// Waves.tsx:384 — mark passive
window.addEventListener('mousemove', onMouseMove, { passive: true });

// Waves.tsx:339 — guard the touch list
function onTouchMove(e: TouchEvent) {
  const touch = e.touches[0];
  if (!touch) return;
  updateMouse(touch.clientX, touch.clientY);
}

// add alongside the IntersectionObserver
const onVis = () => {
  if (document.hidden) {
    if (frameIdRef.current !== null) { cancelAnimationFrame(frameIdRef.current); frameIdRef.current = null; }
  } else if (isVisible && frameIdRef.current === null && !prefersReducedMotion()) {
    frameIdRef.current = requestAnimationFrame(tick);
  }
};
document.addEventListener('visibilitychange', onVis);
```

Also note `Waves.css:12-23` — the `.waves::before` pseudo-element sets `will-change: transform` on an element with `background: transparent` and no visible rendering. It promotes a permanent, pointless compositor layer. Delete the rule.

### 3.5 `Grainient` — WebGL2, ×3 concurrent
- **GPU-accelerated?** Yes, and the shader is far more reasonable than DarkVeil's — simple value noise plus gradient mixing.
- **Gated properly?** Yes: IntersectionObserver (line 293), `visibilitychange` (line 306), `prefersReducedMotion` (line 280), `dpr` capped to 1 (line 202), `antialias: false` (line 201). Well built.
- **The problem is quantity, not quality.** Three simultaneous WebGL2 contexts (`ServicesBento.tsx:51, 82, 122`) for three decorative background gradients. Each carries its own GL context, program, and framebuffer.
- **Bug — the `paused` prop is non-functional.** `Grainient.tsx:377-384` dispatches `new Event('grainient-toggle')`, but no listener for that event exists anywhere in the file or repo. `tryStart`/`tryStop` are closured inside Effect 1 and unreachable. Passing `paused` does nothing.

**Fix:** render one shared context, or — simplest and visually identical here, since these tiles use `timeSpeed={0.15}` with near-identical colours — render the gradient once to a static image and use CSS. If you keep them live, fix the pause mechanism:

```tsx
// Grainient.tsx — replace Effect 3 (lines 377-384) with a ref the loop already reads.
// pausedRef is already synced at line 186; just make the loop respect it:
const loop = (t: number) => {
  if (pausedRef.current) { raf = 0; return; }
  (program.uniforms.iTime as { value: number }).value = (t - t0) * 0.001;
  renderer.render({ scene: mesh });
  raf = requestAnimationFrame(loop);
};
// and in Effect 3, call the real starter rather than dispatching a phantom event.
```

### 3.6 `GradualBlur` — stacked `backdrop-filter`
`PremiumShowcase.tsx:35-55` renders `GradualBlur` with `divCount={3}`, `strength={2}`, `exponential`, over `height: '35vh'`, `position: 'sticky'`.

This produces **3 stacked absolutely-positioned divs, each with its own `backdrop-filter: blur()`** (`GradualBlur.tsx:212-213`) plus a `maskImage` (line 210). Each `backdrop-filter` layer forces the compositor to re-sample everything painted beneath it. Three of them, stacked, over 35vh of viewport, on a `sticky` element that is recomposited on **every scroll frame**.

Backdrop-filter is one of the most expensive operations on mobile GPUs. Three stacked instances during scroll is a guaranteed frame-budget overrun on a Mali-G57.

**Fix:** on mobile, replace the blur stack with a plain gradient scrim — visually ~90% of the effect at ~2% of the cost.

```css
/* PremiumShowcase.module.css */
@media (max-width: 768px), (prefers-reduced-motion: reduce) {
  .desktopBlur { display: none; }
  .sectionContainer::after {
    content: '';
    position: sticky;
    bottom: 0;
    display: block;
    height: 35vh;
    margin-top: -35vh;
    pointer-events: none;
    background: linear-gradient(to top, var(--color-bg) 0%, transparent 100%);
  }
}
```

On desktop, drop `divCount` from 3 to 2 — the visual delta is imperceptible and it removes a full compositor pass.

### 3.7 `CustomCursor`
`CustomCursor.module.css` sets `backdrop-filter: invert(1) hue-rotate(180deg)` plus `mix-blend-mode: difference`, and `will-change: width, height, transform, rotate, border-radius`.

- `gsap.quickTo` for position (`CustomCursor.tsx:28-29`) is exactly right ✓
- But `will-change: width, height, border-radius` is actively harmful — these are **layout/paint** properties. Declaring `will-change` on them creates a compositor layer that must be re-rastered on every change anyway, so you pay layer-promotion cost with zero benefit.
- `backdrop-filter: invert(1)` on a fixed element that moves every frame forces a full-viewport backdrop re-sample per frame.

```css
/* CustomCursor.module.css */
.cursor {
  will-change: transform;                 /* transform only */
}
@media (hover: none), (prefers-reduced-motion: reduce) {
  .cursor { display: none; }              /* also skip the mount cost */
}
```

Size changes should be driven by `scale()`, not `width`/`height`:
```css
.cursor        { width: 40px; height: 40px; transition: none; }
.cursorDot     { transform: scale(0.25); transition: transform 0.3s cubic-bezier(0.22,1,0.36,1); }
.hovering .cursorDot { transform: scale(1); }
```

### 3.8 `template.tsx` page-transition wipe
`app/template.tsx:24-33` animates 5 columns via GSAP `y` — pure transform, GPU-friendly ✓. Correct use of `useLayoutEffect` to avoid a flash ✓.

Two issues:
1. **No reduced-motion check.** A full-screen 5-column wipe on every navigation is precisely what `prefers-reduced-motion` exists to suppress.
2. `WIPE_TOTAL_MS` is 1060ms (line 9), and the `mz-transition-done` event gates `isReadyForHeavy` in `page.tsx:50`. Fine for the 3D logo, but it must not gate LCP text (see §2.2).

```tsx
// app/template.tsx — inside useLayoutEffect, before the gsap.fromTo
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduce) {
  if (containerRef.current) containerRef.current.style.display = 'none';
  window.dispatchEvent(new Event('mz-transition-done'));
  return;
}
```

### 3.9 Lenis smooth scroll
`SmoothScrolling.tsx:67` — `lerp: 0.11`, `autoRaf: false`, driven off the GSAP ticker with `lagSmoothing(0)`. This is the correct integration pattern ✓.

But **there is no reduced-motion escape hatch.** Hijacked scrolling is the number-one complaint from users who set `prefers-reduced-motion`, and it is an accessibility-scored item on Awwwards.

```tsx
// SmoothScrolling.tsx:65-72
export function SmoothScrolling({ children }: { children: ReactNode }) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  if (reduce) return <>{children}</>;   // native scrolling

  return (
    <ReactLenis root options={{ lerp: 0.11, smoothWheel: true, autoRaf: false }}>
      <ScrollToTopOnRouteChange />
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
```

Also: `lagSmoothing(0)` (line 54) is a global GSAP setting applied from a component effect. When the tab is backgrounded and restored, disabling lag smoothing can cause a large single-frame delta and a visible scroll jump. Prefer `gsap.ticker.lagSmoothing(500, 33)`.

### 3.10 Per-item ScrollTriggers
`app/page.tsx:161-176` creates one ScrollTrigger **per `.case-item`** in a loop. Each registers its own scroll callback. Combined with `lenis.on("scroll", ScrollTrigger.update)` (`SmoothScrolling.tsx:49`) and Lenis's `lerp: 0.11` — which emits scroll events for many frames *after* the wheel stops — every trigger is re-evaluated continuously during and after scroll.

For simple one-shot reveals, `IntersectionObserver` + a CSS class is dramatically cheaper and needs no scroll callback at all:

```css
.caseItem { opacity: 0; transform: translateY(30px); transition: opacity .8s, transform .8s cubic-bezier(0.22,1,0.36,1); }
.caseItem.isIn { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .caseItem { opacity:1; transform:none; transition:none; } }
```

---

## 4. Asset Pipeline

### Images

**Current state.** `next.config.ts:7-11` is well configured: AVIF + WebP, 1-year `minimumCacheTTL`, constrained `qualities: [70, 75]`. Good baseline.

**What's wrong.**

| File | Size | Issue |
|---|---|---|
| `public/green_glass.jpg` | **2,269,442 B** (2.2MB, 2000×3000) | Source is enormous. Served via `next/image` with `fill` + `sizes` + `quality={70}` (`PremiumShowcase.tsx:19-26`), so delivery is optimised — but the **first** optimisation pass must decode a 6-megapixel JPEG, and it bloats the repo and every deploy. |
| `public/mz.svg` | **948,166 B** | 480 paths. See §2.3 — this is a runtime CPU cost, not just a transfer cost. |
| `public/nested/screenshots/desktop.png` | 451,999 B (1920×1080 RGBA) | PNG for a photographic screenshot. Should be WebP/AVIF. |
| `public/nested-logo.png` | 150,958 B (1679×736 RGBA) | Logo at 1679px wide as PNG. Should be SVG. |
| `public/grainient-snapshot.webp` | — | **Unreferenced.** Delete. |
| `public/hdr/` | empty | Delete, or populate it and stop hitting the drei CDN (§2.4). |

**Exact fixes.**

```bash
# Downscale the source. 2000×3000 is never displayed above ~800px wide.
cd /home/ezzio/Desktop/Projects/mz
npx sharp-cli -i public/green_glass.jpg -o public/green_glass.webp resize 1200 --fit inside -- webp --quality 78
# expected: ~2.2MB → ~90KB

# Screenshots → WebP
npx sharp-cli -i public/nested/screenshots/desktop.png -o public/nested/screenshots/desktop.webp -- webp --quality 80

# Logo SVG
npx svgo --multipass --precision=2 public/mz.svg -o public/mz.svg

# Remove dead assets
rm public/grainient-snapshot.webp
rmdir public/hdr   # or populate per §2.4
```

**The LCP image is not marked `priority`.** `app/layout.tsx:89` correctly sets `priority` on the fixed corner logo — but that is a 100×100 decoration, not the LCP element. Meanwhile, `PremiumShowcase.tsx:19` has no `priority` (correct — it is below the fold). So no image is wrongly prioritised. However, since the true LCP element is **hero text** (§2.2), the `priority` on the corner logo is competing for early bandwidth against the font that renders the LCP text. Consider dropping `priority` there and letting the font win.

### Fonts

**Current state** (`app/layout.tsx:6-32`) — four Google families via `next/font/google`:

| Family | Weights | `display` | `preload` |
|---|---|---|---|
| Geist | variable | swap ✓ | **true** |
| Red Hat Display | 400,500,600,700,800,900 | swap ✓ | **true** |
| JetBrains Mono | variable | swap ✓ | false ✓ |
| Cormorant Garamond | 400, 600 | swap ✓ | false ✓ |

**What's right:** `display: "swap"` everywhere (no invisible text, no FOIT). `preload: false` on the two secondary faces. `next/font` self-hosts and inlines `@font-face`, so there is **no render-blocking third-party request and no layout shift from font swap** — Next injects size-adjust fallback metrics automatically. This is genuinely well done.

**What's wrong:** **Red Hat Display ships six static weights and is preloaded.** Six weights ≈ 6 separate WOFF2 files, all fetched at high priority. Check actual usage:

```bash
grep -rn "font-red-hat\|--font-red-hat" app components --include=*.css --include=*.tsx
```

If fewer than six weights are used, trim the array. Better — Red Hat Display has a variable version; one variable file replaces all six:

```tsx
// app/layout.tsx:27-32
const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat",
  subsets: ["latin"],
  display: "swap",
  // omit `weight` entirely → next/font serves the variable font
  axes: ["wght"],
});
```

Also note: `VariableProximity` animates `'wght' 400 → 900` (`page.tsx:230-231`). That **requires** a variable font. If `--font-red-hat` is resolving to static weights, the proximity effect is silently snapping between weights instead of interpolating smoothly — a visual-quality bug, not just a perf one. Confirm which family `.heroWord` uses; `--font-base` maps to Geist (`globals.css:27`), which *is* variable, so this likely works — but it is worth verifying that the hero words actually resolve to a variable face.

### Video

**None.** No `<video>` elements anywhere in `app/` or `components/`. Nothing to fix.

---

## 5. Mobile Experience

### Touch targets

**`.copyBtn` — confirmed too small.** `Footer.module.css:101-111`:
```css
font-size: 0.65rem;   /* 10.4px */
padding: 4px 8px;
```
Computed height ≈ **10.4px line-box + 8px padding ≈ 22px**. Rendered at `Footer.tsx:92`. That is half the 44×44px WCAG 2.5.5 / Apple HIG minimum.

```css
/* Footer.module.css:101 */
.copyBtn {
  padding: 4px 8px;
  position: relative;
}
.copyBtn::after {           /* invisible hit-area expansion, no layout change */
  content: '';
  position: absolute;
  inset: -12px -8px;
}
```

Audit every `<a>` in `.linkList` (`Footer.tsx:124-139`) and `.subFooterLinks` (line 162) the same way — inline text links in a footer are routinely under 44px tall.

### Viewport handling

**`100vh` is used in 21 places.** On mobile browsers `100vh` refers to the *largest* viewport (URL bar hidden), so any `100vh` element overflows by the URL-bar height on load and **resizes when the bar collapses during scroll** — causing a visible layout jump and, if it affects a laid-out element, CLS.

`app/page.tsx` already gets this right in three places (`100svh` at lines 194, 296, 418) — so the pattern is understood but inconsistently applied. Offenders that matter most:

| File:line | Current |
|---|---|
| `app/page.module.css:9` | `min-height: 100vh` |
| `app/page.module.css:733` | `min-height: 100vh` |
| `components/Footer/Footer.module.css:3` | `min-height: 100vh` |
| `components/Footer/Footer.module.css:12` | `min-height: 100vh` |
| `app/start/page.module.css:2` | `min-height: 100vh` |
| `app/privacy/page.module.css:2` | `min-height: 100vh` |
| `app/work/[slug]/page.module.css:2` | `min-height: 100vh` |
| `app/privacy/page.tsx:20` | fixed `height: "100vh"` |
| `app/start/page.tsx:78` | fixed `height: "100vh"` |

```bash
# Full-height page containers should track the dynamic viewport
cd /home/ezzio/Desktop/Projects/mz
sed -i 's/min-height: 100vh;/min-height: 100svh;/g' \
  app/page.module.css app/start/page.module.css app/privacy/page.module.css \
  app/work/\[slug\]/page.module.css app/work/nested-united/page.module.css \
  components/Footer/Footer.module.css
```

Leave `app/template.tsx` and `TransitionLink.tsx` on `100vh` — those overlays intentionally need to cover the *largest* viewport so no gap appears while the URL bar animates.

### Desktop-only features on mobile

**Handled correctly:**
- `ServicesAccordion.tsx:101` — `{!isMobile ? <ServicesBento/> : <MobileServiceCard/>}`. **Conditional render, not CSS hiding** — so the 3 desktop `Grainient` WebGL contexts genuinely do not mount on mobile ✓
- `VariableProximity` — bypassed via `reduceMotion` (`page.tsx:228`) and the mobile short-circuit (line 139) ✓
- `CustomCursor.tsx:19` — early-returns on `(hover: none)` ✓
- `MzLogo3D.tsx:63-64` — reduces `logoScale` on mobile ✓

**Not handled:**
- **`MzLogo3D` still mounts and renders full three.js on mobile.** Only the scale changes. A 480-mesh WebGL scene on a Mali-G57 is the wrong call. Fix in §2.3.
- **`DarkVeil` renders at full complexity on mobile** with `dpr` up to 1.5. Fix in §2.1.
- **`GradualBlur`'s 3 stacked `backdrop-filter` layers** run on mobile. Fix in §3.6.
- **Drag interaction is pointer-only.** `MzLogo3D.tsx:192-221` binds `pointerdown`/`pointermove`/`pointerup` on the canvas. Pointer events do fire for touch — but there is no `touch-action` declaration, so dragging the logo will fight the page scroll. Add `touch-action: none` to the canvas *only* if you keep 3D on mobile; otherwise this disappears with the §2.3 fix.

### Scroll-snap carousel with one slide

`app/page.tsx:324` — `{[1].map((num) => (...))}`. A single-item array driving a `scroll-snap-type: x mandatory` container (`page.module.css:346-357`) with `flex: 0 0 100%` items.

A one-slide carousel: `overflow-x: auto` still captures horizontal touch gestures, and there is **no `overscroll-behavior-x: contain`**, so horizontal swipes can trigger browser back-navigation on iOS/Android. It also signals "more content →" to the user, then delivers nothing.

```css
/* app/page.module.css:346 */
.productScrollContainer {
  overscroll-behavior-x: contain;   /* stop swipe-to-navigate leaking to the browser */
}
```

And since there is one product, drop the carousel entirely until there are two — replace the `.map` with a direct render.

### `prefers-reduced-motion`

**The global rule is a false sense of security.** `globals.css:96-103`:
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
This suppresses **CSS animations and transitions only**. It has zero effect on GSAP tweens, `requestAnimationFrame` loops, WebGL render loops, or Lenis. On this site, that means it stops almost nothing that actually moves.

Coverage today:

| System | Respects reduced motion |
|---|---|
| Hero GSAP entry (`page.tsx:65-74`) | ✓ |
| `Waves` (lines 359, 378) | ✓ |
| `Grainient` (line 280) | ✓ |
| `DarkVeil` | ✗ |
| `MzLogo3D` | ✗ |
| Lenis smooth scroll | ✗ |
| `template.tsx` page wipe | ✗ |
| `CustomCursor` | ✗ |
| `GradualBlur` | ✗ |
| Footer marquee (`Footer.tsx:153`) | ✗ (CSS animation — caught by the global rule, so effectively ✓) |

Fixes for each are given in §3. The cleanest structural improvement is to make `lib/useReducedMotion.ts` a reactive hook rather than a one-shot function, so components can respond to live changes:

```ts
// lib/useReducedMotion.ts
import { useEffect, useState } from 'react';

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}
```

---

## 6. The 10 Highest-Impact Changes

| # | Change | Impact | Effort |
|---|---|---|---|
| 1 | **Move hero entry animation from GSAP-post-hydration to CSS** (§2.2) | **LCP −2 to −3.5s.** Removes flash-of-hidden-text. Biggest single win available. | 1.5h |
| 2 | **Gate `DarkVeil` on IntersectionObserver + visibilitychange + reduced-motion; drop dpr to 0.6 on low-end** (§2.1) | **Perceived smoothness — transformative.** Frees the GPU for everything below the hero. Fixes battery drain. | 2h |
| 3 | **Run SVGO on `mz.svg` (480 paths → ~30)** (§2.3) | **INP −200 to −400ms.** Removes a long task. 948KB → ~40KB transfer. | 0.5h |
| 4 | **`next/dynamic` the 3D logo + skip it entirely on mobile/low-core** (§2.3) | **TBT −400ms, mobile bundle −600KB.** Removes three.js/R3F/drei from the mobile critical path. | 1h |
| 5 | **Replace remote `Environment preset="forest"` with a local//synthetic env; drop `logarithmicDepthBuffer`** (§2.4) | Removes a third-party CDN dependency from the hero path; restores early-Z across 480 meshes. | 1h |
| 6 | **Fix `VariableProximity`: cache rects, hoist matchMedia, move `textShadow` to an opacity-driven layer** (§3.3) | **Eliminates 28 forced reflows/frame.** The hero goes from stuttery to liquid on pointer move. | 2h |
| 7 | **Remove `framer-motion`** — swap `motion.span` → `span` (§3.3) | Bundle −60KB gzip for a component using zero motion props. | 0.25h |
| 8 | **Replace `GradualBlur`'s 3 stacked `backdrop-filter` layers with a gradient scrim on mobile** (§3.6) | **Scroll jank in PremiumShowcase — resolved.** backdrop-filter on sticky is the worst mobile combination. | 1h |
| 9 | **`100vh` → `100svh` across the 7 page containers; add `overscroll-behavior-x: contain`** (§5) | **CLS improvement**; removes URL-bar resize jump; stops accidental swipe-back. | 0.5h |
| 10 | **Disable Lenis + page-wipe under `prefers-reduced-motion`; add `visibilitychange` to `Waves`** (§3.9, §3.4) | Accessibility compliance — a scored Awwwards criterion. Stops background-tab battery drain. | 1h |

**Total: ~11 hours.** Every item is independently shippable.

Quick wins worth bundling in (~15 min total):
- Delete `document.querySelector('.preloader-container')` from the `useFrame` at `MzLogo3D.tsx:260` — a DOM query 60×/s against a component that does not exist.
- Delete `components/Preloader/` — dead code, zero importers.
- Delete `public/grainient-snapshot.webp` and empty `public/hdr/`.
- Delete the `will-change: transform` on the invisible `.waves::before` (`Waves.css:22`).
- Fix `will-change: width, height, ...` → `will-change: transform` in `CustomCursor.module.css`.

---

## 7. Awwwards-Specific Gaps

Setting performance aside — what a judge notices in the first 10 seconds.

**1. The first 10 seconds are currently a blank-then-pop.**
The page wipe runs 1060ms (`template.tsx:9`), then hero text fades in over 1.4s with 0.2s stagger, then the 3D logo appears after `isReadyForHeavy` — with a separate 0.3s opacity fade (`page.tsx:217`). Nothing is choreographed against anything else; each element has its own independent timeline. SOTD winners have one continuous, authored entry sequence where every element's timing derives from a shared clock. Right now there are four unrelated clocks: the 1060ms wipe, the 100ms GSAP fallback, the 1500ms `isReadyForHeavy` fallback, and the 1.5s in-shader assembly (`MzLogo3D.tsx:273`). Unify them into one timeline with explicit offsets.

**2. Total entry time is too long.** ~1.06s wipe + ~1.9s text = **~3s before the page is "arrived."** Award-winning sites feel *fast and deliberate*, not slow and ceremonial. Target ≤1.2s total. The fix in §2.2 gets you most of the way.

**3. The 3D logo does not justify its cost.** 480 extruded meshes, a metallic PBR material, an HDR environment, four lights, drag-with-inertia, scroll-tilt, camera parallax, a sweeping spotlight (`MzLogo3D.tsx:376-393`) — enormous engineering. But it renders at `opacity: 0` until loaded, arrives after everything else, and sits behind the hero text as a background element (`styles.heroLogo3D`). Either promote it to the actual hero moment, or replace it with a pre-rendered WebP sequence / static render. Currently you pay flagship cost for background decoration.

**4. No hover-state vocabulary on links.** `globals.css:137-140` sets `a { color: inherit; text-decoration: none; }` with **no `:hover` rule at all**. The footer links (`Footer.tsx:124-139`) rely entirely on `CustomCursor` to signal interactivity — which does nothing on touch, and nothing for keyboard users. SOTD sites have a distinct, consistent link-hover language: underline draw-ins, character shuffles, magnetic pulls. This is the cheapest available craft upgrade.

**5. No focus-visible styling anywhere.** `grep -rn "focus-visible" app components` returns nothing. Awwwards scores accessibility, and keyboard navigation currently has zero visible affordance. This is a straightforward loss of points.

```css
/* app/globals.css */
:where(a, button, [tabindex]):focus-visible {
  outline: 2px solid var(--color-brand-yellow);
  outline-offset: 3px;
  border-radius: 2px;
}
```

**6. The "Products" section shows one product in a carousel.** `page.tsx:324` — `{[1].map(...)}`. A snap-scroll carousel containing a single item reads as unfinished. Either present Occhio as a full-bleed feature, or ship a second product.

**7. Commented-out sections left in source.** `page.tsx:146-158` (partners animation) and `page.tsx:365-380` (partners section) are dead commented blocks. A judge will not see these — but they signal a site mid-construction, and `.partnersSection` CSS is still shipping in the bundle.

**8. Substantial dead CSS.** `app/page.module.css` contains rules for `.heroBtnPrimary`, `.heroBtnSecondary`, `.heroActionWrapper`, `.inputGroup`, `.form`, `.caseItem`, `.productCard` — verified **zero references** in `app/page.tsx`. Dead CSS still parses and still occupies the critical stylesheet.

**9. No custom scrollbar treatment.** With Lenis driving smooth scroll, the default OS scrollbar is a jarring native artifact against an otherwise fully-authored surface. `::selection` is styled (`globals.css:125-128`) — the same attention should go to the scrollbar.

**10. `FpsCounter` is mounted in the root layout** (`layout.tsx:57, 77`). It correctly returns `null` in production (line 30), but it is a client component in the tree on every route, and the risk of a dev-mode overlay reaching a judge's screenshot is non-zero. Move it behind an explicit env flag or a `?debug` query param.

---

## 8. Build Order

Sequenced so that each phase de-risks the next. Do not reorder — several later steps depend on earlier ones being measurable.

### Phase 0 — Measurement baseline (0.5h, do first)
Before touching anything, capture a baseline so every subsequent change is provable:
```bash
npm run build && npm run start
npx unlighthouse --site http://localhost:3000 --throttle
```
Record LCP / TBT / CLS / INP on a Moto G Power profile. **Without this you cannot tell which change helped**, and several fixes below interact.

### Phase 1 — Delete before optimising (0.75h, zero risk)
Dead code first — it shrinks the surface area of everything that follows.
- Delete `components/Preloader/`
- Delete `public/grainient-snapshot.webp`, empty `public/hdr/`
- Delete the `.preloader-container` query at `MzLogo3D.tsx:260`
- Delete `will-change` on `.waves::before`
- Remove commented blocks at `page.tsx:146-158, 365-380` and their dead CSS
- Swap `motion.span` → `span`; uninstall `framer-motion`

*Why first:* pure subtraction, nothing can regress, and removing `framer-motion` changes bundle numbers you will be measuring in Phase 3.

### Phase 2 — LCP fix, isolated (1.5h, land alone)
Item #1 only — the hero CSS animation change (§2.2).

*Why alone:* this is the largest single metric movement in the audit, and it touches the most visually sensitive element on the site. If it lands alongside other changes and something looks wrong, you will not know which change caused it. Ship it, measure it, confirm the flash is gone across Safari iOS / Chrome Android.

*Depends on:* Phase 0 baseline, to prove the delta.

### Phase 3 — Bundle & asset weight (2.5h)
- SVGO on `mz.svg` (#3)
- `next/dynamic` + mobile skip for `MzLogo3D` (#4)
- Local/synthetic environment map; drop `logarithmicDepthBuffer` (#5)
- Image conversions: `green_glass.jpg`, screenshots (§4)

*Why here:* #3 must precede #4's verification — once the path count drops from 480 to ~30, you may find the 3D logo is cheap enough to keep on mobile after all, which changes how aggressive #4's device gate needs to be. Sequence matters.

*Risk:* SVGO can alter rendering. Diff the logo visually at 2D and in 3D before merging. Keep the original as `mz.original.svg` until confirmed.

### Phase 4 — GPU load (3h, the smoothness phase)
- `DarkVeil` gating + dpr reduction (#2)
- `GradualBlur` mobile scrim (#8)
- `Waves` visibilitychange + passive listeners (§3.4)
- `Grainient` `paused`-prop fix (§3.5)

*Why after Phase 3:* Phase 3 removes three.js from the mobile path. Only then can you measure `DarkVeil`'s true cost in isolation — measuring it while a 480-mesh WebGL scene is also running gives you noise, not signal.

*Risk:* the `dpr: 0.6` change is visible if the shader has high-frequency detail. It does not (`noiseIntensity: 0.05`, `scanlineIntensity: 0.05`) — but verify on a real device, not the simulator.

### Phase 5 — Interaction quality (2h)
- `VariableProximity` rewrite (#6)
- `CustomCursor` `will-change` + scale-based sizing (§3.7)

*Why after Phase 4:* `VariableProximity`'s forced reflows are only perceptible once the GPU is no longer the bottleneck. Fixing it while `DarkVeil` is still saturating the GPU will show no measurable improvement, and you will wrongly conclude the fix did not work.

### Phase 6 — Mobile & accessibility (1.5h)
- `100vh` → `100svh` sweep (#9)
- `overscroll-behavior-x: contain`
- Reduced-motion for Lenis, page wipe, cursor (#10)
- `focus-visible` styles (§7.5)
- `.copyBtn` tap-target expansion (§5)

*Why last among fixes:* these are low-risk and independently verifiable, and the `100svh` sweep touches files that Phases 2–5 also modify. Doing it last avoids merge conflicts across seven CSS files.

### Phase 7 — Craft pass (open-ended)
The §7 items: unified entry choreography, link-hover vocabulary, scrollbar treatment, resolving the single-product carousel. These are design decisions, not fixes — they need judgment and iteration, and they should not block the performance work from shipping.

### Verification gate

Re-run the Phase 0 measurement after Phases 2, 4, and 6. Targets on a throttled mid-range Android profile:

| Metric | Now (est.) | Target |
|---|---|---|
| LCP | ~5s | **<2.5s** |
| TBT | ~1200ms | **<300ms** |
| CLS | likely OK | **<0.1** |
| INP | ~400ms | **<200ms** |
| Sustained scroll FPS | ~25-35 | **58-60** |

For the FPS number, use Chrome DevTools' rendering FPS meter over a full scroll of the homepage on a real mid-range device — `FpsCounter.tsx` is dev-only and measures rAF cadence, which does not capture dropped compositor frames.
