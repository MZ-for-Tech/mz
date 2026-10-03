'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Check, ChevronDown, Languages, Moon, Sun } from 'lucide-react';

type Locale = 'en' | 'ar';
type Theme = 'light' | 'dark' | 'modern-light' | 'modern-dark';
const themeChangeEvent = 'research-theme-change';
const validThemes: Theme[] = ['light', 'dark', 'modern-light', 'modern-dark'];

function subscribeToResearchTheme(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(themeChangeEvent, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(themeChangeEvent, onChange);
  };
}

function getResearchTheme(): Theme {
  const storedTheme = window.localStorage.getItem('research-theme');
  return validThemes.includes(storedTheme as Theme) ? storedTheme as Theme : 'light';
}

function getServerResearchTheme(): Theme {
  return 'light';
}

function saveResearchTheme(theme: Theme) {
  window.localStorage.setItem('research-theme', theme);
  window.dispatchEvent(new Event(themeChangeEvent));
}

const THEMES: { label: string; family: 'academic' | 'modern' }[] = [
  { label: 'Academic Mode', family: 'academic' },
  { label: 'High-Contrast Mode', family: 'modern' },
];

function alternateLocalePath(pathname: string, locale: Locale) {
  const relativePath = pathname.replace(/^\/research(?:\/ar)?\/?/, '');
  if (!relativePath) return locale === 'ar' ? '/research/ar' : '/research';
  return locale === 'ar' ? `/research/ar/${relativePath}` : `/research/${relativePath}`;
}

export default function ResearchHeaderControls() {
  const pathname = usePathname();
  const locale: Locale = pathname === '/research/ar' || pathname.startsWith('/research/ar/') ? 'ar' : 'en';
  const [languageOpen, setLanguageOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeToResearchTheme, getResearchTheme, getServerResearchTheme);

  useEffect(() => {
    const site = document.querySelector<HTMLElement>('.tnh-site');
    site?.setAttribute('data-theme', theme);
  }, [theme]);

  const isDark = theme.endsWith('dark');
  const family = theme.startsWith('modern') ? 'modern' : 'academic';

  const toggleLightDark = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    saveResearchTheme(family === 'modern' ? `modern-${nextTheme}` as Theme : nextTheme);
  };

  const selectThemeFamily = (nextFamily: 'academic' | 'modern') => {
    const nextTheme = isDark ? 'dark' : 'light';
    saveResearchTheme(nextFamily === 'modern' ? `modern-${nextTheme}` as Theme : nextTheme);
    setThemeOpen(false);
  };

  return (
    <div className="research-header-controls">
      <div className="research-control-menu">
        <button
          type="button"
          className="research-language-trigger"
          onClick={() => {
            setLanguageOpen((open) => !open);
            setThemeOpen(false);
          }}
          aria-label={locale === 'ar' ? 'تغيير اللغة' : 'Switch language'}
          aria-expanded={languageOpen}
        >
          <Languages aria-hidden="true" />
          <span>{locale.toUpperCase()}</span>
          <ChevronDown aria-hidden="true" className={languageOpen ? 'is-open' : ''} />
        </button>
        {languageOpen && (
          <div className="research-control-dropdown research-language-dropdown" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <span className="research-dropdown-heading" lang={locale}>{locale === 'ar' ? 'اختر اللغة' : 'Select Language'}</span>
            <Link href={alternateLocalePath(pathname, 'en')} onClick={() => setLanguageOpen(false)}>
              <span><strong>English</strong></span>
              {locale === 'en' && <Check aria-label="Current language" />}
            </Link>
            <Link href={alternateLocalePath(pathname, 'ar')} onClick={() => setLanguageOpen(false)}>
              <span><strong lang="ar">العربية</strong></span>
              {locale === 'ar' && <Check aria-label="Current language" />}
            </Link>
          </div>
        )}
      </div>

      <div className="research-control-menu research-theme-menu">
        <button type="button" className="research-theme-trigger" onClick={toggleLightDark} aria-label="Toggle light and dark mode">
          {isDark ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
        </button>
        <button
          type="button"
          className="research-theme-options-trigger"
          onClick={() => {
            setThemeOpen((open) => !open);
            setLanguageOpen(false);
          }}
          aria-label="Theme options"
          aria-expanded={themeOpen}
        >
          <ChevronDown aria-hidden="true" className={themeOpen ? 'is-open' : ''} />
        </button>
        {themeOpen && (
          <div className="research-control-dropdown research-theme-dropdown">
            {THEMES.map((option) => (
              <button type="button" key={option.family} onClick={() => selectThemeFamily(option.family)}>
                <span>{option.label}</span>
                {family === option.family && <Check aria-label="Current mode" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
