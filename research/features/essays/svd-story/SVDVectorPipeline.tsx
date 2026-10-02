'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { researchMotionTransition } from '@/research/lib/motion';
import DiscreteStageScrubber from '@/research/features/essays/shared/DiscreteStageScrubber';

type Matrix = number[][];
type Props = { U: Matrix; Sigma: Matrix; Vt: Matrix; initialVector: number[]; locale: 'en' | 'ar' };

const copy = {
  en: {
    input: 'Input vector',
    stages: ['Start', 'Change basis', 'Scale axes', 'Orient output'],
    factors: ['Input x', 'Vᵀ', 'Σ', 'U'],
    descriptions: ['Choose a vector to transform.', 'Express x in the matrix’s principal input directions.', 'Stretch each direction by its singular value.', 'Rotate the scaled coordinates into the output space.'],
    current: 'Current vector',
    xAxis: 'x₁',
    yAxis: 'x₂',
  },
  ar: {
    input: 'متجه الإدخال',
    stages: ['البداية', 'تغيير الأساس', 'تحجيم المحاور', 'توجيه الخرج'],
    factors: ['متجه x', 'Vᵀ', 'Σ', 'U'],
    descriptions: ['اختر متجهًا لتحويله.', 'عبّر عن x وفق الاتجاهات الأساسية للمدخلات.', 'مدّد كل اتجاه بقيمة مفرده.', 'وجّه الإحداثيات المحجّمة إلى فضاء الخرج.'],
    current: 'المتجه الحالي',
    xAxis: 'x₁',
    yAxis: 'x₂',
  },
} as const;

const fmt = (value: number) => Number(value.toFixed(2)).toString();
const apply = (matrix: Matrix, vector: number[]) => matrix.map((row) => row.reduce((sum, value, index) => sum + value * vector[index], 0));

export default function SVDVectorPipeline({ U, Sigma, Vt, initialVector, locale }: Props) {
  const t = copy[locale];
  const reduceMotion = Boolean(useReducedMotion());
  const [vector, setVector] = useState(initialVector);
  const [stage, setStage] = useState(0);
  const afterV = apply(Vt, vector);
  const afterSigma = apply(Sigma, afterV);
  const afterU = apply(U, afterSigma);
  const states = [vector, afterV, afterSigma, afterU];
  const matrices: (Matrix | null)[] = [null, Vt, Sigma, U];
  const values = states[stage] || states[0];
  const scale = 38 / Math.max(1, ...states.flat().map(Math.abs));
  const x = 50 + values[0] * scale;
  const y = 50 - values[1] * scale;
  const path = `M 50 50 L ${x} ${y}`;

  return <div className="svd-vector-pipeline" dir="ltr">
    <div className="svd-vector-pipeline-controls" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <h3>{t.input}</h3>
      {vector.map((value, index) => <label key={index}>
        <span>{index === 0 ? t.xAxis : t.yAxis}</span>
        <input aria-label={`${t.input} ${index + 1}`} type="range" min="-2" max="2" step="0.1" value={value} onChange={(event) => setVector((current) => current.map((entry, i) => i === index ? Number(event.target.value) : entry))} />
        <output>{fmt(value)}</output>
      </label>)}
    </div>

    <DiscreteStageScrubber stages={t.stages} stage={stage} onStageChange={setStage} locale={locale} label={locale === 'ar' ? 'مراحل تحويل المتجه' : 'Vector transformation stages'} />

    <div className="svd-vector-pipeline-detail">
      <div className="svd-vector-pipeline-plot" role="img" aria-label={`${t.current}: (${fmt(values[0])}, ${fmt(values[1])})`}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <line className="svd-vector-axis" x1="8" y1="50" x2="92" y2="50" />
          <line className="svd-vector-axis" x1="50" y1="8" x2="50" y2="92" />
          <text className="svd-vector-axis-label" x="90" y="47">x₁</text>
          <text className="svd-vector-axis-label" x="53" y="11">x₂</text>
          <circle className="svd-vector-origin" cx="50" cy="50" r="1.5" />
          <motion.path className="svd-vector-current" d={path} initial={false} animate={{ d: path }} transition={researchMotionTransition(reduceMotion)} />
          <motion.circle className="svd-vector-tip" cx={x} cy={y} r="2.4" initial={false} animate={{ cx: x, cy: y }} transition={researchMotionTransition(reduceMotion)} />
        </svg>
      </div>
      <div className="svd-vector-pipeline-explanation" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <span>{t.current} · {t.factors[stage]}</span>
        <motion.strong key={`${stage}-${values.join(',')}`} initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={researchMotionTransition(reduceMotion)}>
          ({fmt(values[0])}, {fmt(values[1])})
        </motion.strong>
        <p>{t.descriptions[stage]}</p>
        {matrices[stage] && <code>{t.factors[stage]} × ({fmt(states[stage - 1][0])}, {fmt(states[stage - 1][1])}) = ({fmt(values[0])}, {fmt(values[1])})</code>}
      </div>
    </div>
  </div>;
}
