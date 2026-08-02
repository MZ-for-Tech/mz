import styles from "./page.module.css";
import { TransitionLink } from "@/components/TransitionLink/TransitionLink";
import PillNav from "@/components/PillNav/PillNav";
import { Footer } from "@/components/Footer/Footer";
import ObfuscatedEmail from "@/components/ObfuscatedEmail/ObfuscatedEmail";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { PROJECTS } from "@/lib/projects";

import IconCollage from "@/components/nested/IconCollage/IconCollage";
import LinesIcon from "@/components/nested/IconCollage/LinesIcon";
import ClaudeIcon from "@/components/nested/IconCollage/ClaudeIcon";
import TiktokIcon from "@/components/nested/IconCollage/TiktokIcon";

const NAV_ITEMS = [
  { label: "Work", href: "/#work" },
  { label: "Products", href: "/#products" },
  { label: "Services", href: "/#services" },
  { label: "Contact", href: "/start" },
];

export const metadata = {
  title: "Nested United | MZ Work",
  description: PROJECTS["nested-united"]?.tagline || "Nested United project",
};

export default function NestedUnitedWorld() {

  return (
    <div className={styles.worldContainer}>
      <PillNav items={NAV_ITEMS} />

      {/* Hero Strip */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.backNav}>
            <TransitionLink href="/#work" className={styles.backLink}>
              <ArrowLeft size={16} /> BACK TO WORK
            </TransitionLink>
          </div>

          <div className={styles.logo}>
            <Image
              src="/nested/logos/logo.svg"
              alt="Nested United"
              width={600}
              height={250}
              priority
              style={{ maxWidth: "100%", height: "auto", width: "auto" }}
            />
          </div>

          <p className={styles.heroSubtitle}>The story behind developing nestedunited.com</p>
        </div>

        {/* The Animated SVG Collage natively embedded in the hero */}
        <div className={styles.heroCollage}>
          <IconCollage />
        </div>
      </section>

      {/* Project Write-Up */}
      <section className={styles.writeupSection}>

        <div className={styles.writeupBlock}>
          <div className={styles.writeupTextContainer}>
            <h3 className={styles.writeupTitle}>The Problem</h3>
            <p className={styles.writeupText}>
              Nested United operates five distinct sub-brands under one roof — boutique hospitality, events, real estate, tech, and creative services. They came in with a clear brand vision and zero technical infrastructure. The work was to take that vision and build it into something real, navigable, and alive on screen.
            </p>
          </div>
          <div className={styles.writeupVisual}>
            <div className={styles.writeupSvgWrapper}>
              <LinesIcon />
            </div>
          </div>
        </div>

        <div className={styles.writeupBlock}>
          <div className={styles.writeupTextContainer}>
            <h3 className={styles.writeupTitle}>Our Approach</h3>
            <p className={styles.writeupText}>
              We used their design direction as a foundation and brought significant creative input of our own — rethinking sections, building a proper component system, and adding an entire motion layer that wasn&apos;t in the original brief. The preloader, the custom SVG animations, the transitions — all our own work, and ultimately what people remember most about the site.
            </p>
          </div>
          <div className={styles.writeupVisual}>
            <div className={styles.writeupSvgWrapper}>
              <ClaudeIcon />
            </div>
          </div>
        </div>

        <div className={styles.writeupBlock}>
          <div className={styles.writeupTextContainer}>
            <h3 className={styles.writeupTitle}>The Outcome</h3>
            <p className={styles.writeupText}>
              Nested United now has a digital home that lives up to the scale of their ambitions. Five brands, one coherent identity. The animations — which weren&apos;t part of the original brief — ended up being what people respond to most. A platform that started as a design file is now something people genuinely remember.
            </p>
          </div>
          <div className={styles.writeupVisual}>
            <div className={styles.writeupSvgWrapper}>
              <TiktokIcon />
            </div>
          </div>
        </div>


      </section>

      {/* Platform Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          <h2 className={styles.previewTitle}>Platform Capabilities</h2>
        </div>
        <div className={styles.bentoGrid}>

          {/* 1. High Performance */}
          <div className={`${styles.bentoCard} ${styles.cardPerformance}`}>
            <div className={styles.cardContent}>
              <h4 className={styles.featureTitle}>High Performance</h4>
              <p className={styles.featureText}>Engineered for speed. The platform delivers instant load times and maintains a flawless 60 FPS across all devices.</p>
            </div>
            <div className={styles.cardVisual}>
              <div className={styles.scrollMockup}>
                <div className={styles.scrollTrack}>
                  <div className={styles.scrollGroup}>
                    <div className={styles.scrollBar} />
                    <div className={styles.scrollBar} />
                    <div className={styles.scrollBar} />
                    <div className={styles.scrollBar} />
                  </div>
                  <div className={styles.scrollGroup}>
                    <div className={styles.scrollBar} />
                    <div className={styles.scrollBar} />
                    <div className={styles.scrollBar} />
                    <div className={styles.scrollBar} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Perfect SEO */}
          <div className={`${styles.bentoCard} ${styles.cardSEO}`}>
            <div className={styles.cardContent}>
              <h4 className={styles.featureTitle}>Perfect SEO</h4>
              <p className={styles.featureText}>Optimized for visibility. The architecture achieves perfect technical SEO scores to secure top search rankings.</p>
            </div>
            <div className={styles.cardVisual}>
              <div className={styles.serpMockup}>
                <div className={styles.serpSearch}>
                  <div className={styles.serpInput} />
                </div>
                <a href="https://nestedunited.com" target="_blank" rel="noopener noreferrer" className={styles.serpResultActive}>
                  <div className={styles.serpUrl}>https://nestedunited.com</div>
                  <div className={styles.serpTitle}>Nested United - Where Ideas Take Shape</div>
                  <div className={styles.serpDesc}>A cohesive ecosystem for scalable operations and sustainable growth...</div>
                </a>
                <div className={styles.serpResultDim}>
                  <div className={styles.serpUrl}>https://example.com</div>
                  <div className={styles.serpTitle}>Competitor Platform - Generic Real Estate</div>
                  <div className={styles.serpDesc}>Lorem ipsum dolor sit amet consectetur adipiscing elit...</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Agentic Compatibility */}
          <div className={`${styles.bentoCard} ${styles.cardAgentic}`}>
            <div className={styles.cardContent}>
              <h4 className={styles.featureTitle}>Agentic Compatibility</h4>
              <p className={styles.featureText}>Built for the future. Clean semantic structures allow flawless parsing by both human users and AI agents.</p>
            </div>
            <div className={styles.cardVisual}>
              <div className={styles.agentScoreCard}>
                <div className={styles.scoreCircle}>
                  <svg viewBox="0 0 100 50" className={styles.scoreArc}>
                    <path d="M 10 45 A 40 40 0 0 1 90 45" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" />
                  </svg>
                  <span className={styles.scoreValue}>100</span>
                </div>
                <div className={styles.scoreLabel}>LEVEL 5</div>
                <div className={styles.scoreTitle}>Agent-Native</div>
                <div className={styles.metricsGrid}>
                  <div className={styles.metricItem}>
                    <div className={styles.metricRing}>100</div>
                    <span>Discoverability</span>
                  </div>
                  <div className={styles.metricItem}>
                    <div className={styles.metricRing}>100</div>
                    <span>Content</span>
                  </div>
                  <div className={styles.metricItem}>
                    <div className={styles.metricRing}>100</div>
                    <span>Bot Access</span>
                  </div>
                  <div className={styles.metricItem}>
                    <div className={styles.metricRing}>100</div>
                    <span>API & MCP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bilingual Support */}
          <div className={`${styles.bentoCard} ${styles.cardBilingual}`}>
            <div className={styles.cardContent}>
              <h4 className={styles.featureTitle}>Bilingual Support</h4>
              <p className={styles.featureText}>Seamlessly localized. Full RTL and LTR support ensures a native experience for both Arabic and English users.</p>
            </div>
            <div className={styles.cardVisual}>
              <div className={styles.bilingualContainer}>
                <div className={styles.langSwitcher}>
                  <div className={styles.switcherThumb} />
                  <span className={styles.switcherLabel}>EN</span>
                  <span className={styles.switcherLabel}>ع</span>
                </div>
                <div className={styles.bilingualSwap}>
                  <span className={styles.langEn}>From Operations to Growth</span>
                  <span className={styles.langAr}>من العمليات إلى النمو</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Fluid Animations */}
          <div className={`${styles.bentoCard} ${styles.cardAnimations}`}>
            <div className={styles.cardContent}>
              <h4 className={styles.featureTitle}>Fluid Animations</h4>
              <p className={styles.featureText}>Dynamic and engaging. Hardware-accelerated micro-interactions bring the interface to life.</p>
            </div>
            <div className={styles.cardVisual}>
              <div className={styles.fluidGrid}>
                <div className={`${styles.fluidShape} ${styles.fluidCircle}`} />
                <div className={`${styles.fluidShape} ${styles.fluidSquare}`} />
                <div className={`${styles.fluidShape} ${styles.fluidTriangle}`} />
                <div className={`${styles.fluidShape} ${styles.fluidPill}`} />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Bauhaus Screenshot Showcase */}
      <section className={styles.showcaseSection}>
        <div className={styles.showcaseHeader}>
          <h2 className={styles.previewTitle}>The Design Language</h2>
          <p className={styles.previewText} style={{ color: "rgba(16, 15, 13, 0.7)" }}>Strict geometry, vibrant primary accents, and minimal friction.</p>
        </div>

        <div className={styles.showcaseComposition}>
          <div className={`${styles.accentBlock} ${styles.accentJoynest}`} />
          <div className={`${styles.accentBlock} ${styles.accentOpnest}`} />
          <div className={`${styles.accentBlock} ${styles.accentTechnest}`} />

          <div className={styles.desktopPlane}>
            <Image
              src="/nested/screenshots/desktop.png"
              alt="Nested United Desktop View"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
              className={styles.planeImage}
            />
          </div>

          <div className={styles.mobilePlane}>
            <Image
              src="/nested/screenshots/mobile.png"
              alt="Nested United Mobile View"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={styles.planeImage}
            />
          </div>

          <div className={styles.detailPlane}>
            <Image
              src="/nested/screenshots/detail.png"
              alt="Nested United Detail View"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={styles.planeImage}
            />
          </div>
        </div>
      </section>

      {/* Live Preview / Iframe Section */}
      <section className={styles.previewSection}>
        <div className={styles.previewHeader}>
          <h2 className={styles.previewTitle}>Experience the World</h2>
          <p className={styles.previewText}>Interact directly with the live Nested United platform.</p>
        </div>

        {/* Desktop Iframe */}
        <div className={styles.browserMockup}>
          <div className={styles.browserHeader}>
            <div className={`${styles.dot} ${styles.dotRed}`} />
            <div className={`${styles.dot} ${styles.dotYellow}`} />
            <div className={`${styles.dot} ${styles.dotGreen}`} />
            <div className={styles.browserAddress}>
              <span className={styles.addressBar}>nestedunited.com</span>
            </div>
          </div>
          <div className={styles.iframeWrapper}>
            <iframe src="https://www.nestedunited.com" width="100%" height="100%" frameBorder="0" loading="lazy" title="Nested United Live Preview" />
          </div>
        </div>

        {/* Mobile Fallback */}
        <div className={styles.mobilePreviewNote}>
          <p>The interactive preview is best experienced on a larger screen.</p>
          <a href="https://www.nestedunited.com" target="_blank" rel="noopener noreferrer" className={styles.mobilePreviewBtn}>
            Open Live Site ↗
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Building something like this?</h2>
        <div className={styles.ctaButtons}>
          <TransitionLink href="/start" className={styles.ctaBtn}>
            START A PROJECT →
          </TransitionLink>
          <ObfuscatedEmail
            user="hello"
            domain="mzfortech.com"
            className={`${styles.ctaBtn} ${styles.ctaBtnGhost}`}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
