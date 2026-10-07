import { pageMetadata } from "@/lib/seo";
import ContactPanel from "./ContactPanel";

export const metadata = pageMetadata({
  title: "Contact MZ",
  description:
    "Contact Model Zero for Technology Solutions in Cairo about custom software, AI deployment, or Arabic OCR.",
  path: "/contact",
});

/**
 * Contact — the project brief, as a launcher panel.
 *
 * The brief lives inside the launcher shell, so its background and navigation
 * stay present while a visitor fills it in.
 */
export default function ContactRoute() {
  return <ContactPanel />;
}
