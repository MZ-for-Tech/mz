'use client';

import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import SafeLatex from '@/research/components/SafeLatex';
import { researchMotionTransition } from '@/research/lib/motion';

type Props = { singularValues: number[]; locale: 'en' | 'ar' };

const labels = {
  en: { rank: 'Retained rank k', energy: 'Energy retained', error: 'Frobenius error', xAxis: 'Component index i', yAxis: 'Singular value σᵢ', retained: 'Retained', discarded: 'Discarded' },
  ar: { rank: 'الرتبة المحتفظ بها k', energy: 'الطاقة المحتفظ بها', error: 'خطأ فروبينيوس', xAxis: 'رقم المركبة i', yAxis: 'القيمة المفردة σᵢ', retained: 'محتفظ بها', discarded: 'مستبعدة' },
} as const;

const fmt = (value: number) => Number(value.toFixed(2)).toString();

export default function SingularSpectrumExplorer({ singularValues, locale }: Props) {
  const text = labels[locale];
  const reduceMotion = Boolean(useReducedMotion());
  const inputId = useId();
  const [rank, setRank] = useState(Math.min(2, singularValues.length));
  const maxRank = singularValues.length;
  if (!maxRank) return null;
  const k = Math.max(1, Math.min(rank, maxRank));
  const maxValue = Math.max(...singularValues, 1);
  const totalEnergy = singularValues.reduce((sum, value) => sum + value * value, 0) || 1;
  const retainedEnergy = 100 * singularValues.slice(0, k).reduce((sum, value) => sum + value * value, 0) / totalEnergy;
  const error = Math.sqrt(singularValues.slice(k).reduce((sum, value) => sum + value * value, 0));

  const left = 78;
  const right = 614;
  const top = 34;
  const bottom = 286;
  const plotWidth = right - left;
  const plotHeight = bottom - top;
  const xFor = (index: number) => maxRank < 2 ? (left + right) / 2 : left + (plotWidth * index) / (maxRank - 1);
  const yFor = (value: number) => bottom - (value / (maxValue * 1.12)) * plotHeight;
  const points = singularValues.map((value, index) => ({ x: xFor(index), y: yFor(value), value, index }));
  const cutoff = k >= maxRank ? right : (xFor(k - 1) + xFor(k)) / 2;

  return <div className="svd-spectrum-explorer" dir="ltr">
    <div className="svd-spectrum-legend" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <span><i className="is-retained" />{text.retained}</span>
      <span><i />{text.discarded}</span>
    </div>
    <div className="svd-spectrum-chart">
      <svg viewBox="0 0 640 360" role="img" aria-label={locale === 'ar' ? 'مخطط القيم المفردة حسب رقم المركبة' : 'Scree plot of singular values by component'}>
        {[0, 0.5, 1].map((fraction) => {
          const y = bottom - fraction * plotHeight;
          return <g key={fraction}>
            <line className="svd-spectrum-gridline" x1={left} y1={y} x2={right} y2={y} />
            <text className="svd-spectrum-tick" x={left - 12} y={y + 4} textAnchor="end">{fmt(fraction * maxValue * 1.12)}</text>
          </g>;
        })}
        {cutoff < right && <rect className="svd-spectrum-discarded-region" x={cutoff} y={top} width={right - cutoff} height={plotHeight} />}
        <line className="svd-spectrum-axis" x1={left} y1={top} x2={left} y2={bottom} />
        <line className="svd-spectrum-axis" x1={left} y1={bottom} x2={right} y2={bottom} />
        {points.slice(0, -1).map((point, index) => {
          const next = points[index + 1];
          return <motion.line key={point.index} className={index < k - 1 ? 'svd-spectrum-segment is-retained' : 'svd-spectrum-segment'} x1={point.x} y1={point.y} x2={next.x} y2={next.y} initial={false} animate={{ stroke: index < k - 1 ? 'var(--accent-val)' : 'var(--pencil-val)' }} transition={researchMotionTransition(reduceMotion)} />;
        })}
        {points.map((point) => <g key={point.index}>
          <motion.circle className={point.index < k ? 'svd-spectrum-point is-retained' : 'svd-spectrum-point'} cx={point.x} cy={point.y} r={point.index < k ? 5 : 4} initial={false} animate={{ cy: point.y, fill: point.index < k ? 'var(--accent-val)' : 'var(--paper-val)', stroke: point.index < k ? 'var(--accent-val)' : 'var(--pencil-val)' }} transition={researchMotionTransition(reduceMotion)} />
          <text className="svd-spectrum-value" x={point.x} y={point.y - 12} textAnchor="middle">{fmt(point.value)}</text>
          <text className="svd-spectrum-tick" x={point.x} y={bottom + 22} textAnchor="middle">{point.index + 1}</text>
        </g>)}
        <line className="svd-spectrum-cutoff" x1={cutoff} y1={top} x2={cutoff} y2={bottom} />
        <text className="svd-spectrum-cutoff-label" x={Math.min(right - 4, Math.max(left + 4, cutoff))} y={top - 10} textAnchor={cutoff >= right ? 'end' : 'middle'}>k = {k}</text>
        <text className="svd-spectrum-axis-label" x={(left + right) / 2} y="345" textAnchor="middle">{text.xAxis}</text>
        <text className="svd-spectrum-axis-label" x="18" y={(top + bottom) / 2} textAnchor="middle" transform={`rotate(-90 18 ${(top + bottom) / 2})`}>{text.yAxis}</text>
      </svg>
    </div>

    <div className="svd-spectrum-control" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <label htmlFor={inputId}>{text.rank}<output>{k} / {maxRank}</output></label>
      <input id={inputId} type="range" min="1" max={maxRank} step="1" value={k} aria-valuetext={`${text.rank} ${k} / ${maxRank}`} onChange={(event) => setRank(Number(event.target.value))} />
    </div>

    <div className="svd-spectrum-stats">
      <div><span>{text.energy}</span><strong>{retainedEnergy.toFixed(1)}%</strong></div>
      <div><span>{text.error}</span><strong>{error.toFixed(2)}</strong></div>
    </div>
    <div className="svd-spectrum-equation"><SafeLatex content="$$\|A-A_k\|_F = \sqrt{\sum_{i>k}\sigma_i^2}$$" /></div>
  </div>;
}
