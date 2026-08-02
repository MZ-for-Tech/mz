import styles from './SquareIcon.module.css';

export default function SquareIcon() {
  return (
    <div className={styles.container}>
      <div className={styles.dvdBouncerX}>
        <div className={styles.dvdBouncerY}>
          <svg 
            viewBox="0 0 100 100" 
            className={styles.squareSvg}
            preserveAspectRatio="none"
          >
            <rect width="100" height="100" fill="#100f0d" />
          </svg>
        </div>
      </div>
    </div>
  );
}
