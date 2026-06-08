"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MouseEvent, useState, useEffect } from "react";
import {
  Terminal, Command, GitBranch, Database, Users, HardDrive, CheckCircle2,
  Activity, Globe
} from "lucide-react";
import LinearBackground from "@/components/ui/LinearBackground";

export default function Hero() {
  // --- 3D TILT LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 100, damping: 20 });
  // Reduced tilt range for premium feel
  const rotateX = useTransform(smoothY, [-0.5, 0.5], ["2deg", "-2deg"]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], ["-2deg", "2deg"]);

  const handleMouseMove = (e: MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

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
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full pt-20 pb-20 flex flex-col items-center justify-start overflow-hidden bg-[var(--background)] perspective-1000"
    >

      {/* === BACKGROUND: GEOMETRIC LINES & MESH === */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical alignment lines mimicking logo architecture */}
        <div className="absolute left-[15%] top-0 bottom-0 w-[1px] bg-[var(--primary)] opacity-60 hidden md:block"></div>
        <div className="absolute left-[85%] top-0 bottom-0 w-[1px] bg-[var(--primary)] opacity-60 hidden md:block"></div>
        {/* Horizontal baseline */}
        <div className="absolute left-0 right-0 top-[20%] h-[1px] bg-[var(--primary)] opacity-40 hidden md:block"></div>
      </div>
      <LinearBackground opacity={0.12} />

      {/* === TEXT CONTENT === */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mb-12 pt-4">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex items-center justify-center gap-4 text-xs font-mono font-bold tracking-widest text-[var(--muted)]"
        >
          <span className="w-8 h-[1px] bg-[var(--primary)]"></span>
          <span>[ 01 // MZ STUDIO ]</span>
          <span className="w-8 h-[1px] bg-[var(--primary)]"></span>
        </motion.div>

        <motion.h1
          className="text-6xl md:text-[7rem] font-bold tracking-tighter text-[var(--foreground)] mb-6 leading-[0.85] md:leading-[0.85] uppercase"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 100 }}
        >
          Precision-built <br />
          <span className="text-[var(--primary)] block mt-2">
            digital<br />products.
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-8 leading-relaxed font-mono tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          We build the sites people share, the tools teams rely on, and the platforms that grow careers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col md:flex-row gap-6 justify-center items-center"
        >
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, "#contact")}
            className="group relative block w-full md:w-auto"
          >
            <div className="absolute inset-0 bg-[var(--primary)] translate-x-1.5 translate-y-1.5 transition-transform group-hover:translate-x-0 group-hover:translate-y-0"></div>
            <div className="relative border-2 border-[var(--primary)] bg-[var(--background)] px-8 py-4 text-[var(--primary)] font-bold text-lg hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors flex items-center justify-center gap-3">
              <Command size={20} /> START A PROJECT
            </div>
          </a>
          <a
            href="#projects"
            onClick={(e) => scrollToSection(e, "#projects")}
            className="group relative block w-full md:w-auto"
          >
            <div className="absolute inset-0 bg-[var(--border)] translate-x-1.5 translate-y-1.5 transition-transform group-hover:translate-x-0 group-hover:translate-y-0"></div>
            <div className="relative border-2 border-[var(--border)] bg-[var(--surface)] px-8 py-4 text-[var(--foreground)] font-bold text-lg hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors flex items-center justify-center gap-3">
              <Globe size={20} /> SEE OUR WORK
            </div>
          </a>
        </motion.div>
      </div>

      {/* === THE DASHBOARD (Full Stack Console) === */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.4, type: "spring" }}
        className="relative mx-auto w-full max-w-6xl px-4"
      >
        <div className="relative border border-[var(--border)] bg-[var(--dashboard-surface)] shadow-[8px_8px_0px_var(--border)] overflow-hidden flex flex-col min-h-[500px]">

          {/* Header */}
          <div className="w-full h-12 border-b border-[var(--border)] bg-[var(--dashboard-bg)] flex items-center px-4 justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 opacity-80">
                <div className="w-3 h-3 bg-[var(--primary)]"></div>
                <div className="w-3 h-3 bg-[var(--accent-gold)]"></div>
                <div className="w-3 h-3 bg-[var(--foreground)]"></div>
              </div>
              <div className="h-4 w-[1px] bg-[var(--border)]"></div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted)] font-mono">
                <span className="text-[var(--primary)] font-bold">mz-studio</span>
                <span className="opacity-50 text-[var(--foreground)]">/</span>
                <span className="text-[var(--foreground)]">production</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)] text-xs font-mono">
                <div className="w-1.5 h-1.5 bg-[var(--primary)] animate-pulse"></div>
                Available for Projects
              </div>
              <div className="w-6 h-6 bg-[var(--accent-gold)] border border-[var(--border)]"></div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">

            {/* LEFT PANEL: FRONTEND */}
            <div className="p-6 flex flex-col gap-6 bg-transparent relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 pointer-events-none"></div>
              <div className="relative z-10 flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Globe size={16} /> Frontend Deployment
                </h3>
                <span className="text-[10px] bg-[var(--foreground)] text-[var(--dashboard-bg)] px-2 py-0.5 font-bold">READY</span>
              </div>

              {/* Deployment Card */}
              <div className="relative z-10 bg-[var(--dashboard-bg)] border border-[var(--border)] p-4 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider">Production Build</div>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-mono">
                      <GitBranch size={12} className="text-[var(--accent-gold)]" />
                      <span>main</span>
                      <span className="w-1 h-1 bg-[var(--border)]"></span>
                      <span>Just now</span>
                    </div>
                  </div>
                  <div className="w-20 h-12 bg-[var(--background)] border border-[var(--border)] relative overflow-hidden group">
                    <div className="absolute top-1 left-1 right-1 h-1 bg-[var(--border)] mb-1"></div>
                    <div className="absolute top-3 left-1 w-8 h-6 bg-[var(--primary)]/20 group-hover:bg-[var(--primary)] transition-colors"></div>
                  </div>
                </div>

                {/* Build Step Indicators */}
                <div className="space-y-3 font-mono">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-3 h-3 bg-[var(--primary)]"></div>
                    <span className="text-[var(--foreground)]">Build compiled successfully</span>
                    <span className="ml-auto text-[var(--muted)]">42s</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-3 h-3 bg-[var(--primary)]"></div>
                    <span className="text-[var(--foreground)]">Edge functions optimized</span>
                    <span className="ml-auto text-[var(--muted)]">1.2s</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs opacity-70">
                    <div className="w-3 h-3 border-2 border-[var(--accent-gold)] border-t-transparent animate-spin"></div>
                    <span className="text-[var(--accent-gold)]">Propagating to Global Edge...</span>
                  </div>
                </div>
              </div>

              {/* Live Logs */}
              <LiveLogs />
            </div>

            {/* RIGHT PANEL: BACKEND (MZ Structure) */}
            <div className="p-6 flex flex-col gap-6 bg-[var(--dashboard-bg)]">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Database size={16} /> Backend Services
                </h3>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[var(--primary)] animate-pulse"></div>
                  <div className="w-2 h-2 bg-[var(--primary)] animate-pulse delay-75"></div>
                </div>
              </div>

              {/* Service Grid */}
              <div className="grid grid-cols-2 gap-4">

                {/* Database Card */}
                <div className="p-4 border border-[var(--border)] bg-[var(--dashboard-surface)] hover:border-[var(--primary)] transition-colors group cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 flex items-start justify-end p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 bg-[var(--accent-gold)]"></div>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-[var(--muted)] group-hover:text-[var(--primary)]">
                    <Database size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Postgres</span>
                  </div>
                  <div className="text-2xl font-bold text-[var(--foreground)] mb-1 font-mono tracking-tight">
                    <NumberTicker value={1204} fluctuation={50} /> <span className="text-sm font-normal text-[var(--muted)]">req/s</span>
                  </div>
                  <div className="w-full h-[2px] bg-[var(--border)] overflow-hidden mt-4">
                    <div className="h-full bg-[var(--primary)] w-[40%] animate-pulse"></div>
                  </div>
                </div>

                {/* Auth Card */}
                <div className="p-4 border border-[var(--border)] bg-[var(--dashboard-surface)] hover:border-[var(--primary)] transition-colors group cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 flex items-start justify-end p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 bg-[var(--accent-gold)]"></div>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-[var(--muted)] group-hover:text-[var(--primary)]">
                    <Users size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Authentication</span>
                  </div>
                  <div className="text-2xl font-bold text-[var(--foreground)] mb-1 font-mono tracking-tight">
                    <NumberTicker value={8492} fluctuation={2} />
                  </div>
                  <div className="text-[10px] text-[var(--primary)] tracking-widest uppercase mt-4">+124 this week</div>
                </div>

                {/* Storage Card */}
                <div className="p-4 border border-[var(--border)] bg-[var(--dashboard-surface)] hover:border-[var(--primary)] transition-colors group cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 flex items-start justify-end p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 bg-[var(--accent-gold)]"></div>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-[var(--muted)] group-hover:text-[var(--primary)]">
                    <HardDrive size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Storage</span>
                  </div>
                  <div className="text-2xl font-bold text-[var(--foreground)] mb-1 font-mono tracking-tight">
                    4.2 <span className="text-sm font-normal text-[var(--muted)]">GB</span>
                  </div>
                  <div className="text-[10px] text-[var(--muted)] tracking-widest uppercase mt-4">8,102 assets</div>
                </div>

                {/* Edge Card */}
                <div className="p-4 border border-[var(--border)] bg-[var(--dashboard-surface)] hover:border-[var(--primary)] transition-colors group cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 flex items-start justify-end p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 bg-[var(--accent-gold)]"></div>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-[var(--muted)] group-hover:text-[var(--primary)]">
                    <Activity size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Edge Functions</span>
                  </div>
                  <div className="text-2xl font-bold text-[var(--foreground)] mb-1 font-mono tracking-tight">
                    99.9<span className="text-sm font-normal text-[var(--muted)]">%</span>
                  </div>
                  <div className="text-[10px] text-[var(--primary)] tracking-widest uppercase mt-4">Healthy</div>
                </div>

              </div>

              {/* Animated Graph */}
              <div className="mt-auto h-24 border border-[var(--border)] bg-[var(--dashboard-surface)] relative overflow-hidden flex items-end justify-between px-1 pb-0">
                <div className="absolute top-2 left-2 text-[10px] text-[var(--muted)] font-mono z-10 uppercase tracking-widest">API Requests (Live)</div>
                <LiveGraphBars />
              </div>

            </div>

          </div>

        </div>
      </motion.div>
    </section>
  );
}

// --- SUB-COMPONENTS ---

function LiveLogs() {
  const [logs, setLogs] = useState<string[]>([
    "info - Creating an optimized production build...",
    "info - Compiled successfully",
    "edge - Middlewares loaded: 3",
  ]);

  useEffect(() => {
    const messages = [
      "info - Generating static pages (42/42)",
      "info - Collecting page data...",
      "edge - Function invoked: /api/auth",
      "info - Finalizing page optimization...",
      "warn - Image optimization cache miss",
      "info - Build artifact uploaded",
      "edge - Cold boot: 124ms",
      "info - Prerendering routes...",
    ];

    const interval = setInterval(() => {
      const newMsg = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => {
        const next = [...prev, newMsg];
        if (next.length > 5) return next.slice(next.length - 5);
        return next;
      });
    }, 2000); // New log every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[var(--dashboard-bg)] p-3 font-mono text-[10px] text-[var(--muted)] border border-[var(--border)] h-32 overflow-hidden flex flex-col gap-1 relative shadow-inner">
      <div className="text-[var(--foreground)] border-b border-[var(--border)] pb-1 mb-1 flex justify-between tracking-widest uppercase">
        <span>Build Logs</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[var(--primary)] animate-pulse"></span>TAIL</span>
      </div>
      <div className="flex flex-col gap-1 justify-end h-full">
        {logs.map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="whitespace-nowrap"
          >
            <span className={log.startsWith("warn") ? "text-[var(--accent-gold)]" : (log.startsWith("edge") ? "text-[var(--foreground)]" : "text-[var(--primary)]")}>
              {log.split(" - ")[0]}
            </span>
            <span className="text-[var(--border)]"> - </span>
            {log.split(" - ")[1]}
          </motion.div>
        ))}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[var(--primary)]">$</span>
          <span className="w-2 h-3 bg-[var(--primary)] animate-pulse"></span>
        </div>
      </div>
    </div>
  )
}

function NumberTicker({ value, fluctuation }: { value: number, fluctuation: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * (fluctuation * 2 + 1)) - fluctuation;
      setDisplay(prev => prev + change);
    }, 1500);
    return () => clearInterval(interval);
  }, [fluctuation]);

  return <>{display.toLocaleString()}</>;
}

function LiveGraphBars() {
  const [heights, setHeights] = useState<number[]>(Array(15).fill(20));

  useEffect(() => {
    setHeights(Array.from({ length: 15 }).map(() => Math.random() * 80 + 10));

    const interval = setInterval(() => {
      setHeights(prev => {
        const next = [...prev];
        next.shift();
        next.push(Math.random() * 80 + 10);
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {heights.map((h, i) => (
        <motion.div
          key={i}
          layout
          className="w-full mx-[1px] bg-[var(--primary)]/20 hover:bg-[var(--primary)] transition-colors"
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
        ></motion.div>
      ))}
    </>
  )
}