"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import pageStyles from "@/app/page.module.css";
import BorderGlow from "@/components/BorderGlow/BorderGlow";
import Image from "next/image";
import { BuildVisual, DeployVisual, TeachVisual } from "@/components/ServiceVisuals/ServiceVisuals";
import { MzLogo } from "@/components/Logo/MzLogo";

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
      
      <div style={{ width: '100%', marginTop: '8rem', display: 'flex', flexDirection: 'column', gap: '30vh', paddingBottom: '20vh' }}>
        {SERVICES.map((service, index) => (
          <div 
            key={service.id} 
            className={pageStyles.customCardFull}
            style={{
              position: 'sticky',
              top: `calc(25vh + ${index * 40}px)`,
              zIndex: index,
              height: 'min(700px, 70vh)',
              width: '100%',
              willChange: 'transform',
              transform: 'perspective(1200px) skewY(6deg)',
              transformStyle: 'preserve-3d'
            }}
          >
              <BorderGlow
                edgeSensitivity={30}
                glowColor="78 63 44"
                backgroundColor="var(--color-bg-light)"
                borderRadius={20}
                glowRadius={40}
                glowIntensity={1.0}
                coneSpread={25}
                animated={true}
                colors={['var(--color-acid-green)', '#5A7A0A', '#D4A820']}
                className={pageStyles.productCardWrapper}
              >
                <div className={pageStyles.productCard}>
                  <MzLogo
                    width={400}
                    height={400}
                    className={pageStyles.productWatermark}
                  />
                  <div className={pageStyles.proprietaryStamp}>
                    {service.id} {"//"} {service.pillar}
                  </div>

                  <div className={pageStyles.productContent}>
                    <div className={pageStyles.productNameWrapper} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div className={pageStyles.productName}>{service.title}</div>
                      <div className={pageStyles.pronunciation}>/ {service.pillar.toLowerCase()} /</div>
                    </div>
                    <div className={pageStyles.productTagline}>{service.tagline}</div>
                    <div className={pageStyles.productDesc} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {service.capabilities.map((cap, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '1.25rem', color: 'rgba(var(--color-text-rgb), 0.8)' }}>
                            <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-acid-green)', borderRadius: '50%', flexShrink: 0 }}></span>
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className={pageStyles.productVisual}>
                    {service.pillar === "BUILD" && <BuildVisual />}
                    {service.pillar === "DEPLOY" && <DeployVisual />}
                    {service.pillar === "TEACH" && <TeachVisual />}
                  </div>
                </div>
              </BorderGlow>
          </div>
        ))}
      </div>
    </section>
  );
}
