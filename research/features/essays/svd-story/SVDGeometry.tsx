'use client';

import { useReducedMotion } from 'framer-motion';
import { motion } from 'framer-motion';
import DiscreteStageScrubber from '@/research/features/essays/shared/DiscreteStageScrubber';
import { researchMotionTransition } from '@/research/lib/motion';

type Matrix = number[][];
type Props = { U: Matrix; Sigma: Matrix; Vt: Matrix; locale: 'en' | 'ar'; stage: number; onStageChange: (stage: number) => void };

const copy = {
  en: {
    stages: ['Unit circle', 'After Vᵀ', 'After Σ', 'After U'],
    descriptions: [
      'Every direction starts with the same unit length.',
      'Vᵀ changes the coordinate directions. The circle stays round because rotations and reflections preserve lengths.',
      'Σ stretches along perpendicular directions. Unequal singular values turn the circle into an ellipse.',
      'U reorients the ellipse into the output space while preserving its axis lengths.',
    ],
    aria: 'Unit circle transformed through the SVD factors',
  },
  ar: {
    stages: ['دائرة الوحدة', 'بعد Vᵀ', 'بعد Σ', 'بعد U'],
    descriptions: [
      'يبدأ كل اتجاه بالطول الوحدي نفسه.',
      'يغيّر Vᵀ اتجاهات الإحداثيات. وتبقى الدائرة مستديرة لأن الدوران والانعكاس يحافظان على الأطوال.',
      'تمدّد Σ الشكل على اتجاهات متعامدة. وتحول القيم المفردة المختلفة الدائرة إلى قطع ناقص.',
      'يعيد U توجيه القطع الناقص إلى فضاء الخرج مع الحفاظ على أطوال محاوره.',
    ],
    aria: 'دائرة الوحدة بعد تحويلها بعوامل SVD',
  },
} as const;

const multiplyVector = (matrix: Matrix, vector: number[]) => matrix.map((row) => row.reduce((sum, value, index) => sum + value * vector[index], 0));
const coord = (value: number) => Number(value.toFixed(3));

export default function SVDGeometry({ U, Sigma, Vt, locale, stage, onStageChange }: Props) {
  const text = copy[locale];
  const reduceMotion = Boolean(useReducedMotion());
  const transition = researchMotionTransition(reduceMotion);
  const angles = Array.from({ length: 129 }, (_, index) => (index * Math.PI * 2) / 128);
  const unitCircle = angles.map((angle) => [Math.cos(angle), Math.sin(angle)]);
  const states = unitCircle.map((point) => {
    const changedBasis = multiplyVector(Vt, point);
    const scaled = multiplyVector(Sigma, changedBasis);
    const oriented = multiplyVector(U, scaled);
    return [point, changedBasis, scaled, oriented];
  });
  const maxRadius = Math.max(1, ...states.flatMap((stages) => stages.map((point) => Math.hypot(point[0], point[1]))));
  const scale = 84 / maxRadius;
  const project = (point: number[]) => [coord(100 + point[0] * scale), coord(100 - point[1] * scale)];
  const transformed = states.map((stages) => stages[stage] || stages[0]);
  const path = `${transformed.map((point, index) => {
    const [x, y] = project(point);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ')} Z`;
  const markers = Array.from({ length: 8 }, (_, index) => {
    const source = unitCircle[index * 16];
    const transformedPoint = states[index * 16]?.[stage] || source;
    return { index, point: project(transformedPoint) };
  });

  return <div className="svd-geometry-explorer" dir="ltr">
    <DiscreteStageScrubber stages={text.stages} stage={stage} onStageChange={onStageChange} locale={locale} label={locale === 'ar' ? 'مراحل تحويل دائرة الوحدة' : 'Unit circle transformation stages'} />
    <div className="svd-geometry-display">
      <svg viewBox="0 0 200 200" className="svd-geometry" role="img" aria-label={text.aria}>
        <line className="svd-geometry-axis" x1="8" y1="100" x2="192" y2="100" />
        <line className="svd-geometry-axis" x1="100" y1="8" x2="100" y2="192" />
        <text className="svd-geometry-axis-label" x="185" y="96">x₁</text>
        <text className="svd-geometry-axis-label" x="104" y="14">x₂</text>
        <circle className="svd-geometry-origin" cx="100" cy="100" r="2" />
        <motion.path className="svd-geometry-shape" d={path} initial={false} animate={{ d: path }} transition={transition} />
        {markers.map(({ index, point: [x, y] }) => <g key={index}>
          <motion.line className="svd-geometry-spoke" x1="100" y1="100" x2={x} y2={y} initial={false} animate={{ x2: x, y2: y }} transition={transition} />
          <motion.circle className="svd-geometry-marker" cx={x} cy={y} r="1.8" initial={false} animate={{ cx: x, cy: y }} transition={transition} />
        </g>)}
      </svg>
      <motion.p key={stage} className="svd-geometry-explanation" dir={locale === 'ar' ? 'rtl' : 'ltr'} initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
        <strong>{text.stages[stage]}</strong>
        <span>{text.descriptions[stage]}</span>
      </motion.p>
    </div>
  </div>;
}
