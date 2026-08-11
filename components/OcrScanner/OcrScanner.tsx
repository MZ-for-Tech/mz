"use client";

import { useEffect, useRef } from "react";

import styles from './OcrScanner.module.css';

export function OcrScanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pause all 7 infinite CSS animations when the scanner is off-screen.
  // Without this the compositor keeps them running forever, even scrolled
  // far away — a direct battery/thermal cost on mobile.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        el.dataset.paused = entry.isIntersecting ? 'false' : 'true';
      },
      { threshold: 0, rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={styles.scannerContainer}>
      <div className={styles.scannerScaleWrapper}>
        {/* Stage 1: Document Scanning */}
        <div className={styles.document}>
          <div className={styles.scanLine}></div>
          
          <div className={`${styles.block} ${styles.headerBlock}`}>
            <div className={styles.wireframeContent}></div>
            <div className={styles.boundingBox}>
              <span className={styles.label}>[ HEADER ]</span>
            </div>
          </div>

          <div className={`${styles.block} ${styles.textBlock}`}>
            <div className={styles.wireframeContent}>
              <div className={styles.line}></div>
              <div className={styles.line}></div>
              <div className={styles.line}></div>
            </div>
            <div className={styles.boundingBox}>
              <span className={styles.label}>[ TEXT ]</span>
            </div>
          </div>

          <div className={`${styles.block} ${styles.tableBlock}`}>
            <div className={styles.wireframeContent}>
              <div className={styles.grid}>
                <div></div><div></div><div></div><div></div>
              </div>
            </div>
            <div className={styles.boundingBox}>
              <span className={styles.label}>[ TABLE ]</span>
            </div>
          </div>
        </div>
        
        {/* Stage 2: Markdown Extraction */}
        <div className={styles.outputCode}>
          <span>&gt; VLM Extraction...</span>
          <span>## Executive Summary</span>
          <span>The model detects layout</span>
          <span>semantically, not linearly.</span>
          <span>| Type | Accuracy |</span>
          <span>| --- | --- |</span>
          <span>| Text | 99.8% |</span>
        </div>

        {/* Stage 3: PDF Generation */}
        <div className={styles.outputPdf}>
          <div className={styles.pdfHeader}>
            <div className={styles.pdfIcon}>PDF</div>
            <div className={styles.pdfText}>CLEAN EXPORT</div>
          </div>
          <div className={styles.pdfLines}>
            <div className={styles.pdfLine}></div>
            <div className={styles.pdfLine}></div>
            <div className={styles.pdfLine}></div>
            <div className={styles.pdfTable}>
              <div></div><div></div><div></div><div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
