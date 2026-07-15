
import Image from 'next/image';
import styles from './PremiumShowcase.module.css';
import GradualBlur from '../GradualBlur/GradualBlur';

export default function PremiumShowcase() {

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.wrapper}>
        <div className={styles.leftCopy}>
          <p>We are a research-driven technology company.</p>
          <p>We build proprietary software, deploy AI products, and transfer knowledge — in institutions that can&apos;t afford to guess.</p>
        </div>

        <div className={styles.container}>
          <div className={styles.grain}></div>

          {/* The abstract 3D shape image (Updated to green theme) */}
          <Image
            src="/green_glass.jpg"
            alt="Abstract Green Glass 3D Shape"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            loading="eager"
            className={styles.demoImage}
          />
        </div>

        <div className={styles.rightCopy}>
          <p>We think in Systems, Statistics, and Sustainability.</p>
        </div>
      </div>

      <GradualBlur
        target="parent"
        position="bottom"
        height="35vh"
        strength={2}
        divCount={5}
        curve="bezier"
        exponential={true}
        animated="scroll"
        opacity={1}
        className={styles.desktopBlur}
        style={{
          position: 'sticky',
          bottom: 0,
          gridColumn: 1,
          gridRow: 1,
          alignSelf: 'end',
          width: '100%',
          zIndex: 10,
        }}
      />
    </div>
  );
}
