"use client";
import { useRef, useState, useEffect } from "react";
import styles from "./page.module.css";
import PillNav from "../components/PillNav/PillNav";
import { Footer } from "../components/Footer/Footer";
import { ScaleReveal } from "../components/ScaleReveal/ScaleReveal";
import { StatusDot } from "@/components/StatusDot/StatusDot";
import DataStreamHero from "@/components/DataStreamHero/DataStreamHero";
const Waves = dynamic(() => import("@/components/Waves/Waves"), { ssr: false });
const OcrScanner = dynamic(() => import("@/components/OcrScanner/OcrScanner").then(m => m.OcrScanner), { ssr: false });
import DarkVeil, { DARKVEIL_THEME } from "@/components/DarkVeil/DarkVeil";
import { gsap } from "@/lib/gsap";
import dynamic from "next/dynamic";
import Image from "next/image";

const MzLogo3D = dynamic(() => import("@/components/Logo/MzLogo3D"), { ssr: false });
import { useGSAP } from "@gsap/react";
const ServicesAccordion = dynamic(() => import("@/components/ServicesAccordion/ServicesAccordion"), { ssr: false });
import PremiumShowcase from "@/components/PremiumShowcase/PremiumShowcase";
import Manifesto from "@/components/Manifesto/Manifesto";

import ObfuscatedEmail from "@/components/ObfuscatedEmail/ObfuscatedEmail";
import { TransitionLink } from "@/components/TransitionLink/TransitionLink";
import { WorkGrid } from "@/components/sections/WorkGrid";
import VariableProximity from "@/components/VariableProximity/VariableProximity";
import IconSprite from "@/components/nested/IconCollage/IconSprite";




const NAV_ITEMS = [
  { label: 'Work', href: '#work' },
  { label: 'Products', href: '#products' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '/start' }
];

/**
 * Weak-device check for the eager three.js warm-up.
 * saveData, low memory, few cores, or a coarse pointer means the 269 KB gz
 * three.js chunk should NOT be pulled during hydration — it is fetched later,
 * when the logo actually mounts. Desktop with fine pointer keeps today's
 * exactly-on-curtain-lift behaviour.
 */
function shouldSkipHeavyWarmup(): boolean {
  if (typeof navigator === "undefined") return false;
  try {
    if (navigator.connection?.saveData) return true;
    if (typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4) return true;
    if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4) return true;
    if (window.matchMedia("(pointer: coarse)").matches) return true;
  } catch {
    // Any failure to read capability signals falls back to today's behaviour.
  }
  return false;
}

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const [isReadyForHeavy, setIsReadyForHeavy] = useState(false);
  const [darkVeilVisible, setDarkVeilVisible] = useState(false);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const mql = window.matchMedia("(pointer: coarse), (max-width: 768px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);


  useEffect(() => {
    let r1: number;
    let r2: number;
    const onReady = () => {
      setIsReadyForHeavy(true);
      r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => setDarkVeilVisible(true));
      });
    };
    window.addEventListener('mz-transition-done', onReady, { once: true });

    // Fallback just in case event fired before mount
    const timer = setTimeout(onReady, 1500);
    return () => {
      window.removeEventListener('mz-transition-done', onReady);
      clearTimeout(timer);
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, []);

  // Warm the lazy three.js chunk while the entry wipe is still covering the
  // screen, so the logo mounts as soon as the curtain lifts instead of after
  // a ~269 KB gz chunk fetch on first visit.
  // Skipped on weak devices / mobile (saveData / low memory / few cores / touch / <=768px):
  // there the 269 KB gz download would land exactly during hydration, on the
  // busiest main thread.
  useEffect(() => {
    if (isMobile || shouldSkipHeavyWarmup()) return;
    void import("@/components/Logo/MzLogo3D");
  }, [isMobile]);

  useGSAP(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(".case-item", { opacity: 1, y: 0 }); // Ensure case items are visible without scroll trigger
      return;
    }

    // Entry animation is now fully handled by CSS in page.module.css
    // Only scroll-triggered animations remain here

    // Hero Parallax on Scroll
    gsap.to(".hero-word", {
      scale: 0.85,
      opacity: 0,
      y: -100,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });


    // Case studies scroll animation
    const caseItems = gsap.utils.toArray(".case-item") as HTMLElement[];
    caseItems.forEach((item) => {
      gsap.fromTo(item, {
        opacity: 0,
        y: 30
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: item,
          start: "top 85%",
        }
      });
    });

  }, { scope: mainRef });

  return (
    <>
      <IconSprite />
      <div style={{ position: "relative", zIndex: 10 }}>
        <main ref={mainRef} className={styles.main}>
          <PillNav
            items={NAV_ITEMS}
          />

          {/* Sticky Hero Wrapper */}
          <div style={{ position: "sticky", top: 0, height: "100svh", width: "100%", zIndex: 1, overflow: "hidden" }}>

            {/* 01 — Hero */}
            <section className={`${styles.hero} hero-section`}>
              {/* DarkVeil background — deferred until wipe finishes with smooth fade-in */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 0,
                  opacity: darkVeilVisible ? 1 : 0,
                  transition: 'opacity 1.2s ease-out'
                }}
              >
                {isReadyForHeavy && <DarkVeil {...DARKVEIL_THEME} resolutionScale={0.75} />}
              </div>

              {/* 3D Logo Background - Deferred until wipe finishes and desktop only */}
              {isReadyForHeavy && !isMobile && (
                <div
                  className={styles.heroLogo3D}
                  style={{
                    opacity: isLogoLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease-out'
                  }}
                >
                  <MzLogo3D
                    onLoad={() => setIsLogoLoaded(true)}
                    // Data is usually ready ~1.1–1.5s after load (wipe ends at
                    // 1.02s). The fade-in waits for the assembly to start (one
                    // short beat later) so the pre-assembly hold is never
                    // visible — the logo appears mid-flight and converges as
                    // the hero words land (~2.8s). 400ms keeps that window
                    // tight enough that there's no "empty hero" feel.
                    assemblyStartDelayMs={400}
                  />
                </div>
              )}

              <div className={styles.heroContent}>
                <div className={styles.heroWordsRow}>
                  <div className={`${styles.heroWord} hero-word ${styles.heroWordHover}`}>
                    <div className="hero-word-inner">
                      <a href="https://nullhypothesis.dev" target="_blank" rel="noopener noreferrer">
                        {reduceMotion ? "RESEARCH." : (
                          <VariableProximity
                            label="RESEARCH."
                            fromFontVariationSettings="'wght' 400"
                            toFontVariationSettings="'wght' 900"
                            containerRef={mainRef}
                            radius={200}
                            falloff="exponential"
                          />
                        )}
                      </a>
                    </div>
                  </div>
                  <div className={`${styles.heroWord} hero-word`}>
                    <div className="hero-word-inner">
                      {reduceMotion ? "SOFTWARE." : (
                        <VariableProximity
                          label="SOFTWARE."
                          fromFontVariationSettings="'wght' 400"
                          toFontVariationSettings="'wght' 900"
                          containerRef={mainRef}
                          radius={200}
                          falloff="exponential"
                        />
                      )}
                    </div>
                  </div>
                  <div className={`${styles.heroWord} hero-word`}>
                    <div className="hero-word-inner">
                      {reduceMotion ? "KNOWLEDGE." : (
                        <VariableProximity
                          label="KNOWLEDGE."
                          fromFontVariationSettings="'wght' 400"
                          toFontVariationSettings="'wght' 900"
                          containerRef={mainRef}
                          radius={200}
                          falloff="exponential"
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className={`${styles.heroSubtext} hero-subtext`}>In that order.</div>
              </div>

              <div className={`${styles.heroDescription} hero-desc`}>
                Engineered in Cairo. Owned by you. We build proprietary systems and transfer the exact knowledge you need to run them.
              </div>



              <div className={`${styles.heroScrollWrapper} hero-scroll-wrapper`}>
                <div className={`${styles.scrollIndicator} scroll-indicator-line`}>
                  <div className={styles.scrollLine}></div>
                </div>
              </div>
            </section>
          </div>

          <div style={{
            background: "var(--page-bg, var(--color-bg))",
            position: "relative",
            zIndex: 2,
            borderTopLeftRadius: "40px",
            borderTopRightRadius: "40px",
            boxShadow: "0 -20px 80px rgba(0,0,0,0.8)"
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: -1 }}>
              <div style={{ position: "sticky", top: 0, height: "100svh", overflow: "hidden" }}>
                <Waves
                  lineColor="rgba(141, 184, 42, 0.15)"
                  backgroundColor="transparent"
                  waveSpeedX={0.02}
                  waveSpeedY={0.01}
                  waveAmpX={40}
                  waveAmpY={20}
                  xGap={12}
                  yGap={36}
                />
              </div>
            </div>

            <PremiumShowcase />
            <Manifesto />

            {/* 03 — Services/Capabilities */}
            <ServicesAccordion />

            {/* 04 — Products */}
            <section id="products" className={styles.products}>
              <div className={styles.sectionHeader}>Products</div>

              <div className={styles.productScrollContainer}>
                {[1].map((num) => (
                  <div key={num} className={styles.productSnapItem}>
                    <div className={styles.showcaseCard}>
                      <Image
                        src="/mz-logo.min.svg"
                        alt="MZ Watermark"
                        width={600}
                        height={600}
                        className={styles.productWatermark}
                        style={{ opacity: 0.05, filter: "brightness(0) invert(1)" }}
                      />
                      <div className={styles.proprietaryStamp}>
                        MZ © PROPRIETARY TECHNOLOGY
                      </div>

                      <div className={styles.productContent}>
                        <div className={styles.productNameWrapper}>
                          <div className={styles.productName}>Occhio</div>
                          <div className={styles.pronunciation}>/ OK-yoo /</div>
                        </div>
                        <div className={styles.productTagline}>An OCR that reads Arabic the way Arabic should be read</div>
                        <div className={styles.productDesc}>Most document processing tools were built for Latin scripts and extended to Arabic later. Occhio starts where the region starts. Arabic, French, and English as equal priorities, designed for the institutional documents governments, universities, and enterprises in MENA actually handle.</div>
                        <div style={{ marginTop: '2rem' }}>
                          <StatusDot status="IN DEVELOPMENT" />
                        </div>
                      </div>
                      <div className={styles.productVisual}>
                        <OcrScanner />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>


            {/* 05 — Work */}
            <WorkGrid />





            {/* 07 — TNH Portal */}
            <section className={styles.tnhPortalWrapper}>
              <ScaleReveal intensity={1.1} hasBackground={false} className={styles.tnhPortal}>
                <DataStreamHero />
                <div className={styles.tnhText}>
                  Our research doesn&apos;t stay internal.
                </div>
                <a href="https://nullhypothesis.dev" target="_blank" rel="noopener noreferrer" className={styles.tnhLink}>
                  ↗ nullhypothesis.dev
                </a>
              </ScaleReveal>
            </section>

            {/* 08 — CTA */}
            <section id="contact" className={styles.ctaSection}>
              <div className={styles.sectionHeader}>Initiate</div>

              <div className={styles.ctaText}>
                Tell us what you&apos;re building.<br />
                We&apos;ll tell you what it&apos;s missing.
              </div>

              <ObfuscatedEmail user="hello" domain="mzfortech.com" className={styles.ctaEmail} />

              <div className={styles.ctaActionWrapper}>
                <TransitionLink href="/start" className={styles.submitBtn}>
                  START A PROJECT →
                </TransitionLink>
              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}

