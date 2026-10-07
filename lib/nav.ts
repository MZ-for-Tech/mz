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
 * Products is gone: it was merged into Work. Having a "client work" tab and
 * a "products" tab alongside each other implied a track record the studio
 * doesn't have yet.
 *
 * These paths are flat and they say what they are. The old route structure
 * added a segment naming the navigation model rather than anything about the
 * page. `/work` says what a visitor came for. `LAUNCHER_ROOT` is the one
 * exception: the splash owns `/`, so the launcher's home page is `/home`—the
 * hub the other four tabs hang off.
 *
 * Order is the reading order of the shell and is hand-maintained, because a
 * home tab that drifts to the end of its own list is a bug no amount of data
 * modelling would prevent.
 */
export const LAUNCHER_ROOT = "/home";

export const MENU_TABS: MenuTab[] = [
  { label: "Home", href: LAUNCHER_ROOT },
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Intel", href: "/intel" },
  { label: "Contact", href: "/contact" },
];
