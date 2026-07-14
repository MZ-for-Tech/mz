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

    // Stop Lenis immediately so it doesn't fight with the reset
    lenis.stop();

    // Scroll to top via native API to clear any stuck positions
    window.scrollTo(0, 0);

    // Give Lenis one frame to register the position reset before re-enabling
    const raf = requestAnimationFrame(() => {
      lenis.scrollTo(0, { immediate: true });
      lenis.start();

      // Refresh ScrollTrigger after Lenis is running again
      ScrollTrigger.refresh();
    });

    return () => cancelAnimationFrame(raf);
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
