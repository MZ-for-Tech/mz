
import Image from 'next/image';
import styles from './PremiumShowcase.module.css';

export default function PremiumShowcase() {

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.wrapper}>
        <div className={styles.leftCopy}>
          <h1>MZ builds software and AI systems in Cairo.</h1>
          <p>We train client teams to run what we build, informed by applied research.</p>
        </div>

        <div className={styles.container}>
          <div className={styles.grain}></div>

          {/* The abstract 3D shape image (Updated to green theme) */}
          <Image
            src="/green_glass.webp"
            alt="Abstract Green Glass 3D Shape"
            fill
            loading="eager"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={70}
            className={styles.demoImage}
          />
        </div>

        <div className={styles.rightCopy}>
          <p>We think in Systems, Statistics, and Sustainability.</p>
        </div>
      </div>

    </div>
  );
}
