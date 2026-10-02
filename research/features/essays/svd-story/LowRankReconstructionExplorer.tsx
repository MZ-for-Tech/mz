'use client';

import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import SafeLatex from '@/research/components/SafeLatex';
import { researchMotionTransition } from '@/research/lib/motion';

type Matrix = number[][];
type Props = { original: Matrix; reconstructions: Matrix[]; locale: 'en' | 'ar' };

const labels = {
  en: { rank: 'Retained rank', original: 'Original A', approximation: 'Approximation Aₖ', residual: 'Residual A − Aₖ', error: 'Frobenius error', scale: 'Shared color scale', of: 'of', noData: 'No reconstruction data is available.' },
  ar: { rank: 'الرتبة المحتفظ بها', original: 'المصفوفة الأصلية A', approximation: 'التقريب Aₖ', residual: 'الباقي A − Aₖ', error: 'خطأ فروبينيوس', scale: 'مقياس الألوان المشترك', of: 'من', noData: 'لا تتوفر بيانات إعادة البناء.' },
} as const;

const fmt = (value: number) => Number(value.toFixed(2)).toString();

function MatrixHeatmap({ matrix, label, scale, reduceMotion }: { matrix: Matrix; label: string; scale: number; reduceMotion: boolean }) {
  return <table className="svd-reconstruction-matrix" aria-label={label}>
    <tbody>{matrix.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, columnIndex) => {
      const opacity = 0.04 + 0.86 * Math.min(1, Math.abs(value) / scale);
      const color = value < 0 ? `rgba(50, 85, 120, ${opacity})` : `rgba(153, 61, 43, ${opacity})`;
      return <td key={columnIndex}>
        <motion.span title={fmt(value)} initial={false} animate={{ backgroundColor: color }} transition={researchMotionTransition(reduceMotion)}>{fmt(value)}</motion.span>
      </td>;
    })}</tr>)}</tbody>
  </table>;
}

export default function LowRankReconstructionExplorer({ original, reconstructions, locale }: Props) {
  const text = labels[locale];
  const reduceMotion = Boolean(useReducedMotion());
  const inputId = useId();
  const [rank, setRank] = useState(1);
  const maxRank = reconstructions.length;
  const k = Math.max(1, Math.min(rank, maxRank));
  const approximation = reconstructions[k - 1];
  if (!approximation || maxRank === 0) return <p>{text.noData}</p>;

  const residual = original.map((row, rowIndex) => row.map((value, columnIndex) => value - approximation[rowIndex][columnIndex]));
  const error = Math.sqrt(residual.flat().reduce((sum, value) => sum + value * value, 0));
  const sharedScale = Math.max(1e-8, ...original.flat().map(Math.abs));
  const equation = `$$A_{${k}} = \\sum_{i=1}^{${k}} \\sigma_i u_i v_i^T$$`;

  return <div className="svd-low-rank-reconstruction" dir="ltr">
    <div className="svd-low-rank-control" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <label htmlFor={inputId}>{text.rank}<output>{k} / {maxRank}</output></label>
      <input id={inputId} type="range" min="1" max={maxRank} step="1" value={k} aria-valuetext={`${text.rank} ${k} ${text.of} ${maxRank}`} onChange={(event) => setRank(Number(event.target.value))} />
    </div>

    <div className="svd-low-rank-equation"><SafeLatex content={equation} /></div>

    <div className="svd-reconstruction-matrices">
      <figure>
        <figcaption>{text.original}</figcaption>
        <MatrixHeatmap matrix={original} label={text.original} scale={sharedScale} reduceMotion={reduceMotion} />
      </figure>
      <figure>
        <figcaption>{text.approximation}</figcaption>
        <MatrixHeatmap matrix={approximation} label={text.approximation} scale={sharedScale} reduceMotion={reduceMotion} />
      </figure>
      <figure>
        <figcaption>{text.residual}</figcaption>
        <MatrixHeatmap matrix={residual} label={text.residual} scale={sharedScale} reduceMotion={reduceMotion} />
      </figure>
    </div>

    <div className="svd-low-rank-color-key" aria-label={`${text.scale}: -${fmt(sharedScale)} to ${fmt(sharedScale)}`}>
      <span>{text.scale}</span>
      <div><small>−{fmt(sharedScale)}</small><i aria-hidden="true" /><small>0</small><small>+{fmt(sharedScale)}</small></div>
    </div>

    <div className="svd-low-rank-error" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <SafeLatex content="\\|A-A_k\\|_F" />
      <strong>{error.toFixed(2)}</strong>
    </div>
  </div>;
}
