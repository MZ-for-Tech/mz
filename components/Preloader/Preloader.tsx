"use client";

import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { gsap } from 'gsap';
import './Preloader.css';

let hasRunOnce = false;



export const Preloader = () => {
  const { progress } = useProgress();
  const isReadyRef = useRef(false);
  const [isActive] = useState(() => !hasRunOnce);
  const [visible, setVisible] = useState(true);
  const [isVisualReady, setIsVisualReady] = useState(false);

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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 800;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // Offscreen accumulation canvas — assembled paths are baked here once.
    // Each frame costs only a single drawImage for ALL assembled paths.
    const accCanvas = document.createElement('canvas');
    accCanvas.width = size * dpr;
    accCanvas.height = size * dpr;
    const accCtx = accCanvas.getContext('2d')!;
    accCtx.scale(dpr, dpr);

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
    }

    let paths: PathData[] = [];
    let targetScale = 1;
    let targetCx = 0;
    let targetCy = 0;

    const MAX_STAGGER = 0.65; // Spread out the assembly more
    const SCATTER_PX = 600;

    const easeOutBack = (t: number): number => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // Tracks which path indices have been baked to the accumulation canvas
    const assembledSet = new Set<number>();

    // SVG is 2289x2289. Base approximate values before transforms.
    const BASE_CX = 1143.5;
    const BASE_CY = 1145.5;
    const SVG_LOGO_W = 1093;
    const SVG_LOGO_H = 1109;

    // Tweak these offsets to optically center the logo against the crosshair
    const OPTICAL_OFFSET_X = 280; // Shift left/right
    const OPTICAL_OFFSET_Y = 150; // Shift up/down

    targetScale = 400 / Math.max(SVG_LOGO_W, SVG_LOGO_H); // ~0.361
    targetCx = BASE_CX + OPTICAL_OFFSET_X;
    targetCy = BASE_CY + OPTICAL_OFFSET_Y;

    fetch('/mz.svg')
      .then(res => res.text())
      .then(svgText => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgEl = doc.documentElement;

        const rawPaths = Array.from(svgEl.querySelectorAll('path')).filter(p => {
          const d = p.getAttribute('d');
          return d && d.trim() !== '';
        });

        const svgScatter = SCATTER_PX / targetScale;

        paths = rawPaths.map(pm => {
          let tx = 0, ty = 0;
          const transform = pm.getAttribute('transform');
          if (transform) {
            const match = transform.match(/translate\(\s*([^,\s)]+)[,\s]+([^)]+)\)/);
            if (match) { tx = parseFloat(match[1]); ty = parseFloat(match[2]); }
          }
          const d = pm.getAttribute('d') || '';

          // Incorporate tx/ty into the pivot point so shards rotate properly around their true origin
          const pathCx = tx + (Math.random() - 0.5) * SVG_LOGO_W * 0.2;
          const pathCy = ty + (Math.random() - 0.5) * SVG_LOGO_H * 0.2;

          // Force the scatter cloud to center on targetCx/targetCy so it's not off-center during assembly
          const pullToCenter = 1.0;

          return {
            p2d: new Path2D(d),
            tx, ty,
            pathCx,
            pathCy,
            scatterDx: (targetCx - pathCx) * pullToCenter + (Math.random() - 0.5) * 2 * svgScatter,
            scatterDy: (targetCy - pathCy) * pullToCenter + (Math.random() - 0.5) * 2 * svgScatter,
            scatterAngle: (Math.random() - 0.5) * Math.PI * 3,
            delay: Math.random() * MAX_STAGGER,
          };
        });
      })
      .catch(err => console.error('Error fetching SVG:', err));

    // Bake a batch of newly-assembled paths into the accumulation canvas.
    // Called at most once per path ever.
    const bakeToAcc = (batch: PathData[]) => {
      if (batch.length === 0) return;
      accCtx.save();
      accCtx.translate(size / 2, size / 2);
      accCtx.scale(targetScale, targetScale);
      accCtx.translate(-targetCx, -targetCy);
      accCtx.strokeStyle = '#ffffff';
      accCtx.lineWidth = 1.0 / targetScale; // Thinner for a sharper shard look
      accCtx.lineCap = 'round';
      accCtx.lineJoin = 'round';

      // Add a slight glow to the baked result
      accCtx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      accCtx.shadowBlur = 4 / targetScale;

      batch.forEach(pd => {
        accCtx.save();
        accCtx.translate(pd.tx, pd.ty);
        accCtx.stroke(pd.p2d);
        accCtx.restore();
      });
      accCtx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      const p = displayProgress.current.val / 100;

      // Single call renders ALL assembled paths
      ctx.drawImage(accCanvas, 0, 0);

      if (paths.length > 0) {
        // drawProgress: 0→1 maps to p=0.05→0.85
        const drawProgress = Math.max(0, Math.min(1, (p - 0.05) / 0.8));

        const newlyAssembled: PathData[] = [];

        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.scale(targetScale, targetScale);
        ctx.translate(-targetCx, -targetCy);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.0 / targetScale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        paths.forEach((pd, i) => {
          const localT = Math.max(0, Math.min(1,
            (drawProgress - pd.delay) / (1 - MAX_STAGGER)
          ));

          if (localT <= 0) return; // hasn't started yet — cheapest skip

          if (assembledSet.has(i)) return; // already baked to accCanvas

          if (localT >= 1) {
            // Mark as done, collect for baking
            assembledSet.add(i);
            newlyAssembled.push(pd);
            return;
          }

          // In-flight: apply scatter + easeOutBack interpolation
          const easedT = easeOutBack(localT);
          const clampedT = Math.max(0, Math.min(1.06, easedT));

          const curDx = pd.scatterDx * (1 - clampedT);
          const curDy = pd.scatterDy * (1 - clampedT);
          const curAngle = pd.scatterAngle * (1 - clampedT);

          // Fade in smoothly as it travels
          const alpha = lerp(0.0, 1, Math.min(1, localT * 2));
          // Scale from tiny shard to full size
          const scaleIn = lerp(0.2, 1, clampedT);

          ctx.save();
          ctx.globalAlpha = alpha;
          // Rotate around path's own centroid while scattering
          ctx.translate(pd.pathCx + curDx, pd.pathCy + curDy);
          ctx.rotate(curAngle);
          ctx.scale(scaleIn, scaleIn);
          ctx.translate(pd.tx - pd.pathCx, pd.ty - pd.pathCy);
          ctx.stroke(pd.p2d);
          ctx.restore();
        });

        ctx.restore();

        // Bake newly assembled to accCanvas + draw them this frame too
        // (accCanvas update only takes effect on the NEXT drawImage call)
        if (newlyAssembled.length > 0) {
          bakeToAcc(newlyAssembled);
          ctx.save();
          ctx.translate(size / 2, size / 2);
          ctx.scale(targetScale, targetScale);
          ctx.translate(-targetCx, -targetCy);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.0 / targetScale;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          newlyAssembled.forEach(pd => {
            ctx.save();
            ctx.translate(pd.tx, pd.ty);
            ctx.stroke(pd.p2d);
            ctx.restore();
          });
          ctx.restore();
        }

        // Burst ring — no shadowBlur
        if (p > 0.87 && p < 0.97) {
          const burstT = (p - 0.87) / 0.10;
          ctx.save();
          ctx.translate(size / 2, size / 2);
          ctx.scale(targetScale, targetScale);
          ctx.translate(-targetCx, -targetCy);
          ctx.beginPath();
          ctx.arc(targetCx, targetCy, (burstT * 500) / targetScale, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${((1 - burstT) * 0.55).toFixed(3)})`;
          ctx.lineWidth = 3 / targetScale;
          ctx.stroke();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive]);

  // Internal animation progress
  useEffect(() => {
    if (!isActive) return;

    const target = progress === 0 ? 85 : (progress >= 95 ? 100 : Math.max(progress, 85));
    // Slower duration for visual clarity
    const dur = progress === 0 ? 7.0 : (progress >= 95 ? 4.0 : 1.5);

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
  }, [progress, isActive]);

  // Exit animation
  useEffect(() => {
    if (!isActive) return;
    if (isVisualReady && progress >= 95 && !isReadyRef.current) {
      isReadyRef.current = true;
      hasRunOnce = true;

      const tl = gsap.timeline();

      // 1. The Core smoothly compresses into the final logo size
      tl.to(canvasRef.current, {
        scale: 0.35, // 400px down to 140px
        duration: 1.5,
        ease: 'power3.inOut',
      }, 0.5);

      // 2. Cinematic shutter split
      tl.add(() => {
        window.dispatchEvent(new Event('mz-preloader-done'));
      }, 2.5);

      tl.to(uiWrapperRef.current, {
        scale: 1.3,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in',
      }, 2.3);

      tl.to(topPanelRef.current, {
        y: '-100%',
        duration: 1.4,
        ease: 'expo.inOut',
      }, 2.5);
      tl.to(bottomPanelRef.current, {
        y: '100%',
        duration: 1.4,
        ease: 'expo.inOut',
        onComplete: () => setVisible(false),
      }, 2.5);

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

        {/* The scatter-assemble canvas — 800×800 set here so flexbox centers it BEFORE useEffect runs */}
        <canvas
          className="preloader-canvas"
          ref={canvasRef}
          width={800}
          height={800}
          style={{ width: '800px', height: '800px', display: 'block' }}
        />
      </div>
    </div>
  );
};
