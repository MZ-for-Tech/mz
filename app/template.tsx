"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { takeWipeDecision } from "@/lib/mzNav";

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

    // Navigations inside the start-screen ↔ launcher world skip the wipe: the
    // background must stay on screen while the foreground swaps. See lib/mzNav.
    const shouldWipe = takeWipeDecision(window.location.pathname);

    if (!shouldWipe || prefersReducedMotion()) {
      if (containerRef.current) containerRef.current.style.display = 'none';
      // Async: listeners for this event attach in passive effects, which run
      // after this layout effect. A synchronous dispatch would be missed.
      const t = setTimeout(() => window.dispatchEvent(new Event('mz-transition-done')), 0);
      return () => clearTimeout(t);
    }

    let timer: ReturnType<typeof setTimeout>;
    let raf2: number;
    let tween: gsap.core.Tween | undefined;

    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const cols = containerRef.current.children;
        tween = gsap.fromTo(
          cols,
          { y: "-15vh" },
          {
            y: "-130vh",
            duration: WIPE_DURATION,
            ease: "power4.inOut",
            stagger: WIPE_STAGGER,
            /* Retire the container the moment the last column finishes, and
               not on a timer. The tween's own completion is the only event
               that is guaranteed to be the real end of the animation: a
               `setTimeout` sized to match would fire early on a slow frame
               and cut the last column off mid-slide, and firing it from the
               tween means the overlay is never visible for longer than the
               wipe itself. */
            onComplete: () => {
              if (containerRef.current) {
                containerRef.current.style.display = "none";
              }
            },
          }
        );

        // Fire event when the entry wipe fully completes, so hero animations
        // can sync precisely instead of using a blind delay.
        timer = setTimeout(() => {
          window.dispatchEvent(new Event('mz-transition-done'));
        }, WIPE_TOTAL_MS);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timer);
      tween?.kill();
    };
  }, []);

  /* HIDE THE OVERLAY ONCE THE WIPE IS DONE — and this is not optional.

     The wipe animates each column to `y: -130vh`, which parks it just off the
     top of the screen, and then nothing else ever touches it. The container is
     `position: fixed` at `z-index: 99999`, so it does not go away when the
     page scrolls: it stays in the document, above everything, for the life of
     the page.

     The visible consequence is small and easy to misread. A column is
     15vh yellow + 100vh dark + 15vh yellow, and parked at -130vh exactly one
     band is still on screen: the 15vh yellow one, sitting across the top of
     the viewport. So a 15vh stripe of brand yellow lies over the header on
     every launcher page.

     The header's own chrome is `z-index: 6`, so the stripe paints over it.
     Most of the bar is light ink and survives a yellow backdrop, but the clock
     is the one thing that does not: off-white on brand yellow is light on
     light, and the readout disappears. It also looked like the clock's colour
     was wrong, which is how this was originally misdiagnosed twice — the
     colour is fine, it has simply been behind a yellow rectangle the whole
     time.

     `.panel`'s `backwards` fill-mode note in MenuShell makes the same point
     about a related trap: a property left applied on a fixed, high-z element
     is invisible until it is suddenly not. */
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
