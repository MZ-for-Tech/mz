import styles from "./Footer.module.css";
import { useRef, useEffect, useState } from "react";
import ObfuscatedEmail from "../ObfuscatedEmail/ObfuscatedEmail";
import { TransitionLink } from "@/components/TransitionLink/TransitionLink";

export function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0 });

    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.footerWrapper} ref={footerRef}>
      <footer className={styles.footerContent}>
        <div className={styles.footerTop}>
          <div className={styles.infoBlock}>
            <p className={styles.label}>Coordinates</p>
            <p className={styles.value}>
              30.0444° N, 31.2357° E<br />
              CAIRO, EG
            </p>
          </div>

          <div className={styles.infoBlock}>
            <p className={styles.label}>Contact</p>
            <ObfuscatedEmail user="hello" domain="mzltd.tech" className={styles.value} />
          </div>

          <div className={styles.infoBlock}>
            <p className={styles.label}>Socials</p>
            <a href="https://www.facebook.com/mzfortech/" target="_blank" rel="noopener noreferrer" className={styles.value}>
              FACEBOOK
            </a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <h2 className={styles.massiveText}>MZ.®</h2>
          <div className={styles.copyright}>
            <span>&copy; {new Date().getFullYear()} MZ Ltd.</span>
            <span className={styles.marquee}>
              <div
                className={styles.marqueeInner}
                style={{ animationPlayState: isVisible ? 'running' : 'paused' }}
              >
                <span>RESEARCH — SOFTWARE — KNOWLEDGE</span>
                <span>RESEARCH — SOFTWARE — KNOWLEDGE</span>
                <span>RESEARCH — SOFTWARE — KNOWLEDGE</span>
                <span>RESEARCH — SOFTWARE — KNOWLEDGE</span>
              </div>
            </span>
            <span>All rights reserved. <TransitionLink href="/privacy" style={{ textDecoration: 'underline', marginLeft: '1rem' }}>Privacy Policy</TransitionLink></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
