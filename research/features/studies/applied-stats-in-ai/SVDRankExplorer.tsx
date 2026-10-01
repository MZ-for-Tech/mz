"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2, Layers } from 'lucide-react';

const SIZE = 32;

const generateSVDComponents = () => {
    const components = Array.from({ length: SIZE }, (_, i) => {
        let u, v;
        // Rank-0 and Rank-1 provide structural "primitives" (Gabor-like features)
        if (i === 0) {
            u = Array.from({ length: SIZE }, (_, idx) => Math.sin((idx / SIZE) * Math.PI));
            v = Array.from({ length: SIZE }, () => 1);
        } else if (i === 1) {
            u = Array.from({ length: SIZE }, () => 1);
            v = Array.from({ length: SIZE }, (_, idx) => Math.cos((idx / SIZE) * Math.PI));
        } else if (i < 5) {
            u = Array.from({ length: SIZE }, (_, idx) => Math.sin((idx / SIZE) * Math.PI * (i + 1)));
            v = Array.from({ length: SIZE }, (_, idx) => Math.cos((idx / SIZE) * Math.PI * (i + 1)));
        } else {
            // Higher ranks add the high-frequency detail (noise)
            u = Array.from({ length: SIZE }, () => (Math.random() - 0.5) * 2);
            v = Array.from({ length: SIZE }, () => (Math.random() - 0.5) * 2);
        }
        
        // Rapid exponential decay: most energy is in the first 5-8 components
        const sigma = Math.exp(-i / 4) * 25; 
        return { u, v, sigma };
    });
    return components;
};

const MatrixCanvas = ({ matrix, color }: { matrix: number[][]; color: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const cellSize = canvas.width / SIZE;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        matrix.forEach((row, i) => {
            row.forEach((val, j) => {
                ctx.fillStyle = color.replace('ALPHA', val.toString());
                ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            });
        });
    }, [matrix, color]);

    return (
        <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full h-full object-cover transition-opacity duration-300"
        />
    );
};

export default function SVDRankExplorer() {
    const [k, setK] = useState(16);
    const components = useMemo(() => generateSVDComponents(), []);

    // Full Reconstruction (Original Weight Matrix)
    const originalMatrix = useMemo(() => {
        const matrix = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
        components.forEach(({ u, v, sigma }) => {
            for (let i = 0; i < SIZE; i++) {
                for (let j = 0; j < SIZE; j++) {
                    matrix[i][j] += u[i] * v[j] * sigma;
                }
            }
        });
        let max = 0;
        matrix.forEach(row => row.forEach(v => { if (Math.abs(v) > max) max = Math.abs(v); }));
        return matrix.map(row => row.map(v => (v / (max || 1) + 1) / 2));
    }, [components]);

    // Rank-k Reconstruction
    const approxMatrix = useMemo(() => {
        const matrix = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
        components.slice(0, k).forEach(({ u, v, sigma }) => {
            for (let i = 0; i < SIZE; i++) {
                for (let j = 0; j < SIZE; j++) {
                    matrix[i][j] += u[i] * v[j] * sigma;
                }
            }
        });
        let aMax = 0;
        matrix.forEach(row => row.forEach(v => { if (Math.abs(v) > aMax) aMax = Math.abs(v); }));
        return matrix.map(row => row.map(v => (v / (aMax || 1) + 1) / 2));
    }, [components, k]);

    const energy = useMemo(() => {
        const totalEnergy = components.reduce((sum, c) => sum + c.sigma, 0);
        const currentEnergy = components.slice(0, k).reduce((sum, c) => sum + c.sigma, 0);
        return (currentEnergy / totalEnergy) * 100;
    }, [components, k]);

    const paramReduction = ((SIZE * SIZE) / (SIZE * k + k * SIZE)).toFixed(1);

    return (
        <div className="w-full py-12 border-y border-ink/5 my-12 bg-ink/[0.01]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12 px-8">
                <div>
                    <h4 className="text-xl font-latex font-bold text-ink mb-1 tracking-tight">Singular Value Decomposition</h4>
                    <p className="text-sm text-secondary italic font-latex max-w-md">
                        Decomposing high-density weight tensors into essential geometric primitives.
                    </p>
                </div>

                <div className="flex items-center gap-6 px-6 py-3 bg-paper border border-ink/10 rounded-sm ">
                    <div className="text-center">
                        <span className="block text-xs uppercase font-mono tracking-[0.2em] text-ink/60 mb-1">Energy</span>
                        <span className="text-xl font-latex font-bold text-accent">{Math.min(99.9, energy).toFixed(1)}%</span>
                    </div>
                    <div className="w-px h-8 bg-ink/5" />
                    <div className="text-center">
                        <span className="block text-xs uppercase font-mono tracking-[0.2em] text-ink/60 mb-1">Compression</span>
                        <span className="text-xl font-latex font-bold">{paramReduction}x</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 px-8">
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest text-ink/60">
                        <span className="flex items-center gap-2"><Layers className="w-3 h-3" /> Uncompressed Weights</span>
                        <span>{SIZE}x{SIZE} Tensor</span>
                    </div>
                    <div className="aspect-square bg-paper border border-ink/10 rounded-sm overflow-hidden p-1 ">
                        <MatrixCanvas matrix={originalMatrix} color="rgba(17, 17, 17, ALPHA)" />
                    </div>
                </div>

                <div className="space-y-4 relative">
                    <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest text-accent font-bold">
                        <span className="flex items-center gap-2"><Minimize2 className="w-3 h-3" /> SVD Approximation (Rank-{k})</span>
                        <span className="text-ink/60 font-normal">{(SIZE * k + k * SIZE).toLocaleString()} Parameters</span>
                    </div>
                    <div className="aspect-square bg-paper border border-ink/10 rounded-sm overflow-hidden p-1  relative">
                        <MatrixCanvas matrix={approxMatrix} color="rgba(139, 58, 43, ALPHA)" />

                        <AnimatePresence>
                            {k < 3 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center bg-paper/20 pointer-events-none"
                                >
                                    <div className="px-4 py-2 bg-paper border border-ink/10  rounded-sm">
                                        <p className="text-xs font-mono uppercase tracking-widest font-bold text-accent">Geometric Primitive</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="px-8 space-y-12">
                <div className="p-8 bg-paper border border-ink/10 rounded-sm  space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-mono uppercase tracking-[0.3em] text-ink/60">Approximation Rank <span className="text-accent">k</span></span>
                        <div className="px-3 py-1 bg-ink text-paper text-xs font-mono rounded-sm ">k = {k}</div>
                    </div>
                    <input
                        type="range"
                        min="1" max={SIZE} step="1"
                        value={k}
                        onChange={(e) => setK(parseInt(e.target.value))}
                        className="w-full accent-accent h-1 bg-ink/10 rounded-full cursor-pointer appearance-none"
                    />
                </div>

            </div>
        </div>
    );
}