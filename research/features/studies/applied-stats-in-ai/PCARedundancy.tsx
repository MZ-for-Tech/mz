"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, ReferenceLine
} from "recharts";
import { Info, Shrink, ChevronRight, Activity } from "lucide-react";
import { VizToggleGroup } from "@/research/features/studies/applied-stats-in-ai/VizPrimitives";

// --- DATA & TYPES ---

interface PCADataPoint {
  name: string;
  total: number;
  needed: { [key: string]: number };
  color: string;
}

const PCA_DATA: PCADataPoint[] = [
  { 
    name: "Conv Block 3", total: 256, 
    needed: { "90": 28, "95": 41, "99": 85 }, 
    color: "var(--pencil-val)" 
  },
  { 
    name: "Conv Block 4", total: 512, 
    needed: { "90": 80, "95": 122, "99": 210 }, 
    color: "var(--pencil-val)" 
  },
  { 
    name: "Conv Block 5", total: 512, 
    needed: { "90": 35, "95": 59, "99": 140 }, 
    color: "var(--pencil-val)" 
  },
  { 
    name: "FC1 Head", total: 4096, 
    needed: { "90": 180, "95": 285, "99": 650 }, 
    color: "var(--ink-val)" 
  },
  { 
    name: "FC2 Head", total: 4096, 
    needed: { "90": 90, "95": 137, "99": 400 }, 
    color: "var(--accent-val)" 
  },
];

const generateScreeData = (total: number, needed95: number) => {
  return Array.from({ length: 50 }, (_, i) => {
    const x = (i / 49) * total;
    // Cumulative variance curve (log-like)
    const variance = 100 * (1 - Math.exp(-x / (needed95 / 2.5)));
    return { x: Math.round(x), variance: Math.min(100, variance) };
  });
};

export default function PCARedundancy() {
  const [threshold, setThreshold] = useState<"90" | "95" | "99">("95");
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const activeLayerData = useMemo(() => {
    if (!selectedLayer) return null;
    const layer = PCA_DATA.find(d => d.name === selectedLayer);
    if (!layer) return null;
    return generateScreeData(layer.total, layer.needed["95"]);
  }, [selectedLayer]);

  return (
    <div className="w-full bg-paper border border-ink/10 rounded-sm overflow-hidden my-12">
      {/* Header with Selector */}
      <div className="p-8 border-b border-ink/5 bg-ink/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h4 className="text-xl font-latex font-bold text-ink mb-1 tracking-tight">PCA Redundancy Audit</h4>
          <p className="text-sm text-secondary italic latex-prose">
            Quantifying the intrinsic dimensionality of latent activation spaces.
          </p>
        </div>
        
        <VizToggleGroup
          value={threshold}
          onChange={(v) => setThreshold(v as "90" | "95" | "99")}
          options={[
            { value: "90", label: "90% Var" },
            { value: "95", label: "95% Var" },
            { value: "99", label: "99% Var" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[450px]">
        {/* Main Bar Visualization */}
        <div className="lg:col-span-7 p-8 border-e border-ink/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(var(--color-ink) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <div className="space-y-10 relative z-10">
            {PCA_DATA.map((layer) => {
              const neededCount = layer.needed[threshold];
              const percentage = (neededCount / layer.total) * 100;
              const isSelected = selectedLayer === layer.name;

              return (
                <div 
                  key={layer.name} 
                  className={`group cursor-pointer transition-all ${isSelected ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
                  onClick={() => setSelectedLayer(layer.name)}
                >
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xxs font-mono uppercase tracking-widest ${isSelected ? "text-accent font-bold" : "text-ink/60"}`}>
                        {layer.name}
                      </span>
                      {isSelected && <Activity className="w-3 h-3 text-accent animate-pulse" />}
                    </div>
                    <div className="text-xxs font-mono text-ink/60">
                      <span className="text-ink font-bold">{neededCount}</span> / {layer.total} Dim
                    </div>
                  </div>
                  
                  <div className="h-4 bg-ink/5 rounded-full overflow-hidden border border-ink/5 relative">
                    {/* Ghost/Redundant Area (Dashed) */}
                    <div className="absolute inset-0 opacity-10" 
                         style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, var(--color-ink) 5px, var(--color-ink) 6px)' }} />
                    
                    {/* Needed Area */}
                    <motion.div 
                      layout
                      initial={{ width: "100%" }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      className="absolute inset-y-0 start-0 z-10"
                      style={{ backgroundColor: isSelected ? "var(--color-accent)" : layer.color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                    </motion.div>
                  </div>
                  
                  <div className="mt-1 flex justify-between">
                    <span className="text-xxs font-mono text-ink/20 uppercase">Architectural Capacity</span>
                    <span className="text-xxs font-mono text-accent uppercase font-bold">
                      {Math.round(100 - percentage)}% Redundant
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-8 start-8 flex items-center gap-2 text-ink/60">
            <Info className="w-3 h-3" />
            <span className="text-xxs font-mono uppercase tracking-widest">Select a layer to audit variance decay</span>
          </div>
        </div>

        {/* Scree Plot Insight Area */}
        <div className="lg:col-span-5 bg-ink/[0.02] p-8 flex flex-col">
          <AnimatePresence mode="wait">
            {selectedLayer ? (
              <motion.div 
                key={selectedLayer}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <div className="mb-6">
                  <span className="text-xxs font-mono uppercase tracking-widest text-ink/60">Audit Insight</span>
                  <h5 className="text-lg font-latex font-bold text-ink">{selectedLayer} Scree Plot</h5>
                </div>

                <div className="flex-1 h-[200px] w-full border-s border-b border-ink/10 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeLayerData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-ink)" strokeOpacity={0.05} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-paper border border-ink/10 p-2 rounded-sm">
                                <p className="text-xxs font-mono text-ink">
                                  {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}% Var Explained
                                </p>
                                <p className="text-xxs font-mono text-ink/60">{payload[0].payload.x} Components</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="variance" 
                        stroke="var(--color-accent)" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorVar)" 
                        animationDuration={1500}
                      />
                      <ReferenceLine 
                        y={Number(threshold)} 
                        stroke="var(--color-ink)" 
                        strokeDasharray="3 3" 
                        label={{ value: `${threshold}% Target`, position: 'right', fill: 'var(--color-ink)', fontSize: 10, fontFamily: 'var(--font-mono)' }} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute bottom-[-25px] start-0 end-0 flex justify-between text-xxs font-mono text-ink/60 uppercase">
                    <span>1 Dim</span>
                    <span>{PCA_DATA.find(d => d.name === selectedLayer)?.total} Dim</span>
                  </div>
                </div>

                <div className="mt-12 space-y-4">
                  <div className="p-4 bg-paper border border-ink/10 rounded-sm">
                    <p className="text-xs latex-prose italic text-secondary leading-relaxed">
                    &quot;At the {threshold}% threshold, we isolate the intrinsic subspace, revealing that the majority of activations in this layer reflect correlated noise rather than task-specific features.&quot;
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedLayer(null)}
                    className="flex items-center gap-1 text-xxs font-mono uppercase tracking-widest text-ink/60 hover:text-ink transition-colors"
                  >
                    Close Audit <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-ink/5 rounded-sm">
                <Shrink className="w-12 h-12 text-ink/10 mb-4" />
                <p className="text-sm latex-prose italic text-ink/60 max-w-[200px]">
                  Select a layer to visualize the variance decay and identify the representational &apos;elbow&apos;.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
