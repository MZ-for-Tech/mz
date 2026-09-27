import type { Metadata } from "next";
import ServicesPanel from "./ServicesPanel";

export const metadata: Metadata = {
  title: "MZ | Services",
  description: "Three pillars, one team — Build, Deploy, Teach.",
};

/**
 * Services — the capability list, as a launcher panel.
 *
 * This route used to hand its whole body to a `next/dynamic` client import
 * with `ssr: false`, because the bento behind it was three WebGL contexts
 * that could not be server-rendered and had no meaningful HTML. The panel is
 * now plain type, so it server-renders: the page ships no JavaScript for
 * this section at all, and the content is in the HTML for anything reading
 * it that isn't a browser.
 */
export default function ServicesPage() {
  return <ServicesPanel />;
}
