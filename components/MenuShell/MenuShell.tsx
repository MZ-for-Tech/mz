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
    if (target?.closest?.("input, textarea, select, [contenteditable]")) return;

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
  const isTallPanel = pathname === "/contact";

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      /* Announced to CSS, not used to branch in JS. The Work stage is
         full-bleed, and it is light: either a screenshot from the studio's own
         set or the paper field a project without one stands in on. That
         changes what colour the chrome has to be, and it changes it for the
         clock and the brand line too — which live in their own modules and
         would otherwise need a prop threaded through the shell to learn it.
         One attribute on the shell answers it for every descendant at once. */
      data-stage={isWorkPanel ? "light" : "dark"}
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

      <header className={`${styles.header} ${isWorkPanel ? styles.headerBare : ""}`}>
        {/* The MZ mark, and it is the top of the stack: mark, then nav, then
            the content underneath. It used to be painted into the background
            layer instead, which meant nothing could position it — it landed
            wherever the background art put it and sat half-under the first
            tab, because it had no way of knowing the tab row existed. As
            chrome it is in normal flow, centred, and the header is finally
            allowed to be a layout rather than a bag of absolutely-positioned
            pieces.

            Decorative, and inert in both senses: `aria-hidden` because the
            name it spells is already in the document title, the wordmark at
            the foot of the page and the favicon; and a plain `<img>` rather
            than a `<Link>`, because a logo you cannot click still has to
            LOOK like something you cannot click. That is the opposite rule to
            the trust band's, where the marks are also inert and still take a
            hover — the difference is that those are a roster of third
            parties being acknowledged, and this is the studio's own
            wordmark sitting in a header that already navigates. */}
        <div className={styles.headerTop} data-converge>
          <LocalClock className={styles.clockSlot} />

          <div className={styles.headerMeta}>
            {/* An icon, not the word "Privacy". At this size and at this
                contrast a word is a second headline competing with the tabs,
                and it repeats the site chrome twice; a glyph reads as the
                system control it is. Labelled for assistive tech, and the
                title gives the same to a pointer. */}
            {/* A `TransitionLink`, not a plain one. `/privacy` is a legacy-world
                page, so leaving the launcher for it is exactly the navigation
                that earns the column wipe — and this control was the only way
                into it, so a plain `next/link` here meant the one route out of
                the shell that loaded abruptly while every tab beside it
                crossfaded. Same component, same `wantsWipe` decision, no
                per-call-site judgement about which transition is correct. */}
            <TransitionLink
              href="/privacy"
              data-tile
              className={styles.privacy}
              aria-label="Privacy"
              title="Privacy"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                /* Back down toward the original 1.6, for the same reason the
                   glyph is bigger: the 1.9 was compensating for a 14px icon
                   resolving to sub-pixel ink, and at 18px that compensation
                   overcorrects into something heavy.

                   The three sizes this control has been through, and why each
                   was wrong:

                     - 20px in a bordered box: too loud. The frame made it the
                       only hard-edged object in the header.
                     - 14px bare: too small. The frame had been doing half the
                       work of making the glyph read, and removing it without
                       raising the glyph left the control genuinely hard to
                       find — a worse failure than being too loud, because a
                       loud privacy link is an aesthetic problem and an
                       invisible one is a usability problem.
                     - 18px bare: the glyph carries itself.

                   The box and the glyph have to move separately, which is the
                   whole reason this control has a transparent 40px box rather
                   than no box at all. 40px is a touch target, not a size; the
                   glyph is what the eye reads, and it had been carrying a size
                   chosen for a frame that no longer exists. */
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="8.6" />
                {/* Stem and dot, the "i" itself. The dot is a zero-length
                    dash rather than a filled circle so it picks up the same
                    stroke weight as the ring instead of sitting on it as a
                    heavier blob. */}
                <path d="M12 11.2v5" />
                <path d="M12 7.7v.1" />
              </svg>
            </TransitionLink>
          </div>
        </div>

        <div className={styles.markSlot} data-converge>
          {/* `mz-logo.min.svg`, NOT `mz.svg`. They look like the same studio's
              mark and are not: `mz-logo.min.svg` is 165 flat `#020202` paths —
              a pure silhouette with no colour of its own, which is what makes
              it adaptable. `mz.svg` is the same geometry filled with a
              165-stop green-to-yellow gradient, and putting that in the header
              put a lime gradient in the top band on every launcher page.

              The adaptation is the two lines below, and both are load-bearing:
              `brightness(0) invert(1)` collapses the black to pure white, and
              `mix-blend-mode: difference` inverts it back against whatever is
              behind it. That is why the mark survives the dark shader, the
              cream paper card and the full-bleed light Work stage without a
              second asset — and it is why the shell's copy needs BOTH. A white
              mark with no blend mode is invisible on the Work stage, which is
              exactly the case `.headerBare` exists to handle for the tabs. */}
          <Image
            src="/mz-logo.min.svg"
            alt=""
            aria-hidden="true"
            width={100}
            height={100}
            className={styles.mark}
            priority
          />
        </div>

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
                  : pathname === tab.href;
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
      </header>

      <main
        className={`${styles.content} ${isTallPanel ? styles.contentWindowScroll : ""}`}
      >
        {/* Keyed by pathname so every panel assembles itself on arrival —
            that is the "converge" of a tab switch, with the shell holding
            still above it. */}
        <div key={pathname} className={styles.panel}>
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

          What remains is the wordmark, which is not an instruction and holds
          the same centre line on its own. It is a closing signature for the
          launcher rather than a footer — the shell has no end, so there is
          nothing for a rule or navigation to sit under. */}
      <div className={styles.hints} data-converge aria-hidden="true">
        <span className={styles.hintsBrand}>MZ — Research. Software. Knowledge.</span>
      </div>
    </div>
  );
}
