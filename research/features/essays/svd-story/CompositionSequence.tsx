'use client';

import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { researchMotionTransition } from '@/research/lib/motion';
import DiscreteStageScrubber from '@/research/features/essays/shared/DiscreteStageScrubber';

type Matrix2 = [[number, number], [number, number]];
type Props = { matrices: { A: Matrix2; B: Matrix2; C: Matrix2 }; initialVector: number[]; locale: 'en' | 'ar' };

const labels = {
  en: {
    chain: 'Transformation chain',
    coordinatePlane: 'Input grid transformed by each matrix in the chain',
    input: 'Input',
    afterC: 'After C',
    afterB: 'After B',
    output: 'Output',
    factors: ['First · C', 'Then · B', 'Finally · A'],
    vector: 'Input vector',
    x: 'Horizontal component',
    y: 'Vertical component',
    value: 'Current vector',
  },
  ar: {
    chain: 'تتابع التحويلات',
    coordinatePlane: 'شبكة الدخل بعد تطبيق المصفوفات بالتتابع',
    input: 'الدخل',
    afterC: 'بعد C',
    afterB: 'بعد B',
    output: 'الناتج',
    factors: ['أولًا · C', 'ثم · B', 'أخيرًا · A'],
    vector: 'متجهة الدخل',
    x: 'المركبة الأفقية',
    y: 'المركبة الرأسية',
    value: 'المتجهة الحالية',
  },
} as const;

const fmt = (value: number) => Number(value.toFixed(2)).toString();
const multiply = (left: Matrix2, right: Matrix2): Matrix2 => [
  [left[0][0] * right[0][0] + left[0][1] * right[1][0], left[0][0] * right[0][1] + left[0][1] * right[1][1]],
  [left[1][0] * right[0][0] + left[1][1] * right[1][0], left[1][0] * right[0][1] + left[1][1] * right[1][1]],
];
const apply = (matrix: Matrix2, vector: number[]) => matrix.map((row) => row[0] * vector[0] + row[1] * vector[1]);

function MatrixTile({ matrix }: { matrix: Matrix2 }) {
  return <span className="svd-composition-matrix" role="img" aria-label={`${fmt(matrix[0][0])}, ${fmt(matrix[0][1])}; ${fmt(matrix[1][0])}, ${fmt(matrix[1][1])}`}>
    <span>{matrix.map((row, i) => <span className="svd-composition-matrix-row" key={i}>{row.map((value, j) => <span key={j}>{fmt(value)}</span>)}</span>)}</span>
  </span>;
}

export default function CompositionSequence({ matrices, initialVector, locale }: Props) {
  const text = labels[locale];
  const reduceMotion = Boolean(useReducedMotion());
  const xId = useId();
  const yId = useId();
  const [vector, setVector] = useState(initialVector);
  const [stage, setStage] = useState(0);
  const transition = researchMotionTransition(reduceMotion);
  const transforms: Matrix2[] = [
    [[1, 0], [0, 1]],
    matrices.C,
    multiply(matrices.B, matrices.C),
    multiply(matrices.A, multiply(matrices.B, matrices.C)),
  ];
  const outputs = transforms.map((transform) => apply(transform, vector));
  const current = outputs[stage];
  const stageNames = [text.input, text.afterC, text.afterB, text.output];
  const cx = 260;
  const cy = 175;
  const scale = 40;
  const toSvg = ([x, y]: number[]) => [cx + x * scale, cy - y * scale] as const;
  const gridOffsets = [-2, -1, 0, 1, 2];
  const gridPath = (vertical: boolean, offset: number, matrix: Matrix2) => {
    const start = vertical ? [offset, -2] : [-2, offset];
    const end = vertical ? [offset, 2] : [2, offset];
    const first = toSvg(apply(matrix, start));
    const last = toSvg(apply(matrix, end));
    return `M ${first[0]} ${first[1]} L ${last[0]} ${last[1]}`;
  };
  const [vx, vy] = toSvg(current);
  const factorMatrices = [matrices.C, matrices.B, matrices.A];
  const factorNames = ['C', 'B', 'A'];

  return <div className="svd-composition" dir="ltr">
    <div className="svd-composition-heading">
      <span>{text.chain}</span>
      <strong>x <i>→</i> Cx <i>→</i> BCx <i>→</i> ABCx</strong>
    </div>

    <div className="svd-composition-main">
      <div className="svd-composition-plot">
        <svg viewBox="0 0 520 350" role="img" aria-label={text.coordinatePlane}>
          <defs>
            <marker id="svd-composition-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="strokeWidth">
              <path className="svd-composition-arrow" d="M 0 0 L 8 4 L 0 8 z" />
            </marker>
          </defs>
          <line className="svd-composition-axis" x1="18" x2="502" y1={cy} y2={cy} />
          <line className="svd-composition-axis" x1={cx} x2={cx} y1="16" y2="334" />
          {gridOffsets.flatMap((offset) => [
            <motion.path className="svd-composition-grid" key={`v-${offset}`} d={gridPath(true, offset, transforms[stage])} animate={{ d: gridPath(true, offset, transforms[stage]) }} transition={transition} />,
            <motion.path className="svd-composition-grid" key={`h-${offset}`} d={gridPath(false, offset, transforms[stage])} animate={{ d: gridPath(false, offset, transforms[stage]) }} transition={transition} />,
          ])}
          <text className="svd-composition-axis-label" x="496" y={cy - 8}>x₁</text>
          <text className="svd-composition-axis-label" x={cx + 8} y="23">x₂</text>
          <circle className="svd-composition-origin" cx={cx} cy={cy} r="3" />
          <motion.line className="svd-composition-vector" x1={cx} y1={cy} x2={vx} y2={vy} markerEnd="url(#svd-composition-arrow)" animate={{ x2: vx, y2: vy }} transition={transition} />
          <motion.circle className="svd-composition-tip" cx={vx} cy={vy} r="5" animate={{ cx: vx, cy: vy }} transition={transition} />
          <motion.text className="svd-composition-coordinate" textAnchor={vx > cx ? 'start' : 'end'} initial={false} animate={{ x: vx + (vx > cx ? 12 : -12), y: vy - 12, opacity: 1 }} transition={transition}>
            ({fmt(current[0])}, {fmt(current[1])})
          </motion.text>
        </svg>
        <div className="svd-composition-current">
          <span>{text.value} · {stageNames[stage]}</span>
          <motion.strong key={`${stage}-${fmt(current[0])}-${fmt(current[1])}`} initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
            [{fmt(current[0])}, {fmt(current[1])}]
          </motion.strong>
        </div>
      </div>

      <aside className="svd-composition-controls">
        <section className="svd-composition-vector">
          <h3>{text.vector}</h3>
          <label htmlFor={xId}><span>{text.x} · x₁</span><output>{fmt(vector[0])}</output></label>
          <input id={xId} type="range" min="-2" max="2" step="0.1" value={vector[0]} onChange={(event) => setVector((old) => [Number(event.target.value), old[1]])} />
          <label htmlFor={yId}><span>{text.y} · x₂</span><output>{fmt(vector[1])}</output></label>
          <input id={yId} type="range" min="-2" max="2" step="0.1" value={vector[1]} onChange={(event) => setVector((old) => [old[0], Number(event.target.value)])} />
        </section>
        <section className="svd-composition-factors" aria-label={text.chain}>
          {factorMatrices.map((matrix, index) => <button type="button" className="svd-composition-factor" key={factorNames[index]} aria-pressed={stage === index + 1} onClick={() => setStage(index + 1)}>
            <span className="svd-composition-factor-title"><small>{text.factors[index]}</small><strong>{factorNames[index]}</strong></span>
            <MatrixTile matrix={matrix} />
          </button>)}
        </section>
      </aside>
    </div>

    <DiscreteStageScrubber stages={stageNames} stage={stage} onStageChange={setStage} locale={locale} label={text.chain} />
  </div>;
}
