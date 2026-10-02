'use client';

import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { researchMotionTransition } from '@/research/lib/motion';

type Props = { m: number; n: number; defaultRank: number; maxRank: number; originalParams: number; locale: 'en' | 'ar' };

const copy = {
  en: { rank: 'Bottleneck rank k', dense: 'Dense layer', factored: 'Two-factor layer', input: 'Input', output: 'Output', hidden: 'Compressed representation', denseWeights: 'Dense weights', factoredWeights: 'Factor weights', change: 'Parameter count change', fewer: 'fewer parameters', more: 'more parameters', aria: 'Dense layer and its low-rank two-layer approximation' },
  ar: { rank: 'رتبة عنق الزجاجة k', dense: 'طبقة كثيفة', factored: 'طبقة من عاملين', input: 'المدخلات', output: 'المخرجات', hidden: 'تمثيل مضغوط', denseWeights: 'أوزان الطبقة الكثيفة', factoredWeights: 'أوزان العاملين', change: 'التغير في عدد المعاملات', fewer: 'معاملات أقل', more: 'معاملات أكثر', aria: 'طبقة كثيفة وتقريبها منخفض الرتبة المكوّن من طبقتين' },
} as const;

function nodeYs(count: number, center: number, spread: number) {
  return Array.from({ length: count }, (_, index) => center + (index - (count - 1) / 2) * spread);
}

export default function NeuralNetworkSVDExplorer({ m, n, defaultRank, maxRank, originalParams, locale }: Props) {
  const text = copy[locale];
  const reduceMotion = Boolean(useReducedMotion());
  const inputId = useId();
  const [rank, setRank] = useState(Math.max(1, Math.min(defaultRank, maxRank)));
  const k = Math.max(1, Math.min(rank, maxRank));
  const factorParams = k * (m + n);
  const saved = 100 * (1 - factorParams / originalParams);
  const visibleHidden = Math.min(7, Math.max(1, Math.ceil(k / Math.max(1, maxRank / 7))));
  const inputYs = nodeYs(5, 129, 36);
  const outputYs = nodeYs(5, 129, 36);
  const hiddenYs = nodeYs(visibleHidden, 129, Math.min(30, 126 / Math.max(1, visibleHidden - 1)));
  const transition = researchMotionTransition(reduceMotion);

  return <div className="svd-nn-explorer" dir="ltr">
    <svg className="svd-nn-diagram" viewBox="0 0 800 260" role="img" aria-label={text.aria}>
      <text className="svd-nn-heading" x="170" y="24" textAnchor="middle">{text.dense}</text>
      <text className="svd-nn-heading" x="582" y="24" textAnchor="middle">{text.factored}</text>
      <text className="svd-nn-math" x="170" y="48" textAnchor="middle">W ∈ ℝᵐˣⁿ</text>
      <text className="svd-nn-math" x="582" y="48" textAnchor="middle">W ≈ UₖΣₖVₖᵀ</text>

      {inputYs.flatMap((y, i) => outputYs.map((targetY, j) => <line key={`dense-${i}-${j}`} className="svd-nn-wire is-dense" x1="54" y1={y} x2="286" y2={targetY} />))}
      {inputYs.map((y, index) => <circle key={`dense-input-${index}`} className="svd-nn-node is-dense" cx="54" cy={y} r="5" />)}
      {outputYs.map((y, index) => <circle key={`dense-output-${index}`} className="svd-nn-node is-dense" cx="286" cy={y} r="5" />)}
      <text className="svd-nn-dimension" x="54" y="239" textAnchor="middle">{text.input} · n = {n}</text>
      <text className="svd-nn-dimension" x="286" y="239" textAnchor="middle">{text.output} · m = {m}</text>

      {inputYs.flatMap((y, i) => hiddenYs.map((targetY, j) => <motion.line key={`left-${k}-${i}-${j}`} className="svd-nn-wire is-factor" x1="430" y1={y} x2="565" y2={targetY} initial={false} animate={{ opacity: 0.18 + 0.4 * (1 - j / Math.max(1, visibleHidden)) }} transition={transition} />))}
      {hiddenYs.flatMap((y, i) => outputYs.map((targetY, j) => <motion.line key={`right-${k}-${i}-${j}`} className="svd-nn-wire is-factor-secondary" x1="565" y1={y} x2="700" y2={targetY} initial={false} animate={{ opacity: 0.18 + 0.4 * (1 - i / Math.max(1, visibleHidden)) }} transition={transition} />))}
      {inputYs.map((y, index) => <circle key={`factored-input-${index}`} className="svd-nn-node is-factor" cx="430" cy={y} r="5" />)}
      {hiddenYs.map((y, index) => <motion.circle key={`hidden-${k}-${index}`} className="svd-nn-node is-hidden" cx="565" cy={y} r="6" initial={reduceMotion ? false : { opacity: 0.35, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={transition} />)}
      {outputYs.map((y, index) => <circle key={`factored-output-${index}`} className="svd-nn-node is-factor-secondary" cx="700" cy={y} r="5" />)}
      <text className="svd-nn-dimension" x="430" y="239" textAnchor="middle">{text.input} · n = {n}</text>
      <text className="svd-nn-dimension" x="565" y="239" textAnchor="middle">k = {k}</text>
      <text className="svd-nn-dimension" x="700" y="239" textAnchor="middle">{text.output} · m = {m}</text>
      <text className="svd-nn-factor-label" x="495" y="82" textAnchor="middle">Vₖᵀ</text>
      <text className="svd-nn-factor-label" x="632" y="82" textAnchor="middle">UₖΣₖ</text>
      <text className="svd-nn-ellipsis" x="565" y={hiddenYs[hiddenYs.length - 1] + 19} textAnchor="middle">{k > visibleHidden ? '···' : ''}</text>
    </svg>

    <div className="svd-nn-control" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <label htmlFor={inputId}><span>{text.rank}</span><output>{k} / {maxRank}</output></label>
      <input id={inputId} type="range" min="1" max={maxRank} step="1" value={k} aria-valuetext={`${text.rank} ${k} / ${maxRank}`} onChange={(event) => setRank(Number(event.target.value))} />
    </div>

    <div className="svd-nn-parameter-compare" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="svd-nn-parameter-row"><span>{text.denseWeights}</span><strong>{originalParams.toLocaleString(locale === 'ar' ? 'ar' : 'en')}</strong><div className="svd-nn-bar-track"><i className="is-dense" /></div></div>
      <div className="svd-nn-parameter-row"><span>{text.factoredWeights}</span><strong>{factorParams.toLocaleString(locale === 'ar' ? 'ar' : 'en')}</strong><div className="svd-nn-bar-track"><i className="is-factor" style={{ width: `${Math.max(0, Math.min(100, 100 * factorParams / originalParams))}%` }} /></div></div>
      <div className="svd-nn-savings"><span>{text.change}</span><strong>{Math.abs(saved).toFixed(1)}% {saved >= 0 ? text.fewer : text.more}</strong></div>
    </div>
  </div>;
}
