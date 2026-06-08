import { Lock } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Privacy Policy | MZ Studio",
    description: "How MZ Studio collects, uses, and protects your information.",
};

const Section = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
    <div className="mb-10">
        <div className="flex items-baseline gap-3 mb-3">
            <span className="text-xs font-mono text-[var(--primary)] font-bold tracking-widest">{num}</span>
            <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
        </div>
        <div className="border-l border-[var(--border)] pl-6 text-[var(--muted)] leading-relaxed space-y-3">
            {children}
        </div>
    </div>
);

export default function PrivacyPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-6 bg-[var(--background)] relative">
            {/* Background grid */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.04]"></div>

            <div className="max-w-3xl mx-auto relative z-10">

                {/* Header */}
                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 border border-[var(--border)] bg-[var(--surface)]">
                        <Lock size={12} className="text-[var(--primary)]" />
                        <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">Data Protocol</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--foreground)] uppercase">
                        Privacy <span className="text-[var(--primary)] italic font-mono">Policy</span>.
                    </h1>
                    <div className="flex flex-col gap-1 text-sm font-mono text-[var(--muted)] border-l-2 border-[var(--primary)] pl-4 mt-6">
                        <span>Last Updated: February 23, 2026</span>
                        <span>Operator: MZ Studio — Cairo, Egypt</span>
                    </div>
                </div>

                {/* Preamble */}
                <p className="text-[var(--muted)] leading-relaxed mb-12 text-base">
                    MZ Studio ("we", "us", or "our") operates the website at{" "}
                    <span className="text-[var(--foreground)] font-mono">mzltd.tech</span> (the "Site"). This Privacy Policy explains what information we collect, how we use it, and your rights regarding that information. We designed this policy to be straightforward: we collect the minimum data necessary to operate our business, and we do not sell it to anyone.
                </p>

                <Section num="01" title="What We Collect">
                    <p>We collect only information you provide directly to us. This Site has no third-party analytics trackers, no pixel tracking, and no advertising tags. We do not use Google Analytics or similar services.</p>
                    <p>The categories of information we may collect are:</p>
                    <ul className="list-none space-y-2 mt-2">
                        {[
                            { label: "Contact Form Submissions", desc: "Your name, email address, and any message content you choose to include when reaching out via our contact form or by email." },
                            { label: "Email Correspondence", desc: "If you email us directly at hello@mzltd.tech, we retain that correspondence to manage our relationship with you." },
                            { label: "Technical Logs", desc: "Our hosting provider may collect standard server access logs (IP address, browser type, pages viewed, timestamps) for security and operational purposes. We do not combine these with personal identifiers." },
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="text-[var(--primary)] font-mono text-xs mt-1 flex-shrink-0">—</span>
                                <span><strong className="text-[var(--foreground)]">{item.label}:</strong> {item.desc}</span>
                            </li>
                        ))}
                    </ul>
                </Section>

                <Section num="02" title="How We Use Your Information">
                    <p>We use the information we collect exclusively for the following purposes:</p>
                    <ul className="list-none space-y-2 mt-2">
                        {[
                            "To respond to your inquiries and evaluate potential project engagements",
                            "To communicate with you about an ongoing project or business relationship",
                            "To send you information you have explicitly requested (e.g., proposals, agreements)",
                            "To maintain and improve the security and operation of the Site",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="text-[var(--primary)] font-mono text-xs mt-1">—</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3">We do not send unsolicited marketing emails. If you receive a communication from us, it is because you initiated contact or are in an active business relationship with us.</p>
                </Section>

                <Section num="03" title="Data Sharing & Third Parties">
                    <p>We do not sell, rent, or trade your personal information. We may share your information only in the following limited circumstances:</p>
                    <ul className="list-none space-y-2 mt-2">
                        {[
                            { label: "Service Providers", desc: "We use a small number of tools to operate the business (e.g., email providers, cloud hosting). These providers are contractually bound to use your data only for the purposes of providing their services to us." },
                            { label: "Legal Obligation", desc: "We may disclose your information if required to do so by law, court order, or governmental authority in Egypt or applicable jurisdictions." },
                            { label: "Business Transfer", desc: "In the unlikely event MZ Studio merges with or is acquired by another entity, your information may be transferred as part of that transaction. We will notify you in advance if this occurs." },
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="text-[var(--primary)] font-mono text-xs mt-1 flex-shrink-0">—</span>
                                <span><strong className="text-[var(--foreground)]">{item.label}:</strong> {item.desc}</span>
                            </li>
                        ))}
                    </ul>
                </Section>

                <Section num="04" title="Data Retention">
                    <p>We retain contact form submissions and email correspondence for as long as they are relevant to a potential or active business relationship — typically no longer than 3 years from last contact, unless a longer retention period is required by law or by the terms of a client agreement.</p>
                    <p>You may request deletion of your personal information at any time by contacting us (see Section 07). We will comply within 30 days unless retention is required by law.</p>
                </Section>

                <Section num="05" title="Cookies & Tracking">
                    <p>This Site uses <strong className="text-[var(--foreground)]">no tracking cookies</strong> and no third-party analytics. We do not use cookies to identify you across sessions or websites.</p>
                    <p>Your browser may cache static assets (fonts, scripts) for performance. This is standard browser behavior and does not involve any data being sent to us.</p>
                </Section>

                <Section num="06" title="Security">
                    <p>We implement reasonable technical and organizational measures to protect your information from unauthorized access, alteration, or disclosure. This includes HTTPS encryption on all Site traffic and access controls on internal systems.</p>
                    <p>However, no method of transmission over the Internet is 100% secure. If you have reason to believe that your interaction with us has been compromised, please contact us immediately at <a href="mailto:hello@mzltd.tech" className="text-[var(--primary)] font-mono hover:underline">hello@mzltd.tech</a>.</p>
                </Section>

                <Section num="07" title="Your Rights">
                    <p>Depending on your location and applicable law, you may have the right to:</p>
                    <ul className="list-none space-y-2 mt-2">
                        {[
                            "Access the personal information we hold about you",
                            "Request correction of inaccurate or incomplete information",
                            "Request deletion of your personal information",
                            "Object to or restrict our processing of your information",
                            "Request a portable copy of your data in a machine-readable format",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="text-[var(--primary)] font-mono text-xs mt-1">—</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:hello@mzltd.tech" className="text-[var(--primary)] font-mono hover:underline">hello@mzltd.tech</a>. We will respond within 30 days.</p>
                </Section>

                <Section num="08" title="Children">
                    <p>This Site is not directed at individuals under the age of 16. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected such information, please contact us and we will delete it promptly.</p>
                </Section>

                <Section num="09" title="Changes to This Policy">
                    <p>We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. The "Last Updated" date at the top of this page will always reflect when the current version was published. Continued use of the Site after changes constitutes acceptance of the revised policy.</p>
                    <p>For material changes, we will make reasonable efforts to notify you directly if we have your contact information on file.</p>
                </Section>

                <Section num="10" title="Contact">
                    <p>For any questions, requests, or concerns about this Privacy Policy or our data practices, contact us at:</p>
                    <div className="mt-3 space-y-1">
                        <p><a href="mailto:hello@mzltd.tech" className="text-[var(--primary)] font-mono hover:underline">hello@mzltd.tech</a></p>
                        <p className="text-sm">MZ Studio · Cairo, Egypt</p>
                    </div>
                </Section>

                <div className="mt-16 pt-8 border-t border-[var(--border)] flex justify-between items-center text-xs font-mono text-[var(--muted)]">
                    <span>MZ Studio · Cairo, Egypt · 2026</span>
                    <Link href="/terms" className="text-[var(--primary)] hover:underline">Terms of Service →</Link>
                </div>
            </div>
        </main>
    );
}
