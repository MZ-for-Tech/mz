import type { Metadata } from "next";
import IntelPanel from "./IntelPanel";

export const metadata: Metadata = {
  title: "MZ | Intel",
  description:
    "How we think — systems, statistics, sustainability, and the research that doesn't stay internal.",
};

/**
 * Intel: who we are, how we think, and where the research goes.
 *
 * The expanding research portal (ScrollExpand + DataStream canvas) from the
 * old homepage is not ported yet — for now the research lives as a direct
 * link out to nullhypothesis.dev.
 */
export default function IntelPage() {
  return <IntelPanel />;
}
