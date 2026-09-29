import { pageMetadata } from "@/lib/seo";
import IntelPanel from "./IntelPanel";

export const metadata = pageMetadata({
  title: "About MZ",
  description:
    "Learn about MZ, a Cairo-based software and AI company building custom systems and training teams to run them, informed by applied research.",
  path: "/intel",
});

/**
 * Intel: who we are, how we think, and where the research goes.
 *
 * The research publication lives at /research.
 */
export default function IntelPage() {
  return <IntelPanel />;
}
