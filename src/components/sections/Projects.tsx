"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Github, ExternalLink, Layers, Calendar, Lock, MousePointerClick } from "lucide-react";
import { useState } from "react";

const projects = [
    {
        id: "01",
        title: "Samahy.tech",
        category: "Portfolio Engineering",
        role: "Full Stack",
        year: "2024",
        description: "The digital home of Co-Founder Mohamed El-Samahy. A high-performance portfolio showcasing full-stack engineering capabilities, minimal aesthetics, and attention to micro-interactions.",
        stack: ["Next.js", "React", "Tailwind", "Framer Motion"],
        link: "https://samahy.tech",
        repo: "#",
    },
    {
        id: "02",
        title: "Ezzio.me",
        category: "Portfolio Engineering",
        role: "System Architecture",
        year: "2025",
        description: "Personal portfolio of Ezz Eldin. Built with modern tools focusing on performance and a clean, dynamic aesthetic.",
        stack: ["Vite", "React", "Tailwind"],
        link: "https://ezzio.me",
        repo: "#",
    },
    {
        id: "03",
        title: "Nested United",
        category: "Internal System",
        role: "Full Stack",
        year: "2026",
        description: "A comprehensive, enterprise-grade cloud system for Property Management, Human Resources, CRM, and Accounting. Features real-time remote toggling and dynamic image streaming APIs.",
        stack: ["Next.js", "Supabase", "React", "Tailwind"],
        link: "#",
        repo: "#",
        isPrivate: true,
        logo: "/nested-united-logo.jpg",
    },
    {
        id: "04",
        title: "SSC2 League",
        category: "Tactical LMS & Tracker",
        role: "Lead Engineer",
        year: "2025",
        description: "A competitive Learning Management System designed to gamify the data science curriculum. Features real-time global ranking, tactical modules, and live operational metrics to track and reward technical proficiency.",
        stack: ["Next.js", "Supabase", "Tailwind", "TypeScript"],
        link: "#",
        repo: "#",
        isPrivate: true,
        logo: "/ssc2-logo.svg",
    },
    {
        id: "05",
        title: "The Null Hypothesis",
        category: "Educational Platform",
        role: "System Architecture",
        year: "2025",
        description: "A comprehensive data science platform for the Arabic-speaking community. Features technical blogging, interactive tutorials, and a custom MDX-based learning engine.",
        stack: ["Next.js", "MDX", "TypeScript"],
        link: "https://nullhypothesis.dev",
        repo: "#",
    }
];

export default function Projects() {
    return (
        <section id="projects" className="relative bg-[var(--background)] py-32 overflow-hidden">

            {/* === BACKGROUND: UNIFIED SQUARE GRID === */}
            <div className="absolute inset-0 z-[var(--z-background)] pointer-events-none">
                {/* Unified Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.07]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-[var(--z-base)]">

                {/* HEADER */}
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <span className="inline-block border border-[var(--border)] bg-[var(--surface)] px-4 py-1 text-xs font-mono font-bold text-[var(--muted)] uppercase tracking-widest mb-6">
                        [ 03 // PROVEN CAPABILITY ]
                    </span>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-[var(--foreground)] mb-6 uppercase">
                        Real <span className="text-[var(--primary)] italic font-mono">Case Studies</span>.
                    </h2>
                    <p className="text-[var(--muted)] text-lg font-mono max-w-lg mx-auto border-l-2 border-[var(--primary)] text-left pl-6">
                        Real work. Real clients. Real results.
                    </p>
                </div>

                {/* PROJECTS LIST (ZIG-ZAG) */}
                <div className="flex flex-col gap-32">
                    {projects.map((project, index) => (
                        <ProjectRow key={project.id} project={project} index={index} />
                    ))}
                </div>

            </div>
        </section>
    );
}

// --- SUB-COMPONENT: INDIVIDUAL PROJECT ROW ---
function ProjectRow({ project, index }: { project: any, index: number }) {
    const isEven = index % 2 === 0;
    const [isInteractive, setIsInteractive] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.7 }}
            className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}
        >

            {/* 1. TEXT CONTENT SIDE */}
            <div className="flex-1 min-w-0 space-y-8">
                {/* Header Metadata */}
                <div className="flex items-center gap-4 text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
                    <span className="text-[var(--primary)]">0{index + 1}</span>
                    <span className="w-12 h-[1px] bg-[var(--border)]"></span>
                    <span className="flex items-center gap-2"><Layers size={12} /> {project.category}</span>
                </div>

                <h3 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] leading-tight">
                    {project.title}
                </h3>

                <p className="text-[var(--muted)] text-lg leading-relaxed max-w-lg">
                    {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {project.stack.map((tech: string) => (
                        <span key={tech} className="px-3 py-1 text-xs font-mono font-bold border border-[var(--border)] text-[var(--muted)] bg-[var(--dashboard-surface)]">
                            {tech}
                        </span>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-4">
                    {project.link !== "#" && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 px-6 py-3 bg-[var(--dashboard-bg)] border border-[var(--primary)] shadow-[4px_4px_0px_var(--primary)] text-[var(--foreground)] text-sm font-bold hover:bg-[var(--primary)] hover:text-[var(--background)] transition-all duration-300 hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
                            Visit Live <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </a>
                    )}
                    {project.repo !== "#" && (
                        <a href={project.repo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[var(--dashboard-surface)] border border-[var(--border)] text-[var(--foreground)] text-sm font-bold hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-300 shadow-[4px_4px_0px_var(--border)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
                            Code <Github size={14} />
                        </a>
                    )}
                </div>
            </div>

            {/* 2. PREVIEW SIDE (BROWSER WINDOW) */}
            <div className="flex-1 min-w-0 w-full perspective-1000">
                <motion.div
                    whileHover={{ rotateY: isEven ? 2 : -2, rotateX: 2 }}
                    className="relative border border-[var(--border)] bg-[var(--dashboard-surface)] shadow-[8px_8px_0px_var(--primary)] overflow-hidden aspect-[16/10] group ring-1 ring-white/10 transition-shadow hover:shadow-[12px_12px_0px_var(--primary)]"
                >
                    {/* Browser Toolbar */}
                    <div className="absolute top-0 w-full h-9 bg-[var(--dashboard-surface)] border-b border-[var(--border)] flex items-center px-4 gap-4 z-20">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 bg-red-500/80"></div>
                            <div className="w-2.5 h-2.5 bg-amber-500/80"></div>
                            <div className="w-2.5 h-2.5 bg-green-500/80"></div>
                        </div>
                        <div className="flex-1 h-5 bg-[var(--background)] border border-[var(--border)] flex items-center justify-center px-3 text-[10px] font-mono text-[var(--muted)]">
                            <span className="truncate">{project.link}</span>
                        </div>
                    </div>

                    {/* IFRAME / VISUAL CONTAINER */}
                    <div className="absolute inset-0 top-9 bg-[var(--background)] flex items-center justify-center overflow-hidden">

                        {project.isPrivate ? (
                            <div className="flex flex-col items-center justify-center text-[var(--muted)] p-8 text-center h-full w-full bg-[var(--dashboard-bg)] border-t border-[var(--border)]">

                                {/* The Confidential Logo Box */}
                                <div className="p-5 border-2 border-[var(--border)] bg-[var(--dashboard-surface)] mb-6 relative group overflow-hidden flex items-center justify-center min-w-[100px] min-h-[100px]">

                                    {/* The Security Lock Icon */}
                                    <div className="absolute top-1.5 right-1.5 text-[var(--primary)] opacity-70 transition-opacity duration-300 group-hover:opacity-100 z-30">
                                        <Lock size={12} strokeWidth={2.5} />
                                    </div>

                                    {project.logo ? (
                                        <img
                                            src={project.logo}
                                            alt={`${project.title} logo`}
                                            className="w-48 h-48 object-contain grayscale opacity-60 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 relative z-10"
                                        />
                                    ) : (
                                        <Layers size={48} className="text-[var(--primary)] opacity-50 relative z-10" />
                                    )}

                                    {/* CRT Scanline Effect - Fades out slightly on hover */}
                                    <div className="absolute inset-0 z-20 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20 transition-opacity duration-500 group-hover:opacity-10"></div>
                                </div>

                                <span className="font-mono text-sm uppercase tracking-wider mb-2 text-[var(--foreground)] border-b border-[var(--primary)] pb-1">
                                    [ INTERNAL ENTERPRISE SYSTEM ]
                                </span>
                                <span className="text-xs font-mono">Client data and interfaces are confidential.</span>

                            </div>
                        ) : (
                            <>
                                {/* Overlay to prevent scroll capturing until clicked */}
                                {!isInteractive && (
                                    <div
                                        onClick={() => setIsInteractive(true)}
                                        className="absolute inset-0 z-10 bg-transparent flex items-center justify-center cursor-pointer group/overlay"
                                    >
                                        <div className="absolute inset-0 bg-black/5 group-hover/overlay:bg-black/10 transition-colors"></div>
                                        <div className="px-4 py-2 bg-[var(--dashboard-bg)] border border-[var(--primary)] shadow-[4px_4px_0px_var(--primary)] opacity-0 group-hover/overlay:opacity-100 transition-all transform translate-y-2 group-hover/overlay:translate-y-0 flex items-center gap-2 text-xs font-bold text-[var(--foreground)]">
                                            <MousePointerClick size={14} className="text-[var(--primary)]" /> CLICK TO INTERACT
                                        </div>
                                    </div>
                                )}

                                <iframe
                                    src={project.link}
                                    title={project.title}
                                    className="absolute top-0 left-0 w-[200%] h-[200%] border-0 origin-top-left scale-50"
                                    loading="lazy"
                                    style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
                                />
                            </>
                        )}
                    </div>

                </motion.div>
            </div>

        </motion.div>
    );
}