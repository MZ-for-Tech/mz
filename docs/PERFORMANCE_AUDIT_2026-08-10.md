# Performance Audit — 2026-08-10 (third pass)

**Scope:** full site — `/`, `/work/nested-united`, `/start`, `/privacy`, `/logo`, `/_not-found`
**Stack:** Next 16.2.10 · React 19.2.7 · three 0.185 / R3F 9.6 / drei 10.7 · ogl 1.0.11 · gsap 3.15 · lenis 1.3.25
**Prior passes:** `docs/PERFORMANCE_AUDIT.md` (2026-08-02) · `docs/PERFORMANCE_REAUDIT_2026-08-04.md` (2026-08-05)

## Method and its limits — read this first

Everything marked **(measured)** comes from the committed production build in `.next/`
(HTML/RSC/chunk byte sizes, chunk contents via grep) or from real file sizes and
source reading. Every claim is traced to `file:line`.

**Nothing here is a browser measurement.** I have no browser, no device lab, and no
Lighthouse run in this environment. All Core Web Vitals figures below are *reasoned
estimates* derived from code paths and asset sizes — they are labelled **(estimated)**
and they are the part of this document most likely to be wrong. §7 lists the exact
commands to replace them with real numbers. Treat the estimates as a ranking of
suspects, not as a scorecard.

**No files were modified.** This is report-only, per instruction.

---

## 0. The headline

Three things, in order of how much they matter:

1. **The hero LCP regression flagged in the 2026-08-02 audit was never fixed.** The
   CSS `animation-delay` values are byte-identical to what was flagged as a
   regression eight days ago: `1.10s / 1.25s / 1.40s / 2.00s / 2.50s`
   (`app/page.module.css:40-42,48,56`). The audit said "must come down to ~0–0.55s."
   Nothing changed. **You are hard-coding a ≥2.5s LCP into the stylesheet.** No amount
   of GPU or bundle work will move LCP while this stands.

2. **Both prior audits' central asset finding is now obsolete, and a new one replaced
   it.** The 948 KB / 480-path `mz.svg` they spend pages on no longer exists — the
   rebrand (`5a7cc68`) cut it to **181,603 B / 165 paths (measured)**. Good. But the
   rebrand also put a **181 KB SVG behind `priority` in the root layout**
   (`app/layout.tsx:75-82`), so it now high-priority-preloads on *every route*,
   competing directly with LCP. The logo problem moved; it did not go away.

3. **The three.js code-split was implemented and then defeated.** `MzLogo3D` is
   correctly `dynamic()`-imported (`app/page.tsx:16`) and the 988 KB chunk is genuinely
   absent from the homepage HTML **(measured: 0 references in `index.html`)**. Then
   `app/page.tsx:65-67` unconditionally re-downloads it on mount for every visitor on
   every device. The in-code comment says "~150 KB gz"; **the real chunk is 269,112 B
   gzipped (measured)** — the comment understates it by 80%.

The site is not slow because of one thing. It is slow on weak hardware because
~6 independent animation systems, 4–6 live WebGL contexts, and a permanently
composited `backdrop-filter` all run at once, and because the critical path is
deliberately delayed by 2.5s of CSS.

Your GTX 1650 Max-Q hides all of it. That is why it feels fine to you.

---

## 1. What the prior audits said, and where those items stand today

### 1.1 `PERFORMANCE_AUDIT.md` (2026-08-02)

Found six concurrent GPU/canvas contexts, a hydration-blocked hero LCP, a 948 KB
`mz.svg` extruded into 480 geometries on the main thread, `framer-motion` imported
to render a plain `<span>`, and a pile of accessibility/viewport issues. Its own
embedded re-audit header confirmed most items were implemented and left **two**
open: the hero LCP regression, and reduced-motion escape hatches.

### 1.2 `PERFORMANCE_REAUDIT_2026-08-04.md` (2026-08-05)

Correctly identified that `/work/nested-united` shipped a 948,581 B HTML document
because `ClaudeIcon`/`TiktokIcon`/`LinesIcon` were each rendered twice, and that
`WavesIcon.tsx` was 115 KB of dead code. Prescribed `<symbol>`+`<use>` dedup,
`dynamic()` for `MzLogo3D`, `frameloop` gating, unconditional Footer `DarkVeil`,
and a self-hosted HDR.

### 1.3 Verified status of every prior recommendation

| # | Item | Status | Evidence (measured) |
|---|---|---|---|
| R1 | Dedup 3 icons via `<symbol>`/`<use>` | ✅ **Done** | `IconSprite.tsx` exists, mounted at `page.tsx:118` + `nested-united/page.tsx:11`. HTML **948,581 → 192,202 B (−80%)** |
| R2 | Delete dead `WavesIcon` | ✅ **Done** | File gone from `components/nested/IconCollage/` |
| R3 | `dynamic()` for `MzLogo3D` | ⚠️ **Done then defeated** | Split at `page.tsx:16`; re-fetched eagerly at `page.tsx:65-67`. See F2 |
| R4 | `frameloop` gating on R3F canvas | ✅ **Done** | `MzLogo3D.tsx:469` `frameloop={inView ? "always" : "never"}` + IO at `:447-456` |
| R5 | Unconditional Footer `DarkVeil` | ✅ **Done** | `Footer.tsx:66-76`, mount gate removed, comment explains why |
| R6 | Self-host the HDR | ✅ **Done** | `public/hdr/forest_slope_512_v2.hdr` = 483,485 B, used at `MzLogo3D.tsx:500` |
| R7 | `optimizePackageImports` | 🟡 **Partial** | `next.config.ts:9` covers `@react-three/drei` only |
| R8 | Drop `lucide-react` | ✅ **Done** | Zero references; absent from `package.json` |
| R9 | Precision-round `mz.svg` | ⏭️ **Obsolete** | Rebrand replaced the file. 181,603 B / 165 paths. But see F4 — precision is *still* 2dp-able |
| R10 | Cache/worker-ise geometry parse | 🟡 **Cached, not worker-ised** | `meshBuilder.ts` 3-tier cache (memory → IndexedDB → build). First-ever visit still blocks the main thread |
| R11 | Gate `CustomCursor` on pointer | ✅ **Done** | `CustomCursor.tsx:19` early-returns on `(hover: none)` |
| R12 | Consolidate `Grainient` contexts | ✅ **Done (desktop)** | `SharedGrainient.tsx` — one context, atlas + `drawImage`. **Mobile still uses per-card `Grainient`** — see F8 |
| R13 | Hero LCP → ~0.55s | ❌ **NEVER DONE** | `page.module.css:40-56` still 1.10–2.50s. See F1 |
| R14 | Reduced-motion for Lenis + wipe | ✅ **Done** | `SmoothScrolling.tsx:77-79` bypasses Lenis; `template.tsx:24-28` skips the wipe |
| R15 | `overscroll-behavior-x: contain` | ✅ **Done** | `page.module.css:342` |
| R16 | `100vh` → `100svh` | ✅ **Done** | 8 remaining uses are all intentional (overlays in `template.tsx`/`TransitionLink.tsx`, `/logo`, `not-found`) |
| R17 | Single-item carousel `{[1].map()}` | ❌ **Not done** | `page.tsx:264`. Product decision, negligible perf cost |
| R18 | `WebMCP` effect cleanup | ❌ **Not done** | `WebMCP.tsx:15-65` still has no cleanup. Near-zero cost, but see F16 |

### 1.4 What regressed or newly appeared since 2026-08-05

| Change | Commit | Effect |
|---|---|---|
| Rebrand to new logo | `5a7cc68` | `mz.svg` 948 KB → 181 KB ✅ **but** `mz-logo.min.svg` (identical 181 KB, different hash — *not actually minified*) is now `priority`-preloaded site-wide ❌ |
| Eager three.js warm-up | `9b2ef7d` | Cancels the benefit of its own code-split for first-time and mobile visitors ❌ |
| `IframePreview` added | `e90d0f9` | New third-party-ish iframe on `/work/nested-united`; `loading="lazy"` is set ✅ |
| `Waves` cursor interactivity dropped | `22dc6c3` | Removed a `mousemove` handler — genuinely good ✅ |
| Favicon in full brand colours | `23a3942` | Cosmetic |

**Bottom line on the delta:** the 2026-08-05 audit's items were executed well and its
biggest win (−80% HTML on nested-united) is real and verified. The 2026-08-02 audit's
single most valuable item (R13, hero LCP) was never touched across two passes and
remains the largest single lever on the site.

---

## 2. Prioritized findings

Severity = (impact on weak hardware) × (number of users hit) ÷ (effort).
Every finding lists the exact tradeoff so the team decides, not me.

### 🔴 F1 — Hero LCP is hard-coded to ≥2.5s in CSS

**Where:** `app/page.module.css:36-56`

```css
.heroWord :global(.hero-word-inner) { animation: heroWordIn 1.4s ...; }
.heroWordsRow > :nth-child(1) ... { animation-delay: 1.10s; }
.heroWordsRow > :nth-child(2) ... { animation-delay: 1.25s; }
.heroWordsRow > :nth-child(3) ... { animation-delay: 1.40s; }
.heroSubtext        { opacity: 0; animation-delay: 2.00s; }
.heroDescription,
.heroScrollWrapper  { opacity: 0; animation-delay: 2.50s; }
```

**What it is.** The hero words start at `translateY(110%)` inside an
`overflow: hidden` parent (`page.module.css:100`) — i.e. clipped out of view — and
the subtext/description start at `opacity: 0`. An element at `opacity: 0` or clipped
outside its container **is not eligible to be the LCP element**. The largest text
block therefore cannot register until `2.50s + 1.0s duration`.

This is precisely the regression the 2026-08-02 audit raised as open item #1. It is
unchanged, and it is now the oldest unaddressed finding in the project.

**Compounding factor:** `app/template.tsx:56-92` renders an opaque full-viewport
5-column overlay that wipes upward over `0.9s + 0.16s stagger ≈ 1.06s`. During that
window the hero is covered by opaque `var(--color-bg)` blocks. So the delays were
presumably chosen to "start after the curtain lifts" — but the curtain ends at
~1.06s and the description waits until 2.50s. **There is ~1.44s of pure dead air
that serves no choreographic purpose.**

**Impact if fixed (estimated):** LCP from ~3.5s → ~1.2–1.5s on mid-range mobile.
This is the single largest Core Web Vitals win available and it is a stylesheet edit.

**Tradeoff:** ⚠️ **Real, and it is aesthetic.** The current sequence is a slow,
deliberate, luxurious reveal — words rise, then subtext, then description, over
3.5s total. Compressing to ~0.55s total will read as noticeably faster and more
abrupt. The 2026-08-02 audit argued this "reads as more confident, not less
premium." That is a judgement call, not a fact. **Options, in order of how much
motion you keep:**
- Keep the choreography, cut delays ~60% (0.35/0.45/0.55/0.75/0.95s) — LCP ~1.8s
- Keep word stagger, let description/subtext start at 0 — LCP ~1.3s
- Full compress per the old audit — LCP ~1.2s, most abrupt

**My recommendation:** option 1. It preserves the identity and still halves LCP.
This needs a design decision before implementation.

---

### 🔴 F2 — The three.js code-split is cancelled by an eager import

**Where:** `app/page.tsx:65-67`

```tsx
useEffect(() => {
  void import("@/components/Logo/MzLogo3D");
}, []);
```

**What it is.** `MzLogo3D` is correctly `dynamic()`-imported at `page.tsx:16`, and I
verified the three.js chunk is genuinely **not** in the homepage HTML **(measured: 0
occurrences of `2vnix6c90awqj` in `index.html`)**. Then this effect fetches it
immediately on mount, unconditionally — no device check, no connection check, no
reduced-motion check.

**The numbers (measured):**

| Chunk | Raw | Gzipped | Contents |
|---|---|---|---|
| `2vnix6c90awqj.js` | **987,886 B** | **269,112 B** | `WebGLRenderer`×40, `BufferGeometry`×27, `MeshStandardMaterial`×16, `SVGLoader`, `ExtrudeGeometry` |

The code comment claims "~150 KB gz chunk." **It is 269 KB gz — 79% larger than
stated.** Someone sized this optimisation against a number that was never checked.

On a 4G connection (~1.6 Mbps effective) that is **~1.3s of download**, plus
~300–600ms of parse/compile on a mid-tier mobile CPU, starting at hydration —
exactly when the main thread is busiest.

**Impact if fixed (estimated):** −269 KB gz off the critical path for every mobile
visitor. TBT −300–600ms on mid-range Android. INP during first scroll materially
improves.

**Tradeoff:** ⚠️ On desktop, removing the warm-up means the logo may pop in slightly
later after the wipe lifts. Mitigation: keep the warm-up but gate it —
`navigator.connection.saveData`, `deviceMemory <= 4`, `hardwareConcurrency <= 4`,
and `(max-width: 768px)` should all skip it. Desktop keeps today's behaviour exactly;
weak devices stop paying for a feature F3 argues they shouldn't render at all.

---

### 🔴 F3 — The 3D logo renders full three.js on every device, including phones

**Where:** `components/Logo/MzLogo3D.tsx` (whole file), mounted `app/page.tsx:152-163`

**What it is.** This is your primary suspect, and it is expensive — but not in the
way the volumetric glow suggests. The cost breakdown:

| Cost | Where | Detail |
|---|---|---|
| 163 draw calls/frame | `MzLogo3D.tsx:403-415` | One `<mesh>` per SVG path, each with a 2-material array `[cap, wall]` |
| Bevelled extrusion | `meshBuilder.ts:37-44` | `depth: 32, bevelEnabled: true, bevelSegments: 1, curveSegments: 1` — already tuned down |
| PBR shading ×163 | `meshBuilder.ts:86-92` | `MeshStandardMaterial` `metalness: 0.9, roughness: 0.25` — full PBR + env map per fragment |
| 5 lights | `MzLogo3D.tsx:504-533` + `:420-425` | ambient + 2 directional + 2 point + 1 sweep point = **6 light contributions per fragment per mesh** |
| 483 KB HDR | `public/hdr/forest_slope_512_v2.hdr` | Decoded to a float cubemap at runtime |
| `antialias: true` | `MzLogo3D.tsx:478` | MSAA on a full-viewport canvas |
| `dpr` up to 2.0 | `MzLogo3D.tsx:439,484` | `PerformanceMonitor` can raise dpr to 2 |

**The real problem is not the mesh count — it is 163 meshes × 6 lights × PBR × MSAA
× dpr 2.0.** On a Mali-G57 / Adreno 610 / Intel UHD, that is a fragment-shader
workload well beyond the frame budget. `frustumCulled` (`:413`) does nothing here —
all 163 meshes are on screen simultaneously by design.

The existing mitigation is `logoScale` (`MzLogo3D.tsx:41-42`), which only changes
apparent size. **Scale does not reduce fragment cost proportionally** — a smaller logo
covers fewer pixels, which helps somewhat, but the 163 draw calls, 6 lights and PBR
path are unchanged.

`PerformanceMonitor` (`:483-486`) reacts *after* frames are already dropping, and
its floor is `dpr 1.0` — it can never disable the effect.

**Impact if fixed (estimated):** on integrated graphics, hero framerate from
~20–35fps → 60fps. This is your "inconsistent on lower-end devices" symptom.

**Tradeoff:** 🔴 **This is the big one, and it is unavoidably a visual decision.**
The 3D logo *is* the brand's hero moment. Options, least to most destructive:

1. **Cap `dpr` at 1.0–1.25 on mobile** (`:439`) and set `antialias: false` on coarse
   pointers. Cost: slightly softer edges. Saves ~50–75% of fragment work at dpr 2→1.
   **Lowest risk, do this first.**
2. **Drop to 3 lights on low-end** — remove the olive point light (`:529-533`) and the
   rim light (`:514-518`). Cost: flatter, less dimensional metal. Saves ~30% fragment cost.
3. **Swap `MeshStandardMaterial` → `MeshPhongMaterial` on low-end.** Cost: loses
   metallic reflections and the env map entirely — the logo stops looking like
   polished metal. Large saving.
4. **Static pre-rendered fallback on low-end** — render the assembled logo to a WebP
   at 2–3 sizes, serve that instead of the canvas below a hardware threshold.
   Cost: no rotation, no drag, no sweep light, no assembly animation on those devices.
   **Largest saving by far — removes three.js, the HDR, and the canvas entirely.**

Note option 4 already has partial precedent: `Grainient` supports `fallbackImage`
(`Grainient.tsx:288-296`). The pattern exists in the codebase.

**I recommend 1+2 as a package (low visual risk, meaningful gain), and treating 4 as
a separate product decision.** Do not do 3 — it changes the brand look on a subset of
devices for a middling saving.

---

### 🟠 F4 — The site-wide `priority` logo preload is a 181 KB SVG

**Where:** `app/layout.tsx:75-82`, `public/mz-logo.min.svg`

**What it is (measured):**
```
public/mz.svg          181,603 B   165 paths
public/mz-logo.min.svg 181,603 B   165 paths   ← different md5, identical size
```

`mz-logo.min.svg` is **not minified** — it is the same artwork with the same path
count and the same byte size as the unminified original. The `.min` name is a lie.

It is rendered via `next/image` with `priority` (`layout.tsx:81`), which emits a
`<link rel="preload">` at **high** fetch priority in the `<head>` on **every route**.
Next.js does not optimise SVGs — it serves the raw file. So every page load on every
route high-priority-fetches 181 KB of path data to display a **100×100** (40px tall
on mobile, `globals.css:121`) header mark.

It is also rendered a second time at `page.tsx:267-274` as a 600×600 watermark at
`opacity: 0.05`.

**Compounding:** the same 165-path artwork is *also* fetched as `/mz.svg` by
`meshBuilder` on first-ever visit (`MzLogo3D.tsx:93`). **First load can pull ~363 KB
of near-identical SVG.**

**Impact if fixed (estimated):** −~100 KB at highest priority on every route.
Directly competes with LCP today. Meaningful FCP/LCP win, especially on mobile.

**Tradeoff:** ✅ **Effectively none, if done right.** A 100×100 header mark does not
need 165 paths at 8-decimal precision. Two safe options:
- Precision-round to 2dp — the 2026-08-05 audit measured **42.6% reduction, verified
  lossless** on the old file. Same technique applies. No visual change.
- Export a genuinely simplified header-only mark (the header renders it at 40–100px;
  detail below ~0.5px is invisible). Keep `mz.svg` full-detail for the 3D extrusion.

⚠️ **Hard constraint carried forward from both prior audits:** never merge paths,
never quantise colours — that is what destroyed the logo previously. Precision
rounding only.

---

### 🟠 F5 — Two full-screen CPPN shaders, and the mobile heuristic misses weak phones

**Where:** `components/DarkVeil/DarkVeil.tsx` — hero at `app/page.tsx:133-141`,
footer at `components/Footer/Footer.tsx:67-75`

**What it is.** This is the volumetric glow/wave. The fragment shader runs an
**8-layer CPPN neural network per pixel per frame** (`DarkVeil.tsx:44-98`):
**36 `mat4` multiplies and 9 `sigmoid` (i.e. 9 `exp`) calls per pixel (measured)**.

That is roughly 36×(16 mul + 12 add) ≈ **~1000 ALU ops plus 36 transcendentals per
pixel, per frame**. At 1920×1080 that is ~2M pixels × ~1000 ops = **~2 billion ALU
ops/frame**, or ~120 GFLOP/s at 60fps. A GTX 1650 Max-Q eats this. Intel UHD 620
(~400 GFLOP/s theoretical) does not.

**Existing mitigations — genuinely good:**
- `precision lowp float` (`:14`) — already the cheapest precision
- `dpr: 0.6` when `hardwareConcurrency <= 4` or width ≤ 768 (`:144-147`) — 0.6² = **64%
  fewer pixels**. This is the single most effective thing in the file
- IntersectionObserver + `visibilitychange` + `prefers-reduced-motion` gating (`:222-246`)
- Deferred context creation by one frame (`:141`) to avoid mobile init bursts
- `WEBGL_lose_context` on teardown (`:256-257`)

**What is still wrong:**
1. **The `lowPower` check misclassifies modern mid-range hardware.**
   `hardwareConcurrency <= 4` is false on virtually every 2022+ phone (8 cores is
   standard). The `(max-width: 768px)` clause does catch phones in portrait — but a
   tablet, a foldable, or a low-end laptop with integrated graphics at 1366px wide
   reports 8 cores and a wide viewport, so it gets
   `dpr: min(devicePixelRatio, 1.5)` — **up to 6.25× more pixels than the 0.6 path.**
   The check that protects weak devices does not fire on a whole class of weak devices.
2. **Neither call site passes `resolutionScale`** — both use the default `1`
   (`DarkVeil.tsx:130`). The prop exists specifically to reduce cost and is unused.
3. **A `mousemove` listener on `window` runs unconditionally** (`:193`), including on
   touch, where it never fires but still installs.
4. **Two instances** — hero + footer. Only one is visible at a time and the IO gating
   handles that correctly, so this is fine in practice.

**Impact if fixed (estimated):** switching the heuristic to also test
`deviceMemory <= 4` and `(pointer: coarse)`, and passing `resolutionScale={0.75}` on
low-end, would cut hero shader cost ~50–60% on exactly the devices reporting jank.

**Tradeoff:** ⚠️ **Visible but mild.** Lower `dpr` makes the glow softer and slightly
more banded. Because this effect is *already* a soft, low-frequency, dark gradient,
it degrades unusually gracefully — this is the best cost/quality ratio available on
the site. At `dpr 0.6` it is still clearly the same effect.

---

### 🟠 F6 — Up to 9 concurrent rAF loops on the homepage

**Where:** homepage, simultaneously:

| # | System | File | Type |
|---|---|---|---|
| 1 | Lenis smooth scroll | `SmoothScrolling.tsx:53-55` | Drives GSAP ticker |
| 2 | GSAP ScrollTrigger | `lib/gsap.ts` + 6 call sites | Shares Lenis' rAF ✅ |
| 3 | Hero `DarkVeil` | `DarkVeil.tsx:206-220` | WebGL |
| 4 | Footer `DarkVeil` | same | WebGL (IO-gated ✅) |
| 5 | `MzLogo3D` `useFrame` | `MzLogo3D.tsx:~300-394` | WebGL, R3F |
| 6 | `Waves` | `Waves.tsx:235-255` | Canvas 2D |
| 7 | `DataStreamHero` | `DataStreamHero.tsx:~170-221` | Canvas 2D, 1500 particles |
| 8 | `SharedGrainient` | `SharedGrainient.tsx:221-224` | WebGL (desktop) |
| 9 | `VariableProximity` ×4 | `VariableProximity.tsx:9-19` | **Always-on rAF — see below** |

Items 1–2 correctly share one loop (`gsap.ticker.add`), which is the right pattern.
Items 3–8 are all IO-gated and pause off-screen — genuinely well done.

**The unguarded one is `VariableProximity`.** `useAnimationFrame` (`:9-19`) starts an
rAF loop that **never stops** — no IntersectionObserver, no `visibilitychange`, no
reduced-motion check. Four instances mount on the homepage (3 hero words at
`page.tsx:172-208`, 1 manifesto at `Manifesto.tsx:50-58`), so **4 permanent rAF
callbacks run for the entire session**, including while scrolled far away.

Mitigations that *are* present: an early-out when the mouse hasn't moved (`:147-149`)
and a coarse-pointer bail (`:145`). So each idle callback is cheap — but four
callbacks still wake the main thread every frame forever, and on mobile the coarse
check means they do literally nothing while still running.

**Impact if fixed (estimated):** small but free — a few percent of main-thread time
and measurable battery on mobile.

**Tradeoff:** ✅ **None.** On touch it's already functionally disabled; on desktop an
IO only pauses it off-screen where there is nothing to see.

---

### 🟡 F7 — `Manifesto` runs a per-letter effect over 137 characters, with a no-op axis

**Where:** `components/Manifesto/Manifesto.tsx:17,50-58`

The manifesto text is **137 characters**, and `VariableProximity` renders **one
`<span>` per character** (`VariableProximity.tsx:200-220`) — ~137 spans, each with a
`data-char` attribute and inline `fontVariationSettings`.

`from` and `to` are **identical** — both `'wght' 400` (`Manifesto.tsx:55-56`). The
per-letter weight interpolation computes a value that never changes. Yet the rAF
callback still, per frame, per letter: computes distance, computes falloff, and writes
`style.color` with a `color-mix()` expression plus `--glow` and a `transform`
(`VariableProximity.tsx:177-183`).

`color-mix(in srgb, ...)` per letter per frame is a **style recalculation across 137
elements**, and `transform` on each, combined with `will-change: transform`
(`VariableProximity.module.css:15`), hints **137 composited layers**.

**Impact if fixed (estimated):** removes a 137-element style recalc from the
interaction path. Noticeable on mid-range mobile when the manifesto is in view.

**Tradeoff:** ⚠️ The colour-and-lift proximity effect *is* visible and is a nice touch
on desktop. But since `wght` 400→400 does nothing, the component is doing double work
for a single effect. Cheapest fix keeps the look exactly: drop the no-op
`fontVariationSettings` write, and pre-resolve the colour instead of `color-mix()` per
frame. Alternatively gate the whole component on `(hover: fine)` — on touch it already
does nothing.

---

### 🟡 F8 — Mobile still creates one WebGL context per service card

**Where:** `components/MobileServiceCard/MobileServiceCard.tsx:3,22-32`,
mounted ×3 at `ServicesAccordion.tsx:108-131`

`SharedGrainient` (the single-context atlas renderer) is used only by `ServicesBento`
(desktop, `ServicesBento.tsx:47`). The mobile path still imports the **per-instance**
`Grainient` and mounts it three times — **3 separate WebGL2 contexts + 3 rAF loops on
the weakest devices.**

This is the exact inversion of what you want. The consolidation work exists; mobile
doesn't use it.

Mitigating factors: `dpr` capped at 1 (`Grainient.tsx:93`), `antialias: false`
(`:92`), IO/visibility gating present, and the desktop/mobile split is a true
conditional render (`ServicesAccordion.tsx:102-132`) so both never mount at once.

**Also on this path:** `MobileServiceCard.module.css` has **4 `filter: blur()` layers**
at `:153, :169, :203, :219` — `blur(1em)`, `blur(1em)`, `blur(0.2em)`, `blur(0.8em)`.
Large-radius blurs are among the most expensive filters, and these render on top of a
live WebGL canvas, on mobile.

**Impact if fixed (estimated):** −2 WebGL contexts and −2 rAF loops on mobile;
reducing the blur radii is a significant paint win on the services section.

**Tradeoff:** ⚠️ The blurs create the "lumen" glow that defines the card. Halving the
radius (`1em` → `0.5em`) preserves most of the look at roughly a quarter of the cost
(blur cost scales ~quadratically with radius). Switching mobile to `SharedGrainient`
should be pixel-identical by design — it exists to be pixel-identical.

---

### 🟡 F9 — `backdrop-filter` in a fixed nav, over the most animated content on the site

**Where:** `components/PillNav/PillNav.css:2-20`

```css
.premium-nav-container { position: fixed; top: 2rem; right: 2rem; z-index: 999; }
.premium-nav { backdrop-filter: blur(16px); ... }
```

A fixed-position `backdrop-filter: blur(16px)` forces the compositor to re-sample and
re-blur everything beneath it **on every frame that anything underneath moves** —
which, with Lenis smooth scroll, is every frame of every scroll. What sits beneath it
on the homepage is the animated `DarkVeil` shader and the 3D logo canvas.

`blur(16px)` is a large radius. This is one of the most expensive things you can put
over animated content, and it sits over the most animated part of the site.

Same pattern at `ServicesBento.module.css:67-68` and `ServicesAccordion.module.css:30-31`
(both `blur(12px)`), and `IframePreview.module.css:47-48` (`blur(6px)`, small and
static — fine).

**Impact if fixed (estimated):** on integrated graphics, reducing the nav blur is one
of the larger single scroll-jank wins available.

**Tradeoff:** ⚠️ **Directly visible.** The frosted-glass nav is a real design element.
Options: reduce to `blur(8px)` (roughly half the cost, still clearly frosted); or drop
`backdrop-filter` on `(pointer: coarse)` and raise the existing `rgba(15,15,15,0.4)`
background (`:13`) to ~0.75 for legible contrast at zero blur cost on mobile only.
Desktop keeps the glass.

---

### 🟡 F10 — `Waves` runs a Perlin field over 2000 points on desktop

**Where:** `components/Waves/Waves.tsx:150-255`, mounted `app/page.tsx:240-249`

`movePoints` (`:184-197`) calls `noise.perlin2()` **once per point per frame**, over
`TARGET_POINTS` = **2000 on desktop, 400 on mobile** (`:155`). `perlin2` (`:65-75`) is
~20 ops plus 4 gradient dot products. Then `drawLines` (`:216-224`) issues one `moveTo`
plus N `lineTo` per line into a single path.

**Existing mitigations — good:** mobile point cap of 400, 30fps throttle on coarse
pointers (`:247`), idle detection (`:246`), IO gating with `rootMargin: '100px'`
(`:276`), `visibilitychange` (`:293`), and cursor interactivity deliberately removed in
`22dc6c3`.

This is honestly one of the better-optimised components in the codebase. It stays on
the list only because it is a full-viewport 2D canvas running under the entire
scrolling page — 2000 Perlin evaluations plus a 2000-segment stroke per frame is still
real main-thread work on a weak CPU, and it is `position: sticky` behind everything
(`page.tsx:238-251`), so it composites against every section.

**Impact if fixed (estimated):** modest. Lowering desktop `TARGET_POINTS` 2000 → 1200
is likely imperceptible and cuts the cost ~40%.

**Tradeoff:** ⚠️ Minor — slightly sparser lines. At 15% opacity (`page.tsx:241`) the
difference is very hard to see. Low risk.

---

### 🟡 F11 — `DataStreamHero` draws 1500 text glyphs per frame

**Where:** `components/DataStreamHero/DataStreamHero.tsx:57,180-216`, mounted
`app/page.tsx:310`

`TARGET_PARTICLES = 1500` (`:57`), and the draw loop calls `ctx.fillText()` **once per
particle per frame** (`:215`). Canvas text rendering is dramatically more expensive
than `fillRect` — each call involves glyph lookup, shaping, and rasterisation.
**1500 `fillText` calls per frame is the most expensive 2D canvas pattern on the site.**

**Existing mitigations — good:** TypedArrays for particle data (`:45-51`),
resolution-aware gap so 4K doesn't explode the count (`:58-61`), font-change batching so
`ctx.font` is only reassigned when the size changes (`:211-214`), IO gating (`:223-237`),
`visibilitychange`, and a reduced-motion bail (`:218-220`).

The mitigations are thoughtful, but they optimise *around* the 1500 `fillText` calls
rather than reducing them. There is no mobile-specific cap — `TARGET_PARTICLES` is 1500
regardless of device.

**Impact if fixed (estimated):** halving to 750 on coarse pointers roughly halves the
cost of that section. Glyph caching to offscreen canvases (draw each of the 17 symbols
once, then `drawImage`) would be a larger win at identical visual output.

**Tradeoff:** ✅ **Near-zero for the glyph-cache approach** — `drawImage` of a
pre-rendered glyph is pixel-identical to `fillText` at the same size, and there are only
17 distinct symbols (`:6`). Reducing particle count is visible (sparser field) but only
mildly.

---

### 🟢 F12 — 483 KB HDR for low-frequency reflections

**Where:** `public/hdr/forest_slope_512_v2.hdr`, `MzLogo3D.tsx:499-501`

Already reduced from 1.9 MB → 483 KB and self-hosted (a prior-audit win). What remains:
it is an uncompressed `.hdr` at 512×256 used for `environmentIntensity={0.6}` on
metallic surfaces. Converting to **compressed EXR or a KTX2/basis cubemap** typically
lands 100–200 KB at visually identical quality for low-frequency env reflections. It is
correctly `Suspense`-wrapped so it never blocks first paint, and `Cache-Control:
immutable` is set (`next.config.ts:21-25`).

**Tradeoff:** ✅ None at equivalent resolution. Env maps for rough metal are inherently
low-frequency.

---

### 🟢 F13 — `optimizePackageImports` covers only drei; `three` is namespace-imported

**Where:** `next.config.ts:8-10`

Currently `["@react-three/drei"]`. `three` is namespace-imported (`import * as THREE`)
in both `MzLogo3D.tsx:18` and `meshBuilder.ts:21` — namespace imports are the hardest
case for tree-shaking, and three.js is the largest dependency in the project by a wide
margin. Switching to named imports of only the symbols actually used would let the
bundler drop unused three.js modules from the 988 KB chunk.

`lib/gsap.ts` already centralises GSAP correctly. **Measured GSAP footprint:** spread
across 4 chunks (`0ie8t3sihohg2`, `0pn2cb2fso74z`, `2hzamq1ekgvrn`, `3pufedy-du2xg`),
the largest being 70,179 B raw / 27,077 B gz.

**Tradeoff:** ✅ None. Pure build config plus an import-style change.

---

### 🟢 F14 — Dead components still in the tree

**Where (measured — zero importers):**

| Component | Files |
|---|---|
| `components/CardSwap/` | `.tsx` + `.css` |
| `components/BorderGlow/` | `.tsx` + `.css` |
| `components/LineSidebar/` | `.tsx` + `.css` |
| `components/SectionLabel/` | `.tsx` + `.module.css` |
| `components/nested/LanguageSwitcher/` | `.tsx` + `.module.css` |

Not bundled (no importers → tree-shaken), so **zero runtime cost**. Listed for repo
hygiene only — the same "misleading debt" the 2026-08-02 audit flagged for `Preloader`.

Also: `components/Grainient/Grainient.tsx` is now used **only** by `MobileServiceCard`.
If F8 is actioned, it becomes fully dead too.

**Tradeoff:** ✅ None.

---

### 🟢 F15 — `/logo` route ships the full three.js payload

**Where:** `app/logo/page.tsx`

A dev/preview route that mounts `MzLogo3D` directly. It is prerendered (15,557 B HTML)
and pulls the 988 KB chunk. Harmless unless linked publicly or crawled — it is **not**
in `public/sitemap.xml`, so this is informational. Consider `robots: noindex` if it is
internal-only.

---

### 🟢 F16 — Minor correctness issues

| Issue | Where | Note |
|---|---|---|
| `WebMCP` effect has no cleanup | `WebMCP.tsx:15-65` | Registered tools never torn down. Returns `null`, no rAF — negligible cost |
| `console.log` in production | `WebMCP.tsx:60` | "WebMCP tools registered successfully." — should be stripped |
| `useMediaQuery` re-subscribes on every match change | `ServicesAccordion.tsx:48-59` | `matches` in the dep array causes listener churn. Harmless but sloppy |
| `Grainient` uses a raw `<img>` | `Grainient.tsx:290` | ESLint-disabled. Only on the `!active` fallback path |
| `DarkVeil` effect deps include all props | `DarkVeil.tsx:265` | Any prop change destroys and rebuilds the WebGL context and recompiles the CPPN shader. Props are static literals today, so it never fires — but it is a loaded gun |
| `Footer` clock re-renders every second | `Footer.tsx:16-34` | `setInterval` + `setState` at 1 Hz. Cheap, but it re-renders the whole footer subtree including the `DarkVeil` wrapper |

---

## 3. Core Web Vitals — current state and causes

⚠️ **These are estimates, not measurements.** See the method note at the top. Field data
or a Lighthouse run should replace this table before anyone reports these numbers
upward. They represent a mid-range Android (Snapdragon 695 class) on 4G.

### LCP — estimated ~3.5s (target <2.5s)

| Cause | Contribution | Finding |
|---|---|---|
| Hero text held at `opacity: 0` / clipped until 2.5s | **dominant** | F1 |
| Entry wipe covers the viewport ~1.06s | ~1.0s | F1 (`template.tsx:9-11`) |
| 181 KB `priority` SVG preload competing for bandwidth | moderate | F4 |
| 269 KB gz three.js fetched during hydration | moderate | F2 |

**The LCP element is almost certainly the hero words** (`page.tsx:167-212`) — the
largest text block in the viewport. Everything above delays exactly that element.
**Fixing F1 alone should move LCP more than every other item combined.**

### INP — estimated 200–400ms on mobile (target <200ms)

| Cause | Finding |
|---|---|
| First-visit SVG parse + 163 `ExtrudeGeometry` builds on the main thread | F3 / R10 |
| three.js parse + compile during hydration | F2 |
| 4 permanent `VariableProximity` rAF loops | F6 |
| 137-element `color-mix()` recalc in the Manifesto | F7 |
| Lenis intercepting scroll while the main thread is busy | — |

The IndexedDB cache (`meshBuilder.ts:280-334`) means the geometry build is
**first-visit-only** — returning visitors skip it entirely. Good design; the first
impression still pays for it.

### CLS — estimated good (<0.1)

Genuinely well handled, credit where due:
- `100svh` used consistently; the 8 remaining `100vh` are intentional overlays
- All `next/font` loads use `display: "swap"` with variable fonts (`layout.tsx:6-25`)
- `next/image` with explicit `width`/`height`, or `fill` + `sizes`, throughout
- The hero entry animates `transform`/`opacity` only — no layout properties

**One risk to verify:** `layout.tsx:75-82` renders the logo at `width={100} height={100}`
but CSS overrides it to `height: 40px; width: auto` on mobile (`globals.css:119-122`).
The aspect ratio is square so the reserved box is close, but a mismatch between the
attribute box and the CSS box is a classic CLS source worth checking on a real device.

### TTFB / FCP

All routes are statically prerendered (`export-marker.json`, `prerender-manifest.json`)
— TTFB should be excellent on a CDN. Security and cache headers are thorough
(`next.config.ts:17-99`), with `immutable` on `/hdr/*` and `/(icons|nested)/*`.

**FCP is not blocked by fonts** (all `display: swap`), but it *is* effectively masked by
the entry wipe overlay for ~1.06s — the user sees brand-coloured columns, not content.
That is a deliberate design choice, and it is worth naming: **your FCP is technically
fast and perceptually slow.**

---

## 4. Bundle inventory (measured, from `.next/`)

### Prerendered HTML

| Route | HTML | RSC payload |
|---|---|---|
| `/work/nested-united` | 192,202 B | 92,027 B |
| `/` | 97,652 B | 9,714 B |
| `/start` | 26,044 B | 9,453 B |
| `/privacy` | 21,688 B | 9,250 B |
| `/_not-found` | 15,777 B | — |
| `/logo` | 15,557 B | 8,580 B |

`/work/nested-united` is down from 948,581 B — the single biggest verified win since
the last audit. It remains the largest page because the icon path data still lives
inline in `IconSprite`, but now **once** instead of twice.

### JS chunks

**Total static JS: 2,057,656 B raw / 597,813 B gz (measured).**

| Chunk | Raw | Gz | Contents | On homepage? |
|---|---|---|---|---|
| `2vnix6c90awqj.js` | 987,886 | **269,112** | three.js + R3F + drei + SVGLoader | **Not in HTML — fetched by `page.tsx:66`** |
| `3d17mn2p_2ypc.js` | 227,307 | 70,863 | React + framework | ✅ |
| `3c1nhsf8n6rb6.js` | 194,615 | 49,158 | Next runtime | ✅ |
| `0cz1d0mv5g_q7.js` | 112,594 | 39,496 | polyfills | ✅ |
| `3pufedy-du2xg.js` | 70,179 | 27,077 | gsap + ScrollTrigger | ✅ |
| `0ie8t3sihohg2.js` | 76,088 | 23,707 | gsap + VariableProximity + OcrScanner | ✅ |
| `2hzamq1ekgvrn.js` | 43,495 | 17,517 | gsap / ScrollTrigger | ✅ |
| `0pn2cb2fso74z.js` | 24,432 | — | lenis + gsap | ✅ |

**Homepage initial JS ≈ 933 KB raw / ~280 KB gz**, then **+269 KB gz** of three.js
immediately after mount (F2). Effective first-load JS is **~550 KB gz**.

The ogl/CPPN shader code is split across 4 small chunks (`0nz6mmkvillba`,
`1aq7oadrwoe3d`, `2da-0pe2c7_0a`, `2wun_ikcgbj9n`) — reasonable.

**Note on the polyfill chunk:** 112,594 B raw / 39,496 B gz of polyfills ships to every
visitor including modern browsers. Worth checking the `browserslist` target — this is
often reducible to near-zero for a site whose visitors run WebGL2.

### Static assets

| Asset | Size | Note |
|---|---|---|
| `public/hdr/forest_slope_512_v2.hdr` | 483,485 B | F12 |
| `public/mz.svg` | 181,603 B | 3D source, fetched first visit only |
| `public/mz-logo.min.svg` | 181,603 B | **`priority` on every route** — F4 |
| `public/green_glass.webp` | 131,834 B | `quality={70}`, proper `sizes` ✅ |
| `public/icons/claude.svg` | 96,149 B | External, animated via wrapper ✅ |
| `public/nested/**` | ~560 KB | All WebP, all `sizes`-qualified ✅ |
| `public/og.webp` | 7,354 B | ✅ |

**Images are in good shape** — the WebP migration and `sizes` discipline from prior
audits held up. AVIF + WebP are enabled (`next.config.ts:12`), with a one-year
`minimumCacheTTL`.

### Third-party scripts

**None. Zero.** No analytics, no tag manager, no externally-hosted fonts (`next/font`
self-hosts). The only external resource is the `IframePreview` iframe on
`/work/nested-united`, which is `loading="lazy"` (`IframePreview.tsx:39`) and
pointer-events-gated so it cannot hijack scroll.

This is genuinely excellent and unusual. Nothing to fix here.

---

## 5. CSS and paint cost

**7,816 lines of CSS total.** Largest: `page.module.css` (1,162),
`ServiceVisuals.module.css` (506), `Footer.module.css` (401),
`MobileServiceCard.module.css` (399), `WorkGrid.module.css` (374).

| Concern | Count | Assessment |
|---|---|---|
| `backdrop-filter` | 5 sites | F9 — the fixed nav is the expensive one |
| `filter: blur()` | 4 (all `MobileServiceCard`) | F8 — large radii on mobile |
| `mix-blend-mode` | 10 sites | `difference` on the fixed layout logo (`globals.css:88-93`) forces a stacking context over everything scrolling beneath it |
| `will-change` | 24 declarations | See below |
| `infinite` animations | 61 across 15 files | See below |

**`will-change` audit.** Mostly disciplined — `CustomCursor` is correctly narrowed to
`transform` only, and `Manifesto.module.css:31-33` carries an explicit comment about
*removing* permanent `will-change` from 13 text layers. Two remain questionable:
- `page.module.css:994` — `will-change: opacity, transform, filter`. **Listing `filter`
  forces a permanent GPU layer with filter machinery attached.**
- `VariableProximity.module.css:15` — `will-change: transform` on every letter span;
  with 137 letters in the Manifesto that is 137 hinted layers (F7).

**`infinite` animations.** 61 total. The concentration that matters:
`OcrScanner.module.css` has **7 infinite 8s animations** (`:49, :68, :156, :157, :158,
:188, :220`) running simultaneously in the Products section. `ServiceVisuals`,
`StatusDot`, and the nested icons add more. These are CSS-driven so they are
compositor-friendly, and `ServicesAccordion.tsx:66-77` / `ServicesBento.tsx:14-25` set
`data-paused` via IntersectionObserver — **but I could not confirm that every animation
actually respects `[data-paused]`.** Worth verifying: an infinite animation that keeps
running off-screen prevents the compositor from ever idling, which on mobile is a
direct battery and thermal cost.

The `prefers-reduced-motion` block in `globals.css:96-103` is a proper global
kill-switch (`animation-duration: 0.01ms !important`) — good.

---

## 6. React re-render analysis

Mostly clean. The heavy components are all ref-and-rAF driven rather than state driven,
which is the correct architecture for this kind of site.

**Handled well:**
- `CustomCursor.tsx:14-15` — tracks hover/hidden in **refs**, and only calls `setState`
  when the value actually changes (`:35-38, :71-74`). Textbook.
- `MzLogo3D` — all per-frame work goes through `useFrame` and refs; no state in the
  animation path.
- `Grainient.tsx:76-79` — `pausedRef` mirrors the prop so the rAF loop reads a ref, not
  state.
- `SharedGrainient.tsx:293-305` — uniform sync is a separate effect from context
  creation, so prop changes never rebuild the WebGL context.

**Worth attention:**

| Issue | Where | Cost |
|---|---|---|
| `Footer` clock re-renders the entire footer subtree at 1 Hz | `Footer.tsx:16-34` | The `DarkVeil` wrapper div is re-rendered 60×/min. React bails on the canvas itself, but the reconciliation is wasted work. Isolating the clock into its own leaf component fixes it |
| `WorkGrid` sets 4 state values per row hover | `WorkGrid.tsx:154-163` | `setActiveColor`/`setActiveStatus`/`setActiveSlug`/`setActiveImage` — four `setState` calls re-rendering the whole project list on every `mouseenter`. React 19 batches them into one render, so this is acceptable, but it re-renders every row to change one cursor |
| `useMediaQuery` churns listeners | `ServicesAccordion.tsx:48-59` | `matches` in the dep array tears down and re-adds the listener on every change |
| `page.tsx` state triggers full-page re-render | `page.tsx:40-42` | `isReadyForHeavy` / `isLogoLoaded` / `reduceMotion` each re-render the entire homepage tree. Only fires 3× per session, so cost is negligible |

**No unnecessary re-renders were found in the per-frame paths** — which is the part
that would actually matter. This section is not a problem area.

---

## 7. Mobile / low-end specific summary

Ranked by expected impact on an integrated-GPU or mid-range Android device:

| Rank | Issue | Finding |
|---|---|---|
| 1 | 163-mesh PBR logo, 6 lights, MSAA, dpr up to 2 | F3 |
| 2 | 2.5s CSS-hardcoded LCP delay | F1 |
| 3 | 269 KB gz three.js downloaded on every mobile visit | F2 |
| 4 | `lowPower` heuristic misses 8-core mid-range devices | F5 |
| 5 | 3 WebGL contexts + 4 large blurs in mobile service cards | F8 |
| 6 | `backdrop-filter: blur(16px)` fixed nav over animated content | F9 |
| 7 | 181 KB `priority` SVG preload | F4 |
| 8 | 1500 `fillText` calls/frame | F11 |

**What is already right for mobile** — this deserves saying, because it is a lot:
- True conditional render for desktop vs mobile services, not CSS hiding
  (`ServicesAccordion.tsx:102-132`) — desktop WebGL genuinely never mounts on mobile
- `CustomCursor` early-returns on `(hover: none)` (`CustomCursor.tsx:19`)
- `VariableProximity` bypassed via `reduceMotion` and coarse-pointer checks
- `Waves` 400-point cap plus a 30fps throttle on coarse pointers
- `GradualBlur` replaced by a plain gradient scrim on mobile
  (`PremiumShowcase.module.css:151-164`)
- `DarkVeil` context creation deferred one frame to avoid mobile init crashes
- WebGL context loss handled with `WEBGL_lose_context` + `webglcontextlost` listeners

**WebGL context budget** (browsers cap ~8–16, lower on mobile):
- Desktop homepage: 2 `DarkVeil` + 1 `MzLogo3D` + 1 `SharedGrainient` = **4** ✅
- Mobile homepage: 2 `DarkVeil` + 1 `MzLogo3D` + 3 `Grainient` = **6** ⚠️

**Mobile carries more contexts than desktop. That is backwards**, and F8 fixes it.

---

## 8. Verification plan — replace my estimates with real numbers

I could not run any of this. It should be run before and after any change.

```bash
cd /home/ezzio/Desktop/Projects/mz

# 1. Rebuild and confirm the byte-level baseline
npm run build
find .next/server/app -name '*.html' -printf '%s %p\n' | sort -rn
for f in .next/static/chunks/*.js; do echo "$(gzip -c "$f" | wc -c) $f"; done | sort -rn | head

# 2. Lighthouse, mobile preset, on the two routes that matter
npm start &
npx lighthouse http://localhost:3000/ \
  --preset=perf --form-factor=mobile --throttling-method=simulate \
  --output=html --output-path=./lh-home-before.html
npx lighthouse http://localhost:3000/work/nested-united \
  --preset=perf --form-factor=mobile --throttling-method=simulate \
  --output=html --output-path=./lh-nested-before.html
```

**In Chrome DevTools, the four checks that would confirm or refute my top findings:**
1. Performance panel, 6× CPU throttle + Fast 4G → read the actual LCP element and
   timestamp. **This directly tests F1.**
2. Network panel → confirm `2vnix6c90awqj.js` is requested on mobile, and time it.
   **Tests F2.**
3. Rendering panel → enable *Paint flashing* and *Layer borders*, then scroll past the
   nav. **Tests F9.**
4. `chrome://gpu` plus the Performance panel GPU track while hovering the hero.
   **Tests F3 and F5.**

⚠️ **Critical caveat on methodology:** test on a real low-end Android over remote
debugging, not just CPU throttling. Throttling simulates a slow CPU; it does **not**
simulate a weak GPU, and F3/F5/F9 are GPU-bound. **A GPU-bound problem cannot be
measured with a CPU-throttled profile** — this is the single biggest reason the
estimates in §3 need real-device confirmation before anyone acts on them as facts.

---

## 9. Recommended order of work

**Nothing below has been implemented. No source file was modified. Awaiting approval.**

### Tier 1 — no visual change whatsoever

| # | Change | Finding | Est. impact |
|---|---|---|---|
| 1 | Gate the eager three.js warm-up on device capability | F2 | −269 KB gz off the mobile critical path |
| 2 | Precision-round / genuinely minify `mz-logo.min.svg` | F4 | −~100 KB at highest priority, every route |
| 3 | Fix the `lowPower` heuristic (`deviceMemory` / `pointer: coarse`) | F5 | −50–60% hero shader cost on mid-range devices |
| 4 | IO-gate + coarse-pointer skip for `VariableProximity` | F6 | −4 permanent rAF loops |
| 5 | Point mobile cards at `SharedGrainient` | F8 | −2 WebGL contexts, −2 rAF loops |
| 6 | Glyph-cache `DataStreamHero` (`drawImage`, not `fillText`) | F11 | Large win, pixel-identical |
| 7 | Remove `filter` from `will-change` (`page.module.css:994`) | §5 | Drops a permanent GPU layer |
| 8 | Isolate the `Footer` clock into a leaf component | §6 | Stops a 1 Hz subtree re-render |
| 9 | Drop dead components; strip the `console.log` | F14/F16 | Hygiene |
| 10 | Extend `optimizePackageImports`; named `three` imports; check `browserslist` | F13/§4 | Bundle size |

### Tier 2 — visually near-identical, worth a glance before merging

| # | Change | Finding | Tradeoff |
|---|---|---|---|
| 11 | Cap logo `dpr` at 1.0–1.25 + `antialias: false` on mobile | F3 | Slightly softer edges |
| 12 | Reduce mobile card blur `1em` → `0.5em` | F8 | Marginally tighter glow |
| 13 | `resolutionScale={0.75}` for low-end `DarkVeil` | F5 | Slightly softer glow |
| 14 | Desktop `Waves` 2000 → 1200 points | F10 | Marginally sparser, at 15% opacity |
| 15 | Convert the HDR to compressed EXR/KTX2 | F12 | None at the same resolution |
| 16 | Remove the no-op `fontVariationSettings` write in Manifesto | F7 | None — it is literally a no-op |

### Tier 3 — requires a design decision; do not start without sign-off

| # | Change | Finding | What is lost |
|---|---|---|---|
| 17 | **Reduce hero entry delays** | **F1** | **The slow, luxurious reveal becomes brisk. Largest single CWV win on the site.** |
| 18 | Drop 2 of 6 lights on low-end | F3 | Flatter, less dimensional metal |
| 19 | Reduce/remove nav `backdrop-filter` on mobile | F9 | Frosted glass → semi-opaque, mobile only |
| 20 | Static logo fallback below a hardware threshold | F3 | No rotation, drag, or assembly on weak devices |
| 21 | Gate the `Manifesto` proximity effect on `(hover: fine)` | F7 | No colour/lift on touch (already inert there) |

**Items 1–10 are safe, mechanical, and account for a large share of the felt
improvement on weak devices. Item 17 is the largest single lever on the entire site and
is blocked on a design call, not on engineering.**

---

## 10. Complete tradeoff register

Every place where performance and visual quality are genuinely in tension. The team
decides these, not me.

| Finding | Performance gain | What you would lose visually |
|---|---|---|
| **F1** hero delays | **Largest LCP win available** | The paced, cinematic reveal. An identity decision, not a technical one |
| **F3** logo dpr/AA cap | ~50–75% fragment cost on mobile | Slightly softer logo edges |
| **F3** fewer lights | ~30% fragment cost | Flatter metal, less dimensional depth |
| **F3** Phong instead of PBR | Large | **Metallic reflections gone.** Not recommended |
| **F3** static fallback | Removes three.js entirely on weak devices | The 3D logo simply is not 3D there |
| **F5** DarkVeil dpr/scale | ~50–60% shader cost | Softer, slightly more banded glow. **Best cost/quality ratio on the site** |
| **F7** Manifesto effect | 137-element recalc removed | Nothing, if only the no-op is removed. Colour/lift lost only if fully gated |
| **F8** mobile blur radius | ~75% of that blur's cost | Slightly tighter "lumen" glow |
| **F8** SharedGrainient on mobile | −2 contexts | **Nothing** — designed to be pixel-identical |
| **F9** nav backdrop-filter | Large scroll-jank win | The frosted-glass nav, on mobile only |
| **F10** Waves point count | ~40% | Slightly sparser lines at 15% opacity |
| **F11** glyph cache | Large | **Nothing** — `drawImage` is pixel-identical |
| **F11** particle count | ~50% | Sparser symbol field |
| **F4/F12/F13/F14** | Moderate, cumulative | **Nothing at all** |

**Read this table as: everything marked "Nothing" should just be done. Everything else
needs a human to look at the screen and decide.**

---

## 11. Honest caveats

- **No browser measurements were taken.** Every Core Web Vitals number in §3 is an
  estimate reasoned from code paths and asset sizes. They could be materially wrong.
  §8 exists specifically to replace them.
- **GPU cost is reasoned, not profiled.** The ~1000 ALU ops/pixel figure for the CPPN
  shader is arithmetic from counting 36 `mat4` multiplies and 9 `sigmoid` calls in the
  source — not a GPU capture. I am confident in the *ranking* of GPU costs; the absolute
  numbers need a real capture.
- **I did not run `npm run build`.** All build figures come from the committed `.next/`
  directory (BUILD_ID `fRGoPbsmafvmOs7iHRAKz`, built 2026-08-10 17:09). If source has
  changed since, rebuild before trusting §4.
- **I could not verify that every `[data-paused]` binding** actually stops every
  infinite animation. Flagged in §5 as needing confirmation.
- **`/start` and `/privacy` received a lighter review** — both are small, text-only,
  statically prerendered, and carry no canvas or WebGL. They inherit the layout-level
  costs (F4, Lenis, `CustomCursor`) and nothing else of note.
- **The prior two audits remain the reference** for items marked done in §1.3. I
  re-verified their current status against the code but did not re-derive their original
  reasoning.
- **One prior-audit claim I could not reproduce:** both earlier documents state
  `public/mz.svg` and its backup were "byte-identical at 948,166 B." Today
  `backup/mz.original.svg` is 948,166 B but `public/mz.svg` is 181,603 B with a
  different hash — consistent with the rebrand in `5a7cc68`, not a contradiction. Noted
  so nobody re-opens a closed finding.

---

## 12. What is genuinely good

Stated plainly, because an unsparing audit that only lists faults is a misleading one:

- **Zero third-party scripts.** No analytics, no tag manager, no external fonts. Rare.
- **The IntersectionObserver discipline is excellent** — 6 of 7 animation systems pause
  correctly off-screen and on tab-hide.
- **WebGL teardown is handled properly**, including `WEBGL_lose_context` and
  `webglcontextlost` listeners. Most codebases never do this.
- **The `SharedGrainient` atlas renderer is a genuinely sophisticated fix** to the
  context-budget problem, and it is well documented in-file.
- **The 3-tier mesh cache** (memory → IndexedDB → build) with shape validation before
  hydration is careful, defensive engineering.
- **Image pipeline is clean** — WebP/AVIF, correct `sizes`, sensible `quality`.
- **CLS is well controlled** via `100svh`, `display: swap`, and transform-only animation.
- **Reduced-motion support is thorough** and reaches Lenis, the page wipe, and every
  canvas.
- **The −80% HTML reduction on `/work/nested-united`** was executed exactly as the prior
  audit prescribed, and it worked.

The engineering quality here is high. The problems are concentrated in a few specific,
fixable places — and the single biggest one is a stylesheet edit waiting on a design
decision.
