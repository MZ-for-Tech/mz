"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { resolveMove } from "@/lib/spatialNav";
import { MENU_TABS, LAUNCHER_ROOT } from "@/lib/nav";
import { TransitionLink } from "@/components/TransitionLink/TransitionLink";
import IconSprite from "@/components/nested/IconCollage/IconSprite";
import { LocalClock } from "@/components/LocalClock/LocalClock";
import styles from "./MenuShell.module.css";

function PrivacyGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11.2v5" />
      <path d="M12 7.7v0.1" />
    </svg>
  );
}

/** The launcher chrome: status block, tab row, keyboard handling, and the
 * converge-in that plays when the start screen hands over.
 *
 * The shell is a layout, so it stays mounted while the panels underneath
 * swap — which is exactly what lets tab switches be a cheap content crossfade
 * instead of a full page transition (and why no wipe plays here: see
 * lib/mzNav).
 */
export default function MenuShell({ children }: { children: React.ReactNode }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // The start screen sets this class to hand the hero transforms to GSAP for
  // its exit; nothing on this side of the transition needs it any more.
  useEffect(() => {
    document.documentElement.classList.remove("mz-launching");
  }, []);

  // Converge-in: the launcher's furniture assembles over the background that
  // never left. Runs once, on mount — tab switches don't remount the layout.
  useEffect(() => {
    if (!shellRef.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-converge]", {
        opacity: 0,
        y: -16,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.07,
        delay: 0.05,
        clearProps: "opacity,transform",
      });
    }, shellRef);
    return () => ctx.revert();
  }, []);

  // ESC backs out one level: panel → launcher → start screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("input, textarea, select")) return;
      e.preventDefault();
      router.push(pathname === LAUNCHER_ROOT ? "/" : LAUNCHER_ROOT);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pathname, router]);

  // Arrow-key navigation, spatially.
  //
  // Every [data-tile] in the document is a candidate — the tab row plus
  // whatever the current panel registers. Movement is resolved from live
  // geometry (lib/spatialNav) rather than DOM order, so Up and Down move
  // between rows instead of shuffling sideways through a flat list.
  //
  // The candidate set is re-read on every keypress rather than cached,
  // because panels mount and unmount underneath the shell.
  const moveSelection = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest?.("input, textarea, select, summary, [contenteditable]")) return;
    if (!target?.closest?.('[data-tile]')) return;

    const tiles = Array.from(
      document.querySelectorAll<HTMLElement>("[data-tile]")
    );
    if (tiles.length === 0) return;

    e.preventDefault();
    const next = resolveMove(tiles, target as HTMLElement, e.key);
    next?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.key.startsWith("Arrow")) return;
      moveSelection(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveSelection]);

  // Enter activates the selected tile.
  //
  // The hint bar promises "Enter Select", so it has to actually work. Native
  // links already activate on Enter, but the selection can be parked on
  // elements that are not links, and some panels (accordions, toggles) need
  // to hear it. Anything that handles the key itself wins; everything else
  // falls through to a click.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const target = e.target as HTMLElement | null;
      if (!target?.closest?.("[data-tile]")) return;
      if (target.closest("input, textarea, select, [contenteditable]")) return;

      const tile = target.closest<HTMLElement>("[data-tile]");
      if (!tile) return;

      // Let form controls and anything with its own key handling act first.
      const isNativeControl = tile.matches(
        "button, summary, [role='button'], input, textarea, select"
      );
      if (isNativeControl) return;

      e.preventDefault();
      tile.click();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The Work panel is the only one whose content is a full-bleed photograph
  // rather than type over the dark shader, so it is the only one the chrome's
  // dark washes are wrong for. One flag, read by both the scrim and the
  // header, so the two can't disagree about when they are suppressed.
  //
  // An exact match, not a prefix test. The shell is a route-group layout, so
  // it only ever wraps /home, /work, /services, /intel and /contact — the
  // case study at /work/nested-united is deliberately outside it and renders
  // in the legacy world with its own chrome. A `startsWith("/work")` here
  // would look like it handled that page, and would silently do nothing.
  const isWorkPanel = pathname === "/work";

  // The Contact panel is the only one taller than the viewport, and that is
  // what decides whether the content box can be the scrollport at all.
  //
  // `.content` is `overflow-y: auto`, which only scrolls while it is SHORTER
  // than its contents. The brief is ~1900px in a 900px shell, so the box is
  // stretched to the panel's own height and never scrolls — the window does,
  // via Lenis. That is harmless for every other panel, but it silently
  // breaks `position: sticky` inside it: a sticky element resolves against
  // its nearest scrolling ancestor, and this box looks like one while
  // providing no range to move in. The brief's left column tracked the form
  // one-for-one instead of holding still.
  //
  // Dropping this box out of the scrollport role (`overflow: visible`) hands
  // the job back to the viewport, which is what every other panel already
  // effectively scrolls, and the column pins correctly.
  const isTallPanel = pathname !== "/work";

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      /* Also answers "is there launcher chrome here?", for one rule in
         globals.css to switch the site-wide MZ link off. That link is fixed to
         the viewport and lives in the root layout, so it cannot know a shell
         has appeared above it — it kept rendering at top-left underneath this
         header, colliding with the first tab. Marking the shell lets CSS hide
         it without threading a prop through the layout, and without the
         layout having to know which routes are launcher routes. */
      data-shell="launcher"
    >
      <IconSprite />

      {/* The scrim: a legibility layer that keeps panel copy readable over
          the brightest parts of the shared shader.

          It is SKIPPED on the Work tab, and so is the header's own plate —
          see the note on the header below. Both are dark washes sized for a
          panel of type over a dark shader, and the Work panel is the one
          place where neither applies. */}
      {!isWorkPanel && <div className={styles.scrim} aria-hidden="true" />}

      {/* ── Top bar ───────────────────────────────────────────────────
          ONE row, in the console order: identity, destinations, utilities.
          Steam's Big Picture, the PS3 XMB and both Xbox dashboards all put
          those three on a single line at the top of the screen, and every one
          of them keeps them there.

          This was a stack of three — a utilities row, a gap, then the tabs —
          and the gap was the problem. `.headerTop` is a full-width row whose
          only content is right-aligned, so it paid for the clock and the
          privacy glyph with an empty band the entire width of the display. The
          logo, meanwhile, hung from the root layout OUTSIDE this bar (fixed,
          top-left, 100px), which is why the nav read as floating under
          something rather than as part of a header. Nothing occupied the
          middle of that row and nothing could: the logo was not in it.

          Flattening to one line removes the hole by deleting the element that
          made it, rather than by filling it with something invented. The nav
          gains a row's worth of height back for the panel beneath it, and the
          mark becomes chrome in the same bar as the rest of the chrome instead
          of a separate object hovering over it. */}
      <header className={`${styles.header} ${isWorkPanel ? styles.headerBare : ""}`}>
        {/* The mark returns to the MZ splash, matching the site-wide brand
            link on pages that do not use the launcher shell. */}
        <TransitionLink
          href="/"
          className={styles.markSlot}
          aria-label="MZ home"
          data-converge
        >
          {/* `mz-logo.min.svg` is the flat black silhouette, unlike the
              gradient `mz.svg`. The regular shell uses it as white ink on its
              dark header; Work renders a second copy in the difference-blended
              overlay below so it can invert against the actual stage. */}
          {!isWorkPanel && (
            <Image
              src="/mz-logo.min.svg"
              alt=""
              aria-hidden="true"
              width={100}
              height={100}
              className={styles.mark}
              priority
            />
          )}
        </TransitionLink>

        {/* No ◀ ▶ affordance at the ends of the row. Neither reference has
            one: the tabs are a destination bar, and the shell already states
            that arrows navigate in the hint bar below. They read as controls
            the page doesn't implement. */}
        <nav className={styles.tabs} aria-label="Sections" data-converge>
          <ul className={styles.tabList}>
            {MENU_TABS.map((tab) => {
              /* The launcher home is an exact match, like every other tab.
               * The `startsWith` arm used to exist because `/menu` was both a
               * page and a prefix (`/menu/work`), so an equality test made
               * Home light up on every panel. With flat routes no tab is a
               * prefix of another, so one rule covers all five and Home
               * cannot match by accident. */
              const active =
                tab.href === LAUNCHER_ROOT
                  ? pathname === LAUNCHER_ROOT
                  : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    data-tile
                    className={`${styles.tab} ${active ? styles.tabActive : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* The utilities, on the right of the bar. The clock and the privacy
            glyph are the two things a console puts in this slot — a clock is a
            launcher convention (the PS3 shows the time in the top bar, and it
            exists to prove the system is live), and privacy is the one system
            control the site has.

            They are on the row rather than above it, which is the whole change.
            The empty band was never a slot waiting to be filled; it was the
            width of a row with nothing on the left of it. */}
        <div className={styles.headerMeta} data-converge>
          {!isWorkPanel && <LocalClock className={styles.clockSlot} />}

          {/* An icon, not the word "Privacy". At this size and at this contrast
              a word is a second headline competing with the tabs, and it
              repeats the site chrome twice; a glyph reads as the system
              control it is. Labelled for assistive tech, and the title gives
              the same to a pointer.

              A `TransitionLink`, not a plain one. `/privacy` is a legacy-world
              page, so leaving the launcher for it is exactly the navigation
              that earns the column wipe — and this control was the only way
              into it, so a plain `next/link` here meant the one route out of
              the shell that loaded abruptly while every tab beside it
              crossfaded. Same component, same `wantsWipe` decision, no
              per-call-site judgement about which transition is correct. */}
          {!isWorkPanel && (
            <TransitionLink
              href="/privacy"
              data-tile
              className={styles.privacy}
              aria-label="Privacy"
              title="Privacy"
            >
              <PrivacyGlyph />
            </TransitionLink>
          )}
        </div>
      </header>

      {isWorkPanel && (
        <div className={styles.workAdaptiveChrome}>
          <TransitionLink
            href="/"
            className={styles.workAdaptiveMarkSlot}
            aria-label="MZ home"
          >
            <Image
              src="/mz-logo.min.svg"
              alt=""
              width={100}
              height={100}
              className={styles.workAdaptiveMark}
              priority
            />
          </TransitionLink>
          <div className={styles.workAdaptiveClockSlot}>
            <LocalClock />
          </div>
          <TransitionLink
            href="/privacy"
            data-tile
            className={`${styles.privacy} ${styles.workAdaptivePrivacy}`}
            aria-label="Privacy"
            title="Privacy"
          >
            <PrivacyGlyph />
          </TransitionLink>
        </div>
      )}

      <main
        id="main-content"
        tabIndex={-1}
        className={`${styles.content} ${isTallPanel ? styles.contentWindowScroll : ""}`}
      >
        {/* Keyed by pathname so every panel assembles itself on arrival —
            that is the "converge" of a tab switch, with the shell holding
            still above it. */}
        <div
          key={pathname}
          className={`${styles.panel} ${isWorkPanel ? styles.panelWork : ""}`}
        >
          {children}
        </div>
      </main>

      {/* The key hints ("← → Navigate / Enter Select / Esc Back") are gone.

          They were removed to find out whether anyone actually needs them:
          arrow-key navigation and Enter-to-activate are standard in every
          console launcher this borrows from, and a visitor who reaches for the
          arrow keys will find they work without being told. Spending three
          labelled key caps of permanent bottom-edge chrome on that is a real
          cost — it competes with the content for the lowest, most salient
          band on the screen, and the same CSS is worth more as breathing room.

          The keyboard model itself is unchanged: arrow movement, Enter/space
          activation and Esc-to-go-back all still work exactly as before. Only
          the instruction is gone, never the capability.

          On the other launcher panels, the wordmark remains as a closing
          signature. Work uses the full height for the carousel instead. */}
      {!isWorkPanel && (
        <div className={styles.hints} data-converge aria-hidden="true">
          <span className={styles.hintsBrand}>MZ — Research. Software. Knowledge.</span>
        </div>
      )}
    </div>
  );
}
