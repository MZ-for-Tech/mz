import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, ComposedChart, ReferenceArea, ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle2 } from 'lucide-react';
import { VizSlider, VizPlayControls, VizStat, VizInsight } from '@/research/features/studies/applied-stats-in-ai/VizPrimitives';
import { RESEARCH_CHART_FONT_SIZE } from '@/research/lib/typography';

const RAW_DATA = [
    { epoch: 1, f1: 98.10, sparsity: 21.5 },
    { epoch: 2, f1: 97.89, sparsity: 33.5 },
    { epoch: 3, f1: 98.96, sparsity: 47.9 },
    { epoch: 4, f1: 98.54, sparsity: 61.0 },
    { epoch: 5, f1: 98.42, sparsity: 70.5 },
    { epoch: 6, f1: 98.53, sparsity: 76.4 },
    { epoch: 7, f1: 98.83, sparsity: 79.7 },
    { epoch: 8, f1: 98.60, sparsity: 81.4 },
    { epoch: 9, f1: 98.51, sparsity: 82.1 },
    { epoch: 10, f1: 98.58, sparsity: 82.3 },
    { epoch: 11, f1: 97.07, sparsity: 87.1 },
    { epoch: 12, f1: 96.91, sparsity: 89.0 },
    { epoch: 13, f1: 96.70, sparsity: 90.0 },
    { epoch: 14, f1: 97.94, sparsity: 90.8 },
    { epoch: 15, f1: 97.83, sparsity: 91.4 },
    { epoch: 16, f1: 93.65, sparsity: 91.9 },
    { epoch: 17, f1: 97.79, sparsity: 92.2 },
    { epoch: 18, f1: 97.56, sparsity: 92.4 },
    { epoch: 19, f1: 98.22, sparsity: 92.5 },
    { epoch: 20, f1: 98.19, sparsity: 92.5 },
    { epoch: 21, f1: 91.47, sparsity: 93.7 },
    { epoch: 22, f1: 72.23, sparsity: 94.7 },
];

// Interpolate for all 22 epochs (1-22)
const DATA = Array.from({ length: 23 }, (_, i) => {
    if (i === 0) return { epoch: 0, f1: 98.57, sparsity: 0.0 };
    const existing = RAW_DATA.find(d => d.epoch === i);
    if (existing) return existing;

    const prev = [...RAW_DATA, { epoch: 0, f1: 98.57, sparsity: 0.0 }].filter(d => d.epoch < i).sort((a,b) => b.epoch - a.epoch)[0];
    const next = RAW_DATA.filter(d => d.epoch > i).sort((a,b) => a.epoch - b.epoch)[0];

    if (!prev || !next) return RAW_DATA[0];

    const weight = (i - prev.epoch) / (next.epoch - prev.epoch);
    return {
        epoch: i,
        f1: prev.f1 + weight * (next.f1 - prev.f1),
        sparsity: prev.sparsity + weight * (next.sparsity - prev.sparsity)
    };
});

export default function LassoPhaseTransition() {
    const [epoch, setEpoch] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const progressRef = useRef<number>(0);

    const updateEpoch = (val: number) => {
        const rounded = Math.round(val * 10) / 10;
        setEpoch(rounded);
        progressRef.current = val / 22;
    };

    const animate = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        const duration = 5000; // 5 seconds for full sweep
        progressRef.current += deltaTime / duration;

        if (progressRef.current >= 1) {
            progressRef.current = 1;
            updateEpoch(22);
            stopAnimation();
        } else {
            updateEpoch(progressRef.current * 22);
            animationRef.current = requestAnimationFrame(animate);
        }
    };

    const startAnimation = () => {
        if (progressRef.current >= 1) progressRef.current = 0;
        setIsPlaying(true);
        lastTimeRef.current = 0;
        animationRef.current = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
        setIsPlaying(false);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };

    const togglePlay = () => {
        if (isPlaying) stopAnimation();
        else startAnimation();
    };

    const resetAnimation = () => {
        stopAnimation();
        progressRef.current = 0;
        updateEpoch(0);
    };

    useEffect(() => {
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    const currentData = DATA[Math.round(epoch)] || DATA[DATA.length - 1];
    const activeData = useMemo(() => DATA.slice(0, Math.floor(epoch) + 1), [epoch]);

    return (
        <div className="w-full py-12 border-y border-ink/5 my-12 flex flex-col gap-12 overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 px-8">
                <div>
                    <h4 className="text-2xl font-latex font-bold text-ink mb-1 tracking-tight">Training Dynamics & Phase Transition</h4>
                    <p className="text-sm text-secondary italic font-latex">
                        Tracking the emergence of sparsity under increasing L1 pressure.
                    </p>
                </div>
                <div className="flex gap-4">
                    <VizStat
                        label="Macro F1"
                        value={`${currentData.f1.toFixed(1)}%`}
                        topBarVariant={epoch >= 22 ? "accent" : "neutral"}
                        className="min-w-[140px] text-center"
                    />
                    <VizStat
                        label="Soft Sparsity"
                        value={`${currentData.sparsity.toFixed(1)}%`}
                        topBarVariant="neutral"
                        className="min-w-[140px] text-center"
                    />
                </div>
            </div>

            <div className="px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-12 h-[350px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-ink)" strokeOpacity={0.05} />
                            <XAxis
                                dataKey="epoch"
                                type="number"
                                domain={[0, 22]}
                                tick={{ fontSize: RESEARCH_CHART_FONT_SIZE, fill: "var(--pencil-val)", fontFamily: "var(--font-mono)" }}
                                label={{ value: 'Epochs', position: 'insideBottom', offset: -5, fontSize: RESEARCH_CHART_FONT_SIZE, fill: "var(--tertiary-val)", fontFamily: "var(--font-mono)" }}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: RESEARCH_CHART_FONT_SIZE, fill: "var(--pencil-val)", fontFamily: "var(--font-mono)" }}
                                label={{ value: 'Performance Metric (%)', angle: -90, position: 'insideLeft', fontSize: RESEARCH_CHART_FONT_SIZE, fill: "var(--tertiary-val)", fontFamily: "var(--font-mono)" }}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-paper border border-ink/10 p-4 rounded-sm font-mono text-xs min-w-[140px]">
                                                <p className="font-bold text-ink border-b border-ink/5 pb-2 mb-2 uppercase tracking-widest">Epoch {payload[0].payload.epoch}</p>
                                                <div className="space-y-1">
                                                    <p className="flex justify-between">
                                                        <span className="text-tertiary uppercase">F1 Score:</span>
                                                        <span className="font-bold">{payload[0].payload.f1.toFixed(2)}%</span>
                                                    </p>
                                                    <p className="flex justify-between">
                                                        <span className="text-tertiary uppercase">Sparsity:</span>
                                                        <span className="text-accent font-bold">{payload[0].payload.sparsity.toFixed(1)}%</span>
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />

                            <ReferenceArea
                                x1={22} x2={22}
                                fill="var(--color-accent)"
                                fillOpacity={0.03}
                                stroke="var(--color-accent)"
                                strokeOpacity={0.1}
                                strokeDasharray="3 3"
                            />

                            <Area
                                data={DATA}
                                type="monotone"
                                dataKey="f1"
                                fill="transparent"
                                stroke="var(--ink-val)"
                                strokeWidth={1}
                                strokeOpacity={0.05}
                                strokeDasharray="4 4"
                                isAnimationActive={false}
                            />

                            <Area
                                data={activeData}
                                type="monotone"
                                dataKey="f1"
                                fill="var(--ink-val)"
                                fillOpacity={0.05}
                                stroke="var(--ink-val)"
                                strokeWidth={3}
                                isAnimationActive={false}
                            />

                            <Line
                                data={activeData}
                                type="monotone"
                                dataKey="sparsity"
                                stroke="var(--color-accent)"
                                strokeWidth={2}
                                strokeDasharray="3 3"
                                dot={false}
                                isAnimationActive={false}
                            />

                            <ReferenceLine x={epoch} stroke="var(--ink-val)" strokeWidth={1} strokeDasharray="4 2" />

                            {currentData && (
                                <ReferenceLine
                                    segment={[{ x: epoch, y: 0 }, { x: epoch, y: currentData.f1 }]}
                                    stroke="var(--ink-val)"
                                    strokeOpacity={0.1}
                                />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="space-y-6 px-8">
                <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-ink/[0.02] rounded-sm border border-ink/5 relative overflow-hidden">
                    {isPlaying && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 start-0 w-1/2 h-0.5 bg-accent/20 blur-sm"
                        />
                    )}

                    <VizPlayControls
                        isPlaying={isPlaying}
                        onToggle={togglePlay}
                        onReset={resetAnimation}
                        size="md"
                        className="relative z-10"
                    />

                    <VizSlider
                        label="L1 Penalty Constraint"
                        value={epoch}
                        min={0}
                        max={22}
                        step={0.1}
                        onChange={updateEpoch}
                        formatValue={(v) => `Epoch ${v.toFixed(1)} / 22`}
                        className="flex-1 w-full relative z-10"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="wait">
                        {epoch >= 22 ? (
                            <motion.div
                                key="collapse"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <VizInsight variant="alert" title="Catastrophic Information Loss">
                                    F1-Score collapsed to <strong>72.23%</strong>. Statistical parsimony pressure has eliminated critical discriminative features.
                                </VizInsight>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="stable"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <VizInsight 
                                    title={epoch >= 20 ? "Optimal Sparse Checkpoint" : "Zero-Attraction Phase"} 
                                    icon={epoch >= 20 ? CheckCircle2 : Activity}
                                >
                                    {epoch >= 20
                                        ? "Maximal pre-collapse sparsity (92.5%) achieved while maintaining 98.19% F1."
                                        : "L1 norm is pulling redundant weights toward zero while preserving topological fidelity."}
                                </VizInsight>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <VizStat
                        label="Global Sparsity"
                        value={`${currentData.sparsity.toFixed(1)}%`}
                        progress={currentData.sparsity}
                        topBarVariant="neutral"
                    />
                </div>
            </div>
        </div>
    );
}
