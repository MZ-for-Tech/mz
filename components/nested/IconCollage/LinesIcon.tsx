import React from 'react';
import styles from './LinesIcon.module.css';

export default function LinesIcon() {
  return (
    <div className={styles.container}>
      <svg viewBox="0 0 1080 1080" className={styles.svg} xmlns="http://www.w3.org/2000/svg">
        <g className={styles.line1}>
          <path d="M0 0 C356.4 0 712.8 0 1080 0 C1080 25.08 1080 50.16 1080 76 C723.6 76 367.2 76 0 76 C0 50.92 0 25.84 0 0 Z" fill="#242324" transform="translate(0,0)"/>
        </g>
        <g className={styles.line2}>
          <path d="M0 0 C356.4 0 712.8 0 1080 0 C1080 25.41 1080 50.82 1080 77 C723.6 77 367.2 77 0 77 C0 51.59 0 26.18 0 0 Z" fill="#242224" transform="translate(0,334)"/>
        </g>
        <g className={styles.line3}>
          <path d="M0 0 C356.4 0 712.8 0 1080 0 C1080 25.08 1080 50.16 1080 76 C723.6 76 367.2 76 0 76 C0 50.92 0 25.84 0 0 Z" fill="#242324" transform="translate(0,672)"/>
        </g>
        <g className={styles.line4}>
          <path d="M0 0 C356.4 0 712.8 0 1080 0 C1080 25.08 1080 50.16 1080 76 C723.6 76 367.2 76 0 76 C0 50.92 0 25.84 0 0 Z" fill="#242324" transform="translate(0,1004)"/>
        </g>
      </svg>
    </div>
  );
}
