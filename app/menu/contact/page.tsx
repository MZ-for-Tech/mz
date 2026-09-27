import { permanentRedirect } from "next/navigation";

/**
 * /menu/contact → /contact. See app/menu/page.tsx for why these redirects are
 * permanent rather than temporary.
 */
export default function MenuContactRedirect() {
  permanentRedirect("/contact");
}
