"use client";

import { useState } from "react";
import styles from "./LanguageSwitcher.module.css";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState("en");

  return (
    <div className={styles.wrapper} role="group" aria-label="Language switcher">
      <button
        type="button"
        className={`${styles.btn} ${lang === "en" ? styles.active : ""}`}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className={styles.divider} aria-hidden="true" />
      <button
        type="button"
        className={`${styles.btn} ${lang === "ar" ? styles.active : ""}`}
        onClick={() => setLang("ar")}
        aria-pressed={lang === "ar"}
        aria-label="التبديل إلى العربية"
      >
        ع
      </button>
    </div>
  );
}
