'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EditorialPlate } from '@/research/features/studies/applied-stats-in-ai/VizPrimitives';
import { RESEARCH_CHART_FONT_SIZE } from '@/research/lib/typography';
import SafeLatex from '@/research/components/SafeLatex';

const SAMPLE_SIZE = 64;
const MAX_NOISE_PREDICTORS = 12;

function fitAt(noisePredictors: number) {
  // One signal term explains 64% of sample variance; each noise term captures
  // a small accidental slice of this sample's residual variance.
  const rSquared = 0.64 + noisePredictors * 0.0024;
  const predictorCount = noisePredictors + 1;
  const adjustedRSquared = 1 - ((1 - rSquared) * (SAMPLE_SIZE - 1)) / (SAMPLE_SIZE - predictorCount - 1);
  return { noisePredictors, rSquared, adjustedRSquared };
}

const fits = Array.from({ length: MAX_NOISE_PREDICTORS + 1 }, (_, index) => fitAt(index));
const chart = { width: 760, height: 370, left: 72, right: 22, top: 20, bottom: 68, min: 0.55, max: 0.70 };
const svgFontSize = RESEARCH_CHART_FONT_SIZE * 1.35;

function xAt(index: number) {
  return chart.left + (index / MAX_NOISE_PREDICTORS) * (chart.width - chart.left - chart.right);
}

function yAt(value: number) {
  return chart.top + ((chart.max - value) / (chart.max - chart.min)) * (chart.height - chart.top - chart.bottom);
}

function pointsFor(key: 'rSquared' | 'adjustedRSquared') {
  return fits.map((fit) => `${xAt(fit.noisePredictors)},${yAt(fit[key])}`).join(' ');
}

const rSquaredPoints = pointsFor('rSquared');
const adjustedPoints = pointsFor('adjustedRSquared');
const divergenceArea = [
  ...fits.map((fit) => `${xAt(fit.noisePredictors)},${yAt(fit.rSquared)}`),
  ...fits.slice().reverse().map((fit) => `${xAt(fit.noisePredictors)},${yAt(fit.adjustedRSquared)}`),
].join(' ');

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default function R2InflationDemo() {
  const [noisePredictors, setNoisePredictors] = useState(0);
  const inputId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const reduceMotion = useReducedMotion();
  const fit = fits[noisePredictors];
  const markerTransition = reduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 120, damping: 24 };

  return (
    <EditorialPlate
      compact
      figureCaption={{ number: 1, text: 'R² rises as noise predictors are added, while adjusted R² eventually falls under the added complexity.' }}
    >
      <div className="relative z-10 grid gap-5 p-4 md:grid-cols-[12.5rem_minmax(0,1fr)] md:items-center md:gap-6 md:p-6">
        <div className="space-y-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-tertiary">Regression model</p>
            <p className="mt-1 font-latex text-base leading-snug text-ink">
              1 signal <span className="text-tertiary">+</span> {noisePredictors} noise {noisePredictors === 1 ? 'predictor' : 'predictors'}
            </p>
          </div>

          <div className="space-y-2" aria-live="polite">
            <div className="flex items-center justify-between gap-2 border border-ink/20 bg-ink/[0.025] px-3 py-2">
              <div>
                <span className="block font-mono text-xs uppercase tracking-wider text-ink">R²</span>
              </div>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.strong
                  key={`r2-${noisePredictors}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.16 }}
                  className="font-latex text-2xl font-normal tabular-nums text-ink"
                >
                  {percent(fit.rSquared)}
                </motion.strong>
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-between gap-2 border border-accent/30 bg-accent/[0.035] px-3 py-2">
              <div>
                <span className="block font-mono text-xs uppercase tracking-wider text-accent">Adjusted R²</span>
              </div>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.strong
                  key={`adjusted-${noisePredictors}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.16 }}
                  className="font-latex text-2xl font-normal tabular-nums text-accent"
                >
                  {percent(fit.adjustedRSquared)}
                </motion.strong>
              </AnimatePresence>
            </div>
          </div>

          <div className="border-t border-ink/10 pt-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label htmlFor={inputId} className="font-mono text-xs uppercase tracking-wider text-tertiary">Noise predictors</label>
              <output htmlFor={inputId} className="font-mono text-xs tabular-nums text-accent">{noisePredictors} / {MAX_NOISE_PREDICTORS}</output>
            </div>
            <input
              id={inputId}
              type="range"
              min={0}
              max={MAX_NOISE_PREDICTORS}
              step={1}
              value={noisePredictors}
              onChange={(event) => setNoisePredictors(Number(event.target.value))}
              aria-label="Add noise predictors to the regression model"
              className="h-1 w-full cursor-pointer appearance-none bg-ink/10 accent-accent"
            />
            <div className="mt-1 flex justify-between font-mono text-xs uppercase tracking-wider text-tertiary">
              <span>Signal only</span><span>12 terms</span>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-sm uppercase tracking-wider text-tertiary">Model fit</span>
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm uppercase tracking-wider text-secondary">
              <span className="flex items-center gap-2"><i className="h-[2px] w-4 bg-ink" />R²</span>
              <span className="flex items-center gap-2"><i className="h-[2px] w-4 bg-accent" />Adjusted R²</span>
            </div>
          </div>
          <svg
            className="block h-auto w-full"
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            role="img"
            aria-labelledby={`${titleId} ${descriptionId}`}
          >
            <title id={titleId}>R-squared and adjusted R-squared as noise predictors are added</title>
            <desc id={descriptionId}>R-squared rises at every step. Adjusted R-squared falls as the accidental gain becomes too small to offset the complexity penalty.</desc>
            {[0.55, 0.60, 0.65, 0.70].map((tick) => (
              <g key={tick}>
                <line x1={chart.left} x2={chart.width - chart.right} y1={yAt(tick)} y2={yAt(tick)} stroke="var(--ink-val)" strokeOpacity="0.10" strokeDasharray="3 5" />
                <text x={chart.left - 12} y={yAt(tick) + 5} textAnchor="end" fill="var(--pencil-val)" fontSize={svgFontSize} fontFamily="var(--font-code), monospace">{Math.round(tick * 100)}%</text>
              </g>
            ))}
            {[0, 3, 6, 9, 12].map((tick) => (
              <g key={tick}>
                <line x1={xAt(tick)} x2={xAt(tick)} y1={chart.top} y2={chart.height - chart.bottom} stroke="var(--ink-val)" strokeOpacity="0.05" />
                <text x={xAt(tick)} y={chart.height - chart.bottom + 21} textAnchor="middle" fill="var(--pencil-val)" fontSize={svgFontSize} fontFamily="var(--font-code), monospace">{tick}</text>
              </g>
            ))}
            <line x1={chart.left} x2={chart.left} y1={chart.top} y2={chart.height - chart.bottom} stroke="var(--ink-val)" strokeOpacity="0.28" />
            <line x1={chart.left} x2={chart.width - chart.right} y1={chart.height - chart.bottom} y2={chart.height - chart.bottom} stroke="var(--ink-val)" strokeOpacity="0.28" />
            <text x="17" y={(chart.top + chart.height - chart.bottom) / 2} transform={`rotate(-90 17 ${(chart.top + chart.height - chart.bottom) / 2})`} textAnchor="middle" fill="var(--pencil-val)" fontSize={svgFontSize} fontFamily="var(--font-code), monospace">R² STATISTIC (%)</text>
            <text x={(chart.left + chart.width - chart.right) / 2} y={chart.height - 9} textAnchor="middle" fill="var(--pencil-val)" fontSize={svgFontSize} fontFamily="var(--font-code), monospace">NOISE PREDICTORS ADDED</text>
            <polygon points={divergenceArea} fill="var(--accent-val)" fillOpacity="0.07" />
            <polyline points={rSquaredPoints} fill="none" stroke="var(--ink-val)" strokeWidth="3" strokeOpacity="1" strokeLinejoin="round" strokeLinecap="round" />
            <polyline points={adjustedPoints} fill="none" stroke="var(--accent-val)" strokeWidth="3" strokeOpacity="1" strokeLinejoin="round" strokeLinecap="round" />
            <motion.line
              x1={xAt(noisePredictors)}
              x2={xAt(noisePredictors)}
              y1={chart.top}
              y2={chart.height - chart.bottom}
              stroke="var(--ink-val)"
              strokeOpacity="0.24"
              strokeDasharray="3 5"
              animate={{ x1: xAt(noisePredictors), x2: xAt(noisePredictors) }}
              transition={markerTransition}
            />
            <motion.circle cx={xAt(noisePredictors)} cy={yAt(fit.rSquared)} r="6" fill="var(--ink-val)" stroke="var(--paper-val)" strokeWidth="2" animate={{ cx: xAt(noisePredictors), cy: yAt(fit.rSquared) }} transition={markerTransition} />
            <motion.circle cx={xAt(noisePredictors)} cy={yAt(fit.adjustedRSquared)} r="6" fill="var(--accent-val)" stroke="var(--paper-val)" strokeWidth="2" animate={{ cx: xAt(noisePredictors), cy: yAt(fit.adjustedRSquared) }} transition={markerTransition} />
          </svg>

          <details className="mt-2 border-t border-ink/10 pt-2 text-sm leading-relaxed text-tertiary">
            <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider">Simulation details</summary>
            <p className="mt-2">Weak accidental correlations, n = {SAMPLE_SIZE}; p counts predictors.</p>
            <SafeLatex content="$$R^2_{\mathrm{adj}} = 1 - \frac{(1 - R^2)(n - 1)}{n - p - 1}$$" />
          </details>
        </div>
      </div>
    </EditorialPlate>
  );
}
