'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ResearchReadingProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const active = Boolean(pathname && (
    /^\/research\/(?:ar\/)?(?:essays|papers)\/[^/]+\/?$/.test(pathname)
    || /^\/research\/(?!ar(?:\/|$))[^/]+\/?$/.test(pathname)
  ));

  useEffect(() => {
    const article = document.querySelector<HTMLElement>('[data-reading-progress]');
    if (!active || !article) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = article.getBoundingClientRect();
      const articleTop = bounds.top + window.scrollY;
      const articleBottom = bounds.bottom + window.scrollY;
      const scrollRange = articleBottom - articleTop - window.innerHeight;
      const next = scrollRange > 0
        ? Math.min(100, Math.max(0, ((window.scrollY - articleTop) / scrollRange) * 100))
        : 100;
      setProgress(Math.round(next));
    };
    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [active, pathname]);

  if (!active) return null;

  return (
    <div
      className="research-reading-progress"
      role="progressbar"
      aria-label="Article reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-valuetext={`${progress}%`}
    >
      <span className="research-reading-progress__fill" style={{ width: `${progress}%` }} />
    </div>
  );
}
