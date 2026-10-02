import { pageMetadata } from "@/lib/seo";
import ServicesPanel from "./ServicesPanel";
import ServiceLinks from '@/components/CompanyContent/ServiceLinks';
import styles from '@/components/CompanyContent/CompanyContent.module.css';

export const metadata = pageMetadata({
  title: "Software, AI & Training Services | MZ for Tech",
  description:
    "Explore MZ's software engineering, web development, internal business systems, applied AI and team training services.",
  path: "/services",
});

/**
 * Services — the capability list, as a launcher panel.
 *
 * This route used to hand its whole body to a `next/dynamic` client import
 * with `ssr: false`, because the bento behind it was three WebGL contexts
 * that could not be server-rendered and had no meaningful HTML. The panel is
 * now plain type, so it server-renders: the page ships no JavaScript for
 * this section at all, and the content is in the HTML for anything reading
 * it that isn't a browser.
 */
export default function ServicesPage() {
  return <><ServicesPanel /><section className={styles.content} aria-labelledby="service-details"><h2 id="service-details">Find the right service for your project</h2><p>Start with the workflow or customer problem. Explore the deliverables, process and limits of each service, then share your goals with our Cairo-based team.</p><ServiceLinks /></section></>;
}
