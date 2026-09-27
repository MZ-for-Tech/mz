export type ServiceData = {
  /** The two-digit ordinal, "01"–"03". Present in the data rather than
   *  derived from array position so inserting a pillar later cannot silently
   *  renumber the ones after it. */
  id: string;
  /** The verb. This is the word the pillar is named for. */
  pillar: string;
  title: string;
  tagline: string;
  capabilities: string[];
};

/**
 * The three pillars, as data.
 *
 * This was duplicated before: once as a `SERVICES` array in
 * ServicesAccordion, which only the mobile branch read, and again as
 * hand-written JSX in ServicesBento's three text tiles, which only the
 * desktop branch read. Two lists describing the same three things, free to
 * drift, and a real risk of the phone and the desktop describing different
 * services.
 *
 * It lives here, beside lib/projects, and the panel maps it. A fourth pillar
 * is a data entry: the count in the header, the numbering and the layout are
 * all derived from the array rather than written out per service.
 */
export const SERVICES: ServiceData[] = [
  {
    id: "01",
    pillar: "BUILD",
    title: "Software",
    tagline: "We make systems that work.",
    capabilities: [
      "Custom websites & landing pages",
      "E-commerce & digital storefronts",
      "ERP & internal operations systems",
    ],
  },
  {
    id: "02",
    pillar: "DEPLOY",
    title: "Artificial Intelligence",
    tagline: "We give machines judgment.",
    capabilities: [
      "Custom specialized models",
      "Model fine-tuning & pruning",
      "Cost-optimized local inference",
    ],
  },
  {
    id: "03",
    pillar: "TEACH",
    title: "Knowledge Transfer",
    tagline: "We make expertise replicable.",
    capabilities: [
      "Premium institutional workshops",
      "Statistical thinking & data literacy",
      "Digital-first educational content",
    ],
  },
];

/** The ordinal the last pillar currently reaches, for the header's count. */
export const SERVICE_COUNT = SERVICES.length;
