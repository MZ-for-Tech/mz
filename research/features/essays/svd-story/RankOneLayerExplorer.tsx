'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import SafeLatex from '@/research/components/SafeLatex';
import { researchMotionTransition } from '@/research/lib/motion';

type Matrix = number[][];
type Props = { original: Matrix; components: Matrix[]; singularValues: number[]; locale: 'en' | 'ar' };

const labels = {
  en: { layers: 'Singular layers', layer: 'Layer', selected: 'Selected layer', add: 'Add layer to the sum', remove: 'Remove layer from the sum', stack: 'Current layer sum', error: 'Frobenius error', included: 'in sum', left: 'Left direction u', right: 'Right direction vᵀ', zero: 'No layers in the sum' },
  ar: { layers: 'الطبقات المفردة', layer: 'الطبقة', selected: 'الطبقة المحددة', add: 'أضف الطبقة إلى المجموع', remove: 'أزل الطبقة من المجموع', stack: 'مجموع الطبقات الحالي', error: 'خطأ فروبينيوس', included: 'في المجموع', left: 'اتجاه الخرج u', right: 'اتجاه الدخل vᵀ', zero: 'لا توجد طبقات في المجموع' },
} as const;

const fmt = (value: number) => Number(value.toFixed(2)).toString();

function Heatmap({ matrix, reduceMotion }: { matrix: Matrix; reduceMotion: boolean }) {
  const max = Math.max(1e-8, ...matrix.flat().map(Math.abs));
  return <div className="svd-heatmap svd-layer-heatmap" style={{ gridTemplateColumns: `repeat(${matrix[0]?.length || 1}, minmax(2.25rem, 1fr))` }}>
    {matrix.flat().map((value, index) => <motion.span key={index} title={fmt(value)} initial={false} animate={{ backgroundColor: value >= 0 ? `rgba(153, 61, 43, ${0.06 + .34 * Math.abs(value) / max})` : `rgba(50, 85, 120, ${0.06 + .34 * Math.abs(value) / max})` }} transition={{ duration: reduceMotion ? 0 : 0.28 }}>
      {fmt(value)}
    </motion.span>)}
  </div>;
}

function factorVectors(matrix: Matrix, sigma: number) {
  const columnNorms = matrix[0].map((_, column) => Math.sqrt(matrix.reduce((sum, row) => sum + row[column] ** 2, 0)));
  const pivotColumn = columnNorms.indexOf(Math.max(...columnNorms));
  const norm = columnNorms[pivotColumn] || 1;
  const left = matrix.map((row) => row[pivotColumn] / norm);
  const right = matrix[0].map((_, column) => matrix.reduce((sum, row, index) => sum + left[index] * row[column], 0) / (sigma || 1));
  return { left, right };
}

function VectorCells({ values, vertical }: { values: number[]; vertical?: boolean }) {
  const max = Math.max(1, ...values.map(Math.abs));
  return <div className={`svd-layer-vector${vertical ? ' is-vertical' : ''}`}>
    {values.map((value, index) => <span key={index} style={{ backgroundColor: `color-mix(in srgb, var(--accent-val) ${Math.round(28 * Math.abs(value) / max)}%, var(--paper-val))` }}>{fmt(value)}</span>)}
  </div>;
}

export default function RankOneLayerExplorer({ original, components, singularValues, locale }: Props) {
  const text = labels[locale];
  const reduceMotion = Boolean(useReducedMotion());
  const [selected, setSelected] = useState(0);
  const [included, setIncluded] = useState<number[]>([0, 1]);
  const layer = components[selected];
  if (!layer) return null;

  const sum = original.map((row, rowIndex) => row.map((_, columnIndex) => included.reduce((total, index) => total + (components[index]?.[rowIndex]?.[columnIndex] || 0), 0)));
  const error = Math.sqrt(original.reduce((total, row, rowIndex) => total + row.reduce((rowTotal, value, columnIndex) => rowTotal + (value - sum[rowIndex][columnIndex]) ** 2, 0), 0));
  const vectors = factorVectors(layer, singularValues[selected]);
  const isIncluded = included.includes(selected);
  const toggleIncluded = () => setIncluded((current) => isIncluded ? current.filter((index) => index !== selected) : [...current, selected].sort((a, b) => a - b));

  return <div className="svd-rank-one" dir="ltr">
    <div className="svd-rank-one-layers" role="group" aria-label={text.layers}>
      {components.map((_, index) => <button type="button" key={index} aria-label={`${text.layer} ${index + 1}, σ${index + 1} ${fmt(singularValues[index])}, ${included.includes(index) ? text.included : locale === 'ar' ? 'خارج المجموع' : 'not in sum'}`} aria-pressed={selected === index} className={`${selected === index ? 'is-selected ' : ''}${included.includes(index) ? 'is-included' : ''}`} onClick={() => setSelected(index)}>
        <span className="svd-rank-one-layer-number">R{index + 1}</span>
        <span className="svd-rank-one-layer-strength">σ{index + 1} = {fmt(singularValues[index])}</span>
        <span className="svd-rank-one-layer-status">{included.includes(index) ? '✓' : '·'}</span>
      </button>)}
    </div>

    <motion.section key={`layer-${selected}`} className="svd-rank-one-selected" initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={researchMotionTransition(reduceMotion)}>
      <div className="svd-rank-one-selected-heading">
        <span>{text.selected} · R{selected + 1}</span>
        <SafeLatex content={`$$R_{${selected + 1}} = ${fmt(singularValues[selected])}\\,u_{${selected + 1}}v_{${selected + 1}}^T$$`} />
        <button type="button" aria-pressed={isIncluded} onClick={toggleIncluded}>{isIncluded ? text.remove : text.add}</button>
      </div>
      <div className="svd-rank-one-outer-product">
        <div><span>{text.left}</span><VectorCells values={vectors.left} vertical /></div>
        <b aria-hidden="true">× {fmt(singularValues[selected])} ×</b>
        <div><span>{text.right}</span><VectorCells values={vectors.right} /></div>
        <b aria-hidden="true">=</b>
        <Heatmap matrix={layer} reduceMotion={reduceMotion} />
      </div>
    </motion.section>

    <div className="svd-rank-one-sum">
      <div className="svd-rank-one-sum-heading">
        <span>{text.stack} · {included.length} {text.included}</span>
        <strong>{text.error}: {error.toFixed(2)}</strong>
      </div>
      {included.length ? <Heatmap matrix={sum} reduceMotion={reduceMotion} /> : <p>{text.zero}</p>}
    </div>
  </div>;
}
