import { pageMetadata } from "@/lib/seo";
import AboutContent from "@/components/CompanyContent/AboutContent";

export const metadata = pageMetadata({
  title: "About Model Zero — Software & AI in Cairo",
  description:
    "Model Zero is a Cairo-based software and AI company founded in 2026. We build custom systems, publish applied research and train teams to run what we build.",
  path: "/about",
});

/**
 * About: who we are, how we think, and where the research goes.
 *
 * The research publication lives at /research.
 */
export default function AboutPage() {
  return <AboutContent />;
}
