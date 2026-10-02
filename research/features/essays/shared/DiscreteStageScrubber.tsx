'use client';

import { useEffect, useId, useState } from 'react';

type Props = {
  stages: readonly string[];
  stage: number;
  onStageChange: (stage: number) => void;
  locale: 'en' | 'ar';
  label: string;
};

const copy = {
  en: { run: 'Run sequence', pause: 'Pause sequence', replay: 'Replay sequence', position: (current: number, total: number) => `${String(current).padStart(2, '0')} / ${String(total).padStart(2, '0')}` },
  ar: { run: 'شغّل التسلسل', pause: 'أوقف التسلسل', replay: 'أعد التسلسل', position: (current: number, total: number) => `${String(current).padStart(2, '0')} / ${String(total).padStart(2, '0')}` },
} as const;

export default function DiscreteStageScrubber({ stages, stage, onStageChange, locale, label }: Props) {
  const [playing, setPlaying] = useState(false);
  const inputId = useId();
  const text = copy[locale];
  const lastStage = stages.length - 1;

  useEffect(() => {
    if (!playing) return;
    const atEnd = stage >= lastStage;
    const timer = window.setTimeout(() => {
      if (atEnd) setPlaying(false);
      else onStageChange(stage + 1);
    }, atEnd ? 0 : 950);
    return () => window.clearTimeout(timer);
  }, [lastStage, onStageChange, playing, stage]);

  const togglePlayback = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (stage >= lastStage) onStageChange(0);
    setPlaying(true);
  };

  const stageName = stages[stage] || stages[0] || '';
  const actionLabel = playing ? text.pause : stage >= lastStage ? text.replay : text.run;

  return <div className="svd-stage-scrubber" dir="ltr">
    <label className="svd-stage-scrubber-label" htmlFor={inputId} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <span>{stageName}</span>
      <output>{text.position(stage + 1, stages.length)}</output>
    </label>
    <input
      id={inputId}
      aria-label={label}
      aria-valuetext={`${stageName}, ${text.position(stage + 1, stages.length)}`}
      type="range"
      min="0"
      max={lastStage}
      step="1"
      value={stage}
      onChange={(event) => {
        setPlaying(false);
        onStageChange(Number(event.target.value));
      }}
    />
    <button type="button" className="svd-stage-scrubber-play" aria-label={actionLabel} onClick={togglePlayback}>
      <span aria-hidden="true">{playing ? 'Ⅱ' : stage >= lastStage ? '↻' : '▶'}</span>
      <span>{actionLabel}</span>
    </button>
  </div>;
}
