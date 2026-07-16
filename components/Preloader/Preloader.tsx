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

  const containerRef = useRef<HTMLDivElement>(null);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const uiWrapperRef = useRef<HTMLDivElement>(null);

  const displayProgress = useRef({ val: 0 });

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Enforce a minimum viewing time for the cinematic experience
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => setMinTimeElapsed(true), 2500);
    return () => clearTimeout(timer);
  }, [isActive]);

  // Main animation + progress tracking
  useEffect(() => {
    if (!isActive) return;

    document.body.style.overflow = 'hidden';

    // Continuously spin the rings
    const spinTweens = [
      gsap.to('.ring-outer', { rotation: 360, duration: 20, repeat: -1, ease: 'linear' }),
      gsap.to('.ring-middle', { rotation: -360, duration: 15, repeat: -1, ease: 'linear' }),
      gsap.to('.ring-inner', { rotation: 360, duration: 8, repeat: -1, ease: 'linear' }),
    ];

    // Smoothly animate the displayed counter
    gsap.to(displayProgress.current, {
      val: progress,
      duration: progress === 100 ? 1.5 : 0.5, // Artificially slow down to look cool
      ease: 'power2.out',
      onUpdate: () => {
        if (counterRef.current) {
          const n = Math.floor(displayProgress.current.val);
          counterRef.current.innerText = n.toString().padStart(3, '0');
        }
      },
    });

    if (progress === 100 && minTimeElapsed && !isReadyRef.current) {
      isReadyRef.current = true;
      hasRunOnce = true; // prevent future mounts in this tab from activating


      spinTweens.forEach(t => t.pause());

      const tl = gsap.timeline();

      // 1. UI collapses inward
      tl.to(['.preloader-counter', '.preloader-center-dot'], {
        scale: 0.85,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.inOut',
      }, 0);
      tl.to('.preloader-ring', {
        rotation: "+=90",
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.inOut',
      }, 0);
      tl.to(['.preloader-crosshair-x', '.preloader-crosshair-y', '.preloader-meta'], {
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
          document.body.style.overflow = '';
          if (containerRef.current) containerRef.current.style.display = 'none';
        },
      }, 0.35);
    }
  }, [progress, isActive, minTimeElapsed]);

  // If this isn't the first load, render nothing and immediately fire done
  useEffect(() => {
    if (!isActive) {
      window.dispatchEvent(new Event('mz-preloader-done'));
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="preloader-container" ref={containerRef}>
      {/* Background cinematic crosshairs */}
      <div className="preloader-crosshair-x"></div>
      <div className="preloader-crosshair-y"></div>

      {/* Corner Meta Data */}
      <div className="preloader-meta top-left">SYS.VER.1.0.4</div>
      <div className="preloader-meta top-right">CAIRO_EGYPT</div>
      <div className="preloader-meta bottom-left">LAT.30.0444_LON.31.2357</div>
      <div className="preloader-meta bottom-right">ENG.NULL_HYPOTHESIS</div>

      <div className="preloader-panel top" ref={topPanelRef}></div>
      <div className="preloader-panel bottom" ref={bottomPanelRef}></div>

      <div className="preloader-ui" ref={uiWrapperRef}>
        <div className="preloader-center-dot"></div>
        
        {/* Outer slow ring */}
        <div className="preloader-ring ring-outer">
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
        <div className="preloader-ring ring-middle">
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
        <div className="preloader-ring ring-inner">
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

        <div className="preloader-data">
          <div className="preloader-counter">
            <span ref={counterRef}>000</span>
            <span className="preloader-percent">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
