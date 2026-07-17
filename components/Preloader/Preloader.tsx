"use client";

import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { gsap } from 'gsap';
import './Preloader.css';

let hasRunOnce = false;

// Preload the SVG at module load time so it's instantly available before React even mounts
const svgPreload = typeof window !== 'undefined' ? fetch('/mz.svg').then(r => r.text()) : Promise.resolve('');

export const Preloader = () => {
  const { progress } = useProgress();
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

  const displayProgress = useRef({ val: 0 });

  // Lock scrolling
  useEffect(() => {
    if (isActive && visible) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isActive, visible]);

  // Path-Scatter / Assemble Animation Logic
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
      bboxSize: number;
      lineWidth: number;
    }

    let paths: PathData[] = [];
    let targetScale = 1;
    let targetCx = 0;
    let targetCy = 0;

    const MAX_STAGGER = 0.5; // Decreased from 0.8 so individual pieces have more overall travel time

    const easeInExpoSnap = (t: number): number => {
      // Perfectly matched velocities at the 0.80 split point (p=8) for a massive, slow zero-g float phase
      if (t < 0.80) {
        return 0.5 * Math.pow(t / 0.80, 8); // Long, slow drift
      }
      const t2 = (t - 0.80) / 0.20;
      return 0.5 + 0.5 * (1 - Math.pow(1 - t2, 2)); // Fast snap
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

          // Temporarily append to DOM to use the browser's native C++ SVG engine for bounding box sizes
          svgEl.style.position = 'absolute';
          svgEl.style.opacity = '0.001';
          svgEl.style.pointerEvents = 'none';
          svgEl.style.zIndex = '-9999';
          svgEl.style.left = '0px';
          svgEl.style.top = '0px';
          svgEl.style.width = '100px';
          svgEl.style.height = '100px';
          document.body.appendChild(svgEl);

          const rawPaths = Array.from(svgEl.querySelectorAll('path')).filter(p => {
          const d = p.getAttribute('d');
          return d && d.trim() !== '';
        });

        const parsedPaths: PathData[] = [];
        const svgScatter = Math.max(window.innerWidth, window.innerHeight) * 1.5; // Responsive scatter range

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
          
          // Use getBBox to find the centroid of the path in its local un-translated space.
          // Fallback to a default if the mobile browser refuses to render it.
          let bbox = { x: 0, y: 0, width: 50, height: 50 };
          try {
            const pmGraphics = pm as unknown as SVGGraphicsElement;
            const b = pmGraphics.getBBox();
            if (b && (b.width > 0 || b.height > 0)) {
               bbox = { x: b.x, y: b.y, width: b.width, height: b.height };
            }
          } catch (e) {
            // Ignore error
          }
          
          const bboxSize = Math.max(bbox.width, bbox.height);
          
          // Since there are no nested groups or rotations in mz.svg,
          // the global centroid in viewBox space is just the local centroid + the translation.
          const pathCx = tx + bbox.x + bbox.width / 2;
          const pathCy = ty + bbox.y + bbox.height / 2;

          const d = pm.getAttribute('d') || '';
          
          parsedPaths.push({
            p2d: new Path2D(d),
            tx, ty,
            pathCx,
            pathCy,
            scatterDx: 0,
            scatterDy: 0,
            scatterAngle: (Math.random() - 0.5) * Math.PI * 3,
            delay: 0,
            bboxSize,
            lineWidth: 0,
          });
        });

        document.body.removeChild(svgEl);

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
          pd.scatterDx = pullX + (Math.random() - 0.5) * 2 * svgScatter;
          pd.scatterDy = pullY + (Math.random() - 0.5) * 2 * svgScatter;

          // Compute delay based on distance to center (outer pieces assemble first)
          const distNorm = Math.hypot(pullX, pullY) / (maxDist || 1); // 0 at center, 1 at edge
          const baseDelay = (1 - distNorm) * MAX_STAGGER; 
          pd.delay = Math.min(MAX_STAGGER, Math.max(0, baseDelay + (Math.random() - 0.5) * 0.1 * MAX_STAGGER));

          // Group into lineWidth buckets (thin, medium, thick) to minimize canvas state changes
          const rawLineWidth = Math.max(0.2, Math.min(2.0, pd.bboxSize / 50));
          let category = 1.0;
          if (rawLineWidth < 0.8) category = 0.5;
          else if (rawLineWidth > 1.2) category = 1.5;
          pd.lineWidth = category / targetScale;
        });

        // Sort by lineWidth to minimize state changes in render loop
        parsedPaths.sort((a, b) => a.lineWidth - b.lineWidth);

        paths = parsedPaths;
        setPathsReady(true);

        if (isCancelled) return;

        let isFinalFrameDrawn = false;

        const render = () => {
          const time = performance.now() * 0.001;
          const p = displayProgress.current.val / 100;
          const drawProgress = Math.max(0, Math.min(1, (p - 0.05) / 0.8));
          const ringsActive = (p > 0.87 && p < 0.97);
          const glowActive = (drawProgress > 0.85 && drawProgress < 1.0);
          const floatAmplitude = Math.min(250, width * 0.3); // Responsive float radius

          // Stop the rAF loop entirely once everything is assembled and all effects have finished firing
          if (drawProgress === 1 && !ringsActive && !glowActive) {
            if (isFinalFrameDrawn) return;
            isFinalFrameDrawn = true;
          }

          ctx.clearRect(0, 0, width, height);

          if (paths.length > 0) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            if (drawProgress < 0.85) {
              ctx.globalCompositeOperation = 'lighter';
            } else {
              ctx.globalCompositeOperation = 'source-over';
            }

            let currentLineWidth = -1;

            paths.forEach((pd) => {
              const localT = Math.max(0, Math.min(1, (drawProgress - pd.delay) / (1 - MAX_STAGGER)));
              const easedT = Math.min(1.0, easeInExpoSnap(localT));
              
              const floatDx = Math.sin(time * 0.5 + pd.delay * 20) * floatAmplitude * (1 - easedT);
              const floatDy = Math.cos(time * 0.4 + pd.delay * 20) * floatAmplitude * (1 - easedT);
              const floatAngle = Math.sin(time * 0.3 + pd.delay * 20) * 1.0 * (1 - easedT);

              const curDx = pd.scatterDx * (1 - easedT) + floatDx;
              const curDy = pd.scatterDy * (1 - easedT) + floatDy;
              const curAngle = pd.scatterAngle * (1 - easedT) + floatAngle;
              
              // Fade in immediately at the start of the whole animation, independent of individual delay
              const alpha = Math.min(1, drawProgress * 10);
              const scaleIn = lerp(0.4, 1, easedT);
              
              if (pd.lineWidth !== currentLineWidth) {
                currentLineWidth = pd.lineWidth;
                ctx.lineWidth = currentLineWidth;
              }

              // Draw motion blur trail during the fast snap phase
              if (easedT > 0.5 && easedT < 1.0) {
                const ghostT = Math.max(0, localT - 0.02); // 2% lag
                const ghostEasedT = Math.min(1.0, easeInExpoSnap(ghostT));
                const gFloatDx = Math.sin(time * 0.5 + pd.delay * 20) * floatAmplitude * (1 - ghostEasedT);
                const gFloatDy = Math.cos(time * 0.4 + pd.delay * 20) * floatAmplitude * (1 - ghostEasedT);
                const gFloatAngle = Math.sin(time * 0.3 + pd.delay * 20) * 1.0 * (1 - ghostEasedT);

                const gDx = pd.scatterDx * (1 - ghostEasedT) + gFloatDx;
                const gDy = pd.scatterDy * (1 - ghostEasedT) + gFloatDy;
                const gAngle = pd.scatterAngle * (1 - ghostEasedT) + gFloatAngle;
                const gScaleIn = lerp(0.2, 1, ghostEasedT);

                ctx.globalAlpha = alpha * 0.15;
                const gScale = dpr * targetScale * gScaleIn;
                const gCosA = Math.cos(gAngle);
                const gSinA = Math.sin(gAngle);
                
                ctx.setTransform(
                  gScale * gCosA,
                  gScale * gSinA,
                  -gScale * gSinA,
                  gScale * gCosA,
                  dpr * (width / 2 + (pd.pathCx + gDx - targetCx) * targetScale),
                  dpr * (height / 2 + (pd.pathCy + gDy - targetCy) * targetScale)
                );
                ctx.translate(pd.tx - pd.pathCx, pd.ty - pd.pathCy);
                ctx.stroke(pd.p2d);
              }

              ctx.globalAlpha = alpha;
              const globalScale = dpr * targetScale * scaleIn;
              const cosA = Math.cos(curAngle);
              const sinA = Math.sin(curAngle);
              
              ctx.setTransform(
                globalScale * cosA,
                globalScale * sinA,
                -globalScale * sinA,
                globalScale * cosA,
                dpr * (width / 2 + (pd.pathCx + curDx - targetCx) * targetScale),
                dpr * (height / 2 + (pd.pathCy + curDy - targetCy) * targetScale)
              );
              ctx.translate(pd.tx - pd.pathCx, pd.ty - pd.pathCy);
              ctx.stroke(pd.p2d);
            });

            // Reset state after loop
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';

            // Single landing glow overlay (pulsing radial gradient)
            if (drawProgress > 0.85) {
              const glowT = (drawProgress - 0.85) / 0.15;
              const glowAlpha = Math.sin(glowT * Math.PI) * 0.15;
              if (glowAlpha > 0.01) {
                ctx.save();
                const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 3);
                grad.addColorStop(0, `rgba(255,255,255,${glowAlpha.toFixed(3)})`);
                grad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, width, height);
                ctx.restore();
              }
            }

            // Burst rings — concentric cinematic effect
            const rings = [0, 0.02, 0.04];
            rings.forEach(delay => {
              const start = 0.87 + delay;
              const end = start + 0.10;
              if (p > start && p < end) {
                const burstT = (p - start) / 0.10;
                ctx.save();
                ctx.translate(width / 2, height / 2);
                ctx.scale(targetScale, targetScale);
                ctx.translate(-targetCx, -targetCy);
                ctx.beginPath();
                ctx.arc(targetCx, targetCy, (burstT * 500) / targetScale, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255,255,255,${((1 - burstT) * 0.55).toFixed(3)})`;
                ctx.lineWidth = 3 / targetScale;
                ctx.stroke();
                ctx.restore();
              }
            });
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

    const target = progress === 0 ? 85 : (progress >= 95 ? 100 : Math.max(progress, 85));
    // Slower initial duration to allow for a longer zero-g float phase
    const dur = progress === 0 ? 6.0 : (progress >= 95 ? 4.0 : 1.5);

    const tween = gsap.to(displayProgress.current, {
      val: target,
      duration: dur,
      ease: progress === 0 ? 'power1.out' : 'power2.inOut',
      overwrite: 'auto',
      onUpdate: () => {
        if (displayProgress.current.val >= 95 && !isReadyRef.current) {
          setIsVisualReady(true);
        }
      }
    });

    return () => {
      tween.kill();
    };
  }, [progress, isActive, pathsReady]);

  // Exit animation
  useEffect(() => {
    if (!isActive) return;
    if (isVisualReady && progress >= 95 && !isReadyRef.current) {
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
  }, [progress, isActive, isVisualReady]);

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
      </div>
    </div>
  );
};
