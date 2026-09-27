export interface ProjectProcessStep {
  phase: string;
  title: string;
  description: string;
}

export type ProjectKind = "work" | "product";

/**
 * The three claims the home page's Featured band makes.
 *
 * A fixed tuple, not a free string, because the band is an argument with a
 * shape: three slots, always, one project each. Typing the slot rather than
 * labelling it inline means the label, the glyph and the grid position can
 * never disagree about which claim a tile is making — the band reads this list
 * to build itself.
 *
 * The ORDER HERE IS NOT THE ORDER THEY APPEAR. This is the canonical
 * enumeration, research → client work → product, because that is the argument
 * in the order the eye should travel: what we study, what we build for other
 * people, what we keep. Which of the three is the centrepiece on the home
 * page is declared separately, in `APEX_SLOT` on the home page — that is a
 * statement about layout and it changes; this is a statement about what the
 * studio is and it does not. Keeping them apart is what lets the apex move
 * without re-arguing what the three claims are.
 */
export const FEATURED_SLOTS = [
  { id: "research", label: "Research" },
  { id: "work", label: "Client Work" },
  { id: "product", label: "Product" },
] as const;

export type FeaturedSlot = (typeof FEATURED_SLOTS)[number]["id"];

/**
 * One project, in one shape.
 *
 * Work and products used to be separate things on this site — a case-study
 * grid and a single hardcoded product card — which implied the studio had
 * shipped client work before it had. They are now one collection: the shelf
 * treats a proprietary product and a client's platform identically, because
 * from the visitor's side that is the truth. `kind` exists only so a detail
 * view can label them differently.
 *
 * Media is a field, not a branch. `coverImage` is what the stage shows; when
 * a project has a promotional video later, `video` fills in and the stage
 * swaps the still for a poster-to-video transition on intent. Nothing about
 * adding a project should require touching a component.
 */
export interface ProjectData {
  id: string;
  slug: string;
  name: string;
  kind: ProjectKind;
  /** Whose work it is. The studio's own name for proprietary products. */
  client: string;
  category: string;
  year: string;
  tagline: string;
  description: string;
  tags: string[];
  accentColor: string;
  accentColorRgb: string;
  themeBg?: string;
  themeText?: string;
  fontFamily?: "sans" | "serif" | "mono";
  isPrivate: boolean;
  link?: string;
  /** Square mark for the shelf tile. Falls back to a typographic tile. */
  logo?: string;
  /**
   * Which of the three home-page claims this project is the proof of.
   *
   * The Featured band is not "the two best projects" — it is a three-way
   * statement of what the studio IS, and the three slots are the argument:
   * research, client work, proprietary product. That mirrors the wordmark
   * (Research. Software. Knowledge.) instead of inventing a new taxonomy for
   * a homepage, and it answers "what is MZ" in one glance rather than
   * requiring a visitor to infer a category from a list of names.
   *
   * It is declared rather than derived. The obvious alternative — pick the
   * first `work` and the first `product` from the array — makes the layout
   * read a project's POSITION, which is the exact fragility `prominent`
   * replaced earlier: reordering the collection to taste would silently
   * change what the homepage says. Declaring the slot means a fifth project
   * cannot steal a claim, and moving a project between slots is one word.
   *
   * Only one project per slot is intentional. A second product or a second
   * research arm is a real editorial decision about the homepage's shape, not
   * something the grid should absorb silently.
   */
  featuredSlot?: FeaturedSlot;
  /**
   * Whether this project appears in the Work shelf. Absent means yes.
   *
   * The shelf is ALL of the studio's work — client commissions and
   * proprietary products alike, because from the outside they are the same
   * thing: things MZ built. Misura, Z Studio and Thanawaya are products and
   * all three belong on it, and `kind: "product"` is a distinction the shelf
   * does not make and should not: the tab answers "what has this studio
   * built", not "who paid for it".
   *
   * So this flag is NOT how a product is kept off the shelf. It exists for
   * one entry: The Null Hypothesis, which is not a build at all. It is a
   * research portal the studio publishes — there is no artefact behind it to
   * put on a shelf of built things, and listing it there asked a visitor to
   * look at a publication and read it as a deliverable. It still holds a
   * Featured slot on the home page, which is where a research arm belongs.
   */
  showOnWorkShelf?: boolean;
  /**
   * The stage's resting state — optional, and never faked.
   *
   * A project with no screenshot has no stage: the panel shows the DarkVeil
   * background, which is a legitimate state and looks deliberate. Pointing
   * `coverImage` at someone else's artwork to avoid an empty box is worse than
   * an empty box — it shows the wrong project's work under this project's
   * name, which is simply a lie. Absent means absent, until a real screenshot
   * exists.
   */
  coverImage?: string;
  /**
   * What the stage shows while there is no `coverImage` worth using.
   *
   * TEMPORARY, and deliberately separate from `coverImage` so that clearing
   * this later is a one-line deletion rather than a change of intent. The
   * screenshot is the real resting state — it is the thing the stage is for,
   * and a mark on a white field is a placeholder for it, not a replacement.
   *
   * It is here at all because an empty stage reads as a failed load rather
   * than as a deliberate state, and because a project with real work behind
   * it should not present as a blank rectangle. Absent means the stage falls
   * through to the DarkVeil, which is the honest answer for a project that
   * has no logo either.
   */
  stagePlaceholder?: "mark";
  /**
   * A live field behind the home-page tile, when the project's own visual
   * language IS one. Currently only `"stream"`.
   *
   * Declared rather than inferred, which is the whole point. It used to be the
   * third branch of a resolution chain — a tile with neither artwork nor a
   * mark got a data-stream — so every assetless project silently inherited
   * the same live canvas. That is a placeholder wearing a costume: it is the
   * most expensive thing a tile can carry (a canvas, a RAF loop, a particle
   * field) spent on a project that has no screenshot, and it put one product's
   * design language behind another product's name.
   *
   * So a project asks for a field or does not. The Null Hypothesis asks: a
   * drifting field of symbols is that portal's own aesthetic, so the tile
   * reads as a portal instead of as a placeholder. Absent means a flat panel
   * carrying the name, which is cheaper and more honest than borrowing.
   */
  heroField?: "stream";
  /** Promotional footage, when it exists. */
  video?: string;
  /** Still used as the video's poster. */
  videoPoster?: string;
  screenshots: string[];
  /** Deep-dive page, when there is one to read. */
  hasCaseStudy?: boolean;
  process: ProjectProcessStep[];
  highlights: { label: string; value: string }[];
}

/**
 * How a mark behaves against the dark shell.
 *
 * Boxless logos sit directly on the shader, so a mark's legibility depends on
 * the ink it was drawn in — which is a property of the artwork, not something
 * a stylesheet can guess from a file. Declaring it here means a client logo
 * dropped in later cannot silently disappear, and it is why the wall needs no
 * per-logo card to hide behind.
 *
 *   ink    — monochrome and dark (a bare `#000` path). Invisible on the shell;
 *            inverted to white at render.
 *   light  — already pale, drawn for a dark ground. Left alone.
 *   color  — full-colour artwork with its own contrast. Left alone.
 */
export type LogoTone = "ink" | "light" | "color";

/**
 * What shape the mark is, which decides how much room it needs.
 *
 *   wordmark — a horizontal lockup. Height is its optical weight, so every
 *              wordmark in a row can share one size cap.
 *   emblem   — a seal, badge or other contained mark. A circle of the same
 *              height carries far less visual weight than a word of it: at a
 *              shared 48px cap, a 48px disc simply reads smaller than a 48px
 *              line of letterforms. Emblems therefore run larger.
 *
 * This is a property of the artwork, exactly like `tone` — which is why it
 * lives here rather than as a per-logo class in the stylesheet. A logo added
 * later declares its own form and needs no rule written for it. Absent means
 * `wordmark`, so a new entry that says nothing still renders correctly.
 */
export type LogoForm = "wordmark" | "emblem";

export interface ClientLogo {
  name: string;
  /** What the organisation is. A logo alone is a badge; a logo next to the
   *  sector it operates in is a reference. This is the difference between
   *  "a collection of marks" and "these are the places we work". */
  sector: string;
  logo: string;
  tone: LogoTone;
  /** Defaults to "wordmark". See LogoForm. */
  form?: LogoForm;
  /**
   * NO href — the trust band is a credential, not a navigation.
   *
   * There was one here, pointing at our own Nested United case study, so the
   * strip's behaviour depended on which mark you pointed at: one of three
   * logos was a link to somewhere on this site and the other two were not.
   * That is a worse problem than the link being wrong.
   *
   * A visitor who recognises a client logo already knows how to reach that
   * client; the strip's only job is to say the studio works with
   * organisations of this kind. Where a client IS worth a link — the live
   * site, a case study — that link lives on the work and case-study pages,
   * which are about the work. Adding `href` back here would put three
   * keyboard stops and three hover affordances on a band that is meant to be
   * read, and `data-tile` would make them arrow-key destinations in a menu
   * that promises every stop leads somewhere.
   */
}

/**
 * Who we've worked with, in display order.
 *
 * A roster, not a logo wall. These are real organisations doing real work, so
 * each one carries its sector alongside the mark: a visitor who doesn't
 * recognise FEPS still learns that it's an events management system, and the
 * row stops reading as decorative branding.
 *
 * Lux is the reason this is separate from PROJECTS: we worked with them, but
 * there is no shelf entry and no case study.
 */
export const CLIENTS: ClientLogo[] = [
  {
    name: "Nested United",
    sector: "Real estate platform & portal",
    logo: "/logos/nested-united.svg",
    tone: "ink",
  },
  {
    name: "FEPS",
    sector: "Events management system",
    logo: "/logos/feps.png",
    tone: "color",
    // A circular seal, not a wordmark — see LogoForm for why that needs a
    // larger cap to carry the same weight as the two wordmarks beside it.
    form: "emblem",
  },
  {
    name: "Lux",
    sector: "Actuaries & consultants",
    logo: "/logos/lux.png",
    tone: "light",
  },
];

/**
 * The shelf, in display order.
 *
 * These are names only, until the real details, marks and screenshots land.
 * Anything that doesn't exist yet is simply absent — no placeholder image, no
 * stand-in copy standing in for a real answer. A project with no `coverImage`
 * gets no stage and the DarkVeil background shows through instead, which is
 * a state that looks deliberate rather than broken.
 *
 * `featuredSlot` and `showOnWorkShelf` are the only things either layout
 * reads, and both are read as declarations rather than as positions. A
 * project's place on the home page and on the work shelf is something it
 * states, not something it inherits from where it happens to sit in this
 * array. Inserting a project mid-array therefore cannot silently steal a
 * claim or a shelf tile, which is what made an earlier version of the home
 * grid move every tile on the page each time a new entry was typed in.
 */
export const PROJECTS: ProjectData[] = [
  {
    id: "01",
    slug: "zstudio",
    name: "Z Studio",
    kind: "product",
    client: "MZ",
    category: "Platform",
    year: "2025",
    tagline: "",
    description: "",
    tags: [],
    accentColor: "#88b600",
    accentColorRgb: "136, 182, 0",
    isPrivate: false,
    screenshots: [],
    process: [],
    highlights: [],
  },
  {
    id: "02",
    slug: "misura",
    name: "Misura",
    kind: "product",
    client: "MZ",
    category: "Platform",
    year: "2025",
    tagline: "",
    description: "",
    tags: [],
    accentColor: "#88b600",
    accentColorRgb: "136, 182, 0",
    isPrivate: false,
    // The proprietary product, and the right-hand slot on the home page. It
    // is the one thing a visitor cannot get from anyone else, which is why
    // the band ends on it — the argument finishes on the asset MZ owns.
    //
    // It also stays on the Work shelf, where it belongs like everything else
    // the studio has built. See `showOnWorkShelf` for why that flag is about
    // the research portal and not about products.
    featuredSlot: "product",
    // Outbound to the product's own site on the studio's domain, so the tile
    // reads as "here is the thing" rather than as a link back into this site.
    // `link` (not `hasCaseStudy`) is what makes the hero an external anchor,
    // and it is also what puts the ↗ glyph on the action bar instead of ▶.
    link: "https://misura.mzfortech.com",
    screenshots: [],
    process: [],
    highlights: [],
  },
  {
    id: "03",
    slug: "thanawaya-bank",
    name: "Thanawaya Bank",
    kind: "product",
    client: "MZ",
    category: "Platform",
    year: "2025",
    tagline: "",
    description: "",
    tags: [],
    accentColor: "#88b600",
    accentColorRgb: "136, 182, 0",
    isPrivate: false,
    screenshots: [],
    process: [],
    highlights: [],
  },
  {
    id: "04",
    slug: "feps",
    name: "FEPS",
    kind: "work",
    client: "FEPS",
    category: "Events Management System",
    year: "2025",
    tagline: "",
    description: "",
    tags: [],
    accentColor: "#88b600",
    accentColorRgb: "136, 182, 0",
    isPrivate: false,
    // The mark already exists for the client roster; the shelf tile was
    // showing "F" because it declared no logo. Pointing at the same file is
    // the point — one mark, two surfaces, no second copy to keep in step.
    logo: "/logos/feps.png",
    // Same temporary treatment as Nested United: the seal on a light field
    // until a current capture of the events system exists. See
    // `stagePlaceholder` — clearing this line once a screenshot is chosen is
    // the whole change.
    stagePlaceholder: "mark",
    screenshots: [],
    process: [],
    highlights: [],
  },
  {
    id: "05",
    slug: "null-hypothesis",
    name: "The Null Hypothesis",
    kind: "product",
    client: "MZ",
    category: "Research",
    year: "2025",
    tagline: "Theory comes first.",
    description:
      "MZ research, made explorable: ideas and methods traced from the question to the products they inform.",
    tags: ["Research", "Publishing"],
    accentColor: "#88b600",
    accentColorRgb: "136, 182, 0",
    isPrivate: false,
    link: "/research",
    // The research claim, and the left-hand slot. It is the only thing on the
    // site that is both a product and a publication, which is why it leads
    // the argument rather than appearing somewhere in the middle of it.
    featuredSlot: "research",
    // The one tile that asks for a live field, and it earns it: a drifting
    // stream of symbols IS the portal's own aesthetic, so the tile reads as
    // a research portal rather than as a project with no screenshot. See
    // `heroField` — this is declared per project precisely so no other tile
    // inherits it by having no artwork.
    heroField: "stream",
    // Kept out of the Work shelf — see `showOnWorkShelf`. It is the research
    // arm, not a client commission, and its Featured slot is where it belongs.
    showOnWorkShelf: false,
    screenshots: [],
    process: [],
    highlights: [],
  },
  {
    id: "06",
    slug: "nested-united",
    name: "Nested United",
    kind: "work",
    client: "Nested United Inc.",
    category: "Web Platform & Portal",
    year: "2024",
    // The client-work claim, and the middle slot. It is the only project with
    // a case study, so it is the one that can actually prove the claim rather
    // than assert it — which is why it is not a small tile on a shelf but the
    // centre of the argument.
    featuredSlot: "work",
    tagline:
      "A unified digital presence engineered for real estate transparency & institutional scale.",
    description:
      "Nested United required an architecture that bridges high-end architectural aesthetics with rigorous data management. We designed and built a sleek, modern web platform engineered to convey trust, clarity, and institutional capability.",
    tags: ["Web Architecture", "Frontend Systems", "Branding"],
    accentColor: "#88b600",
    accentColorRgb: "136, 182, 0",
    themeBg: "#0D0F08",
    themeText: "#F5F5F0",
    fontFamily: "sans",
    isPrivate: false,
    // NO `link` here, deliberately.
    //
    // `link` is what makes a hero tile an external anchor, and this project
    // has a case study — a long-form page on THIS site explaining what was
    // built and why. With `link` set, the card opened the client's own
    // homepage instead: a visitor who pressed the tile labelled "View case
    // study" was sent to a marketing site, which is the one destination that
    // cannot tell them anything about the work. The case study is the thing
    // this studio is selling, so it wins.
    //
    // The client's own site is still one click away — the case study page
    // links out to it. The tile states what the studio did; the case study
    // shows it; the live site is the client's to speak for.
    logo: "/logos/nested-united.svg",
    // The desktop screenshot is held back from the stage for now — the mark on
    // a white field is the resting state until a current capture is chosen.
    // The files are untouched in `screenshots` below and the stage renders
    // `coverImage` whenever it is set, so putting this line back is the whole
    // change.
    stagePlaceholder: "mark",
    screenshots: ["/nested/screenshots/desktop.webp", "/nested/screenshots/mobile.webp"],
    hasCaseStudy: true,
    process: [
      {
        phase: "01 / DISCOVERY",
        title: "Deconstructing Complex Real Estate Data",
        description: "Mapped out data dependencies and established a design language rooted in structural elegance and minimal friction.",
      },
      {
        phase: "02 / ARCHITECTURE",
        title: "High-Performance Next.js Frontend",
        description: "Built a responsive, hardware-accelerated web experience with subtle micro-interactions and instant route transitions.",
      },
      {
        phase: "03 / DEPLOYMENT",
        title: "Zero-Downtime Infrastructure",
        description: "Configured resilient hosting pipelines and performance budgets to maintain 60fps rendering across all viewport sizes.",
      },
    ],
    highlights: [
      { label: "Performance Score", value: "99/100" },
      { label: "Frame Rate", value: "60 FPS" },
      { label: "Design System", value: "Custom Architectural" },
    ],
  },
];
