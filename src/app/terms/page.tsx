import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Terms of Service | MZ Studio",
    description: "Terms governing use of the MZ Studio website and engagement with our services.",
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

export default function TermsPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-6 bg-[var(--background)] relative">
            {/* Background grid */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.04]"></div>

            <div className="max-w-3xl mx-auto relative z-10">

                {/* Header */}
                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 border border-[var(--border)] bg-[var(--surface)]">
                        <ShieldAlert size={12} className="text-[var(--primary)]" />
                        <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">Legal Agreement</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--foreground)] uppercase">
                        Terms of <span className="text-[var(--primary)] italic font-mono">Service</span>.
                    </h1>
                    <div className="flex flex-col gap-1 text-sm font-mono text-[var(--muted)] border-l-2 border-[var(--primary)] pl-4 mt-6">
                        <span>Effective Date: February 23, 2026</span>
                        <span>Governing Law: Arab Republic of Egypt</span>
                        <span>Operator: MZ Studio — Cairo, Egypt</span>
                    </div>
                </div>

                {/* Preamble */}
                <p className="text-[var(--muted)] leading-relaxed mb-12 text-base">
                    These Terms of Service ("Terms") govern your access to and use of the MZ Studio website located at{" "}
                    <span className="text-[var(--foreground)] font-mono">mzltd.tech</span> (the "Site"), and your engagement with MZ Studio for software development and related services. By accessing the Site or initiating a project engagement, you agree to be bound by these Terms. If you do not agree, do not use the Site or engage our services.
                </p>

                <Section num="01" title="Definitions">
                    <p><strong className="text-[var(--foreground)]">"MZ Studio"</strong> refers to the software engineering studio operating under the MZ brand, based in Cairo, Egypt.</p>
                    <p><strong className="text-[var(--foreground)]">"Client"</strong> refers to any individual or entity that engages MZ Studio for services.</p>
                    <p><strong className="text-[var(--foreground)]">"Services"</strong> refers to software engineering, product design, internal tooling, and platform development provided by MZ Studio.</p>
                    <p><strong className="text-[var(--foreground)]">"Work Product"</strong> refers to any software, code, design, or deliverable produced by MZ Studio in the course of an engagement.</p>
                </Section>

                <Section num="02" title="Use of this Website">
                    <p>This Site is a marketing and portfolio property of MZ Studio. You may browse the Site for informational purposes. You may not:</p>
                    <ul className="list-none space-y-2 mt-2">
                        {[
                            "Scrape, reproduce, or republish any content from this Site without written consent",
                            "Use the Site for any unlawful purpose or in violation of any applicable regulations",
                            "Attempt to gain unauthorized access to any part of the Site or its underlying systems",
                            "Use automated tools to interact with the Site without prior written permission",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="text-[var(--primary)] font-mono text-xs mt-1">—</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </Section>

                <Section num="03" title="Service Engagements">
                    <p>All project-based work is governed by a separate, written agreement — either a Master Services Agreement ("MSA") or a Statement of Work ("SOW") — executed between MZ Studio and the Client prior to commencement of work.</p>
                    <p>In the absence of a signed agreement, no obligation to deliver work product, meet deadlines, or maintain confidentiality is assumed by MZ Studio.</p>
                    <p>MZ Studio reserves the right to decline any engagement at its sole discretion, without obligation to provide justification.</p>
                </Section>

                <Section num="04" title="Intellectual Property">
                    <p>All content on this Site — including but not limited to text, graphics, code snippets, logos, and design — is the intellectual property of MZ Studio and is protected under applicable copyright and trademark law.</p>
                    <p>Work Product developed for a Client becomes the property of the Client only upon full receipt of all agreed-upon payments, as specified in the applicable SOW or MSA. Prior to that, all rights remain with MZ Studio.</p>
                    <p>MZ Studio retains the right to display completed Work Product in its portfolio and on this Site unless expressly prohibited in writing by the Client.</p>
                </Section>

                <Section num="05" title="Payments & Refunds">
                    <p>Payment terms are defined per engagement in the applicable SOW. MZ Studio operates on a milestone- or phase-based billing model unless otherwise agreed.</p>
                    <p>All payments are non-refundable once work on a milestone has commenced, except where MZ Studio has materially failed to deliver on agreed specifications. Disputes must be raised within 14 days of milestone delivery.</p>
                    <p>MZ Studio is not liable for delays caused by late feedback, scope changes, or failure to provide required access or assets by the Client.</p>
                </Section>

                <Section num="06" title="Confidentiality">
                    <p>MZ Studio treats all project-specific information shared by Clients as confidential and will not disclose it to third parties without written consent, except as required by law.</p>
                    <p>Any confidentiality obligations beyond this default are to be specified in a separate Non-Disclosure Agreement ("NDA").</p>
                </Section>

                <Section num="07" title="Limitation of Liability">
                    <p>To the maximum extent permitted by applicable law, MZ Studio shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of or in connection with your use of the Site or the Services.</p>
                    <p>MZ Studio's total liability for any claim arising from a service engagement shall not exceed the total amount paid by the Client for the specific milestone or phase giving rise to the claim.</p>
                </Section>

                <Section num="08" title="Modifications to These Terms">
                    <p>MZ Studio reserves the right to update these Terms at any time. Changes take effect upon posting to the Site. Continued use of the Site or engagement of Services after changes constitutes acceptance of the revised Terms. We will note the effective date of the current version at the top of this page.</p>
                </Section>

                <Section num="09" title="Governing Law & Disputes">
                    <p>These Terms are governed by the laws of the Arab Republic of Egypt. Any disputes arising from these Terms or from a service engagement shall first be attempted to be resolved through good-faith negotiation between the parties.</p>
                    <p>If negotiation fails, disputes shall be submitted to binding arbitration in Cairo, Egypt, under the rules of the Cairo Regional Centre for International Commercial Arbitration (CRCICA).</p>
                </Section>

                <Section num="10" title="Contact">
                    <p>For questions regarding these Terms, contact us at:</p>
                    <p className="mt-2">
                        <a href="mailto:hello@mzltd.tech" className="text-[var(--primary)] font-mono hover:underline">hello@mzltd.tech</a>
                    </p>
                </Section>

                <div className="mt-16 pt-8 border-t border-[var(--border)] flex justify-between items-center text-xs font-mono text-[var(--muted)]">
                    <span>MZ Studio · Cairo, Egypt · 2026</span>
                    <Link href="/privacy" className="text-[var(--primary)] hover:underline">Privacy Policy →</Link>
                </div>
            </div>
        </main>
    );
}
