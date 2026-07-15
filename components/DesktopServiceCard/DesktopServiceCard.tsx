import { useState, ReactNode } from "react";
import styles from "./DesktopServiceCard.module.css";
import { MzLogo } from "@/components/Logo/MzLogo";

interface DesktopServiceCardProps {
  pillar: string;
  title: string;
  tagline: string;
  capabilities: string[];
  visual?: ReactNode;
}

export default function DesktopServiceCard({ pillar, title, tagline, capabilities, visual }: DesktopServiceCardProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className={styles.card} data-active={isActive}>
      <MzLogo width={400} height={400} className={styles.productWatermark} />
      
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
      
      <div className={styles.topRightPillar}>{pillar}</div>
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.productNameWrapper}>
            <div className={styles.productName}>{title}</div>
          </div>
          <div className={styles.productTagline}>{tagline}</div>
          <div className={styles.productDesc}>
            <ul>
              {capabilities.map((cap, i) => (
                <li key={i}>
                  <span className={styles.bullet}></span>
                  {cap}
                </li>
              ))}
            </ul>
          </div>
          <div 
            className={styles.toggle}
            data-active={isActive}
            onClick={() => setIsActive(!isActive)}
          >
            <div className={styles.handle}></div>
            <span>Activate Lumen</span>
          </div>
        </div>
        
        <div className={styles.right}>
          <div className={styles.icon}>
            {visual && (
              <div style={{ opacity: isActive ? 1 : 0.8, transition: 'opacity 0.4s', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ transform: 'scale(1)', transformOrigin: 'center' }}>
                  {visual}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
