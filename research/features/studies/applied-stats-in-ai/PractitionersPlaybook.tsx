"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Info } from "lucide-react";

interface PlaybookRule {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  recommendation: string;
}

const rules: PlaybookRule[] = [
  {
    id: "01",
    title: "Match Method to Redundancy",
    subtitle: "Strategic Selection",
    content: "Not all redundancy is created equal. Fully-connected layers exhibit high-rank linear redundancy, making them ideal for SVD. Convolutional layers, however, possess spatial filter redundancy that requires structured pruning.",
    recommendation: "Use SVD for dense layers; use L0 for convolutional bases."
  },
  {
    id: "02",
    title: "Avoid Unstructured Fantasy",
    subtitle: "Hardware Reality",
    content: "Unstructured zeros (L1 Lasso) are mathematically elegant but computationally 'ghosts'. Unless you deploy on specialized sparse kernels, standard GPUs will still compute over zeroed entries. Wall-clock time remains unchanged.",
    recommendation: "Treat L1 Lasso as a diagnostic baseline, not a deployment solution."
  },
  {
    id: "03",
    title: "Commit to the Surgery",
    subtitle: "Physical Implementation",
    content: "A masked tensor is not a compressed tensor. To achieve true memory and latency gains, you must perform 'physical surgery'—re-indexing the underlying weights and reducing the physical rank of the storage buffers.",
    recommendation: "Always perform physical rank-reduction post-optimization."
  }
];

export default function PractitionersPlaybook() {
  const [activeId, setActiveId] = useState<string>("01");

  return (
    <div className="w-full bg-paper border border-ink/10 rounded-sm overflow-hidden my-16">
      {/* Header */}
      <div className="p-8 border-b border-ink/5 flex justify-between items-center bg-ink/[0.02]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-ink rounded-sm">
            <BookOpen className="w-6 h-6 text-paper" />
          </div>
          <div>
            <h3 className="text-2xl font-latex font-bold tracking-tight text-ink">The Practitioner&apos;s Playbook</h3>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-secondary">Summary of Research Recommendations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[450px]">
        {/* Navigation / Rules List */}
        <div className="lg:col-span-4 border-e border-ink/10 bg-ink/[0.01]">
          {rules.map((rule) => (
            <button
              key={rule.id}
              onClick={() => setActiveId(rule.id)}
              className={`w-full text-left p-6 transition-all border-b border-ink/5 last:border-b-0 relative group ${activeId === rule.id ? "bg-paper" : "hover:bg-ink/[0.02]"}`}
            >
              {activeId === rule.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute start-0 top-0 bottom-0 w-1 bg-accent"
                />
              )}
              <div className="flex items-start gap-4">
                <span className={`text-xs font-mono font-bold ${activeId === rule.id ? "text-accent" : "text-tertiary"}`}>
                  {rule.id}
                </span>
                <div>
                  <h4 className={`text-sm font-latex font-bold mb-1 ${activeId === rule.id ? "text-ink" : "text-secondary group-hover:text-ink"}`}>
                    {rule.title}
                  </h4>
                  <p className="text-xs font-mono uppercase tracking-widest text-tertiary">
                    {rule.subtitle}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 p-12 bg-paper flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {rules.map((rule) => rule.id === activeId && (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <h2 className="text-4xl font-latex font-bold text-ink tracking-tighter leading-tight">
                    {rule.title}
                  </h2>
                  <p className="text-lg text-secondary font-latex italic leading-relaxed max-w-2xl">
                    {rule.content}
                  </p>
                </div>

                <div className="pt-8 border-t border-ink/5">
                  <div className="flex items-start gap-4 p-6 bg-ink/[0.02] border border-ink/10 rounded-sm">
                    <Info className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <span className="block text-xs font-mono uppercase tracking-[0.2em] text-tertiary mb-2 font-bold">Practical Implementation</span>
                      <p className="text-sm font-latex font-bold text-ink">
                        {rule.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
