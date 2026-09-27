import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SafeLatex from "@/research/components/SafeLatex";
import { cn } from "@/research/lib/utils";
import { VizSlider, VizStat, VizInsight } from "@/research/features/studies/applied-stats-in-ai/VizPrimitives";

const CHANNEL_COUNT = 12;

export default function GaussianGate() {
  const [mu, setMu] = useState(0.5);
  const sigma = 0.5;

  // Stochastic states for channels
  const [channelStates, setChannelStates] = useState<number[]>(new Array(CHANNEL_COUNT).fill(1));

  // Update stochastic states periodically to show "living" gate
  useEffect(() => {
    const interval = setInterval(() => {
      setChannelStates(prev => 
        prev.map(() => {
          const epsilon = (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / 1; // Approx N(0,1)
          const z = Math.max(0, Math.min(1, mu + sigma * epsilon + 0.5));
          return z > 0.5 ? 1 : 0;
        })
      );
    }, 800);
    return () => clearInterval(interval);
  }, [mu]);

  // Generate points for the normal distribution curve
  const points = useMemo(() => {
    const pts = [];
    for (let x = -2; x <= 2; x += 0.05) {
      const y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
      pts.push({ x: (x + 2) * 100, y: 150 - y * 120 });
    }
    return pts;
  }, [mu]);

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
  const areaData = `${pathData} L ${points[points.length-1].x},150 L ${points[0].x},150 Z`;

  return (
    <div className="w-full py-16 border-y border-ink/5 my-12 bg-ink/[0.01] rounded-sm">
      <div className="mb-12 px-8">
        <div className="text-xxs font-mono uppercase tracking-[0.2em] text-tertiary mb-2">
          Differentiable L0 Relaxation
        </div>
        <h4 className="text-2xl font-latex font-bold text-ink mb-2 tracking-tight">The Gaussian Stochastic Gate</h4>
        <p className="text-sm text-secondary italic font-latex max-w-2xl opacity-70">
            Differentiable L0 relaxation: Visualizing the transition from continuous parameters to discrete hardware gates.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 items-start px-8">
        {/* Left: Distribution & Physical Shutter */}
        <div className="flex-1 w-full space-y-12">
          
          <div className="relative h-[200px] w-full">
            <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Threshold Zones */}
              <rect x="0" y="0" width="200" height="150" fill="var(--color-ink)" fillOpacity={0.02} />
              <rect x="200" y="0" width="100" height="150" fill="var(--color-accent)" fillOpacity={0.05} />
              <rect x="300" y="0" width="100" height="150" fill="var(--color-ink)" fillOpacity={0.02} />

              <line x1="0" y1="150" x2="400" y2="150" stroke="var(--color-ink)" strokeOpacity={0.1} strokeWidth="1" />
              
              <motion.path
                d={areaData}
                fill="url(#gateGrad)"
                initial={false}
                animate={{ d: areaData }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />

              <motion.path
                d={pathData}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                initial={false}
                animate={{ d: pathData }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />

              {/* Grid Lines */}
              <line x1="200" y1="150" x2="200" y2="160" stroke="var(--color-ink)" strokeOpacity={0.2} />
              <line x1="300" y1="150" x2="300" y2="160" stroke="var(--color-ink)" strokeOpacity={0.2} />
              <text x="200" y="175" textAnchor="middle" className="text-xxs font-mono fill-ink/40">0</text>
              <text x="300" y="175" textAnchor="middle" className="text-xxs font-mono fill-ink/40">1</text>
              <text x="250" y="140" textAnchor="middle" className="text-xxs font-mono fill-accent font-bold uppercase tracking-widest">Active Threshold</text>
            </svg>
          </div>

          {/* Channel Array Visualizer */}
          <div className="space-y-6">
            <span className="text-xxs font-mono uppercase tracking-[0.2em] text-tertiary font-bold">Tensor Shutter Array (Stochastic)</span>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-3">
              {channelStates.map((state, i) => (
                <div key={i} className="aspect-square relative group">
                  <div className="absolute inset-0 border border-ink/10 rounded-sm" />
                  <motion.div 
                    animate={{ 
                      height: state === 1 ? "0%" : "100%",
                      opacity: state === 1 ? 0 : 1
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="absolute top-0 start-0 end-0 bg-ink rounded-sm z-10"
                  />
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-colors duration-500",
                    state === 1 ? "bg-accent/10" : "bg-transparent"
                  )}>
                    {state === 1 && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-secondary leading-relaxed font-latex italic opacity-80">
                Each cell represents a convolutional channel. Stochastic sampling determines whether the &quot;shutter&quot; (gate) is physically open for inference.
            </p>
          </div>
        </div>

        {/* Right: Controls & Master Status */}
        <div className="w-full lg:w-72 space-y-6">
            <div className="p-8 bg-paper border border-ink/10 rounded-sm">
                <VizSlider
                    label={<>Gate Bias (<SafeLatex>$\mu$</SafeLatex>)</>}
                    value={mu}
                    min={-1.5}
                    max={1.5}
                    step={0.01}
                    onChange={setMu}
                    formatValue={(v) => v.toFixed(2)}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={mu > -0.2 ? "active" : "pruned"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    <VizStat
                        label="Gate Status"
                        value={mu > -0.2 ? "ACTIVE" : "PRUNED"}
                        topBarVariant={mu > -0.2 ? "accent" : "neutral"}
                        description={mu > -0.2 ? "Identity Map Inherited" : "Zero-Saliency Mask"}
                    />
                </motion.div>
            </AnimatePresence>

            <VizInsight title="Information Transfer">
                <p className="text-xs text-secondary leading-relaxed font-latex italic">
                    The Gaussian gate acts as a continuous proxy for discrete L0 penalization. By adjusting the bias, we modulate the probability of channel survival.
                </p>
            </VizInsight>
        </div>
      </div>
    </div>
  );
}
