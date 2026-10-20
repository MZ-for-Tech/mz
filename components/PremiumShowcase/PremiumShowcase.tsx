
import Image from 'next/image';
import styles from './PremiumShowcase.module.css';

export default function PremiumShowcase() {

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.wrapper}>
        <div className={styles.leftCopy}>
          <h2>Systems built to be understood.</h2>
          <p>We train client teams to run what we build, informed by applied research.</p>
        </div>

        <div className={styles.container}>
          <div className={styles.grain}></div>

          {/* The abstract 3D shape image (Updated to green theme) */}
          <Image
            src="/green_glass.webp"
            alt=""
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
