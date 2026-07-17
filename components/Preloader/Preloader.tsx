"use client";

import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { gsap } from 'gsap';
import './Preloader.css';

// Module-level flag: only run the preloader on the very first mount
// ever in this browser tab lifecycle. Client-side navigations skip it.
let hasRunOnce = false;

export const Preloader = () => {
  const { progress } = useProgress();
  const isReadyRef = useRef(false);
  const [isActive] = useState(() => !hasRunOnce); // frozen at mount time
  const [visible, setVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const uiWrapperRef = useRef<HTMLDivElement>(null);
  const ringOuterRef = useRef<HTMLDivElement>(null);
  const ringMiddleRef = useRef<HTMLDivElement>(null);
  const ringInnerRef = useRef<HTMLDivElement>(null);
  const centerDotRef = useRef<HTMLDivElement>(null);
  const crosshairXRef = useRef<HTMLDivElement>(null);
  const crosshairYRef = useRef<HTMLDivElement>(null);
  const dataWrapperRef = useRef<HTMLDivElement>(null);

  const displayProgress = useRef({ val: 14 });

  // Lock scrolling on mount
  useEffect(() => {
    if (isActive && visible) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isActive, visible]);

  // Counter animation
  useEffect(() => {
    if (!isActive) return;

    // Fake progress trick: if real progress is stuck at 0 (due to main thread blocking),
    // we slowly count up to 85% to assure the user the site hasn't frozen.
    // Once real progress updates, it takes over.
    const target = progress === 0 ? 85 : (progress >= 95 ? 100 : progress);
    const dur = progress === 0 ? 3.5 : (progress >= 95 ? 0.8 : 0.3);

    const tween = gsap.to(displayProgress.current, {
      val: target,
      duration: dur,
      ease: progress === 0 ? 'power1.out' : 'power2.out',
      overwrite: 'auto',
      onUpdate: () => {
        if (counterRef.current) {
          const n = Math.floor(displayProgress.current.val);
          const clamped = Math.min(100, n);
          counterRef.current.innerText = clamped.toString().padStart(3, '0');
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [progress, isActive]);

  // Exit animation
  useEffect(() => {
    if (!isActive) return;
    // Check if we hit the "good enough" progress threshold
    if (progress >= 95 && !isReadyRef.current) {
      isReadyRef.current = true;
      hasRunOnce = true; // prevent future mounts in this tab from activating

      const tl = gsap.timeline();

      // Stop CSS animations from fighting GSAP transform matrix
      if (ringOuterRef.current) ringOuterRef.current.style.animation = 'none';
      if (ringMiddleRef.current) ringMiddleRef.current.style.animation = 'none';
      if (ringInnerRef.current) ringInnerRef.current.style.animation = 'none';

      // 1. UI collapses inward
      tl.to([dataWrapperRef.current, centerDotRef.current], {
        scale: 0.85,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.inOut',
      }, 0);
      tl.to([ringOuterRef.current, ringMiddleRef.current, ringInnerRef.current], {
        rotation: "+=90",
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.inOut',
      }, 0);
      tl.to([crosshairXRef.current, crosshairYRef.current], {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      }, 0.2);

      // 2. Cinematic shutter split — brief pause then fast snap
      tl.add(() => {
        // Fire the event halfway through the shutter animation (0.35 start + 0.6)
        // so the text perfectly animates as the black panels reveal the center.
        window.dispatchEvent(new Event('mz-preloader-done'));
      }, 0.9);

      tl.to(topPanelRef.current, {
        y: '-100%',
        duration: 1.2,
        ease: 'expo.inOut',
      }, 0.35);
      tl.to(bottomPanelRef.current, {
        y: '100%',
        duration: 1.2,
        ease: 'expo.inOut',
        onComplete: () => {
          setVisible(false);
        },
      }, 0.35);

      return () => {
        tl.kill();
      };
    }
  }, [progress, isActive]);

  // If this isn't the first load, render nothing and immediately fire done
  useEffect(() => {
    if (!isActive) {
      window.dispatchEvent(new Event('mz-preloader-done'));
    }
  }, [isActive]);

  if (!isActive || !visible) return null;

  return (
    <div className="preloader-container" ref={containerRef}>
      {/* Background cinematic crosshairs */}
      <div className="preloader-crosshair-x" ref={crosshairXRef}></div>
      <div className="preloader-crosshair-y" ref={crosshairYRef}></div>


      <div className="preloader-panel top" ref={topPanelRef}></div>
      <div className="preloader-panel bottom" ref={bottomPanelRef}></div>

      <div className="preloader-ui" ref={uiWrapperRef}>
        <div className="preloader-center-dot" ref={centerDotRef}></div>

        {/* Outer slow ring */}
        <div className="preloader-ring ring-outer" ref={ringOuterRef}>
          <svg viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
              strokeDasharray="4 8"
            />
          </svg>
        </div>

        {/* Middle precise ring */}
        <div className="preloader-ring ring-middle" ref={ringMiddleRef}>
          <svg viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
            {/* Ticks */}
            <line x1="50" y1="6" x2="50" y2="10" stroke="var(--color-brand-yellow)" strokeWidth="0.5" />
            <line x1="50" y1="90" x2="50" y2="94" stroke="var(--color-brand-yellow)" strokeWidth="0.5" />
            <line x1="6" y1="50" x2="10" y2="50" stroke="var(--color-brand-yellow)" strokeWidth="0.5" />
            <line x1="90" y1="50" x2="94" y2="50" stroke="var(--color-brand-yellow)" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Inner fast ring */}
        <div className="preloader-ring ring-inner" ref={ringInnerRef}>
          <svg viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="0.5"
              strokeDasharray="20 40"
            />
          </svg>
        </div>

        <div className="preloader-data" ref={dataWrapperRef}>
          <div className="preloader-counter">
            <span ref={counterRef}>000</span>
            <span className="preloader-percent">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
