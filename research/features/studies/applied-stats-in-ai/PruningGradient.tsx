"use client";

import React from "react";
import { motion } from "framer-motion";

const layers = [
  { id: 1, block: "Block 1", survival: 62.5, channels: "40/64", color: "var(--pencil-val)" },
  { id: 2, block: "Block 1", survival: 73.4, channels: "47/64", color: "var(--pencil-val)" },
  { id: 3, block: "Block 2", survival: 75.8, channels: "97/128", color: "var(--pencil-val)" },
  { id: 4, block: "Block 2", survival: 87.5, channels: "112/128", color: "var(--pencil-val)" },
  { id: 5, block: "Block 3", survival: 47.7, channels: "122/256", color: "var(--ink-val)" },
  { id: 6, block: "Block 3", survival: 45.3, channels: "116/256", color: "var(--ink-val)" },
  { id: 7, block: "Block 3", survival: 49.6, channels: "127/256", color: "var(--ink-val)" },
  { id: 8, block: "Block 3", survival: 52.0, channels: "133/256", color: "var(--ink-val)" },
  { id: 9, block: "Block 4", survival: 22.5, channels: "115/512", color: "var(--accent-val)" },
  { id: 10, block: "Block 4", survival: 21.9, channels: "112/512", color: "var(--accent-val)" },
  { id: 11, block: "Block 4", survival: 24.0, channels: "123/512", color: "var(--accent-val)" },
  { id: 12, block: "Block 4", survival: 24.2, channels: "124/512", color: "var(--accent-val)" },
  { id: 13, block: "Block 4", survival: 22.3, channels: "114/512", color: "var(--accent-val)" },
  { id: 14, block: "Block 5", survival: 18.9, channels: "97/512", color: "var(--accent-val)" },
  { id: 15, block: "Block 5", survival: 21.5, channels: "110/512", color: "var(--accent-val)" },
  { id: 16, block: "Block 5", survival: 16.2, channels: "83/512", color: "var(--accent-val)" },
];

export default function PruningGradient() {
  return (
    <div className="w-full bg-paper border border-ink/10 rounded-sm p-8 my-12">
      <div className="mb-10">
        <h4 className="text-xl font-latex font-bold text-ink mb-1">The Survival Gradient</h4>
        <p className="text-sm text-secondary leading-relaxed">
          Visualizing the structural survival of VGG19 channels. Early layers (Blocks 1-2) are preserved for low-level feature extraction, while deep layers are aggressively pruned.
        </p>
      </div>

      <div className="space-y-2 max-w-2xl mx-auto">
        {layers.map((layer, index) => (
          <div key={layer.id} className="flex items-center gap-4 group">
            <div className="w-24 text-xs font-mono text-tertiary uppercase tracking-tighter shrink-0 flex justify-between items-center pe-2 border-e border-ink/5">
              <span>L{layer.id}</span>
              <span className="opacity-40">{layer.block}</span>
            </div>

            <div className="flex-1 h-8 bg-ink/[0.03] rounded-sm relative overflow-hidden flex items-center px-4">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${layer.survival}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-y-0 start-0 bg-ink"
                style={{
                  backgroundColor: layer.color,
                  opacity: 0.1 + (layer.survival / 100) * 0.8
                }}
              />

              <div className="relative z-10 w-full flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-ink/60 group-hover:text-ink transition-colors">
                  {layer.channels}
                </span>
                <span className="text-xs font-mono text-tertiary">
                  {layer.survival.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
