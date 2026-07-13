'use client';

import React, { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check initial theme
    const savedTheme = localStorage.getItem('mz-theme');
    if (savedTheme === 'light') {
      setIsLight(true);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isLight;
    setIsLight(newTheme);
    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('mz-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('mz-theme', 'dark');
    }
  };

  return (
    <button 
      className={styles.themeToggle} 
      onClick={toggleTheme}
      aria-label="Toggle Light Mode"
    >
      {isLight ? <Moon className={styles.icon} /> : <Sun className={styles.icon} />}
    </button>
  );
}
