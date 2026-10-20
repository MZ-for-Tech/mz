"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import VariableProximity from "@/components/VariableProximity/VariableProximity";
import styles from "./page.module.css";

/** The original animated hero now introduces a complete, scrollable homepage. */
export default function StartScreen() {
  const mainRef = useRef<HTMLElement>(null);
  const [Logo, setLogo] = useState<ComponentType<{ svgSrc?: string; textureSrc?: string; logoScaleMultiplier?: number }> | null>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let active = true;
    const timer = setTimeout(() => {
      import("@/components/Logo/MzLogo3D").then((module) => {
        if (active) setLogo(() => module.default);
      });
    }, 1800);
    return () => { active = false; clearTimeout(timer); };
  }, []);
  return (
    <section ref={mainRef} className={`${styles.hero} hero-section`}>
      {Logo && <div className={styles.heroLogo3D} aria-hidden="true"><Logo svgSrc="/model-zero-logo-paths.svg" textureSrc="/model-zero-logo-texture.png" logoScaleMultiplier={1.15} /></div>}
      <div className={styles.heroContent}>
        <h1 className={styles.heroWordsRow}>
          <span className="sr-only">Research. Software. Knowledge.</span>
          {["RESEARCH.", "SOFTWARE.", "KNOWLEDGE."].map((word) => (
            <span key={word} className={`${styles.heroWord} hero-word`} aria-hidden="true"><span className="hero-word-inner"><VariableProximity label={word} fromFontVariationSettings="'wght' 400" toFontVariationSettings="'wght' 900" containerRef={mainRef} radius={200} falloff="exponential" /></span></span>
          ))}
        </h1>
        <div className={`${styles.heroSubtext} hero-subtext`}>In that order.</div>
      </div>
      <p className={`${styles.heroDescription} hero-desc`}>Model Zero (MZ) is a software and AI company in Cairo, Egypt. We build custom systems, publish applied research, and train teams to run what we build.</p>
      <Link href="#featured" className={`${styles.enterPrompt} hero-enter`}><span className={styles.enterLabel}>Explore Model Zero</span></Link>
    </section>
  );
}
