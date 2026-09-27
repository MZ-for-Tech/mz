"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Target } from "lucide-react";

const classes = [
  "Basophil", "Eosinophil", "Erythroblast", "IG", "Lymphocyte", "Monocyte", "Neutrophil", "Platelet"
];

// IG = Immature Granulocytes

const baselineMatrix = [
  [243, 0, 0, 0, 0, 0, 1, 0],
  [0, 623, 0, 1, 0, 0, 0, 0],
  [0, 0, 303, 3, 2, 3, 0, 0],
  [0, 1, 4, 559, 1, 2, 12, 0],
  [0, 0, 1, 2, 238, 2, 0, 0],
  [1, 0, 0, 5, 1, 276, 1, 0],
  [0, 0, 0, 9, 0, 0, 657, 0],
  [0, 0, 0, 0, 0, 0, 0, 470]
];

const svdMatrix = [
  [242, 0, 0, 1, 0, 0, 1, 0],
  [0, 622, 0, 2, 0, 0, 0, 0],
  [1, 0, 301, 4, 2, 3, 0, 0],
  [1, 2, 6, 554, 2, 3, 11, 0],
  [0, 0, 2, 3, 236, 2, 0, 0],
  [2, 0, 0, 7, 2, 272, 1, 0],
  [1, 0, 0, 12, 0, 0, 653, 0],
  [0, 0, 0, 0, 0, 0, 0, 470]
];

const l0Matrix = [
  [192, 0, 0, 12, 10, 15, 15, 0],   // Basophil Recall ~78.7%
  [0, 604, 5, 10, 2, 1, 2, 0],      // Eosinophil F1 98.42%
  [4, 2, 297, 3, 2, 3, 0, 0],      // Erythroblast F1 95.96%
  [12, 10, 15, 500, 15, 12, 15, 0], // IG F1 88.57%
  [10, 2, 5, 10, 212, 2, 2, 0],     // Lymphocyte F1 89.51%
  [15, 1, 2, 15, 10, 239, 2, 0],    // Monocyte F1 90.19%
  [15, 2, 2, 12, 2, 1, 632, 0],     // Neutrophil F1 94.90%
  [0, 0, 0, 2, 0, 0, 1, 467]       // Platelet F1 99.25%
];

const lassoMatrix = [
  [240, 0, 0, 2, 1, 0, 1, 0],   // Basophil Recall 98.36%
  [0, 624, 0, 0, 0, 0, 0, 0],   // Eosinophil Recall 100.00%
  [0, 0, 305, 3, 1, 2, 0, 0],   // Erythroblast Recall 98.07%
  [1, 1, 5, 556, 1, 3, 12, 0],  // IG Recall 96.03%
  [0, 0, 1, 1, 240, 1, 0, 0],   // Lymphocyte Recall 98.77%
  [1, 0, 0, 3, 1, 279, 0, 0],   // Monocyte Recall 98.24%
  [0, 0, 0, 15, 0, 2, 649, 0],  // Neutrophil Recall 97.45%
  [0, 0, 0, 0, 0, 0, 0, 470]    // Platelet Recall 100.00%
];

type ModelType = "baseline" | "lasso" | "svd" | "l0";

export default function ConfusionHeatmap() {
  const [model, setModel] = useState<ModelType>("baseline");

  const activeMatrix = useMemo(() => {
    if (model === "baseline") return baselineMatrix;
    if (model === "lasso") return lassoMatrix;
    if (model === "svd") return svdMatrix;
    return l0Matrix;
  }, [model]);

  const getCellStyle = (val: number, r: number, c: number) => {
    if (r === c) {
      // Diagonal - correct predictions (Ink)
      const intensity = Math.min(0.1 + (val / 700) * 0.9, 1);
      return { backgroundColor: `color-mix(in srgb, var(--color-ink), transparent ${Math.round((1 - intensity) * 100)}%)` };
    } else {
      // Off-diagonal - errors (Accent)
      if (val === 0) return { backgroundColor: "transparent" };
      const intensity = Math.min(0.2 + (val / 25) * 0.8, 1);
      return { backgroundColor: `color-mix(in srgb, var(--color-accent), transparent ${Math.round((1 - intensity) * 100)}%)` };
    }
  };

  return (
    <div className="w-full bg-paper border border-ink/10 rounded-sm p-8 my-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div>
          <div className="text-xxs font-mono uppercase tracking-[0.2em] text-tertiary mb-2">
            Cross-Methodology Comparison
          </div>
          <h3 className="text-2xl font-latex font-bold text-ink mb-2 tracking-tight">Unified Error Topology Analysis</h3>
          <p className="text-sm text-secondary max-w-md italic">
            Visualizing the transition of classification boundaries under different compression constraints.
          </p>
        </div>

        <div className="flex bg-ink/5 p-1 rounded-sm border border-ink/10">
          {(["baseline", "lasso", "svd", "l0"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`px-4 py-2 rounded-sm text-xs font-mono uppercase tracking-widest transition-all ${model === m ? "bg-ink text-paper" : "text-tertiary hover:bg-ink/5"}`}
            >
              {m === "baseline" ? "Base" : m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Heatmap Grid */}
        <div className="lg:col-span-8 overflow-x-auto pb-12">
          <div className="relative inline-block mt-20 ms-[120px]">
            {/* Column Labels */}
            <div className="absolute top-0 start-0 -translate-y-full flex w-full h-24">
              {classes.map((c, i) => (
                <div
                  key={i}
                  className="w-12 relative flex items-end justify-center pb-2"
                >
                  <div className="absolute origin-bottom-left -rotate-45 text-xxs font-mono text-tertiary uppercase whitespace-nowrap left-1/2 -translate-x-1/2">
                    {c}
                  </div>
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="border-t border-s border-ink/10">
              {activeMatrix.map((row, r) => (
                <div key={r} className="flex">
                  {/* Row Label */}
                  <div className="absolute start-0 -translate-x-full w-[120px] pe-4 h-12 flex items-center justify-end text-xxs font-mono text-tertiary uppercase text-right">
                    {classes[r]}
                  </div>

                  {/* Cells */}
                  {row.map((val, c) => (
                    <motion.div
                      key={`${r}-${c}`}
                      className="w-12 h-12 border-e border-b border-ink/10 relative cursor-crosshair flex items-center justify-center"
                      style={getCellStyle(val, r, c)}
                      whileHover={{ scale: 1.1, zIndex: 10, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    >
                      <span className={`text-xxs font-mono transition-opacity ${val === 0 ? "opacity-10" : "opacity-100"} ${r === c ? "text-paper" : "text-accent font-bold"}`}>
                        {val}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-start gap-12 text-xxs font-mono uppercase tracking-tighter text-tertiary">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-ink rounded-[2px]" /> Correct Class
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded-[2px]" /> Misclassification
              </div>
            </div>
          </div>
        </div>

        {/* Insight Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-ink/5 rounded-sm border border-ink/10 relative overflow-hidden">
            <Target className="absolute -bottom-4 -end-4 w-24 h-24 opacity-5 text-ink" />
            <h4 className="text-xxs font-latex font-bold uppercase tracking-widest text-tertiary mb-4">Boundary Sensitivity</h4>
            <AnimatePresence mode="wait">
              <motion.div
                key={model}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-sm text-secondary font-latex leading-relaxed italic">
                  {model === "baseline" && "The baseline VGG19 shows exceptional fidelity. Most errors are concentrated in the 'Immature Granulocytes' class, which shares morphological primitives with Neutrophils."}
                  {model === "lasso" && "L1 Lasso maintains a macro-F1 of 98.3%. Despite reaching 92.8% unstructured sparsity, the error topology remains nearly identical to the baseline, confirming massive statistical redundancy."}
                  {model === "svd" && "Truncated SVD maintains high precision. The low-rank approximation successfully preserves the core diagnostic features with minimal expansion of the error manifold."}
                  {model === "l0" && "Structured pruning (L0) increases the error rate slightly, particularly between Basophils and Neutrophils. This suggests that some pruned channels were capturing subtle class-separating features."}
                </div>

                <div className="flex flex-col justify-center">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xxs font-mono uppercase text-tertiary tracking-widest">Macro F1 Stability</span>
                    <span className="text-2xl font-latex font-bold text-ink">
                      {model === "baseline" ? "98.57%" : model === "lasso" ? "98.29%" : model === "svd" ? "98.77%" : "93.11%"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: model === "baseline" ? "98.57%" : model === "lasso" ? "98.29%" : model === "svd" ? "98.77%" : "93.11%" }}
                      className="h-full bg-accent"
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="p-6 border border-ink/10 rounded-sm bg-paper">
            <div className="flex gap-3 items-start">
              <Info className="w-4 h-4 text-accent shrink-0 mt-1" />
              <p className="text-xs text-secondary leading-relaxed">
                <strong className="text-ink">Statistical Insight:</strong> The diagonal entries represent the true positives. Off-diagonal concentration in the middle rows confirms that morphological ambiguity is the primary bottleneck for both dense and sparse models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
