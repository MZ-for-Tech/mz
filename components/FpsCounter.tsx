"use client";

import { useEffect, useState } from "react";

export default function FpsCounter() {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measure = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animationFrameId = requestAnimationFrame(measure);
    };

    animationFrameId = requestAnimationFrame(measure);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        left: 10,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: fps >= 55 ? "#8DB82A" : fps >= 30 ? "orange" : "red",
        padding: "4px 8px",
        borderRadius: "4px",
        fontFamily: "monospace",
        fontSize: "14px",
        zIndex: 99999,
        pointerEvents: "none",
        fontWeight: "bold",
        border: "1px solid rgba(255,255,255,0.2)"
      }}
    >
      {fps} FPS
    </div>
  );
}
