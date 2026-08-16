"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Prevent browser from restoring scroll position natively (fixes back button lock)
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Stop Lenis immediately so it doesn't fight with the reset
    lenis.stop();

    // Scroll to top via native API to clear any stuck positions
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true, force: true });

    // Give layout time to settle (e.g. isMounted states, framer-motion)
    const timeoutId = setTimeout(() => {
      lenis.start();
      lenis.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
      lenis.resize();
      ScrollTrigger.refresh();
    }, 150); // 150ms covers most React mounting lifecycle shifts

    return () => clearTimeout(timeoutId);
  }, [pathname, lenis]);

  return null;
}

function LenisGsapBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // 1. Drive ScrollTrigger from Lenis' own scroll callback
    lenis.on("scroll", ScrollTrigger.update);

    // 2. Drive Lenis from GSAP's ticker so both share one rAF loop
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // 3. Pause the loop entirely while the tab is hidden (battery/CPU)
    const onVisibility = () => {
      if (document.hidden) lenis.stop();
      else lenis.start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // 4. SELF-HEAL GUARDS — a stopped Lenis swallows wheel events
    //    (preventDefault + no scroll), which freezes the page until refresh.
    //    `stop()` is normally paired with `start()` (route change / tab
    //    visibility), but a missed `visibilitychange` on wake or alt-tab
    //    return can strand it. These guards make any stranded stop heal on
    //    the user's very next scroll attempt (or window focus) instead of
    //    freezing the page:
    //
    //    - wheel (capture): runs BEFORE Lenis' own wheel handler, so the
    //      event that heals the stop is also processed normally by Lenis.
    const onWheelCapture = () => {
      if (lenis.isStopped && !document.hidden) {
        lenis.start();
        // Diagnostic: if this ever fires, an A-type scroll freeze was just
        // prevented. Remove once the stranding source is confirmed fixed.
        console.warn("[lenis] self-healed a stranded stop (scroll freeze prevented)");
      }
    };
    //    - focus: covers the sleep/wake + alt-tab missed-visibilitychange race.
    const onFocus = () => {
      if (!document.hidden && lenis.isStopped) lenis.start();
    };
    //    - pageshow: covers bfcache restores (back/forward with a frozen page).
    const onPageShow = () => {
      if (!document.hidden && lenis.isStopped) lenis.start();
    };
    window.addEventListener("wheel", onWheelCapture, { capture: true, passive: true });
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);

    // 5. AUTO-RESIZE — updates Lenis limit whenever DOM heights shift
    //    (e.g. ScrollExpand track, accordions, lazy chunks, font/image layout)
    //    so scrolling never locks prematurely against a stale page height limit.
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onDomResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      }, 40);
    };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onDomResize) : null;
    if (ro && document.body) {
      ro.observe(document.body);
    }

    return () => {
      clearTimeout(resizeTimer);
      ro?.disconnect();
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("wheel", onWheelCapture, { capture: true } as EventListenerOptions);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [lenis]);

  return null;
}

export function SmoothScrolling({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.11, smoothWheel: true, autoRaf: false }}>
      <ScrollToTopOnRouteChange />
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
