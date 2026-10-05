'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import ResearchFigure, { ResearchFigurePanel } from '@/research/components/ResearchFigure';
import './DarkVeilTimeDiagram.css';

const SIGNALS = [
  { id: 'in0', frequency: 0.3, color: 'darkveil-time-signal-a' },
  { id: 'in1', frequency: 0.69, color: 'darkveil-time-signal-b' },
  { id: 'in2', frequency: 0.44, color: 'darkveil-time-signal-c' },
] as const;

const CHART = { width: 500, height: 190, left: 50, right: 478, top: 24, rowGap: 55 };

function signalValue(frequency: number, time: number) {
  return 0.1 * Math.sin(frequency * time);
}

function makeSignalPath(frequency: number, time: number) {
  const samples = 100;
  const duration = 14;
  return Array.from({ length: samples }, (_, index) => {
    const progress = index / (samples - 1);
    const x = CHART.left + progress * (CHART.right - CHART.left);
    const sampleTime = time - duration + progress * duration;
    const value = signalValue(frequency, sampleTime) / 0.1;
    const y = CHART.top + SIGNALS.findIndex((signal) => signal.frequency === frequency) * CHART.rowGap - value * 16;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
}

function warpPoint(x: number, y: number, time: number, amount: number) {
  return {
    x: x + amount * Math.sin(y * Math.PI * 2 + time * 0.5) * 0.05,
    y: y + amount * Math.cos(x * Math.PI * 2 + time * 0.5) * 0.05,
  };
}

function mapCoordinate(value: number, center: number, extent: number) {
  return center + value * extent;
}

function makeWarpPath(axis: 'x' | 'y', fixed: number, time: number, amount: number) {
  const samples = 48;
  return Array.from({ length: samples }, (_, index) => {
    const moving = -1 + (index / (samples - 1)) * 2;
    const point = axis === 'x'
      ? warpPoint(moving, fixed, time, amount)
      : warpPoint(fixed, moving, time, amount);
    const x = mapCoordinate(point.x, 150, 100);
    const y = mapCoordinate(-point.y, 115, 88);
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
}

function SignalPlot({ time, locale }: { time: number; locale: 'en' | 'ar' }) {
  const isArabic = locale === 'ar';
  return (
    <svg className="darkveil-time-signal-chart" viewBox={`0 0 ${CHART.width} ${CHART.height}`} role="img" aria-label={isArabic ? 'ثلاث إشارات جيبية متغيرة مع الزمن' : 'Three sine signals changing over time'}>
      {SIGNALS.map((signal, index) => {
        const y = CHART.top + index * CHART.rowGap;
        const value = signalValue(signal.frequency, time);
        return (
          <g key={signal.id} className={signal.color}>
            <line x1={CHART.left} y1={y} x2={CHART.right} y2={y} className="darkveil-time-signal-axis" />
            <path d={makeSignalPath(signal.frequency, time)} className="darkveil-time-signal-line" />
            <circle cx={CHART.right} cy={y - (value / 0.1) * 16} r="4" className="darkveil-time-signal-dot" />
            <text x="4" y={y + 4} className="darkveil-time-signal-label">{signal.id}</text>
            <text x={CHART.right} y={y + 18} textAnchor="end" className="darkveil-time-signal-value">{value >= 0 ? '+' : ''}{value.toFixed(3)}</text>
          </g>
        );
      })}
      <line x1={CHART.right} y1="8" x2={CHART.right} y2="174" className="darkveil-time-playhead" />
      <text x={CHART.left} y="181" className="darkveil-time-chart-start">{isArabic ? 'قبل' : 'past'}</text>
      <text x={CHART.right} y="181" textAnchor="end" className="darkveil-time-chart-now">{isArabic ? 'الآن' : 'now'}</text>
    </svg>
  );
}

function CoordinateField({ time, amount, locale }: { time: number; amount: number; locale: 'en' | 'ar' }) {
  const original = { x: -0.38, y: 0.28 };
  const warped = warpPoint(original.x, original.y, time, amount);
  const originalX = mapCoordinate(original.x, 150, 100);
  const originalY = mapCoordinate(-original.y, 115, 88);
  const warpedX = mapCoordinate(warped.x, 150, 100);
  const warpedY = mapCoordinate(-warped.y, 115, 88);
  const isArabic = locale === 'ar';

  return (
    <svg className="darkveil-time-coordinate-field" viewBox="0 0 300 230" role="img" aria-label={isArabic ? 'شبكة إحداثيات ونقطة بكسل قبل الإزاحة وبعدها' : 'Coordinate grid and pixel position before and after the warp'}>
      {[-0.8, -0.4, 0, 0.4, 0.8].map((coordinate) => (
        <path key={`x-${coordinate}`} d={makeWarpPath('x', coordinate, time, amount)} className="darkveil-time-gridline" />
      ))}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((coordinate) => (
        <path key={`y-${coordinate}`} d={makeWarpPath('y', coordinate, time, amount)} className="darkveil-time-gridline" />
      ))}
      <line x1="48" y1="115" x2="252" y2="115" className="darkveil-time-coordinate-axis" />
      <line x1="150" y1="25" x2="150" y2="205" className="darkveil-time-coordinate-axis" />
      <line x1={originalX} y1={originalY} x2={warpedX} y2={warpedY} className="darkveil-time-displacement" />
      <circle cx={originalX} cy={originalY} r="5" className="darkveil-time-original-point" />
      <circle cx={warpedX} cy={warpedY} r="5" className="darkveil-time-warped-point" />
      <text x={originalX - 12} y={originalY + 19} textAnchor="end" className="darkveil-time-point-label">uv</text>
      <text x={warpedX + 12} y={warpedY - 10} className="darkveil-time-point-label">uv′</text>
    </svg>
  );
}

export default function DarkVeilTimeDiagram({ locale }: { locale: 'en' | 'ar' }) {
  const [time, setTime] = useState(0);
  const [warpAmount, setWarpAmount] = useState(2);
  const reduceMotion = Boolean(useReducedMotion());
  const displayTime = reduceMotion ? 2.5 : time;
  const isArabic = locale === 'ar';

  useEffect(() => {
    if (reduceMotion) return;

    let frame = 0;
    let lastUpdate = 0;
    const start = performance.now();
    const tick = (now: number) => {
      if (now - lastUpdate >= 40) {
        setTime((now - start) / 1000);
        lastUpdate = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion]);

  return (
    <ResearchFigure
      number={5}
      caption={isArabic
        ? 'تُظهر الإشارات الثلاث المتحركة مدخلات الشبكة؛ وتبيّن الشبكة كيف يمكن للوقت إزاحة إحداثيات البكسل.'
        : 'The moving traces show the network’s time inputs; the grid shows how time can shift a pixel’s coordinates.'}
      locale={locale}
      className="darkveil-time-figure"
      dataInteractive="darkveil-time-paths"
    >
      <ResearchFigurePanel className="darkveil-time-panel">
        <div className="darkveil-time-header">
          <span>{isArabic ? 'الزمن' : 'TIME'}</span>
          <code>uTime</code>
          <output>{displayTime.toFixed(1)}s</output>
        </div>

        <div className="darkveil-time-visuals">
          <section className="darkveil-time-card">
            <div className="darkveil-time-card-heading">
              <h3>{isArabic ? 'إشارات تدخل الشبكة' : 'Signals into the network'}</h3>
              <span>{isArabic ? 'مدخلات حية' : 'LIVE INPUTS'}</span>
            </div>
            <SignalPlot time={displayTime} locale={locale} />
            <p>{isArabic ? 'ثلاث موجات بترددات مختلفة' : 'Three waves, each at a different frequency'}</p>
          </section>

          <section className="darkveil-time-card">
            <div className="darkveil-time-card-heading">
              <h3>{isArabic ? 'إزاحة الإحداثيات' : 'Coordinate warp'}</h3>
              <label htmlFor={`darkveil-warp-${locale}`}>
                <span>uWarp</span>
                <output>{warpAmount.toFixed(1)}×</output>
              </label>
            </div>
            <CoordinateField time={displayTime} amount={warpAmount} locale={locale} />
            <input
              id={`darkveil-warp-${locale}`}
              className="darkveil-time-warp-slider"
              type="range"
              min="0"
              max="4"
              step="0.5"
              value={warpAmount}
              onChange={(event) => setWarpAmount(Number(event.currentTarget.value))}
              aria-label={isArabic ? 'مقدار إزاحة الإحداثيات' : 'Coordinate warp amount'}
            />
            <p>{isArabic ? 'حرّك المنزلق لترى موضع البكسل يتغير مع الزمن. القيمة الافتراضية للمثال أعلاه هي 0.' : 'Move the slider to see a pixel’s position shift over time. The demo above uses 0 by default.'}</p>
          </section>
        </div>

        <div className="darkveil-time-merge" aria-label={isArabic ? 'مدخلات تمريرة الشبكة' : 'Inputs to the network forward pass'}>
          <span className="darkveil-time-merge-bracket" aria-hidden="true" />
          <span className="darkveil-time-merge-arrow" aria-hidden="true">↓</span>
          <div className="darkveil-time-network">
            <span>{isArabic ? 'الشبكة العصبية' : 'FROZEN CPPN'}</span>
            <code>f(uv′, in₀, in₁, in₂)</code>
          </div>
          <span className="darkveil-time-output-arrow" aria-hidden="true">→</span>
          <div className="darkveil-time-rgb" aria-label={isArabic ? 'قنوات الأحمر والأخضر والأزرق' : 'Red, green, and blue channels'}>
            <i /><i /><i />
            <span>RGB</span>
          </div>
        </div>
      </ResearchFigurePanel>
    </ResearchFigure>
  );
}
