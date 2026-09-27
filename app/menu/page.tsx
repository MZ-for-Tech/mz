import { permanentRedirect } from "next/navigation";
import { LAUNCHER_ROOT } from "@/lib/nav";

/**
 * /menu is gone. The launcher pages are flat now: /home, /work, /services,
 * /intel, /contact.
 *
 * The `/menu` segment named our navigation model rather than anything about
 * the page, so it appeared in every shareable link and every search result on
 * the site without telling a visitor anything they could not read off the
 * tab they clicked. The pages were moved into a route group
 * (`app/(launcher)`) precisely so flattening them changes no code except the
 * links.
 *
 * This file exists only to keep the old URLs from 404ing. They are already
 * shared and indexed, so the redirect is PERMANENT (308) — a 307 would tell a
 * search engine the move is temporary and it would keep the old URL in its
 * index, leaving the two competing. Next.js exports 308 as
 * `permanentRedirect`.
 */
export default function MenuRedirect() {
  permanentRedirect(LAUNCHER_ROOT);
}
