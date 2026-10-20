import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { SERVICE_GUIDES, offeringsForGuide, faqForGuide } from "@/lib/service-guides";
import { CONTENT_UPDATED } from "@/lib/company-content";
import { FAQ, ProjectCTA, Workflow } from "@/components/CompanyContent/ContentBlocks";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, faqSchema, graph, serviceSchema } from "@/lib/structured-data";
import styles from "@/components/CompanyContent/CompanyContent.module.css";

export function generateStaticParams() { return SERVICE_GUIDES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = SERVICE_GUIDES.find((item) => item.slug === slug);
  if (!guide) return {};
  return pageMetadata({ title: guide.title, description: guide.description, path: `/services/${slug}` });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = SERVICE_GUIDES.find((item) => item.slug === slug);
  if (!guide) notFound();
  const path = `/services/${slug}`;
  const faqs = faqForGuide(slug);
  return <article className={styles.content}>
    <JsonLd data={graph([serviceSchema(path, guide.title, guide.intro), faqSchema(path, faqs), breadcrumbs(path, guide.title, { path: "/services", name: "Services" })])} />
    <nav aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/services">Services</Link> / {guide.title}</nav>
    <p className={styles.eyebrow}>MODEL ZERO / SERVICES</p><h1>{guide.heading}</h1><p>{guide.intro}</p><time dateTime={CONTENT_UPDATED}>Updated 20 October 2026</time>
    <section><h2>Planning {guide.heading.toLowerCase()}</h2>{guide.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
    <section><h2>What the engagement covers</h2>{offeringsForGuide(slug).map((offering) => <article key={offering.name} className={styles.faq}><h3>{offering.name}</h3><p>{offering.text}</p><p><strong>Who it is for:</strong> {offering.audience}</p><p><strong>Deliverables:</strong> {offering.deliverables}</p><p><strong>Timing:</strong> {offering.timing}</p></article>)}</section>
    <section><h2>Scoping the first useful step</h2><p>Bring the existing workflow, representative material and the people who will review the result into the first conversation. We discuss the intended outcome, current tools, data access and any launch constraints. Those inputs help distinguish a defined implementation from an investigation that needs an initial feasibility stage.</p><p>The proposal records deliverables, responsibilities and review points. Changes to data, integrations or requirements can change the scope, so we discuss them before extending the work. Budget and timing are agreed for the engagement. Documentation, training and the precise handover scope are included in that discussion.</p><Link href={guide.proof}>{guide.proofLabel}</Link></section>
    <Workflow compact /><FAQ items={faqs} />
    <section><h2>Related services and research</h2><ul>{SERVICE_GUIDES.filter((item) => item.slug !== slug).map((item) => <li key={item.slug}><Link href={`/services/${item.slug}`}>{item.title}</Link></li>)}</ul><Link href="/research">The Null Hypothesis: applied research by Model Zero</Link></section>
    <ProjectCTA />
  </article>;
}
