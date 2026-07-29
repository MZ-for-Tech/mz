"use client";

import styles from "./WorkGrid.module.css";
import { PROJECTS } from "@/lib/projects";
import { TransitionLink } from "@/components/TransitionLink/TransitionLink";
import React, { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";

export function WorkGrid() {
  const projectList = Object.values(PROJECTS);

  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [activeColor, setActiveColor] = useState<string>("#FFFFFF");
  const [activeStatus, setActiveStatus] = useState<string>("VIEW");

  useGSAP(() => {
    const container = containerRef.current;
    const cursor = cursorRef.current;
    if (!container || !cursor) return;

    // Use quickTo for buttery smooth cursor tracking
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.6, ease: "power3.out" });

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Center the cursor
      xTo(x - 50);
      yTo(y - 50);
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
          className={styles.floatingCursor}
          style={{ backgroundColor: activeColor }}
        >
          <span>{activeStatus}</span>
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
              className={styles.projectRowWrapper}
              style={customStyle}
              onMouseEnter={() => {
                setActiveColor(project.accentColor);
                setActiveStatus(project.isPrivate ? "RESTRICTED" : "VIEW");
              }}
            >
              <TransitionLink
                href={`/work/${project.slug}`}
                className={styles.projectLink}
              >
                <div className={styles.projectRow}>
                  {/* Subtle noise/gradient background instead of full wipe */}
                  <div className={styles.hoverGlow} />

                  <div className={styles.rowContent}>
                    <div className={styles.metaLeft}>
                      <span className={styles.projectNum}>/{project.id}</span>
                      <span className={styles.projectClient}>{project.client}</span>
                    </div>

                    <h3 className={`${styles.projectTitle} ${isSerif ? styles.serifTitle : ""}`}>
                      <span className={styles.titleOutline} data-text={project.name}>
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
