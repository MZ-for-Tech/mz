"use client";

import styles from "./Footer.module.css";
import { useRef, useEffect, useState } from "react";
import ObfuscatedEmail from "../ObfuscatedEmail/ObfuscatedEmail";
import { TransitionLink } from "@/components/TransitionLink/TransitionLink";
import DarkVeil from "@/components/DarkVeil/DarkVeil";

// Live Cairo Clock — isolated in its own leaf component so the 1 Hz setState
// only re-renders the clock subtree. Previously it lived in Footer, re-rendering
// the entire footer (including the DarkVeil wrapper) 60 times per minute.
function CairoClock() {
  const [cairoTime, setCairoTime] = useState("");

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

  return (
    <div
      className={styles.timeVal}
      style={{ opacity: cairoTime ? 1 : 0, transition: 'opacity 0.5s ease' }}
    >
      <span>{cairoTime || "00:00:00 AM"}</span>
      <span className={styles.tz}>UTC+3</span>
    </div>
  );
}

export function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Visibility tracking for marquee and background
  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0 });

    observer.observe(footerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("hello@mzfortech.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className={styles.footerWrapper} ref={footerRef}>
      <footer className={styles.footerContent}>
        {/* Animated Background */}
        {/* DarkVeil is mounted unconditionally: it pauses its own rAF loop via
            its internal IntersectionObserver + visibilitychange (DarkVeil.tsx),
            so unmounting/remounting here would destroy and recreate the WebGL
            context and recompile the CPPN shader on every scroll past the
            footer. One context, alive for the whole session. */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1, overflow: "hidden" }}>
          <DarkVeil
            hueShift={-170}
            noiseIntensity={0.08}
            scanlineIntensity={0.05}
            scanlineFrequency={0.01}
            speed={0.2}
            warpAmount={0.5}
            variant="wave"
          />
        </div>

        {/* Open Statement CTA (No Heavy Boxes) */}
        <div className={styles.statementSection}>
          <h2 className={styles.statementTitle}>
            Ready to build something bold?
          </h2>

          <div className={styles.statementAction}>
            <span>Drop us a line at</span>
            <div className={styles.emailPill}>
              <ObfuscatedEmail user="hello" domain="mzfortech.com" className={styles.emailText} />
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
              <CairoClock />
            </div>
          </div>

          {/* Col 2: Services */}
          <div className={styles.gridCol}>
            <span className={styles.colLabel}>SERVICES</span>
            <ul className={styles.linkList}>
              <li><a href="#services" className={`${styles.linkItem} hover-link`}>Custom Websites & Systems</a></li>
              <li><a href="#services" className={`${styles.linkItem} hover-link`}>Artificial Intelligence & ML</a></li>
              <li><a href="#services" className={`${styles.linkItem} hover-link`}>Knowledge Transfer</a></li>
            </ul>
          </div>

          {/* Col 3: Connect */}
          <div className={styles.gridCol}>
            <span className={styles.colLabel}>CONNECT</span>
            <ul className={styles.linkList}>
              <li>
                <a href="https://www.facebook.com/mzfortech/" target="_blank" rel="noopener noreferrer" className={`${styles.linkItem} hover-link`}>
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
              &copy; {new Date().getFullYear()} MZ ALL RIGHTS RESERVED.
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


            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
