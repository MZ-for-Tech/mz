"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, TrendingUp, ChevronRight } from "lucide-react";
import { EditorialPlate } from "@/research/features/studies/applied-stats-in-ai/VizPrimitives";
import { cn } from "@/research/lib/utils";

const data = [
  { name: "Eosinophils", f1: 100.00, precision: 100.0, recall: 100.0 },
  { name: "Platelets", f1: 100.00, precision: 100.0, recall: 100.0 },
  { name: "Basophils", f1: 99.59, precision: 99.42, recall: 99.76 },
  { name: "Lymphocytes", f1: 99.59, precision: 99.65, recall: 99.53 },
  { name: "Erythroblasts", f1: 99.36, precision: 99.21, recall: 99.51 },
  { name: "Monocytes", f1: 98.59, precision: 98.42, recall: 98.76 },
  { name: "Neutrophils", f1: 96.85, precision: 96.52, recall: 97.18 },
  { name: "Immature Granulocytes", f1: 96.03, precision: 95.84, recall: 96.22 }
];

const MACRO_F1 = 98.57;

export default function BaselineMetrics() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <EditorialPlate>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Metric Sidebar */}
        <div className="lg:col-span-4 border-e border-ink/5 p-6 space-y-8 bg-ink/[0.01]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xxs font-mono uppercase tracking-widest text-tertiary">
              <Target className="w-3 h-3" />
              Summary Statistics
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-paper border border-ink/5 rounded-sm">
                <div className="text-[10px] font-mono text-tertiary uppercase mb-1">Macro-F1</div>
                <div className="text-xl font-latex font-bold text-ink">98.57%</div>
              </div>
              <div className="p-4 bg-paper border border-ink/5 rounded-sm">
                <div className="text-[10px] font-mono text-tertiary uppercase mb-1">Latency</div>
                <div className="text-xl font-latex font-bold text-ink">231ms</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xxs font-mono uppercase tracking-widest text-tertiary">
              <TrendingUp className="w-3 h-3" />
              Class Insights
            </div>
            <AnimatePresence mode="wait">
              {hoveredIdx !== null ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="p-4 bg-accent/5 border border-accent/20 rounded-sm"
                >
                  <h5 className="text-xs font-bold text-accent mb-3 uppercase tracking-tighter flex items-center gap-2">
                    <ChevronRight className="w-3 h-3" />
                    {data[hoveredIdx].name}
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xxs font-mono">
                      <span className="text-tertiary">Precision</span>
                      <span className="text-ink font-bold">{data[hoveredIdx].precision}%</span>
                    </div>
                    <div className="flex justify-between text-xxs font-mono">
                      <span className="text-tertiary">Recall</span>
                      <span className="text-ink font-bold">{data[hoveredIdx].recall}%</span>
                    </div>
                    <div className="flex justify-between text-xxs font-mono pt-2 border-t border-accent/10">
                      <span className="text-tertiary">F1-Score</span>
                      <span className="text-accent font-bold">{data[hoveredIdx].f1}%</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border border-ink/5 rounded-sm italic text-xs text-tertiary font-latex"
                >
                  Hover a data point to inspect class-specific precision and recall metrics.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* The Visual Plate */}
        <div className="lg:col-span-8 p-8 relative">
          <div className="mb-6 flex justify-between items-end">
            <span className="text-xxs font-mono uppercase tracking-[0.2em] text-tertiary">F1-Score Distribution (%)</span>
            <div className="flex gap-4 text-[10px] font-mono text-tertiary uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-ink" />
                <span>Optimal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>Critical</span>
              </div>
            </div>
          </div>

          <div className="relative h-[360px] w-full group">
            {/* Y-Axis Labels */}
            <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none">
              {data.map((item, i) => (
                <div key={item.name} className="flex items-center gap-4">
                  <span className={cn(
                    "text-[10px] font-mono uppercase tracking-tighter w-32 text-right transition-colors duration-300",
                    hoveredIdx === i ? "text-ink font-bold" : "text-tertiary opacity-60"
                  )}>
                    {item.name}
                  </span>
                  <div className="h-[1px] flex-1 bg-ink/5" />
                </div>
              ))}
            </div>

            {/* X-Axis Gridlines */}
            <div className="absolute inset-0 start-36 flex justify-between pointer-events-none">
              {[90, 92, 94, 96, 98, 100].map(v => (
                <div key={v} className="relative h-full">
                  <div className="h-full w-[1px] bg-ink/[0.03] border-s border-dashed border-ink/10" />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-tertiary opacity-40">{v}%</span>
                </div>
              ))}
            </div>

            {/* Macro-F1 Reference Line */}
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 1, duration: 1 }}
              style={{ left: `calc(144px + ${(MACRO_F1 - 90) / 10 * (100 - 0)}%)` }}
              className="absolute top-0 bottom-0 w-[1px] bg-accent/20 z-10"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-accent text-paper text-[8px] font-mono px-1 py-0.5 rounded-t-sm whitespace-nowrap">
                AVG: {MACRO_F1}%
              </div>
            </motion.div>

            {/* Data Points */}
            <div className="absolute inset-0 start-36 py-4">
              {data.map((item, i) => {
                const xPos = ((item.f1 - 90) / 10) * 100;
                const isCritical = item.f1 < 97;

                return (
                  <div
                    key={item.name}
                    className="h-[calc(100%/8)] flex items-center relative group/row cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Hover highlight line */}
                    <AnimatePresence>
                      {hoveredIdx === i && (
                        <motion.div
                          layoutId="highlight"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-x-0 inset-y-1 bg-ink/[0.02] -z-10 rounded-sm"
                        />
                      )}
                    </AnimatePresence>

                    {/* The "Needle" */}
                    <div className="relative w-full h-full flex items-center">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xPos}%` }}
                        transition={{ delay: i * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                          "h-[1.5px] rounded-full relative",
                          isCritical ? "bg-accent/40" : "bg-ink/20"
                        )}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 + 0.8 }}
                          className={cn(
                            "absolute end-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 border-2 z-20 transition-transform duration-300",
                            hoveredIdx === i && "scale-150",
                            isCritical ? "bg-accent border-accent" : "bg-ink border-ink"
                          )}
                        />

                        {/* Value Tag */}
                        <AnimatePresence>
                          {hoveredIdx === i && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: -15 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute end-0 text-[10px] font-mono font-bold text-ink whitespace-nowrap bg-paper px-1 rounded-sm border border-ink/5"
                            >
                              {item.f1.toFixed(2)}%
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </EditorialPlate>
  );
}
