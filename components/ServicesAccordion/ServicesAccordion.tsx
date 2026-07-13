"use client";

import React, { useState, useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import styles from "./ServicesAccordion.module.css";

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
      "Multilingual document intelligence",
      "Prompt compression & efficiency systems",
      "Interactive 3D commerce experiences",
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

const ACTIVE_WIDTH = "50%";
const INACTIVE_WIDTH = "25%";

export default function ServicesAccordion() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // GSAP width animation on activeIndex change
  useEffect(() => {
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const isActive = i === activeIndex;

      gsap.to(el, {
        width: isActive ? ACTIVE_WIDTH : INACTIVE_WIDTH,
        duration: 0.65,
        ease: "power3.inOut",
        overwrite: true,
      });
    });

    // Fade in the capabilities list of the active card
    contentRefs.current.forEach((el, i) => {
      if (!el) return;
      const isActive = i === activeIndex;
      gsap.to(el, {
        opacity: isActive ? 1 : 0,
        y: isActive ? 0 : 8,
        duration: isActive ? 0.4 : 0.2,
        delay: isActive ? 0.3 : 0,
        ease: "power2.out",
        overwrite: true,
      });
    });
  }, [activeIndex]);

  return (
    <section ref={sectionRef} id="services" className={styles.section}>
      <div className={styles.sectionHeader}>Services</div>
      <div ref={containerRef} className={styles.accordionContainer}>
        {SERVICES.map((service, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              key={service.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              className={`${styles.accordionItem} ${isActive ? styles.active : ""} ${index === 0 ? styles.shapeM : index === 1 ? styles.shapeZ : styles.shapeDot}`}
              style={{ width: index === 0 ? ACTIVE_WIDTH : INACTIVE_WIDTH }}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
            >
              <div className={styles.itemHeader}>
                <div className={styles.itemNumber}>{service.id}</div>
                <div className={styles.itemPillar}>{service.pillar}</div>
              </div>

              <div className={styles.itemContent}>
                <h3 className={styles.itemTitle}>{service.title}</h3>
                <p className={styles.itemTagline}>{service.tagline}</p>

                <div
                  ref={(el) => { contentRefs.current[index] = el; }}
                  className={styles.capabilitiesListWrapper}
                  style={{ opacity: index === 0 ? 1 : 0, transform: "translateY(0)" }}
                >
                  <ul className={styles.capabilitiesList}>
                    {service.capabilities.map((cap, i) => (
                      <li key={i} className={styles.capabilityItem}>
                        <span className={styles.bullet}></span>
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
