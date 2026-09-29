'use client';

import { useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/** The Null Hypothesis skeleton used for entry and internal route transitions. */
export default function ResearchLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useLayoutEffect(() => {
    setVisible(true);
    setExiting(false);

    let removeTimer: number | undefined;
    const fadeTimer = window.setTimeout(() => {
      setExiting(true);
      removeTimer = window.setTimeout(() => setVisible(false), 350);
    }, 400);

    return () => {
      window.clearTimeout(fadeTimer);
      if (removeTimer !== undefined) window.clearTimeout(removeTimer);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="research-loader" aria-hidden="true" style={{ opacity: exiting ? 0 : 1, pointerEvents: exiting ? 'none' : 'auto' }}>
      <div className="research-loader-lines">
        <div className="research-loader-line" style={{ width: '72%' }} />
        <div className="research-loader-line" style={{ width: '100%' }} />
        <div className="research-loader-line" style={{ width: '84%' }} />
        <div className="research-loader-line" style={{ width: '60%' }} />
      </div>
    </div>
  );
}
