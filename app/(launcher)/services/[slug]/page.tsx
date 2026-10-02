import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SERVICE_PAGES } from '@/lib/service-pages';
import { pageMetadata } from '@/lib/seo';
import styles from '@/components/CompanyContent/CompanyContent.module.css';

export function generateStaticParams() { return SERVICE_PAGES.map(({ slug }) => ({ slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = SERVICE_PAGES.find(item => item.slug === slug);
  if (!service) notFound();
  return pageMetadata({ title: service.title, description: service.description, path: `/services/${slug}` });
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = SERVICE_PAGES.find(item => item.slug === slug);
  if (!service) notFound();
  const url = `https://www.mzfortech.com/services/${slug}`;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Service', '@id': `${url}#service`, name: service.title.split(' | ')[0], description: service.description, url, provider: { '@id': 'https://www.mzfortech.com/#organization' } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mzfortech.com/' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.mzfortech.com/services' },
      { '@type': 'ListItem', position: 3, name: service.title.split(' | ')[0], item: url },
    ] },
  ] };
  return <article className={styles.content}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <nav aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/services">Services</Link> / {service.title.split(' | ')[0]}</nav>
    <h1>{service.heading}</h1><p>{service.intro}</p>
    <div className={styles.actions}><Link href="/contact">Discuss your project →</Link></div>
    <section><h2>When this service fits</h2><ul>{service.problems.map(text => <li key={text}>{text}</li>)}</ul></section>
    <section><h2>What we can deliver</h2><ul>{service.deliverables.map(text => <li key={text}>{text}</li>)}</ul></section>
    <section><h2>How the engagement works</h2><ol>{service.process.map(text => <li key={text}>{text}</li>)}</ol></section>
    <section><h2>Related work and evidence</h2><p><Link href={service.evidence.href}>{service.evidence.label}</Link></p><p>{service.evidence.context}</p></section>
    <section><h2>Practical limits</h2><p>{service.limitations}</p></section>
    <section><h2>Common questions</h2>{service.faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
    <section><h2>Related services</h2><ul>{service.related.map(related => <li key={related}><Link href={`/services/${related}`}>{SERVICE_PAGES.find(item => item.slug === related)!.title.split(' | ')[0]}</Link></li>)}</ul></section>
    <section><h2>Tell us what you want to build</h2><p>Share your workflow, users, constraints and desired outcome. We will discuss scope and next steps.</p><p><Link href="/contact">Send a project brief</Link> or <a href="mailto:hello@mzfortech.com">hello@mzfortech.com</a>.</p></section>
  </article>;
}
