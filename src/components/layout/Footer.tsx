"use client";

import { motion } from "framer-motion";
import {
    Github, Twitter, Linkedin, Mail,
    ArrowUp, Command, Circle, Activity,
    ShieldCheck, Cpu
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import LinearBackground from "@/components/ui/LinearBackground";

export default function Footer() {
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZoneName: "short"
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --- SMOOTH SCROLL HANDLER (Hashtag Masking) ---
    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const targetId = href.replace("#", "");
            const elem = document.getElementById(targetId);
            if (elem) {
                elem.scrollIntoView({
                    behavior: "smooth",
                });
            }
        }
    };

    return (
        <footer className="relative bg-[var(--surface)] text-[var(--foreground)] border-t border-[var(--border)] overflow-hidden pt-20 pb-10">

            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col">

                {/* === TOP ROW: NAV & BRAND === */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">

                    {/* BRAND ID */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            {/* Fixed slot — change scale-X on the img to resize visually */}
                            <div className="h-16 w-16 overflow-hidden flex-shrink-0">
                                <img src="/mz-logo.png" alt="MZ Logo" className="w-full h-full object-contain scale-170 origin-center" />
                            </div>
                            <h3 className="text-4xl md:text-5xl font-bold tracking-tighter">
                                MZ
                            </h3>
                        </div>
                        <p className="max-w-md text-[var(--muted)]">
                            Precision-built digital products. A boutique software studio for ambitious companies.
                            <br /><br />
                            Cairo, Egypt. <br />
                            Operating Globally.
                        </p>
                    </div>

                    {/* NAV BLOCKS */}
                    <div>
                        <h4 className="font-mono text-xs text-[var(--muted)] uppercase tracking-widest mb-6">SITEMAP</h4>
                        <ul className="space-y-3 font-mono text-sm">
                            {["Services", "Projects", "Process", "Contact"].map((item) => (
                                <li key={item}>
                                    <a
                                        href={`#${item.toLowerCase()}`}
                                        onClick={(e) => scrollToSection(e, `#${item.toLowerCase()}`)}
                                        className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors group"
                                    >
                                        <span className="w-1.5 h-1.5 bg-[var(--border)] group-hover:bg-[var(--primary)] transition-colors"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <a href="https://ezzio.me" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors group">
                                    <span className="w-1.5 h-1.5 bg-[var(--border)] group-hover:bg-[var(--primary)] transition-colors"></span>
                                    Featured Work
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-mono text-xs text-[var(--muted)] uppercase tracking-widest mb-6">SOCIAL</h4>
                        <ul className="space-y-3 font-mono text-sm">
                            {[
                                { name: "GitHub", icon: <Github size={16} />, href: "#" },
                                { name: "LinkedIn", icon: <Linkedin size={16} />, href: "#" },
                                { name: "Email", icon: <Mail size={16} />, href: "mailto:hello@mzltd.tech" },
                            ].map((item) => (
                                <li key={item.name}>
                                    <a href={item.href} className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--primary)] border border-transparent hover:border-[var(--border)] px-2 py-1 transition-all">
                                        {item.icon}
                                        <span>[ {item.name} ]</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>



                {/* === BOTTOM ROW: METADATA === */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-t border-[var(--border)] pt-8 font-mono text-xs text-[var(--muted)]">

                    {/* LEGAL */}
                    <div className="flex gap-6">
                        <span>© 2026 MZ.</span>
                        <Link href="/privacy" className="hover:text-[var(--primary)] transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-[var(--primary)] transition-colors">Terms of Service</Link>
                    </div>

                    {/* STATUS INDICATORS */}
                    <div className="flex items-center gap-6 bg-[var(--dashboard-bg)] border border-[var(--border)] px-4 py-2">
                        <div>
                            {time}
                        </div>
                    </div>

                    {/* BACK TO TOP */}
                    <button
                        onClick={scrollToTop}
                        className="group flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] font-bold border-2 border-[var(--foreground)] hover:bg-[var(--primary)] hover:border-[var(--primary)] shadow-[4px_4px_0px_var(--border)] hover:shadow-[6px_6px_0px_var(--border)] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all"
                    >
                        <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
                        TOP
                    </button>
                </div>

            </div>
        </footer>
    );
}
