'use client';

import { useEffect, useState } from 'react';
import { StickyNote } from 'lucide-react';
import type { Study } from '@/research/lib/types';

type PaperMetrics = NonNullable<Study['paper_metrics']>;

function formatDelta(value: number, reference: number, unit: string) {
  if (value === reference) return 'no change';
  // Percent metrics compare in points; physical units compare relative to the reference.
  const delta = unit === '%' ? value - reference : ((value - reference) / reference) * 100;
  return `${delta > 0 ? '+' : '−'}${Math.abs(delta).toFixed(1)}${unit === '%' ? ' pp' : '%'}`;
}

export default function ResearchPaperGauge({ metrics, states }: PaperMetrics) {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current: string | undefined;
      for (const heading of document.querySelectorAll<HTMLElement>('.research-essay-prose :is(h2, h3)[id]')) {
        if (heading.getBoundingClientRect().top > line) break;
        current = heading.id;
      }
      setActive(current ? states.findIndex((state) => state.anchors.includes(current)) : -1);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [states]);

  const state = states[Math.max(active, 0)];
  const reference = states[0];

  return (
    <aside
      aria-label="Compression metrics for the section in view"
      aria-hidden={active < 0}
      className={`fixed left-6 top-1/2 z-30 hidden w-44 -translate-y-1/2 text-right text-sm italic text-ink/60 transition-opacity duration-300 motion-reduce:transition-none xl:block ${active < 0 ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      {/* Visual language of Marginalia; not reused directly because the gauge is fixed, not in-flow. */}
      <p className="mb-2 font-latex font-bold not-italic text-ink" aria-live="polite">{state.label}</p>
      <span className="mb-2 flex justify-end text-accent/50"><StickyNote className="h-4 w-4" /></span>
      <dl className="grid gap-3">
        {metrics.map((metric, index) => {
          const value = state.values[index];
          const max = Math.max(...states.map((item) => item.values[index]));
          const delta = value - reference.values[index];
          const worse = metric.better === 'higher' ? delta < 0 : delta > 0;
          return (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd className="m-0">
                <span className="font-latex not-italic text-ink">{value}{metric.unit}</span>
                <span className="mt-1 block h-px bg-ink/15">
                  <span className="ms-auto block h-full bg-ink/70 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${(value / max) * 100}%` }} />
                </span>
                {state !== reference && (
                  <span className={`mt-1 block text-xs ${worse ? 'text-accent' : ''}`}>
                    {formatDelta(value, reference.values[index], metric.unit)}
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </aside>
  );
}
