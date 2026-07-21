"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./CustomCursor.module.css";
import { usePathname } from "next/navigation";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const pathname = usePathname();
  // Track current state in refs so event handlers don't trigger re-renders on every event
  const isHiddenRef = useRef(true);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(hover: none)").matches) {
      setTimeout(() => setIsHidden(true), 0); // Will just hide via CSS
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Use GSAP quickTo for highly performant mouse tracking
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3" });

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      // Only update state when the value actually changes
      if (isHiddenRef.current) {
        isHiddenRef.current = false;
        setIsHidden(false);
      }
    };

    const onMouseEnter = () => {
      if (isHiddenRef.current) {
        isHiddenRef.current = false;
        setIsHidden(false);
      }
    };
    const onMouseLeave = () => {
      if (!isHiddenRef.current) {
        isHiddenRef.current = true;
        setIsHidden(true);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);

    // Interactive elements detection for magnetic/hover state
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const shouldHover = !!(
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[data-magnetic]") ||
        target.closest("[data-partner-logo]") ||
        target.closest("[data-cursor-lens]")
      );
      // Only trigger a re-render when the hover state actually changes
      if (shouldHover !== isHoveringRef.current) {
        isHoveringRef.current = shouldHover;
        setIsHovering(shouldHover);
      }
    };

    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [pathname]);

  return (
    <div
      ref={cursorRef}
      className={`${styles.cursor} ${isHovering ? styles.hovering : ""}`}
      style={{ opacity: isHidden ? 0 : 1 }}
    >
      <div className={styles.cursorDot} />
    </div>
  );
}
