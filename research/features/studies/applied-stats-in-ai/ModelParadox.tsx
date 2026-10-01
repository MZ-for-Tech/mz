"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Zap, Database } from "lucide-react";
import { VizCounter } from "@/research/features/studies/applied-stats-in-ai/VizPrimitives";

export default function ModelParadox() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 bg-paper border border-ink/10 rounded-sm relative overflow-hidden"
      >
        <div className="absolute top-0 end-0 p-4 opacity-5">
          <Database className="w-24 h-24" />
        </div>
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-tertiary mb-4">Parameters</div>
        <div className="text-2xl md:text-3xl font-latex font-normal text-ink mb-3 tracking-tight flex flex-wrap items-baseline gap-x-1">
          <VizCounter value={139.6} suffix="M" decimals={1} />
          <span className="text-accent opacity-40 mx-0.5 text-xl">→</span>
          <VizCounter value={35.5} suffix="M" decimals={1} />
        </div>
        <p className="text-sm text-secondary leading-relaxed opacity-70 italic font-latex">
          74.5% reduction in total parameters via structured surgery.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-paper border border-ink/10 rounded-sm relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 end-0 p-4 opacity-5">
          <Zap className="w-24 h-24" />
        </div>
        <div>
            <div className="text-xs font-mono text-tertiary uppercase tracking-[0.2em] mb-1">Efficiency Gain</div>
            <div className="text-lg font-latex font-normal text-accent mb-4 tracking-tight">2.39x Speedup</div>
        </div>
        <div className="text-2xl md:text-3xl font-latex font-normal text-ink mb-3 tracking-tight flex flex-wrap items-baseline gap-x-1">
          <VizCounter value={231.3} suffix="ms" decimals={1} />
          <span className="text-accent opacity-40 mx-0.5 text-xl">→</span>
          <VizCounter value={96.9} suffix="ms" decimals={1} />
        </div>
        <p className="text-sm text-secondary leading-relaxed opacity-70 italic font-latex">
          58.1% faster Wall-clock time on standard hardware (T4 GPU).
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-paper border border-ink/10 rounded-sm relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 end-0 p-4 opacity-5">
          <Cpu className="w-24 h-24" />
        </div>
        <div className="text-xs font-mono text-tertiary uppercase tracking-[0.2em] mb-4">Storage Footprint</div>
        <div className="text-2xl md:text-3xl font-latex font-normal text-ink mb-3 tracking-tight flex flex-wrap items-baseline gap-x-1">
          <VizCounter value={532.6} suffix="MB" decimals={1} />
          <span className="text-accent opacity-40 mx-0.5 text-xl">→</span>
          <VizCounter value={134.9} suffix="MB" decimals={1} />
        </div>
        <p className="text-sm text-secondary leading-relaxed">
          Significant reduction in serialized model size for edge deployment.
        </p>
      </motion.div>
    </div>
  );
}
