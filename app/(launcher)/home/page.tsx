import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import {
  CLIENTS,
  PROJECTS,
  FEATURED_SLOTS,
  type ProjectData,
  type FeaturedSlot,
} from "@/lib/projects";
import DataStreamHero from "@/components/DataStreamHero/DataStreamHero";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Software Studio in Cairo",
  description:
    "Explore MZ's software work, applied research, and proprietary systems. MZ is a technology engineering studio based in Cairo, Egypt.",
  path: "/home",
});

/**
 * The launcher home.
 *
 *   ┌──────────────────────────────────────────────┐
 *   │  ┌────────────┬────────────┬──────────────┐ │
 *   │  │  HERO      │  HERO      │  tile        │ │  ← the work grid
 *   │  └────────────┴────────────┴──────────────┘ │
 *   │  ┌────┐  ┌────┐  ┌────┐                      │
 *   │  │tile│  │tile│  │tile│                      │
 *   │  └────┘  └────┘  └────┘                      │
 *   │                 TRUSTED BY                   │
 *   │      NESTED   FEPS   LUX                    │  ← one quiet strip
 *   └──────────────────────────────────────────────┘
 *
 * TWO PROBLEMS, TWO INDEPENDENT RULES
 *
 * The client marks used to sit in a stacked column beside the hero, which
 * meant the number of clients decided the number of columns and the aspect
 * of the hero itself. Three fitted; five left the hero a sliver. Adding a
 * logo moved every tile on the page, so the layout could not be edited
 * without being re-done.
 *
 * They are independent now, because they answer different questions. The
 * client row is a *roster* — one line of equal-weight marks that reflows on
 * its own terms and constrains nothing above or below it. The work grid is a
 * *shelf* — a fixed arrangement of large and small tiles. Neither sizes the
 * other, so the roster can gain a fourth and a fifth logo without a tile in
 * the grid moving, and the grid can promote a project without touching the
 * roster. That is the whole fix; there is no per-logo rule to add later.
 *
 * THE ROSTER IS BELOW THE SHELF
 *
 * The roster used to lead the page, which made a row of marks the first read
 * and the work the second — a client logo is supporting evidence, so it
 * cannot be the thing the eye lands on. The shelf leads now and takes the
 * width, and the roster falls underneath as a centred strip whose whole job
 * is to say who the work was for in one glance. Putting the strip last also
 * made the grid bigger for free: the vertical space the marks used to spend
 * on 21:6 tiles is now theirs, so the heroes grew without a new
 * breakpoint or a new measurement.
 *
 * WHY THE BAND IS THREE SLOTS AND NOT A COLUMN COUNT
 *
 * The Featured band used to be "every project marked `prominent`, then a
 * trailing column of whatever was left" — two heroes beside a stack of
 * letterforms. That was a list wearing a grid's clothes: the column made no
 * argument, and a visitor had to work out which of the tiles was the work
 * they came for.
 *
 * It is now a fixed three-way — research, client work, product — and each
 * slot is a claim the studio makes about itself rather than a project that
 * happened to be large. The order is the one the eye should travel: what we
 * study, what we build for other people, what we own. It mirrors the wordmark
 * (Research. Software. Knowledge.) rather than inventing a new taxonomy, and
 * it answers "what is MZ" before a visitor has read a single name.
 *
 * Each slot renders a labelled caption, which is the point of the three-way
 * and a reversal of the rule below: the claims are the argument, so they are
 * named. The projects inside them are still unlabelled, because a project is
 * shown by its own artwork.
 *
 * THE SLOTS ARE ENUMERATED, NOT SIZED
 *
 * The count is fixed at three in FEATURED_SLOTS rather than derived from how
 * many projects happen to declare a slot, so an unfilled slot stays a visible
 * gap rather than silently reflowing the row to two and re-centring. A gap
 * states the truth — a claim with nothing behind it yet — and a grid that
 * closed up would hide it.
 *
 * NOTHING IS LABELLED, EXCEPT THE BANDS THAT MAKE A CLAIM
 *
 * Earlier versions put a name, a sector and a year under every mark. That
 * reads as a directory, and a directory is the one thing a dashboard is not:
 * the marks carry it, and a visitor who cannot place a logo still has the
 * artwork, the selection and the tab row. Every name survives as an
 * aria-label and a title, so nothing was lost but the ink.
 *
 * The labels this page keeps are the bands' own — FEATURED and TRUSTED BY —
 * plus the three slot captions under the Featured tiles. Each states what
 * the thing beneath it IS, once, for everyone, instead of repeating itself
 * under every item in the row.
 */

/**
 * The three claims, in order, each with the project that proves it.
 *
 * Resolved once at module scope from the declarations in lib/projects rather
 * than filtered inside the component: a `.filter()` in the render body
 * returns a new array on every pass, which is a dependency that never
 * stabilises — and this page is a server component that renders once anyway.
 *
 * A slot with nothing in it keeps its place and renders empty, which is the
 * honest state for a claim with no proof behind it yet.
 */
const FEATURED: {
  id: FeaturedSlot;
  label: string;
  project: ProjectData | null;
}[] = FEATURED_SLOTS.map((slot) => ({
  ...slot,
  project: PROJECTS.find((p) => p.featuredSlot === slot.id) ?? null,
}));

/**
 * What a hero tile is carrying, resolved once.
 *
 * Four states, in priority order, and two of them are temporary:
 *
 *   1. `coverImage` — the real artwork. This is what the tile is for.
 *   2. `stagePlaceholder: "mark"` — the mark on a light field, standing in
 *      until a current capture exists. A project with real work behind it
 *      should not present as a blank tile, and its mark is the one piece of
 *      identity that is definitely true today.
 *   3. `heroField: "stream"` — the paper ground plus a live data-stream.
 *   4. None of the above — the same paper ground, no field. The name alone.
 *
 * Note that 3 and 4 differ ONLY in the field. The ground is shared, because
 * the paper is the shell's neutral light surface for a tile with no artwork —
 * it is not something any one product owns, and Misura and The Null
 * Hypothesis are both standing on it. Only the Null Hypothesis's stream is
 * its own: the drifting symbols are that portal's aesthetic, so it declares
 * them. A tile with the paper and no field is not a lesser state of 3, it is
 * the same surface with less on it.
 *
 * `hasArtwork` used to be returned alongside `kind` as a second answer, for
 * the scrim, the name and the surface to all branch on it — which is how those
 * three could disagree about what a tile was carrying. `kind` says the same
 * thing once and is now the only answer, so the redundancy is gone rather than
 * kept in step. */
function resolveHero(project: ProjectData) {
  if (project.coverImage) {
    return { kind: "artwork" as const, field: false };
  }
  if (project.stagePlaceholder === "mark" && project.logo) {
    return { kind: "mark" as const, field: false };
  }
  /* The field is declared, not inferred. It used to be the fallback branch —
     a tile with neither artwork nor a mark got a data-stream — so every
     assetless project silently inherited the same live canvas: the most
     expensive thing a tile can carry, spent on a placeholder, in one
     product's design language. Only the project whose own aesthetic IS a
     stream of symbols asks for one. */
  return {
    kind: "paper" as const,
    field: project.heroField === "stream",
  };
}

/** One large tile: artwork when there is any, a mark or a live canvas when
 *  there isn't, captioned with the claim it is making. */
function HeroCard({
  project,
}: {
  project: ProjectData;
}) {
  const { kind, field } = resolveHero(project);

  const body = (
    <>
      {kind === "artwork" && (
        <Image
          src={project.coverImage!}
          alt=""
          fill
          sizes="(max-width: 900px) 100vw, 44vw"
          className={styles.heroImage}
          priority
        />
      )}

      {kind === "mark" && (
        <span className={styles.heroMarkField} aria-hidden="true">
          <Image
            src={project.logo!}
            alt=""
            width={200}
            height={200}
            className={styles.heroMark}
          />
        </span>
      )}

      {/* The symbol field, on the paper. Only the project whose own aesthetic
          is a stream of symbols asks for it — see `heroField` in
          lib/projects. The paper underneath is shared by every assetless
          tile; this is the part that is not. */}
      {field && (
        <span className={styles.heroStream} aria-hidden="true">
          <DataStreamHero />
        </span>
      )}

      <span className={styles.heroScrim} aria-hidden="true" />

      {/* The name, over whatever the card is carrying. Artwork states the
          project and a mark already names it, so both are silent. A tile on
          the paper says its own name, in the paper's ink — with or without
          a field behind it, so it is never a picture of nothing. */}
      {kind === "paper" && (
        <span className={styles.heroType} aria-hidden="true">
          {project.name}
        </span>
      )}

      <span className={styles.heroAction}>
        <span className={styles.heroActionGlyph} aria-hidden="true">
          {project.link?.startsWith("http") ? "↗" : "▶"}
        </span>
        {project.hasCaseStudy
          ? "View case study"
          : project.link
            ? "Open project"
            : "View project"}
      </span>
    </>
  );

  /* One surface per ground, looked up rather than branched so a new state
     cannot fall through to the wrong one. `paper` is the shared light ground
     for any tile with no artwork — it is the shell's neutral surface, not one
     product's colour — and whether the tile also carries a symbol field is
     the separate `field` flag, not a fourth surface. */
  const SURFACE: Record<string, string> = {
    artwork: "",
    mark: styles.heroMarked,
    paper: styles.heroPaper,
  };
  const className = `${styles.hero} ${SURFACE[kind] ?? ""}`;

  return project.link?.startsWith("http") ? (
    <a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      data-tile
      className={className}
      title={project.name}
      aria-label={project.name}
    >
      {body}
    </a>
  ) : (
    <Link
      href={project.link || (project.hasCaseStudy ? `/work/${project.slug}` : "/work")}
      data-tile
      className={className}
      title={project.name}
      aria-label={project.name}
    >
      {body}
    </Link>
  );
}

/**
 * A band label: a glyph, then the name.
 *
 * The glyph is the console convention and it earns its place here. Every
 * band in a game launcher carries a small state marker beside its name — a
 * filled square on the featured rail, a circular arrow on last-played, a
 * flame on what's-hot — and the mark is what makes the label read as part
 * of the interface rather than as a heading someone wrote. Without it,
 * "FEATURED" is a caption floating above a grid; with it, it is a tab.
 *
 * This site already speaks in glyphs — the clock, the privacy control, the
 * action bars on the hero tiles — so a labelled band with a mark beside it
 * joins a vocabulary the visitor has already learned, and a band added
 * later brings its own icon instead of needing a new label treatment.
 *
 * The mark is `aria-hidden` because it carries no information the name does
 * not: it is the same signal as the word, in a second visual channel. The
 * label is a real `<h2>` with an `id`, so the section's `aria-labelledby`
 * still points at something a screen reader announces.
 */
function BandTitle({
  id,
  children,
  icon,
}: {
  id: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <h2 id={id} className={styles.bandTitle}>
      <span className={styles.bandGlyph} aria-hidden="true">
        {icon}
      </span>
      {children}
    </h2>
  );
}

/* A filled square for the shelf and a ring for the roster: solid marks the
   lead, hollow marks the support. The distinction is the whole vocabulary —
   two identical glyphs would say "these are the same kind of thing", which
   is precisely what the second band stops being. */
const FEATURED_GLYPH = (
  <svg viewBox="0 0 8 8" width="7" height="7" fill="currentColor">
    <rect x="0" y="0" width="8" height="8" />
  </svg>
);

const TRUST_GLYPH = (
  <svg viewBox="0 0 10 10" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="5" cy="5" r="3.4" />
  </svg>
);

/** One entry of the FEATURED band: a claim, and whatever is behind it. */
type FeaturedClaim = (typeof FEATURED)[number];

/**
 * Which claim is the pyramid's apex — the wide card, on top.
 *
 * DECLARED, and not derived from position, because "the first one in the list"
 * is not a statement about which claim should be the biggest thing on the
 * screen. It is the one line that decides the band's hierarchy on every
 * layout, and the desktop row follows it too — so the phone is not a
 * rearrangement of the desktop, it is the same order with the hierarchy made
 * literal.
 *
 * `work` — Nested United — is the apex for now. It is the one project on the
 * site with a full case study, so it is the only claim a visitor can act on
 * from the band, and the centrepiece is the one place that is worth saying.
 * The Null Hypothesis is the better answer to "what is MZ" and Misura is the
 * better answer to "what do you own", but neither has a real surface behind it
 * yet, so at this size both read as placeholders. When the portal or the
 * product earns one, this is the line to change — and nothing else.
 */
const APEX_SLOT: FeaturedSlot = "work";

const APEX = FEATURED.find((s) => s.id === APEX_SLOT) ?? FEATURED[0];
const BASE = FEATURED.filter((s) => s.id !== APEX_SLOT);

/** The body of one claim: a card, or an honest empty slot.
 *
 *  Split out because the pyramid puts the second and third claims inside a
 *  shared base element, so the same two branches are needed in two places.
 *  Inlined twice, the empty-slot copy drifts from the filled one, and the
 *  drift is invisible until a claim actually goes empty. */
function renderSlotBody(slot: FeaturedClaim) {
  return slot.project ? (
    <HeroCard project={slot.project} />
  ) : (
    /* A claim with nothing behind it yet. The slot keeps its place and its
       caption, so the band stays three wide and the gap is visible — which is
       the honest state. Reflowing to two tiles would quietly remove the claim
       instead. */
    <div
      className={styles.claimEmpty}
      aria-label={`${slot.label} — nothing here yet`}
    >
      <span className={styles.heroClaim} aria-hidden="true">
        {slot.label}
      </span>
    </div>
  );
}

/** One claim's cell, wrapped for the pyramid's base row. */
function renderSlot(slot: FeaturedClaim) {
  return <div key={slot.id} className={styles.claimSlot}>{renderSlotBody(slot)}</div>;
}

export default function MenuHomePage() {
  return (
    <div className={styles.panel}>
      {/* ── Featured ────────────────────────────────────────────────────
          The shelf, as a labelled band. The title and the roster's
          "Trusted by" are the same object — a quiet label over the thing it
          names — so they share one class pair rather than each having their
          own, which is the only way the two stay the same size and colour.

          The label is what earns the shelf's rank. Without it the board is
          a grid of pictures and the roster underneath is a second grid, and
          a visitor has to guess which one is the work they came for. With
          it, the page states its own hierarchy: this is the featured work,
          that is who it was for.

          `FEATURED` rather than "Selected work" — it is a shelf label in a
          console, not a portfolio heading, and one word keeps it at the
          same register as "TRUSTED BY" beside it.

          The three tiles under it are the page's argument, not a selection:
          research, client work, product, one each. See the module comment for
          why that is a fixed three and why each slot is declared. */}
      <section className={styles.band} aria-labelledby="featured-title">
        <BandTitle id="featured-title" icon={FEATURED_GLYPH}>
          Featured
        </BandTitle>

        {/* The board is a list of two on desktop — an apex and a base — and
            `display: contents` on the base means its two children are the
            grid items directly, so the wide layout is still three cards in one
            row. The wrapper only has a box below the tablet, where the layout
            needs one.

            The base is its own element because a pyramid cannot be expressed
            from a flat list: `nth-child` can restyle siblings but it cannot
            put two of them on one line while the third spans both. It is a
            `<li>` wrapping two more, which keeps the list semantics (a list of
            claims, the second of which happens to hold two) rather than
            flattening to divs and losing the count for a screen reader.

            One order for both layouts, and it is the apex's order: Nested
            United, then the two supporting claims. The desktop row reads the
            same way it stacks, so the phone is not a rearrangement of the
            desktop — it is the same argument with the hierarchy made literal.
            `APEX_SLOT` is the single place to change it. */}
        <ul className={styles.board}>
          <li className={styles.claimApex}>{renderSlot(APEX)}</li>
          <li className={styles.claimBase}>
            {BASE.map((slot) => renderSlot(slot))}
          </li>
        </ul>
      </section>

      {/* ── Clients ─────────────────────────────────────────────────────
          Below the shelf, centred, and the quietest thing on the page: the
          work is the argument and these are the names on it. `auto-fit`
          with a floor rather than a column count, so a fourth logo takes the
          next slot and a fifth wraps, each slot staying the same width, and
          nothing here is edited to accommodate it.

          It is a TAIL, not a second peer. Both bands are built from `.band`
          and carry the same label, which is right — but the rail beneath in
          a console launcher sits at a lower register: structurally identical
          to the one above, desaturated toward the background until you
          look at it directly. `.bandTail` is that lower register, applied
          to the mark rather than the label, so the two bands are visibly
          the same kind of object ranked differently. Two equal slabs would
          leave the page with no lead, and the shelf's job is to be the lead.

          No per-logo cards. The reference's own trust band is a bare row of
          marks with no frames, and framing each one made the strip compete
          with the grid directly above it. Contrast is carried by the marks
          themselves — the `tone` field in lib/projects decides what gets
          inverted — so a logo dropped in later can be legible without anyone
          styling a card for it. */}
      <section className={`${styles.band} ${styles.bandTail}`} aria-labelledby="trust-title">
        <BandTitle id="trust-title" icon={TRUST_GLYPH}>
          Trusted by
        </BandTitle>

        {/* A trust band is not a navigation. Every mark here is a `<div>`,
            never a link, and none of them carries `data-tile` — the shell's
            spatial navigation reads that attribute to build its set of stops,
            so leaving it on would make three non-destinations keyboard stops
            the arrow keys could land on, which is a dead end in a game menu.

            The band is a credential, and a credential is not an offer. A
            visitor who recognises FEPS already knows how to find FEPS; the
            job of the strip is to say the studio works with organisations of
            that kind, which it does by existing. It also removes the
            asymmetry that was there before — one mark linked to our own case
            study while the other two linked nowhere, so the row's behaviour
            depended on which logo you happened to point at.

            Hovering still brightens a mark (see `.rosterTile:hover`), and that
            is not a contradiction: a hover reacting is a claim about the
            logo, a link is a claim about a destination. Only the second one
            is gone. `cursor` stays default and the pointer does not become a
            link hand, so the band never promises anywhere to go.

            If a client later wants a link from here, the honest place is the
            case study (which already links out to the live site) or a
            dedicated work page, not a trust band that is doing a different
            job. */}
        <ul className={styles.roster}>
          {CLIENTS.map((client) => (
            <li key={client.name} className={styles.rosterSlot}>
              <div
                className={styles.rosterTile}
                title={client.name}
                aria-label={client.name}
              >
                <Image
                  src={client.logo}
                  alt=""
                  width={200}
                  height={200}
                  className={`${styles.rosterMark} ${
                    client.tone === "ink" ? styles.logoInk : ""
                  } ${client.form === "emblem" ? styles.rosterEmblem : ""}`}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
