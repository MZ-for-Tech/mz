"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Database, Code, Layout, Terminal, Activity, MousePointer2, Cpu, BookOpen, Check, Users, FileText, BarChart2, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

// --- HOOK FOR MOUSE TRACKING ---
function useMousePosition(ref: React.RefObject<HTMLElement>) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }
        };
        if (ref.current) {
            ref.current.addEventListener("mousemove", updateMousePosition);
        }
        return () => {
            if (ref.current) {
                ref.current.removeEventListener("mousemove", updateMousePosition);
            }
        };
    }, [ref]);
    return mousePosition;
}

export default function Services() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <section id="services" ref={containerRef} className="py-32 bg-[var(--background)] relative overflow-hidden">

            {/* === BACKGROUND: UNIFIED SQUARE GRID === */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.04]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* EDITORIAL HEADER */}
                <div className="mb-12 max-w-2xl">
                    <span className="inline-block border border-[var(--border)] bg-[var(--surface)] px-4 py-1 text-xs font-mono font-bold text-[var(--muted)] uppercase tracking-widest mb-6">
                        [ 02 // CORE COMPETENCIES ]
                    </span>
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-[var(--foreground)] mb-6 uppercase">
                        What We <span className="text-[var(--primary)] italic font-mono">Build</span>.
                    </h2>
                    <p className="text-xl text-[var(--muted)] border-l-2 border-[var(--primary)] pl-6 font-mono">
                        We don't do everything. We do three things exceptionally well.
                    </p>
                </div>

                {/* === THE ENGINEERED BENTO GRID === */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[350px]">

                    {/* --- CARD 1: PORTFOLIO (Browser Mockup) --- */}
                    <motion.div
                        whileHover="hover"
                        className="md:col-span-7 border border-[var(--border)] bg-[var(--surface)] relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-500"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.03]"></div>

                        <div className="p-8 relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                                    Engineer your public identity. <ArrowUpRight className="w-5 h-5 opacity-50" />
                                </h3>
                                <p className="text-[var(--muted)] mt-2 max-w-sm text-sm">
                                    Your portfolio is a pitch. We make it precise, fast, and impossible to ignore.
                                </p>
                            </div>

                            {/* === PORTFOLIO BROWSER MOCKUP === */}
                            <PortfolioMockup />
                        </div>
                    </motion.div>

                    {/* --- CARD 2: INTERNAL SYSTEMS (Enterprise Dashboard) --- */}
                    <div className="md:col-span-5 border border-[var(--border)] bg-[var(--dashboard-surface)] relative overflow-hidden group flex flex-col justify-between">
                        {/* Dashboard Visual */}
                        <div className="absolute inset-x-0 top-0 bottom-24 bg-[var(--dashboard-bg)] border-b border-[var(--border)]">
                            <EnterpriseDashboard />
                        </div>

                        {/* CONTENT */}
                        <div className="p-8 relative z-10 mt-auto bg-[var(--dashboard-surface)]">
                            <div className="w-12 h-12 bg-[var(--dashboard-bg)] border border-[var(--primary)] shadow-[4px_4px_0px_var(--primary)] flex items-center justify-center mb-6">
                                <Cpu className="text-[var(--primary)]" size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Build your operations.</h3>
                            <p className="text-[var(--muted)] text-sm leading-relaxed">
                                Off-the-shelf breaks at scale. We build systems that fit your exact process — not the other way.
                            </p>
                        </div>
                    </div>

                    {/* --- CARD 3: EDUCATIONAL PLATFORMS (Course Layout) --- */}
                    <div className="md:col-span-12 border border-[var(--border)] bg-[var(--dashboard-bg)] relative overflow-hidden group min-h-[300px]">
                        {/* Geometric Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.3]"></div>

                        {/* Course Page Visual (Right Panel) */}
                        <div className="absolute right-0 top-0 w-full md:w-1/2 h-full border-l border-[var(--border)] bg-[var(--dashboard-surface)]/80">
                            <CourseMockup />
                        </div>

                        {/* Foreground Content */}
                        <div className="p-8 relative z-10 h-full flex flex-col justify-center max-w-lg bg-[var(--dashboard-bg)] border-r border-y border-[var(--border)] my-8 md:my-0 shadow-[8px_8px_0px_var(--primary)]">
                            <div className="w-12 h-12 bg-[var(--primary)] text-[var(--background)] flex items-center justify-center mb-6">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h3 className="text-3xl md:text-5xl font-bold text-[var(--foreground)]">Productize your knowledge.</h3>
                            <p className="text-[var(--muted)] mt-4">Your expertise deserves a platform, not a PDF. We engineer learning products your audience keeps coming back to.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// --- SUB-COMPONENT: PORTFOLIO BROWSER MOCKUP ---
function PortfolioMockup() {
    return (
        <div className="relative w-full h-44 border border-[var(--border)] bg-[var(--dashboard-bg)] shadow-[6px_6px_0px_var(--primary)] overflow-hidden">
            {/* Browser Chrome */}
            <div className="h-7 border-b border-[var(--border)] bg-[var(--dashboard-surface)] flex items-center px-3 gap-2">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[var(--border)]"></div>
                    <div className="w-2 h-2 bg-[var(--border)]"></div>
                    <div className="w-2 h-2 bg-[var(--border)]"></div>
                </div>
                <div className="flex-1 h-3.5 bg-[var(--background)] border border-[var(--border)] flex items-center px-2">
                    <span className="text-[8px] font-mono text-[var(--muted)]">samahy.tech</span>
                </div>
            </div>
            {/* Page Content */}
            <div className="flex h-[calc(100%-28px)]">
                {/* Main Section */}
                <div className="flex-1 p-3 flex flex-col gap-2">
                    {/* Nav */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="text-[9px] font-mono font-bold text-[var(--primary)]">EZZ ELDIN</div>
                        <div className="flex gap-3">
                            {["ABOUT", "WORK", "CONTACT"].map((l) => (
                                <div key={l} className="text-[7px] font-mono text-[var(--muted)]">{l}</div>
                            ))}
                        </div>
                    </div>
                    {/* Hero Text */}
                    <div className="flex flex-col gap-1">
                        <div className="h-3 w-32 bg-[var(--foreground)] opacity-80"></div>
                        <div className="h-2 w-20 bg-[var(--primary)] opacity-60"></div>
                        <div className="h-1.5 w-40 bg-[var(--border)] opacity-60 mt-1"></div>
                        <div className="h-1.5 w-36 bg-[var(--border)] opacity-40"></div>
                    </div>
                    {/* Project Cards */}
                    <div className="flex gap-2 mt-auto">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="flex-1 h-12 border border-[var(--border)] bg-[var(--dashboard-surface)] p-1.5">
                                <div className="h-5 bg-[var(--border)] opacity-30 mb-1"></div>
                                <div className={`h-1 w-8 opacity-50 ${i === 0 ? "bg-[var(--primary)]" : i === 1 ? "bg-[var(--border)]" : "bg-[var(--accent-gold)]"}`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: ENTERPRISE DASHBOARD PANEL ---
function EnterpriseDashboard() {
    return (
        <div className="w-full h-full flex overflow-hidden">
            {/* Sidebar Nav */}
            <div className="w-12 h-full border-r border-[var(--border)] flex flex-col items-center pt-4 gap-4">
                {[
                    { icon: <Users size={12} />, active: true },
                    { icon: <Database size={12} />, active: false },
                    { icon: <FileText size={12} />, active: false },
                    { icon: <BarChart2 size={12} />, active: false },
                ].map((item, i) => (
                    <div
                        key={i}
                        className={`w-7 h-7 flex items-center justify-center border ${item.active
                            ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                            : "border-[var(--border)] text-[var(--muted)]"
                            }`}
                    >
                        {item.icon}
                    </div>
                ))}
            </div>

            {/* Main Panel: Data Table */}
            <div className="flex-1 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                    <div className="text-[8px] font-mono font-bold text-[var(--foreground)] uppercase tracking-widest">CRM / Contacts</div>
                    <div className="text-[7px] font-mono text-[var(--primary)] border border-[var(--primary)] px-1.5 py-0.5 flex items-center gap-1">
                        <span className="w-1 h-1 bg-[var(--primary)] animate-pulse"></span> LIVE
                    </div>
                </div>
                {/* Table Header */}
                <div className="flex gap-2 border-b border-[var(--border)] pb-1">
                    {["NAME", "STATUS", "ROLE", "LAST ACTIVE"].map((h) => (
                        <div key={h} className="flex-1 text-[7px] font-mono text-[var(--muted)] uppercase tracking-widest">{h}</div>
                    ))}
                </div>
                {/* Table Rows */}
                {[
                    { name: "A. Hassan", status: "Active", role: "Manager", active: true },
                    { name: "S. Nour", status: "Away", role: "Engineer", active: false },
                    { name: "M. Khalil", status: "Active", role: "Director", active: true },
                    { name: "L. Farouk", status: "Offline", role: "Analyst", active: false },
                ].map((row, i) => (
                    <div key={i} className="flex gap-2 items-center py-0.5 border-b border-[var(--border)]/30">
                        <div className="flex-1 text-[8px] font-mono text-[var(--foreground)]">{row.name}</div>
                        <div className={`flex-1 text-[7px] font-mono ${row.active ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}>{row.status}</div>
                        <div className="flex-1 text-[7px] font-mono text-[var(--muted)]">{row.role}</div>
                        <div className="flex-1 text-[7px] font-mono text-[var(--border)]">just now</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: COURSE PAGE MOCKUP ---
function CourseMockup() {
    const [activeLesson, setActiveLesson] = useState(1);
    useEffect(() => {
        const t = setInterval(() => setActiveLesson(p => (p + 1) % 4), 2200);
        return () => clearInterval(t);
    }, []);

    const lessons = [
        "Introduction to Data Science",
        "Statistical Thinking",
        "Python for Analysis",
        "Machine Learning Basics",
    ];

    return (
        <div className="w-full h-full flex overflow-hidden">
            {/* Lesson Sidebar */}
            <div className="w-1/2 h-full border-r border-[var(--border)] flex flex-col p-3 gap-1.5">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[var(--muted)] mb-1">MODULE 02 / 06</div>
                {/* Progress */}
                <div className="w-full h-1 bg-[var(--border)] mb-2">
                    <motion.div
                        className="h-full bg-[var(--primary)]"
                        animate={{ width: `${((activeLesson + 1) / lessons.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    ></motion.div>
                </div>
                {lessons.map((lesson, i) => (
                    <div
                        key={i}
                        className={`flex items-center gap-2 p-1.5 border text-[8px] font-mono transition-all ${i === activeLesson
                            ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                            : i < activeLesson
                                ? "border-[var(--border)]/40 text-[var(--muted)]"
                                : "border-[var(--border)] text-[var(--muted)]"
                            }`}
                    >
                        <div className={`w-3 h-3 flex items-center justify-center flex-shrink-0 ${i < activeLesson ? "bg-[var(--primary)]" : "border border-current"}`}>
                            {i < activeLesson && <Check size={8} className="text-[var(--background)]" />}
                        </div>
                        <span className="truncate">{lesson}</span>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 h-full p-3 flex flex-col gap-2 overflow-hidden">
                <div className="h-2 w-24 bg-[var(--foreground)] opacity-60 mb-1"></div>
                <div className="h-1.5 w-full bg-[var(--border)] opacity-30"></div>
                <div className="h-1.5 w-3/4 bg-[var(--border)] opacity-30"></div>
                <div className="h-1.5 w-5/6 bg-[var(--border)] opacity-20"></div>
                {/* Code Block */}
                <div className="mt-2 bg-[var(--dashboard-bg)] border border-[var(--border)] p-2 flex flex-col gap-1">
                    <div className="flex gap-2">
                        <span className="text-[7px] font-mono text-[var(--primary)]">import</span>
                        <span className="text-[7px] font-mono text-[var(--muted)]">pandas as pd</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-[7px] font-mono text-[var(--accent-gold)]">df</span>
                        <span className="text-[7px] font-mono text-[var(--muted)]">= pd.read_csv(...</span>
                    </div>
                </div>
                <div className="mt-auto flex items-center gap-2">
                    <div className="flex-1 h-5 bg-[var(--primary)] flex items-center justify-center">
                        <span className="text-[7px] font-mono font-bold text-[var(--background)]">NEXT LESSON</span>
                    </div>
                    <ChevronRight size={10} className="text-[var(--muted)]" />
                </div>
            </div>
        </div>
    );
}
