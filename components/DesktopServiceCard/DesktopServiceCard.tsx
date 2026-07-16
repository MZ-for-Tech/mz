import { ReactNode } from "react";
import styles from "./DesktopServiceCard.module.css";
import { MzLogo } from "@/components/Logo/MzLogo";
import Grainient from "@/components/Grainient/Grainient";

interface DesktopServiceCardProps {
  pillar: string;
  title: string;
  tagline: string;
  capabilities: string[];
  visual?: ReactNode;
}

export default function DesktopServiceCard({ pillar, title, tagline, capabilities, visual }: DesktopServiceCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.grainientWrapper}>
        <Grainient
          color1="var(--color-bg)"
          color2="var(--color-bg)"
          color3="var(--color-olive)"
          timeSpeed={0.15}
          colorBalance={0.0}
          blendSoftness={0.2}
          contrast={1.1}
        />
      </div>
      <MzLogo width={400} height={400} className={styles.productWatermark} />


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
        </div>

        <div className={styles.right}>
          <div className={styles.icon}>
            {visual && (
              <div className={styles.visualWrapper}>
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
