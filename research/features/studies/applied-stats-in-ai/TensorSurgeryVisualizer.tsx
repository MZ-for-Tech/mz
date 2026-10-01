"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Box, Activity, RotateCcw } from "lucide-react";
import { cn } from "@/research/lib/utils";

const TOTAL_CHANNELS = 192; // More dense grid for better visual impact
const SURVIVING_COUNT = 48; // ~25% survival

export default function TensorSurgeryVisualizer() {
    const [stage, setStage] = useState<"baseline" | "pruned" | "compact">("baseline");
    const [isProcessing, setIsProcessing] = useState(false);

    const performSurgery = () => {
        if (stage === "baseline") {
            setStage("pruned");
        } else if (stage === "pruned") {
            setIsProcessing(true);
            setTimeout(() => {
                setStage("compact");
                setIsProcessing(false);
            }, 1200);
        }
    };

    const reset = () => {
        setStage("baseline");
    };

    return (
        <div className="w-full py-16 border-y border-ink/5 my-12 bg-ink/[0.01] rounded-sm">
            <div className="mb-12 px-8 flex justify-between items-end">
                <div>
                    <h4 className="text-2xl font-latex font-bold text-ink mb-2 tracking-tight">Structured Tensor Surgery</h4>
                    <p className="text-sm text-secondary italic font-latex max-w-2xl opacity-70">
                        Discarding redundant channels physically to unlock hardware throughput.
                    </p>
                </div>

                {stage !== "baseline" && (
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest text-tertiary hover:text-ink transition-colors"
                    >
                        <RotateCcw className="w-3 h-3" /> Reset Tensor
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-8">
                {/* The Tensor Lab */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="relative aspect-[16/9] bg-paper border border-ink/10 rounded-sm  overflow-hidden flex items-center justify-center p-8">
                        {/* Background Grid Lines */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                        <div className={cn(
                            "grid gap-1.5 transition-all duration-1000 ease-in-out",
                            stage === "compact" ? "grid-cols-12 w-1/2" : "grid-cols-24 w-full"
                        )}>
                            {Array.from({ length: TOTAL_CHANNELS }).map((_, i) => {
                                const isDead = i >= SURVIVING_COUNT;
                                const isHidden = stage === "compact" && isDead;

                                if (isHidden) return null;

                                return (
                                    <motion.div
                                        key={i}
                                        layout
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{
                                            opacity: stage === "pruned" && isDead ? 0.05 : 1,
                                            scale: 1,
                                            backgroundColor: stage === "baseline" ? "var(--color-ink)" : (isDead ? "var(--color-ink)" : "var(--color-accent)")
                                        }}
                                        className="aspect-square rounded-[1px] "
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                            delay: stage === "baseline" ? i * 0.002 : 0
                                        }}
                                    />
                                );
                            })}
                        </div>

                        <AnimatePresence>
                            {isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-paper/60 flex flex-col items-center justify-center z-50"
                                >
                                    <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                                    <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold">Reshaping Tensors...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Stage Description */}
                    <div className="p-6 bg-ink/[0.03] rounded-sm border border-ink/5">
                        <p className="text-sm font-latex italic text-secondary leading-relaxed">
                            {stage === "baseline" && "Initial State: VGG19 Conv-Layer with 192 dense channels. Every channel is physically present and calculated."}
                            {stage === "pruned" && "Ghost Sparsity: 75% of channels have been zeroed by the L0 penalty, but the tensor shape remains [B, 192, H, W]. No speed gain yet."}
                            {stage === "compact" && "Physical Compactness: Surgery has removed the dead indices. The tensor is physically reshaped to [B, 48, H, W], effectively 4x faster."}
                        </p>
                    </div>
                </div>

                {/* The Operating Room Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 bg-paper border border-ink/10 rounded-sm  space-y-8 relative overflow-hidden">
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-tertiary">
                                    <Box className="w-4 h-4" />
                                    <span className="text-xs font-mono uppercase tracking-widest">Tensor Shape</span>
                                </div>
                                <div className="text-3xl font-latex font-black text-ink tracking-tighter">
                                    [B, <motion.span key={stage} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={cn(stage === "compact" ? "text-accent" : "text-ink")}>
                                        {stage === "compact" ? SURVIVING_COUNT : TOTAL_CHANNELS}
                                    </motion.span>, 14, 14]
                                </div>
                                <span className="text-xs font-mono text-tertiary uppercase mt-1 block">Batch × Channels × Height × Width</span>
                            </div>

                            <div className="pt-6 border-t border-ink/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-tertiary">
                                        <Activity className="w-4 h-4" />
                                        <span className="text-xs font-mono uppercase tracking-widest">Throughput</span>
                                    </div>
                                    <motion.span
                                        key={stage}
                                        animate={{ scale: stage === "compact" ? 1.1 : 1 }}
                                        className={cn("text-xl font-latex font-bold", stage === "compact" ? "text-accent" : "text-ink")}
                                    >
                                        {stage === "compact" ? "4.00x" : "1.00x"}
                                    </motion.span>
                                </div>
                                <div className="w-full h-1.5 bg-ink/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: "25%" }}
                                        animate={{ width: stage === "compact" ? "100%" : "25%" }}
                                        className="h-full bg-accent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <button
                                disabled={isProcessing || stage === "compact"}
                                onClick={performSurgery}
                                className={cn(
                                    "w-full py-4 rounded-sm flex items-center justify-center gap-3 transition-all duration-500 font-mono text-xs uppercase tracking-[0.2em] font-black group",
                                    stage === "compact" ? "bg-ink/[0.03] text-tertiary cursor-not-allowed" : "bg-accent text-paper hover:bg-accent/90"
                                )}
                            >
                                {stage === "baseline" && "Analyze Sparsity"}
                                {stage === "pruned" && (
                                    <>
                                        <Scissors className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                        Perform Surgery
                                    </>
                                )}
                                {stage === "compact" && "Surgery Complete"}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 border border-accent/10 bg-accent/[0.02] rounded-sm">
                        <span className="block text-xs font-mono uppercase text-accent mb-2 tracking-[0.2em] font-bold">Hardware Paradox</span>
                        <p className="text-xs font-latex text-secondary leading-relaxed italic opacity-80">
                            Without physical rearrangement, zeroed weights still consume memory bandwidth. Physical surgery is the only path to real-world latency reduction.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
