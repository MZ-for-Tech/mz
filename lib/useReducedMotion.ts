import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useReducedMotion() {
  const subscribe = typeof window !== 'undefined'
    ? (callback: () => void) => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        mq.addEventListener('change', callback);
        return () => mq.removeEventListener('change', callback);
      }
    : emptySubscribe;

  const getSnapshot = () => prefersReducedMotion();
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
