import { LAUNCHER_ROOT } from "@/lib/nav";

/**
 * Cross-route navigation intent for launcher, legacy pages, and Research.
 *
 * Module-level state on purpose: it has to outlive the page component that
 * sets it and be readable from app/template.tsx (which remounts on every
 * navigation) and components/TransitionLink (which runs before the navigation
 * commits). React state would not survive either.
 *
 * The route policy has three transition cases:
 *
 *   - Launcher pages move between each other without a wipe.
 *   - Research entry is handled by its own skeleton loader. Leaving Research
 *     uses the olive/dark column wipe.
 *   - Other cross-world navigation uses the signature column wipe.
 *
 * Research destinations are handled first so the research skeleton can own
 * entry, including direct loads. Everything else keeps the existing launcher
 * and legacy transition rules.
 *
 * THE LAUNCHER LIST IS ENUMERATED, NOT GUESSED
 *
 * The obvious version of this is `pathname !== "/privacy"`, or a check for a
 * `/menu` prefix — both of which were the shape of the bug. `/work` means two
 * different things in two different worlds: the shelf (launcher) and
 * /work/nested-united (legacy, its own chrome and its own wipe). A prefix test
 * cannot tell those apart, and guessing would hand the case study the
 * launcher's crossfade — the transition it never had.
 *
 * So the paths are listed, and `LAUNCHER_ROOT` comes from lib/nav rather than
 * being written here, because the shell and this module have to agree on what
 * the launcher's home page is called. A sixth panel is one line in one file.
 *
 * `/` is in the list too, and is the splash as much as anything else: Esc
 * from any panel lands there, and it has to be a launcher-world arrival or
 * the exit from the launcher would play the legacy column wipe over the
 * splash.
 */

/** Paths that belong to the start-screen / launcher world. */
const LAUNCHER_PATHS = [
  "/",
  LAUNCHER_ROOT,
  "/work",
  "/services",
  "/intel",
  "/contact",
];

export function isLauncherPath(pathname: string): boolean {
  return LAUNCHER_PATHS.includes(pathname) || pathname.startsWith('/services/');
}

/** Paths owned by the standalone Research experience. */
export function isResearchPath(pathname: string): boolean {
  return pathname === "/research" || pathname.startsWith("/research/");
}

/**
 * Should the column wipe play for a navigation from `from` to `to`?
 * `from === null` means there is no previous route. Research entry uses its
 * own skeleton; leaving Research and other cross-world routes use the wipe.
 */
export function wantsWipe(from: string | null, to: string): boolean {
  // Research supplies its own entrance skeleton, including on a cold load.
  if (isResearchPath(to)) return false;

  // Leaving Research is a portal exit, so cover it with the site wipe.
  if (from !== null && isResearchPath(from)) return true;

  if (from === null) return true;
  return !(isLauncherPath(to) && isLauncherPath(from));
}

/**
 * Template calls this once per navigation to record where we came from.
 * Returns whether the wipe should play, and updates the cursor.
 */
export function takeWipeDecision(nextPath: string): boolean {
  const previous = lastPath;
  lastPath = nextPath;
  return wantsWipe(previous, nextPath);
}

let lastPath: string | null = null;

/**
 * True exactly once: the very first time the start screen is rendered in this
 * session. Every later visit to `/` (Escape, browser back, the logo link) is a
 * "return" and should replay the hero intro with compressed delays instead of
 * the full cold-load choreography.
 */
let firstStartRender = true;
export function isStartScreenFirstRender(): boolean {
  const value = firstStartRender;
  firstStartRender = false;
  return value;
}
