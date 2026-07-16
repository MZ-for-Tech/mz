"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

export function SmoothScrolling({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.06, duration: 1.1, smoothWheel: true }}>
      <ScrollToTopOnRouteChange />
      {children}
    </ReactLenis>
  );
}
