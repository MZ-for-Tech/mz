"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./CustomCursor.module.css";
import { usePathname } from "next/navigation";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [isGamepadCursor, setIsGamepadCursor] = useState(false);
  const pathname = usePathname();
  const isResearchRoute = pathname === "/research" || pathname.startsWith("/research/");
  // Track current state in refs so event handlers don't trigger re-renders on every event
  const isHiddenRef = useRef(true);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    if (isResearchRoute) return;

    const cursor = cursorRef.current;
    if (!cursor) return;
    const supportsMouseHover = !window.matchMedia("(hover: none)").matches;

    // Use GSAP quickTo for highly performant mouse tracking
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3" });

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      if (isGamepadCursor) setIsGamepadCursor(false);
      // Only update state when the value actually changes
      if (isHiddenRef.current) {
        isHiddenRef.current = false;
        setIsHidden(false);
      }
    };

    const onGamepadCursorMove = (event: Event) => {
      const { x, y } = (event as CustomEvent<{ x: number; y: number }>).detail;
      xTo(x);
      yTo(y);
      if (!isGamepadCursor) setIsGamepadCursor(true);
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

    if (supportsMouseHover) {
      window.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseenter", onMouseEnter);
      document.addEventListener("mouseleave", onMouseLeave);
    }
    window.addEventListener("mz-gamepad-cursor-move", onGamepadCursorMove);

    // Interactive elements detection for magnetic/hover state
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const shouldHover = !!(
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button")
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
      window.removeEventListener("mz-gamepad-cursor-move", onGamepadCursorMove);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isGamepadCursor, pathname]);

  if (isResearchRoute) return null;

  return (
    <div
      ref={cursorRef}
      data-custom-cursor
      className={`${styles.cursor} ${isHovering ? styles.hovering : ""} ${isGamepadCursor ? styles.gamepadActive : ""}`}
      style={{ opacity: isHidden ? 0 : 1 }}
    >
      <div className={styles.cursorDot} />
    </div>
  );
}
