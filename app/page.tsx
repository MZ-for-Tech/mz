import { pageMetadata } from "@/lib/seo";
import StartScreen from "./StartScreen";
import HomeFeatured from "@/components/sections/HomeFeatured";
import MenuShell from "@/components/MenuShell/MenuShell";

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.mzfortech.com/#organization",
      name: "Model Zero",
      alternateName: "MZ",
      url: "https://www.mzfortech.com/",
      logo: "https://www.mzfortech.com/model-zero-logo.svg",
      email: "hello@mzfortech.com",
      description:
        "Model Zero (MZ) builds software and AI in Cairo, then trains teams to run it. Applied research informs the work.",
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
      name: "Model Zero",
      inLanguage: "en",
      publisher: { "@id": "https://www.mzfortech.com/#organization" },
    },
  ],
};

export const metadata = pageMetadata({
  title: "Model Zero — Software & AI Company in Cairo",
  description:
    "Model Zero (MZ) builds software and AI in Cairo, then trains teams to run it. Applied research informs the work.",
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
      <MenuShell><div id="featured"><HomeFeatured /></div></MenuShell>
    </>
  );
}
