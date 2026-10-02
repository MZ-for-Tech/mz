import { pageMetadata } from "@/lib/seo";
import IntelPanel from "./IntelPanel";
import Link from 'next/link';
import styles from '@/components/CompanyContent/CompanyContent.module.css';

export const metadata = pageMetadata({
  title: "About MZ for Tech | Software & AI in Cairo",
  description:
    "Learn about MZ, a Cairo-based software and AI company building custom systems and training teams to run them, informed by applied research.",
  path: "/intel",
});

/**
 * Intel: who we are, how we think, and where the research goes.
 *
 * The research publication lives at /research.
 */
export default function IntelPage() {
  return <><IntelPanel /><div className={styles.content}>
    <section><h2>Model Zero for Technology Solutions</h2><p>MZ for Tech is the public brand of Model Zero for Technology Solutions, based in Cairo, Egypt. We build custom software, websites and e-commerce, ERP and internal systems, and applied AI. Training and workshops help client teams operate the work we deliver.</p><p>Our priority audiences are businesses and institutions in Egypt and Saudi Arabia.</p></section>
    <section><h2>How we work</h2><p>Discovery establishes the users, workflows and constraints. Implementation proceeds through working increments and agreed acceptance criteria. Handover covers documentation, operational ownership and training; ongoing support is agreed for the project.</p><p>Research informs how we evaluate systems and examine tradeoffs. It also helps us explain where a method is useful and where it needs further evidence.</p><Link href="/services">Explore our services</Link></section>
    <section><h2>Public work and research</h2><p>The <Link href="/work/nested-united">Nested United case study</Link> describes our multi-brand website work. <Link href="/research">The Null Hypothesis</Link> publishes research essays and experiments with named authors, methods and supporting sources.</p><p>See the individual publications for their author credits and contributions.</p></section>
    <section><h2>Contact our Cairo-based team</h2><p><Link href="/contact">Tell us about your project</Link> or email <a href="mailto:hello@mzfortech.com">hello@mzfortech.com</a>.</p></section>
  </div></>;
}
