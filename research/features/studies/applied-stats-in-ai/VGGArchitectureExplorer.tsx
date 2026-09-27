import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Layers, Cpu, Database, Activity, Target } from 'lucide-react';
import { VizStat, VizInsight } from "@/research/features/studies/applied-stats-in-ai/VizPrimitives";

interface LayerInfo {
    name: string;
    type: 'conv' | 'pool' | 'fc';
    params: number;
    shape: string;
    kernel?: string;
    description: string;
}

const VGG19_LAYERS: LayerInfo[] = [
    { name: "Conv1-1", type: 'conv', params: 1792, shape: "224x224x64", kernel: "3x3", description: "Initial edge detection and low-level feature extraction." },
    { name: "Conv1-2", type: 'conv', params: 36928, shape: "224x224x64", kernel: "3x3", description: "Spatial feature consolidation." },
    { name: "Pool1", type: 'pool', params: 0, shape: "112x112x64", description: "Max pooling (2x2, stride 2)." },
    { name: "Conv2-1", type: 'conv', params: 73856, shape: "112x112x128", kernel: "3x3", description: "Mid-level feature extraction." },
    { name: "Conv2-2", type: 'conv', params: 147584, shape: "112x112x128", kernel: "3x3", description: "Increasing receptive field." },
    { name: "Pool2", type: 'pool', params: 0, shape: "56x56x128", description: "Max pooling." },
    { name: "Conv3-1", type: 'conv', params: 295168, shape: "56x56x256", kernel: "3x3", description: "First block layer with increased depth." },
    { name: "Conv3-2", type: 'conv', params: 590080, shape: "56x56x256", kernel: "3x3", description: "Deep convolutional block." },
    { name: "Conv3-3", type: 'conv', params: 590080, shape: "56x56x256", kernel: "3x3", description: "Deep convolutional block." },
    { name: "Conv3-4", type: 'conv', params: 590080, shape: "56x56x256", kernel: "3x3", description: "Deep convolutional block." },
    { name: "Pool3", type: 'pool', params: 0, shape: "28x28x256", description: "Max pooling." },
    { name: "Conv4-1", type: 'conv', params: 1180160, shape: "28x28x512", kernel: "3x3", description: "Semantic feature extraction." },
    { name: "Conv4-2", type: 'conv', params: 2359808, shape: "28x28x512", kernel: "3x3", description: "High-level block." },
    { name: "Conv4-3", type: 'conv', params: 2359808, shape: "28x28x512", kernel: "3x3", description: "High-level block." },
    { name: "Conv4-4", type: 'conv', params: 2359808, shape: "28x28x512", kernel: "3x3", description: "High-level block." },
    { name: "Pool4", type: 'pool', params: 0, shape: "14x14x512", description: "Max pooling." },
    { name: "Conv5-1", type: 'conv', params: 2359808, shape: "14x14x512", kernel: "3x3", description: "Final convolutional feature maps." },
    { name: "Conv5-2", type: 'conv', params: 2359808, shape: "14x14x512", kernel: "3x3", description: "Final convolutional feature maps." },
    { name: "Conv5-3", type: 'conv', params: 2359808, shape: "14x14x512", kernel: "3x3", description: "Final convolutional feature maps." },
    { name: "Conv5-4", type: 'conv', params: 2359808, shape: "14x14x512", kernel: "3x3", description: "Final convolutional feature maps." },
    { name: "Pool5", type: 'pool', params: 0, shape: "7x7x512", description: "Global pooling before flatten." },
    { name: "FC1", type: 'fc', params: 102764544, shape: "4096", description: "The parameter bottleneck. Fully connected mapping from features to concepts." },
    { name: "FC2", type: 'fc', params: 16781312, shape: "4096", description: "Concept refinement and abstraction." },
    { name: "FC3", type: 'fc', params: 32776, shape: "8 (BloodMNIST)", description: "Output logits for 8 diagnostic classes." },
];

interface VGGBlock {
    id: string;
    name: string;
    spatial: number;
    channels: number;
    layers: LayerInfo[];
    type: 'conv' | 'fc';
    color: string;
    insight: string;
}

const VGG_BLOCKS: VGGBlock[] = [
    {
        id: 'b1', name: 'Block 1', spatial: 224, channels: 64, type: 'conv', color: '#5e756b', // Muted Sage
        layers: VGG19_LAYERS.slice(0, 3),
        insight: "Extracts primary visual primitives: edges, color gradients, and textures."
    },
    {
        id: 'b2', name: 'Block 2', spatial: 112, channels: 128, type: 'conv', color: '#5e6b75', // Muted Steel Blue
        layers: VGG19_LAYERS.slice(3, 6),
        insight: "Combines primitives into basic shapes and patterns."
    },
    {
        id: 'b3', name: 'Block 3', spatial: 56, channels: 256, type: 'conv', color: '#6b5e75', // Muted Slate Purple
        layers: VGG19_LAYERS.slice(6, 11),
        insight: "Mid-level part detection (e.g., cell membranes, nuclei boundaries)."
    },
    {
        id: 'b4', name: 'Block 4', spatial: 28, channels: 512, type: 'conv', color: '#756b5e', // Muted Sandstone
        layers: VGG19_LAYERS.slice(11, 16),
        insight: "Complex semantic structures and spatial hierarchies."
    },
    {
        id: 'b5', name: 'Block 5', spatial: 14, channels: 512, type: 'conv', color: '#8b5e5e', // Muted Terracotta
        layers: VGG19_LAYERS.slice(16, 21),
        insight: "Final abstract feature maps before global reasoning."
    },
    {
        id: 'fc', name: 'FC Head', spatial: 7, channels: 4096, type: 'fc', color: '#8b3a2b', // Accent Crimson
        layers: VGG19_LAYERS.slice(21),
        insight: "High-level diagnostic classification based on full semantic field."
    }
];

const iso = (px: number, py: number, pz: number, ox: number, oy: number) => ({
    x: ox + (px - pz) * Math.cos(Math.PI / 6),
    y: oy + (px + pz) * Math.sin(Math.PI / 6) - py
});

const TunnelConnector = ({ x1, y1, s1, d1, x2, y2, s2, color }: {
    x1: number, y1: number, s1: number, d1: number, x2: number, y2: number, s2: number, color: string
}) => {
    const p5_A = iso(0, 0, d1, x1, y1);
    const p6_A = iso(s1, 0, d1, x1, y1);
    const p7_A = iso(s1, s1, d1, x1, y1);
    const p8_A = iso(0, s1, d1, x1, y1);

    const p1_B = iso(0, 0, 0, x2, y2);
    const p2_B = iso(s2, 0, 0, x2, y2);
    const p3_B = iso(s2, s2, 0, x2, y2);
    const p4_B = iso(0, s2, 0, x2, y2);

    return (
        <g className="opacity-20 pointer-events-none">
            <path d={`M ${p8_A.x} ${p8_A.y} L ${p7_A.x} ${p7_A.y} L ${p3_B.x} ${p3_B.y} L ${p4_B.x} ${p4_B.y} Z`} fill={color} />
            <path d={`M ${p6_A.x} ${p6_A.y} L ${p7_A.x} ${p7_A.y} L ${p3_B.x} ${p3_B.y} L ${p2_B.x} ${p2_B.y} Z`} fill={color} filter="brightness(0.8)" />
            <path d={`M ${p5_A.x} ${p5_A.y} L ${p6_A.x} ${p6_A.y} L ${p2_B.x} ${p2_B.y} L ${p1_B.x} ${p1_B.y} Z`} fill={color} filter="brightness(0.6)" />
        </g>
    );
};

const IsometricBlock = ({ x, y, size, depth, color, isHovered, isSelected, onHover, onClick, numSlices }: {
    x: number, y: number, size: number, depth: number, color: string, isHovered: boolean, isSelected: boolean, onHover: (h: boolean) => void, onClick: () => void, numSlices: number
}) => {
    const s = size;
    const sliceDepth = depth / numSlices;
    const gap = 1.5;

    return (
        <motion.g
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            onClick={onClick}
            className="cursor-pointer"
        >
            {Array.from({ length: numSlices }).map((_, i) => {
                const zOffset = i * (sliceDepth + gap);
                const ox = x;
                const oy = y + zOffset * 0.5;

                const p1 = iso(0, 0, 0, ox, oy);
                const p2 = iso(s, 0, 0, ox, oy);
                const p3 = iso(s, s, 0, ox, oy);
                const p4 = iso(0, s, 0, ox, oy);


                const p6 = iso(s, 0, sliceDepth, ox, oy);
                const p7 = iso(s, s, sliceDepth, ox, oy);
                const p8 = iso(0, s, sliceDepth, ox, oy);

                return (
                    <motion.g
                        key={i}
                        initial={false}
                        animate={{
                            y: (isHovered || isSelected) ? -i * 3 : 0,
                            opacity: (isHovered || isSelected) ? 1 : 0.85
                        }}
                    >
                        <path d={`M ${p2.x} ${p2.y} L ${p6.x} ${p6.y} L ${p7.x} ${p7.y} L ${p3.x} ${p3.y} Z`} fill={color} filter="brightness(0.7)" />
                        <path d={`M ${p4.x} ${p4.y} L ${p3.x} ${p3.y} L ${p7.x} ${p7.y} L ${p8.x} ${p8.y} Z`} fill={color} filter="brightness(1.2)" />
                        <path
                            d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`}
                            fill={color}
                            stroke={(isHovered || isSelected) ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.05)"}
                            strokeWidth={(isHovered || isSelected) ? "1" : "0.5"}
                        />
                    </motion.g>
                );
            })}

            {(isHovered || isSelected) && (
                <text x={x} y={y - size - 20} textAnchor="middle" className="fill-accent text-xs font-bold font-latex italic">
                    {isSelected ? 'Selected' : 'Inspection'}
                </text>
            )}
        </motion.g>
    );
};

export default function VGGArchitectureExplorer() {
    const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const activeBlockId = hoveredBlockId || selectedBlockId;
    const activeBlock = useMemo(() => VGG_BLOCKS.find(b => b.id === activeBlockId), [activeBlockId]);

    const totalNetworkParams = useMemo(() => VGG19_LAYERS.reduce((acc, l) => acc + l.params, 0), []);

    const blockMetrics = useMemo(() => {
        if (!activeBlock) return null;
        const params = activeBlock.layers.reduce((acc, l) => acc + l.params, 0);
        const flops = activeBlock.type === 'conv'
            ? (2 * Math.pow(activeBlock.spatial, 2) * params) / 1e9
            : (2 * params) / 1e6;

        return {
            params,
            paramPercent: (params / totalNetworkParams) * 100,
            flops: flops.toFixed(2),
            flopUnit: activeBlock.type === 'conv' ? 'GFLOPs' : 'MFLOPs'
        };
    }, [activeBlock, totalNetworkParams]);

    const getSpatialSize = (s: number) => Math.pow(s, 0.42) * 16;
    const getDepthSize = (d: number) => {
        if (d > 512) return 48 + Math.log2(d / 512) * 8;
        return Math.pow(d, 0.45) * 2.8;
    };

    return (
        <div className="p-8 bg-paper border border-ink/10 rounded-sm ">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <div className="text-xxs font-mono uppercase tracking-[0.2em] text-tertiary mb-2">
                        Feature Hierarchy & Volumetrics
                    </div>
                    <h4 className="text-xl font-latex font-bold text-ink mb-1 tracking-tight">VGG19 Hierarchical Construction</h4>
                    <p className="text-sm text-secondary max-w-md">
                        Isometric decomposition visualizing the bottleneck transitions and parameter distribution.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-6 relative aspect-square bg-ink/[0.01] rounded-sm overflow-hidden border border-ink/5">
                    <svg viewBox="0 0 600 600" className="w-full h-full">
                        <defs>
                            <pattern id="hologrid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-ink)" strokeOpacity={0.03} strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#hologrid)" />

                        {VGG_BLOCKS.map((block, idx) => {
                            if (idx === VGG_BLOCKS.length - 1) return null;
                            const next = VGG_BLOCKS[idx + 1];
                            const x1 = 60 + idx * 95;
                            const y1 = 440 - idx * 45;
                            const x2 = 60 + (idx + 1) * 95;
                            const y2 = 440 - (idx + 1) * 45;

                            return (
                                <TunnelConnector
                                    key={`tunnel-${idx}`}
                                    x1={x1} y1={y1}
                                    s1={getSpatialSize(block.spatial)}
                                    d1={getDepthSize(block.channels) + (block.layers.length * 1.5)}
                                    x2={x2} y2={y2}
                                    s2={getSpatialSize(next.spatial)}
                                    color={block.color}
                                />
                            );
                        })}

                        {VGG_BLOCKS.map((block, idx) => {
                            const baseX = 60 + idx * 95;
                            const baseY = 440 - idx * 45;

                            return (
                                <IsometricBlock
                                    key={block.id}
                                    x={baseX}
                                    y={baseY}
                                    size={getSpatialSize(block.spatial)}
                                    depth={getDepthSize(block.channels)}
                                    numSlices={block.layers.length}
                                    color={block.color}
                                    isHovered={hoveredBlockId === block.id}
                                    isSelected={selectedBlockId === block.id}
                                    onHover={(h) => setHoveredBlockId(h ? block.id : null)}
                                    onClick={() => setSelectedBlockId(selectedBlockId === block.id ? null : block.id)}
                                />
                            );
                        })}
                    </svg>
                </div>

                <div className="lg:col-span-6">
                    <AnimatePresence mode="wait">
                        {activeBlock && blockMetrics ? (
                            <motion.div
                                key={activeBlock.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="p-6 bg-ink/[0.02] border border-ink/10 rounded-sm">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 rounded-sm text-paper" style={{ backgroundColor: activeBlock.color }}>
                                            {activeBlock.type === 'conv' ? <Layers className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold font-latex text-ink">{activeBlock.name}</h4>
                                            <span className="text-xxs font-mono uppercase tracking-[0.2em] text-tertiary">
                                                {activeBlock.layers.length} Composite Layers
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <VizStat
                                            label="Parameter Mass"
                                            value={blockMetrics.params >= 1000000 
                                                ? `${(blockMetrics.params / 1000000).toFixed(1)}M` 
                                                : blockMetrics.params.toLocaleString()}
                                            icon={Target}
                                            topBarVariant="accent"
                                            description={`${blockMetrics.paramPercent.toFixed(1)}% of net`}
                                        />
                                        <VizStat
                                            label="Block Intensity"
                                            value={blockMetrics.flops}
                                            unit={blockMetrics.flopUnit}
                                            icon={Activity}
                                            topBarVariant="neutral"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="text-xxs uppercase font-mono tracking-[0.2em] text-tertiary border-b border-ink/10 pb-2">Sub-Layer Stack</div>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pe-2 custom-scrollbar">
                                            {activeBlock.layers.map(layer => (
                                                <div key={layer.name} className="flex justify-between items-center text-xxs font-mono bg-paper/50 p-2 border border-ink/[0.03] rounded-[1px]">
                                                    <span className="text-secondary font-bold">{layer.name}</span>
                                                    <span className="text-tertiary opacity-60">{layer.shape}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <VizInsight title="Empirical Analysis" icon={Info}>
                                    {activeBlock.insight}
                                </VizInsight>
                            </motion.div>
                        ) : (
                            <VizInsight title="Structural Probe" icon={Database} variant="default">
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                    <Database className="w-12 h-12 text-ink/10" />
                                    <p className="text-sm text-ink/60 font-latex italic max-w-[240px]">
                                        Select an architectural block to inspect its hierarchical role and computational complexity.
                                    </p>
                                </div>
                            </VizInsight>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
