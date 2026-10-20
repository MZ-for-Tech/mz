import Image from "next/image";
import Link from "next/link";
import ObfuscatedEmail from "@/components/ObfuscatedEmail/ObfuscatedEmail";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Brand Guidelines",
  description:
    "A practical guide to Model Zero's identity: logo use, colors, typography, visual language and writing style, with examples for consistent presentation.",
  path: "/brand",
});

const colors = [
  { name: "Obsidian", value: "#0D0F08" },
  { name: "Night surface", value: "#141508" },
  { name: "Warm white", value: "#F5F5F0" },
  { name: "Paper", value: "#F8F7F2" },
  { name: "Soft yellow", value: "#FFE78D" },
  { name: "Olive", value: "#5A7A0A" },
  { name: "Green / dark theme", value: "#88B600" },
  { name: "Green / light theme", value: "#00FF41" },
];

const markStudies = [
  { label: "Geometric / white", src: "/brand/mz-monogram-geometric.png", alt: "White geometric MZ monogram on black" },
  { label: "Interlocking / black", src: "/brand/mz-monogram-interlocking.png", alt: "Interlocking black MZ monogram on white" },
  { label: "Neon / transparent", src: "/brand/mz-monogram-neon-isolated.png", alt: "Neon MZ monogram on a transparent background" },
  { label: "Neon / glow", src: "/brand/mz-monogram-neon-glow.png", alt: "Glowing neon MZ monogram on black" },
];

export default function BrandPage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.title}>
            Make the complex
            <br />
            <span>feel clear.</span>
          </h1>
          <p className={styles.lede}>A visual guide to the Model Zero identity.</p>
        </div>
      </header>

      <div className={styles.guideLayout}>
        <div className={styles.sections}>
          <section id="foundation" className={styles.section}>
            <SectionHeading title="Foundation" />
            <p className={`${styles.statement} ${styles.foundationStatement}`}>
              Model Zero builds custom software and AI systems, then helps
              teams understand and operate them.
            </p>
            <p className={styles.draftNote}>Positioning is a working summary of current MZ materials.</p>
          </section>

          <section id="architecture" className={styles.section}>
            <SectionHeading title="Brand architecture" />
            <div className={styles.architecture}>
              <div className={styles.architectureRoot}>
                <Image src="/model-zero-logo-texture.png" alt="" width={1254} height={1254} />
                <strong>Model Zero</strong>
              </div>
              <div className={styles.architectureChildren}>
                <article className={styles.architectureMZ}>
                  <div className={`${styles.architectureVisual} ${styles.architectureMZVisual}`}>
                    <h3>MZ</h3>
                  </div>
                  <p>Short form after first mention.</p>
                </article>
                <article className={styles.architectureResearch}>
                  <div className={`${styles.architectureVisual} ${styles.architectureResearchVisual}`}><h3>The Null<br />Hypothesis</h3></div>
                  <p>Research publication of MZ.</p>
                </article>
              </div>
            </div>
          </section>

          <section id="mark" className={styles.section}>
            <SectionHeading title="The mark" />
            <div className={styles.logoExamples}>
              <figure className={styles.logoExampleDark}>
                <Image src="/model-zero-logo-texture.png" alt="MZ mark used at its original proportions on a dark field" width={1254} height={1254} className={styles.exampleLogo} />
                <figcaption>Dark background</figcaption>
              </figure>
              <figure className={styles.logoExampleLight}>
                <Image src="/model-zero-logo-texture.png" alt="MZ mark used at its original proportions on a light field" width={1254} height={1254} className={styles.exampleLogo} />
                <figcaption>Light background</figcaption>
              </figure>
              <figure className={`${styles.logoMisuse} ${styles.logoStretched}`}>
                <Image src="/model-zero-logo-texture.png" alt="Incorrectly stretched MZ mark" width={1254} height={1254} className={styles.exampleLogo} />
                <figcaption>Avoid stretching</figcaption>
              </figure>
              <figure className={`${styles.logoMisuse} ${styles.logoCropped}`}>
                <Image src="/model-zero-logo-texture.png" alt="Incorrectly cropped MZ mark" width={1254} height={1254} className={styles.exampleLogo} />
                <figcaption>Avoid cropping</figcaption>
              </figure>
              <figure className={`${styles.logoMisuse} ${styles.logoRotated}`}>
                <Image src="/model-zero-logo-texture.png" alt="Incorrectly rotated MZ mark" width={1254} height={1254} className={styles.exampleLogo} />
                <figcaption>Avoid rotating</figcaption>
              </figure>
            </div>
          </section>

          <section id="mark-studies" className={styles.section}>
            <SectionHeading title="Approved variants" />
            <div className={styles.markStudies}>
              {markStudies.map((study) => (
                <figure className={styles.markStudy} key={study.src}>
                  <Image src={study.src} alt={study.alt} width={1254} height={1254} sizes="(max-width: 640px) 50vw, (max-width: 1000px) 50vw, 230px" />
                  <figcaption>{study.label}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section id="color" className={styles.section}>
            <SectionHeading title="Color" />
            <ul className={styles.colorGrid}>
              {colors.map((color) => (
                <li className={styles.colorCard} key={color.name}>
                  <span className={styles.swatch} style={{ backgroundColor: color.value }} />
                  <div className={styles.colorMeta}>
                    <strong>{color.name}</strong>
                    <code>{color.value}</code>
                  </div>
                </li>
              ))}
            </ul>
            <div className={styles.colorNote}>
              <p>Use quiet neutrals for reading and accents for emphasis. The two greens need confirmation; print values are not yet defined.</p>
            </div>
            <div className={styles.contrastPairs}>
              <h3>Accessible text pairings</h3>
              <div><span>Warm white on obsidian</span><strong>17.6:1</strong></div>
              <div><span>Yellow on obsidian</span><strong>15.7:1</strong></div>
              <div><span>Obsidian on paper</span><strong>18.0:1</strong></div>
              <small>Contrast ratios are calculated from the listed screen colors.</small>
            </div>
          </section>

          <section id="type" className={styles.section}>
            <SectionHeading title="Typography" />
            <div className={styles.typeSpecimens}>
              <div className={`${styles.typeSpecimen} ${styles.typeGeist}`}>
                <p>We make<br />systems that work.</p>
                <small>Geist</small>
              </div>
              <div className={`${styles.typeSpecimen} ${styles.typeMono}`}>
                <p>AI / APPLIED RESEARCH</p>
                <small>JetBrains Mono</small>
              </div>
              <div className={`${styles.typeSpecimen} ${styles.typeEditorial}`}>
                <p>The Null Hypothesis</p>
                <small>Editorial serif</small>
              </div>
            </div>
          </section>

          <section id="visual-language" className={styles.section}>
            <SectionHeading title="Visual language" />
            <div className={styles.visualImage}>
              <Image src="/green_glass.webp" alt="Green geometric glass texture used in MZ's visual identity" width={600} height={900} />
            </div>
            <div className={styles.principles}>
              <div><strong>Structure first</strong><p>Clear blocks. Open space.</p></div>
              <div><strong>Edges stay crisp</strong><p>Fine lines. Quiet surfaces.</p></div>
              <div><strong>Motion has meaning</strong><p>Show state or sequence.</p></div>
            </div>
          </section>

          <section id="voice" className={styles.section}>
            <SectionHeading title="Voice" />
            <div className={styles.voiceGrid}>
              <div className={styles.voiceIntro}>
                <p className={styles.voiceLine}>Confident in the work.<br /><em>Plainspoken with people.</em></p>
                <p>Direct, precise, and useful. Treat the reader as a capable partner.</p>
              </div>
              <div className={styles.voiceRules}>
                <div><p>Use direct verbs and concrete outcomes.</p></div>
                <div><p>Make technical claims specific and supportable.</p></div>
              </div>
            </div>
            <div className={styles.boilerplate}>
              <p>Model Zero is a Cairo-based software and AI studio. We build custom systems and help teams run them.</p>
            </div>
          </section>

          <section id="applications" className={styles.section}>
            <SectionHeading title="Applications" />
            <div className={styles.applicationGrid}>
              <article>
                <div className={styles.applicationVisual}>
                  <Image src="/model-zero-logo-texture.png" alt="MZ mark on the studio website" width={1254} height={1254} />
                </div>
                <h3>Website</h3><Link href="/services">View services ↗</Link>
              </article>
              <article>
                <div className={`${styles.applicationVisual} ${styles.applicationResearch}`}>The Null<br />Hypothesis</div>
                <h3>Research</h3><Link href="/research">View research ↗</Link>
              </article>
              <article>
                <div className={`${styles.applicationVisual} ${styles.applicationClient}`}>
                  <Image src="/logos/nested-united.svg" alt="Nested United client logo" width={600} height={240} />
                </div>
                <h3>Client work</h3><Link href="/work/nested-united">View a case study ↗</Link>
              </article>
            </div>
          </section>

          <section id="assets" className={styles.section}>
            <SectionHeading title="Assets & use" />
            <div className={styles.resourceRow}>
              <div><strong>Full-color MZ mark</strong><span>Transparent PNG · 1254 × 1254 px</span></div>
              <a href="/model-zero-logo-texture.png" download>Download asset <span aria-hidden="true">↓</span></a>
            </div>
            <p className={styles.resourceNote}>Vector and print variants are not yet available.</p>
          </section>

          <section id="logo-use" className={styles.section}>
            <SectionHeading title="How to use MZ logos" />
            <div className={styles.markUse}>
              <div>
                <h3>Do</h3>
                <ul>
                  <li>Use the mark to identify Model Zero, our work, or an agreed collaboration.</li>
                  <li>Use approved variants as supplied; preserve their shape, clear space, and legibility.</li>
                  <li>Keep our mark secondary to yours. Ask before using it in promotion or merchandise.</li>
                </ul>
              </div>
              <div>
                <h3>Don’t</h3>
                <ul>
                  <li>Imply MZ endorses, sponsors, or partners with you without our approval.</li>
                  <li>Alter, crop, rotate, or recreate the mark, or use it as your own branding or trademark.</li>
                  <li>Use it in an unrelated context or create a confusingly similar design.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="usage-terms" className={styles.section}>
            <SectionHeading title="Usage terms" />
            <div className={styles.usageTerms}>
              <p>MZ’s name, marks, and supplied logo files identify Model Zero. Use them only within the scope below; displaying a mark does not imply MZ’s endorsement or partnership.</p>
              <p>Permission to use MZ marks is limited to these conditions:</p>
              <ul>
                <li>Use approved artwork as supplied and follow these guidelines.</li>
                <li>Use a mark to identify MZ, MZ work, or a collaboration approved by MZ.</li>
                <li>Keep the MZ mark secondary to your own identity. Do not include it in your brand, product name, or trademark.</li>
                <li>Get written approval before using it in advertising, merchandise, packaging, or other unapproved contexts.</li>
              </ul>
              <p>When a use falls outside these terms, contact MZ for approval before publishing. MZ may request changes to uses that misrepresent its identity or relationship.</p>
            </div>
          </section>

          <section id="contact" className={styles.section}>
            <SectionHeading title="Contact" />
            <p className={styles.brandContact}>For questions about these guidelines or permission to use MZ logos, contact <ObfuscatedEmail user="hello" />.</p>
          </section>

        </div>
      </div>
    </main>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className={styles.sectionHeading}>
      <h2>{title}</h2>
    </div>
  );
}
