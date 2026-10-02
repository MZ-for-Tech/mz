'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { researchMotionTransition } from '@/research/lib/motion';

type Matrix = number[][];
type Factor = { label: string; matrix: Matrix; role: string };
type Decomposition = { name: string; formula: string; matrix: Matrix; factors: Factor[]; why: string };
type Props = { items: Decomposition[]; locale: 'en' | 'ar'; ui: Record<string, string> };

const labels = {
  en: {
    methods: 'Choose a factorization',
    original: 'Original A',
    factorRole: 'Factor role',
    rebuild: 'Rebuild A',
    rebuilt: 'Reconstructed A',
    error: 'Reconstruction error',
    inspect: 'Select an entry to see its dot product.',
    entry: 'Entry',
    row: 'row',
    column: 'column',
  },
  ar: {
    methods: 'اختر نوع التفكيك',
    original: 'المصفوفة الأصلية A',
    factorRole: 'دور العامل',
    rebuild: 'أعد بناء A',
    rebuilt: 'المصفوفة المعاد بناؤها',
    error: 'خطأ إعادة البناء',
    inspect: 'اختر عنصرًا لتتبّع حاصل ضربه النقطي.',
    entry: 'العنصر',
    row: 'صف',
    column: 'عمود',
  },
} as const;

const fmt = (value: number) => Number(value.toFixed(2)).toString();

function multiply(left: Matrix, right: Matrix): Matrix {
  return left.map((row) => right[0].map((_, column) => row.reduce((sum, value, index) => sum + value * right[index][column], 0)));
}

function MatrixGrid({
  matrix,
  label,
  interactive = false,
  selectedCell,
  onCellSelect,
  maxValue,
  rowLabel = labels.en.row,
  columnLabel = labels.en.column,
}: {
  matrix: Matrix;
  label: string;
  interactive?: boolean;
  selectedCell?: [number, number];
  onCellSelect?: (row: number, column: number) => void;
  maxValue: number;
  rowLabel?: string;
  columnLabel?: string;
}) {
  return <table className="svd-decomp-matrix" aria-label={label}>
    <tbody>{matrix.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, columnIndex) => {
      const strength = Math.round(24 * Math.abs(value) / (maxValue || 1));
      const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === columnIndex;
      return <td key={columnIndex}>
        {interactive
          ? <button type="button" className={isSelected ? 'is-selected' : ''} style={{ backgroundColor: `color-mix(in srgb, var(--accent-val) ${strength}%, var(--paper-val))` }} aria-label={`${label}, ${rowLabel} ${rowIndex + 1}, ${columnLabel} ${columnIndex + 1}: ${fmt(value)}`} aria-pressed={isSelected} onClick={() => onCellSelect?.(rowIndex, columnIndex)}>
            {fmt(value)}
          </button>
          : <span style={{ backgroundColor: `color-mix(in srgb, var(--accent-val) ${strength}%, var(--paper-val))` }}>{fmt(value)}</span>}
      </td>;
    })}</tr>)}</tbody>
  </table>;
}

export default function DecompositionGallery({ items, locale, ui }: Props) {
  const text = labels[locale];
  const reduceMotion = Boolean(useReducedMotion());
  const [selected, setSelected] = useState(0);
  const [factorSelected, setFactorSelected] = useState(0);
  const [rebuilt, setRebuilt] = useState(false);
  const [selectedCell, setSelectedCell] = useState<[number, number]>([0, 0]);
  const decomposition = items[selected] || items[0];
  if (!decomposition || decomposition.factors.length < 2) return null;

  const factors = decomposition.factors;
  const output = factors.slice(1).reduce((result, factor) => multiply(result, factor.matrix), factors[0].matrix);
  const maxValue = Math.max(1, ...decomposition.matrix.flat().map(Math.abs), ...output.flat().map(Math.abs), ...factors.flatMap((factor) => factor.matrix.flat().map(Math.abs)));
  const error = Math.sqrt(decomposition.matrix.flat().reduce((sum, value, index) => sum + (value - output.flat()[index]) ** 2, 0));
  const [rowIndex, columnIndex] = selectedCell;
  const partialFactors = factors.slice(0, -1).map((factor) => factor.matrix);
  const leftPartial = partialFactors.slice(1).reduce((result, matrix) => multiply(result, matrix), partialFactors[0]);
  const lastFactor = factors[factors.length - 1].matrix;
  const row = leftPartial[rowIndex] || [];
  const column = lastFactor.map((factorRow) => factorRow[columnIndex]);
  const dotTerms = row.map((value, index) => `${fmt(value)} × ${fmt(column[index])}`);
  const computedCell = output[rowIndex]?.[columnIndex] ?? 0;
  const activeFactor = factors[Math.min(factorSelected, factors.length - 1)];
  const changeDecomposition = (index: number) => {
    setSelected(index);
    setFactorSelected(0);
    setRebuilt(false);
    setSelectedCell([0, 0]);
  };

  return <div className="svd-decomposition" dir="ltr">
    <div className="svd-decomposition-methods" role="group" aria-label={text.methods}>
      {items.map((item, index) => <button type="button" key={item.name} aria-pressed={selected === index} onClick={() => changeDecomposition(index)}>{item.name}</button>)}
    </div>

    <motion.p key={`why-${selected}`} className="svd-decomposition-why" dir={locale === 'ar' ? 'rtl' : 'ltr'} initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={researchMotionTransition(reduceMotion)}>{decomposition.why}</motion.p>

    <div className="svd-decomposition-expression">
      <div className="svd-decomposition-original">
        <span className="svd-decomposition-label">{ui.originalMatrix || text.original}</span>
        <MatrixGrid matrix={decomposition.matrix} label={ui.originalMatrix || text.original} maxValue={maxValue} />
      </div>
      <span className="svd-decomposition-equals" aria-hidden="true">=</span>
      <div className="svd-decomposition-factors">
        {factors.map((factor, index) => <div className="svd-decomposition-factor-wrap" key={`${selected}-${factor.label}`}>
          <div className={`svd-decomposition-factor-card${factorSelected === index ? ' is-selected' : ''}`}>
            {factorSelected === index && <motion.span className="svd-decomposition-factor-active" layoutId="svd-decomposition-active" transition={researchMotionTransition(reduceMotion)} />}
            <button type="button" className="svd-decomposition-factor" aria-pressed={factorSelected === index} onClick={() => setFactorSelected(index)}>{factor.label}</button>
            <MatrixGrid matrix={factor.matrix} label={`${factor.label} factor`} maxValue={maxValue} />
          </div>
          {index < factors.length - 1 && <span className="svd-decomposition-times" aria-hidden="true">×</span>}
        </div>)}
      </div>
    </div>

    <motion.div key={`role-${selected}-${factorSelected}`} className="svd-decomposition-role" dir={locale === 'ar' ? 'rtl' : 'ltr'} initial={reduceMotion ? false : { opacity: 0, x: locale === 'ar' ? 5 : -5 }} animate={{ opacity: 1, x: 0 }} transition={researchMotionTransition(reduceMotion)}>
      <span>{text.factorRole} · {activeFactor.label}</span>
      <p>{activeFactor.role}</p>
    </motion.div>

    <div className="svd-decomposition-rebuild-row">
      <button type="button" className="svd-decomposition-rebuild" aria-pressed={rebuilt} onClick={() => setRebuilt((value) => !value)}>
        <motion.span animate={{ rotate: rebuilt ? 45 : 0 }} transition={researchMotionTransition(reduceMotion)}>+</motion.span>
        {rebuilt ? (ui.rebuiltMatrix || text.rebuilt) : (ui.rebuild || text.rebuild)}
      </button>
      {rebuilt && <motion.span className="svd-decomposition-error" initial={reduceMotion ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={researchMotionTransition(reduceMotion)}>
        {ui.reconstructionError || text.error}: {error.toExponential(1)}
      </motion.span>}
    </div>

    {rebuilt && <motion.section className="svd-decomposition-result" aria-label={ui.rebuiltMatrix || text.rebuilt} initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={researchMotionTransition(reduceMotion)}>
      <div className="svd-decomposition-result-head">
        <span>{decomposition.formula}</span>
        <p dir={locale === 'ar' ? 'rtl' : 'ltr'}>{text.inspect}</p>
      </div>
      <MatrixGrid matrix={output} label={ui.rebuiltMatrix || text.rebuilt} interactive selectedCell={selectedCell} onCellSelect={(rowNumber, columnNumber) => setSelectedCell([rowNumber, columnNumber])} maxValue={maxValue} rowLabel={text.row} columnLabel={text.column} />
      <div className="svd-decomposition-calculation" dir="ltr" aria-live="polite">
        <span>{text.entry} A<sub>{rowIndex + 1},{columnIndex + 1}</sub></span>
        <code>{dotTerms.join(' + ')} = {fmt(computedCell)}</code>
      </div>
    </motion.section>}
  </div>;
}
