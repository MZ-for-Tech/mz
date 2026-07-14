
import { MzLogo } from '@/components/Logo/MzLogo';
import Link from 'next/link';
import styles from './Sidebar.module.css';

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* Top: Logo */}
      <Link href="/" className={styles.logoWrapper}>
        <MzLogo 
          width={40} 
          height={40} 
          className={styles.logoImage} 
        />
      </Link>

      {/* Middle: Brand Tagline or Scroll Line */}
      <div className={styles.middleSection}>
        <div className={styles.verticalLine}></div>
        <div className={styles.verticalText}>RESEARCH. SOFTWARE. KNOWLEDGE.</div>
        <div className={styles.verticalLine}></div>
      </div>

      {/* Bottom: Date/Location */}
      <div className={styles.bottomSection}>
        <span className={styles.bottomText}>CAI</span>
      </div>
    </aside>
  );
}
