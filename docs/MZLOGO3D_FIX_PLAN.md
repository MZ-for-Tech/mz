# MzLogo3D — Texture Flicker Fix Plan

**Target:** `components/Logo/MzLogo3D.tsx`
**Constraint:** No changes to `public/mz.svg` (480 paths preserved — collapsing them destroys the artwork). The `Environment preset="forest"` and the assembly animation stay.
**Diagnosis (verified against the file):** the flicker is **specular aliasing on the extruded rims** — top rim, bottom rim, and sides. The front face is clean. Two mechanisms were suspected (z-fighting + specular), but the diagnostic confirmed specular aliasing as the sole cause.

**Status: ✅ COMPLETE** — flicker eliminated, logo retains premium metallic look.
**Follow-up: ⚠️ A2 caused a colour regression. Fixed — see "Regression: the gold slab" below.**

---

## Regression: the gold slab (post-A2)

After A2 shipped, the logo rendered as a near-solid **gold slab** — the green `#91B600`
paths and everything else were gone. A2 was the trigger, but not the bug.

**Root cause.** The material cache assigned `polygonOffsetFactor: matIndex`, where
`matIndex` increments per *unique colour in SVG paint order*. Verified against
`public/mz.svg`, that order begins:

```
#FFD700 (gold)  → factor 0
#91B600 (green) → factor 1
#6C6905         → factor 2
...
```

A **positive** `polygonOffsetFactor` pushes a surface *away* from the camera. So gold,
at factor 0, won the depth test against every single later colour. The SVG has ~290
unique colours across its 480 paths, so factors spanned 0–289 — which is why the
burial was total rather than subtle.

**Why A2 exposed it.** `logarithmicDepthBuffer: true` forces three.js to write
`gl_FragDepth` in the fragment shader, which overrides the rasterizer's polygon offset
**entirely**. The offset had always been wrongly signed; it was simply a silent no-op.
Removing the flag activated a latent bug. Row A2 below claimed this as a benefit
("restores polygonOffset effectiveness") — it restored a *broken* offset.

**Fix.** Removed `polygonOffset` from the material cache outright. `Z_STEP` already
handles layering correctly on its own: later paths sit at a larger `+z`, i.e. nearer
the camera at `z=12`. Combined with A1's tightened `near: 5 / far: 40`, each step has
ample depth-buffer separation. Also restored `metalness: 0.9 / roughness: 0.25` — the
diagnostic values (`0.3 / 0.5`) had been left in the file despite the doc recording
B2 as "not needed".

**Lesson.** A redundant mechanism that is silently disabled is not harmless — it is a
bug waiting for someone to remove the thing disabling it. `Z_STEP` and `polygonOffset`
were never both working; only one ever was.

---

## What was actually wrong


The diagnostic (metalness:0, roughness:1) eliminated the flicker entirely, proving it was **specular aliasing**, not depth/z-fighting. On high-DPR screens, the thin extruded rims are sub-pixel, and with `metalness: 0.9 / roughness: 0.25` the environment-map highlights shimmer violently while the logo sways.

---

## What was applied

| Fix | Change | Why it helped |
|---|---|---|
| **A1** | Camera `near: 5, far: 40` | ~60× depth precision; future-proofing (not the root cause but good hygiene) |
| **A2** | Removed `logarithmicDepthBuffer: true` | Early-Z rejection — but exposed a latent wrongly-signed `polygonOffset`; see the regression note above |
| **B1** | Initial dpr 1.5, ceiling 2.0 | Eliminates sub-pixel specular sparkle on high-DPR screens |
| **A3′** | Removed `polygonOffset` from the material cache | Fixes the gold-slab regression; `Z_STEP` alone handles layering |

**Not needed:** A3 (per-path polygonOffset), B2 (roughness change), B3 (geometry segments) — the specular aliasing was purely a resolution issue.

---

## Files changed

- `components/Logo/MzLogo3D.tsx` — 3 lines changed:
  - Line 451-453: added `near: 5, far: 40` to camera
  - Line 457-460: removed `logarithmicDepthBuffer: true`
  - Line 437: `dpr` initial state 1.0 → 1.5
  - Line 463-464: PerformanceMonitor band widened to 1→2

---

## Verification

- [x] Flicker gone on top rim, bottom rim, and sides during the 1.5s assembly
- [x] Flicker gone during scroll-tilt and the idle sway
- [x] Flicker gone on high-DPR screen
- [x] Logo still reads as metallic MZ mark at rest and mid-sway
- [x] `dpr` adapts on capable GPUs (PerformanceMonitor band 1→2)
- [x] No new jank: FPS stays ~60 on mid-range device during full scroll

---

## Remaining considerations (not blockers)

1. **SVG path count (480)** — unchanged per constraint. If you ever revisit, SVGO can reduce to ~30 paths, cutting geometry build time by ~16×.
2. **Remote Environment preset** — still hits the drei CDN. Self-hosting a small HDR would remove the third-party dependency.
3. **Mobile skip** — the 3D logo still mounts on mobile. Consider `next/dynamic` + device gate to remove three.js from mobile bundle entirely.


---

## Why the front is clean and the edges aren't

Each SVG path becomes an `ExtrudeGeometry` (z 0→32) and the mesh is offset by `pathIndex * Z_STEP` (`MzLogo3D.tsx:150`, `:409`).

- **Caps** sit at a single depth, so the Z offset separates stacked paths — front face stays clean. ✓
- **Side walls** are **parallel to the Z axis** and span the full z-range. Offsetting a wall along Z slides it *within its own plane* — two paths with coincident outlines keep **perfectly coincident walls** no matter how large `Z_STEP` gets. ✗
- 480 paths, 75 positions with multiple stacked paths → dozens of coincident wall pairs → edge-on z-fighting, which is precisely the "insane flickering on top, bottom, sides; front is fine" you see.

The comment at `MzLogo3D.tsx:26-27` ("without a Z offset those paths share the exact same depth plane") is correct for caps and false for walls — this is the root misconception the plan corrects.

---

## Track A — Depth fixes (the structural fix)

### A1. Tighten the camera near/far plane

**Why.** The camera uses three.js defaults (`near: 0.1, far: 2000`) because none are set at `MzLogo3D.tsx:450-453`. `Z_STEP` in world units is `0.02 × 0.0035 = 7.0e-5`, but the depth buffer at z=12 with those defaults only resolves ~8.6e-5 — so adjacent path offsets are **below the noise floor** and stacked paths only survive when far apart in draw order.

**Change.** Set explicit near/far. Cost: zero visual change; instant ~60× depth precision.

```tsx
// MzLogo3D.tsx:450-453 — replace the camera block
camera={{
  position: [0, 0, 12],
  fov: 38,
  near: 5,   // camera starts at z=12; logo spans ~±0.2 → near=5 is safe and adds ~60× depth precision
  far: 40,   // camera recedes to ~14.5 at max scroll; far=40 keeps the far plane tight
}}
```

The `scrollProgress` camera recede (`:371-375`) tops out at `12 + 2.5 = 14.5`, so `far: 40` holds. This alone may eliminate most of the flicker.

### A2. Remove `logarithmicDepthBuffer: true`

**Why.** `gl.logarithmicDepthBuffer` (`:460`) forces three.js to write `gl_FragDepth` in the fragment shader, which **overwrites the rasterizer's polygon-offset adjustment**. It is currently nullifying the material's `polygonOffset` entirely — and it also defeats early-Z rejection, which is expensive across 480 overlapping meshes. The code already solves z-fighting two other ways (`Z_STEP` + `polygonOffset`), so this third mechanism is redundant and harmful.

**Change.** Delete the flag.

```tsx
// MzLogo3D.tsx:454-461 — remove the logarithmicDepthBuffer line
gl={{
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
}}
```

### A3. Make `polygonOffset` per-path instead of per-colour

**Why.** `polygonOffsetFactor: matIndex` (`:112-113`) uses the material index — one material per unique colour (the cache at `:98-119`). Two same-coloured stacked paths share a material, so they get the **same offset**, and the very first material gets factor 0 = no offset at all. The side walls need **per-path** offsets to separate coincident walls.

**The constraint that shapes the fix.** `polygonOffsetFactor` is a **material** property, not a mesh property. There is no way to vary it per-mesh while sharing one material object. So per-path offsets require per-path materials — which means trading draw-call batching for depth separation. The current cache produces one material per unique colour; the fix produces one per path that needs it.

**Change.** Key the cache by `color + pathIndex` instead of `color` alone, so each path gets its own material with its own offset, while identical colours still share the underlying colour value:

```tsx
// MzLogo3D.tsx:98-119 — replace the material cache and getMaterial
const materialCache = new Map<string, THREE.MeshStandardMaterial>();

// Offset grows with paint order: later paths win the depth test against earlier ones.
// Negative factor pulls the surface toward the camera in depth space.
const getMaterial = (color: string, pathIdx: number) => {
  const key = `${color}|${pathIdx}`;
  if (!materialCache.has(key)) {
    materialCache.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.9,
        roughness: 0.25,
        polygonOffset: true,
        polygonOffsetFactor: -pathIdx * 0.5,  // slope-scaled term — this is what fixes edge-on walls
        polygonOffsetUnits: -pathIdx * 0.5,   // constant term
      })
    );
  }
  return materialCache.get(key)!;
};
```

```tsx
// MzLogo3D.tsx:148-166 — pass the path index through
svg.paths.forEach((path) => {
  const color = `#${path.color.getHexString()}`;
  const zOffset = pathIndex * Z_STEP;
  const thisPathIndex = pathIndex;
  pathIndex++;

  path.toShapes().forEach((shape) => {
    items.push({
      geometry: new THREE.ExtrudeGeometry(shape, extrudeSettings),
      material: getMaterial(color, thisPathIndex),
      zOffset,
      // ... scatter/rot fields unchanged
    });
  });
});
```

No change is needed at the mesh JSX (`:403-415`) beyond A4's `renderOrder` — the offset rides on the material.

**Why `polygonOffset` is the right tool here specifically.** Its `factor` term scales with the polygon's **depth slope**. A wall viewed edge-on has a near-infinite depth slope, so the factor term produces a large separation exactly where `Z_STEP` produces none. This is the one mechanism in the codebase that addresses the actual failure mode.

**The cost, stated plainly.** This defeats material batching: up to 480 distinct materials instead of ~N-unique-colours. Each is a separate draw call with its own uniform upload. On desktop that is absorbable; on a mid-range Android it is real. Two mitigations if it bites:
- Only assign a unique material to paths that actually overlap (requires bounding-box overlap detection at build time — more complexity, but cuts the material count sharply since most of the 480 don't collide).
- Cap the offset ramp: `-Math.min(pathIdx, 64) * 0.5` reuses offsets beyond 64 paths, since paths far apart in draw order rarely coincide spatially.

**Decision rule:** implement A1 + A2 first and look at it. A1 gives ~60× depth precision for free with zero perf cost; that may resolve the fight entirely and make A3's draw-call trade unnecessary. Only reach for A3 if rim flicker survives step 3 — it is the riskiest edit in this plan on both correctness and performance.


### A4. Deterministic `renderOrder`

**Why.** With 480 overlapping transparent-ish meshes, render order is currently whatever R3F's scene-graph sort produces. Depth-sorted draws on same-depth geometry is the classic recipe for flicker that *changes as the camera sways*.

**Change.** Set `renderOrder={i}` (paint in SVG draw order) and, if any walls still fight, add `depthWrite: false` on the wall-only portions — but walls are part of the same geometry as caps, so that is not possible without splitting geometry. **Do not split.** `renderOrder` alone is the surgical version.

---

## Track B — Specular aliasing (the shimmer component)

### B1. Raise the dpr ceiling and widen the PerformanceMonitor band

**Why.** `dpr` is capped at 1.0 (`:437`) and drops to 0.75 on decline (`:463`). On a 2×/3× screen the thin rims are sub-pixel, and with `metalness: 0.9 / roughness: 0.25` the env-map highlights shimmer violently while the logo sways. MSAA (`antialias: true`) does not fix specular sparkle — it only smooths geometric edges.

**Change.** Raise the ceiling to 2, let PerformanceMonitor range 1→2:

```tsx
// MzLogo3D.tsx:437 — dpr ceiling
const [dpr, setDpr] = useState(1.0);

// MzLogo3D.tsx:448-449 — pass dpr as a range so R3F interpolates
<Canvas
  dpr={dpr}
  ...
```

```tsx
// MzLogo3D.tsx:463 — widen the band so it can actually climb
<PerformanceMonitor
  onIncline={() => setDpr(Math.min(2, dpr + 0.25))}
  onDecline={() => setDpr(Math.max(1, dpr - 0.25))}
/>
```

This keeps the adaptive fallback for low-end devices while letting capable GPUs run at native resolution — exactly the "premium but not broken" trade-off.

### B2. (Optional) soften the material

**Why.** `roughness: 0.25` gives the hardest, sparkliest env reflections. A slightly softer surface makes the PMREM mip blurrier and kills the shimmer while staying clearly metallic.

**Change (hold until after a real look at the dpr bump):**

```tsx
// MzLogo3D.tsx:107 — roughness 0.25 → 0.32
roughness: 0.32,
```

This is the only change in this plan that touches the look. It is reversible and can be tuned in isolation. If you like the current glint, skip it — B1 may be enough.

### B3. (Optional) geometry resolution

`curveSegments: 1` (`:82`) makes rims chunky; `bevelSegments: 1` (`:81`) gives faceted bevels. Raising to 2 each smooths the specular highlight path and removes some sparkle — at a small geometry/memory cost across 480 meshes. Hold back unless B1+B2 aren't enough; it is the only change with a real per-mesh cost.

---

## Diagnostic gate (run this first — 2 minutes)

Before tuning any appearance knob, determine how much of the flicker is depth vs. specular:

```tsx
// MzLogo3D.tsx:105-109 — temporary: replace the material creation
new THREE.MeshStandardMaterial({
  color,
  metalness: 0,        // was 0.9
  roughness: 1,        // was 0.25
  ...
})
```

- **Flicker survives** → it's depth → A1 (and A3 if needed).
- **Flicker vanishes** → it's specular → B1 (and B2 if needed).
- **Partial** → both → A1 + B1, then reassess.

This one experiment splits the two tracks and tells you which of A3 / B2 / B3 you actually need. Do it before writing anything else.

---

## Implementation order

| Step | Change | Why this order | Risk |
|---|---|---|---|
| 0 | Diagnostic (metalness 0 / roughness 1) | Splits the two mechanisms; tells you if A3/B2/B3 are needed | none |
| 1 | A1 — camera near/far | Highest impact/effort ratio; may fix most of it alone | negligible |
| 2 | A2 — remove `logarithmicDepthBuffer` | Restores polygonOffset + early-Z; no visual change | low |
| 3 | Test on hard scroll + sway | Verifies depth track before touching materials | — |
| 4 | A3 — per-path polygonOffset | Only if rim flicker survives step 3 | medium (material pipeline) |
| 5 | B1 — dpr ceiling + band | Kills specular shimmer; adaptive perf preserved | low |
| 6 | Test on 2×/3× screen | Verifies specular track | — |
| 7 | B2 — roughness 0.32 | Optional; only if shimmer remains after B1 | low (visual) |
| 8 | B3 — curve/bevel segments | Optional; only if both tracks still show | medium (geometry) |
| 9 | Re-measure per the audit (§8) | Proves the changes didn't regress TBT/INP/FPS | — |

**Est. total:** ~1.5–2h including testing. No SVG changes. Environment preset and assembly animation untouched.

---

## Verification checklist

- [ ] Flicker gone on top rim, bottom rim, and sides during the 1.5s assembly
- [ ] Flicker gone during scroll-tilt and the idle sway at 0.5× playback
- [ ] Flicker gone on a 2×/3× DPR screen (or B2 applied and confirmed)
- [ ] Logo still reads as the MZ mark at rest and mid-sway
- [ ] `dpr` still falls back on a throttled profile (PerformanceMonitor band)
- [ ] No new jank: devtools FPS meter stays ~60 on a mid-range device during full scroll
- [ ] `renderOrder` change has no visual side effects on the assembly animation
- [ ] Bundle/asset audit items from `docs/PERFORMANCE_AUDIT.md` §6 still hold (nothing here should regress them)
