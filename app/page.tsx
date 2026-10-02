import { pageMetadata } from "@/lib/seo";
import MenuShell from '@/components/MenuShell/MenuShell';
import HomeFeatured from '@/components/CompanyContent/HomeFeatured';
import ServiceLinks from '@/components/CompanyContent/ServiceLinks';
import styles from '@/components/CompanyContent/CompanyContent.module.css';
import Link from 'next/link';

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.mzfortech.com/#organization",
      name: "MZ for Tech",
      legalName: "Model Zero for Technology Solutions",
      alternateName: ["MZ", "Modelzero"],
      url: "https://www.mzfortech.com/",
      logo: "https://www.mzfortech.com/mz.svg",
      email: "hello@mzfortech.com",
      description:
        "Model Zero for Technology Solutions (MZ) builds software and AI in Cairo, then trains teams to run it. Applied research informs the work.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Cairo",
        addressCountry: "EG",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.mzfortech.com/#website",
      url: "https://www.mzfortech.com/",
      name: "MZ for Tech",
      inLanguage: "en",
      publisher: { "@id": "https://www.mzfortech.com/#organization" },
    },
  ],
};

export const metadata = pageMetadata({
  title: "Software & AI Development in Cairo | MZ for Tech",
  description:
    "MZ for Tech builds custom software, websites, business systems and applied AI in Cairo, with training that helps your team run what we deliver.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(siteStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <MenuShell>
        <div className={styles.content}>
          <p className={styles.eyebrow}>MZ for Tech · Research. Software. Knowledge.</p>
          <h1>Custom software and applied AI, built in Cairo.</h1>
          <p>MZ for Tech is the public brand of Model Zero for Technology Solutions. We build websites, e-commerce, custom applications, ERP and internal systems, and applied AI. We train client teams to operate what we deliver.</p>
          <p>Based in Cairo, Egypt, we focus on the needs of businesses and institutions in Egypt and Saudi Arabia.</p>
          <div className={styles.actions}><Link href="/contact">Discuss your project →</Link><Link href="/intel">About MZ for Tech</Link></div>
          <section><h2>Software, AI and knowledge transfer</h2><ServiceLinks /></section>
          <section><h2>From research to delivery</h2><p>We begin with the problem, agree what a useful result looks like, then build and evaluate working increments. Documentation and training help your team take ownership. Support is scoped to the project.</p><Link href="/services/knowledge-transfer">Explore team handover and workshops</Link></section>
        </div>
        <HomeFeatured />
        <div className={styles.content}>
          <section><h2>Work, products and demonstrations</h2><p><Link href="/work/nested-united">Nested United</Link> brings five specialist brands into one website through information structure, reusable components and motion.</p><p><a href="https://misura.mzfortech.com">Misura</a> is our statistical-analysis product. Contact us for current features and availability. Z Studio is product-configuration work; discuss its current availability with the team. <a href="https://zstore.mzfortech.com">ZStore</a> is a fictional e-commerce demonstration.</p><Link href="/work">Explore the project catalogue</Link></section>
          <section><h2>The Null Hypothesis</h2><p>Our research publication shares methods, experiments and sources. Read <Link href="/research/essays/the-measure-and-the-target">The Measure and the Target</Link> on metrics and optimization, or the <Link href="/research/papers/vgg19-bloodmnist-compression">VGG19 compression study on BloodMNIST</Link>.</p><Link href="/research">Read our research</Link> · <Link href="/research/ar" lang="ar">الأبحاث بالعربية</Link></section>
          <section><h2>Tell us what you want to build</h2><p>Share your goals, existing systems and constraints with our Cairo-based team.</p><p><Link href="/contact">Send a project brief</Link> or email <a href="mailto:hello@mzfortech.com">hello@mzfortech.com</a>.</p></section>
        </div>
      </MenuShell>
    </>
  );
}
