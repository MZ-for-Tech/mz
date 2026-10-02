'use client';

import { motion, useReducedMotion } from 'framer-motion';
import SafeLatex from '@/research/components/SafeLatex';
import DiscreteStageScrubber from '@/research/features/essays/shared/DiscreteStageScrubber';
import { researchMotionTransition } from '@/research/lib/motion';

type Step = { title: string; equation: string; why: string };
type Props = { steps: Step[]; locale: 'en' | 'ar'; stage: number; onStageChange: (stage: number) => void };

const labels = {
  en: { input: 'Input matrix', embed: 'Hermitian dilation', vector: 'Eigenvector split', pair: 'Singular vector pair', factors: 'Orthonormal factors', dimensions: 'm rows × n columns', conjugate: 'conjugate transpose', inputDirection: 'right direction', outputDirection: 'left direction' },
  ar: { input: 'مصفوفة الإدخال', embed: 'التوسيع الهرميتي', vector: 'تقسيم المتجه الذاتي', pair: 'زوج المتجهات المفردة', factors: 'العوامل المتعامدة', dimensions: 'm صف × n عمود', conjugate: 'المرافق المنقول', inputDirection: 'اتجاه المدخل', outputDirection: 'اتجاه المخرج' },
} as const;

function ProofDiagram({ stage, locale }: { stage: number; locale: 'en' | 'ar' }) {
  const text = labels[locale];
  if (stage === 0) return <div className="svd-proof-source-diagram" role="img" aria-label={`${text.input}, ${text.dimensions}`}>
    <div className="svd-proof-matrix-grid svd-proof-matrix-rectangular" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
    <strong>A</strong>
    <span>{text.dimensions}</span>
  </div>;
  if (stage === 1 || stage === 2) return <div className={`svd-proof-block-diagram${stage === 2 ? ' is-hermitian' : ''}`} role="img" aria-label={text.embed}>
    <span className="svd-proof-block-bracket">W =</span>
    <div className="svd-proof-block-matrix" aria-hidden="true">
      <span className="is-zero">0</span><span className="is-a">A</span>
      <span className="is-adjoint">A*</span><span className="is-zero">0</span>
    </div>
    {stage === 2 && <span className="svd-proof-conjugate-note">A* = {text.conjugate} of A</span>}
  </div>;
  if (stage === 3) return <div className="svd-proof-vector-diagram" role="img" aria-label={text.vector}>
    <span className="svd-proof-vector-symbol">z =</span>
    <div className="svd-proof-vector-stack"><strong>x</strong><strong>y</strong></div>
    <span className="svd-proof-vector-equivalence">Wz = σz</span>
  </div>;
  if (stage === 4) return <div className="svd-proof-pair-diagram" role="img" aria-label={text.pair}>
    <div><span>y</span><small>{text.inputDirection}</small></div>
    <span className="svd-proof-pair-arrow" aria-hidden="true">A →</span>
    <div><span>x</span><small>{text.outputDirection}</small></div>
    <strong>σ</strong>
  </div>;
  return <div className="svd-proof-factor-diagram" role="img" aria-label={text.factors}>
    <div className="svd-proof-vector-pairs"><span>y₁ <i>→</i> x₁</span><span>y₂ <i>→</i> x₂</span><span>⋮</span></div>
    <strong>A = XΣY*</strong>
    <span>{text.factors}</span>
  </div>;
}

export default function SVDProofJourney({ steps, locale, stage, onStageChange }: Props) {
  const reduceMotion = Boolean(useReducedMotion());
  const step = steps[stage];
  if (!step) return null;

  return <div className="svd-proof-journey" dir="ltr">
    <DiscreteStageScrubber stages={steps.map((item) => item.title)} stage={stage} onStageChange={onStageChange} locale={locale} label={locale === 'ar' ? 'خطوات برهان وجود SVD' : 'SVD existence proof steps'} />
    <motion.div key={stage} className="svd-proof-scene" initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={researchMotionTransition(reduceMotion)}>
      <ProofDiagram stage={stage} locale={locale} />
      <div className="svd-proof-scene-explanation" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="svd-proof-equation"><SafeLatex content={step.equation} /></div>
        <p>{step.why}</p>
      </div>
    </motion.div>
  </div>;
}
