import { pageMetadata } from "@/lib/seo";
import ContactPanel from "./ContactPanel";

export const metadata = pageMetadata({
  title: "Contact MZ for Tech | Discuss Your Project",
  description:
    "Tell MZ about your software, website, business-system, AI or training project. Contact our Cairo-based team to discuss scope and next steps.",
  path: "/contact",
});

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
