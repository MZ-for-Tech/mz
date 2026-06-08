"use client";
import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import {
    ScanLine, Database, Layout, Globe, CheckCircle2,
    Lock, Activity, Home, Users, Settings, Zap,
    TerminalSquare, GitBranch, Server, Cpu
} from "lucide-react";

const steps = [
    {
        id: "01",
        title: "Scope & Blueprint",
        tag: "DISCOVERY",
        description: "You get a fixed scope, a timeline, and a locked price before a single line of code is written. No vague estimates — a technical spec document you can take to the bank.",
        color: "var(--primary)",
    },
    {
        id: "02",
        title: "Infrastructure First",
        tag: "BACKEND",
        description: "The backend ships before the UI exists. Type-safe schemas, auth, and API routes are deployed and tested on staging. Your data model is stable before anything builds on top of it.",
        color: "var(--primary)",
    },
    {
        id: "03",
        title: "Interface Build",
        tag: "FRONTEND",
        description: "Components are built against the live API — no mocks, no placeholders. You get a staging link within the first sprint. Feedback loops are two days, not two weeks.",
        color: "var(--primary)",
    },
    {
        id: "04",
        title: "Live & Monitored",
        tag: "DEPLOYMENT",
        description: "Deployed to the edge, globally. CI/CD is automated — every future push ships without human bottlenecks. We hand you keys to a production system, not a prototype.",
        color: "var(--primary)",
    },
];

/* ─── PANEL 01: Blueprint (3D intro) ────────────────────────────────── */
function BlueprintPanel() {
    return (
        <div className="w-full h-full relative bg-[var(--dashboard-bg)] px-4 py-4 flex gap-4">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />

            {/* Wireframe schematic */}
            <div className="relative flex-1 border border-[var(--primary)]/60 bg-[var(--dashboard-surface)] p-3 flex flex-col gap-2 shadow-[4px_4px_0px_var(--border)]">
                <div className="absolute -top-3 left-2 bg-[var(--dashboard-bg)] px-1 text-[8px] font-mono font-bold text-[var(--primary)] border border-[var(--primary)]">LAYOUT_V1.draft</div>
                {/* Header bar */}
                <div className="h-7 border border-[var(--primary)]/30 flex items-center px-2 justify-between bg-[var(--dashboard-bg)]">
                    <div className="w-10 h-2 bg-[var(--primary)]/50" />
                    <div className="flex gap-1"><div className="w-4 h-4 bg-[var(--primary)]/20 border border-[var(--primary)]" /></div>
                </div>
                <div className="flex-1 flex gap-2">
                    {/* Sidebar wireframe */}
                    <div className="w-14 border border-[var(--primary)] flex flex-col gap-2 p-1 bg-[var(--dashboard-surface)]">
                        {[1, 2, 3].map(i => <div key={i} className="w-full h-2 bg-[var(--primary)]/30" />)}
                    </div>
                    {/* Hero placeholder */}
                    <div className="flex-1 border border-[var(--primary)] relative bg-[var(--dashboard-bg)]">
                        <div className="absolute inset-2 border border-[var(--primary)] flex items-center justify-center bg-[var(--dashboard-surface)]">
                            <div className="absolute inset-0 border-t border-[var(--primary)]/30 rotate-12 scale-150" />
                            <div className="absolute inset-0 border-t border-[var(--primary)]/30 -rotate-12 scale-150" />
                            <span className="bg-[var(--primary)] text-[var(--background)] z-10 text-[7px] font-bold px-2 py-0.5">HERO_IMG</span>
                        </div>
                        {/* Measurement */}
                        <div className="absolute -right-4 top-0 bottom-0 border-r-2 border-[var(--primary)] flex items-center justify-center">
                            <span className="rotate-90 text-[7px] font-mono text-[var(--primary)] bg-[var(--dashboard-surface)] px-1 border border-[var(--primary)] z-10 font-bold">AUTO</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Design tokens panel */}
            <div className="relative w-[26%] border border-[var(--primary)] bg-[var(--dashboard-surface)] p-3 flex flex-col gap-3 shadow-[4px_4px_0px_var(--border)]">
                <div className="absolute -top-3 right-2 bg-[var(--dashboard-bg)] px-1 text-[8px] font-mono font-bold text-[var(--primary)] border border-[var(--primary)]">DESIGN_TOKENS</div>
                <div className="mt-2 space-y-1">
                    <div className="text-[8px] opacity-70 font-mono text-[var(--primary)]">Palette</div>
                    <div className="grid grid-cols-4 gap-1">
                        <div className="aspect-square bg-[var(--primary)] border border-[var(--primary)]" />
                        <div className="aspect-square bg-[var(--muted)] border border-[var(--border)]" />
                        <div className="aspect-square bg-[var(--foreground)] border border-[var(--border)]" />
                        <div className="aspect-square bg-[var(--background)] border border-[var(--border)]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, var(--border) 0, var(--border) 1px, transparent 0, transparent 50%)', backgroundSize: '4px 4px' }} />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="text-[8px] opacity-70 font-mono text-[var(--primary)]">Type</div>
                    <div className="border border-[var(--primary)]/50 p-1 bg-[var(--dashboard-bg)]">
                        <div className="text-[10px] font-bold text-[var(--foreground)]">Aa</div>
                        <div className="text-[6px] font-mono text-[var(--primary)] opacity-70">Space Mono</div>
                    </div>
                </div>
                <div className="mt-auto border-t border-[var(--primary)]/20 pt-2">
                    <div className="flex items-center gap-1 text-[8px] font-mono text-[var(--primary)]">
                        <GitBranch size={8} />
                        <span>feat/ui-overhaul</span>
                    </div>
                    <div className="text-[6px] opacity-50 pl-3">Last commit: 2m ago</div>
                </div>
            </div>
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--primary)]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--primary)]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--primary)]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--primary)]" />
        </div>
    );
}

/* ─── PANEL 02: Infrastructure ───────────────────────────────────────── */
function InfraPanel() {
    return (
        <div className="w-full h-full p-4 grid grid-cols-12 gap-4 bg-[var(--dashboard-bg)]">
            {/* Terminal */}
            <div className="col-span-5 bg-[#050505] border border-[var(--primary)] p-3 font-mono text-[9px] text-[var(--primary)] overflow-hidden relative shadow-inner">
                <div className="flex items-center gap-2 mb-2 border-b border-[var(--primary)]/30 pb-2">
                    <TerminalSquare size={10} />
                    <span className="font-bold">sys_logs</span>
                </div>
                <div className="space-y-1.5 opacity-80">
                    <p className="text-[var(--muted)]/60">{`> initializing docker_compose...`}</p>
                    <p className="text-[var(--primary)] font-bold">{`> [info] pod "db_shard_01" online`}</p>
                    <p className="text-[#fccf00]">{`> [warn] cache miss (30ms)`}</p>
                    <p className="text-[var(--muted)]/60">{`> connected to redis... OK`}</p>
                    <p className="text-[var(--primary)] font-bold">{`> migrations applied (18 tables)`}</p>
                    <p className="text-[var(--muted)]/60">{`> api routes mounted: /v1/*`}</p>
                    <p className="text-green-400 font-bold">{`> staging healthy — 99ms`}</p>
                    <motion.p animate={{ opacity: [0, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>_</motion.p>
                </div>
            </div>

            {/* Topology */}
            <div className="col-span-7 relative border border-[var(--primary)]/50 bg-[var(--dashboard-surface)] p-3 shadow-[4px_4px_0px_var(--border)]">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                <div className="h-full flex flex-col justify-between relative z-10">
                    <div className="flex justify-center">
                        <div className="bg-[var(--dashboard-bg)] border border-[var(--primary)] text-[var(--primary)] px-3 py-1.5 text-[8px] font-bold shadow-[2px_2px_0px_var(--primary)] flex items-center gap-2">
                            <Globe size={10} /> API GATEWAY
                        </div>
                    </div>
                    <div className="flex-1 relative my-2">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 100" preserveAspectRatio="none">
                            <path d="M 140 0 L 140 40 L 50 40 L 50 100" fill="none" stroke="var(--primary)" strokeWidth="1" className="opacity-50" />
                            <path d="M 140 0 L 140 40 L 230 40 L 230 100" fill="none" stroke="var(--primary)" strokeWidth="1" className="opacity-50" />
                        </svg>
                        <motion.div className="absolute top-0 left-0 w-2 h-2 bg-[var(--primary)]" animate={{ offsetDistance: "100%" }} style={{ offsetPath: "path('M 140 0 L 140 40 L 50 40 L 50 100')" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                        <motion.div className="absolute top-0 left-0 w-2 h-2 bg-[#fccf00]" animate={{ offsetDistance: "100%" }} style={{ offsetPath: "path('M 140 0 L 140 40 L 230 40 L 230 100')" }} transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }} />
                    </div>
                    <div className="flex justify-between px-4">
                        <div className="flex flex-col items-center gap-1 z-10">
                            <div className="w-8 h-8 bg-[var(--dashboard-bg)] border border-[var(--primary)] flex items-center justify-center shadow-[2px_2px_0px_var(--primary)]"><Lock size={12} className="text-[var(--primary)]" /></div>
                            <span className="text-[6px] font-mono font-bold text-[var(--primary)] bg-[var(--dashboard-bg)] px-1 border border-[var(--primary)]">AUTH_SVC</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 z-10">
                            <div className="w-8 h-8 bg-[var(--dashboard-bg)] border border-[#fccf00] flex items-center justify-center shadow-[2px_2px_0px_#fccf00]"><Database size={12} className="text-[#fccf00]" /></div>
                            <span className="text-[6px] font-mono font-bold text-[#fccf00] bg-[var(--dashboard-bg)] px-1 border border-[#fccf00]">POSTGRES_DB</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── PANEL 03: Interface Build ──────────────────────────────────────── */
function InterfacePanel() {
    return (
        <div className="w-full h-full flex flex-col bg-[var(--background)]">
            {/* Browser chrome */}
            <div className="h-9 border-b border-[var(--border)] bg-[var(--dashboard-bg)] flex items-center px-4 gap-3 flex-shrink-0">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-[#fccf00] border border-[var(--border)]" />
                    <div className="w-2.5 h-2.5 bg-[var(--primary)] border border-[var(--border)]" />
                    <div className="w-2.5 h-2.5 bg-green-400 border border-[var(--border)]" />
                </div>
                <div className="flex-1 h-6 bg-[var(--background)] border border-[var(--border)] flex items-center px-3 gap-2 max-w-[280px]">
                    <Globe size={10} className="text-[var(--muted)]" />
                    <span className="text-[10px] font-mono text-[var(--muted)]">localhost:3000</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-[8px] font-mono text-[var(--primary)] border border-[var(--primary)] px-1.5 py-0.5 animate-pulse">HMR ACTIVE</span>
                </div>
            </div>
            {/* Page under construction */}
            <div className="flex-1 flex bg-[var(--dashboard-bg)]">
                {/* Sidebar skeleton */}
                <div className="w-48 border-r border-[var(--border)] bg-[var(--dashboard-surface)] p-3 flex flex-col gap-2">
                    <div className="w-16 h-4 bg-[var(--primary)]/60 mb-2 border border-[var(--primary)]" />
                    {["Dashboard", "Projects", "Team", "Settings"].map((label, i) => (
                        <div key={i} className={`h-8 flex items-center px-2 gap-2 text-[9px] font-mono font-bold cursor-pointer border ${i === 0 ? 'bg-[var(--primary)] text-[var(--background)] border-[var(--primary)]' : 'text-[var(--muted)] border-transparent hover:border-[var(--border)]'}`}>
                            <div className="w-2 h-2 border border-current opacity-60" />
                            {label}
                        </div>
                    ))}
                </div>
                {/* Main area */}
                <div className="flex-1 p-5 space-y-3">
                    {/* Being built indicator */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="h-6 w-32 bg-[var(--primary)]/20 border border-[var(--primary)]/40" />
                        <div className="text-[8px] font-mono text-[var(--primary)] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-pulse" />
                            COMPILING
                        </div>
                    </div>
                    {/* Hero component skeleton */}
                    <div className="h-24 border border-[var(--primary)]/60 border-dashed flex items-center justify-center bg-[var(--primary)]/5 relative">
                        <Layout className="text-[var(--primary)] opacity-40" size={24} />
                        <span className="ml-2 text-[9px] font-mono text-[var(--primary)] opacity-60">HeroSection.tsx</span>
                        <div className="absolute top-1 right-2 text-[7px] font-mono text-[var(--primary)]/50">72 lines</div>
                    </div>
                    {/* Card grid skeleton */}
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-14 border border-[var(--primary)]/30 bg-[var(--primary)]/5 flex flex-col p-2 gap-1">
                                <div className="h-2 w-3/4 bg-[var(--primary)]/20" />
                                <div className="h-1.5 w-1/2 bg-[var(--primary)]/15" />
                            </div>
                        ))}
                    </div>
                    {/* Status bar */}
                    <div className="mt-auto pt-2 border-t border-[var(--border)] flex gap-4 text-[7px] font-mono text-[var(--muted)]">
                        <span className="text-green-400">✓ TypeScript: 0 errors</span>
                        <span className="text-[var(--primary)]">~ 3 components staged</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── PANEL 04: Live Dashboard ───────────────────────────────────────── */
function LivePanel() {
    return (
        <div className="w-full h-full flex flex-col bg-[var(--background)]">
            {/* Browser chrome */}
            <div className="h-9 border-b border-[var(--border)] bg-[var(--dashboard-bg)] flex items-center px-4 gap-3 flex-shrink-0">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-[#fccf00] border border-[var(--border)]" />
                    <div className="w-2.5 h-2.5 bg-[var(--primary)] border border-[var(--border)]" />
                    <div className="w-2.5 h-2.5 bg-green-400 border border-[var(--border)]" />
                </div>
                <div className="flex-1 h-6 bg-[var(--background)] border border-[var(--border)] flex items-center px-3 gap-2 max-w-[280px]">
                    <Lock size={10} className="text-green-500" />
                    <span className="text-[10px] font-mono text-green-500">https://app.mzltd.tech/dashboard</span>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-[8px] font-mono">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-400 font-bold">LIVE</span>
                </div>
            </div>
            {/* Dashboard body */}
            <div className="flex-1 flex">
                {/* Sidebar */}
                <div className="w-14 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col items-center py-4 gap-4">
                    <div className="p-2 bg-[var(--primary)]"><Zap size={14} className="text-[var(--background)]" /></div>
                    <div className="p-2 text-[var(--muted)]"><Home size={14} /></div>
                    <div className="p-2 text-[var(--muted)]"><Users size={14} /></div>
                    <div className="mt-auto p-2 text-[var(--muted)]"><Settings size={14} /></div>
                </div>
                {/* Main */}
                <div className="flex-1 p-5 bg-[var(--background)]">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-[var(--foreground)]">Overview</h3>
                            <p className="text-[9px] text-[var(--muted)]">Last updated: just now</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-bold text-green-500">SYSTEM HEALTHY</span>
                        </div>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        {[
                            { label: "Users", value: "24.5k", delta: "↑ 12%", color: "green-400" },
                            { label: "Latency", value: "24ms", delta: "⚡ Edge", color: "var(--primary)" },
                            { label: "Uptime", value: "99.9%", delta: "30d avg", color: "var(--accent-cyan)" },
                        ].map((m, i) => (
                            <div key={i} className="bg-[var(--surface)] border border-[var(--border)] p-3">
                                <div className="text-[9px] text-[var(--muted)] mb-1">{m.label}</div>
                                <div className="text-lg font-bold text-[var(--foreground)]">{m.value}</div>
                                <div className="text-[8px] text-green-400 mt-0.5">{m.delta}</div>
                            </div>
                        ))}
                    </div>

                    {/* Bar chart */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] p-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] text-[var(--muted)]">TOTAL REQUESTS / DAY</span>
                            <Activity size={12} className="text-[var(--accent-cyan)]" />
                        </div>
                        <div className="flex items-end gap-1 h-14">
                            {[30, 45, 35, 60, 50, 75, 65, 85, 70, 95].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.04, duration: 0.4 }}
                                    className="flex-1 bg-gradient-to-t from-[var(--accent-cyan)]/40 to-[var(--accent-cyan)] rounded-t-sm"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const panels = [BlueprintPanel, InfraPanel, InterfacePanel, LivePanel];

export default function Process() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeStep, setActiveStep] = useState(0);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        const stepDuration = 1 / steps.length;
        const currentStep = Math.floor(latest / stepDuration);
        const clampedStep = Math.max(0, Math.min(currentStep, steps.length - 1));
        if (clampedStep !== activeStep) setActiveStep(clampedStep);
    });

    const ActivePanel = panels[activeStep];

    return (
        <section id="process" ref={containerRef} className="relative h-[400vh] bg-[var(--background)]">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">

                {/* Background grid */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">

                    {/* ─── LEFT: TEXT + PROGRESS TRACKER ──── */}
                    <div className="flex flex-col justify-center">

                        {/* Section label */}
                        <div className="mb-8">
                            <span className="inline-block border border-[var(--border)] bg-[var(--surface)] px-4 py-1 text-xs font-mono font-bold text-[var(--muted)] uppercase tracking-widest">
                                [ 05 // ENGAGEMENT MODEL ]
                            </span>
                        </div>

                        {/* Step list — vertical progress tracker */}
                        <div className="mb-8 space-y-2">
                            {steps.map((step, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    {/* Line + dot */}
                                    <div className="flex flex-col items-center gap-0 flex-shrink-0 pt-1">
                                        <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all duration-300 ${activeStep === i ? 'border-[var(--primary)] bg-[var(--primary)]' : activeStep > i ? 'border-[var(--primary)] bg-[var(--primary)]/20' : 'border-[var(--border)] bg-transparent'}`}>
                                            {activeStep > i ? (
                                                <CheckCircle2 size={10} className="text-[var(--primary)]" />
                                            ) : (
                                                <span className={`text-[8px] font-bold font-mono ${activeStep === i ? 'text-[var(--background)]' : 'text-[var(--muted)]'}`}>{step.id}</span>
                                            )}
                                        </div>
                                        {i < steps.length - 1 && (
                                            <div className={`w-0.5 h-5 transition-all duration-300 ${activeStep > i ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
                                        )}
                                    </div>
                                    {/* Step title */}
                                    <div className={`transition-all duration-300 pb-4 ${i < steps.length - 1 ? '' : ''}`}>
                                        <span className={`font-mono font-bold text-sm transition-colors duration-300 ${activeStep === i ? 'text-[var(--primary)]' : activeStep > i ? 'text-[var(--muted)]' : 'text-[var(--muted)]/50'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Active step detail */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35 }}
                                className="space-y-4 max-w-lg"
                            >
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-[var(--foreground)]">
                                    {steps[activeStep].title}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-[var(--primary)] px-2 py-0.5 bg-[var(--dashboard-surface)] border border-[var(--border)] shadow-[2px_2px_0px_var(--primary)]">
                                        PHASE_{steps[activeStep].tag}
                                    </span>
                                </div>
                                <p className="text-[var(--muted)] text-lg leading-relaxed border-l-2 border-[var(--primary)] pl-4">
                                    {steps[activeStep].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ─── RIGHT: PANEL ──── */}
                    <div className="flex items-center justify-center h-full perspective-[2000px]">
                        <motion.div
                            className="relative w-[340px] h-[220px] md:w-[600px] md:h-[400px] overflow-hidden border-2 border-[var(--primary)] shadow-[12px_12px_0px_var(--primary)]"
                            animate={{
                                rotateX: activeStep === 0 ? 20 : 0,
                            }}
                            transition={{ duration: 0.9, type: "spring", bounce: 0.15 }}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStep}
                                    className="absolute inset-0"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.35 }}
                                >
                                    <ActivePanel />
                                </motion.div>
                            </AnimatePresence>

                            {/* Completion badge — Phase 04 only */}
                            {activeStep === 3 && (
                                <motion.div
                                    className="absolute inset-0 pointer-events-none flex items-end justify-start p-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <motion.div
                                        initial={{ scale: 0, y: 10 }}
                                        animate={{ scale: 1, y: 0 }}
                                        transition={{ type: "spring", delay: 0.5 }}
                                        className="bg-green-500 text-[var(--background)] px-4 py-1.5 font-bold text-xs shadow-[4px_4px_0px_black] flex items-center gap-2"
                                    >
                                        <CheckCircle2 size={12} />
                                        DEPLOYMENT COMPLETE
                                    </motion.div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}