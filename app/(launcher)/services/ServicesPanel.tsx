import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { SERVICE_PILLARS } from "@/lib/services";
import { DIFFERENTIATORS, ENGAGEMENT_OVERVIEW, OFFERINGS, SERVICES_INTRO, TECHNOLOGY_OVERVIEW } from "@/lib/company-content";
import { FAQ, ProjectCTA, Workflow } from "@/components/CompanyContent/ContentBlocks";
import copy from "@/components/CompanyContent/CompanyContent.module.css";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, faqSchema, graph, serviceSchema } from "@/lib/structured-data";
import styles from "./page.module.css";

function BuildVisual() {
  return (
    <svg viewBox="0 0 360 240" className={styles.artwork} aria-hidden="true">
      <path className={styles.artGrid} d="M20 40h320M20 80h320M20 120h320M20 160h320M20 200h320M60 20v200M100 20v200M140 20v200M180 20v200M220 20v200M260 20v200M300 20v200" />
      <g transform="translate(180 120) scale(1.35) translate(-160 -120)">
        <path className={styles.artLine} d="m77 78 83-42 83 42-83 42-83-42Z" />
        <path className={styles.artLine} d="M77 78v76l83 44 83-44V78M160 120v78" />
        <path className={styles.artLine} d="m77 116 83 44 83-44M77 154l83 44 83-44" />
        <path className={styles.artAccent} d="m117 58 43-22 83 42-43 22-83-42Z" />
        <circle className={styles.artPoint} cx="160" cy="78" r="5" />
        <circle className={styles.artPoint} cx="160" cy="160" r="4" />
      </g>
    </svg>
  );
}

function ApplyVisual() {
  return (
    <svg viewBox="0 0 360 240" className={styles.artwork} aria-hidden="true">
      <path className={styles.artGrid} d="M20 40h320M20 80h320M20 120h320M20 160h320M20 200h320M60 20v200M100 20v200M140 20v200M180 20v200M220 20v200M260 20v200M300 20v200" />
      <path className={styles.artLine} d="M44 168c38-2 41-76 82-76s44 53 79 53 44-53 111-89" />
      <path className={styles.artAccent} d="M44 168c38-2 41-76 82-76s44 53 79 53 44-53 111-89" />
      <path className={styles.artLine} d="M44 198h272M44 198v-12" />
      <circle className={styles.artPoint} cx="126" cy="92" r="5" />
      <circle className={styles.artPoint} cx="205" cy="145" r="5" />
      <circle className={styles.artPoint} cx="316" cy="56" r="6" />
    </svg>
  );
}

function TeachVisual() {
  return (
    <svg viewBox="0 0 360 240" className={styles.artwork} aria-hidden="true">
      <path className={styles.artGrid} d="M20 40h320M20 80h320M20 120h320M20 160h320M20 200h320M60 20v200M100 20v200M140 20v200M180 20v200M220 20v200M260 20v200M300 20v200" />
      <path className={styles.artLine} d="M70 120h77m0 0V65m0 55v55m0-55h70m0 0V65m0 55v55m0-55h70" />
      <path className={styles.artAccent} d="M70 120h77m0 0h70m0 0h70" />
      <circle className={styles.artHub} cx="70" cy="120" r="14" />
      <circle className={styles.artPoint} cx="147" cy="65" r="8" />
      <circle className={styles.artPoint} cx="147" cy="120" r="8" />
      <circle className={styles.artPoint} cx="147" cy="175" r="8" />
      <circle className={styles.artPoint} cx="217" cy="65" r="5" />
      <circle className={styles.artPoint} cx="217" cy="120" r="5" />
      <circle className={styles.artPoint} cx="217" cy="175" r="5" />
      <circle className={styles.artHub} cx="287" cy="120" r="14" />
    </svg>
  );
}

const serviceArt: Record<string, ReactNode> = {
  Build: <BuildVisual />,
  Deploy: <ApplyVisual />,
  Teach: <TeachVisual />,
};

export default function ServicesPanel() {
  return (
    <div className={styles.panel}>

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.title} style={{ fontSize: "clamp(2.6rem, 5.5vw, 5.5rem)" }}>Software, AI &amp; Knowledge Transfer Services</h1>
          <p className={styles.lede}>
            {SERVICES_INTRO}
          </p>
          <Link href="/contact" data-tile className={styles.contactLink}>
            Start a project <ArrowUpRight size={16} strokeWidth={1.6} aria-hidden="true" />
          </Link>
          <Link href="/work" className={styles.contactLink}>See our work</Link>
        </div>

        <nav className={styles.pillarMap} aria-label="Explore Model Zero service pillars">
          <svg className={styles.serviceMapGraphic} viewBox="0 0 400 280" aria-hidden="true">
            <ellipse className={styles.mapOrbit} cx="200" cy="140" rx="118" ry="94" />
            <ellipse className={styles.mapOrbit} cx="200" cy="140" rx="78" ry="62" />
            <path className={styles.mapConnection} d="M200 109C215 82 207 53 200 24M177 149C135 161 86 202 30 254M223 149C265 161 314 202 370 254" />
            <path className={styles.mapConnectionAccent} d="M200 109C215 82 207 53 200 24M177 149C135 161 86 202 30 254M223 149C265 161 314 202 370 254" />
            <circle className={styles.mapNode} cx="200" cy="24" r="4" />
            <circle className={styles.mapNode} cx="30" cy="254" r="4" />
            <circle className={styles.mapNode} cx="370" cy="254" r="4" />
            <circle className={styles.mapNode} cx="200" cy="109" r="3" />
            <circle className={styles.mapNode} cx="177" cy="149" r="3" />
            <circle className={styles.mapNode} cx="223" cy="149" r="3" />
          </svg>
          <Link href="#build" data-tile className={`${styles.mapLink} ${styles.mapBuild}`}>
            Build <ArrowDownRight size={13} aria-hidden="true" />
          </Link>
          <Link href="#deploy" data-tile className={`${styles.mapLink} ${styles.mapApply}`}>
            Deploy <ArrowDownRight size={13} aria-hidden="true" />
          </Link>
          <Link href="#teach" data-tile className={`${styles.mapLink} ${styles.mapTeach}`}>
            Teach <ArrowDownRight size={13} aria-hidden="true" />
          </Link>
          <Image
            src="/model-zero-logo-texture.png"
            alt=""
            width={1254}
            height={1254}
            className={styles.mapMark}
          />
        </nav>
      </header>

      <div className={styles.pillars}>
        {SERVICE_PILLARS.map((pillar) => (
          <section
            className={`${styles.pillar} ${styles[`pillar${pillar.name === "Deploy" ? "Apply" : pillar.name}`]}`}
            id={pillar.name.toLowerCase()}
            key={pillar.id}
            aria-labelledby={`${pillar.name.toLowerCase()}-title`}
          >
            <div className={styles.pillarHeading}>
              <h2 id={`${pillar.name.toLowerCase()}-title`}>{pillar.name}</h2>
              <p>{pillar.title}</p>
            </div>

            <div className={styles.pillarContent}>
              <p className={styles.pillarDescription}>{pillar.description}</p>
              <div className={styles.pillarVisual}>{serviceArt[pillar.name]}</div>
              <ul className={styles.scopeList}>
                {pillar.scope.map((item) => <li key={item}>{item}</li>)}
              </ul>

              {pillar.name === "Build" && (
                <Link href="/work" className={styles.textLink}>
                  Explore MZ products <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              )}
              {pillar.name === "Deploy" && (
                <Link href="/research" className={styles.textLink}>
                  Explore MZ research <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              )}
            </div>
          </section>
        ))}
      </div>


      <div className={copy.content}>
        <JsonLd data={graph([breadcrumbs('/services', 'Services'), faqSchema('/services'), { '@type': 'OfferCatalog', '@id': 'https://www.mzfortech.com/services#catalog', name: 'Model Zero services', itemListElement: OFFERINGS.map((offering, index) => ({ '@type': 'Offer', itemOffered: serviceSchema('/services/' + offering.guide, offering.name, offering.text, 'offering-' + index) })) }])} />
        {[
          { name: 'Custom Software & Systems', guides: ['software-development', 'fintech-compliance', 'embedded-systems', 'digitization-arabic-ocr'], exclude: 'Arabic OCR & document AI' },
          { name: 'AI, Data & Analytics', guides: ['ai-machine-learning', 'data-analytics-surveys'], extra: 'Arabic OCR & document AI', exclude: 'Research & development collaboration' },
          { name: 'Consulting, Training & Knowledge Transfer', guides: ['digital-transformation', 'training-workshops'], extra: 'Research & development collaboration' },
        ].map(group => <section key={group.name}><h2>{group.name}</h2>{OFFERINGS.filter(item => (group.guides.includes(item.guide) || group.extra === item.name) && item.name !== group.exclude).map(item => <article key={item.name} className={copy.faq}><h3>{item.name}</h3><p>{item.text}</p><p><strong>Who it is for:</strong> {item.audience}</p><p><strong>What you get:</strong> {item.deliverables}</p><p><strong>Timing:</strong> {item.timing}</p><div className={copy.actions}><Link href={'/services/' + item.guide}>Explore this service</Link><Link href={item.proof || '/contact'}>{item.proof ? 'Read the related work' : 'Discuss your requirements'}</Link></div></article>)}</section>)}
        <Workflow />
        <section><h2>Why Model Zero?</h2><div className={copy.grid}>{DIFFERENTIATORS.map(item => <article className={copy.card} key={item.title}><h3>{item.title}</h3><p>{item.text}</p>{item.title === 'Research you can inspect' && <Link href='/research'>Read The Null Hypothesis</Link>}</article>)}</div></section>
        <section><h2>Technologies and implementation choices</h2><p>{TECHNOLOGY_OVERVIEW}</p></section>
        <section><h2>Engagement and project scope</h2><p>{ENGAGEMENT_OVERVIEW}</p></section>
        <FAQ /><ProjectCTA />
      </div>
      <footer className={styles.closer}>
        <p>Have a problem worth solving?</p>
        <Link href="/contact" data-tile>
          Tell us about it <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </footer>
    </div>
  );
}
