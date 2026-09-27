"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, CheckCircle2 } from "lucide-react";

const TOTAL_BATCHES = 20;
const BASELINE_LATENCY = 231.3; // ms (Table 11)
const L0_LATENCY = 96.9; // ms (Table 11)

export default function InferenceThroughputSimulator() {
  const [isRunning, setIsRunning] = useState(false);
  const [baselineProgress, setBaselineProgress] = useState(0);
  const [l0Progress, setL0Progress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const requestRef = useRef<number | undefined>(undefined);

  const startRace = () => {
    setBaselineProgress(0);
    setL0Progress(0);
    setElapsed(0);
    setStartTime(performance.now());
    setIsRunning(true);
  };

  const resetRace = () => {
    setIsRunning(false);
    setBaselineProgress(0);
    setL0Progress(0);
    setElapsed(0);
    setStartTime(null);
  };

  useEffect(() => {
    const animate = (time: number) => {
      if (!startTime) return;
      const dt = time - startTime;
      setElapsed(dt);

      const bProgress = (dt / (BASELINE_LATENCY * TOTAL_BATCHES)) * 100;
      const lProgress = (dt / (L0_LATENCY * TOTAL_BATCHES)) * 100;

      setBaselineProgress(Math.min(bProgress, 100));
      setL0Progress(Math.min(lProgress, 100));

      if (bProgress < 100 || lProgress < 100) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setIsRunning(false);
      }
    };

    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, startTime]);

  const l0Finished = l0Progress >= 100;
  const baselineFinished = baselineProgress >= 100;

  return (
    <div className="w-full bg-paper border border-ink/10 rounded-sm p-8 my-12  overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div className="max-w-md">
          <div className="text-xxs font-mono uppercase tracking-[0.2em] text-tertiary mb-2">
            Hardware Inference Race
          </div>
          <h3 className="text-2xl font-latex font-bold text-ink mb-2 tracking-tight">Throughput Benchmark</h3>
          <p className="text-sm text-secondary leading-relaxed italic">
            Simulating a clinical queue of {TOTAL_BATCHES} diagnostic batches. The L0 model achieves physical acceleration through tensor surgery, clearing the queue while the Baseline still processes.
          </p>
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <button
              onClick={startRace}
              className="flex items-center gap-2 px-6 py-2 bg-ink text-paper text-xxs font-mono uppercase tracking-[0.2em] rounded-sm hover:bg-accent transition-colors"
            >
              <Play className="w-3 h-3" /> Execute Benchmark
            </button>
          ) : (
            <button
              onClick={resetRace}
              className="flex items-center gap-2 px-6 py-2 border border-ink/20 text-ink text-xxs font-mono uppercase tracking-[0.2em] rounded-sm hover:bg-ink/5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="space-y-12 mb-12">
        {/* L0 Surgery Lane */}
        <div className="relative">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xxs font-mono font-bold uppercase tracking-widest text-accent">L0 Structured Surgery</span>
              {l0Finished && <CheckCircle2 className="w-3 h-3 text-accent" />}
            </div>
            <span className="text-xxs font-latex font-bold text-tertiary">LATENCY: {L0_LATENCY}ms</span>
          </div>
          <div className="h-12 bg-ink/5 rounded-sm relative flex items-center px-2 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 start-0 bg-accent/20 border-e-2 border-accent"
              animate={{ width: `${l0Progress}%` }}
              transition={{ type: "tween", ease: "linear", duration: 0 }}
            />
            <div className="relative z-10 w-full flex gap-2">
              {Array.from({ length: TOTAL_BATCHES }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-xs shrink-0 transition-colors duration-300 ${(l0Progress > (i / TOTAL_BATCHES) * 100) ? 'bg-accent' : 'bg-ink/10'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Baseline Lane */}
        <div className="relative">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xxs font-mono font-bold uppercase tracking-widest text-secondary">Baseline VGG19</span>
              {baselineFinished && <CheckCircle2 className="w-3 h-3 text-secondary" />}
            </div>
            <span className="text-xxs font-latex font-bold text-tertiary">LATENCY: {BASELINE_LATENCY}ms</span>
          </div>
          <div className="h-12 bg-ink/5 rounded-sm relative flex items-center px-2 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 start-0 bg-ink/10 border-e-2 border-ink/20"
              animate={{ width: `${baselineProgress}%` }}
              transition={{ type: "tween", ease: "linear", duration: 0 }}
            />
            <div className="relative z-10 w-full flex gap-2">
              {Array.from({ length: TOTAL_BATCHES }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-xs shrink-0 transition-colors duration-300 ${(baselineProgress > (i / TOTAL_BATCHES) * 100) ? 'bg-ink' : 'bg-ink/10'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-ink/5">
        <div className="space-y-1">
          <span className="block text-xxs font-mono text-tertiary uppercase tracking-widest">Elapsed Time</span>
          <span className="text-xl font-latex font-bold text-ink">{(elapsed / 1000).toFixed(2)}s</span>
        </div>
        <div className="space-y-1">
          <span className="block text-xxs font-mono text-tertiary uppercase tracking-widest">L0 Status</span>
          <span className={`text-xl font-latex font-bold ${l0Finished ? 'text-accent' : 'text-ink'}`}>
            {l0Finished ? "COMPLETE" : `${Math.floor(l0Progress)}%`}
          </span>
        </div>
        <div className="space-y-1">
          <span className="block text-xxs font-mono text-tertiary uppercase tracking-widest">Efficiency Gain</span>
          <span className="text-xl font-latex font-normal text-accent">2.39x Speedup</span>
        </div>
      </div>
    </div>
  );
}
