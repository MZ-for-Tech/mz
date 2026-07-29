import { PROJECTS } from "@/lib/projects";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import { TransitionLink } from "@/components/TransitionLink/TransitionLink";
import PillNav from "@/components/PillNav/PillNav";
import { Footer } from "@/components/Footer/Footer";
import DarkVeil from "@/components/DarkVeil/DarkVeil";
import { ArrowLeft, ExternalLink, Lock } from "lucide-react";
import Image from "next/image";
import React from "react";

const NAV_ITEMS = [
  { label: "Work", href: "/#work" },
  { label: "Products", href: "/#products" },
  { label: "Services", href: "/#services" },
  { label: "Contact", href: "/start" },
];

export function generateStaticParams() {
  return Object.keys(PROJECTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECTS[slug];
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.name} | MZ Work`,
    description: project.tagline,
  };
}

export default async function ProjectRoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECTS[slug];

  if (!project) {
    notFound();
  }

  const isSerif = project.fontFamily === "serif";
  const customStyles = {
    "--accent-color": project.accentColor,
    "--accent-rgb": project.accentColorRgb,
    "--room-bg": project.themeBg || "#0D0F08",
    "--room-text": project.themeText || "#F5F5F0",
  } as React.CSSProperties;

  return (
    <div className={styles.roomContainer} style={customStyles}>
      <PillNav items={NAV_ITEMS} />

      {/* Hero Header Room */}
      <section className={styles.hero}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.15, zIndex: 0, pointerEvents: "none" }}>
          <DarkVeil
            primaryColor={project.accentColor}
            noiseIntensity={0.08}
            scanlineIntensity={0.04}
            speed={0.1}
          />
        </div>

        <div className={styles.backNav}>
          <TransitionLink href="/#work" className={styles.backLink}>
            <ArrowLeft size={16} /> BACK TO ALL WORK
          </TransitionLink>
        </div>

        <div className={styles.heroHeader} style={{ position: "relative", zIndex: 1 }}>
          <div className={styles.metaRow}>
            <span className={styles.clientBadge}>{project.client}</span>
            <span>{project.category}</span>
            <span>/ {project.year}</span>
          </div>

          <h1 className={`${styles.title} ${isSerif ? styles.serifTitle : ""}`}>
            {project.name}
          </h1>

          <p className={styles.tagline}>{project.tagline}</p>

          <div className={styles.heroActions}>
            {project.isPrivate ? (
              <div className={styles.restrictedNotice}>
                <Lock size={16} /> PROPRIETARY SYSTEM — INTERNAL USE ONLY
              </div>
            ) : (
              project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.liveBtn}
                >
                  VISIT LIVE SYSTEM <ExternalLink size={16} />
                </a>
              )
            )}
          </div>
        </div>
      </section>

      {/* Section 1: Overview & Highlights */}
      <section className={styles.section}>
        <span className={styles.sectionLabel}>01 // SYSTEM OVERVIEW</span>
        <div className={styles.overviewGrid}>
          <div className={`${styles.description} ${isSerif ? styles.serifDesc : ""}`}>
            {project.description}
          </div>

          <div className={styles.highlightsGrid}>
            {project.highlights.map((item, idx) => (
              <div key={idx} className={styles.highlightCard}>
                <div className={styles.highlightValue}>{item.value}</div>
                <div className={styles.highlightLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Screenshots (if available) */}
      {project.screenshots.length > 0 && (
        <section className={styles.section}>
          <span className={styles.sectionLabel}>02 // INTERFACE & VISUALS</span>
          <div className={styles.screenshotContainer}>
            {project.screenshots.map((src, idx) => (
              <div key={idx} className={styles.screenshotWrapper}>
                <Image
                  src={src}
                  alt={`${project.name} Screenshot ${idx + 1}`}
                  width={1440}
                  height={900}
                  className={styles.screenshotImg}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Thought Process */}
      {project.process.length > 0 && (
        <section className={styles.section}>
          <span className={styles.sectionLabel}>
            {project.screenshots.length > 0 ? "03 // THOUGHT PROCESS" : "02 // THOUGHT PROCESS"}
          </span>
          <div className={styles.timeline}>
            {project.process.map((step, idx) => (
              <div key={idx} className={styles.timelineItem}>
                <div className={styles.timelinePhase}>{step.phase}</div>
                <h3 className={styles.timelineTitle}>{step.title}</h3>
                <p className={styles.timelineDesc}>{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Room Footer CTA */}
      <section className={styles.roomFooter}>
        <h2 className={styles.footerTitle}>Building a similar platform?</h2>
        <TransitionLink
          href="/start"
          className={styles.liveBtn}
          style={{ display: "inline-flex" }}
        >
          INITIATE PROJECT →
        </TransitionLink>
      </section>

      <Footer />
    </div>
  );
}
