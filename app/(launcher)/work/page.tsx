import { pageMetadata } from "@/lib/seo";
import { WorkShelf } from "@/components/sections/WorkShelf";
import Link from 'next/link';
import styles from '@/components/CompanyContent/CompanyContent.module.css';

export const metadata = pageMetadata({
  title: "Software Projects & Case Studies | MZ for Tech",
  description:
    "Explore MZ's client work, software products and development demos, with clear project scope and delivery context.",
  path: "/work",
});

/**
 * Work — every project, on one shelf.
 *
 * This absorbed the old Products tab. Splitting client work from proprietary
 * products implied the studio had shipped client work before it had, and it
 * made one product look like two separate things. One collection, one
 * selection model, one stage.
 */
export default function WorkPanel() {
  return <><WorkShelf /><div className={`${styles.content} ${styles.catalogue}`}>
    <h1>Selected projects and case studies.</h1><p>Explore client work, company products and demonstrations. Project availability and scope are stated separately from measured outcomes.</p>
    <section><h2>Client website work</h2><article><h3><Link href="/work/nested-united">Nested United</Link></h3><p>A multi-brand website bringing five specialist brands into a coherent web experience. The existing case study documents the delivered website, component structure and motion work, with screenshots and a link to the client site.</p><Link href="/services/web-development">Related service: web development</Link></article></section>
    <section><h2>Company products</h2><div className={styles.grid}>
      <article><h3><a href="https://misura.mzfortech.com">Misura ↗</a></h3><p>Statistical-analysis product by MZ. Current features and availability should be confirmed with the team before an engagement.</p></article>
      <article><h3>Z Studio</h3><p>Product-configuration work by MZ. Contact us for its current scope and availability.</p><Link href="/contact">Ask about Z Studio</Link></article>
    </div></section>
    <section><h2>Demonstrations</h2><article><h3><a href="https://zstore.mzfortech.com">ZStore ↗</a></h3><p>A fictional e-commerce storefront built to demonstrate interface and shopping-flow possibilities. It is a demonstration, not a real merchant or commercial client.</p></article></section>
    <section><h2>Research</h2><p><Link href="/research">The Null Hypothesis</Link> publishes original essays and experiments. Research findings are presented in the context of their methods and datasets.</p></section>
    <section><h2>Discuss a similar project</h2><Link href="/contact">Tell us what you want to build →</Link></section>
  </div></>;
}
