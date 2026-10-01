"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Target, Layers } from "lucide-react";

const classes = [
  "Basophil", "Eosinophil", "Erythroblast", "IG", "Lymphocyte", "Monocyte", "Neutrophil", "Platelet"
];

const methods = [
  "Baseline", "SVD", "L1 Lasso", "L0 Surgery"
];

// Data from Table 4, 8, 10, and Figure 19 of the thesis
const heatmapData: { [key: string]: { [key: string]: number } } = {
  "Baseline": {
    "Basophil": 99.59, "Eosinophil": 100.00, "Erythroblast": 99.36, "IG": 96.03,
    "Lymphocyte": 99.59, "Monocyte": 98.59, "Neutrophil": 96.85, "Platelet": 100.00
  },
  "SVD": {
    "Basophil": 99.18, "Eosinophil": 99.84, "Erythroblast": 99.19, "IG": 97.06,
    "Lymphocyte": 98.37, "Monocyte": 98.59, "Neutrophil": 97.98, "Platelet": 100.00
  },
  "L1 Lasso": {
    "Basophil": 98.77, "Eosinophil": 99.84, "Erythroblast": 98.07, "IG": 96.36,
    "Lymphocyte": 98.56, "Monocyte": 97.04, "Neutrophil": 97.89, "Platelet": 99.79
  },
  "L0 Surgery": {
    "Basophil": 88.07, "Eosinophil": 98.42, "Erythroblast": 95.96, "IG": 88.57,
    "Lymphocyte": 89.51, "Monocyte": 90.19, "Neutrophil": 94.90, "Platelet": 99.25
  }
};

export default function MethodologyHeatmap() {
  const [hoveredCell, setHoveredCell] = useState<{ m: string, c: string } | null>(null);


  return (
    <div className="w-full bg-paper border border-ink/10 rounded-sm p-8 my-12 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div>
          <h3 className="text-2xl font-latex font-bold text-ink mb-2 tracking-tight">Heterogeneous Degradation Audit</h3>
          <p className="text-sm text-secondary max-w-2xl italic leading-relaxed">
            Visualizing the relative performance drop across compression variants compared to the uncompressed baseline. Structurally distinctive classes remain stable, whereas morphologically ambiguous classes account for the majority of the degradation.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-tertiary">
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-ink" /> Stable</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-accent" /> High Loss</div>
        </div>
      </div>

      <div className="space-y-12">
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="min-w-[800px]">
            {/* Class Labels (Top) */}
            <div className="flex pt-10 mb-0 border-b border-ink/5 pb-2">
              <div className="w-32 shrink-0" /> {/* Spacer */}
              <div className="flex-1 grid grid-cols-8 gap-1">
                {classes.map(c => (
                  <div key={c} className="text-xs font-mono text-tertiary uppercase tracking-tighter text-center rotate-[-45deg] origin-bottom-left h-20 -translate-x-1/2 whitespace-nowrap">
                    {c === "Immature Granulocytes" ? "IG" : c}
                  </div>
                ))}
              </div>
            </div>

            {/* Methods (Rows) */}
            <div className="space-y-1">
              {methods.map(m => (
                <div key={m} className="flex items-center">
                  <div className="w-32 shrink-0 text-xs font-mono font-bold uppercase tracking-widest text-ink">
                    {m}
                  </div>
                  <div className="flex-1 grid grid-cols-8 gap-1">
                    {classes.map(c => {
                      const val = heatmapData[m][c];
                      const baselineVal = heatmapData["Baseline"][c];
                      const delta = m === "Baseline" ? 0 : val - baselineVal;

                      const loss = Math.abs(Math.min(0, delta));
                      const t = Math.min(1, loss / 10);

                      const bgColor = m === "Baseline"
                        ? "var(--color-ink)"
                        : delta >= 0
                          ? "var(--color-ink)"
                          : `color-mix(in srgb, var(--color-accent), var(--color-ink) ${100 - (t * 100)}%)`;

                      return (
                        <motion.div
                          key={c}
                          onHoverStart={() => setHoveredCell({ m, c })}
                          onHoverEnd={() => setHoveredCell(null)}
                          className="aspect-[1.8/1] flex flex-col items-center justify-center relative cursor-crosshair group"
                          style={{
                            backgroundColor: bgColor,
                            opacity: m === "Baseline" ? 1 : 0.8 + (t * 0.2)
                          }}
                          whileHover={{ scale: 1.05, zIndex: 10, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                        >
                          <span className="text-xs font-mono font-bold text-paper">
                            {m === "Baseline" ? val.toFixed(1) : delta === 0 ? "±0.0" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`}
                          </span>
                          {m !== "Baseline" && delta !== 0 && (
                            <span className="text-xs font-mono text-paper/40 uppercase tracking-tighter">
                              vs Base
                            </span>
                          )}
                          {delta < -5 && (
                            <div className="absolute top-1 end-1">
                              <AlertCircle className="w-2 h-2 text-paper" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <AnimatePresence mode="wait">
            {hoveredCell ? (
              <motion.div
                key={`${hoveredCell.m}-${hoveredCell.c}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-8 bg-ink/[0.03] border border-ink/10 rounded-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono uppercase text-tertiary">{hoveredCell.m} Method</span>
                    <h5 className="text-xl font-latex font-bold text-ink leading-none">{hoveredCell.c} Performance</h5>
                  </div>
                  <div className="text-3xl font-latex font-bold text-accent">
                    {heatmapData[hoveredCell.m][hoveredCell.c].toFixed(2)}%
                  </div>
                </div>

                <div className="text-sm text-secondary leading-relaxed latex-prose italic">
                  {hoveredCell.c === "Basophil" && hoveredCell.m === "L0 Surgery"
                    ? "Critical drop observed. The L0 model discarded deep semantic channels in Blocks 4-5 required for resolving fine-grained granule density and nuclear lobe counts."
                    : hoveredCell.c === "IG"
                      ? "Immature Granulocytes consistently exhibit the highest morphological variance, serving as the 'Stress Anchor' for all compression audits."
                      : "Performance remains robust. This class features high visual separability, requiring fewer latent dimensions to maintain diagnostic fidelity."
                  }
                </div>
              </motion.div>
            ) : (
              <div className="p-8 border-2 border-dashed border-ink/5 rounded-sm text-center flex flex-col items-center justify-center min-h-[160px]">
                <Target className="w-8 h-8 text-ink/10 mb-4" />
                <p className="text-xs font-latex italic text-ink/60">Select a matrix cell to view class-specific stability metrics.</p>
              </div>
            )}
          </AnimatePresence>

          <div className="p-8 bg-accent/5 border border-accent/20 rounded-sm h-full flex items-center">
            <div className="flex gap-4 items-start">
              <Layers className="w-5 h-5 text-accent mt-1 shrink-0" />
              <p className="text-sm text-secondary leading-relaxed font-latex">
                <strong className="text-ink">The 85% Guardrail:</strong> No class fell below the predetermined clinical threshold, confirming that even the most aggressive surgery preserved the minimum features required for diagnostic reliability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
