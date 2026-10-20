import { pageMetadata } from "@/lib/seo";
import ContactPanel from "./ContactPanel";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, graph } from "@/lib/structured-data";
import { ORGANIZATION_ID, SITE } from "@/lib/company-content";

export const metadata = pageMetadata({
  title: "Contact MZ",
  description:
    "Contact Model Zero in Cairo about custom software, AI deployment, or Arabic OCR.",
  path: "/contact",
});

/**
 * Contact — the project brief, as a launcher panel.
 *
 * The brief lives inside the launcher shell, so its background and navigation
 * stay present while a visitor fills it in.
 */
export default function ContactRoute() {
  return <><JsonLd data={graph([{ "@type": "ContactPage", "@id": `${SITE}/contact#page`, url: `${SITE}/contact`, about: { "@id": ORGANIZATION_ID } }, breadcrumbs("/contact", "Contact")])} /><ContactPanel /></>;
}
