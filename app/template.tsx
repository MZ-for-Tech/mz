"use client";

import { motion } from "framer-motion";
import { useLayoutEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const columns = 5;

  // Remove any exit overlay injected by TransitionLink. useLayoutEffect fires
  // synchronously before the browser paints, so our columns (initial y:0%)
  // are already covering the screen when the exit overlay disappears — zero flash.
  useLayoutEffect(() => {
    const exitOverlay = document.querySelector("[data-transition-exit]");
    exitOverlay?.remove();
  }, []);

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
            <div style={{ height: "15vh", backgroundColor: "var(--color-acid-green)", width: "100%" }} />
            
            {/* Main Dark Block (Covers screen initially) */}
            <div style={{ height: "100vh", backgroundColor: "var(--color-bg)", width: "100%" }} />
            
            {/* Bottom Olive Stripe (Trailing racing stripe) */}
            <div style={{ height: "15vh", backgroundColor: "var(--color-acid-green)", width: "100%" }} />
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
