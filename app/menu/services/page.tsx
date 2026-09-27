import { permanentRedirect } from "next/navigation";

/**
 * /menu/services → /services. See app/menu/page.tsx for why these redirects
 * are permanent rather than temporary.
 */
export default function MenuServicesRedirect() {
  permanentRedirect("/services");
}
