import { permanentRedirect } from "next/navigation";

/**
 * /start is gone — the project brief now lives at /menu/contact, inside the
 * launcher, where the background and keyboard navigation stay alive.
 *
 * This redirect exists so every old inbound reference keeps working: the
 * launcher's own links, the case study CTA, the WebMCP tool, and any URL
 * already indexed or bookmarked.
 */
export default function StartRedirect() {
  permanentRedirect("/contact");
}
