"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <section id="contact" ref={containerRef} className="relative py-24 md:py-32 bg-[var(--background)] border-t border-[var(--border)]">

      {/* Background Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <div className="mb-4 text-center">
            <span className="inline-block border border-[var(--border)] bg-[var(--surface)] px-4 py-1 text-xs font-mono font-bold text-[var(--muted)] uppercase tracking-widest mb-4">
              [ 06 // INITIATE SEQUENCE ]
            </span>
          </div>

          <h2 className="relative z-10 text-6xl md:text-9xl font-bold tracking-tighter text-[var(--foreground)] mb-6 leading-[0.9]">
            Let's build <br />
            <span className="relative z-10 text-[var(--primary)]">something precise.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center gap-6"
        >
          <p className="text-xl md:text-2xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed font-mono">
            Describe what you're building. We'll tell you exactly how we'd build it.
          </p>

          <div className="flex flex-col items-center mt-6 w-full">

            <a href="mailto:hello@mzltd.tech" className="text-3xl md:text-5xl font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors mb-8">
              hello@mzltd.tech
            </a>

            <form className="w-full max-w-md space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-widest text-[var(--muted)]">Name</label>
                <input type="text" className="w-full bg-[var(--dashboard-bg)] border-2 border-[var(--border)] px-4 py-3 text-[var(--foreground)] font-mono focus:outline-none focus:border-[var(--primary)] focus:shadow-[4px_4px_0px_var(--primary)] transition-all" placeholder="John Doe" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-widest text-[var(--muted)]">Email</label>
                <input type="email" className="w-full bg-[var(--dashboard-bg)] border-2 border-[var(--border)] px-4 py-3 text-[var(--foreground)] font-mono focus:outline-none focus:border-[var(--primary)] focus:shadow-[4px_4px_0px_var(--primary)] transition-all" placeholder="john@company.com" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-widest text-[var(--muted)]">Project Details</label>
                <textarea rows={4} className="w-full bg-[var(--dashboard-bg)] border-2 border-[var(--border)] px-4 py-3 text-[var(--foreground)] font-mono focus:outline-none focus:border-[var(--primary)] focus:shadow-[4px_4px_0px_var(--primary)] transition-all resize-none" placeholder="What are we building?"></textarea>
              </div>
              <button type="button" onClick={() => window.location.href = 'mailto:hello@mzltd.tech'} className="w-full py-4 mt-6 bg-[var(--foreground)] text-[var(--background)] text-sm font-bold hover:bg-[var(--primary)] hover:text-white border-2 border-[var(--foreground)] hover:border-[var(--primary)] transition-all duration-300 shadow-[4px_4px_0px_var(--border)] hover:shadow-[8px_8px_0px_var(--border)] hover:-translate-y-1 hover:-translate-x-1 flex items-center justify-center gap-2 group">
                <span className="font-mono tracking-widest uppercase">Submit Your Brief</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </motion.div>

      </div>
    </section>
  );
}