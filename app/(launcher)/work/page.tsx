import { pageMetadata } from "@/lib/seo";
import { WorkShelf } from "@/components/sections/WorkShelf";
import Link from "next/link";
import { PROJECTS } from "@/lib/projects";
import styles from "@/components/CompanyContent/CompanyContent.module.css";

export const metadata = pageMetadata({
  title: "Projects & Case Studies",
  description:
    "Explore software projects and products by Model Zero in Cairo, including the Nested United web platform, the FEPS events system and demonstration builds.",
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
  return <><header className={styles.content} style={{ background: "rgba(13, 15, 8, .94)" }}><h1>Projects &amp; case studies</h1><p>Model Zero (MZ) builds client systems and its own products. Explore the catalog below; demonstration builds are labeled separately.</p></header><WorkShelf /><section className={styles.content} style={{ background: "rgba(13, 15, 8, .94)" }}><h2>Selected work and products</h2><div className={styles.grid}>{PROJECTS.filter((project) => project.showOnWorkShelf !== false).map((project) => <article key={project.slug} className={styles.card}><h3>{project.name}{project.kind === "demo" ? " — Demo" : ""}</h3><p>{project.kind === "product" ? "Model Zero product" : project.kind === "demo" ? "Demonstration build" : "Client work"} · {project.category}</p>{project.description && <p>{project.description}</p>}<div className={styles.actions}>{project.hasCaseStudy && <Link href={`/work/${project.slug}`}>Read the case study</Link>}{project.link && <a href={project.link}>Open {project.name}</a>}<Link href="/contact">Discuss a related project</Link></div></article>)}</div><div className={styles.actions}><Link href="/services">Explore our services</Link><Link href="/research">Read the research</Link></div></section></>;
}
