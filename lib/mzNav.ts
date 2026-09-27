import { LAUNCHER_ROOT } from "@/lib/nav";

/**
 * Cross-route navigation intent for the start-screen → launcher transition.
 *
 * Module-level state on purpose: it has to outlive the page component that
 * sets it and be readable from app/template.tsx (which remounts on every
 * navigation) and components/TransitionLink (which runs before the navigation
 * commits). React state would not survive either.
 *
 * The rule we encode here: the site has two "worlds".
 *
 *   - The launcher world: `/` (start screen) and the five launcher pages.
 *     Moving inside it must never cover the screen — the DarkVeil background
 *     is a single persistent layer in the root layout and the whole point of
 *     the transition is that it stays alive while the foreground swaps.
 *   - The legacy world: /privacy and /work/nested-united. Those still use the
 *     signature olive/dark column wipe.
 *
 * A cold load always wipes (that is the site intro), and so does any
 * navigation that crosses between the two worlds in either direction. See
 * `wantsWipe` for why that is an `&&` and not an `||`.
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
  return LAUNCHER_PATHS.includes(pathname);
}

/**
 * Should the column wipe play for a navigation from `from` to `to`?
 * `from === null` means "no previous page" (cold load) → always wipe.
 *
 * The rule is: wipe when the navigation CROSSES the boundary, in either
 * direction. Leaving the launcher for a legacy page is a change of world and
 * earns the wipe, exactly as arriving at one from a cold load does.
 *
 * This was `||`, which is wrong in one direction and hid it well. `||` asks
 * "is either end outside the launcher?" and answers yes for `/home` →
 * `/privacy` — both ends are fine to a naive reading, but the destination is
 * a different world with different chrome, and the visitor needs the cover to
 * cross into it. The result was that every route OUT of the launcher into
 * `/privacy` or `/work/nested-united` loaded abruptly while every route
 * between launcher pages crossfaded, which is the worst of both: the abrupt
 * cases are the ones leaving a world, and those are the ones a transition
 * exists for.
 *
 * `&&` asks the only question that matters: are both ends in the same world?
 * Same world → no wipe, the background is already correct and the foreground
 * animates itself. Different worlds → wipe, because the chrome itself changes
 * and there is nothing to hold the screen while it does.
 */
export function wantsWipe(from: string | null, to: string): boolean {
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
