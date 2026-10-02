import type { Transition } from 'framer-motion';

export const RESEARCH_SPRING = {
  type: 'spring',
  stiffness: 120,
  damping: 24,
} as const;

export const RESEARCH_LAYOUT_SPRING = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
} as const;

export function researchMotionTransition(reduceMotion: boolean | null, transition: Transition = RESEARCH_SPRING): Transition {
  return reduceMotion ? { duration: 0 } : transition;
}
