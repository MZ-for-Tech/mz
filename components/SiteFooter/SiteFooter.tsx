import Link from "next/link";
import { SERVICE_GUIDES } from "@/lib/service-guides";
import { LINKEDIN_URL } from "@/lib/site-structured-data";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return <footer className={styles.footer} lang="en" dir="ltr">
    <p>Model Zero · Cairo, Egypt · <a href="mailto:hello@mzfortech.com">hello@mzfortech.com</a></p>
    <nav aria-label="Footer"><Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/about">About</Link><Link href="/work">Work</Link><Link href="/research">Research</Link><Link href="/contact">Contact</Link><a href={LINKEDIN_URL} rel="me">LinkedIn</a><a href="/ar" lang="ar" hrefLang="ar">العربية</a><Link href="/privacy">Privacy</Link><a href="/llms.txt" rel="alternate" type="text/plain">AI-readable overview</a></nav>
    <details><summary>Explore our services</summary><ul>{SERVICE_GUIDES.map((guide) => <li key={guide.slug}><Link href={`/services/${guide.slug}`}>{guide.title}</Link></li>)}</ul></details>
  </footer>;
}
