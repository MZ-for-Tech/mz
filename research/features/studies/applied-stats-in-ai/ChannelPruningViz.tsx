import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Scissors, Box, RefreshCw, Activity, Cpu } from 'lucide-react';
import { cn } from "@/research/lib/utils";
import { VizSlider, VizStat, VizInsight } from "@/research/features/studies/applied-stats-in-ai/VizPrimitives";

const TOTAL_CHANNELS = 512; 

export default function ChannelPruningViz() {
    const [threshold, setThreshold] = useState(35);
    const [isReconstructed, setIsReconstructed] = useState(false);

    // Initial random scores for channels
    const [channelScores] = useState(() =>
        Array.from({ length: TOTAL_CHANNELS }, (_, i) => ({
            id: i,
            score: Math.random() * 100
        }))
    );

    const prunedCount = Math.floor((threshold / 100) * TOTAL_CHANNELS);
    const remainingCount = TOTAL_CHANNELS - prunedCount;

    // Derived lists based on state
    const displayChannels = useMemo(() => {
        if (isReconstructed) {
            return channelScores.filter(c => c.score >= threshold);
        }
        return channelScores;
    }, [isReconstructed, threshold, channelScores]);

    const latency = (231.3 * (1 - (threshold / 100) * 0.781)).toFixed(1);
    const throughput = (1 / (1 - (threshold / 100) * 0.781)).toFixed(2);

    return (
        <div className="w-full py-16 border-y border-ink/5 my-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 px-8">
                <div>
                    <h4 className="text-2xl font-latex font-bold text-ink mb-1 tracking-tight">Pruning Visualization</h4>
                    <p className="text-sm text-secondary italic font-latex opacity-70">
                        Discarding redundant channels physically to unlock hardware throughput.
                    </p>
                </div>
                <button
                    onClick={() => setIsReconstructed(!isReconstructed)}
                    className={cn(
                        "flex items-center gap-3 px-8 py-3 rounded-sm text-xs font-mono uppercase tracking-[0.2em] transition-all",
                        isReconstructed ? 'bg-ink text-paper' : 'bg-accent text-paper'
                    )}
                >
                    {isReconstructed ? <RefreshCw className="w-4 h-4" /> : <Scissors className="w-4 h-4" />}
                    {isReconstructed ? "Restore Dense State" : "Perform Surgery"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-8">
                {/* Channel Grid Container */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-paper border border-ink/10 p-8 rounded-sm relative min-h-[360px] flex items-center justify-center overflow-hidden">
                        {/* Background Architecture Grid */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(var(--color-ink) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                        <LayoutGroup>
                            <motion.div 
                                layout
                                className={cn(
                                    "grid gap-1 relative z-10 transition-all duration-700 ease-in-out",
                                    isReconstructed ? "grid-cols-16 w-1/2" : "grid-cols-32 w-full"
                                )}
                            >
                                <AnimatePresence mode="popLayout">
                                    {displayChannels.map((channel) => {
                                        const isPruned = channel.score < threshold;
                                        return (
                                            <motion.div
                                                layout
                                                key={channel.id}
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ 
                                                    opacity: isPruned ? 0.05 : 1, 
                                                    scale: 1,
                                                    backgroundColor: isPruned ? 'var(--color-ink)' : 'var(--color-accent)'
                                                }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                                                className="aspect-square rounded-[1px]"
                                            />
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        </LayoutGroup>
                    </div>

                    {/* Severity Slider */}
                    <div className="p-8 bg-ink/[0.02] border border-ink/5 rounded-sm">
                        <VizSlider
                            label="Pruning Severity (L0 Penalty)"
                            value={threshold}
                            min={5}
                            max={90}
                            step={1}
                            onChange={setThreshold}
                            minLabel="Diagnostic Conservation"
                            maxLabel="Aggressive Pruning"
                            formatValue={(v) => `${v}%`}
                        />
                    </div>
                </div>

                {/* Metrics Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 bg-paper border border-ink/10 rounded-sm space-y-2">
                        <div className="flex items-center gap-3 mb-4">
                            <Box className="w-4 h-4 text-tertiary" />
                            <span className="text-xxs font-mono uppercase tracking-[0.2em] text-tertiary font-bold">Tensor Shape</span>
                        </div>
                        <div className="font-latex text-3xl font-black text-ink tracking-tighter">
                            [B, <motion.span key={isReconstructed ? remainingCount : TOTAL_CHANNELS} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-accent">{isReconstructed ? remainingCount : TOTAL_CHANNELS}</motion.span>, 14, 14]
                        </div>
                        <div className="text-xxs opacity-40 uppercase tracking-[0.2em] font-mono pt-2 text-tertiary">
                            Batch × Channels × Height × Width
                        </div>
                    </div>

                    <div className="space-y-4">
                        <VizStat
                            label="Inference Latency"
                            value={latency}
                            unit="ms"
                            progress={(1 - (threshold / 100) * 0.781) * 100}
                            topBarVariant="neutral"
                        />

                        <VizStat
                            label="Throughput"
                            value={`${throughput}x`}
                            icon={Cpu}
                            topBarVariant="accent"
                        />
                    </div>

                    <AnimatePresence>
                        {isReconstructed && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <VizInsight title="Surgery Status" icon={Activity} variant="default">
                                    Physical surgery complete. The GPU now skips {prunedCount} indices entirely, yielding genuine wall-clock acceleration via tensor compaction.
                                </VizInsight>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
