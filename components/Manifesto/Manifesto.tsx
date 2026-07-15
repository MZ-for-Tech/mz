'use client';

import React, { useRef } from 'react';
import styles from './Manifesto.module.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import VariableProximity from '../VariableProximity/VariableProximity';

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const text = "We don't just write code. We engineer systems designed for scale, rooted in statistical rigor, and built to outlast the hype.";

  useGSAP(() => {
    if (!textRef.current) return;
    
    gsap.fromTo(
      `.${styles.word}`,
      { opacity: 0.1, y: 20 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          end: 'center 45%',
          scrub: 1, // Adds a 1-second smoothing delay for a buttery premium feel
        },
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className={styles.manifestoSection}>
      <div className={styles.container}>
        <div ref={textRef} className={styles.textWrapper} data-cursor-lens="true">
          <VariableProximity
            label={text}
            containerRef={containerRef}
            radius={150}
            falloff="gaussian"
            fromFontVariationSettings="'wght' 400"
            toFontVariationSettings="'wght' 400"
            wordClassName={styles.word}
          />
        </div>
      </div>
    </section>
  );
}
