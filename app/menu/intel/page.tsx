import { permanentRedirect } from "next/navigation";

/**
 * /menu/intel → /intel. See app/menu/page.tsx for why these redirects are
 * permanent rather than temporary.
 */
export default function MenuIntelRedirect() {
  permanentRedirect("/intel");
}
