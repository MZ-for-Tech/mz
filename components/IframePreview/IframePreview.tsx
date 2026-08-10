"use client";

import { useEffect, useState } from "react";
import styles from "./IframePreview.module.css";

/*
 * Interactive iframe preview with a click-to-enter pattern.
 *
 * Default state: the iframe is pointer-events: none, so the page scrolls
 * freely over it (Lenis-friendly). Clicking the hint overlay enters the
 * preview — the iframe becomes fully interactive and scrolls natively.
 * Leaving the wrapper (or pressing Esc / the exit chip) returns control to
 * the page instantly. This avoids the classic iframe problem where hovering
 * an interactive embed freezes page scrolling.
 */
export default function IframePreview({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [entered, setEntered] = useState(false);

  // Esc exits the preview
  useEffect(() => {
    if (!entered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEntered(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entered]);

  return (
    <div
      className={`${styles.wrapper} ${entered ? styles.entered : ""}`}
      onMouseLeave={() => setEntered(false)}
    >
      <iframe src={src} title={title} className={styles.iframe} loading="lazy" />

      {/* Hint overlay — click to enter the live preview */}
      <div
        className={styles.overlay}
        onClick={() => setEntered(true)}
        role="button"
        aria-label="Enter the live preview"
      >
        <span className={styles.hint}>SCROLL INSIDE — CLICK TO ENTER</span>
      </div>

      {/* Exit chip — visible only while inside the preview */}
      <button type="button" className={styles.exitChip} onClick={() => setEntered(false)}>
        EXIT PREVIEW <span className={styles.esc}>ESC</span>
      </button>
    </div>
  );
}
