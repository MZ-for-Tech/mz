"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import styles from "./ServicesBento.module.css";
import { BuildVisual, DeployVisual, TeachVisual } from "@/components/ServiceVisuals/ServiceVisuals";
import SharedGrainient from "@/components/Grainient/SharedGrainient";

export default function ServicesBento() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Pause animations when section is not on screen
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        section.dataset.paused = entry.isIntersecting ? 'false' : 'true';
      },
      { threshold: 0, rootMargin: '200px' }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    const tiles = gsap.utils.toArray(`.${styles.bentoTile}`);

    gsap.fromTo(tiles,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%"
        }
      }
    );
  }, { scope: sectionRef });

  return (
    <SharedGrainient
      regionSelector="[data-grainient]"
      color1="var(--color-bg)"
      color2="var(--color-bg)"
      color3="var(--color-olive)"
      timeSpeed={0.15}
      colorBalance={0.0}
      blendSoftness={0.2}
      contrast={1.1}
      grainAmount={0.035}
    >
      <div className={styles.bentoGrid} ref={sectionRef}>
      {/* Build Text */}
      <div className={`${styles.bentoTile} ${styles.buildText} ${styles.textTile}`} tabIndex={0}>
        <div data-grainient className={styles.grainientWrapper} />
        <div className={styles.pillarLabel}>BUILD</div>
        <div className={styles.tileContent}>
          <div className={styles.tileTitle}>Software</div>
          <div className={styles.tileTagline}>We make systems that work.</div>
          <ul className={styles.capabilitiesList}>
            <li><span className={styles.bullet}></span>Custom websites & landing pages</li>
            <li><span className={styles.bullet}></span>E-commerce & digital storefronts</li>
            <li><span className={styles.bullet}></span>ERP & internal operations systems</li>
          </ul>
        </div>
      </div>

      {/* Build Visual */}
      <div className={`${styles.bentoTile} ${styles.buildVisual} ${styles.visualTile}`} style={{ '--anim-duration': '8.2s' } as React.CSSProperties}>
        <BuildVisual />
      </div>

      {/* AI Text */}
      <div className={`${styles.bentoTile} ${styles.aiText} ${styles.textTile}`} tabIndex={0}>
        <div data-grainient className={styles.grainientWrapper} />
        <div className={styles.pillarLabel}>DEPLOY</div>
        <div className={styles.tileContent}>
          <div className={styles.tileTitle}>Artificial Intelligence</div>
          <div className={styles.tileTagline}>We give machines judgment.</div>
          <ul className={styles.capabilitiesList}>
            <li><span className={styles.bullet}></span>Custom specialized models</li>
            <li><span className={styles.bullet}></span>Model fine-tuning & pruning</li>
            <li><span className={styles.bullet}></span>Cost-optimized local inference</li>
          </ul>
        </div>
      </div>

      {/* AI Visual (Deploy) */}
      <div className={`${styles.bentoTile} ${styles.deployVis} ${styles.visualTile}`} style={{ '--anim-duration': '9.5s' } as React.CSSProperties}>
        <DeployVisual />
      </div>

      {/* Accent */}
      <div className={`${styles.bentoTile} ${styles.accent}`}>
        <div className={styles.accentCounter}>01 / 03</div>
        <div className={styles.accentContent}>
          <div className={styles.accentCopy}>Cairo-made.<br />Client-owned.</div>
          <div className={styles.accentSub}>3 pillars. One team.</div>
        </div>
      </div>

      {/* Knowledge Text */}
      <div className={`${styles.bentoTile} ${styles.knowText} ${styles.textTile}`} tabIndex={0}>
        <div data-grainient className={styles.grainientWrapper} />
        <div className={styles.pillarLabel}>TEACH</div>
        <div className={styles.tileContent}>
          <div className={styles.tileTitle}>Knowledge Transfer</div>
          <div className={styles.tileTagline}>We make expertise replicable.</div>
          <ul className={styles.capabilitiesList}>
            <li><span className={styles.bullet}></span>Premium institutional workshops</li>
            <li><span className={styles.bullet}></span>Statistical thinking & data literacy</li>
            <li><span className={styles.bullet}></span>Digital-first educational content</li>
          </ul>
        </div>
      </div>

      {/* Knowledge Visual (Teach) */}
      <div className={`${styles.bentoTile} ${styles.knowVisual} ${styles.visualTile}`} style={{ '--anim-duration': '7.1s' } as React.CSSProperties}>
        <TeachVisual />
      </div>
      </div>
    </SharedGrainient>
  );
}
