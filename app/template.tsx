"use client";

import { motion } from "framer-motion";
import { useLayoutEffect } from "react";

const COLUMNS = 5;
const WIPE_DURATION = 0.9; // seconds — must match transition below
const WIPE_STAGGER = 0.04; // seconds per column
const WIPE_TOTAL_MS = (WIPE_DURATION + WIPE_STAGGER * (COLUMNS - 1)) * 1000;

let isInitialLoad = true;

export default function Template({ children }: { children: React.ReactNode }) {
  const columns = COLUMNS;

  // Remove any exit overlay injected by TransitionLink. useLayoutEffect fires
  // synchronously before the browser paints, so our columns (initial y:0%)
  // are already covering the screen when the exit overlay disappears — zero flash.
  useLayoutEffect(() => {
    const wasInitial = isInitialLoad;
    isInitialLoad = false;
    const exitOverlay = document.querySelector("[data-transition-exit]");
    exitOverlay?.remove();

    if (!wasInitial) {
      // Fire event when the entry wipe fully completes, so hero animations
      // can sync precisely instead of using a blind delay.
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('mz-transition-done'));
      }, WIPE_TOTAL_MS);

      return () => clearTimeout(timer);
    }
  }, []);

  if (isInitialLoad) {
    // The Preloader handles the entrance on the very first load.
    // Do not render the transition overlay at all to avoid z-index fighting
    // or flashing over the jaw-dropping preloader sequence.
    return <>{children}</>;
  }

  return (
    <>
      {/* Unified Transition Overlay */}
      <div
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
          <motion.div
            key={`col-${i}`}
            initial={{ y: "-15vh" }} // Exactly where TransitionLink exit left off
            animate={{ y: "-130vh" }} // Move up so bottom Olive stripe crosses the screen
            transition={{
              duration: 0.9,
              ease: [0.76, 0, 0.24, 1], // Exact match for power4.inOut
              delay: i * 0.04, // Stagger left to right
            }}
            style={{
              position: "relative",
              flex: 1,
              height: "130vh", // 15vh Olive + 100vh Dark + 15vh Olive
              display: "flex",
              flexDirection: "column",
              marginLeft: i > 0 ? "-1px" : "0", // Prevent subpixel rendering gaps
            }}
          >
            {/* Top Olive Stripe (Invisible during entry since it's already above screen) */}
            <div style={{ height: "15vh", backgroundColor: "var(--color-brand-yellow)", width: "100%" }} />
            
            {/* Main Dark Block (Covers screen initially) */}
            <div style={{ height: "100vh", backgroundColor: "var(--color-bg)", width: "100%" }} />
            
            {/* Bottom Olive Stripe (Trailing racing stripe) */}
            <div style={{ height: "15vh", backgroundColor: "var(--color-brand-yellow)", width: "100%" }} />
          </motion.div>
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
