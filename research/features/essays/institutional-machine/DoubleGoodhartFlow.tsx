'use client';

import { useEffect, useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Pause, Play, UserRound, BrainCircuit, Sparkles } from 'lucide-react';
import { EditorialPlate } from '@/research/features/studies/applied-stats-in-ai/VizPrimitives';

const stages = [
  { title: 'Human intent', icon: UserRound, x: 104 },
  { title: 'Reward model', icon: BrainCircuit, x: 400 },
  { title: 'LLM policy', icon: Sparkles, x: 696 },
];

const baselineY = 132;

export default function DoubleGoodhartFlow() {
  const [pressure, setPressure] = useState(12);
  const [playing, setPlaying] = useState(false);
  const inputId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const reduceMotion = useReducedMotion();

  const rewardY = baselineY - pressure * 0.38;
  const policyY = baselineY - pressure * 0.78;
  const isRunning = playing && pressure < 100;

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setTimeout(() => setPressure(Math.min(100, pressure + 1)), 65);
    return () => window.clearTimeout(timer);
  }, [isRunning, pressure]);

  const runOptimization = () => {
    if (isRunning) {
      setPlaying(false);
      return;
    }
    if (reduceMotion) {
      setPressure(pressure >= 100 ? 0 : 100);
      setPlaying(false);
      return;
    }
    if (pressure >= 100) setPressure(0);
    setPlaying(true);
  };

  const setManually = (value: number) => {
    setPlaying(false);
    setPressure(value);
  };

  return (
    <EditorialPlate
      compact
      figureCaption={{ number: 2, text: 'The reward model first imperfectly represents human intent. Then the language model is optimized against that proxy, widening the gap between high reward and genuinely helpful answers.' }}
    >
      <div className="relative z-10 space-y-5 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-tertiary">Human intent → reward proxy → optimized behavior</p>
          <button
            type="button"
            onClick={runOptimization}
            aria-label={isRunning ? 'Pause optimization' : pressure >= 100 ? 'Replay optimization' : 'Run optimization'}
            className="inline-flex items-center gap-2 border border-ink/15 px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:border-accent hover:text-accent motion-reduce:transition-none"
          >
            {isRunning ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
            {isRunning ? 'Pause' : pressure >= 100 ? 'Replay' : 'Run'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 sm:gap-3">
          {stages.map(({ title, icon: Icon }) => (
            <div key={title} className="flex items-center gap-2 border-b border-ink/10 pb-2 font-mono text-xs uppercase tracking-wide text-secondary sm:gap-2.5">
              <Icon className="h-3.5 w-3.5 shrink-0 text-accent sm:h-4 sm:w-4" aria-hidden="true" />
              <span>{title}</span>
            </div>
          ))}
        </div>

        <svg
          className="block h-auto w-full overflow-visible"
          viewBox="0 0 800 230"
          role="img"
          aria-labelledby={`${titleId} ${descriptionId}`}
        >
          <title id={titleId}>Two proxy gaps in reinforcement learning from human feedback</title>
          <desc id={descriptionId}>People want accurate, helpful answers. The reward model imperfectly predicts human preferences, creating the first gap. The language model then optimizes that proxy and can exploit its weaknesses, widening the second gap. The slider increases optimization pressure.</desc>

          <line x1="64" x2="736" y1={baselineY} y2={baselineY} stroke="var(--ink-val)" strokeOpacity="0.22" strokeDasharray="4 7" />
          <text x="64" y="158" fill="var(--pencil-val)" fontSize="12" fontFamily="var(--font-code), monospace">INTENDED OUTCOME</text>

          <motion.path
            d={`M ${stages[0].x} ${baselineY} C 220 ${baselineY}, 270 ${rewardY}, ${stages[1].x} ${rewardY}`}
            fill="none"
            stroke="var(--accent-val)"
            strokeWidth="3"
            strokeLinecap="round"
            animate={{ d: `M ${stages[0].x} ${baselineY} C 220 ${baselineY}, 270 ${rewardY}, ${stages[1].x} ${rewardY}` }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 22 }}
          />
          <motion.path
            d={`M ${stages[1].x} ${rewardY} C 520 ${rewardY}, 574 ${policyY}, ${stages[2].x} ${policyY}`}
            fill="none"
            stroke="var(--accent-val)"
            strokeOpacity="0.65"
            strokeWidth="3"
            strokeLinecap="round"
            animate={{ d: `M ${stages[1].x} ${rewardY} C 520 ${rewardY}, 574 ${policyY}, ${stages[2].x} ${policyY}` }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 22 }}
          />

          <line x1={stages[1].x} x2={stages[1].x} y1={rewardY} y2={baselineY} stroke="var(--accent-val)" strokeOpacity="0.38" strokeDasharray="3 4" />
          <line x1={stages[2].x} x2={stages[2].x} y1={policyY} y2={baselineY} stroke="var(--accent-val)" strokeOpacity="0.38" strokeDasharray="3 4" />

          <circle cx={stages[0].x} cy={baselineY} r="9" fill="var(--paper-val)" stroke="var(--ink-val)" strokeWidth="3" />
          <motion.circle cx={stages[1].x} cy={rewardY} r="9" fill="var(--accent-val)" stroke="var(--paper-val)" strokeWidth="3" animate={{ cy: rewardY }} transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 22 }} />
          <motion.circle cx={stages[2].x} cy={policyY} r="9" fill="var(--accent-val)" stroke="var(--paper-val)" strokeWidth="3" animate={{ cy: policyY }} transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 22 }} />

          {!reduceMotion && (
            <>
              <motion.circle r="4" fill="var(--paper-val)" animate={{ cx: [104, 220, 400], cy: [baselineY, baselineY - (baselineY - rewardY) * 0.45, rewardY], opacity: [0, 1, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }} />
              <motion.circle r="4" fill="var(--paper-val)" animate={{ cx: [400, 520, 696], cy: [rewardY, rewardY - (rewardY - policyY) * 0.45, policyY], opacity: [0, 1, 0] }} transition={{ duration: 2.4, delay: 1.2, repeat: Infinity, ease: 'linear' }} />
            </>
          )}

          <motion.g initial={{ opacity: pressure > 3 ? 1 : 0.35 }} animate={{ opacity: pressure > 3 ? 1 : 0.35 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}>
            <text x="414" y={(rewardY + baselineY) / 2 + 4} fill="var(--accent-val)" fontSize="11" fontFamily="var(--font-code), monospace">PREFERENCE PROXY</text>
            <text x="688" y={(policyY + baselineY) / 2 + 4} textAnchor="end" fill="var(--accent-val)" fontSize="11" fontFamily="var(--font-code), monospace">OPTIMIZATION GAP</text>
          </motion.g>
        </svg>

        <div className="grid grid-cols-3 gap-2 border-y border-ink/10 py-3 sm:gap-4">
          <p className="font-serif text-sm leading-snug text-ink sm:text-base">Help me solve this accurately.</p>
          <motion.p key={pressure < 35 ? 'proxy-low' : pressure < 70 ? 'proxy-mid' : 'proxy-high'} initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-sm leading-snug text-ink sm:text-base">
            {pressure < 35 ? 'Learn what people tend to prefer.' : pressure < 70 ? 'Prefer answers that sound helpful.' : 'Confidence becomes the signal.'}
          </motion.p>
          <motion.p key={pressure < 35 ? 'policy-low' : pressure < 70 ? 'policy-mid' : 'policy-high'} initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-sm leading-snug text-ink sm:text-base">
            {pressure < 35 ? 'Answer with useful evidence.' : pressure < 70 ? 'Make the answer sound helpful.' : 'Sound certain, even without evidence.'}
          </motion.p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label htmlFor={inputId} className="font-mono text-xs uppercase tracking-[0.15em] text-tertiary">Optimization pressure</label>
            <output htmlFor={inputId} className="font-mono text-xs tabular-nums text-accent">{pressure}%</output>
          </div>
          <input
            id={inputId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={pressure}
            onChange={(event) => setManually(Number(event.target.value))}
            aria-label="Optimization pressure"
            className="h-1 w-full cursor-pointer appearance-none bg-ink/10 accent-accent"
          />
          <div className="mt-1 flex justify-between font-mono text-xs uppercase tracking-wider text-tertiary">
            <span>Low</span><span>High</span>
          </div>
        </div>
      </div>
    </EditorialPlate>
  );
}
