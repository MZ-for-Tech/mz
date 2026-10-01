"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Database, Cpu, Zap, Plus, Binary } from "lucide-react";
import { cn } from "@/research/lib/utils";
import { VizToggleGroup, VizCounter } from "@/research/features/studies/applied-stats-in-ai/VizPrimitives";

export default function CompoundingSimulator() {
  const [l0Enabled, setL0Enabled] = useState(false);
  const [svdEnabled, setSvdEnabled] = useState(false);
  const [precision, setPrecision] = useState<"FP32" | "INT8" | "INT4">("FP32");

  const stats = useMemo(() => {
    let size = 532.6; // MB (Table 12)
    let latency = 231.3; // ms (Table 12)
    
    if (l0Enabled) {
      size *= 0.2533; 
      latency *= 0.419; 
    }
    
    if (svdEnabled) {
      size *= 0.1547; 
      latency *= 0.9364; 
    }

    if (precision === "INT8") {
      size /= 4;
      latency *= 0.5;
    } else if (precision === "INT4") {
      size /= 8;
      latency *= 0.35; // Projected 3x speedup on specialized 4-bit kernels
    }
    
    return {
      size,
      latency,
      sizeRed: ((532.6 - size) / 532.6) * 100,
      latRed: ((231.3 - latency) / 231.3) * 100
    };
  }, [l0Enabled, svdEnabled, precision]);

  return (
    <div className="w-full bg-paper border border-ink/10 rounded-sm overflow-hidden my-12">
      <div className="p-6 border-b border-ink/5 bg-ink/[0.02] flex justify-between items-center">
        <div>
          <h4 className="text-lg font-latex font-bold text-ink tracking-tight">Compounding Efficiency</h4>
          <p className="text-xs font-mono uppercase tracking-widest text-tertiary">Simulation of Pipeline Stacking</p>
        </div>
        <div className="flex items-center gap-2 text-accent">
          <Zap className="w-4 h-4 fill-current" />
          <span className="text-xs font-mono font-bold">
            <VizCounter value={stats.sizeRed} suffix="% COMPRESSION" decimals={1} />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-8 border-e border-ink/5 space-y-10">
          <div className="space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-tertiary border-b border-ink/5 pb-2">Compression Vectors</div>
            
            <button 
              onClick={() => setL0Enabled(!l0Enabled)}
              className={cn(
                "w-full p-4 rounded-sm border transition-all flex items-center justify-between group",
                l0Enabled ? "bg-accent/5 border-accent/30" : "bg-paper border-ink/10"
              )}
            >
              <div className="flex items-center gap-4 text-left">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", l0Enabled ? "bg-accent text-paper" : "bg-ink/5 text-ink/60")}>
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className={cn("block text-sm font-bold uppercase", l0Enabled ? "text-accent" : "text-ink")}>Structured L0 Surgery</span>
                  <span className="text-xs text-secondary opacity-60">Pruning Conv Channels</span>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setSvdEnabled(!svdEnabled)}
              className={cn(
                "w-full p-4 rounded-sm border transition-all flex items-center justify-between group",
                svdEnabled ? "bg-accent/5 border-accent/30" : "bg-paper border-ink/10"
              )}
            >
              <div className="flex items-center gap-4 text-left">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", svdEnabled ? "bg-accent text-paper" : "bg-ink/5 text-ink/60")}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <span className={cn("block text-sm font-bold uppercase", svdEnabled ? "text-accent" : "text-ink")}>Low-Rank SVD</span>
                  <span className="text-xs text-secondary opacity-60">Factorizing Dense Heads</span>
                </div>
              </div>
            </button>

            <div className="space-y-4">
              <VizToggleGroup
                value={precision}
                onChange={(v) => setPrecision(v as "FP32" | "INT8" | "INT4")}
                options={[
                  { value: "FP32", label: "FP32" },
                  { value: "INT8", label: "INT8", accentWhenActive: true },
                  { value: "INT4", label: "INT4", accentWhenActive: true },
                ]}
                className="w-full"
              />
              <div className="flex items-center gap-4 px-2">
                <Binary className="w-4 h-4 text-ink/20" />
                <span className="text-xs text-secondary opacity-60">Post-Training Quantization Strategy</span>
              </div>
            </div>

            <AnimatePresence>
              {precision === "INT4" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-semantic-error/5 border border-semantic-error/20 rounded-sm overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <Zap className="w-4 h-4 text-semantic-error mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed text-semantic-error/70 font-latex italic">
                      <strong>WARNING:</strong> 4-bit precision may induce representation collapse in structurally pruned models without intensive Quantization-Aware Training (QAT).
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative pt-6 flex flex-col items-center gap-4">
             <div className="text-xs font-mono uppercase text-tertiary tracking-widest mb-2">Architectural Result</div>
             <div className="flex flex-col items-center gap-1 w-full max-w-[200px]">
                <motion.div 
                  animate={{ 
                    width: l0Enabled ? "40%" : "100%",
                    backgroundColor: l0Enabled ? "var(--accent-val)" : "var(--ink-val)",
                    opacity: l0Enabled ? 0.8 : 0.1,
                    filter: precision !== "FP32" ? `grayscale(${precision === "INT4" ? 1 : 0.5}) brightness(${precision === "INT4" ? 1.5 : 1.2})` : "none"
                  }}
                  className="h-12 rounded-t-sm flex items-center justify-center text-paper font-mono text-xs overflow-hidden"
                >
                  {l0Enabled ? "THIN CONV" : "DENSE CONV"}
                </motion.div>
                <div className="w-full h-px bg-ink/10" />
                <motion.div 
                  animate={{ 
                    width: svdEnabled ? "25%" : "100%",
                    backgroundColor: svdEnabled ? "var(--accent-val)" : "var(--ink-val)",
                    opacity: svdEnabled ? 0.8 : 0.2,
                    filter: precision !== "FP32" ? `grayscale(${precision === "INT4" ? 1 : 0.5}) brightness(${precision === "INT4" ? 1.5 : 1.2})` : "none"
                  }}
                  className="h-20 rounded-b-sm flex items-center justify-center text-paper font-mono text-xs overflow-hidden"
                >
                  {svdEnabled ? "LR HEAD" : "DENSE CLASSIFIER"}
                </motion.div>
             </div>
          </div>
        </div>

        <div className="bg-ink p-12 text-paper flex flex-col justify-center gap-12 relative overflow-hidden">
          <div className="absolute top-0 end-0 p-8 opacity-10 pointer-events-none">
            <Cpu className="w-64 h-64" />
          </div>

          <div className="space-y-8 relative z-10">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.3em] text-accent mb-4">Memory Footprint</div>
              <div className="flex items-baseline gap-4">
                <VizCounter 
                  value={stats.size} 
                  decimals={stats.size < 1 ? 3 : stats.size < 10 ? 2 : 1} 
                  className="text-6xl font-latex font-bold" 
                />
                <span className="text-xl text-paper/40 font-latex italic">MB</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-[0.3em] text-accent mb-4">Inference Latency</div>
              <div className="flex items-baseline gap-4">
                <VizCounter 
                  value={stats.latency} 
                  decimals={1} 
                  className="text-6xl font-latex font-bold" 
                />
                <span className="text-xl text-paper/40 font-latex italic">ms</span>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-paper/10 relative z-10">
            <div className="flex items-center gap-4 text-xs font-latex italic text-paper/60">
              <Plus className="w-4 h-4 text-accent" />
              <span>Stacked compression vectors yield super-linear savings in deployment environments.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
