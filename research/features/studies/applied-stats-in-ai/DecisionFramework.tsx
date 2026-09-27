"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Database, Target, CheckCircle2, RotateCcw } from "lucide-react";

type Step = "constraint" | "accuracy" | "result";

export default function DecisionFramework() {
  const [step, setStep] = useState<Step>("constraint");
  const [constraint, setConstraint] = useState<"speed" | "size" | null>(null);
  const [tolerance, setTolerance] = useState<"strict" | "tolerant" | null>(null);

  const reset = () => {
    setStep("constraint");
    setConstraint(null);
    setTolerance(null);
  };

  const getRecommendation = () => {
    if (constraint === "speed" && tolerance === "strict") return {
      name: "Truncated SVD",
      tag: "RANK_REDUCTION",
      desc: "Optimal for maintaining maximum fidelity while reducing rank in dense layers. Best for server-side acceleration where precision is non-negotiable.",
      metrics: { f1: "98.77%", delta: "+0.20%", latency: "-12%" }
    };
    if (constraint === "speed" && tolerance === "tolerant") return {
      name: "L0 Gaussian Gating",
      tag: "STRUCTURAL_SURGERY",
      desc: "Physically removes convolutional channels to achieve massive wall-clock speedups. Ideal for real-time mobile and edge diagnostics.",
      metrics: { f1: "93.11%", delta: "-5.46%", latency: "-58%" }
    };
    if (constraint === "size" && tolerance === "strict") return {
      name: "SVD + L1 Hybrid",
      tag: "SOFT_SPARSITY",
      desc: "Combines rank reduction with soft sparsity. Maintains core signal while zeroing out noise. Best for storage-constrained high-precision environments.",
      metrics: { f1: "98.02%", delta: "-0.28%", latency: "-8%" }
    };
    return {
      name: "L1 Lasso Pruning",
      tag: "UNSTRUCTURED_MASK",
      desc: "Maximum parameter reduction. Best for minimizing binary size for edge deployment, provided sparse kernel support (e.g., XNNPACK) is available.",
      metrics: { f1: "98.29%", delta: "-0.29%", latency: "0%" }
    };
  };

  return (
    <div className="w-full bg-paper border border-ink/10 rounded-sm p-12 my-12 relative overflow-hidden">
      {/* Progress Background */}
      <div className="absolute top-0 start-0 w-full h-1 bg-ink/5">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: step === "constraint" ? "33%" : step === "accuracy" ? "66%" : "100%" }}
        />
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-accent" />
          <span className="text-xxs font-mono uppercase tracking-[0.3em] text-tertiary">Deployment Decision Matrix</span>
        </div>
        <h3 className="text-3xl font-latex font-bold text-ink mb-2">The Deployment Framework</h3>
        <p className="text-sm text-secondary italic font-latex max-w-xl">
          A statistically-driven matrix for selecting the optimal compression strategy based on clinical and hardware constraints.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === "constraint" && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div>
              <span className="text-xxs font-mono uppercase text-accent font-bold tracking-widest mb-1 block">Step 01</span>
              <h4 className="text-xl font-latex font-bold text-ink">Primary Constraint Analysis</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => { setConstraint("speed"); setStep("accuracy"); }}
                className="p-8 bg-paper border border-ink/10 rounded-sm hover:border-accent transition-all text-left group relative"
              >
                <div className="absolute top-4 end-4 text-ink/5 font-mono text-4xl font-bold group-hover:text-accent/10 transition-colors">01</div>
                <Zap className="w-8 h-8 text-accent mb-6 group- transition-transform duration-500" />
                <div className="font-latex font-bold text-xl text-ink mb-2">Inference Speed</div>
                <p className="text-xs text-secondary leading-relaxed font-latex">
                  Prioritize wall-clock acceleration for real-time diagnostic queues and high-throughput clinical workflows.
                </p>
              </button>

              <button
                onClick={() => { setConstraint("size"); setStep("accuracy"); }}
                className="p-8 bg-paper border border-ink/10 rounded-sm hover:border-accent transition-all text-left group relative"
              >
                <div className="absolute top-4 end-4 text-ink/5 font-mono text-4xl font-bold group-hover:text-accent/10 transition-colors">02</div>
                <Database className="w-8 h-8 text-accent mb-6 group- transition-transform duration-500" />
                <div className="font-latex font-bold text-xl text-ink mb-2">Storage Footprint</div>
                <p className="text-xs text-secondary leading-relaxed font-latex">
                  Minimize binary size and RAM requirements for edge deployment on low-power medical devices.
                </p>
              </button>
            </div>
          </motion.div>
        )}

        {step === "accuracy" && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xxs font-mono uppercase text-accent font-bold tracking-widest mb-1 block">Step 02</span>
                <h4 className="text-xl font-latex font-bold text-ink">Fidelity Tolerance Threshold</h4>
              </div>
              <button onClick={() => setStep("constraint")} className="text-xxs font-mono text-tertiary hover:text-accent transition-colors uppercase tracking-widest border-b border-ink/10 pb-0.5">← Previous</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => { setTolerance("strict"); setStep("result"); }}
                className="p-8 bg-paper border border-ink/10 rounded-sm hover:border-accent transition-all text-left group"
              >
                <Target className="w-8 h-8 text-accent mb-6 group- transition-transform duration-500" />
                <div className="font-latex font-bold text-xl text-ink mb-2">Strict Fidelity</div>
                <p className="text-xs text-secondary leading-relaxed font-latex">
                  Classification performance must remain at or above the original VGG19 baseline (Macro F1 98.57%).
                </p>
              </button>

              <button
                onClick={() => { setTolerance("tolerant"); setStep("result"); }}
                className="p-8 bg-paper border border-ink/10 rounded-sm hover:border-accent transition-all text-left group"
              >
                <CheckCircle2 className="w-8 h-8 text-accent mb-6 group- transition-transform duration-500" />
                <div className="font-latex font-bold text-xl text-ink mb-2">Adaptive Margin</div>
                <p className="text-xs text-secondary leading-relaxed font-latex">
                  Allowing for a marginal diagnostic penalty (up to 5%) in exchange for aggressive structural compression.
                </p>
              </button>
            </div>
          </motion.div>
        )}

        {step === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="p-10 bg-paper border border-ink/10 rounded-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-[1px] bg-accent" />
                <span className="text-xxs font-mono uppercase tracking-[0.3em] text-tertiary font-bold">Recommended Methodology Identified</span>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-12 items-start relative z-10">
                <div className="flex-1 space-y-6">
                  <div>
                    <span className="text-xxs font-mono text-accent font-bold uppercase tracking-widest px-2 py-1 bg-accent/5 border border-accent/10 rounded-xs mb-3 inline-block">
                      {getRecommendation().tag}
                    </span>
                    <h2 className="text-5xl font-latex font-bold text-ink tracking-tighter leading-none">
                      {getRecommendation().name}
                    </h2>
                  </div>
                  <p className="text-lg text-secondary font-latex italic leading-relaxed max-w-md">
                    &quot;{getRecommendation().desc}&quot;
                  </p>
                </div>

                <div className="w-full md:w-64 space-y-4">
                  <div className="p-6 bg-ink/[0.02] border border-ink/10 rounded-sm space-y-6">
                    <div>
                      <span className="block text-xxs font-mono text-tertiary uppercase tracking-widest mb-2">Empirical Stability</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-latex font-bold text-ink">{getRecommendation().metrics.f1}</span>
                        <span className="text-xxs font-mono text-semantic-success">{getRecommendation().metrics.delta}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-xxs font-mono text-tertiary uppercase tracking-widest mb-2">Throughput Variance</span>
                      <span className="text-2xl font-latex font-bold text-accent">{getRecommendation().metrics.latency}</span>
                    </div>
                  </div>

                  <button
                    onClick={reset}
                    className="w-full py-4 bg-ink/5 hover:bg-ink/10 border border-ink/10 text-xxs font-mono uppercase tracking-widest text-ink transition-all flex items-center justify-center gap-2 rounded-sm"
                  >
                    <RotateCcw className="w-3 h-3" /> Re-evaluate
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
