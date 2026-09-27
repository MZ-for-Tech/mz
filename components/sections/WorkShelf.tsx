"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PROJECTS } from "@/lib/projects";
import { transitionTo } from "@/components/TransitionLink/TransitionLink";
import styles from "./WorkShelf.module.css";

/**
 * The shelf: every project, in one centred row, the selected one bulged.
 *
 * WHY THERE IS NO INFINITE SCROLL
 *
 * This was built to wrap infinitely — the list was rendered three times and
 * the track was translated by one tile step per move, folding the index with
 * modulo. That is the right technique for forty items and the wrong one for
 * four: with so few, the repeated copies are all visible at once, so the
 * duplication reads as a bug rather than as depth. It also needed a measured
 * step, a ResizeObserver to keep that step honest, and a hand-rolled key
 * handler that fought the launcher's own spatial navigation for the same
 * arrow keys.
 *
 * They all fit on screen, so all of them are shown. No track, no offset
 * arithmetic, no wrap, no measurement. If a future collection outgrows one
 * screen, that is the point at which the wrap returns — as a decision made
 * then, against a real count, rather than pre-built and unused now.
 *
 * ARROWS ARE NOT HANDLED HERE
 *
 * The tiles are ordinary [data-tile] stops, which means MenuShell's spatial
 * navigation already moves between them — left and right along this row, up
 * and down to and from the tab row. An earlier version installed its own
 * left/right listener with stopPropagation, so pressing an arrow moved the
 * shelf selection and the launcher selection fought over the same keypress.
 * Selection is now simply derived from focus, so there is nothing to keep in
 * sync and no second handler to disagree.
 *
 * A TILE IS A LINK, NOT A CURSOR POSITION
 *
 * Reaching a project takes two activations: the first brings it to the stage,
 * the second opens its case study. A single activation was wrong because the
 * click that was only meant to look at a project threw the visitor out of the
 * launcher, and there is no Back affordance inside a console — Esc goes to
 * the start screen, not to the row you were on.
 *
 * The two-step is also how the stage earns its keep: a first activation that
 * changes a full-bleed stage is a large, obvious change of state, which is
 * what makes the second one an informed act rather than a guess. It is the
 * same reason the row bulges.
 *
 * Keyboard and pointer go through one function, and "pointing at" is separate
 * from "armed". Arrowing onto a tile selects it for free; it does not arm it.
 * Folding those together made Enter open the case study on the first press
 * for anyone using the keyboard, which is the most ordinary path there is.
 */

/* The shelf is the client's book of work, so it is the subset that says so in
 * the data. The Null Hypothesis is MZ's own research arm rather than a
 * commission and opts out — it stays on the launcher home's Featured band,
 * which is a different question.
 *
 * Module scope, not inside the component. Filtering here rather than in the
 * data keeps PROJECTS a record of everything that exists, and keeps the home
 * page's Featured band reading the same array for its own subset. But a
 * `.filter()` inside the component body returns a fresh array every render,
 * which makes it a new dependency of `openCaseStudy` on every render — the
 * callback would then be rebuilt each time and the manual memoisation on
 * `activate` could not hold. The collection is static, so it is resolved
 * once. */
const SHELF_PROJECTS = PROJECTS.filter((p) => p.showOnWorkShelf !== false);

export function WorkShelf() {
  const projects = SHELF_PROJECTS;
  const router = useRouter();
  /* Two pieces of state, and the split is the whole fix.
   *
   * `activeSlug` is what the stage is showing. `armedSlug` is what the
   * visitor has deliberately pointed at — which is the only thing that
   * unlocks a second activation.
   *
   * Collapsing them into one is what made Enter open the case study on the
   * first press. Focus alone sets the selection, so a keyboard user who
   * arrows along the row had already "selected" the tile they landed on, and
   * the very next Enter read as a second click on an already-active project.
   * Arrowing to a tile and pressing Enter once is the most ordinary keyboard
   * path there is, and it skipped the confirmation step entirely.
   *
   * So: moving the selection is free and silent, and arming is a deliberate
   * act — a click, or Enter. The two-step then behaves identically for a
   * mouse and for the keyboard, and neither can trip the other. */
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug);
  const [armedSlug, setArmedSlug] = useState<string | null>(null);

  const activeIndex = Math.max(
    0,
    projects.findIndex((p) => p.slug === activeSlug)
  );

  // Enter OR click opens the case study for the selected project.
  //
  // A project with no case study simply has nothing to open, so the second
  // activation is a no-op rather than a dead end: the tile is already at the
  // front of the stage, and the first activation is still what brought it
  // there.
  const openCaseStudy = useCallback(
    (slug: string) => {
      const project = projects.find((p) => p.slug === slug);
      if (!project?.hasCaseStudy) return;
      /* Through `transitionTo`, not `router.push`.

         The tiles are `role="button"` with a two-press arm/confirm
         interaction, so there is no anchor to hang a click handler on and
         this was the only navigation on the site that pushed without a
         transition. The case study is a legacy-world page, so the correct
         answer is the column wipe — and `transitionTo` asks `wantsWipe` the
         same question the link component does, rather than this call site
         deciding for itself. A future case study inside the launcher world
         would correctly get the crossfade instead. */
      void transitionTo(router, `/work/${project.slug}`);
    },
    [projects, router]
  );

  /**
   * The single rule for both a pointer click and a keyboard activation, so
   * the two can never disagree about what a given press means.
   *
   * `preventDefault` in the key handler is load-bearing, not defensive: it
   * cancels the browser's own activation of a `role="button"`, which would
   * otherwise fire a click after the handler returned — and that click would
   * be a *second* activation of an already-armed tile, opening the case study
   * one keypress early.
   */
  const activate = useCallback(
    (slug: string) => {
      if (armedSlug !== slug) {
        setArmedSlug(slug);
        setActiveSlug(slug);
        return;
      }
      openCaseStudy(slug);
    },
    [armedSlug, openCaseStudy]
  );

  const onTileKeyDown = useCallback(
    (e: React.KeyboardEvent, slug: string) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      e.stopPropagation();
      activate(slug);
    },
    [activate]
  );

  // Selection follows focus and the cursor, because both are free movements —
  // but either one DISARMS. Arriving at a tile by any means that isn't a
  // deliberate activation always costs one press before it costs two, which is
  // the behaviour the whole split exists to produce.
  const select = useCallback((slug: string) => {
    setActiveSlug(slug);
    setArmedSlug(null);
  }, []);

  return (
    <div className={styles.work}>
      {/* Stage — one layer per project, crossfaded by opacity.
       *
       * Two possible contents per layer, and which one a project gets is
       * data, not a branch in this component:
       *
       *   1. `coverImage` — the screenshot, full-bleed. This is the real
       *      state and the reason the stage exists.
       *   2. `stagePlaceholder: "mark"` — the mark centred on a light field,
       *      standing in until a current capture exists. Better than a blank
       *      rectangle, and honest: it is a mark, not a screenshot.
       *   3. Neither — no layer at all, so the DarkVeil background shows
       *      through the whole panel. Deliberate, and the right answer for a
       *      project with no artwork and no mark.
       *
       * Borrowing someone else's screenshot to fill a gap was never an
       * option: it shows the wrong work under this project's name. */}
      <div className={styles.stage} aria-hidden="true">
        {projects.map((project, i) => {
          const isActive = i === activeIndex;
          const activeClass = isActive ? styles.stageLayerActive : "";

          if (project.coverImage) {
            return (
              <div
                key={project.slug}
                className={`${styles.stageLayer} ${activeClass}`}
              >
                <Image
                  src={project.coverImage}
                  alt=""
                  fill
                  sizes="100vw"
                  className={styles.stageImage}
                  priority={i === 0}
                />
              </div>
            );
          }

          if (project.stagePlaceholder === "mark" && project.logo) {
            return (
              <div
                key={project.slug}
                className={`${styles.stageLayer} ${styles.stageLayerMark} ${activeClass}`}
              >
                <Image
                  src={project.logo}
                  alt=""
                  width={200}
                  height={200}
                  className={styles.stageMark}
                />
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* The shelf. Laid out as a normal centred flex row — no absolute
          positioning, no measured offsets. */}
      <ul className={styles.shelf} aria-label="Projects">
        {projects.map((project, i) => {
          const isActive = i === activeIndex;
          const initials = project.name
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .slice(0, 2);

          return (
            <li key={project.slug} className={styles.slot}>
              {/* A mark with no background of its own gets the whole card
                  turned white. Nested United's logo is a bare black path, so
                  on the dark surface it disappeared completely — a small
                  plate behind the icon was not enough, it needed a field to
                  sit in. Initials tiles keep the dark surface, because type
                  set in the site's own colour is already legible on it. */}
              <div
                data-tile
                className={`${styles.tile} ${
                  isActive ? styles.tileActive : ""
                } ${project.logo ? styles.tileOnLight : ""}`}
                style={{ ["--accent-rgb" as string]: project.accentColorRgb }}
                role="button"
                tabIndex={0}
                aria-label={project.name}
                aria-current={isActive ? "true" : undefined}
                onFocus={() => select(project.slug)}
                onMouseEnter={() => select(project.slug)}
                onClick={() => activate(project.slug)}
                onKeyDown={(e) => onTileKeyDown(e, project.slug)}
              >
                {project.logo ? (
                  <Image
                    src={project.logo}
                    alt=""
                    width={200}
                    height={200}
                    className={styles.tileLogo}
                  />
                ) : (
                  <span className={styles.tileInitials}>{initials}</span>
                )}

                {/* The label sits INSIDE the card, across its bottom — the
                    Xbox arrangement. It was below the card, which meant the
                    name was a separate object hanging under a mark rather
                    than part of the thing it names, and it made the row
                    taller for no reason.

                    Inside, it needs a scrim of its own: the card is white
                    when it carries a mark, and this type is the site's light
                    ink, so on a white card it would be invisible without one.
                    The scrim is the same device the launcher tiles use for
                    their action bars, and it costs no extra height because
                    the band is part of the card rather than added to it. */}
                <span className={styles.tileMeta}>
                  <span className={styles.tileName}>{project.name}</span>
                  <span className={styles.tileCategory}>
                    {project.category}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
