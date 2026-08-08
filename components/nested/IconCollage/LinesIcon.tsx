import React from 'react';
import styles from './LinesIcon.module.css';

export default function LinesIcon() {
  return (
    <div className={styles.container}>
      <svg viewBox="0 0 1080 1080" className={styles.svg} xmlns="http://www.w3.org/2000/svg">
        <use href="#mz-icon-lines" />
      </svg>
    </div>
  );
}
