import { ORGANIZATION_ID, SERVICES_FAQ, SITE } from "./company-content";

export function graph(nodes: Record<string, unknown>[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export function breadcrumbs(path: string, name: string, parent?: { path: string; name: string }) {
  const entries = [{ path: "/", name: "Home" }, ...(parent ? [parent] : []), { path, name }];
  return { "@type": "BreadcrumbList", "@id": `${SITE}${path}#breadcrumbs`, itemListElement: entries.map((entry, index) => ({ "@type": "ListItem", position: index + 1, name: entry.name, item: `${SITE}${entry.path}` })) };
}

export function faqSchema(path: string, items = SERVICES_FAQ) {
  return { "@type": "FAQPage", "@id": `${SITE}${path}#faq`, mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
}

export function serviceSchema(path: string, name: string, description: string, id = "service") {
  return { "@type": "Service", "@id": `${SITE}${path}#${id}`, name, description, serviceType: name, provider: { "@id": ORGANIZATION_ID }, areaServed: { "@type": "Country", name: "Egypt" }, url: `${SITE}${path}` };
}
