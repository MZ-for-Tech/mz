import { COMPANY_SUMMARY, ENTITY_DEFINITION, OFFERINGS, ORGANIZATION_ID, SITE } from "./company-content";
import { graph } from "./structured-data";

export const LINKEDIN_URL = "https://www.linkedin.com/company/mzfortech";
export const SITE_GRAPH = graph([
  {
    "@type": ["Organization", "ProfessionalService"], "@id": ORGANIZATION_ID,
    name: "Model Zero", alternateName: ["MZ", "Model Zero for Technological Solutions", "MZ for Tech", "mzfortech", "موديل زيرو", "موديل زيرو للحلول التكنولوجية"],
    legalName: "Model Zero for Technological Solutions", url: `${SITE}/`,
    logo: { "@type": "ImageObject", url: `${SITE}/model-zero-logo.png`, width: 512, height: 512 },
    description: `${ENTITY_DEFINITION} ${COMPANY_SUMMARY}`, foundingDate: "2026", email: "hello@mzfortech.com",
    address: { "@type": "PostalAddress", addressLocality: "Cairo", addressRegion: "Cairo Governorate", addressCountry: "EG" },
    areaServed: { "@type": "Country", name: "Egypt" }, knowsLanguage: ["en", "ar"], knowsAbout: OFFERINGS.map((item) => item.name),
    sameAs: ["https://facebook.com/mzfortech", "https://x.com/mzfortech", "https://instagram.com/mzfortech", LINKEDIN_URL],
    hasOfferCatalog: { "@id": `${SITE}/services#catalog` },
  },
  { "@type": "WebSite", "@id": `${SITE}/#website`, url: `${SITE}/`, name: "Model Zero", alternateName: "MZ", publisher: { "@id": ORGANIZATION_ID }, inLanguage: ["en", "ar"] },
  { "@type": "Periodical", "@id": `${SITE}/research#publication`, name: "The Null Hypothesis", url: `${SITE}/research`, publisher: { "@id": ORGANIZATION_ID }, inLanguage: ["en", "ar"] },
]);
