"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import {
  GRAINIENT_VERTEX,
  GRAINIENT_FRAGMENT,
  GRAINIENT_DEFAULTS,
  resolveColor,
  type GrainientUniformValues,
} from "./grainientShader";
import styles from "./SharedGrainient.module.css";

/*
 * Renders the grainient shader into MANY regions of a container using a single
 * WebGL context, instead of one context + one rAF loop per region.
 *
 * How it stays pixel-identical to one-canvas-per-region:
 *  - the shader is resolution-parameterised (iResolution + gl_FragCoord), so
 *    rendering each region into a viewport of the shared atlas canvas produces
 *    exactly the pixels a standalone canvas of the same size would;
 *  - the atlas is drawn into a per-region 2D canvas with drawImage (2D
 *    canvases don't count against the ~16 WebGL context budget), so each
 *    region's visible canvas sits at the exact DOM position it had before.
 *
 * Regions are matched by `regionSelector` (e.g. "[data-grainient]") inside
 * `children`. One IntersectionObserver + visibilitychange gate the single
 * rAF loop, matching the pausing behaviour of the per-instance component.
 */

interface SharedGrainientProps extends Partial<GrainientUniformValues> {
  /** CSS selector for region elements inside `children` (e.g. "[data-grainient]") */
  regionSelector: string;
  className?: string;
  children: ReactNode;
}

type Region = {
  el: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  w: number;
  h: number;
};

function applyUniforms(program: Program, p: Partial<GrainientUniformValues>): void {
  const u = program.uniforms as unknown as Record<string, { value: number | Float32Array }>;
  u.uTimeSpeed.value = p.timeSpeed ?? GRAINIENT_DEFAULTS.timeSpeed;
  u.uColorBalance.value = p.colorBalance ?? GRAINIENT_DEFAULTS.colorBalance;
  u.uWarpStrength.value = p.warpStrength ?? GRAINIENT_DEFAULTS.warpStrength;
  u.uWarpFrequency.value = p.warpFrequency ?? GRAINIENT_DEFAULTS.warpFrequency;
  u.uWarpSpeed.value = p.warpSpeed ?? GRAINIENT_DEFAULTS.warpSpeed;
  u.uWarpAmplitude.value = p.warpAmplitude ?? GRAINIENT_DEFAULTS.warpAmplitude;
  u.uBlendAngle.value = p.blendAngle ?? GRAINIENT_DEFAULTS.blendAngle;
  u.uBlendSoftness.value = p.blendSoftness ?? GRAINIENT_DEFAULTS.blendSoftness;
  u.uRotationAmount.value = p.rotationAmount ?? GRAINIENT_DEFAULTS.rotationAmount;
  u.uNoiseScale.value = p.noiseScale ?? GRAINIENT_DEFAULTS.noiseScale;
  u.uGrainAmount.value = p.grainAmount ?? GRAINIENT_DEFAULTS.grainAmount;
  u.uGrainScale.value = p.grainScale ?? GRAINIENT_DEFAULTS.grainScale;
  u.uGrainAnimated.value = (p.grainAnimated ?? GRAINIENT_DEFAULTS.grainAnimated) ? 1.0 : 0.0;
  u.uContrast.value = p.contrast ?? GRAINIENT_DEFAULTS.contrast;
  u.uGamma.value = p.gamma ?? GRAINIENT_DEFAULTS.gamma;
  u.uSaturation.value = p.saturation ?? GRAINIENT_DEFAULTS.saturation;
  u.uCenterOffset.value = new Float32Array([
    p.centerX ?? GRAINIENT_DEFAULTS.centerX,
    p.centerY ?? GRAINIENT_DEFAULTS.centerY,
  ]);
  u.uZoom.value = p.zoom ?? GRAINIENT_DEFAULTS.zoom;
  u.uColor1.value = new Float32Array(resolveColor(p.color1 ?? GRAINIENT_DEFAULTS.color1));
  u.uColor2.value = new Float32Array(resolveColor(p.color2 ?? GRAINIENT_DEFAULTS.color2));
  u.uColor3.value = new Float32Array(resolveColor(p.color3 ?? GRAINIENT_DEFAULTS.color3));
}

export default function SharedGrainient({
  regionSelector,
  className = "",
  children,
  ...uniforms
}: SharedGrainientProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<Program | null>(null);
  const propsRef = useRef(uniforms);
  propsRef.current = uniforms;

  // One WebGL context for all regions; created once.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const regionEls = Array.from(wrap.querySelectorAll<HTMLElement>(regionSelector));
    if (regionEls.length === 0) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        canvas: document.createElement("canvas"),
        webgl: 2,
        alpha: true,
        antialias: false,
        preserveDrawingBuffer: true, // safe drawImage on all browsers
        dpr: 1,
      });
    } catch (e) {
      console.warn("SharedGrainient WebGL init failed:", e);
      return;
    }
    const gl = renderer.gl;
    const atlas = gl.canvas as HTMLCanvasElement;

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: GRAINIENT_VERTEX,
      fragment: GRAINIENT_FRAGMENT,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uTimeSpeed: { value: 0.25 },
        uColorBalance: { value: 0.0 },
        uWarpStrength: { value: 1.0 },
        uWarpFrequency: { value: 5.0 },
        uWarpSpeed: { value: 2.0 },
        uWarpAmplitude: { value: 50.0 },
        uBlendAngle: { value: 0.0 },
        uBlendSoftness: { value: 0.05 },
        uRotationAmount: { value: 500.0 },
        uNoiseScale: { value: 2.0 },
        uGrainAmount: { value: 0.1 },
        uGrainScale: { value: 2.0 },
        uGrainAnimated: { value: 0.0 },
        uContrast: { value: 1.5 },
        uGamma: { value: 1.0 },
        uSaturation: { value: 1.0 },
        uCenterOffset: { value: new Float32Array([0, 0]) },
        uZoom: { value: 0.9 },
        uColor1: { value: new Float32Array([1, 1, 1]) },
        uColor2: { value: new Float32Array([1, 1, 1]) },
        uColor3: { value: new Float32Array([1, 1, 1]) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    programRef.current = program;
    applyUniforms(program, uniforms);

    // Visible per-region canvases (2D — not WebGL, no context budget impact).
    const regions: Region[] = regionEls.map((el) => {
      const canvas = document.createElement("canvas");
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      canvas.style.pointerEvents = "none";
      el.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("SharedGrainient: no 2d context");
      return { el, canvas, ctx, x: 0, y: 0, w: 1, h: 1 };
    });

    let atlasW = 1;
    let atlasH = 1;

    const updateRects = () => {
      const wrapRect = wrap.getBoundingClientRect();
      atlasW = Math.max(1, Math.round(wrapRect.width));
      atlasH = Math.max(1, Math.round(wrapRect.height));
      if (atlas.width !== atlasW || atlas.height !== atlasH) {
        renderer.setSize(atlasW, atlasH);
      }
      for (const r of regions) {
        const rr = r.el.getBoundingClientRect();
        r.x = Math.round(rr.left - wrapRect.left);
        r.y = Math.round(rr.top - wrapRect.top);
        r.w = Math.max(1, Math.round(rr.width));
        r.h = Math.max(1, Math.round(rr.height));
        if (r.canvas.width !== r.w || r.canvas.height !== r.h) {
          r.canvas.width = r.w;
          r.canvas.height = r.h;
        }
      }
    };
    updateRects();

    const ro = new ResizeObserver(updateRects);
    ro.observe(wrap);
    for (const r of regions) ro.observe(r.el);

    const themeObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "data-theme") applyUniforms(program, propsRef.current);
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const u = program.uniforms as unknown as Record<string, { value: number | Float32Array }>;

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    // Region rects can change without a resize — e.g. the sticky service cards
    // on mobile shift against the wrap while the page scrolls. ResizeObserver
    // alone would leave the atlas regions stale for the whole sticky run, so
    // a passive scroll listener flags a recompute for the next drawn frame.
    let rectsDirty = false;

    const draw = () => {
      if (rectsDirty) {
        rectsDirty = false;
        updateRects();
      }
      (u.iTime as { value: number }).value = (performance.now() - t0) * 0.001;
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (const r of regions) {
        // GL viewport origin is bottom-left; flip y so the atlas image-space
        // rect matches the drawImage source rect below.
        gl.viewport(r.x, atlasH - (r.y + r.h), r.w, r.h);
        (u.iResolution as { value: Float32Array }).value[0] = r.w;
        (u.iResolution as { value: Float32Array }).value[1] = r.h;
        mesh.draw();
      }
      for (const r of regions) {
        r.ctx.drawImage(atlas, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
      }
    };

    const loop = (t: number) => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    const tryStart = () => {
      if (prefersReducedMotion()) {
        draw();
        return;
      }
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
    };
    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      tryStop();
    };
    atlas.addEventListener("webglcontextlost", onLost, false);

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          tryStart();
        } else {
          tryStop();
        }
      },
      { threshold: 0 }
    );
    io.observe(wrap);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) {
        tryStart();
      } else {
        tryStop();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onScroll = () => {
      if (raf === 0 && isVisible && isPageVisible) {
        // Static mode (reduced motion / paused): the rAF loop isn't running,
        // so re-measure and re-blit once — keeps sticky-shifted regions correct.
        updateRects();
        draw();
      } else {
        rectsDirty = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    tryStart();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      atlas.removeEventListener("webglcontextlost", onLost, false);
      tryStop();
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      for (const r of regions) {
        try {
          r.el.removeChild(r.canvas);
        } catch {
          /* ignore */
        }
      }
      programRef.current = null;
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionSelector]);

  // Keep uniforms in sync when props change (colors resolve from CSS vars).
  useEffect(() => {
    const program = programRef.current;
    if (!program) return;
    applyUniforms(program, uniforms);
  }, [
    uniforms.timeSpeed, uniforms.colorBalance, uniforms.warpStrength,
    uniforms.warpFrequency, uniforms.warpSpeed, uniforms.warpAmplitude,
    uniforms.blendAngle, uniforms.blendSoftness, uniforms.rotationAmount,
    uniforms.noiseScale, uniforms.grainAmount, uniforms.grainScale,
    uniforms.grainAnimated, uniforms.contrast, uniforms.gamma, uniforms.saturation,
    uniforms.centerX, uniforms.centerY, uniforms.zoom,
    uniforms.color1, uniforms.color2, uniforms.color3,
  ]);

  return (
    <div ref={wrapRef} className={`${styles.container} ${className}`.trim()}>
      {children}
    </div>
  );
}
