'use client';

import { useEffect, useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { EditorialPlate } from '@/research/features/studies/applied-stats-in-ai/VizPrimitives';
import { researchMotionTransition } from '@/research/lib/motion';

const baselineY = 132;

function flowPath(startX: number, endX: number, startY: number, endY: number) {
  const distance = endX - startX;
  return `M ${startX} ${startY} C ${startX + distance * 0.38} ${startY}, ${startX + distance * 0.62} ${endY}, ${endX} ${endY}`;
}

export default function DoubleGoodhartFlow({ locale = 'en' }: { locale?: 'en' | 'ar' }) {
  const isArabic = locale === 'ar';
  const [pressure, setPressure] = useState(12);
  const [playing, setPlaying] = useState(false);
  const inputId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const reduceMotion = useReducedMotion();
  const stages = isArabic ? [{ x: 696 }, { x: 400 }, { x: 104 }] : [{ x: 104 }, { x: 400 }, { x: 696 }];

  const rewardY = baselineY - pressure * 0.38;
  const policyY = baselineY - pressure * 0.78;
  const firstPath = flowPath(stages[0].x, stages[1].x, baselineY, rewardY);
  const secondPath = flowPath(stages[1].x, stages[2].x, rewardY, policyY);
  const preferenceProxyX = (stages[0].x + stages[1].x) / 2;
  const optimizationGapX = (stages[1].x + stages[2].x) / 2;
  const isRunning = playing && pressure < 100;

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setTimeout(() => setPressure(Math.min(100, pressure + 1)), 65);
    return () => window.clearTimeout(timer);
  }, [isRunning, pressure]);

  const runOptimization = () => {
    if (isRunning) {
      setPlaying(false);
      return;
    }
    if (reduceMotion) {
      setPressure(pressure >= 100 ? 0 : 100);
      setPlaying(false);
      return;
    }
    if (pressure >= 100) setPressure(0);
    setPlaying(true);
  };

  const setManually = (value: number) => {
    setPlaying(false);
    setPressure(value);
  };

  return (
    <EditorialPlate
      compact
      figureCaption={{
        number: 2,
        label: isArabic ? 'الشكل' : 'Figure',
        text: isArabic
          ? 'يمثّل نموذج المكافأة نية البشر بصورة غير كاملة، ثم يُحسَّن نموذج اللغة وفق هذا البديل، فتتسع الفجوة بين المكافأة العالية والإجابات المفيدة فعلًا.'
          : 'The reward model first imperfectly represents human intent. Then the language model is optimized against that proxy, widening the gap between high reward and genuinely helpful answers.',
      }}
    >
      <div className="relative z-10 space-y-5 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={runOptimization}
            aria-label={isRunning
              ? (isArabic ? 'إيقاف التحسين مؤقتًا' : 'Pause optimization')
              : pressure >= 100
                ? (isArabic ? 'إعادة التحسين' : 'Replay optimization')
                : (isArabic ? 'تشغيل التحسين' : 'Run optimization')}
            className="inline-flex items-center gap-2 border border-ink/15 px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:border-accent hover:text-accent motion-reduce:transition-none"
          >
            {isRunning ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
            {isRunning ? (isArabic ? 'إيقاف' : 'Pause') : pressure >= 100 ? (isArabic ? 'إعادة' : 'Replay') : (isArabic ? 'تشغيل' : 'Run')}
          </button>
        </div>

        <svg
          className="block h-auto w-full overflow-visible"
          viewBox="0 0 800 230"
          role="img"
          aria-labelledby={`${titleId} ${descriptionId}`}
          lang={locale}
        >
          <title id={titleId}>{isArabic ? 'فجوتان في التعلم المعزز من ردود الفعل البشرية' : 'Two proxy gaps in reinforcement learning from human feedback'}</title>
          <desc id={descriptionId}>{isArabic ? 'يريد الناس إجابات دقيقة ومفيدة. يتنبأ نموذج المكافأة بالتفضيلات البشرية على نحو غير كامل، فتظهر الفجوة الأولى. ثم يُحسَّن نموذج اللغة وفق هذا البديل وقد يستغل نقاط ضعفه، فتتسع الفجوة الثانية. يزيد شريط التمرير ضغط التحسين.' : 'People want accurate, helpful answers. The reward model imperfectly predicts human preferences, creating the first gap. The language model then optimizes that proxy and can exploit its weaknesses, widening the second gap. The slider increases optimization pressure.'}</desc>

          <line x1="64" x2="736" y1={baselineY} y2={baselineY} stroke="var(--ink-val)" strokeOpacity="0.22" strokeDasharray="4 7" />
          <text x={stages[0].x} y="158" textAnchor="middle" fill="var(--pencil-val)" fontSize="13" fontFamily="var(--font-code), monospace" direction={isArabic ? 'rtl' : 'ltr'}>{isArabic ? 'النتيجة المقصودة' : 'INTENDED OUTCOME'}</text>

          <motion.path
            d={firstPath}
            fill="none"
            stroke="var(--accent-val)"
            strokeWidth="3"
            strokeLinecap="round"
            animate={{ d: firstPath }}
            transition={researchMotionTransition(reduceMotion)}
          />
          <motion.path
            d={secondPath}
            fill="none"
            stroke="var(--accent-val)"
            strokeOpacity="0.65"
            strokeWidth="3"
            strokeLinecap="round"
            animate={{ d: secondPath }}
            transition={researchMotionTransition(reduceMotion)}
          />

          <line x1={stages[1].x} x2={stages[1].x} y1={rewardY} y2={baselineY} stroke="var(--accent-val)" strokeOpacity="0.38" strokeDasharray="3 4" />
          <line x1={stages[2].x} x2={stages[2].x} y1={policyY} y2={baselineY} stroke="var(--accent-val)" strokeOpacity="0.38" strokeDasharray="3 4" />

          <circle cx={stages[0].x} cy={baselineY} r="9" fill="var(--paper-val)" stroke="var(--ink-val)" strokeWidth="3" />
          <motion.circle cx={stages[1].x} cy={rewardY} r="9" fill="var(--accent-val)" stroke="var(--paper-val)" strokeWidth="3" animate={{ cy: rewardY }} transition={researchMotionTransition(reduceMotion)} />
          <motion.circle cx={stages[2].x} cy={policyY} r="9" fill="var(--accent-val)" stroke="var(--paper-val)" strokeWidth="3" animate={{ cy: policyY }} transition={researchMotionTransition(reduceMotion)} />

          {!reduceMotion && (
            <>
              <motion.circle r="4" fill="var(--paper-val)" animate={{ cx: [stages[0].x, (stages[0].x + stages[1].x) / 2, stages[1].x], cy: [baselineY, baselineY - (baselineY - rewardY) * 0.45, rewardY], opacity: [0, 1, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }} />
              <motion.circle r="4" fill="var(--paper-val)" animate={{ cx: [stages[1].x, (stages[1].x + stages[2].x) / 2, stages[2].x], cy: [rewardY, rewardY - (rewardY - policyY) * 0.45, policyY], opacity: [0, 1, 0] }} transition={{ duration: 2.4, delay: 1.2, repeat: Infinity, ease: 'linear' }} />
            </>
          )}

          <motion.g initial={{ opacity: pressure > 3 ? 1 : 0.35 }} animate={{ opacity: pressure > 3 ? 1 : 0.35 }} transition={researchMotionTransition(reduceMotion)}>
            <text x={preferenceProxyX} y={(rewardY + baselineY) / 2 + 4} textAnchor="middle" fill="var(--accent-val)" fontSize="13" fontFamily="var(--font-code), monospace" direction={isArabic ? 'rtl' : 'ltr'}>{isArabic ? 'وكيل التفضيلات' : 'PREFERENCE PROXY'}</text>
            <text x={optimizationGapX} y={(policyY + baselineY) / 2 + 4} textAnchor="middle" fill="var(--accent-val)" fontSize="13" fontFamily="var(--font-code), monospace" direction={isArabic ? 'rtl' : 'ltr'}>{isArabic ? 'فجوة التحسين' : 'OPTIMIZATION GAP'}</text>
          </motion.g>
        </svg>

        <div className="grid grid-cols-3 gap-2 border-y border-ink/10 py-3 sm:gap-4">
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-tertiary">{isArabic ? 'نية الإنسان' : 'Human intent'}</p>
            <p className="font-serif text-sm leading-snug text-ink sm:text-base">{isArabic ? 'ساعدني على حل هذه المسألة بدقة.' : 'Help me solve this accurately.'}</p>
          </div>
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-tertiary">{isArabic ? 'نموذج المكافأة' : 'Reward model'}</p>
            <motion.p key={pressure < 35 ? 'proxy-low' : pressure < 70 ? 'proxy-mid' : 'proxy-high'} initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={researchMotionTransition(reduceMotion)} className="font-serif text-sm leading-snug text-ink sm:text-base">
              {pressure < 35
                ? (isArabic ? 'يتعلّم ما يفضله الناس عادةً.' : 'Learn what people tend to prefer.')
                : pressure < 70
                  ? (isArabic ? 'يفضّل الإجابات التي تبدو مفيدة.' : 'Prefer answers that sound helpful.')
                  : (isArabic ? 'تصبح الثقة هي الإشارة.' : 'Confidence becomes the signal.')}
            </motion.p>
          </div>
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-tertiary">{isArabic ? 'سياسة LLM' : 'LLM policy'}</p>
            <motion.p key={pressure < 35 ? 'policy-low' : pressure < 70 ? 'policy-mid' : 'policy-high'} initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={researchMotionTransition(reduceMotion)} className="font-serif text-sm leading-snug text-ink sm:text-base">
              {pressure < 35
                ? (isArabic ? 'يجيب بأدلة مفيدة.' : 'Answer with useful evidence.')
                : pressure < 70
                  ? (isArabic ? 'يجعل الإجابة تبدو مفيدة.' : 'Make the answer sound helpful.')
                  : (isArabic ? 'يبدو واثقًا حتى بلا دليل.' : 'Sound certain, even without evidence.')}
            </motion.p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label htmlFor={inputId} className="font-mono text-xs uppercase tracking-[0.15em] text-tertiary">{isArabic ? 'ضغط التحسين' : 'Optimization pressure'}</label>
            <output htmlFor={inputId} className="font-mono text-xs tabular-nums text-accent">{pressure}%</output>
          </div>
          <input
            id={inputId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={pressure}
            onChange={(event) => setManually(Number(event.target.value))}
            aria-label={isArabic ? 'ضغط التحسين' : 'Optimization pressure'}
            className="h-1 w-full cursor-pointer appearance-none bg-ink/10 accent-accent"
          />
          <div className="mt-1 flex justify-between font-mono text-xs uppercase tracking-wider text-tertiary">
            <span>{isArabic ? 'منخفض' : 'Low'}</span><span>{isArabic ? 'مرتفع' : 'High'}</span>
          </div>
        </div>
      </div>
    </EditorialPlate>
  );
}
