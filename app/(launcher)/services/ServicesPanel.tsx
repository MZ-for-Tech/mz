import Link from "next/link";
import { SERVICES, SERVICE_COUNT } from "@/lib/services";
import styles from "./page.module.css";

/**
 * Services, as a launcher panel.
 *
 * WHAT THIS USED TO BE
 *
 * A seven-tile bento: three live WebGL2 contexts (three `Grainient` canvases,
 * each with its own shader program, RAF loop, ResizeObserver and
 * IntersectionObserver), three CSS/SVG "animated mockup" scenes running
 * nineteen infinite keyframe animations between them, a second set of the
 * same three scenes plus four `filter: blur()` layers per card on mobile, and
 * a staggered GSAP reveal that promoted all seven tiles to their own
 * compositor layer. It was the heaviest thing in the repository by a wide
 * margin, and it rendered three GL contexts to say three sentences.
 *
 * So: the section is now type. There is no canvas, no shader, no keyframe
 * loop and no client component — this file is a server component, so all of
 * it arrives in the HTML and the panel ships zero JavaScript. The whole cost
 * of this page is the words in it.
 *
 * The staleness is deliberate and it is the point. The old bento was a
 * portfolio-piece: an argument for the studio's technical range, built with
 * the range it was arguing for. But this is a services page, and a visitor
 * on it is asking "can you do my thing" — not "are these people clever". The
 * capabilities are already a plain list of words; the thing they were wrapped
 * in was decoration costing three GL contexts per visit. When there are real
 * assets — actual work, not synthetic mockups — they go here, and the
 * structure is already a slot for one image per pillar.
 *
 * WHY IT IS A DASHBOARD AND NOT A HERO
 *
 * Because that is what the launcher's other panels already are, and this one
 * had drifted into a different product entirely. The tile treatment here is
 * the launcher's own (`box-shadow: inset` ring, 4px radius, the yellow
 * hover), the row rhythm is the same 6px gutter as the work shelf, and the
 * type scale is the shell's. Nothing on this panel is a component the
 * visitor hasn't already seen.
 *
 * NO COUNT, NO DUPLICATED INDEX
 *
 * The header states how many pillars there are because that is genuinely the
 * headline of the content, but the "3 pillars. One team." accent tile is
 * gone: the same fact was being said twice, in a tile that existed to fill
 * the bento's grid rather than to carry anything. The per-pillar `01`–`03`
 * numbers are the only indices, and they come from the data, so a fourth
 * pillar doesn't leave a stale count behind.
 *
 * THE CAPABILITIES REVEAL ON HOVER, NOT ON SCROLL
 *
 * A row of three pillars is short enough to read at a glance, so the
 * capabilities are simply there — dimmed, not hidden. Tying them to hover
 * meant the desktop revealed exactly what a phone could not, which is the
 * wrong asymmetry: on a touch device there is no hover at all, so a
 * hover-only reveal is a feature the phone silently doesn't have. The
 * `data-tile` attribute and the shell's arrow-key navigation still work —
 * these are focusable rows, not decoration.
 */

export default function ServicesPanel() {
  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@graph": SERVICES.map((service) => ({
      "@type": "Service",
      "@id": `https://www.mzfortech.com/services#${service.id}`,
      name: service.title,
      serviceType: service.pillar,
      description: `${service.tagline} ${service.capabilities.join(". ")}.`,
      provider: { "@id": "https://www.mzfortech.com/#organization" },
      url: "https://www.mzfortech.com/services",
    })),
  };

  return (
    <div className={styles.panel}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <div className={styles.intro}>
        <h1 className={styles.title}>Services</h1>
        <p className={styles.count}>
          {SERVICE_COUNT} pillars. One team.
        </p>
      </div>

      <ul className={styles.pillars}>
        {SERVICES.map((service) => (
          <li key={service.id} className={styles.pillar}>
            <article
              data-tile
              tabIndex={0}
              className={styles.card}
              aria-label={`${service.pillar} — ${service.title}. ${service.tagline}`}
            >
              <div className={styles.head}>
                <span className={styles.id}>{service.id}</span>
                <span className={styles.pillarLabel}>{service.pillar}</span>
              </div>

              <h2 className={styles.cardTitle}>{service.title}</h2>
              <p className={styles.tagline}>{service.tagline}</p>

              <ul className={styles.capabilities}>
                {service.capabilities.map((capability) => (
                  <li key={capability} className={styles.capability}>
                    {capability}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ul>

      {/* The brief is the one thing a services page exists to produce, and
          the launcher already has a form that collects it. A closing
          "get in touch" that bounced to a different route was the old
          pattern; this stays in the shell. */}
      <p className={styles.closer}>
        <Link href="/contact" data-tile className={styles.closerLink}>
          Tell us what you&apos;re building
        </Link>
      </p>
    </div>
  );
}
