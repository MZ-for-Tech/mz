'use client';

import { useEffect, useState } from 'react';

/** The original Null Hypothesis loading treatment, shown when /research mounts. */
export default function ResearchLoader() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let removeTimer: number | undefined;
    const fadeTimer = window.setTimeout(() => {
      setExiting(true);
      removeTimer = window.setTimeout(() => setVisible(false), 350);
    }, 50);

    return () => {
      window.clearTimeout(fadeTimer);
      if (removeTimer !== undefined) window.clearTimeout(removeTimer);
    };
  }, []);

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
