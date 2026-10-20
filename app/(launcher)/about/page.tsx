import { pageMetadata } from "@/lib/seo";
import AboutPanel from "./AboutPanel";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Learn about MZ, a Cairo-based software and AI company building custom systems and training teams to run them, informed by applied research.",
  path: "/about",
});

/**
 * About: who we are, how we think, and where the research goes.
 *
 * The research publication lives at /research.
 */
export default function AboutPage() {
  return <AboutPanel />;
}
