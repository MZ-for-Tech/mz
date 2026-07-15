"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import pageStyles from "@/app/page.module.css";
import DesktopServiceCard from "@/components/DesktopServiceCard/DesktopServiceCard";
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


export default function ServicesAccordion() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    setTimeout(() => {
      setIsMounted(true);
      setIsMobile(mql.matches);
    }, 0);
    
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Section reveal on scroll
  useGSAP(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
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

      <div className={pageStyles.desktopOnly} style={{ width: '100%', marginTop: '8rem', display: 'flex', flexDirection: 'column', gap: '30vh', paddingBottom: '20vh' }}>
        {(!isMounted || !isMobile) && SERVICES.map((service, index) => (
          <div
            key={service.id}
            className={pageStyles.customCardFull}
            style={{
              position: 'sticky',
              top: `calc(var(--card-top-offset, 15vh) + calc(${index} * var(--card-stack-offset, 40px)))`,
              zIndex: index,
              height: 'var(--card-height, min(700px, 70vh))',
              width: '100%',
              willChange: 'transform',
              transform: 'perspective(1200px) skewY(6deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            <DesktopServiceCard
              pillar={service.pillar}
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

      <div className={`${pageStyles.mobileOnly} ${pageStyles.mobileServicesWrapper}`}>
        {(!isMounted || isMobile) && SERVICES.map((service, index) => (
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
    </section>
  );
}
