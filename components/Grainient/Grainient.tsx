"use client";

import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import './Grainient.css';
import { GRAINIENT_VERTEX, GRAINIENT_FRAGMENT, GRAINIENT_DEFAULTS, resolveColor } from "./grainientShader";

interface GrainientProps {
  timeSpeed?: number;
  colorBalance?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  paused?: boolean;
  active?: boolean;
  fallbackImage?: string;
  className?: string;
}

// Keep renderer/program alive across re-renders so Effect 2 can update
// uniforms without ever rebuilding the WebGL context.
type GrainientCtx = {
  renderer: InstanceType<typeof Renderer>;
  program: InstanceType<typeof Program>;
  mesh: InstanceType<typeof Mesh>;
};
const ctxMap = new WeakMap<HTMLDivElement, GrainientCtx>();

const Grainient: React.FC<GrainientProps> = ({
  timeSpeed = GRAINIENT_DEFAULTS.timeSpeed,
  colorBalance = GRAINIENT_DEFAULTS.colorBalance,
  warpStrength = GRAINIENT_DEFAULTS.warpStrength,
  warpFrequency = GRAINIENT_DEFAULTS.warpFrequency,
  warpSpeed = GRAINIENT_DEFAULTS.warpSpeed,
  warpAmplitude = GRAINIENT_DEFAULTS.warpAmplitude,
  blendAngle = GRAINIENT_DEFAULTS.blendAngle,
  blendSoftness = GRAINIENT_DEFAULTS.blendSoftness,
  rotationAmount = GRAINIENT_DEFAULTS.rotationAmount,
  noiseScale = GRAINIENT_DEFAULTS.noiseScale,
  grainAmount = GRAINIENT_DEFAULTS.grainAmount,
  grainScale = GRAINIENT_DEFAULTS.grainScale,
  grainAnimated = GRAINIENT_DEFAULTS.grainAnimated,
  contrast = GRAINIENT_DEFAULTS.contrast,
  gamma = GRAINIENT_DEFAULTS.gamma,
  saturation = GRAINIENT_DEFAULTS.saturation,
  centerX = GRAINIENT_DEFAULTS.centerX,
  centerY = GRAINIENT_DEFAULTS.centerY,
  zoom = GRAINIENT_DEFAULTS.zoom,
  color1 = GRAINIENT_DEFAULTS.color1,
  color2 = GRAINIENT_DEFAULTS.color2,
  color3 = GRAINIENT_DEFAULTS.color3,
  paused = false,
  active = true,
  fallbackImage,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Effect 1: build WebGL context once, pause when offscreen / tab hidden
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1)
      });
    } catch (e) {
      console.warn("Grainient WebGL init failed:", e);
      return;
    }

    const gl = renderer.gl;
    if (!gl) return;
    
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.className = 'grainient-canvas';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: GRAINIENT_VERTEX,
      fragment: GRAINIENT_FRAGMENT,
      uniforms: {
        iTime:           { value: 0 },
        iResolution:     { value: new Float32Array([1, 1]) },
        uTimeSpeed:      { value: 0.25 },
        uColorBalance:   { value: 0.0 },
        uWarpStrength:   { value: 1.0 },
        uWarpFrequency:  { value: 5.0 },
        uWarpSpeed:      { value: 2.0 },
        uWarpAmplitude:  { value: 50.0 },
        uBlendAngle:     { value: 0.0 },
        uBlendSoftness:  { value: 0.05 },
        uRotationAmount: { value: 500.0 },
        uNoiseScale:     { value: 2.0 },
        uGrainAmount:    { value: 0.1 },
        uGrainScale:     { value: 2.0 },
        uGrainAnimated:  { value: 0.0 },
        uContrast:       { value: 1.5 },
        uGamma:          { value: 1.0 },
        uSaturation:     { value: 1.0 },
        uCenterOffset:   { value: new Float32Array([0, 0]) },
        uZoom:           { value: 0.9 },
        uColor1:         { value: new Float32Array([1, 1, 1]) },
        uColor2:         { value: new Float32Array([1, 1, 1]) },
        uColor3:         { value: new Float32Array([1, 1, 1]) }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctxMap.set(container, { renderer, program, mesh });

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h);
      const res = (program.uniforms.iResolution as { value: Float32Array }).value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    const loop = (t: number) => {
      if (pausedRef.current) { raf = 0; return; }
      (program.uniforms.iTime as { value: number }).value = (t - t0) * 0.001;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };

    const tryStart = () => {
      if (prefersReducedMotion()) {
        renderer.render({ scene: mesh });
        return;
      }
      if (isVisible && isPageVisible && !pausedRef.current && raf === 0) raf = requestAnimationFrame(loop);
    };
    const tryStop = () => {
      if (raf !== 0) { cancelAnimationFrame(raf); raf = 0; }
    };

    const onLost = (e: Event) => { e.preventDefault(); tryStop(); };
    canvas.addEventListener("webglcontextlost", onLost, false);

    const io = new IntersectionObserver(
      ([entry]) => { 
        isVisible = entry.isIntersecting; 
        if (isVisible) { tryStart(); } else { tryStop(); }
      },
      { threshold: 0 }
    );
    io.observe(container);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) { tryStart(); } else { tryStop(); }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onToggle = () => {
      if (pausedRef.current) tryStop();
      else tryStart();
    };
    window.addEventListener('grainient-toggle', onToggle);

    tryStart();

    return () => {
      window.removeEventListener('grainient-toggle', onToggle);
      canvas.removeEventListener("webglcontextlost", onLost, false);
      tryStop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      ctxMap.delete(container);
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      try { container.removeChild(canvas); } catch { /* ignore */ }
    };
  }, [active]); // renderer created once

  // Effect 2: sync props to uniforms — zero GPU cost, no teardown
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = ctxMap.get(container);
    if (!ctx) return;
    const { program } = ctx;
    const u = program.uniforms as Record<string, { value: number | Float32Array }>;

    const updateUniforms = () => {
      u.uTimeSpeed.value      = timeSpeed;
      u.uColorBalance.value   = colorBalance;
      u.uWarpStrength.value   = warpStrength;
      u.uWarpFrequency.value  = warpFrequency;
      u.uWarpSpeed.value      = warpSpeed;
      u.uWarpAmplitude.value  = warpAmplitude;
      u.uBlendAngle.value     = blendAngle;
      u.uBlendSoftness.value  = blendSoftness;
      u.uRotationAmount.value = rotationAmount;
      u.uNoiseScale.value     = noiseScale;
      u.uGrainAmount.value    = grainAmount;
      u.uGrainScale.value     = grainScale;
      u.uGrainAnimated.value  = grainAnimated ? 1.0 : 0.0;
      u.uContrast.value       = contrast;
      u.uGamma.value          = gamma;
      u.uSaturation.value     = saturation;
      u.uCenterOffset.value   = new Float32Array([centerX, centerY]);
      u.uZoom.value           = zoom;
      u.uColor1.value         = new Float32Array(resolveColor(color1));
      u.uColor2.value         = new Float32Array(resolveColor(color2));
      u.uColor3.value         = new Float32Array(resolveColor(color3));
    };

    updateUniforms();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          updateUniforms();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, [
    timeSpeed, colorBalance, warpStrength, warpFrequency, warpSpeed,
    warpAmplitude, blendAngle, blendSoftness, rotationAmount, noiseScale,
    grainAmount, grainScale, grainAnimated, contrast, gamma, saturation,
    centerX, centerY, zoom, color1, color2, color3
  ]);

  // Effect 3: respond immediately to paused prop changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = ctxMap.get(container);
    if (!ctx) return;
    // trigger a check via visibility/paused state change
    window.dispatchEvent(new Event('grainient-toggle'));
  }, [paused]);


  return (
    <div ref={containerRef} className={`grainient-container ${className}`.trim()}>
      {!active && fallbackImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={fallbackImage} 
          alt="" 
          className="grainient-canvas" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      ) : null}
    </div>
  );
};

export default Grainient;
