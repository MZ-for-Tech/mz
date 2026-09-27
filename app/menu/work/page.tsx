import { permanentRedirect } from "next/navigation";

/**
 * /menu/work → /work. See app/menu/page.tsx for why these redirects are
 * permanent rather than temporary.
 */
export default function MenuWorkRedirect() {
  permanentRedirect("/work");
}
