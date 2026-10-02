import styles from "./page.module.css";
import { pageMetadata } from "@/lib/seo";
import { TransitionLink } from "@/components/TransitionLink/TransitionLink";
import ObfuscatedEmail from "@/components/ObfuscatedEmail/ObfuscatedEmail";

/**
 * The date the policy was last CHANGED, as a literal.
 *
 * This used to be `new Date()` formatted on mount, which meant the page
 * claimed to have been updated every time anyone looked at it — the date
 * silently rolled over to "today" on every visit, forever. That is worse
 * than showing nothing: a "last updated" stamp that always says today
 * tells a visitor (and a regulator) that nobody is maintaining the document,
 * which is the exact inference a compliance date exists to prevent.
 *
 * A literal is also the only honest version of the claim. A build timestamp
 * is nearly as bad as a render timestamp, for the same reason — it moves on
 * every deploy whether the policy changed or not. This string changes when
 * the policy below it changes, which is the only event that should touch it.
 *
 * `en-GB` with an explicit Cairo timezone, matching how the rest of the site
 * writes dates. A hardcoded format rather than `toLocaleDateString` because
 * the server's locale is not the reader's, and a policy date that renders
 * as "9/26/2026" for some visitors and "26 September 2026" for others is
 * noise in a legal document.
 */
const LAST_UPDATED = "26 September 2026";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Read how MZ handles information submitted through its website and how to contact the team with privacy questions.",
  path: "/privacy",
});

/**
 * Privacy — a legacy-world page outside the launcher shell.
 *
 * A server component now, where it used to be a client one. The only reason
 * it was a client component was the date above, and with that gone there is
 * no state, no effect and no hook left in the file — its two interactive
 * children (TransitionLink, ObfuscatedEmail) carry their own "use client"
 * and work fine imported by a server parent.
 *
 * The Footer used to close this page. It no longer does: a footer implies the
 * page ends, and this site has a fixed tab bar that is always present. The
 * back control and the single email are all a policy page actually needs.
 */
export default function PrivacyPolicyPage() {
  return (
    <>
      <div className={styles.container}>
        {/* No background layer of its own, deliberately. The root layout's
            SiteBackground is switched off on this route — see the note
            there — so the page sits on the flat `--color-bg` ground with
            white type and nothing moving. A policy document should be the
            quietest thing on the site. */}

        <main className={styles.main}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <div className={styles.content}>
            <p>Last updated: {LAST_UPDATED}</p>

            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you use our services, such as when you submit a project brief or contact us. This may include your name, email address, and project details.</p>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to communicate with you about your projects, provide our services, and improve our website experience. We do not sell your personal information to third parties.</p>

            <h2>3. Information Security</h2>
            <p>We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet is 100% secure.</p>

            <h2>4. Third-Party Services</h2>
            <p>We may use third-party services that collect, monitor and analyze information to improve our services functionality. These third-party service providers have their own privacy policies addressing how they use such information.</p>

            <h2>5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <ObfuscatedEmail user="hello" domain="mzfortech.com" />.</p>
          </div>
        </main>

        <div className={styles.backRow}>
          <TransitionLink href="/home" className={styles.backLink}>
            ← Back to menu
          </TransitionLink>
        </div>
      </div>
    </>
  );
}
