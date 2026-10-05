'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ResearchFigure, { ResearchFigurePanel } from '@/research/components/ResearchFigure';
import './DarkVeilRadialFunction.css';

const RadialSurface3D = dynamic(() => import('./DarkVeilRadialSurface3D'), {
  ssr: false,
  loading: () => <div className="darkveil-radial-loading" aria-hidden="true" />,
});

const spectrum = ['#5e4fa2', '#3288bd', '#66c2a5', '#abdda4', '#e6f598', '#fee08b', '#fdae61', '#f46d43', '#d53e4f'];
const MAX_RADIUS = Math.sqrt(5 * 5 + 5 * 5);
const CENTER_X = 400;
const CENTER_Y = 250;
const SCALE = 48;
const CONTOUR_COUNT = 28;

function interpolateColor(t: number) {
  const position = Math.max(0, Math.min(1, t)) * (spectrum.length - 1);
  const index = Math.floor(position);
  const mix = position - index;
  const from = spectrum[index];
  const to = spectrum[Math.min(index + 1, spectrum.length - 1)];
  const channels = [1, 3, 5].map((offset) => {
    const start = Number.parseInt(from.slice(offset, offset + 2), 16);
    const end = Number.parseInt(to.slice(offset, offset + 2), 16);
    return Math.round(start + (end - start) * mix).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

function RadialContours() {
  const gridLines = Array.from({ length: 11 }, (_, index) => {
    const position = CENTER_X - 5 * SCALE + index * SCALE;
    return position;
  });
  const contours = Array.from({ length: CONTOUR_COUNT }, (_, index) => {
    const level = 1 - (index + 1) / (CONTOUR_COUNT + 1);
    return { radius: MAX_RADIUS * level * SCALE, color: interpolateColor(level) };
  });

  return (
    <svg className="darkveil-radial-contours" viewBox="100 0 600 500" role="img" aria-label="Concentric contour map of the radial distance function">
      <defs>
        <clipPath id="darkveil-radial-plot-clip"><rect x="160" y="10" width="480" height="480" /></clipPath>
      </defs>
      <rect x="160" y="10" width="480" height="480" fill={interpolateColor(1)} />
      <g clipPath="url(#darkveil-radial-plot-clip)">
        {contours.map((contour, index) => (
          <circle key={index} cx={CENTER_X} cy={CENTER_Y} r={contour.radius} fill={contour.color} className="darkveil-radial-contour" />
        ))}
        <circle cx={CENTER_X} cy={CENTER_Y} r={MAX_RADIUS * SCALE / (CONTOUR_COUNT + 1)} fill={interpolateColor(0)} className="darkveil-radial-contour" />
        {gridLines.map((position, index) => (
          <g key={index}>
            <line x1={position} y1="10" x2={position} y2="490" className="darkveil-radial-gridline" />
            <line x1="160" y1={10 + index * SCALE} x2="640" y2={10 + index * SCALE} className="darkveil-radial-gridline" />
          </g>
        ))}
        <line x1="160" y1={CENTER_Y} x2="640" y2={CENTER_Y} className="darkveil-radial-axis" />
        <line x1={CENTER_X} y1="10" x2={CENTER_X} y2="490" className="darkveil-radial-axis" />
        <circle cx={CENTER_X} cy={CENTER_Y} r="3.5" className="darkveil-radial-origin" />
      </g>
      <text x="628" y={CENTER_Y + 5} className="darkveil-radial-axis-label">x</text>
      <text x={CENTER_X + 8} y="30" className="darkveil-radial-axis-label">y</text>
      <text x={CENTER_X + 10} y={CENTER_Y + 20} className="darkveil-radial-center-label">0</text>
    </svg>
  );
}

export default function DarkVeilRadialFunction({ locale }: { locale: 'en' | 'ar' }) {
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [theme, setTheme] = useState({ isDark: false, paper: '#f5f2ed' });
  const isArabic = locale === 'ar';

  useEffect(() => {
    const site = document.querySelector('.tnh-site');
    if (!site) return;

    const updateTheme = () => {
      const styles = getComputedStyle(site);
      setTheme({
        isDark: site.getAttribute('data-theme')?.endsWith('dark') ?? false,
        paper: styles.getPropertyValue('--paper-val').trim() || '#f5f2ed',
      });
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(site, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const caption = isArabic
    ? 'المسافة من المركز التي تضيفها DarkVeil إلى إحداثيات كل بكسل.'
    : 'The distance from the center that DarkVeil adds to each pixel’s coordinates.';

  return (
    <ResearchFigure
      number={4}
      caption={caption}
      locale={locale}
      className="darkveil-radial-figure"
      dataInteractive="darkveil-radial-function"
    >
      <ResearchFigurePanel className="darkveil-radial-shell">
        <header className="darkveil-radial-header">
          <div>
            <code>f(x, y) = √(x² + y²)</code>
          </div>
          <div className="darkveil-radial-toggle" role="group" aria-label={isArabic ? 'طريقة العرض' : 'View mode'}>
            <button type="button" onClick={() => setMode('2d')} aria-pressed={mode === '2d'}>{isArabic ? 'خطوط الكنتور' : '2D contours'}</button>
            <button type="button" onClick={() => setMode('3d')} aria-pressed={mode === '3d'}>3D</button>
          </div>
        </header>
        <div className="darkveil-radial-viewport">
          {mode === '2d' ? <RadialContours /> : <RadialSurface3D isDark={theme.isDark} paper={theme.paper} />}
        </div>
        <p className="darkveil-radial-hint">
          {isArabic
            ? mode === '2d' ? 'كل دائرة تمثل قيمة ثابتة للمسافة من المركز.' : 'اسحب لتدوير السطح؛ واستخدم التمرير للتقريب.'
            : mode === '2d' ? 'Each contour marks an equal distance from the center.' : 'Drag to rotate the surface; scroll to zoom.'}
        </p>
      </ResearchFigurePanel>
    </ResearchFigure>
  );
}
