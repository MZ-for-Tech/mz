"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

import { prefersReducedMotion } from "@/lib/useReducedMotion";

const COLUMNS = 5;
const WIPE_DURATION = 0.9; // seconds — must match transition below
const WIPE_STAGGER = 0.04; // seconds per column
const WIPE_TOTAL_MS = (WIPE_DURATION + WIPE_STAGGER * (COLUMNS - 1)) * 1000;

export default function Template({ children }: { children: React.ReactNode }) {
  const columns = COLUMNS;
  const containerRef = useRef<HTMLDivElement>(null);

  // Remove any exit overlay injected by TransitionLink. useLayoutEffect fires
  // synchronously before the browser paints, so our columns (initial y:0%)
  // are already covering the screen when the exit overlay disappears — zero flash.
  useLayoutEffect(() => {
    const exitOverlay = document.querySelector("[data-transition-exit]");
    exitOverlay?.remove();

    if (prefersReducedMotion()) {
      if (containerRef.current) containerRef.current.style.display = 'none';
      window.dispatchEvent(new Event('mz-transition-done'));
      return;
    }

    if (containerRef.current) {
      const cols = containerRef.current.children;
      gsap.fromTo(
        cols,
        { y: "-15vh" },
        {
          y: "-130vh",
          duration: WIPE_DURATION,
          ease: "power4.inOut",
          stagger: WIPE_STAGGER,
        }
      );
    }

    // Fire event when the entry wipe fully completes, so hero animations
    // can sync precisely instead of using a blind delay.
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('mz-transition-done'));
    }, WIPE_TOTAL_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Unified Transition Overlay */}
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 99999,
          display: "flex",
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={`col-${i}`}
            style={{
              position: "relative",
              flex: 1,
              height: "130vh", // 15vh Olive + 100vh Dark + 15vh Olive
              display: "flex",
              flexDirection: "column",
              marginLeft: i > 0 ? "-1px" : "0", // Prevent subpixel rendering gaps
              transform: "translateY(-15vh)", // Initial state
            }}
          >
            {/* Top Olive Stripe (Invisible during entry since it's already above screen) */}
            <div style={{ height: "15vh", backgroundColor: "var(--color-brand-yellow)", width: "100%" }} />
            
            {/* Main Dark Block (Covers screen initially) */}
            <div style={{ height: "100vh", backgroundColor: "var(--color-bg)", width: "100%" }} />
            
            {/* Bottom Olive Stripe (Trailing racing stripe) */}
            <div style={{ height: "15vh", backgroundColor: "var(--color-brand-yellow)", width: "100%" }} />
          </div>
        ))}
      </div>
      
      {/* 
        We DO NOT wrap children in motion.div because transforming them 
        breaks `position: fixed` and GSAP ScrollTriggers globally.
      */}
      {children}
    </>
  );
}
