import Link from "next/link";
import { ABOUT_SECTIONS, COMPANY_FACTS, COMPANY_SUMMARY, CONTENT_UPDATED, ENTITY_DEFINITION } from "@/lib/company-content";
import PremiumShowcase from "@/components/PremiumShowcase/PremiumShowcase";
import { ProjectCTA } from "./ContentBlocks";
import styles from "./CompanyContent.module.css";

export default function AboutContent() {
  return <article>
    <header className={styles.content}><h1>About Model Zero</h1><p>{ENTITY_DEFINITION} {COMPANY_SUMMARY}</p><time dateTime={CONTENT_UPDATED}>Updated 20 October 2026</time></header>
    <PremiumShowcase />
    <div className={styles.content}>
      {ABOUT_SECTIONS.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.title.startsWith("Systems") && <Link href="/research/essays/the-measure-and-the-target">Read The Measure and the Target</Link>}{section.title.startsWith("Research.") && <div className={styles.actions}><Link href="/research">Research in English</Link><Link href="/research/ar" lang="ar">الأبحاث بالعربية</Link></div>}{section.title.startsWith("What Model") && <Link href="/services">Explore the services</Link>}{section.title.startsWith("Public") && <div className={styles.actions}><Link href="/work/nested-united">Nested United case study</Link><Link href="/research/papers/vgg19-bloodmnist-compression">BloodMNIST compression paper</Link><Link href="/work">Selected work and products</Link></div>}</section>)}
      <section><h2>At a glance</h2><dl className={styles.facts}>{COMPANY_FACTS.map(([label, value]) => <div key={label} style={{ display: "contents" }}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      <ProjectCTA />
    </div>
  </article>;
}
