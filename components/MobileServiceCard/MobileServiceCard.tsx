import { useState, ReactNode } from "react";
import styles from "./MobileServiceCard.module.css";

interface MobileServiceCardProps {
  title: string;
  tagline: string;
  capabilities: string[];
  visual?: ReactNode;
}

export default function MobileServiceCard({ title, tagline, capabilities, visual }: MobileServiceCardProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div 
      className={styles.card} 
      data-active={isActive} 
      onClick={() => setIsActive(!isActive)}
      style={{ cursor: 'pointer' }}
    >
      {/* Grainient region: the parent ServicesAccordion mounts a single
          SharedGrainient (one WebGL context) that renders into this element
          via `[data-grainient]` — pixel-identical to the per-card canvas it
          replaces, at 1/3rd the WebGL context budget. */}
      <div data-grainient className={styles.grainientWrapper} />
      <div className={styles.lightLayer}>
        <div className={styles.slit}></div>
        <div className={styles.lumen}>
          <div className={styles.min}></div>
          <div className={styles.mid}></div>
          <div className={styles.hi}></div>
        </div>
        <div className={styles.darken}>
          <div className={styles.sl}></div>
          <div className={styles.ll}></div>
          <div className={styles.slt}></div>
          <div className={styles.srt}></div>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.icon}>
          {visual && (
            <div style={{ opacity: isActive ? 1 : 0.8, transition: 'opacity 0.4s', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
                {visual}
              </div>
            </div>
          )}
        </div>
        <div className={styles.bottom}>
          <h4>{title}</h4>
          <p dangerouslySetInnerHTML={{ __html: tagline }} />
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', opacity: isActive ? 1 : 0.8, transition: 'opacity 0.4s', marginTop: '1.2em', maxWidth: '75%' }}>
            {capabilities.map((cap, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95em', color: 'var(--color-text)' }}>
                <span style={{ width: '5px', height: '5px', backgroundColor: 'var(--color-brand-yellow)', borderRadius: '50%', flexShrink: 0, marginTop: '0.55em' }}></span>
                {cap}
              </li>
            ))}
          </ul>
          <div className={styles.toggle} data-active={isActive}>
            <div className={styles.track}>
              <div className={styles.knob}></div>
            </div>
            <span className={styles.label}>LUMEN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
