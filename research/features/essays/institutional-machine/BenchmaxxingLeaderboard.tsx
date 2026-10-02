'use client';

import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Pause, Play, RotateCcw, Trophy } from 'lucide-react';
import { EditorialPlate } from '@/research/features/studies/applied-stats-in-ai/VizPrimitives';
import { RESEARCH_LAYOUT_SPRING, researchMotionTransition } from '@/research/lib/motion';

const MAX_ROUNDS = 10;
const models = [
  { name: 'Model A', base: 48, gain: 4, color: 'var(--accent-val)' },
  { name: 'Model B', base: 64, gain: 1.7, color: 'var(--ink-val)' },
  { name: 'Model C', base: 55, gain: 2.9, color: 'var(--pencil-val)' },
];

const scoreAt = (model: typeof models[number], round: number) => model.base + model.gain * round;
const capability = 60;

export default function BenchmaxxingLeaderboard({ locale = 'en' }: { locale?: 'en' | 'ar' }) {
  const isArabic = locale === 'ar';
  const [round, setRound] = useState(0);
  const [playing, setPlaying] = useState(false);
  const sliderId = useId();
  const reduceMotion = useReducedMotion();
  const isPlaying = playing && round < MAX_ROUNDS;
  const featuredScore = scoreAt(models[0], round);
  const scoreGap = Math.round(featuredScore - capability);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setTimeout(() => setRound(Math.min(MAX_ROUNDS, round + 1)), 650);
    return () => window.clearTimeout(timer);
  }, [isPlaying, round]);

  const togglePlayback = () => {
    if (isPlaying) {
      setPlaying(false);
      return;
    }
    if (reduceMotion) {
      setRound(round >= MAX_ROUNDS ? 0 : MAX_ROUNDS);
      setPlaying(false);
      return;
    }
    if (round >= MAX_ROUNDS) setRound(0);
    setPlaying(true);
  };

  const rankings = models
    .map((model) => ({ ...model, score: scoreAt(model, round) }))
    .sort((a, b) => b.score - a.score);
  const featuredRank = rankings.findIndex((model) => model.name === 'Model A') + 1;

  const setManually = (value: number) => {
    setPlaying(false);
    setRound(value);
  };

  return (
    <EditorialPlate
      compact
      figureCaption={{
        number: 3,
        label: isArabic ? 'الشكل' : 'Figure',
        text: isArabic
          ? 'يصعد النموذج A في لوحة الترتيب مع ارتفاع درجته المعيارية، بينما تظل قدرته العامة المحاكية ثابتة.'
          : 'The leaderboard moves Model A upward as its benchmark score rises, while its simulated broader capability stays fixed.',
      }}
    >
      <div className="relative z-10 space-y-5 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-end gap-3 border-b border-ink/10 pb-3">
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={isPlaying
              ? (isArabic ? 'إيقاف جولات التحسين مؤقتًا' : 'Pause optimization rounds')
              : round >= MAX_ROUNDS
                ? (isArabic ? 'إعادة جولات التحسين' : 'Replay optimization rounds')
                : (isArabic ? 'تشغيل جولات التحسين' : 'Play optimization rounds')}
            className="inline-flex items-center gap-2 border border-ink/15 px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:border-accent hover:text-accent motion-reduce:transition-none"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : round >= MAX_ROUNDS ? <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
            {isPlaying ? (isArabic ? 'إيقاف' : 'Pause') : round >= MAX_ROUNDS ? (isArabic ? 'إعادة' : 'Replay') : (isArabic ? 'تشغيل الجولات' : 'Run rounds')}
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:gap-6">
          <section aria-label={isArabic ? 'لوحة ترتيب المعيار' : 'Benchmark leaderboard'} className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-baseline gap-2.5">
                <h3 className="font-latex text-xl text-ink">{isArabic ? 'لوحة الترتيب' : 'Leaderboard'}</h3>
              </div>
              <Trophy className="h-4 w-4 text-accent" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {rankings.map((model, index) => {
                  const featured = model.name === 'Model A';
                  return (
                    <motion.div
                      key={model.name}
                      layout={!reduceMotion}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                      transition={researchMotionTransition(reduceMotion, { layout: RESEARCH_LAYOUT_SPRING, duration: 0.25 })}
                      className={`grid grid-cols-[2rem_minmax(0,1fr)_3.4rem] items-center gap-2 border px-2.5 py-2.5 ${featured ? 'border-accent/35 bg-accent/[0.04]' : 'border-ink/8 bg-paper/70'}`}
                    >
                      <motion.span
                        key={`${model.name}-rank-${index}`}
                        initial={reduceMotion ? false : { scale: 0.7, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={researchMotionTransition(reduceMotion)}
                        className={`font-mono text-sm tabular-nums ${featured ? 'text-accent' : 'text-tertiary'}`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </motion.span>
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className={`truncate font-mono text-xs uppercase tracking-wider ${featured ? 'text-ink' : 'text-secondary'}`}>{isArabic ? `النموذج ${model.name.slice(-1)}` : model.name}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden bg-ink/[0.07]">
                          <motion.div
                            className="h-full"
                            style={{ backgroundColor: model.color }}
                            initial={false}
                            animate={{ width: `${model.score}%` }}
                            transition={researchMotionTransition(reduceMotion)}
                          />
                        </div>
                      </div>
                      <motion.span
                        key={`${model.name}-score-${round}`}
                        initial={reduceMotion ? false : { opacity: 0.3, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={researchMotionTransition(reduceMotion)}
                        className={`text-right font-mono text-sm tabular-nums ${featured ? 'text-accent' : 'text-secondary'}`}
                      >
                        {model.score.toFixed(0)}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>

          <section aria-label={isArabic ? 'مقارنة الدرجة المعيارية بالقدرة العامة' : 'Benchmark score compared with broader capability'} className="border-t border-ink/10 pt-4 md:border-l md:border-t-0 md:ps-5 md:pt-0">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2.5">
                <h3 className="font-latex text-xl leading-tight text-ink">{isArabic ? 'النموذج A: الدرجة والقدرة' : 'Model A: score and capability'}</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-accent/25 bg-accent/[0.04] p-3">
                <span className="block min-h-8 font-mono text-xs uppercase leading-snug tracking-wider text-secondary">{isArabic ? 'الدرجة المعيارية' : 'Benchmark score'}</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.strong
                    key={`score-${round}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 9 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                    transition={researchMotionTransition(reduceMotion)}
                    className="mt-1 block font-latex text-4xl font-normal tabular-nums text-accent"
                  >
                    {featuredScore.toFixed(0)}
                  </motion.strong>
                </AnimatePresence>
                <div className="mt-3 h-2 overflow-hidden bg-ink/[0.08]">
                  <motion.div className="h-full bg-accent" animate={{ width: `${featuredScore}%` }} transition={researchMotionTransition(reduceMotion)} />
                </div>
              </div>
              <div className="border border-ink/10 p-3">
                <span className="block min-h-8 font-mono text-xs uppercase leading-snug tracking-wider text-secondary">{isArabic ? 'القدرة العامة' : 'Broader capability'}</span>
                <strong className="mt-1 block font-latex text-4xl font-normal tabular-nums text-ink">{capability}</strong>
                <div className="mt-3 h-2 overflow-hidden bg-ink/[0.08]">
                  <div className="h-full bg-ink/50" style={{ width: `${capability}%` }} />
                </div>
              </div>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={scoreGap > 0 ? 'ahead' : scoreGap < 0 ? 'behind' : 'equal'}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={researchMotionTransition(reduceMotion)}
                className="mt-3 flex min-h-10 items-center justify-between gap-2 border-t border-ink/10 pt-3 font-mono text-xs uppercase tracking-wide"
              >
                <span className="text-tertiary">{isArabic ? 'تقدّم الدرجة على القدرة' : 'Score lead over capability'}</span>
                <span className={scoreGap > 0 ? 'font-semibold text-accent' : 'text-secondary'}>{scoreGap > 0 ? '+' : ''}{scoreGap} {isArabic ? 'نقطة' : 'pts'}</span>
              </motion.div>
            </AnimatePresence>
          </section>
        </div>

        <p className="sr-only" aria-live="polite">
          {isArabic
            ? `الجولة ${round} من ${MAX_ROUNDS}. ترتيب النموذج A هو ${featuredRank}، ودرجته المعيارية ${featuredScore.toFixed(0)}، بينما تظل قدرته العامة عند ${capability}.`
            : `Round ${round} of ${MAX_ROUNDS}. Model A is ranked ${featuredRank}, with benchmark score ${featuredScore.toFixed(0)} and broader capability held at ${capability}.`}
        </p>

        <div className="border-t border-ink/10 pt-3">
          <div className="mb-2 flex items-center justify-between gap-4">
            <label htmlFor={sliderId} className="font-mono text-xs uppercase tracking-[0.15em] text-tertiary">{isArabic ? 'جولات التحسين' : 'Optimization rounds'}</label>
            <output htmlFor={sliderId} className="font-mono text-xs tabular-nums text-accent">{round} / {MAX_ROUNDS}</output>
          </div>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={MAX_ROUNDS}
            step={1}
            value={round}
            onChange={(event) => setManually(Number(event.target.value))}
            aria-label={isArabic ? 'تحديد جولة التحسين' : 'Set optimization round'}
            className="h-1 w-full cursor-pointer appearance-none bg-ink/10 accent-accent"
          />
        </div>
      </div>
    </EditorialPlate>
  );
}
