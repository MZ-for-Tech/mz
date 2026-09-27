import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Line
} from "recharts";
import { Sigma, Activity } from 'lucide-react';
import { VizSlider, VizPlayControls, VizStat, VizInsight } from "@/research/features/studies/applied-stats-in-ai/VizPrimitives";

const sweepData = [
  { threshold: 0.1, rankFC0: 19, rankFC3: 12, params: 20.72, reduction: 85.2, f1: 43.70, auc: 85.77, minF1: 0.0 },
  { threshold: 0.2, rankFC0: 44, rankFC3: 31, params: 21.60, reduction: 84.5, f1: 95.32, auc: 99.89, minF1: 88.8 },
  { threshold: 0.3, rankFC0: 79, rankFC3: 55, params: 22.82, reduction: 83.7, f1: 98.46, auc: 99.98, minF1: 95.9 },
  { threshold: 0.4, rankFC0: 150, rankFC3: 92, params: 25.20, reduction: 82.0, f1: 98.72, auc: 99.98, minF1: 96.4 },
  { threshold: 0.5, rankFC0: 309, rankFC3: 169, params: 30.47, reduction: 78.2, f1: 98.82, auc: 99.98, minF1: 96.7 },
].sort((a, b) => a.threshold - b.threshold);

// Interpolation for smooth animation
const getInterpolatedData = (t: number) => {
  const sorted = [...sweepData].sort((a, b) => a.threshold - b.threshold);
  let lower = sorted[0];
  let upper = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (t >= sorted[i].threshold && t <= sorted[i + 1].threshold) {
      lower = sorted[i];
      upper = sorted[i + 1];
      break;
    }
  }

  const range = upper.threshold - lower.threshold;
  const factor = range === 0 ? 0 : (t - lower.threshold) / range;

  return {
    threshold: t,
    f1: lower.f1 + (upper.f1 - lower.f1) * factor,
    reduction: lower.reduction + (upper.reduction - lower.reduction) * factor,
    params: lower.params + (upper.params - lower.params) * factor,
    rankFC0: Math.round(lower.rankFC0 + (upper.rankFC0 - lower.rankFC0) * factor),
    rankFC3: Math.round(lower.rankFC3 + (upper.rankFC3 - lower.rankFC3) * factor),
  };
};

export default function SVDSweep() {
  const [threshold, setThreshold] = useState(0.50);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef<number>(0);

  const updateThreshold = (val: number) => {
    setThreshold(val);
    progressRef.current = (0.50 - val) / (0.50 - 0.10);
  };

  const animate = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const duration = 6000;
    progressRef.current += deltaTime / duration;

    if (progressRef.current >= 1) {
      progressRef.current = 1;
      updateThreshold(0.10);
      stopAnimation();
    } else {
      updateThreshold(0.50 - progressRef.current * (0.50 - 0.10));
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
    updateThreshold(0.50);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const current = useMemo(() => getInterpolatedData(threshold), [threshold]);
  const isCritical = current.f1 < 90;

  return (
    <div className="w-full py-12 border-y border-ink/5 my-12 bg-paper rounded-sm">
      {/* Header Stat Cards */}
      <div className="flex flex-wrap gap-4 mb-8 px-6">
        <VizStat
          label="Diagnostic Fidelity"
          value={current.f1.toFixed(1)}
          unit="% F1"
          progress={current.f1}
          topBarVariant={isCritical ? "accent" : "neutral"}
          className="flex-1 min-w-[200px]"
        />
        <VizStat
          label="Physical Compression"
          value={current.reduction.toFixed(1)}
          unit="% RED"
          progress={current.reduction}
          topBarVariant="accent"
          className="flex-1 min-w-[200px]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12 px-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-8 h-full min-h-[400px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sweepData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="safetyGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--accent-val)" stopOpacity={0.2} />
                  <stop offset="20%" stopColor="var(--accent-val)" stopOpacity={0.1} />
                  <stop offset="40%" stopColor="var(--ink-val)" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="var(--ink-val)" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-ink)" strokeOpacity={0.05} />

              <XAxis
                dataKey="threshold"
                type="number"
                domain={[0.5, 0.1]}
                reversed
                tick={{ fontSize: 10, fill: "var(--pencil-val)", fontFamily: "var(--font-mono)" }}
                label={{ value: 'Energy Threshold (ε)', position: 'insideBottom', offset: -10, fontSize: 10, fill: "var(--tertiary-val)", fontFamily: "var(--font-mono)", fontWeight: "bold" }}
              />

              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "var(--pencil-val)", fontFamily: "var(--font-mono)" }}
                label={{ value: 'F1 Score %', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: "var(--tertiary-val)", fontFamily: "var(--font-mono)" }}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[70, 90]}
                tick={{ fontSize: 10, fill: "var(--accent-val)", fontFamily: "var(--font-mono)" }}
                label={{ value: 'Reduction %', angle: 90, position: 'insideRight', offset: 10, fontSize: 10, fill: "var(--accent-val)", fontFamily: "var(--font-mono)" }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-ink text-paper p-4 rounded-sm font-mono text-xxs border border-accent/20">
                        <p className="font-bold border-b border-paper/10 pb-2 mb-2 uppercase tracking-widest text-accent">SVD Profile: ε={payload[0].payload.threshold}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="opacity-60 mb-1">ACCURACY</p>
                            <p className="text-sm font-bold">{payload[0].payload.f1}%</p>
                          </div>
                          <div>
                            <p className="opacity-60 mb-1">SAVINGS</p>
                            <p className="text-sm font-bold text-accent">{payload[0].payload.reduction}%</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Background Safety Zone */}
              <ReferenceLine yAxisId="left" y={90} stroke="var(--ink-val)" strokeDasharray="3 3" opacity={0.1} label={{ position: 'right', value: 'STABILITY FLOOR', fontSize: 8, fill: 'var(--tertiary-val)' }} />

              {/* Main F1 Curve */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="f1"
                stroke="var(--ink-val)"
                strokeWidth={3}
                fill="url(#safetyGradient)"
                dot={{ r: 4, fill: "var(--paper-val)", stroke: "var(--ink-val)", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "var(--accent-val)" }}
              />

              {/* Param Reduction Line - Second Axis */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="reduction"
                stroke="var(--accent-val)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                opacity={0.6}
              />

              <ReferenceLine
                yAxisId="left"
                x={threshold}
                stroke="var(--accent-val)"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4">
          <div className="p-6 bg-paper border border-ink/10 rounded-sm relative overflow-hidden h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4 border-b border-ink/5 pb-3">
              <Sigma className="w-5 h-5 text-accent" />
              <h4 className="text-xxs font-mono font-bold uppercase tracking-[0.2em] text-ink">Spectral Rank Profile</h4>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xxs font-mono text-tertiary uppercase mb-2 tracking-[0.2em]">
                    <span>FC0 Latent Rank</span>
                    <span className="font-latex font-normal text-ink">{current.rankFC0}</span>
                  </div>
                  <div className="h-1 w-full bg-ink/10 rounded-sm overflow-hidden">
                    <motion.div
                      className="h-full bg-ink"
                      animate={{ width: `${(current.rankFC0 / 309) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xxs font-mono text-tertiary uppercase mb-2 tracking-[0.2em]">
                    <span>FC3 Latent Rank</span>
                    <span className="font-latex font-normal text-ink">{current.rankFC3}</span>
                  </div>
                  <div className="h-1 w-full bg-ink/10 rounded-sm overflow-hidden">
                    <motion.div
                      className="h-full bg-ink"
                      animate={{ width: `${(current.rankFC3 / 169) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-ink/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xxs font-mono text-tertiary uppercase tracking-[0.2em]">Active Parameters</span>
                    <span className="text-lg font-latex font-normal text-accent">{current.params.toFixed(2)}M</span>
                  </div>
                </div>
              </div>

              <VizInsight title="Diagnostic Insight" icon={Activity} className="p-4 mt-4">
                {threshold < 0.15 ?
                  "Structural Collapse. Truncation has reached the 'Singular Value Cliff'—network loses spectral depth." :
                  threshold < 0.35 ?
                    "Optimal Compression. High-frequency redundancy purged. Model maintains 98%+ fidelity despite rank reduction." :
                    "Native Stability. Operating at full spectral capacity. Redundancy present but largely unexploited."}
              </VizInsight>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="mx-6 p-6 bg-paper border border-ink/10 rounded-sm flex flex-col md:flex-row items-center gap-8">
        <VizPlayControls
          isPlaying={isPlaying}
          onToggle={togglePlay}
          onReset={resetAnimation}
          size="md"
        />

        <div className="flex-1 w-full">
          <VizSlider
            label="Sweep Energy Threshold (ε)"
            value={threshold}
            min={0.10}
            max={0.50}
            step={0.005}
            onChange={updateThreshold}
            minLabel="Degenerate (0.1)"
            maxLabel="High Fidelity (0.5)"
            formatValue={(v) => v.toFixed(2)}
          />
        </div>
      </div>
    </div>
  );
}
