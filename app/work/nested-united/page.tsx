import styles from "./page.module.css";
import { Red_Hat_Display } from "next/font/google";
import { TransitionLink } from "@/components/TransitionLink/TransitionLink";
import ObfuscatedEmail from "@/components/ObfuscatedEmail/ObfuscatedEmail";
import Image from "next/image";
import { PROJECTS } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";
import IconCollage from "@/components/nested/IconCollage/IconCollage";
import IconSprite from "@/components/nested/IconCollage/IconSprite";
import IframePreview from "@/components/IframePreview/IframePreview";
import LinesIcon from "@/components/nested/IconCollage/LinesIcon";
import ClaudeIcon from "@/components/nested/IconCollage/ClaudeIcon";
import TiktokIcon from "@/components/nested/IconCollage/TiktokIcon";

// Scoped to this page: it is the only route using --font-red-hat. Loading it
// here (instead of the global layout) keeps its bytes off the other four.
const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});


const caseStudyDescription =
  "How MZ designed and built a digital platform for Nested United, bringing five specialist brands into one coherent web experience. " +
  (PROJECTS.find((p) => p.slug === "nested-united")?.tagline || "Nested United project");

const caseStudyStructuredData = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "@id": "https://www.mzfortech.com/work/nested-united#case-study",
  name: "Nested United website case study",
  headline: "Nested United website case study",
  description: caseStudyDescription,
  inLanguage: "en",
  genre: "Digital platform case study",
  image: "https://www.mzfortech.com/nested/screenshots/desktop.webp",
  author: { "@id": "https://www.mzfortech.com/#organization" },
  publisher: { "@id": "https://www.mzfortech.com/#organization" },
  about: {
    "@type": "Organization",
    name: "Nested United",
    url: "https://nestedunited.com/",
  },
  mainEntityOfPage: "https://www.mzfortech.com/work/nested-united",
  url: "https://www.mzfortech.com/work/nested-united",
};

export const metadata = pageMetadata({
  title: "Nested United Case Study",
  description: caseStudyDescription,
  path: "/work/nested-united",
});

export default function NestedUnitedWorld() {

  return (
    <div className={`${styles.worldContainer} ${redHatDisplay.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(caseStudyStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <IconSprite />

      {/* Hero Strip */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.backNav}>
            {/* Was /#work — an in-page anchor into the old scrolling homepage
                that no longer exists. The launcher's Work panel is the real
                index now. */}
            <TransitionLink href="/work" className={styles.backLink}>
              {/* lucide arrow-left (inlined; see PERFORMANCE_REAUDIT §7) */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg> BACK TO WORK
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

          <h1 className={styles.heroSubtitle}>Nested United website case study</h1>
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
            <h2 className={styles.writeupTitle}>The Problem</h2>
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
            <h2 className={styles.writeupTitle}>Our Approach</h2>
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
            <h2 className={styles.writeupTitle}>The Outcome</h2>
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
              <h3 className={styles.featureTitle}>High Performance</h3>
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
              <h3 className={styles.featureTitle}>Perfect SEO</h3>
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
              <h3 className={styles.featureTitle}>Agentic Compatibility</h3>
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
              <h3 className={styles.featureTitle}>Bilingual Support</h3>
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
              <h3 className={styles.featureTitle}>Fluid Animations</h3>
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
              src="/nested/screenshots/desktop.webp"
              alt="Nested United Desktop View"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
              className={styles.planeImage}
            />
          </div>

          <div className={styles.mobilePlane}>
            <Image
              src="/nested/screenshots/mobile.webp"
              alt="Nested United Mobile View"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={styles.planeImage}
            />
          </div>

          <div className={styles.detailPlane}>
            <Image
              src="/nested/screenshots/detail.webp"
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
            <IframePreview src="https://www.nestedunited.com" title="Nested United Live Preview" />
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
          <TransitionLink href="/contact" className={styles.ctaBtn}>
            START A PROJECT →
          </TransitionLink>
          <ObfuscatedEmail
            user="hello"
            domain="mzfortech.com"
            className={`${styles.ctaBtn} ${styles.ctaBtnGhost}`}
          />
        </div>
      </section>

      {/* The Footer used to close this page. It is gone site-wide — a footer
          says "the page ends", which the launcher's persistent tab bar
          contradicts, and it restated the email and services the panels
          already own. This is the one thing it carried that nothing else
          does, so it lands here at minimal weight. */}
      <div className={styles.pageFoot}>
        <TransitionLink href="/privacy" className={styles.privacyLink}>
          Privacy Policy
        </TransitionLink>
      </div>
    </div>
  );
}
