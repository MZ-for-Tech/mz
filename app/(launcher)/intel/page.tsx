import { pageMetadata } from "@/lib/seo";
import IntelPanel from "./IntelPanel";

export const metadata = pageMetadata({
  title: "About MZ",
  description:
    "Learn about MZ's approach to research, software engineering, and knowledge transfer from its Cairo, Egypt studio.",
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
