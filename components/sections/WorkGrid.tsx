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

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    
    let lastX = 0;
    // Use quickTo for buttery smooth cursor tracking
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.6, ease: "power3.out" });
    const rotateTo = gsap.quickTo(cursor, "rotation", { duration: 0.5, ease: "power2.out" });

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const speed = x - lastX;
      lastX = x;
      
      // Track position
      xTo(x);
      yTo(y);
      // Tilt based on velocity (clamped)
      rotateTo(Math.max(-15, Math.min(15, speed * 0.3)));
    };

    const onMouseEnter = () => {
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)" });
    };

    const onMouseLeave = () => {
      gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" });
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
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
