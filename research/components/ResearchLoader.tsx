'use client';

import { useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/** The Null Hypothesis skeleton used for entry and internal route transitions. */
export default function ResearchLoader() {
  const pathname = usePathname();
  const isArabic = pathname === '/research/ar' || pathname.startsWith('/research/ar/');
  const [exitingPath, setExitingPath] = useState<string | null>(null);
  const [hiddenPath, setHiddenPath] = useState<string | null>(null);

  useLayoutEffect(() => {
    // The launcher card expands above the route change. This loader is the
    // handoff surface, so remove the temporary card as soon as it is mounted.
    document.querySelector("[data-research-portal]")?.remove();

    const fadeTimer = window.setTimeout(() => {
      setExitingPath(pathname);
    }, 400);
    const removeTimer = window.setTimeout(() => setHiddenPath(pathname), 750);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [pathname]);

  const visible = hiddenPath !== pathname;
  const exiting = exitingPath === pathname;

  if (!visible) return null;

  return (
    <div className="research-loader" dir={isArabic ? 'rtl' : 'ltr'} aria-hidden="true" style={{ opacity: exiting ? 0 : 1, pointerEvents: exiting ? 'none' : 'auto' }}>
      <div className="research-loader-lines">
        <div className="research-loader-line" style={{ width: '72%' }} />
        <div className="research-loader-line" style={{ width: '100%' }} />
        <div className="research-loader-line" style={{ width: '84%' }} />
        <div className="research-loader-line" style={{ width: '60%' }} />
      </div>
    </div>
  );
}
