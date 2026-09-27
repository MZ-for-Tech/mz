import type { Metadata } from "next";
import MenuShell from "@/components/MenuShell/MenuShell";

/**
 * The launcher shell, mounted across every launcher route.
 *
 * A route group, so these pages are `/work`, `/services`, `/intel`,
 * `/contact` and `/home` at the top level — the group name appears in no URL.
 * It exists to hold the shared layout while keeping the segments flat, which
 * is the whole point: the routes a visitor sees and the routes they link to
 * are the same three words.
 *
 * Metadata is a layout default, not a page identity — each panel page exports
 * its own title. The description still says "launcher" because that is what
 * this collection of pages is, and a visitor landing on /contact is landing
 * on one part of it.
 */
export const metadata: Metadata = {
  title: "MZ",
  description:
    "MZ is a research-driven technology studio in Cairo. Selected work, services, research and contact.",
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  // Server component on purpose: this is where route metadata lives. The
  // interactive shell (tabs, keyboard nav, converge-in) is the client child.
  return <MenuShell>{children}</MenuShell>;
}
