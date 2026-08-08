import React from "react";
import styles from "./ClaudeIcon.module.css";

interface ClaudeIconProps {
  className?: string;
  noBackground?: boolean;
}

export default function ClaudeIcon({ className = "", noBackground = false }: ClaudeIconProps) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1080 1080"
      className={`${styles.claudeSvg} ${className}`}
    >
      {!noBackground && <rect width="1080" height="1080" fill="#100f0d" />}
      {/* Path data lives in public/icons/claude.svg (single copy, shared by all
          call sites); the cartwheel animation moved to the <image> element —
          same transform-origin, same keyframes, no visual change. */}
      <image
        href="/icons/claude.svg"
        width="1080"
        height="1080"
        className={styles.claudeImage}
      />
    </svg>
  );
}
