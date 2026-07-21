"use client";

import styles from "./Footer.module.css";
import { useRef, useEffect, useState } from "react";
import ObfuscatedEmail from "../ObfuscatedEmail/ObfuscatedEmail";
import { TransitionLink } from "@/components/TransitionLink/TransitionLink";

export function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [cairoTime, setCairoTime] = useState("");
  const [copied, setCopied] = useState(false);

  // Live Cairo Clock
  useEffect(() => {
    const updateTime = () => {
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Africa/Cairo",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        setCairoTime(formatter.format(new Date()));
      } catch {
        setCairoTime("");
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Visibility tracking for marquee
  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0 });

    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("hello@mzltd.tech");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.footerWrapper} ref={footerRef}>
      <footer className={styles.footerContent}>
        {/* Open Statement CTA (No Heavy Boxes) */}
        <div className={styles.statementSection}>
          <h2 className={styles.statementTitle}>
            Ready to build something bold?
          </h2>

          <div className={styles.statementAction}>
            <span>Drop us a line at</span>
            <div className={styles.emailPill}>
              <ObfuscatedEmail user="hello" domain="mzltd.tech" className={styles.emailText} />
              <button onClick={handleCopyEmail} className={styles.copyBtn}>
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
            <span>or</span>
            <TransitionLink href="/start" className={styles.startBtn}>
              START A PROJECT <span className={styles.btnArrow}>↗</span>
            </TransitionLink>
          </div>
        </div>

        {/* Sleek 3-Column Minimal Grid */}
        <div className={styles.gridSection}>
          {/* Col 1: Location & Time */}
          <div className={styles.gridCol}>
            <span className={styles.colLabel}>LOCATION & LOCAL TIME</span>
            <div className={styles.colContent}>
              <p className={styles.mainVal}>CAIRO, EG</p>
              <p className={styles.subVal}>30.0444° N, 31.2357° E</p>
              {cairoTime && (
                <div className={styles.timeVal}>
                  <span>{cairoTime}</span>
                  <span className={styles.tz}>UTC+3</span>
                </div>
              )}
            </div>
          </div>

          {/* Col 2: Services */}
          <div className={styles.gridCol}>
            <span className={styles.colLabel}>SERVICES</span>
            <ul className={styles.linkList}>
              <li><a href="#services" className={styles.linkItem}>Custom Websites & Systems</a></li>
              <li><a href="#services" className={styles.linkItem}>Artificial Intelligence & ML</a></li>
              <li><a href="#services" className={styles.linkItem}>Knowledge Transfer</a></li>
            </ul>
          </div>

          {/* Col 3: Connect */}
          <div className={styles.gridCol}>
            <span className={styles.colLabel}>CONNECT</span>
            <ul className={styles.linkList}>
              <li>
                <a href="https://nullhypothesis.dev" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
                  The Null Hypothesis <span className={styles.arr}>↗</span>
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/mzfortech/" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
                  Facebook <span className={styles.arr}>↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Refined Subfooter Bar */}
        <div className={styles.bottomSection}>
          <div className={styles.subFooterBar}>
            <div className={styles.copyrightText}>
              &copy; {new Date().getFullYear()} MZ LTD. ALL RIGHTS RESERVED.
            </div>

            <div className={styles.marqueeWrapper}>
              <div
                className={styles.marqueeTrack}
                style={{ animationPlayState: isVisible ? "running" : "paused" }}
              >
                <span>RESEARCH — SOFTWARE — KNOWLEDGE</span>
                <span>RESEARCH — SOFTWARE — KNOWLEDGE</span>
                <span>RESEARCH — SOFTWARE — KNOWLEDGE</span>
                <span>RESEARCH — SOFTWARE — KNOWLEDGE</span>
              </div>
            </div>

            <div className={styles.subFooterLinks}>
              <TransitionLink href="/privacy" className={styles.privacyLink}>
                PRIVACY POLICY
              </TransitionLink>

              <button onClick={scrollToTop} className={styles.topBtn} aria-label="Back to top">
                <span>BACK TO TOP</span>
                <span className={styles.topArr}>↑</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
