"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import PillNav from "../components/PillNav/PillNav";
import { Footer } from "../components/Footer/Footer";
import { ScaleReveal } from "../components/ScaleReveal/ScaleReveal";
import { StatusDot } from "@/components/StatusDot/StatusDot";
import DataStreamHero from "@/components/DataStreamHero/DataStreamHero";
import Waves from "@/components/Waves/Waves";
import { OcrScanner } from "@/components/OcrScanner/OcrScanner";
import { MousePointerClick, Lock } from "lucide-react";
import LineSidebar from "@/components/LineSidebar/LineSidebar";
import DarkVeil from "@/components/DarkVeil/DarkVeil";
import { gsap } from "@/lib/gsap";
import { MzLogo } from "@/components/Logo/MzLogo";
import { useGSAP } from "@gsap/react";
import ServicesAccordion from "@/components/ServicesAccordion/ServicesAccordion";
import PremiumShowcase from "@/components/PremiumShowcase/PremiumShowcase";
import BackToTop from "@/components/BackToTop/BackToTop";


const WORK_PROJECTS = [
  { id: "01", name: 'Nested United', link: 'https://nestedunited.com', isPrivate: false },
  { id: "02", name: 'The Null Hypothesis', link: 'https://nullhypothesis.dev', isPrivate: false },
  { id: "03", name: 'SSC League', link: '#', isPrivate: true },
  { id: "04", name: 'ERP System', link: '#', isPrivate: true },
];

const NAV_ITEMS = [
  { label: 'Work', href: '#work' },
  { label: 'Products', href: '#products' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '/start' }
];

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const [activeProjectIndex, setActiveProjectIndex] = useState<number>(0);
  const [hoveredProjectIndex, setHoveredProjectIndex] = useState<number | null>(null);
  const [isInteractive, setIsInteractive] = useState(false);

  // Exit iframe interactive mode on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsInteractive(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    const tl = gsap.timeline({ delay: 0.2 });

    tl.fromTo(".hero-word-inner", {
      y: "110%",
      rotationZ: 4,
      transformOrigin: "left top"
    }, {
      y: "0%",
      rotationZ: 0,
      duration: 1.4,
      stagger: 0.15,
      ease: "power4.out"
    });

    tl.fromTo(".hero-subtext", {
      opacity: 0,
      y: 20
    }, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out"
    }, "-=0.8");

    tl.fromTo(".hero-scroll-wrapper, .hero-action-wrapper", {
      opacity: 0,
    }, {
      opacity: 1,
      duration: 1,
      ease: "power2.out"
    }, "-=0.5");

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
            baseColor="var(--color-bg)"
            pillColor="var(--color-text)"
            hoveredPillTextColor="var(--color-acid-green)"
            pillTextColor="var(--color-bg)"
          />

          {/* Sticky Hero Wrapper */}
          <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%", zIndex: 1, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100vh", zIndex: -1 }}>
              <DarkVeil
                primaryColor="#afc020"
                noiseIntensity={0.05}
                scanlineIntensity={0.05}
                scanlineFrequency={0.01}
                speed={0.2}
                warpAmount={0.5}
              />
            </div>

            {/* 01 — Hero */}
            <section className={`${styles.hero} hero-section`}>

              <div className={styles.heroContent}>
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
                <div className={`${styles.heroSubtext} hero-subtext`}>In that order.</div>
              </div>

              <div className={`${styles.heroScrollWrapper} hero-scroll-wrapper`}>
                <div className={styles.heroDescription}>
                  We build proprietary systems and transfer knowledge — so you don&apos;t have to guess.
                </div>
                <div className={`${styles.scrollIndicator} scroll-indicator-line`}>
                  <div className={styles.scrollLine}></div>
                </div>
              </div>

              <div className={`${styles.heroActionWrapper} hero-action-wrapper`}>
                <a href="/start" className={styles.heroBtnPrimary}>
                  Hire Us
                </a>
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
                        MZ.LTD © PROPRIETARY TECHNOLOGY
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
            <section id="work" className={styles.caseStudies}>
              <div className={styles.sectionHeader}>Work</div>

              <div className={styles.workLayout} style={{ marginTop: '3rem' }}>
                {/* Sidebar */}
                <div className={styles.workSidebar}>
                  <LineSidebar
                    items={WORK_PROJECTS.map(p => p.name)}
                    accentColor="var(--color-acid-green)"
                    textColor="var(--color-text)"
                    markerColor="var(--color-text-muted)"
                    showIndex
                    showMarker
                    proximityRadius={100}
                    maxShift={40}
                    falloff="smooth"
                    markerLength={80}
                    markerGap={20}
                    tickScale={0.5}
                    scaleTick
                    itemGap={40}
                    fontSize={2.5}
                    smoothing={100}
                    defaultActive={0}
                    onItemClick={(index) => {
                      setActiveProjectIndex(index);
                      setIsInteractive(false);
                    }}
                    onItemHover={(index) => {
                      if (index !== hoveredProjectIndex) {
                        setHoveredProjectIndex(index);
                        setIsInteractive(false);
                      }
                    }}
                  />
                </div>

                {/* Iframe Preview */}
                <div
                  className={styles.workPreviewContainer}
                  onMouseLeave={() => setIsInteractive(false)}
                >
                  {WORK_PROJECTS.map((project, idx) => {
                    const displayIndex = hoveredProjectIndex !== null ? hoveredProjectIndex : activeProjectIndex;
                    const isActive = idx === displayIndex;

                    return (
                      <div
                        key={project.id}
                        className={styles.workPreviewInner}
                        style={{
                          opacity: isActive ? 1 : 0,
                          pointerEvents: isActive ? 'auto' : 'none',
                          zIndex: isActive ? 10 : 0,
                          position: 'absolute',
                          inset: 0,
                          transition: 'opacity 0.3s ease-in-out'
                        }}
                      >
                        {project.isPrivate ? (
                          <div className={styles.workPrivateOverlay}>
                            <Lock size={48} className={styles.workPrivateIcon} />
                            <p className={styles.workPrivateTitle}>Internal System</p>
                            <p className={styles.workPrivateSubtitle}>Access Restricted</p>
                          </div>
                        ) : (
                          <>
                            {(!isInteractive || !isActive) && (
                              <div
                                onClick={() => {
                                  if (isActive) setIsInteractive(true);
                                }}
                                className={styles.workInteractOverlay}
                              >
                                <div className={styles.workInteractBg}></div>
                                <div className={styles.workInteractButton}>
                                  <MousePointerClick size={14} className={styles.workInteractIcon} /> CLICK TO INTERACT
                                </div>
                              </div>
                            )}
                            {isInteractive && isActive && (
                              <div className={styles.workExitHint}>
                                ESC or move mouse out to exit
                              </div>
                            )}

                            {isActive && (
                              <iframe
                                src={project.link}
                                title={project.name}
                                className={styles.workIframe}
                                loading="lazy"
                                style={{ pointerEvents: (isInteractive && isActive) ? 'auto' : 'none' }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>


            {/* 06 — Partners */}
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

              <a href="mailto:hello@mzltd.tech" className={styles.ctaEmail}>hello@mzltd.tech</a>

              <div className={styles.ctaActionWrapper}>
                <a href="/start" className={styles.submitBtn}>
                  START A PROJECT →
                </a>
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

