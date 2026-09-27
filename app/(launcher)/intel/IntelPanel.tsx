"use client";

import PremiumShowcase from "@/components/PremiumShowcase/PremiumShowcase";

/**
 * Client half of the Intel panel. PremiumShowcase pulls in GradualBlur, which
 * uses hooks without its own "use client" — it only ever worked because the
 * old homepage was a client component. Splitting here keeps the panel route a
 * server component so it can export metadata.
 *
 * The manifesto that used to close this panel is gone, and its absence is the
 * point rather than a gap. "We don't just write code. We engineer customized
 * systems designed for scale, rooted in statistical rigor, and built to
 * outlast the hype" was a full-screen statement doing the work of an About
 * page, on a tab that had nothing else to say. Once this panel carries what MZ
 * actually is, why it exists, and who is behind it, a slogan in huge type
 * reads as the thing it was: a placeholder. PremiumShowcase's own copy is in
 * the same register and is the remaining half of that debt.
 *
 * The "Our research doesn't stay internal" card used to close this panel. It
 * was an expanding title — a pattern that needs a full panel to itself, and
 * here it was one more rectangle below two others, so it did not read as an
 * invitation to open. The line itself is good, so it now lives on the Intel
 * card on the launcher home, where it is a headline rather than a widget.
 */
export default function IntelPanel() {
  return <PremiumShowcase />;
}
