"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Info, Image as ImageIcon, BarChart3 } from "lucide-react";

const classData = [
  { name: "Basophil", count: 1218, color: "#5e756b", image: "/images/studies/applied-stats-in-ai/classes/basophil.webp", description: "Leukocytes characterized by large, dark-staining granules that often obscure the nucleus. Key in inflammatory responses." },
  { name: "Eosinophil", count: 3117, color: "#8b5e5e", image: "/images/studies/applied-stats-in-ai/classes/eosinophil.webp", description: "Distinguished by large, orange-red cytoplasmic granules and typically a bi-lobed nucleus. Associated with parasitic infections." },
  { name: "Erythroblast", count: 1551, color: "#6b5e75", image: "/images/studies/applied-stats-in-ai/classes/erythroblast.webp", description: "Nucleated red blood cell precursors. Their presence in peripheral blood can indicate high erythropoietic activity or pathology." },
  { name: "Immature Granulocytes", count: 2895, color: "#756b5e", image: "/images/studies/applied-stats-in-ai/classes/imgran.webp", description: "Developmental stages of white cells. Morphologically ambiguous and the primary source of classification variance in compressed models." },
  { name: "Lymphocyte", count: 1214, color: "#5e6b75", image: "/images/studies/applied-stats-in-ai/classes/lymphocyte.webp", description: "Small cells with a large, dark nucleus and minimal cytoplasm. Central to the adaptive immune system." },
  { name: "Monocyte", count: 1420, color: "#8b7e5e", image: "/images/studies/applied-stats-in-ai/classes/monocyte.webp", description: "The largest type of white blood cell, featuring a bean-shaped nucleus. Precursors to macrophages." },
  { name: "Neutrophil", count: 3329, color: "#5e5e5e", image: "/images/studies/applied-stats-in-ai/classes/neutrophil.webp", description: "The most abundant leukocyte, characterized by a multi-lobed nucleus. The primary responders to bacterial infection." },
  { name: "Platelet", count: 2348, color: "#8b3a2b", image: "/images/studies/applied-stats-in-ai/classes/platylet.webp", description: "Small, irregularly shaped cell fragments. Essential for hemostasis and blood clotting." }
].sort((a, b) => b.count - a.count);

export default function BloodMNISTExplorer() {
  const [activeTab, setActiveTab] = useState<"distribution" | "morphology">("distribution");
  const [selectedClass, setSelectedClass] = useState(classData[0]);

  return (
    <div className="w-full bg-paper border border-ink/10 rounded-sm overflow-hidden  my-8">
      <div className="p-6 border-b border-ink/5 flex justify-between items-center bg-ink/[0.02]">
        <div>
          <h3 className="text-xl font-latex font-bold text-ink tracking-tight">Hematological Dataset Exploration</h3>
          <p className="text-xxs text-tertiary font-mono uppercase tracking-widest mt-1">Dataset N = 17,092 Samples</p>
        </div>
        <div className="flex bg-paper border border-ink/10 rounded-sm p-1">
          <button
            onClick={() => setActiveTab("distribution")}
            className={`px-4 py-2 rounded-sm text-xs font-mono transition-all flex items-center gap-2 ${activeTab === "distribution" ? "bg-ink text-paper" : "text-secondary hover:bg-ink/5"}`}
          >
            <BarChart3 className="w-3 h-3" /> Distribution
          </button>
          <button
            onClick={() => setActiveTab("morphology")}
            className={`px-4 py-2 rounded-sm text-xs font-mono transition-all flex items-center gap-2 ${activeTab === "morphology" ? "bg-ink text-paper" : "text-secondary hover:bg-ink/5"}`}
          >
            <ImageIcon className="w-3 h-3" /> Morphology
          </button>
        </div>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {activeTab === "distribution" ? (
            <motion.div
              key="dist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-8 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-ink)" strokeOpacity={0.05} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 10, fill: "var(--pencil-val)", fontFamily: "var(--font-mono)" }}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "var(--pencil-val)", fontFamily: "var(--font-mono)" }} />
                    <Tooltip
                      cursor={{ fill: 'var(--color-ink)', fillOpacity: 0.03 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-paper border border-ink/10 p-3 rounded-sm  font-mono text-xxs">
                              <p className="font-bold text-ink mb-1">{payload[0].payload.name}</p>
                              <p className="text-accent">Count: {payload[0].value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                      {classData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 bg-ink/5 rounded-sm border border-ink/10">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-tertiary mb-4">Statistical Bias Note</h4>
                  <p className="text-sm text-secondary italic leading-relaxed latex-prose">
                    &quot;The moderate class imbalance observed here necessitates the use of Macro-averaged F1 metrics. Accuracy alone would be biased toward the majority classes (Neutrophils and Eosinophils).&quot;
                  </p>
                </div>
                <div className="p-6 bg-accent/5 rounded-sm border border-accent/10">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-accent mb-4">Intensity Profile</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-1 bg-semantic-error/20 rounded-full overflow-hidden">
                        <div className="h-full bg-semantic-error w-[78%]" />
                      </div>
                      <div className="h-1 bg-semantic-success/20 rounded-full overflow-hidden">
                        <div className="h-full bg-semantic-success w-[62%]" />
                      </div>
                      <div className="h-1 bg-blue-400/20 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 w-[85%]" />
                      </div>
                    </div>
                    <span className="text-xxs font-mono text-tertiary uppercase vertical-rl">RGB Mean</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="morph"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {classData.map((cls) => (
                  <button
                    key={cls.name}
                    onClick={() => setSelectedClass(cls)}
                    className={`p-4 rounded-sm border text-left transition-all ${selectedClass.name === cls.name ? "bg-ink text-paper border-ink" : "bg-paper border-ink/10 text-ink hover:border-accent"}`}
                  >
                    <div className="text-xs font-mono font-bold mb-1 truncate">{cls.name}</div>
                    <div className={`text-xxs ${selectedClass.name === cls.name ? "text-paper/60" : "text-tertiary"}`}>
                      {cls.count} samples
                    </div>
                  </button>
                ))}
              </div>
              <div className="lg:col-span-7">
                <div className="bg-ink/5 rounded-sm p-8 h-full border border-ink/10 relative overflow-hidden group">


                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedClass.color }} />
                      <h4 className="text-2xl font-latex font-bold text-ink">{selectedClass.name}</h4>
                    </div>

                    <div className="aspect-square w-full max-w-[280px] mx-auto bg-paper border border-ink/10 rounded-sm mb-6 overflow-hidden flex items-center justify-center relative ">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={selectedClass.image}
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4 }}
                          src={selectedClass.image}
                          alt={selectedClass.name}
                          className="w-full h-full object-cover"
                        />
                      </AnimatePresence>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-2 items-start text-sm text-secondary leading-relaxed latex-prose">
                        <Info className="w-4 h-4 mt-1 text-accent shrink-0" />
                        <span>{selectedClass.description}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-8 py-4 bg-ink/[0.02] border-t border-ink/5 flex justify-between text-xxs font-mono text-tertiary uppercase tracking-widest">
        <span>Dataset: BloodMNIST-224</span>
        <span>Task: 8-Class Classification</span>
        <span>Sparsity Context: Baseline Analysis</span>
      </div>
    </div>
  );
}
