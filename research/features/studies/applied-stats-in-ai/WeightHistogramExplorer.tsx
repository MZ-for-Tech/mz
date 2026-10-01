import React, { useState, useMemo } from 'react';
import { 
    XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart, Cell, ReferenceLine, Label
} from 'recharts';
import { Database, Scissors, ZoomIn, Activity, Cpu, HardDrive } from 'lucide-react';
import { VizSlider, VizToggleGroup, VizStat, VizInsight } from "@/research/features/studies/applied-stats-in-ai/VizPrimitives";
import { RESEARCH_CHART_FONT_SIZE } from '@/research/lib/typography';

// --- DATA GENERATION ---
const BINS_FULL = 80;
const STEP_FULL = 1.5 / (BINS_FULL - 1);

const BINS_ZOOM = 40;
const STEP_ZOOM = 0.05 / (BINS_ZOOM - 1);

const generateData = (mode: 'baseline' | 'lasso', zoom: boolean) => {
    const bins = zoom ? BINS_ZOOM : BINS_FULL;
    const step = zoom ? STEP_ZOOM : STEP_FULL;

    return Array.from({ length: bins }, (_, i) => {
        const x = i * step;
        const isZeroBin = i === 0;
        
        let count = 0;
        if (mode === 'baseline') {
            count = 5000000 * Math.exp(-x / 0.15) * (1 + Math.random() * 0.1);
        } else {
            if (isZeroBin) {
                count = 130000000; 
            } else {
                count = 50000 * Math.exp(-x / 0.3) * (1 + Math.random() * 0.2);
            }
        }

        return {
            magnitude: x.toFixed(zoom ? 3 : 2),
            count: Math.max(1, Math.round(count)),
            rawX: x
        };
    });
};

export default function WeightHistogramExplorer() {
    const [mode, setMode] = useState<'baseline' | 'lasso'>('lasso');
    const [scale, setScale] = useState<'linear' | 'log'>('linear');
    const [threshold, setThreshold] = useState(0.015);
    
    const isLasso = mode === 'lasso';

    const fullData = useMemo(() => generateData(mode, false), [mode]);
    const zoomData = useMemo(() => generateData(mode, true), [mode]);

    const stats = useMemo(() => {
        const total = 138000000;
        const zeroBin = isLasso ? 130000000 : 5000000;
        
        // Calculate theoretical sparsity based on threshold
        let sparseCount = zeroBin;
        if (isLasso) {
            sparseCount += (threshold / 0.05) * 5000000;
        }
        
        const sparsity = (Math.min(0.999, sparseCount / total) * 100).toFixed(1);
        const memFootprint = "528 MB";
        return { sparsity, memFootprint };
    }, [isLasso, threshold]);

    return (
        <div className="w-full py-16 border-y border-ink/5 my-12 bg-ink/[0.01]">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 px-8">
                <div>
                    <h4 className="text-2xl font-latex font-bold text-ink mb-1 tracking-tight">
                        Weight Magnitude Audit
                    </h4>
                    <p className="text-sm text-secondary italic font-latex opacity-60">
                        {isLasso ? "Analyzing the post-Lasso zero-attraction topology." : "Analyzing the uncompressed baseline state."}
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-6">
                    <VizToggleGroup
                        value={mode}
                        options={[
                            { value: 'baseline', label: 'Baseline', icon: Database },
                            { value: 'lasso', label: 'L1 Lasso', icon: Activity }
                        ]}
                        onChange={(v) => setMode(v as 'baseline' | 'lasso')}
                    />

                    <VizToggleGroup
                        value={scale}
                        options={[
                            { value: 'linear', label: 'Linear' },
                            { value: 'log', label: 'Log' }
                        ]}
                        onChange={(v) => setScale(v as 'linear' | 'log')}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-8 mb-12">
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-ink/10 pb-2">
                        <span className="text-xs font-bold font-latex text-ink">Full Spectrum Density</span>
                        <span className="text-xs font-mono uppercase text-tertiary tracking-[0.2em]">
                            Magnitude Distribution (|w|)
                        </span>
                    </div>
                    <div className="h-[280px] w-full bg-paper border border-ink/5 rounded-sm p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={fullData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(17,17,17,0.05)" />
                                <XAxis 
                                    dataKey="magnitude" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fontSize: RESEARCH_CHART_FONT_SIZE, fill: 'var(--color-ink)', opacity: 0.4, fontFamily: 'var(--font-mono)' }}
                                    interval={19}
                                />
                                <YAxis 
                                    scale={scale === 'log' ? 'log' : 'auto'}
                                    domain={[scale === 'log' ? 1 : 0, 'auto']}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: RESEARCH_CHART_FONT_SIZE, fill: 'var(--color-ink)', opacity: 0.4, fontFamily: 'var(--font-mono)' }}
                                />
                                <Bar dataKey="count" isAnimationActive={true}>
                                    {fullData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={isLasso ? "var(--color-accent)" : "var(--color-ink)"} 
                                            fillOpacity={entry.rawX === 0 ? 0.8 : 0.2}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-ink/10 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-latex text-ink uppercase">Surgical Threshold Sweep</span>
                            <ZoomIn className="w-3 h-3 text-accent" />
                        </div>
                        <span className="text-xs font-mono text-accent font-bold tracking-widest">ε = {threshold.toFixed(3)}</span>
                    </div>
                    <div className="h-[280px] w-full bg-paper border border-ink/5 rounded-sm p-4 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={zoomData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(17,17,17,0.05)" />
                                <XAxis 
                                    dataKey="magnitude" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fontSize: RESEARCH_CHART_FONT_SIZE, fill: 'var(--color-ink)', opacity: 0.4, fontFamily: 'var(--font-mono)' }}
                                    interval={9}
                                />
                                <YAxis hide />
                                <ReferenceLine x={threshold.toFixed(3)} stroke="var(--color-accent)" strokeWidth={2} strokeDasharray="3 3">
                                    <Label value="PRUNE ZONE" position="left" fill="var(--color-accent)" fontSize={8} fontFamily="var(--font-mono)" offset={10} />
                                </ReferenceLine>
                                <Bar dataKey="count">
                                    {zoomData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-zoom-${index}`} 
                                            fill={entry.rawX <= threshold ? "var(--color-accent)" : "var(--color-ink)"}
                                            fillOpacity={entry.rawX <= threshold ? 0.6 : 0.1}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        
                        <div className="absolute bottom-4 start-10 end-10">
                             <VizSlider
                                label="Threshold (ε)"
                                value={threshold}
                                min={0}
                                max={0.05}
                                step={0.001}
                                onChange={setThreshold}
                                minLabel="Zero"
                                maxLabel="Effective Weight"
                                hideValue
                             />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <VizStat
                    label="Theoretical Sparsity"
                    value={`${stats.sparsity}%`}
                    icon={Scissors}
                    topBarVariant="accent"
                    description="Parameters that can be numerically zeroed without significant loss impact."
                />

                <VizStat
                    label="Memory Occupancy"
                    value={stats.memFootprint}
                    icon={HardDrive}
                    topBarVariant="neutral"
                    description="Static occupancy despite numerical sparsity—demonstrating the Hardware Paradox."
                />

                <VizInsight title="Inference Profile" icon={Cpu}>
                    <div className="space-y-4">
                        <div>
                            <div className="text-lg font-latex font-bold text-ink/60 italic">0.0x (No Speedup)</div>
                        </div>
                        <p className="text-xs text-secondary leading-relaxed italic border-t border-ink/5 pt-4">
                            Unstructured sparsity does not bypass SIMD multipliers. The tensor must undergo <strong>structural surgery</strong> to gain latency benefits.
                        </p>
                    </div>
                </VizInsight>
            </div>
        </div>
    );
}
