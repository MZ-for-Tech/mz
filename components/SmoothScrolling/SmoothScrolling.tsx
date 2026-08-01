"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";

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

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
    };
  }, [lenis]);

  return null;
}

export function SmoothScrolling({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.11, smoothWheel: true, autoRaf: false }}>
      <ScrollToTopOnRouteChange />
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
