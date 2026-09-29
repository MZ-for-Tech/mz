"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PROJECTS } from "@/lib/projects";
import { transitionTo } from "@/components/TransitionLink/TransitionLink";
import styles from "./WorkShelf.module.css";

/**
 * Five-project carousel. The selected square is in front at the centre;
 * modulo offsets put the remaining squares in two rows behind it and rotate
 * them around as selection changes. Left and right move cyclically, while
 * MenuShell still handles up and down from the surrounding interface.
 *
 * Focus previews and disarms a tile. Click or Enter arms it; a second
 * activation opens its case study. Pointer hover does not change selection,
 * so the carousel does not move underneath the pointer.
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
  const [activeSlug, setActiveSlug] = useState(
    projects.find((project) => project.slug === "feps")?.slug ??
      projects[Math.floor(projects.length / 2)]?.slug
  );
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
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        const tiles = Array.from(
          e.currentTarget
            .closest("ul")
            ?.querySelectorAll<HTMLElement>("[data-tile]") ?? []
        );
        const currentIndex = projects.findIndex((project) => project.slug === slug);
        const step = e.key === "ArrowRight" ? 1 : -1;
        const nextIndex =
          (currentIndex + step + projects.length) % projects.length;
        tiles[nextIndex]?.focus();
        return;
      }
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      e.stopPropagation();
      activate(slug);
    },
    [activate, projects]
  );

  // Selection follows focus, but never hover. Repositioning the carousel on
  // pointer entry would move the target under the pointer; keyboard movement
  // and deliberate activation are stable inputs for the rotating layout.
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
          const halfLength = Math.floor(projects.length / 2);
          const slotOffset =
            ((i - activeIndex + projects.length + halfLength) %
              projects.length) - halfLength;
          const initials = project.name
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .slice(0, 2);

          return (
            <li
              key={project.slug}
              className={styles.slot}
              data-offset={slotOffset}
            >
              <div
                data-tile
                className={`${styles.tile} ${isActive ? styles.tileActive : ""}`}
                style={{ ["--accent-rgb" as string]: project.accentColorRgb }}
                role="button"
                tabIndex={0}
                aria-label={project.name}
                aria-current={isActive ? "true" : undefined}
                onFocus={() => select(project.slug)}
                onClick={() => activate(project.slug)}
                onKeyDown={(e) => onTileKeyDown(e, project.slug)}
              >
                <span className={styles.tileFace}>
                  {project.logo && project.slug !== "nested-united" ? (
                    <Image
                      src={project.logo}
                      alt=""
                      width={200}
                      height={200}
                      className={styles.tileLogo}
                    />
                  ) : !project.logo ? (
                    <span className={styles.tileInitials}>{initials}</span>
                  ) : null}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Keep the captions in their own blending layer. The logo tiles need
          transforms and depth opacity; text needs to blend against the stage
          behind them, so it cannot live inside those transformed tile layers. */}
      <ul className={styles.labelShelf} aria-hidden="true">
        {projects.map((project, i) => {
          const halfLength = Math.floor(projects.length / 2);
          const slotOffset =
            ((i - activeIndex + projects.length + halfLength) % projects.length) -
            halfLength;

          return (
            <li
              key={project.slug}
              className={styles.labelSlot}
              data-offset={slotOffset}
            >
              {project.slug === "nested-united" && (
                <Image
                  src={project.logo!}
                  alt=""
                  width={200}
                  height={200}
                  className={styles.adaptiveLogo}
                />
              )}
              <span className={styles.tileMeta}>
                <span className={styles.tileName}>{project.name}</span>
                <span className={styles.tileCategory}>{project.category}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
