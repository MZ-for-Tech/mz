'use client';

import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { researchMotionTransition } from '@/research/lib/motion';

type Props = {
  points: number[][];
  pc1: number[];
  explainedVariance: number[];
  locale: 'en' | 'ar';
};

const copy = {
  en: {
    progress: 'Projection onto PC₁',
    start: 'Original data',
    end: 'Projected',
    variance: 'Variance on PC₁',
    selected: 'Selected observation',
    score: 'PC₁ score',
    residual: 'PC₂ residual',
    aria: 'PCA projection of observations onto the first principal component',
    point: (index: number) => `Observation ${index + 1}`,
  },
  ar: {
    progress: 'الإسقاط على PC₁',
    start: 'البيانات الأصلية',
    end: 'بعد الإسقاط',
    variance: 'التباين على PC₁',
    selected: 'المشاهدة المحددة',
    score: 'قيمة PC₁',
    residual: 'الباقي على PC₂',
    aria: 'إسقاط المشاهدات على المركبة الرئيسية الأولى',
    point: (index: number) => `المشاهدة ${index + 1}`,
  },
} as const;

const clean = (value: number) => Number(value.toFixed(3));
const format = (value: number) => Number(value.toFixed(2)).toString();

export default function PCAProjectionExplorer({ points, pc1, explainedVariance, locale }: Props) {
  const text = copy[locale];
  const reduceMotion = Boolean(useReducedMotion());
  const inputId = useId();
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState(0);
  if (!points.length || pc1.length < 2) return null;

  const norm = Math.hypot(pc1[0], pc1[1]) || 1;
  const u = [pc1[0] / norm, pc1[1] / norm];
  const v = [-u[1], u[0]];
  const scale = 91;
  const center = [320, 190];
  const toSvg = (point: number[]) => [clean(center[0] + point[0] * scale), clean(center[1] - point[1] * scale)];
  const observations = points.map((point) => {
    const score = point[0] * u[0] + point[1] * u[1];
    const residual = point[0] * v[0] + point[1] * v[1];
    const projected = [score * u[0], score * u[1]];
    const current = [point[0] + (projected[0] - point[0]) * progress / 100, point[1] + (projected[1] - point[1]) * progress / 100];
    return { source: toSvg(point), projected: toSvg(projected), current: toSvg(current), score, residual };
  });
  const chosen = observations[Math.min(selected, observations.length - 1)];
  const pc1Start = toSvg([-u[0] * 2.8, -u[1] * 2.8]);
  const pc1End = toSvg([u[0] * 2.8, u[1] * 2.8]);
  const pc2Start = toSvg([-v[0] * 0.65, -v[1] * 0.65]);
  const pc2End = toSvg([v[0] * 0.65, v[1] * 0.65]);
  const transition = researchMotionTransition(reduceMotion);

  return <div className="svd-pca-explorer" dir="ltr">
    <div className="svd-pca-legend" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <span><i className="is-source" />{text.start}</span>
      <span><i className="is-projected" />{text.end}</span>
    </div>
    <svg className="svd-pca-chart" viewBox="0 0 640 390" role="img" aria-label={text.aria}>
      <line className="svd-pca-axis" x1="28" y1={center[1]} x2="612" y2={center[1]} />
      <line className="svd-pca-axis" x1={center[0]} y1="24" x2={center[0]} y2="356" />
      <line className="svd-pca-component" x1={pc1Start[0]} y1={pc1Start[1]} x2={pc1End[0]} y2={pc1End[1]} />
      <line className="svd-pca-secondary" x1={pc2Start[0]} y1={pc2Start[1]} x2={pc2End[0]} y2={pc2End[1]} />
      <text className="svd-pca-component-label" x={pc1End[0] - u[0] * 7} y={pc1End[1] + u[1] * 7}>PC₁</text>
      <text className="svd-pca-secondary-label" x={pc2End[0] + 8} y={pc2End[1]}>PC₂</text>
      {observations.map((observation, index) => <g key={index}>
        <circle className="svd-pca-source" cx={observation.source[0]} cy={observation.source[1]} r="3" />
        {progress > 0 && <motion.line className="svd-pca-residual" x1={observation.current[0]} y1={observation.current[1]} x2={observation.projected[0]} y2={observation.projected[1]} initial={false} animate={{ x1: observation.current[0], y1: observation.current[1], x2: observation.projected[0], y2: observation.projected[1] }} transition={transition} />}
        <motion.circle
          className={`svd-pca-observation${selected === index ? ' is-selected' : ''}`}
          cx={observation.current[0]}
          cy={observation.current[1]}
          r={selected === index ? 5 : 3.6}
          role="button"
          tabIndex={0}
          aria-label={text.point(index)}
          aria-pressed={selected === index}
          onClick={() => setSelected(index)}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(index); } }}
          initial={false}
          animate={{ cx: observation.current[0], cy: observation.current[1] }}
          transition={transition}
        />
      </g>)}
    </svg>
    <div className="svd-pca-control" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <label htmlFor={inputId}><span>{text.progress}</span><output>{progress}%</output></label>
      <input id={inputId} type="range" min="0" max="100" step="1" value={progress} aria-valuetext={`${text.progress} ${progress}%`} onChange={(event) => setProgress(Number(event.target.value))} />
    </div>
    <div className="svd-pca-readouts" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div><span>{text.variance}</span><strong>{((explainedVariance[0] || 0) * 100).toFixed(1)}%</strong></div>
      <div className="svd-pca-selected"><span>{text.selected}: {selected + 1}</span><small>{text.score} {format(chosen.score)} <b>·</b> {text.residual} {format(chosen.residual * (1 - progress / 100))}</small></div>
    </div>
  </div>;
}
