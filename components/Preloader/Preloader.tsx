"use client";

import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { gsap } from 'gsap';
import './Preloader.css';

let hasRunOnce = false;

// Preload the SVG at module load time so it's instantly available before React even mounts
const svgPreload = typeof window !== 'undefined' ? fetch('/mz.svg').then(r => r.text()) : Promise.resolve('');

export const Preloader = () => {
  const { progress, active, total } = useProgress();
  const [fakeProgress, setFakeProgress] = useState(0);
  const isReadyRef = useRef(false);
  const [isActive] = useState(() => !hasRunOnce);
  const [visible, setVisible] = useState(true);
  const [isVisualReady, setIsVisualReady] = useState(false);
  const [pathsReady, setPathsReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const uiWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  const displayProgress = useRef({ val: 0 });

  // Lock scrolling
  useEffect(() => {
    if (isActive && visible) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isActive, visible]);

  // Fallback for non-3D pages (e.g. /privacy) where useProgress() never fires
  useEffect(() => {
    if (!isActive) return;
    let timer: NodeJS.Timeout;
    
    // If no 3D assets are loading after a short delay, assume it's a non-3D page
    if (!active && total === 0) {
      timer = setTimeout(() => {
        setFakeProgress(100);
      }, 600); 
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [active, total, isActive]);

  const effectiveProgress = Math.max(progress, fakeProgress);

  // Path-Scatter / Assemble Animation Logic
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1); // Cap to 1.0 DPR for max 2D canvas throughput
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);



    let animationFrameId: number;

    interface PathData {
      p2d: Path2D;
      tx: number;
      ty: number;
      pathCx: number; // centroid x in global SVG space
      pathCy: number; // centroid y in global SVG space
      scatterDx: number;
      scatterDy: number;
      scatterAngle: number;
      delay: number; // 0..MAX_STAGGER
      groupIndex: number; // 0..5 cluster group
      bboxSize: number;
      lineWidth: number;
    }

    let paths: PathData[] = [];
    let targetScale = 1;
    let targetCx = 0;
    let targetCy = 0;

    const MAX_STAGGER = 0.5; // Decreased from 0.8 so individual pieces have more overall travel time

    const easeInExpoSnap = (t: number): number => {
      // Perfectly matched velocities at the 0.60 split point for a balanced float and a breathing, slower assembly
      if (t < 0.60) {
        return 0.5 * Math.pow(t / 0.60, 4); // Smooth, continuous drift
      }
      const t2 = (t - 0.60) / 0.40;
      return 0.5 + 0.5 * (1 - Math.pow(1 - t2, 3)); // Relaxed, breathing assembly
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    let isCancelled = false;
    displayProgress.current.val = 0;

    svgPreload
      .then(svgText => {
        if (isCancelled) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgEl = doc.documentElement;

          // Parse viewBox to get exact mathematical center of the artwork natively
          let vbX = 0, vbY = 0, vbW = 1000, vbH = 1000;
          const vb = svgEl.getAttribute('viewBox');
          if (vb) {
            const parts = vb.split(/\s+/).map(parseFloat);
            if (parts.length === 4) {
              [vbX, vbY, vbW, vbH] = parts;
            }
          }
          
          targetCx = vbX + vbW / 2;
          targetCy = vbY + vbH / 2;
          const targetDisplaySize = Math.min(window.innerWidth * 0.8, 400); // 80% of screen width, up to 400px
          targetScale = targetDisplaySize / Math.max(1, Math.max(vbW, vbH));

          const rawPaths = Array.from(svgEl.querySelectorAll('path')).filter(p => {
          const d = p.getAttribute('d');
          return d && d.trim() !== '';
        });

        const parsedPaths: PathData[] = [];
        const svgScatter = Math.max(window.innerWidth, window.innerHeight) * 1.5; // Huge scatter area

        rawPaths.forEach(pm => {
          let tx = 0, ty = 0;
          const transform = pm.getAttribute('transform');
          if (transform) {
            const match = transform.match(/translate\(\s*([^,\s)]+)[,\s]+([^)]+)\)/);
            if (match) {
              tx = parseFloat(match[1]);
              ty = parseFloat(match[2]);
            }
          }
          
          const d = pm.getAttribute('d') || '';
          
          // Fast lightweight centroid estimate without heavy regex loops
          const pathCx = tx + 25;
          const pathCy = ty + 25;
          
          parsedPaths.push({
            p2d: new Path2D(d),
            tx, ty,
            pathCx,
            pathCy,
            scatterDx: 0,
            scatterDy: 0,
            scatterAngle: (Math.random() - 0.5) * Math.PI * 2,
            delay: 0,
            groupIndex: 0,
            bboxSize: 50,
            lineWidth: 1.0 / targetScale,
          });
        });

        // To normalize distances, find max distance
        let maxDist = 0;
        parsedPaths.forEach(pd => {
          const dist = Math.hypot(targetCx - pd.pathCx, targetCy - pd.pathCy);
          if (dist > maxDist) maxDist = dist;
        });

        // Now that we have the exact center, compute scatter pulls
        parsedPaths.forEach(pd => {
          const pullX = targetCx - pd.pathCx;
          const pullY = targetCy - pd.pathCy;
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.pow(Math.random(), 0.5) * svgScatter; // Push more shards outwards
          pd.scatterDx = pullX * 1.5 + Math.cos(angle) * dist;
          pd.scatterDy = pullY * 1.5 + Math.sin(angle) * dist;

          // Compute delay based on distance to center (outer pieces assemble first)
          const distNorm = Math.hypot(pullX, pullY) / (maxDist || 1); // 0 at center, 1 at edge
          const baseDelay = (1 - distNorm) * MAX_STAGGER; 
          pd.delay = Math.min(MAX_STAGGER, Math.max(0, baseDelay + (Math.random() - 0.5) * 0.1 * MAX_STAGGER));

          // Group into 6 spatial cluster waves based on scatter direction
          const scatterAnglePos = Math.atan2(pd.scatterDy, pd.scatterDx) + Math.PI;
          pd.groupIndex = Math.floor((scatterAnglePos / (Math.PI * 2)) * 6) % 6;

          pd.lineWidth = 1.0 / targetScale;
        });

        // Sort by lineWidth to minimize state changes in render loop
        parsedPaths.sort((a, b) => a.lineWidth - b.lineWidth);

        paths = parsedPaths;
        setPathsReady(true);

        if (isCancelled) return;

        let isFinalFrameDrawn = false;
        let animStartTime = -1;
        let convergeStartTime = -1;
        let isVisualReadyFired = false;

        // Phase durations (seconds)
        const FADE_IN_DUR = 0.5;
        const MIN_FLOAT_DUR = 0.15;
        const CONVERGE_DUR = 2.0;
        const FLOAT_AMP = Math.min(90, Math.max(width, height) * 0.09);

        const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

        const render = () => {
          const now = performance.now() * 0.001;
          if (animStartTime < 0) animStartTime = now;
          const elapsed = now - animStartTime;

          if (counterRef.current) {
            counterRef.current.innerText = elapsed.toFixed(2) + 's';
          }

          // ── Phase timing ──────────────────────────────────────────
          const fadeT = clamp01(elapsed / FADE_IN_DUR);
          const floatElapsed = Math.max(0, elapsed - FADE_IN_DUR);

          // Converge starts when: loading done AND minimum float time has passed
          const loadingDone = displayProgress.current.val >= 95;
          if (loadingDone && floatElapsed >= MIN_FLOAT_DUR && convergeStartTime < 0) {
            convergeStartTime = now;
          }

          const convergeElapsed = convergeStartTime >= 0 ? now - convergeStartTime : 0;
          const convergeT = clamp01(convergeElapsed / CONVERGE_DUR);

          // Signal completion to React (once, after converge)
          if (convergeT >= 1 && !isVisualReadyFired) {
            isVisualReadyFired = true;
            setIsVisualReady(true);
          }

          // Burst rings fire for 0.6s after converge ends
          const ringElapsed = convergeElapsed - CONVERGE_DUR;
          const ringsActive = ringElapsed >= 0 && ringElapsed < 0.6;

          if (convergeT >= 1 && !ringsActive) {
            if (isFinalFrameDrawn) return;
            isFinalFrameDrawn = true;
          }

          ctx.clearRect(0, 0, width, height);

          if (paths.length > 0) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            let currentLineWidth = -1;

            paths.forEach((pd) => {
              // ── Phase 1: smooth group wave fade-in ─────────────────
              // Shards light up in 6 smooth spatial cluster waves sweeping across the screen
              const groupStart = (pd.groupIndex / 6) * 0.45;
              const groupProgress = clamp01((fadeT - groupStart) / 0.55);
              const alpha = Math.sin(groupProgress * Math.PI * 0.5); // Smooth sine ease
              if (alpha < 0.005) return; // skip invisible shards

              // ── Phase 2 & 3: float → converge ─────────────────────
              const localT = clamp01((convergeT - pd.delay) / (1 - MAX_STAGGER));
              const convergeEased = Math.min(1.0, easeInExpoSnap(localT));

              const floatFactor = 1 - convergeEased;
              const phase = (pd.groupIndex / 6) * Math.PI * 2;
              const floatDx = Math.sin(now * 0.5 + phase) * FLOAT_AMP * floatFactor;
              const floatDy = Math.cos(now * 0.4 + phase * 1.3) * FLOAT_AMP * floatFactor;
              const floatAngle = Math.sin(now * 0.35 + phase * 0.8) * 0.35 * floatFactor;

              // Scatter offset + float, both lerp to 0 as shards converge
              const curDx = pd.scatterDx * floatFactor + floatDx;
              const curDy = pd.scatterDy * floatFactor + floatDy;
              const curAngle = pd.scatterAngle * floatFactor + floatAngle;

              // Scale: tiny while floating, fully grown once placed
              const scaleIn = lerp(0.2, 1.0, convergeEased);

              if (pd.lineWidth !== currentLineWidth) {
                currentLineWidth = pd.lineWidth;
                ctx.lineWidth = currentLineWidth;
              }

              ctx.globalAlpha = alpha;
              const globalScale = dpr * targetScale * scaleIn;
              const cosA = Math.cos(curAngle);
              const sinA = Math.sin(curAngle);

              ctx.setTransform(
                globalScale * cosA,  globalScale * sinA,
                -globalScale * sinA, globalScale * cosA,
                dpr * (width  / 2 + (pd.pathCx + curDx - targetCx) * targetScale),
                dpr * (height / 2 + (pd.pathCy + curDy - targetCy) * targetScale)
              );
              ctx.translate(pd.tx - pd.pathCx, pd.ty - pd.pathCy);
              ctx.stroke(pd.p2d);
            });

            // Reset canvas state
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';

            // Landing glow — single pulse as shards lock into place
            if (convergeT > 0.75 && convergeT < 1.0) {
              const glowT = (convergeT - 0.75) / 0.25;
              const glowAlpha = Math.sin(glowT * Math.PI) * 0.18;
              if (glowAlpha > 0.005) {
                const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 3);
                grad.addColorStop(0, `rgba(255,255,255,${glowAlpha.toFixed(3)})`);
                grad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, width, height);
              }
            }

            // Burst rings at assembly completion
            if (ringsActive) {
              [0, 0.1, 0.2].forEach(delay => {
                const t = clamp01((ringElapsed - delay) / 0.5);
                if (t <= 0) return;
                ctx.save();
                ctx.translate(width / 2, height / 2);
                ctx.beginPath();
                ctx.arc(0, 0, t * Math.max(width, height) * 0.38, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255,255,255,${((1 - t) * 0.5).toFixed(3)})`;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
              });
            }
          }

          animationFrameId = requestAnimationFrame(render);
        };

        render();
      })
      .catch(err => console.error('Error fetching SVG:', err));

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);

  // Internal animation progress
  useEffect(() => {
    if (!isActive || !pathsReady) return;

    // This tween drives displayProgress.current.val, which the render loop
    // polls to know when loading is done (val >= 95 → start converge).
    const target = effectiveProgress >= 95 ? 100 : Math.max(effectiveProgress, 10);
    const dur = effectiveProgress >= 95 ? 1.5 : 2.0;

    const tween = gsap.to(displayProgress.current, {
      val: target,
      duration: dur,
      ease: 'power2.inOut',
      overwrite: 'auto',
    });

    return () => {
      tween.kill();
    };
  }, [effectiveProgress, isActive, pathsReady]);

  // Exit animation
  useEffect(() => {
    if (!isActive) return;
    if (isVisualReady && effectiveProgress >= 95 && !isReadyRef.current) {
      isReadyRef.current = true;
      hasRunOnce = true;

      const tl = gsap.timeline();

      // Hold + breathe
      tl.to(canvasRef.current, { scale: 1.04, duration: 0.8, ease: 'power2.inOut' }, 0);
      
      // Clean split — no flash, no flicker
      tl.to(canvasRef.current, { opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.6);
      tl.to(topPanelRef.current, { y: '-100%', duration: 1.2, ease: 'expo.inOut' }, 0.7);
      tl.to(bottomPanelRef.current, { y: '100%', duration: 1.2, ease: 'expo.inOut', onComplete: () => setVisible(false) }, 0.7);
      tl.add(() => window.dispatchEvent(new Event('mz-preloader-done')), 0.8);

      return () => { tl.kill(); };
    }
  }, [effectiveProgress, isActive, isVisualReady]);

  if (!isActive) {
    // If client-side navigation, immediately dispatch to unblock hero
    window.dispatchEvent(new Event('mz-preloader-done'));
  }

  if (!isActive || !visible) return null;

  return (
    <div className="preloader-container" ref={containerRef}>
      <div className="preloader-panel top" ref={topPanelRef}></div>
      <div className="preloader-panel bottom" ref={bottomPanelRef}></div>

      <div className="preloader-ui" ref={uiWrapperRef} style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>

        {/* The scatter-assemble canvas — full screen so shards don't clip */}
        <canvas
          className="preloader-canvas"
          ref={canvasRef}
          style={{ width: '100vw', height: '100vh', display: 'block' }}
        />

        <div 
          ref={counterRef} 
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            zIndex: 10
          }}
        >
          0.00s
        </div>
      </div>
    </div>
  );
};
