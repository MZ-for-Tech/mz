export type MenuTab = {
  label: string;
  href: string;
};

/**
 * The launcher's sections — the single source of truth for navigation.
 *
 * This used to be two independent hardcoded lists (MENU_TABS in MenuShell,
 * NAV_ITEMS here) that had already drifted: Intel and Home existed in one and
 * not the other. NAV_ITEMS existed only to feed the nav pill, which is now
 * deleted, so MENU_TABS stands alone.
 *
 * Products is gone: it was merged into Work. Occhio never shipped, and having
 * a "client work" tab and a "products" tab alongside each other implied a
 * track record the studio doesn't have yet.
 *
 * These paths are flat and they say what they are. They used to be
 * `/menu/work`, `/menu/services` and so on — a segment that named the
 * navigation model rather than anything about the page, so every shareable
 * link, every bookmark and every search result carried a word that meant
 * "we built our site as a console launcher". `/work` says what a visitor
 * came for. `LAUNCHER_ROOT` is the one exception: the splash owns `/`, so the
 * launcher's home page is `/home`, which is slightly awkward but is the
 * honest name for what it is — the hub the other four tabs hang off.
 *
 * Order is the reading order of the shell and is hand-maintained, because a
 * home tab that drifts to the end of its own list is a bug no amount of data
 * modelling would prevent.
 */
export const LAUNCHER_ROOT = "/";

export const MENU_TABS: MenuTab[] = [
  { label: "Home", href: LAUNCHER_ROOT },
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/intel" },
  { label: "Contact", href: "/contact" },
];
