"use client";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import styles from "./ScaleReveal.module.css";

interface ScaleRevealProps {
  children: React.ReactNode;
  intensity?: number;
  className?: string;
  hasBackground?: boolean;
}

export function ScaleReveal({ children, intensity = 1, className = "", hasBackground = true }: ScaleRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (!prefersReducedMotion) {
      gsap.fromTo(containerRef.current, {
        scale: 1 - (0.05 * intensity),
        borderRadius: "28px",
        opacity: 1 - (0.4 * intensity),
      }, {
        scale: 1,
        borderRadius: "20px",
        opacity: 1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "top 30%",
          scrub: true,
        }
      });
    }
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef} 
      className={`${styles.scaleReveal} ${hasBackground ? styles.withBg : ""} ${className}`}
    >
      {children}
    </div>
  );
}
