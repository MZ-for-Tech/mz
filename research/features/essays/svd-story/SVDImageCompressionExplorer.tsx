'use client';

import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { researchMotionTransition } from '@/research/lib/motion';

type Matrix = number[][];
type Props = { original: Matrix; reconstructions: Record<string, Matrix>; ranks: number[]; singularValues: number[]; energy: number[]; size: number[]; locale: 'en' | 'ar' };

const copy = {
  en: { original: 'Original image', reconstruction: 'Rank-k reconstruction', rank: 'Retained rank k', energy: 'Image energy retained', storage: 'Values stored', dense: 'Dense matrix', fewer: 'fewer values', spectrum: 'Singular-value layers', aria: (rank: number) => `Grayscale image reconstructed at rank ${rank}` },
  ar: { original: 'الصورة الأصلية', reconstruction: 'إعادة بناء بالرتبة k', rank: 'الرتبة المحتفظ بها k', energy: 'طاقة الصورة المحتفظ بها', storage: 'القيم المخزنة', dense: 'المصفوفة الكاملة', fewer: 'قيمة أقل', spectrum: 'طبقات القيم المفردة', aria: (rank: number) => `إعادة بناء صورة رمادية بالرتبة ${rank}` },
} as const;

function PixelImage({ matrix, label, maxValue, reduceMotion, ariaLabel }: { matrix: Matrix; label: string; maxValue: number; reduceMotion: boolean; ariaLabel: string }) {
  const rows = matrix.length;
  const columns = matrix[0]?.length || 0;
  return <figure className="svd-image-panel">
    <figcaption>{label}</figcaption>
    <motion.svg key={label} className="svd-image-preview" viewBox={`0 0 ${columns} ${rows}`} role="img" aria-label={ariaLabel} initial={reduceMotion ? false : { opacity: 0.82 }} animate={{ opacity: 1 }} transition={researchMotionTransition(reduceMotion)}>
      {matrix.flatMap((row, y) => row.map((value, x) => {
        const shade = Math.round(255 * (1 - Math.max(0, Math.min(1, value / maxValue))));
        return <motion.rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" initial={false} animate={{ fill: `rgb(${shade}, ${shade}, ${shade})` }} transition={researchMotionTransition(reduceMotion)} />;
      }))}
    </motion.svg>
  </figure>;
}

export default function SVDImageCompressionExplorer({ original, reconstructions, ranks, singularValues, energy, size, locale }: Props) {
  const text = copy[locale];
  const reduceMotion = Boolean(useReducedMotion());
  const inputId = useId();
  const usableRanks = ranks.filter((rank) => Boolean(reconstructions[String(rank)]));
  const [rankIndex, setRankIndex] = useState(0);
  if (!original.length || !usableRanks.length) return null;

  const rank = usableRanks[Math.min(rankIndex, usableRanks.length - 1)];
  const reconstruction = reconstructions[String(rank)];
  const maxValue = Math.max(1e-8, ...original.flat());
  const retained = energy[rank - 1] ?? 0;
  const denseValues = (size[0] || original.length) * (size[1] || original[0].length);
  const storedValues = rank * ((size[0] || original.length) + (size[1] || original[0].length) + 1);
  const reduction = Math.max(0, 100 * (1 - storedValues / denseValues));
  const activeSingularValues = singularValues.filter((value) => value > 1e-8);
  const maxSingularValue = Math.max(1e-8, ...activeSingularValues);

  return <div className="svd-image-compression" dir="ltr">
    <div className="svd-image-pair">
      <PixelImage matrix={original} label={text.original} maxValue={maxValue} reduceMotion={reduceMotion} ariaLabel={text.original} />
      <PixelImage matrix={reconstruction} label={`${text.reconstruction} · ${rank}`} maxValue={maxValue} reduceMotion={reduceMotion} ariaLabel={text.aria(rank)} />
    </div>

    <div className="svd-image-control" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <label htmlFor={inputId}><span>{text.rank}</span><output>{rank} / {usableRanks[usableRanks.length - 1]}</output></label>
      <input id={inputId} type="range" min="0" max={usableRanks.length - 1} step="1" value={Math.min(rankIndex, usableRanks.length - 1)} aria-valuetext={`${text.rank} ${rank}`} onChange={(event) => setRankIndex(Number(event.target.value))} />
    </div>

    <div className="svd-image-readouts" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div><span>{text.energy}</span><strong>{(retained * 100).toFixed(1)}%</strong></div>
      <div><span>{text.storage}</span><strong>{storedValues} / {denseValues}</strong><small>{reduction.toFixed(1)}% {text.fewer}</small></div>
    </div>

    <div className="svd-image-spectrum" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <span>{text.spectrum}</span>
      <div>{activeSingularValues.map((value, index) => <div className={index < rank ? 'is-retained' : ''} key={index} title={`σ${index + 1}: ${value.toFixed(2)}`}>
        <i><motion.b initial={false} animate={{ height: `${Math.max(5, 100 * value / maxSingularValue)}%` }} transition={researchMotionTransition(reduceMotion)} /></i>
        <small>σ{index + 1}</small>
      </div>)}</div>
    </div>
  </div>;
}
