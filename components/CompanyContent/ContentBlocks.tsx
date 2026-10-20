import Link from "next/link";
import { SERVICES_FAQ, WORKFLOW } from "@/lib/company-content";
import styles from "./CompanyContent.module.css";

export function Workflow() {
  return <section><h2>How we work</h2><ol className={styles.steps}>{WORKFLOW.map((step) => <li key={step.title}><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol></section>;
}

export function FAQ({ items = SERVICES_FAQ }: { items?: typeof SERVICES_FAQ }) {
  return <section><h2>Frequently asked questions</h2>{items.map((item) => <div className={styles.faq} key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}</section>;
}

export function ProjectCTA() {
  return <section><h2>Tell us what you&apos;re building</h2><p>Describe the work, your users and the constraints that matter. Model Zero can help define the next practical step.</p><div className={styles.actions}><Link href="/contact">Start a project</Link><Link href="/work">See our work</Link></div></section>;
}
