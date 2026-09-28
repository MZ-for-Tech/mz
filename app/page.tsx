import { pageMetadata } from "@/lib/seo";
import StartScreen from "./StartScreen";

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://mzfortech.com/#organization",
      name: "MZ",
      alternateName: "MZ for Tech Solutions",
      url: "https://mzfortech.com/",
      logo: "https://mzfortech.com/mz.svg",
      email: "hello@mzfortech.com",
      description:
        "MZ is a technology engineering studio based in Cairo, Egypt. It builds software and proprietary systems, conducts applied research, and transfers the knowledge clients need to operate what is built.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Cairo",
        addressCountry: "EG",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://mzfortech.com/#website",
      url: "https://mzfortech.com/",
      name: "MZ — Research, Software and Knowledge",
      inLanguage: "en",
      publisher: { "@id": "https://mzfortech.com/#organization" },
    },
  ],
};

export const metadata = pageMetadata({
  title: "Research, Software and Knowledge",
  description:
    "MZ is a technology engineering studio in Cairo, Egypt, building software and proprietary systems and sharing the research and knowledge behind them.",
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
