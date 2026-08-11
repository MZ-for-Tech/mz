"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import pageStyles from "@/app/page.module.css";
import ServicesBento from "@/components/ServicesBento/ServicesBento";
import SharedGrainient from "@/components/Grainient/SharedGrainient";
import { BuildVisual, DeployVisual, TeachVisual } from "@/components/ServiceVisuals/ServiceVisuals";
import MobileServiceCard from "@/components/MobileServiceCard/MobileServiceCard";

const SERVICES = [
  {
    id: "01",
    pillar: "BUILD",
    title: "Software",
    tagline: "We make systems that work.",
    capabilities: [
      "Custom websites & landing pages",
      "E-commerce & digital storefronts",
      "ERP & internal operations systems",
    ]
  },
  {
    id: "02",
    pillar: "DEPLOY",
    title: "Artificial Intelligence",
    tagline: "We give machines judgment.",
    capabilities: [
      "Custom specialized models",
      "Model fine-tuning & pruning",
      "Cost-optimized local inference",
    ]
  },
  {
    id: "03",
    pillar: "TEACH",
    title: "Knowledge Transfer",
    tagline: "We make expertise replicable.",
    capabilities: [
      "Premium institutional workshops",
      "Statistical thinking & data literacy",
      "Digital-first educational content"
    ]
  }
];


function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    // Initial sync: intentional (one-time, matches state bails out on no-op).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
}

/**
 * "Genuinely low end" — deliberately stricter than DarkVeil's lowPower:
 * a plain `(max-width: 768px)` match is NOT enough (that would push every
 * phone onto the shared atlas, which is exactly what we just reverted).
 * Only devices with a weak CPU or very low memory fall back to the single
 * SharedGrainient context to protect the WebGL context budget; everyone
 * else gets the original per-card Grainient rendering.
 */
function isGenuinelyLowEnd(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 8;
  const mem = typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : 8;
  return cores <= 4 || mem <= 2;
}

export default function ServicesAccordion() {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  // Device capability is static per session — evaluate once.
  const [useSharedGrainientFallback] = useState(() => isGenuinelyLowEnd());

  // Pause all ServiceVisual CSS animations and WebGL canvases when section is not on screen
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

  // Section reveal on scroll — opacity only: a y-transform on the whole
  // section (sticky cards + WebGL canvases) forces a giant layer to composite
  // on every scroll frame, a real jank source on mobile.
  useGSAP(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        }
      }
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="services" style={{ padding: '120px 8vw', position: 'relative', zIndex: 10 }}>
      <div className={pageStyles.sectionHeader}>Services</div>

      {!isMobile ? (
        <div className={pageStyles.desktopOnly} style={{ width: '100%', marginTop: '4rem' }}>
          <ServicesBento />
        </div>
      ) : useSharedGrainientFallback ? (
        // LOW-END FALLBACK: one SharedGrainient context for all three mobile
        // cards instead of three per-instance WebGL contexts, protecting the
        // context budget on genuinely weak devices. Cards render as
        // `[data-grainient]` regions; rects are scroll-aware inside
        // SharedGrainient to track the cards' sticky motion.
        <SharedGrainient
          regionSelector="[data-grainient]"
          color1="var(--color-bg)"
          color2="var(--color-bg)"
          color3="var(--color-olive)"
          timeSpeed={0.15}
          colorBalance={0.0}
          blendSoftness={0.2}
          contrast={1.1}
        >
          <div className={`${pageStyles.mobileOnly} ${pageStyles.mobileServicesWrapper}`}>
            {SERVICES.map((service, index) => (
              <div
                key={service.id}
                style={{
                  position: 'sticky',
                  top: `calc(12vh + ${index * 1.5}rem)`,
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <MobileServiceCard
                  title={service.title}
                  tagline={service.tagline}
                  capabilities={service.capabilities}
                  grainientMode="shared"
                  visual={
                    service.pillar === "BUILD" ? <BuildVisual /> :
                      service.pillar === "DEPLOY" ? <DeployVisual /> :
                        service.pillar === "TEACH" ? <TeachVisual /> : undefined
                  }
                />
              </div>
            ))}
          </div>
        </SharedGrainient>
      ) : (
        // DEFAULT: each card renders its own Grainient (original per-card
        // logic — independent context per card, original look).
        <div className={`${pageStyles.mobileOnly} ${pageStyles.mobileServicesWrapper}`}>
          {SERVICES.map((service, index) => (
            <div
              key={service.id}
              style={{
                position: 'sticky',
                top: `calc(12vh + ${index * 1.5}rem)`,
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <MobileServiceCard
                title={service.title}
                tagline={service.tagline}
                capabilities={service.capabilities}
                visual={
                  service.pillar === "BUILD" ? <BuildVisual /> :
                    service.pillar === "DEPLOY" ? <DeployVisual /> :
                      service.pillar === "TEACH" ? <TeachVisual /> : undefined
                }
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
