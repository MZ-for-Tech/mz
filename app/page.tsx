"use client";
import { useRef, useState, useEffect } from "react";
import styles from "./page.module.css";
import PillNav from "../components/PillNav/PillNav";
import { Footer } from "../components/Footer/Footer";
import { ScaleReveal } from "../components/ScaleReveal/ScaleReveal";
import { StatusDot } from "@/components/StatusDot/StatusDot";
import DataStreamHero from "@/components/DataStreamHero/DataStreamHero";
import Waves from "@/components/Waves/Waves";
import { OcrScanner } from "@/components/OcrScanner/OcrScanner";
import DarkVeil from "@/components/DarkVeil/DarkVeil";
import { gsap } from "@/lib/gsap";
import { MzLogo } from "@/components/Logo/MzLogo";
import MzLogo3D from "@/components/Logo/MzLogo3D";
import { useGSAP } from "@gsap/react";
import ServicesAccordion from "@/components/ServicesAccordion/ServicesAccordion";
import PremiumShowcase from "@/components/PremiumShowcase/PremiumShowcase";
import Manifesto from "@/components/Manifesto/Manifesto";
import BackToTop from "@/components/BackToTop/BackToTop";
import ObfuscatedEmail from "@/components/ObfuscatedEmail/ObfuscatedEmail";
import { TransitionLink } from "@/components/TransitionLink/TransitionLink";
import { WorkGrid } from "@/components/sections/WorkGrid";




const NAV_ITEMS = [
  { label: 'Work', href: '#work' },
  { label: 'Products', href: '#products' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '/start' }
];

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const [isReadyForHeavy, setIsReadyForHeavy] = useState(false);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);

  useEffect(() => {
    const onReady = () => setIsReadyForHeavy(true);
    window.addEventListener('mz-transition-done', onReady, { once: true });

    // Fallback just in case event fired before mount
    const timer = setTimeout(onReady, 1500);
    return () => {
      window.removeEventListener('mz-transition-done', onReady);
      clearTimeout(timer);
    };
  }, []);

  useGSAP(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(".hero-word, .hero-subtext, .scroll-indicator-line, .case-item", {
        opacity: 1,
        filter: "blur(0px)",
        y: 0
      });
      return;
    }

    // Hero Entry Animation
    const playHeroAnimation = () => {
      const tl = gsap.timeline();

      tl.fromTo(".hero-word-inner", {
        y: 30,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 1.4,
        stagger: 0.2,
        ease: "power3.out"
      });

      tl.fromTo(".hero-subtext", {
        opacity: 0,
        y: 15
      }, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
      }, "-=0.8");

      tl.fromTo(".hero-desc, .hero-scroll-wrapper, .hero-action-wrapper", {
        opacity: 0,
        y: 10
      }, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.6");
    };

    // Set initial states to hide elements before animation
    gsap.set(".hero-word-inner", { y: 30, opacity: 0 });
    gsap.set(".hero-subtext, .hero-desc, .hero-scroll-wrapper, .hero-action-wrapper", { opacity: 0, y: 10 });

    // Wait for the correct signal before playing hero animations
    const playWhenReady = () => {
      window.removeEventListener('mz-transition-done', playWhenReady);
      playHeroAnimation();
    };

    window.addEventListener('mz-transition-done', playWhenReady, { once: true });

    return () => {
      window.removeEventListener('mz-transition-done', playWhenReady);
    };

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

    // Partners Animation
    gsap.to("[data-partner-logo]", {
      opacity: 0.6,
      x: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".partners-section",
        start: "top 85%",
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
      <div style={{ position: "relative", zIndex: 10 }}>
        <main ref={mainRef} className={styles.main}>
          <PillNav
            items={NAV_ITEMS}
          />

          {/* Sticky Hero Wrapper */}
          <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%", zIndex: 1, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
              <DarkVeil
                primaryColor="#88b600"
                noiseIntensity={0.05}
                scanlineIntensity={0.05}
                scanlineFrequency={0.01}
                speed={0.2}
                warpAmount={0.5}
              />
            </div>

            {/* 01 — Hero */}
            <section className={`${styles.hero} hero-section`} style={{ zIndex: 1 }}>

              {/* 3D Logo Background - Deferred until wipe finishes to prevent lag */}
              <div
                className={styles.heroLogo3D}
                style={{
                  opacity: isLogoLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease-out'
                }}
              >
                {isReadyForHeavy && <MzLogo3D onLoad={() => setIsLogoLoaded(true)} />}
              </div>

              <div className={styles.heroContent}>
                <div className={styles.heroWordsRow}>
                  <div className={`${styles.heroWord} hero-word ${styles.heroWordHover}`}>
                    <div className="hero-word-inner">
                      <a href="https://nullhypothesis.dev" target="_blank" rel="noopener noreferrer">RESEARCH.</a>
                    </div>
                  </div>
                  <div className={`${styles.heroWord} hero-word`}>
                    <div className="hero-word-inner">SOFTWARE.</div>
                  </div>
                  <div className={`${styles.heroWord} hero-word`}>
                    <div className="hero-word-inner">KNOWLEDGE.</div>
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
              <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
                <Waves
                  lineColor="rgba(141, 184, 42, 0.15)"
                  backgroundColor="transparent"
                  waveSpeedX={0.02}
                  waveSpeedY={0.01}
                  waveAmpX={40}
                  waveAmpY={20}
                  friction={0.9}
                  tension={0.01}
                  maxCursorMove={120}
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
                      <MzLogo
                        width={600}
                        height={600}
                        className={styles.productWatermark}
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


            {/* 06 — Partners */}
            {/* 
            <section className={`${styles.partnersSection} partners-section`}>
              <div className={styles.sectionHeader}>Our Partners</div>
              <div className={styles.partnersGrid}>
                <div className={styles.partnerLogo} data-partner-logo>
                  <Image src="/nested-logo.png" alt="Nested" width={300} height={140} style={{ width: "auto", height: "auto" }} />
                </div>
                <div className={styles.partnerLogo} data-partner-logo>
                  <Image src="/feps-logo.png" alt="FEPS" width={300} height={140} style={{ width: "auto", height: "auto" }} />
                </div>
                <div className={styles.partnerLogo} data-partner-logo>
                  <Image src="/ef-logo.png" alt="EF" width={300} height={140} style={{ width: "auto", height: "auto", transform: "scale(1.5)" }} />
                </div>
              </div>
            </section>
            */}



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

      <div style={{ position: "relative", height: "100vh", zIndex: 0 }}>
        <Footer />
      </div>

      <BackToTop />
    </>
  );
}

