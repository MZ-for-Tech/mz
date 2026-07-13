"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode } from "react";

export function SmoothScrolling({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.06, duration: 1.1, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
