"use client";

import { useState } from "react";
import styles from "./page.module.css";
import PillNav from "@/components/PillNav/PillNav";
import { Footer } from "@/components/Footer/Footer";
import DarkVeil, { DARKVEIL_THEME } from "@/components/DarkVeil/DarkVeil";
import ObfuscatedEmail from "@/components/ObfuscatedEmail/ObfuscatedEmail";

const NAV_ITEMS = [
  { label: 'Work', href: '/#work' },
  { label: 'Products', href: '/#products' },
  { label: 'Services', href: '/#services' },
  { label: 'Contact', href: '/start' }
];

const CATEGORIES = [
  "Website",
  "ERP",
  "Internal Systems",
  "E-Commerce",
  "AI & Machine Learning",
  "Data Analysis",
  "Workshops",
  "Research Collaboration"
];

const BUDGETS = [
  "Under $5,000",
  "$5,000 — $15,000",
  "$15,000 — $50,000",
  "$50,000+",
  "Let's discuss"
];

const TIMELINES = [
  "Under 1 month",
  "1 — 3 months",
  "3 — 6 months",
  "6+ months",
  "Ongoing / Retainer"
];

const REFERRALS = [
  "Referral",
  "Academic / Institution",
  "Search",
  "Social Media",
  "The Null Hypothesis",
  "Other"
];

export default function StartProjectPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100svh", zIndex: -1 }}>
          {/* Colors unified with the hero, but the static default variant —
              these pages should not carry the hero's wave motion. */}
          <DarkVeil {...DARKVEIL_THEME} variant="default" />
        </div>

        <PillNav
          items={NAV_ITEMS}
        />

        <main className={styles.main}>
          {/* Sticky Left Column */}
          <div className={styles.leftCol}>
            <div className={styles.stickyContent}>
              <h1 className={styles.title}>
                So.<br />
                What do you wanna talk about?              </h1>
              <div className={styles.contactDetails}>
                <div className={styles.contactLabel}>GENERAL INQUIRIES</div>
                <ObfuscatedEmail user="hello" domain="mzfortech.com" className={styles.contactEmail} />

                <div className={styles.faqText}>
                  Want to learn about our process?<br />
                  <a href="#" className={styles.faqLink}>Explore our methodology</a>
                </div>
              </div>
            </div>
          </div>

          {/* Scrolling Right Column (Form) */}
          <div className={styles.rightCol}>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>

              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>01. Expertise Required</h2>
                <div className={styles.categoriesList}>
                  {CATEGORIES.map(category => {
                    const isSelected = selectedCategories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        className={`${styles.categoryPill} ${isSelected ? styles.selected : ''}`}
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>02. Project Scope</h2>

                <div className={`${styles.inputGroup} ${styles.messageGroup}`}>
                  <label className={styles.label}>Brief description</label>
                  <textarea className={styles.textarea} rows={4} placeholder="Share your vision, challenges, and desired outcomes..."></textarea>
                </div>
              </div>

              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>03. Budget Range</h2>
                <div className={styles.categoriesList}>
                  {BUDGETS.map(budget => {
                    const isSelected = selectedBudget === budget;
                    return (
                      <button
                        key={budget}
                        type="button"
                        className={`${styles.categoryPill} ${isSelected ? styles.selected : ''}`}
                        onClick={() => setSelectedBudget(budget === selectedBudget ? null : budget)}
                      >
                        {budget}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>04. Timeline</h2>
                <div className={styles.categoriesList}>
                  {TIMELINES.map(timeline => {
                    const isSelected = selectedTimeline === timeline;
                    return (
                      <button
                        key={timeline}
                        type="button"
                        className={`${styles.categoryPill} ${isSelected ? styles.selected : ''}`}
                        onClick={() => setSelectedTimeline(timeline === selectedTimeline ? null : timeline)}
                      >
                        {timeline}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>05. How did you find us?</h2>
                <div className={styles.categoriesList}>
                  {REFERRALS.map(ref => {
                    const isSelected = selectedReferral === ref;
                    return (
                      <button
                        key={ref}
                        type="button"
                        className={`${styles.categoryPill} ${isSelected ? styles.selected : ''}`}
                        onClick={() => setSelectedReferral(ref === selectedReferral ? null : ref)}
                      >
                        {ref}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.formSection} style={{ borderBottom: 'none', paddingBottom: '0' }}>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup} style={{ flex: 1 }}>
                    <label className={styles.label}>Email Address</label>
                    <input type="email" className={styles.input} placeholder="So we can reach you..." />
                  </div>

                  <div className={`${styles.inputGroup} ${styles.fileGroup}`}>
                    <label className={styles.label}>
                      {/* lucide paperclip (inlined; see PERFORMANCE_REAUDIT §7) */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }} aria-hidden="true"><path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" /></svg> Attachments
                    </label>
                    <input type="file" id="file-upload" className={styles.fileInput} onChange={handleFileChange} />
                    <label htmlFor="file-upload" className={styles.fileLabel}>
                      {fileName ? fileName : 'Upload files...'}
                    </label>
                  </div>
                </div>
              </div>

              <div className={`${styles.formSection} ${styles.submitSection}`}>
                <button type="submit" className={styles.submitButton}>
                  SEND BRIEF{' '}
                  {/* lucide arrow-right (inlined; see PERFORMANCE_REAUDIT §7) */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.submitIcon} aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </button>
              </div>

            </form>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
