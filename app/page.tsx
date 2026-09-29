import { pageMetadata } from "@/lib/seo";
import StartScreen from "./StartScreen";

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.mzfortech.com/#organization",
      name: "Model Zero for Technology Solutions",
      alternateName: "MZ",
      url: "https://www.mzfortech.com/",
      logo: "https://www.mzfortech.com/mz.svg",
      email: "hello@mzfortech.com",
      description:
        "Model Zero for Technology Solutions (MZ) is a Cairo-based software and AI company. It builds custom systems and trains teams to run them, informed by applied research.",
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
      name: "Model Zero for Technology Solutions",
      inLanguage: "en",
      publisher: { "@id": "https://www.mzfortech.com/#organization" },
    },
  ],
};

export const metadata = pageMetadata({
  title: "Model Zero for Technology Solutions",
  description:
    "Model Zero for Technology Solutions (MZ) is a Cairo-based software and AI company. It builds custom systems and trains teams to run them, informed by applied research.",
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
      <StartScreen />
    </>
  );
}
