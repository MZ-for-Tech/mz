import type { Metadata } from "next";
import ContactPanel from "./ContactPanel";

export const metadata: Metadata = {
  title: "MZ | Contact",
  description: "Tell us what you're building. We'll tell you what it's missing.",
};

/**
 * Contact — the project brief, as a launcher panel.
 *
 * This used to be a CTA that bounced visitors out to /start, which is a
 * different world entirely: the column wipe played, the shared background
 * died, and they landed on a page styled like a different site. The brief is
 * the single most likely thing a visitor wants, so it now lives here, inside
 * the shell, and every part of the launcher stays alive around it.
 */
export default function ContactRoute() {
  return <ContactPanel />;
}
