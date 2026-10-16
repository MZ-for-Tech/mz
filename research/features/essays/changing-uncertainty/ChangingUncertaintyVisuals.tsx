'use client';

import { useId, useState } from 'react';
import ResearchFigure, { ResearchFigurePanel } from '@/research/components/ResearchFigure';
import './ChangingUncertaintyVisuals.css';

const PLOT = { width: 520, height: 250, left: 48, right: 506, top: 16, bottom: 207 };
const GAMMA_COEFFICIENTS = [
  676.5203681218851,
  -1259.1392167224028,
  771.3234287776531,
  -176.6150291621406,
  12.507343278686905,
  -0.13857109526572012,
  9.984369578019572e-6,
  1.5056327351493116e-7,
];

function logGamma(value: number): number {
  if (value < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * value)) - logGamma(1 - value);
  const shifted = value - 1;
  const sum = GAMMA_COEFFICIENTS.reduce((total, coefficient, index) => total + coefficient / (shifted + index + 1), 0.9999999999998099);
  const t = shifted + 7.5;
  return 0.9189385332046727 + (shifted + 0.5) * Math.log(t) - t + Math.log(sum);
}

function normalDensity(x: number) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function sameVarianceT(x: number, alpha: number) {
  const degrees = 2 * alpha;
  const scale = Math.sqrt((alpha - 1) / alpha);
  const standardized = x / scale;
  const logDensity = logGamma((degrees + 1) / 2)
    - logGamma(degrees / 2)
    - 0.5 * Math.log(degrees * Math.PI)
    - Math.log(scale)
    - ((degrees + 1) / 2) * Math.log1p((standardized * standardized) / degrees);
  return Math.exp(logDensity);
}

function curvePath(density: (x: number) => number) {
  return Array.from({ length: 101 }, (_, index) => {
    const x = -4 + (index / 100) * 8;
    const px = PLOT.left + ((x + 4) / 8) * (PLOT.right - PLOT.left);
    const py = PLOT.bottom - (density(x) / 0.5) * (PLOT.bottom - PLOT.top);
    return `${index === 0 ? 'M' : 'L'}${px.toFixed(2)} ${py.toFixed(2)}`;
  }).join(' ');
}

function DistributionPlot({ alpha }: { alpha: number }) {
  const x = (value: number) => PLOT.left + ((value + 4) / 8) * (PLOT.right - PLOT.left);
  const y = (value: number) => PLOT.bottom - (value / 0.5) * (PLOT.bottom - PLOT.top);

  return (
    <svg className="changing-uncertainty-chart" viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label={`Same-variance density comparison: Normal and Student's t with ${2 * alpha} degrees of freedom`}>
      {[0, 0.1, 0.2, 0.3, 0.4].map((tick) => (
        <g key={tick}>
          <line x1={PLOT.left} y1={y(tick)} x2={PLOT.right} y2={y(tick)} className="changing-uncertainty-gridline" />
          <text x={PLOT.left - 8} y={y(tick) + 4} textAnchor="end" className="changing-uncertainty-axis-label">{tick.toFixed(1)}</text>
        </g>
      ))}
      {[-4, -2, 0, 2, 4].map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} y1={PLOT.top} x2={x(tick)} y2={PLOT.bottom} className="changing-uncertainty-gridline changing-uncertainty-gridline-vertical" />
          <text x={x(tick)} y={PLOT.bottom + 19} textAnchor="middle" className="changing-uncertainty-axis-label">{tick}</text>
        </g>
      ))}
      <path d={curvePath(normalDensity)} className="changing-uncertainty-normal-line" />
      <path d={curvePath((value) => sameVarianceT(value, alpha))} className="changing-uncertainty-student-line" />
      <text x={(PLOT.left + PLOT.right) / 2} y={PLOT.height - 3} textAnchor="middle" className="changing-uncertainty-axis-label">Return, in standard deviations</text>
    </svg>
  );
}

export function ChangingUncertaintyMixture() {
  const [alpha, setAlpha] = useState(2.5);
  const inputId = useId();
  const degrees = 2 * alpha;

  return (
    <ResearchFigure
      number={1}
      caption="Vary the Gamma shape α while keeping the marginal variance at one. Smaller α allows more variation in precision and produces heavier tails."
      dataInteractive="changing-uncertainty-mixture"
    >
      <ResearchFigurePanel className="changing-uncertainty-panel">
        <div className="changing-uncertainty-heading">
          <span>THE SAME VARIANCE</span>
          <output htmlFor={inputId}>α = {alpha.toFixed(2)} · ν = {degrees.toFixed(1)}</output>
        </div>
        <DistributionPlot alpha={alpha} />
        <div className="changing-uncertainty-legend" aria-label="Distribution legend">
          <span><i className="changing-uncertainty-legend-normal" /> Normal</span>
          <span><i className="changing-uncertainty-legend-student" /> Student’s t mixture</span>
        </div>
        <label className="changing-uncertainty-control" htmlFor={inputId}>
          <span>Gamma shape, α</span>
          <input
            id={inputId}
            type="range"
            min="1.25"
            max="10"
            step="0.25"
            value={alpha}
            onChange={(event) => setAlpha(Number(event.currentTarget.value))}
            aria-valuetext={`Gamma shape ${alpha.toFixed(2)}, Student's t degrees of freedom ${degrees.toFixed(1)}`}
          />
          <span className="changing-uncertainty-control-limits"><span>More variable precision</span><span>Less variable precision</span></span>
        </label>
        <p className="changing-uncertainty-note">For this comparison, β = α − 1, so both curves have variance 1.</p>
      </ResearchFigurePanel>
    </ResearchFigure>
  );
}

const CALIBRATION_PLOT = { width: 520, height: 300, left: 52, right: 500, top: 16, bottom: 244 };
const PROBABILITY_BUCKETS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

function observedRate(forecast: number, offset: number) {
  return Math.max(0, Math.min(100, forecast + offset));
}

function CalibrationPlot({ selected, offset }: { selected: number; offset: number }) {
  const x = (value: number) => CALIBRATION_PLOT.left + (value / 100) * (CALIBRATION_PLOT.right - CALIBRATION_PLOT.left);
  const y = (value: number) => CALIBRATION_PLOT.bottom - (value / 100) * (CALIBRATION_PLOT.bottom - CALIBRATION_PLOT.top);
  const modelPath = PROBABILITY_BUCKETS.map((forecast, index) => `${index === 0 ? 'M' : 'L'}${x(forecast)} ${y(observedRate(forecast, offset))}`).join(' ');

  return (
    <svg className="changing-uncertainty-chart" viewBox={`0 0 ${CALIBRATION_PLOT.width} ${CALIBRATION_PLOT.height}`} role="img" aria-label="Calibration plot comparing forecast probabilities with observed event rates">
      {[0, 25, 50, 75, 100].map((tick) => (
        <g key={tick}>
          <line x1={CALIBRATION_PLOT.left} y1={y(tick)} x2={CALIBRATION_PLOT.right} y2={y(tick)} className="changing-uncertainty-gridline" />
          <line x1={x(tick)} y1={CALIBRATION_PLOT.top} x2={x(tick)} y2={CALIBRATION_PLOT.bottom} className="changing-uncertainty-gridline changing-uncertainty-gridline-vertical" />
          <text x={CALIBRATION_PLOT.left - 8} y={y(tick) + 4} textAnchor="end" className="changing-uncertainty-axis-label">{tick}%</text>
          <text x={x(tick)} y={CALIBRATION_PLOT.bottom + 19} textAnchor="middle" className="changing-uncertainty-axis-label">{tick}%</text>
        </g>
      ))}
      <path d={`M${x(0)} ${y(0)} L${x(100)} ${y(100)}`} className="changing-uncertainty-ideal-line" />
      <path d={modelPath} className="changing-uncertainty-student-line" />
      {PROBABILITY_BUCKETS.map((forecast) => (
        <circle
          key={forecast}
          cx={x(forecast)}
          cy={y(observedRate(forecast, offset))}
          r={forecast === selected ? 6 : 3.5}
          className={forecast === selected ? 'changing-uncertainty-selected-point' : 'changing-uncertainty-model-point'}
        />
      ))}
      <text x={(CALIBRATION_PLOT.left + CALIBRATION_PLOT.right) / 2} y={CALIBRATION_PLOT.height - 3} textAnchor="middle" className="changing-uncertainty-axis-label">Forecast probability</text>
      <text transform={`translate(14 ${(CALIBRATION_PLOT.top + CALIBRATION_PLOT.bottom) / 2}) rotate(-90)`} textAnchor="middle" className="changing-uncertainty-axis-label">Observed event rate</text>
    </svg>
  );
}

export function ForecastCalibration() {
  const [forecast, setForecast] = useState(50);
  const [offset, setOffset] = useState(0);
  const forecastId = useId();
  const offsetId = useId();
  const observed = observedRate(forecast, offset);

  return (
    <ResearchFigure
      number={2}
      caption="A calibrated model’s points follow the diagonal: events assigned a probability occur at about that rate across comparable cases. The offset here is illustrative, not observed data."
      dataInteractive="forecast-calibration"
    >
      <ResearchFigurePanel className="changing-uncertainty-panel">
        <div className="changing-uncertainty-heading">
          <span>FORECAST VS. OUTCOME</span>
          <output htmlFor={forecastId}>{forecast}% forecast → {observed}% observed</output>
        </div>
        <CalibrationPlot selected={forecast} offset={offset} />
        <div className="changing-uncertainty-legend" aria-label="Calibration plot legend">
          <span><i className="changing-uncertainty-legend-ideal" /> Perfect calibration</span>
          <span><i className="changing-uncertainty-legend-student" /> Illustrative model</span>
        </div>
        <div className="changing-uncertainty-controls">
          <label className="changing-uncertainty-control" htmlFor={forecastId}>
            <span>Forecast bucket</span>
            <output>{forecast}%</output>
            <input id={forecastId} type="range" min="10" max="90" step="10" value={forecast} onChange={(event) => setForecast(Number(event.currentTarget.value))} />
          </label>
          <label className="changing-uncertainty-control" htmlFor={offsetId}>
            <span>Observed-rate offset</span>
            <output>{offset > 0 ? '+' : ''}{offset}%</output>
            <input id={offsetId} type="range" min="-20" max="20" step="5" value={offset} onChange={(event) => setOffset(Number(event.currentTarget.value))} aria-valuetext={`${offset > 0 ? 'plus ' : ''}${offset} percentage points`} />
          </label>
        </div>
        <p className="changing-uncertainty-note">At {forecast}%, the illustrative model sees about {Math.round(observed)} events per 100 comparable forecasts.</p>
      </ResearchFigurePanel>
    </ResearchFigure>
  );
}
