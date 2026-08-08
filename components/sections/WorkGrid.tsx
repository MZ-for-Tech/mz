"use client";

import styles from "./WorkGrid.module.css";
import { PROJECTS } from "@/lib/projects";
import { TransitionLink } from "@/components/TransitionLink/TransitionLink";
import Image from "next/image";
import EyeIcon from "@/components/nested/IconCollage/EyeIcon";
import ClaudeIcon from "@/components/nested/IconCollage/ClaudeIcon";
import TiktokIcon from "@/components/nested/IconCollage/TiktokIcon";
import DotsIcon from "@/components/nested/IconCollage/DotsIcon";
import BowlsIcon from "@/components/nested/IconCollage/BowlsIcon";
import React, { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";

export function WorkGrid() {
  const projectList = Object.values(PROJECTS);

  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [activeColor, setActiveColor] = useState<string>("#FFFFFF");
  const [activeStatus, setActiveStatus] = useState<string>("VIEW");
  const [activeSlug, setActiveSlug] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useGSAP(() => {
    const container = containerRef.current;
    const cursor = cursorRef.current;
    if (!container || !cursor) return;

    // GSAP owns the cursor's transform/opacity entirely. Initializing every
    // component here (instead of letting GSAP parse the CSS `transform:
    // scale(0)` — a degenerate zero-matrix that can leave the cursor frozen
    // at left:0/top:0) guarantees clean tracking from the first frame.
    gsap.set(cursor, {
      x: 0,
      y: 0,
      xPercent: -50,
      yPercent: -50,
      scale: 0,
      opacity: 0,
    });

    let lastX = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;
    // Use quickTo for buttery smooth cursor tracking
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.6, ease: "power3.out" });
    const rotateTo = gsap.quickTo(cursor, "rotation", { duration: 0.5, ease: "power2.out" });

    const showCursor = () => {
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)", overwrite: true });
    };
    const hideCursor = () => {
      gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in", overwrite: true });
    };

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      lastPointerX = x;
      lastPointerY = y;

      const speed = x - lastX;
      lastX = x;

      // Track position (viewport coords — cursor is position: fixed)
      xTo(x);
      yTo(y);
      // Tilt based on velocity (clamped)
      rotateTo(Math.max(-15, Math.min(15, speed * 0.3)));
    };

    const onMouseEnter = () => {
      lastX = 0;
      showCursor();
    };

    const onMouseLeave = () => {
      hideCursor();
    };

    // Scrolling the section out from under a stationary pointer fires no
    // mouseleave — hide via IntersectionObserver instead. When it scrolls
    // back, only re-show if the pointer is actually over it.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          hideCursor();
          return;
        }
        const rect = container.getBoundingClientRect();
        const pointerOver =
          lastPointerX >= rect.left && lastPointerX <= rect.right &&
          lastPointerY >= rect.top && lastPointerY <= rect.bottom;
        if (pointerOver) showCursor();
      },
      { threshold: 0 }
    );
    io.observe(container);

    // window-level mousemove: guaranteed delivery regardless of what sits
    // under the pointer inside the container; visibility still gated by the
    // container's enter/leave + the observer above.
    window.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
      io.disconnect();
    };
  }, []);

  return (
    <section id="work" className={styles.workSection}>
      <div className={styles.sectionHeader}>Selected Work</div>

      <div className={styles.massiveList} ref={containerRef}>
        {/* Floating View Cursor */}
        <div
          ref={cursorRef}
          className={`${styles.floatingCursor} ${activeSlug === "nested-united" ? styles.nestedCursor : ""} ${activeImage ? styles.hasMedia : ""}`}
          style={{ backgroundColor: activeSlug === "nested-united" ? "transparent" : activeColor }}
        >
          {activeImage ? (
            <div className={styles.cursorMediaWrapper}>
              <Image src={activeImage} alt="Project preview" fill sizes="400px" className={styles.cursorMedia} />
              <div className={styles.cursorMediaOverlay}>
                <span>{activeStatus}</span>
              </div>
            </div>
          ) : (
            <span>{activeStatus}</span>
          )}
        </div>

        {projectList.map((project) => {
          const customStyle = {
            "--accent-color": project.accentColor,
            "--accent-rgb": project.accentColorRgb,
          } as React.CSSProperties;

          const isSerif = project.fontFamily === "serif";

          return (
            <div
              key={project.id}
              className={`${styles.projectRowWrapper} ${project.slug === "nested-united" ? styles.nestedUnitedRow : ""}`}
              style={customStyle}
              onMouseEnter={() => {
                setActiveColor(project.accentColor);
                setActiveStatus(project.isPrivate ? "RESTRICTED" : "VIEW");
                setActiveSlug(project.slug);
                setActiveImage(project.coverImage || null);
              }}
              onMouseLeave={() => {
                setActiveSlug("");
                setActiveImage(null);
              }}
            >
              <TransitionLink
                href={`/work/${project.slug}`}
                className={styles.projectLink}
              >
                <div className={styles.projectRow}>
                  {/* Subtle noise/gradient background instead of full wipe */}
                  <div className={styles.hoverGlow} />

                  {project.slug === "nested-united" && (
                    <div className={styles.nestedBgPattern}>
                      <div className={`${styles.scatterIcon} ${styles.scatter1}`}><EyeIcon /></div>
                      <div className={`${styles.scatterIcon} ${styles.scatter2}`}><ClaudeIcon noBackground={true} /></div>
                      <div className={`${styles.scatterIcon} ${styles.scatter3}`}><TiktokIcon /></div>
                      <div className={`${styles.scatterIcon} ${styles.scatter4}`}><DotsIcon noBackground={true} /></div>
                      <div className={`${styles.scatterIcon} ${styles.scatter5}`}><BowlsIcon noBackground={true} /></div>
                    </div>
                  )}

                  <div className={styles.rowContent}>
                    <div className={styles.metaLeft}>
                      <span className={styles.projectClient}>{project.client}</span>
                    </div>

                    <h3 className={`${styles.projectTitle} ${isSerif ? styles.serifTitle : ""}`}>
                      <span className={`${styles.titleOutline} ${project.slug === "nested-united" ? styles.nestedGradient : ""}`} data-text={project.name}>
                        {project.name}
                      </span>
                    </h3>

                    <div className={styles.metaRight}>
                      <span className={styles.projectCategory}>{project.category}</span>
                    </div>
                  </div>
                </div>
              </TransitionLink>
            </div>
          );
        })}
      </div>
    </section>
  );
}
