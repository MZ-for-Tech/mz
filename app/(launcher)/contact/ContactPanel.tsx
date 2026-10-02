"use client";

import { useRef, useState, type FormEvent } from "react";
import { measure } from '@/lib/measurement';
import Link from "next/link";
import ObfuscatedEmail from "@/components/ObfuscatedEmail/ObfuscatedEmail";
import styles from "./page.module.css";

/**
 * The brief, as a launcher panel.
 *
 * The fields are unchanged from the original /start page — they were
 * carried over verbatim when the brief moved into the shell. What did not
 * survive the move was the page's SCALE, and that is what this restores.
 *
 * A 1600px measure, 80px between the columns and between the sections,
 * pills at 16px/32px and 1.1rem, inputs at 1.1rem, a submit plate at
 * 20px/48px. The in-shell version shrank all of it by about 40% at once,
 * inside the same 7.5rem of header chrome, and the brief stopped being a
 * page you sat down to and became a form you squeezed through.
 *
 * The six bordered section cards are gone for the same reason. A brief is
 * one continuous act of filling something in; six boxes broke it into six
 * separate widgets. The hairline under each title and the 80px of space
 * between sections do that job, which is what the original used them for.
 *
 * The original mounted its own DarkVeil, PillNav and Footer. The shell
 * supplies all three now, so none of them are here — and there is
 * deliberately no second WebGL backdrop, because a brief should be the
 * quietest page on the site.
 *
 * AND ONE INLINE STYLE, FOR THE STICKY COLUMN
 *
 * The left column is sticky, and that is the effect the original was built
 * around. It could not work through the CSS module alone: the shell gives
 * its content box `overflow-y: auto`, and because this panel is ~1900px on
 * a 900px screen that box gets stretched to the panel's own height — an
 * `auto` box as tall as its contents never scrolls, so the sticky element
 * found a scrollport it could not move in and simply travelled with the
 * form. Measured at 800px of scroll: intro at y=-560, tracking the form
 * one-for-one.
 *
 * Setting `overflowY: "visible"` on that same box makes it stop being a
 * scrollport at all, so the nearest scrolling ancestor becomes the viewport
 * again and the column pins properly — at y=120, flush under the fixed
 * header, while the form is at y=-680. It is the same rule the shell
 * already applies to its own panels, just spelled out here because a panel
 * taller than the viewport is the case the shell's default does not cover.
 */

const CATEGORIES = [
  "Website",
  "ERP",
  "Internal Systems",
  "E-Commerce",
  "AI & Machine Learning",
  "Data Analysis",
  "Workshops",
  "Research Collaboration",
];

/**
 * Budget bands, priced against the market this studio actually sells into.
 *
 * These started at $5,000, which is a US/UK floor. In this market it priced
 * the studio out of the work it actually does: a landing page, a small
 * internal tool or a single automation is a $1–2.5k job here, and a $5k
 * minimum meant the lowest band a visitor could pick was still above their
 * budget — so the field read as "we are not for you" to exactly the clients
 * most likely to reply.
 *
 * The floor is $1,500, and it is a floor rather than a discount. At roughly
 * 51.8 EGP/USD that is ~78,000 EGP, which sits ABOVE the whole Egyptian
 * small-business website band (5,000–55,000 EGP) and roughly five times a
 * $155–290 agency landing page. The cheapest engagement here is bigger than
 * almost anything a local buyer could otherwise commission.
 *
 * What that buys is room to finish. The consistent finding across this
 * market is that projects deviate on scope or budget early — the British
 * Computer Society puts it at 58% of custom software projects in the first
 * six months, with warning signs visible before signature. An engagement
 * under about $1,000 has no slack to absorb a normal overrun, and the job
 * that dies mid-build is the actual risk here, not a low quote. Publishing
 * a band BELOW the floor would be the charity signal; this does not.
 *
 * The bands are spaced by what the work costs to deliver rather than by
 * round marketing numbers, and the top is deliberately open: an ERP or a
 * fine-tuned model running on a client's own hardware runs well past any
 * ceiling worth publishing, and the last band is a real answer rather than
 * a catch-all. Rates in this region sit 40–60% under the Gulf, which is
 * what makes the top of this scale competitive rather than expensive.
 */
const BUDGETS = [
  "Under $1,500",
  "$1,500 — $5,000",
  "$5,000 — $20,000",
  "$20,000+",
  "Let's discuss",
];

const TIMELINES = [
  "Under 1 month",
  "1 — 3 months",
  "3 — 6 months",
  "6+ months",
  "Ongoing / Retainer",
];

/**
 * The studio's social presence.
 *
 * Glyphs are inlined rather than pulled from lucide, which has no brand marks
 * — and this panel inlines its other two icons (paperclip, arrow) for the same
 * reason, so the socials follow that. Three SVGs is cheaper than a package for
 * three static paths.
 */
const SOCIALS = [
  {
    name: "Facebook",
    href: "https://facebook.com/mzfortech",
    glyph: (
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    ),
  },
  {
    name: "X",
    href: "https://x.com/mzfortech",
    glyph: (
      <path d="M17.53 3h3.02l-6.6 7.55L21.75 21h-6.1l-4.78-6.25L5.4 21H2.38l7.06-8.07L2.25 3h6.26l4.32 5.7L17.53 3Zm-1.06 16.17h1.67L7.6 4.74H5.8l10.67 14.43Z" />
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com/mzfortech",
    glyph: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
      </>
    ),
  },
] as const;

/**
 * Where the brief came from.
 *
 * The list this replaces was six options, all of them from a channel that
 * existed before this decade — referral, search, social, academic, the
 * product, other. Three origins that demonstrably produce work in this
 * market were missing, and each was missing for a reason worth recording.
 *
 * "AI assistant" is the one whose absence was doing real damage. This site
 * ships `llms.txt` and a `content.md` in `public/`, and it runs a WebMCP
 * tool surface, so a visitor arriving through any of those found a studio by
 * asking a machine to find one. All of them were ticking "Other" or
 * "Search", and "Search" is specifically wrong for them: an assistant is not
 * a search engine, so those enquiries were being filed as search traffic and
 * misrepresenting where the work actually comes from. AI referrals also
 * convert well above baseline, so it is worth knowing the true size of that
 * lane rather than losing it into a bucket.
 *
 * It is one option and not four on purpose. ChatGPT accounts for the large
 * majority of measurable AI referrals, and visitors do not reliably recall
 * which assistant they used or care to self-classify. Asking for the tool
 * collects a distribution that is already published; asking whether the
 * visit came from an AI at all is the question you can act on. The specific
 * domains (chatgpt.com, claude.ai, gemini.google.com, perplexity.ai) belong
 * in referrer logs, not in a question put to a visitor.
 *
 * "WhatsApp" is the regional omission that mattered most. B2B outreach
 * across MENA runs through it, and for an Egyptian SME the honest answer to
 * "how did you hear about us" is very often that somebody forwarded a link
 * in a group. That is word of mouth arriving by a different pipe, and
 * filing it under "Other" lost the single most common way a small local
 * client finds a studio they trust.
 *
 * "Freelance platform" is the other real one. Upwork and Fiverr are the
 * standard discovery route for regional developers chasing dollar clients,
 * and those briefs arrive with a budget floor and a different expectation of
 * engagement — worth telling apart from a direct enquiry, because the
 * follow-up is not the same.
 *
 * "LinkedIn" is split out of "Social Media" rather than added. LinkedIn is a
 * referral surface in B2B: someone sees a post, forwards it to a colleague,
 * the colleague writes in. Crediting that to "Social Media" attributes the
 * work to a channel that did not produce it and hides the fact that the
 * LinkedIn presence is generating pipeline.
 *
 * Order is deliberate — the origins people recognise, and that are large for
 * this studio, come first. "Other" stays last as the floor.
 */
const REFERRALS = [
  "Referral",
  "WhatsApp",
  "AI assistant",
  "Search",
  "LinkedIn",
  "Freelance platform",
  "Academic / Institution",
  "The Null Hypothesis",
  "Social Media",
  "Other",
];

/** A single-select group of pill options. */
function OptionRow({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  return (
    <div className={styles.options} role="group">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={styles.option}
          aria-pressed={value === option}
          onClick={() => onChange(value === option ? null : option)}
        >
          {option}
        </button>
      ))}
      {/* The group has no visible label of its own — the section heading above
          names it — so screen readers get one here. */}
      <span hidden>{name}</span>
    </div>
  );
}

export default function ContactPanel() {
  const formStarted = useRef(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [budget, setBudget] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [referral, setReferral] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submissionState, setSubmissionState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");

  const submitBrief = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmissionState("sending");
    setSubmissionMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: new FormData(form),
      });
      const result = (await response.json()) as { message?: string; delivered?: boolean };

      if (!response.ok || result.delivered !== true) {
        measure('contact_form_error', '/contact');
        setSubmissionState("error");
        setSubmissionMessage(
          result.message ?? "We couldn't send your brief. Please email us directly."
        );
        return;
      }

      measure('contact_form_success', '/contact');
      form.reset();
      setCategories([]);
      setBudget(null);
      setTimeline(null);
      setReferral(null);
      setFileName(null);
      setSubmissionState("sent");
      setSubmissionMessage("Your brief was accepted for delivery. We'll be in touch soon.");
    } catch {
      measure('contact_form_error', '/contact');
      setSubmissionState("error");
      setSubmissionMessage("We couldn't send your brief. Please email us directly.");
    }
  };

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className={styles.contact}>
      <div className={styles.grid}>
        <div className={styles.intro}>
          <h1 className={styles.title}>
            Tell us what you want to build.
          </h1>

          {/* The address sits straight on the page, as it did on /start. A
              bordered card around one email turns a piece of information
              into a component, and at 1.8rem the type is already large
              enough to be found without a frame pointing at it.

              The "Tell us what you're building" lede that sat here is gone:
              the title two lines above already asks exactly that, and the
              two sentences were saying one thing twice at two weights. */}
          <div className={styles.inquiry}>
            <span className={styles.inquiryLabel}>General inquiries</span>
            <ObfuscatedEmail
              user="hello"
              domain="mzfortech.com"
              className={styles.inquiryEmail}
            />
          </div>

          {/* The social row, directly under the address.

              ORDER MATTERS IN THIS COLUMN, and the order is a claim about
              what the visitor came here to do. The address is first because it
              is the only thing here that reaches the studio directly, and the
              brief itself is the reason to want that. The socials sit
              immediately after it because they are the same kind of thing by
              another route — another way to find the studio — so they belong
              with the contact details rather than at the far end of the
              column.

              The divider then separates the ways to REACH the studio from the
              one link that stays on the site. Everything above the rule is a
              way out; the methodology link below it is a way further in. That
              is the distinction the rule is drawing, and it is why the divider
              goes here and not above the socials.

              ICONS, AND A LABEL. The icons are the point — three glyphs a
              visitor recognises without being told what they are — but the
              word "Elsewhere" stays beside them for the visitor who cannot
              place an unlabelled mark. That is the same argument the home
              panel's trust band is built on: the marks carry it, and someone
              who cannot read them still has the caption. Dropping the label
              would save 12px and cost the block its only description.

              `data-tile` puts each glyph in the shell's spatial key
              navigation, so the arrow keys reach them the way they reach the
              tabs and the form controls. Each one is its own stop rather than
              the row being one, because they go to three different places. */}
          <div className={styles.socials}>
            <span className={styles.socialsLabel}>Elsewhere</span>
            <ul className={styles.socialList}>
              {SOCIALS.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-tile
                    className={styles.socialLink}
                    aria-label={social.name}
                    title={`${social.name} — @mzfortech`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {social.glyph}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* The process line the original carried under the address, now
              last in the column and behind the rule the socials used to sit
              above. It was pointing at `href="#"`, so it never went anywhere;
              the answer to that question is the Intel panel, which is one tab
              across — an internal destination, which is why it sits below the
              divider rather than among the ways to leave. */}
          <p className={styles.process}>
            Want to learn about our process?
            <br />
            <Link href="/intel" data-tile className={styles.processLink}>
              Explore our methodology
            </Link>
          </p>
        </div>

        <form className={styles.form} onSubmit={submitBrief} onFocus={() => {
          if (!formStarted.current) { formStarted.current = true; measure('contact_form_start', '/contact'); }
        }}>
          {/* Honeypot for basic bot filtering; real visitors never see this field. */}
          <label className={styles.honeypot} aria-hidden="true">
            Company website
            <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
          </label>
          {categories.map((category) => (
            <input key={category} type="hidden" name="expertise" value={category} />
          ))}
          <input type="hidden" name="budget" value={budget ?? ""} />
          <input type="hidden" name="timeline" value={timeline ?? ""} />
          <input type="hidden" name="referral" value={referral ?? ""} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>01</span> Expertise Required
            </h2>
            <div className={styles.options} role="group" aria-label="Expertise required">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={styles.option}
                  aria-pressed={categories.includes(category)}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>02</span> Project Scope
            </h2>
            <label>
              <span className={styles.label}>Brief description</span>
              <textarea
                name="description"
                className={styles.textarea}
                rows={4}
                placeholder="Share your vision, challenges, and desired outcomes..."
                required
                maxLength={5000}
              />
            </label>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>03</span> Budget Range
            </h2>
            <OptionRow
              name="Budget range"
              options={BUDGETS}
              value={budget}
              onChange={setBudget}
            />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>04</span> Timeline
            </h2>
            <OptionRow
              name="Timeline"
              options={TIMELINES}
              value={timeline}
              onChange={setTimeline}
            />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>05</span> How did you find us?
            </h2>
            <OptionRow
              name="How did you find us"
              options={REFERRALS}
              value={referral}
              onChange={setReferral}
            />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>06</span> Reach You
            </h2>
            <div className={styles.inputRow}>
              <label>
                <span className={styles.label}>Email address</span>
                <input
                  type="email"
                  name="email"
                  className={styles.input}
                  placeholder="So we can reach you..."
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>

              <div>
                <span className={styles.label}>Attachments</span>
                <input
                  type="file"
                  name="attachment"
                  id="brief-attachment"
                  className={styles.fileInput}
                  onChange={(e) =>
                    setFileName(e.target.files?.[0]?.name ?? null)
                  }
                />
                <label htmlFor="brief-attachment" className={styles.fileLabel}>
                  {/* lucide paperclip (inlined; see PERFORMANCE_REAUDIT §7) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
                  </svg>
                  {fileName ?? "Upload files..."}
                </label>
              </div>
            </div>
          </section>

          {/* The rule above the button is the original's. It is what makes
              the submit read as the end of the brief rather than as one
              more control in a list of them. */}
          <section className={`${styles.section} ${styles.submitSection}`}>
            <button type="submit" className={styles.submit} disabled={submissionState === "sending"}>
              {submissionState === "sending" ? "Sending…" : "Send Brief"}
              {/* lucide arrow-right (inlined; see PERFORMANCE_REAUDIT §7) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.submitArrow}
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
            <p
              className={styles.submitMessage}
              role={submissionState === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              {submissionMessage}
            </p>
          </section>
        </form>
      </div>
    </div>
  );
}
