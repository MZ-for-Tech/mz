"use client";

import { useEffect, useId, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { motion, MotionConfig } from "framer-motion";
import ResearchFigure, {
  ResearchFigurePanel,
} from "@/research/components/ResearchFigure";
import SafeLatex from "@/research/components/SafeLatex";
import figuresJson from "@/research/source/l1/L1_Deep_Reading_Package_Equation_Details/L1_Deep_Reading_Package/interactive/src/figures.generated.json";
import {
  soft,
  linspace,
  sum,
  norm1,
  norm2,
  matvec,
  ridge,
  lasso,
  contact,
} from "@/research/source/l1/L1_Deep_Reading_Package_Equation_Details/L1_Deep_Reading_Package/interactive/src/math.mjs";
import "./L1Visuals.css";

type Locale = "en" | "ar";
type LocalizedText = string | Record<Locale, string>;
// Controls share a state object with numeric sliders and string selects.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FigureState = Record<string, any>;
type FigureControl = {
  key: string;
  type: "range" | "select";
  label: LocalizedText;
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: LocalizedText }[];
};
type FigureData = {
  // Generated figure entries have different data shapes; the renderer selects the shape by config.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  selected: number[][];
  vectors: number[][];
  preferred: number[];
  yreference: number[];
  X: number[][];
  Xreference: number[][];
  y: number[];
  row: number[];
  matrix: number[][];
  singularValues: number[];
  stages: LocalizedText[];
  history: [number, number][];
  references: { url: string; title: string }[];
};
type FigureConfig = {
  id: string;
  renderer: string;
  title: LocalizedText;
  caption: LocalizedText;
  controls: FigureControl[];
  data: FigureData;
  theme: { additional_plot_color: { olive: string; gold: string } };
  framerMotion: { duration: number; ease: "easeOut" };
  teaching?: { try: LocalizedText; notice: LocalizedText };
};
type PlotSeries = {
  label?: string;
  points: [number, number][];
  color?: string;
  width?: number;
  dash?: string;
};
type PlotPoint = {
  x: number;
  y: number;
  label?: string;
  color?: string;
  open?: boolean;
};
type BarSeries = { label: LocalizedText; values: number[]; color?: string };

const figures = figuresJson as unknown as FigureConfig[];
const fmt = (x: number) => (Math.abs(x) < 1e-9 ? "0" : Number(x.toFixed(4)).toString());
const tickfmt = (x: number) =>
  Math.abs(x) < 1e-9 ? "0" : Number(x.toFixed(2)).toString();
const vfmt = (a: number[]) => "(" + a.map(fmt).join(", ") + ")";
const text = (value: LocalizedText, lang: Locale) => (typeof value === "string" ? value : value[lang]);
const color = (i: number) =>
  ["var(--accent)", "var(--olive)", "var(--pencil)", "var(--gold)"][i % 4];
const samples = (f: (x: number) => number, a: number, b: number, n = 161): [number, number][] => linspace(a, b, n).map((x) => [x, f(x)]);

function Plot({
  series = [],
  points = [],
  x = [-3, 3],
  y = [-3, 3],
  xlabel = "x",
  ylabel = "y",
  equal = false,
  xBand,
  yTicks,
  xTicks,
  formatYTick,
  axesAtBounds = false,
  children,
}: {
  series?: PlotSeries[];
  points?: PlotPoint[];
  x?: [number, number];
  y?: [number, number];
  xlabel?: string;
  ylabel?: string;
  equal?: boolean;
  xBand?: [number, number];
  yTicks?: number[];
  xTicks?: number[];
  formatYTick?: (value: number) => string;
  axesAtBounds?: boolean;
  children?: ReactNode;
}) {
  const clipId = useId().replace(/:/g, "");
  const [probe, setProbe] = useState<{ x: number; y: number; px: number; py: number; label?: string } | null>(null);
  const W = 720,
    H = equal ? 720 : 420,
    L = 68,
    R = 25,
    T = 25,
    B = 65;
  const width = W - L - R,
    height = H - T - B;
  const xd = [...x];
  let yd = [...y];
  if (equal) {
    const ratio = width / height;
    const cy = (y[0] + y[1]) / 2;
    const half = (x[1] - x[0]) / ratio / 2;
    yd = [cy - half, cy + half];
  }
  const px = (a: number) => L + ((a - xd[0]) / (xd[1] - xd[0])) * width;
  const py = (b: number) => T + ((yd[1] - b) / (yd[1] - yd[0])) * height;
  const path = (pts: [number, number][]) =>
    pts
      .map(
        ([a, b], i) =>
          `${i ? "L" : "M"}${px(a).toFixed(3)},${py(b).toFixed(3)}`,
      )
      .join(" ");
  const tx = xTicks ?? linspace(xd[0], xd[1], 5),
    ty = yTicks ?? linspace(yd[0], yd[1], 5);
  return (
    <div className="plot-wrap" dir="ltr">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${ylabel} versus ${xlabel}`}
        onPointerMove={(event) => {
          const matrix = event.currentTarget.getScreenCTM();
          if (!matrix) return;
          const point = event.currentTarget.createSVGPoint();
          point.x = event.clientX;
          point.y = event.clientY;
          const local = point.matrixTransform(matrix.inverse());
          if (local.x < L || local.x > W - R || local.y < T || local.y > H - B) {
            setProbe(null);
            return;
          }
          const cursorX = xd[0] + ((local.x - L) / width) * (xd[1] - xd[0]);
          const cursorY = yd[1] - ((local.y - T) / height) * (yd[1] - yd[0]);
          let nearest: { x: number; y: number; px: number; py: number; label: string; distance: number } | null = null;
          for (const line of series) {
            for (const [xValue, yValue] of line.points) {
              const pointX = px(xValue);
              const pointY = py(yValue);
              const distance = Math.hypot(pointX - local.x, pointY - local.y);
              if (distance < 18 && (!nearest || distance < nearest.distance)) {
                nearest = { x: xValue, y: yValue, px: pointX, py: pointY, label: line.label ?? "", distance };
              }
            }
          }
          setProbe(nearest
            ? { x: nearest.x, y: nearest.y, px: nearest.px, py: nearest.py, label: nearest.label || undefined }
            : { x: cursorX, y: cursorY, px: local.x, py: local.y });
        }}
        onPointerLeave={() => setProbe(null)}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={L} y={T} width={width} height={height} />
          </clipPath>
        </defs>
        {xBand && xBand[1] > xBand[0] && (
          <g className="plot-band" pointerEvents="none">
            <rect
              x={px(Math.max(xd[0], xBand[0]))}
              y={T}
              width={Math.max(0, px(Math.min(xd[1], xBand[1])) - px(Math.max(xd[0], xBand[0])))}
              height={height}
            />
            {[xBand[0], xBand[1]].map((value) => (
              <line key={value} x1={px(value)} x2={px(value)} y1={T} y2={H - B} />
            ))}
          </g>
        )}
        {tx.map((a) => (
          <g key={"x" + a}>
            <line className="grid" x1={px(a)} x2={px(a)} y1={T} y2={H - B} />
            <text className="tick" x={px(a)} y={H - B + 24} textAnchor="middle">
              {tickfmt(a)}
            </text>
          </g>
        ))}
        {ty.map((b) => (
          <g key={"y" + b}>
            <line className="grid" x1={L} x2={W - R} y1={py(b)} y2={py(b)} />
            <text className="tick" x={L - 10} y={py(b) + 5} textAnchor="end">
              {formatYTick ? formatYTick(b) : tickfmt(b)}
            </text>
          </g>
        ))}
        {axesAtBounds ? (
          <line className="axis" x1={L} x2={W - R} y1={py(yd[0])} y2={py(yd[0])} />
        ) : xd[0] <= 0 && xd[1] >= 0 ? (
          <line className="axis" x1={px(0)} x2={px(0)} y1={T} y2={H - B} />
        ) : null}
        {axesAtBounds ? (
          <line className="axis" x1={px(xd[0])} x2={px(xd[0])} y1={T} y2={H - B} />
        ) : yd[0] <= 0 && yd[1] >= 0 ? (
          <line className="axis" x1={L} x2={W - R} y1={py(0)} y2={py(0)} />
        ) : null}
        <g clipPath={`url(#${clipId})`}>
          {series.map((s, i) => (
            <motion.path
              key={s.label ?? i}
              initial={false}
              animate={{ d: path(s.points) }}
              stroke={s.color ?? color(i)}
              strokeWidth={s.width ?? 2.8}
              strokeDasharray={s.dash ?? "none"}
              fill="none"
            />
          ))}
          {points.map((p, i) => (
            <motion.circle
              key={"p" + i}
              initial={false}
              animate={{ cx: px(p.x), cy: py(p.y) }}
              r={p.open ? 6 : 5}
              fill={p.open ? "var(--paper)" : (p.color ?? color(i))}
              stroke={p.color ?? color(i)}
              strokeWidth={2}
            >
              <title>{p.label ?? vfmt([p.x, p.y])}</title>
            </motion.circle>
          ))}
        </g>
        {probe && (
          <g className="plot-probe" pointerEvents="none">
            <line x1={probe.px} x2={probe.px} y1={T} y2={H - B} />
            <line x1={L} x2={W - R} y1={probe.py} y2={probe.py} />
            <circle cx={probe.px} cy={probe.py} r="5" />
            <g transform={`translate(${Math.min(Math.max(probe.px + 12, L + 4), W - R - 194)} ${Math.max(T + 8, probe.py - 46)})`}>
              <rect width="190" height="34" rx="4" />
              <text x="8" y="22">{probe.label ? `${probe.label}: ${tickfmt(probe.x)}, ${tickfmt(probe.y)}` : `${xlabel} ${tickfmt(probe.x)} · ${ylabel} ${tickfmt(probe.y)}`}</text>
            </g>
          </g>
        )}
        <text
          className="axis-label"
          x={L + width / 2}
          y={H - 12}
          textAnchor="middle"
        >
          {xlabel}
        </text>
        <text
          className="axis-label"
          x={19}
          y={T + height / 2}
          textAnchor="middle"
          transform={`rotate(-90 19 ${T + height / 2})`}
        >
          {ylabel}
        </text>
        {children}
      </svg>
      <div className="legend">
        {series
          .filter((s) => s.label)
          .map((s, i) => (
            <span key={i}>
              <i style={{ background: s.color ?? color(i) }} />
              {s.label}
            </span>
          ))}
      </div>
    </div>
  );
}

function NormBalls({ budget, min, max, step, onChange, locale }: {
  budget: number;
  min: number;
  max: number;
  step: number;
  onChange: (budget: number) => void;
  locale: Locale;
}) {
  const inputId = useId();
  const radius = budget * 38;
  const items = [
    { key: "l1", label: "L_1", formula: "\\lvert w_1\\rvert + \\lvert w_2\\rvert \\le t" },
    { key: "l2", label: "L_2", formula: "\\sqrt{w_1^2 + w_2^2} \\le t" },
    { key: "linf", label: "L_\\infty", formula: "\\max(\\lvert w_1\\rvert, \\lvert w_2\\rvert) \\le t" },
  ];

  return (
    <section className="norm-balls" dir="ltr" aria-label={locale === "ar" ? "مقارنة كرات المعايير" : "Compare norm balls"}>
      <div className="norm-balls-grid">
        {items.map((item) => (
          <div className={`norm-ball norm-ball-${item.key}`} key={item.key}>
            <h3><SafeLatex>{item.label}</SafeLatex></h3>
            <svg viewBox="0 0 260 224" role="img" aria-label={`${item.label} ball with budget ${budget.toFixed(2)}`}>
              <line className="norm-ball-axis" x1="30" x2="230" y1="112" y2="112" />
              <line className="norm-ball-axis" x1="130" x2="130" y1="24" y2="200" />
              <text className="norm-ball-axis-label" x="232" y="108">w₁</text>
              <text className="norm-ball-axis-label" x="136" y="22">w₂</text>
              {item.key === "l1" && (
                <motion.path
                  className="norm-ball-shape"
                  initial={false}
                  animate={{ d: `M 130 ${112 - radius} L ${130 + radius} 112 L 130 ${112 + radius} L ${130 - radius} 112 Z` }}
                />
              )}
              {item.key === "l2" && (
                <motion.circle className="norm-ball-shape" cx="130" cy="112" initial={false} animate={{ r: radius }} />
              )}
              {item.key === "linf" && (
                <motion.rect className="norm-ball-shape" initial={false} animate={{ x: 130 - radius, y: 112 - radius, width: radius * 2, height: radius * 2 }} />
              )}
              <circle className="norm-ball-origin" cx="130" cy="112" r="2.5" />
            </svg>
            <p className="norm-ball-formula"><SafeLatex>{item.formula}</SafeLatex></p>
          </div>
        ))}
      </div>
      <label className="norm-balls-budget" htmlFor={inputId}>
        <span>{locale === "ar" ? "الميزانية المشتركة" : "Shared budget"}</span>
        <output htmlFor={inputId}>t = {budget.toFixed(2)}</output>
        <input id={inputId} type="range" min={min} max={max} step={step} value={budget} onChange={(event) => onChange(Number(event.currentTarget.value))} aria-valuetext={`Shared norm budget ${budget.toFixed(2)}`} />
        <span className="norm-balls-scale"><span>{min.toFixed(1)}</span><span>{max.toFixed(1)}</span></span>
      </label>
    </section>
  );
}

function CountMagnitude({ value, vectors, min, max, step, onChange, locale }: {
  value: number;
  vectors: number[][];
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  locale: Locale;
}) {
  const inputId = useId();
  const magnitude = Math.abs(value);
  const support = value === 0 ? 0 : 1;
  const labels = locale === "ar"
    ? { continuous: "يتغير مع حجم المعامل", jumps: "يتغير عند الصفر فقط", entry: "قيمة العنصر", zero: "صفر", nonzeros: "عناصر غير صفرية" }
    : { continuous: "Changes with coefficient size", jumps: "Changes only at zero", entry: "Entry value", zero: "zero", nonzeros: "nonzeros" };

  return (
    <section className="count-magnitude" dir="ltr" aria-label={locale === "ar" ? "مقارنة المقدار والدعم" : "Compare magnitude and support"}>
      <div className="count-magnitude-measures">
        <div className="count-magnitude-measure">
          <div className="count-magnitude-heading"><h3><SafeLatex>L_1</SafeLatex></h3><span><SafeLatex>\sum_i |w_i|</SafeLatex></span></div>
          <div className="count-magnitude-value">{fmt(magnitude)}</div>
          <div className="count-magnitude-track" aria-hidden="true"><span style={{ width: `${(magnitude / max) * 100}%` }} /></div>
          <p>{labels.continuous}</p>
        </div>
        <div className="count-magnitude-measure">
          <div className="count-magnitude-heading"><h3><SafeLatex>L_0</SafeLatex></h3><span># {labels.nonzeros}</span></div>
          <div className="count-magnitude-value">{support}</div>
          <div className={`count-magnitude-atom${support ? " is-active" : ""}`} aria-hidden="true"><i /></div>
          <p>{labels.jumps}</p>
        </div>
      </div>

      <label className="norm-balls-budget count-magnitude-slider" htmlFor={inputId}>
        <span>{labels.entry}</span>
        <output htmlFor={inputId}>w = {fmt(value)}</output>
        <input id={inputId} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.currentTarget.value))} aria-valuetext={`${labels.entry} ${fmt(value)}`} />
        <span className="norm-balls-scale"><span>{min}</span><span>{labels.zero}</span><span>{max}</span></span>
      </label>

      <div className="count-magnitude-vectors">
        {vectors.slice(0, 2).map((vector, index) => {
          const count = vector.filter((entry) => entry !== 0).length;
          const vectorMath = `\\left(${vector.map(fmt).join(",\\;")}\\right)`;
          return <div className="count-magnitude-vector" key={index}>
            <span className="count-magnitude-vector-label"><SafeLatex>{vectorMath}</SafeLatex></span>
            <div className="count-magnitude-cells" aria-hidden="true">
              {vector.map((entry, cell) => <span key={cell}><i style={{ width: `${Math.abs(entry) * 100}%` }} /></span>)}
            </div>
            <span className="count-magnitude-vector-result"><SafeLatex>{`L_0 = ${count}`}</SafeLatex></span>
          </div>;
        })}
      </div>
    </section>
  );
}

function ConvexEnvelope({ bound, min, max, step, onChange, locale }: {
  bound: number;
  min: number;
  max: number;
  step: number;
  onChange: (bound: number) => void;
  locale: Locale;
}) {
  const inputId = useId();
  const [value, setValue] = useState(0.5);
  const envelopeValue = Math.abs(value) / bound;
  const W = 720;
  const center = W / 2;
  const scale = 92;
  const x = (value: number) => center + value * scale;
  const y = (value: number) => 246 - value * 164;
  const left = x(-bound);
  const right = x(bound);
  const point = x(value);
  const coefficientStep = 0.02;
  const minValue = -bound;
  const labels = locale === "ar"
    ? { envelope: "الغلاف المحدب", indicator: "مؤشر عدم الصفر", bound: "حد المجال M", coefficient: "المعامل w" }
    : { envelope: "Convex envelope", indicator: "Nonzero indicator", bound: "Domain bound M", coefficient: "Coefficient w" };
  const setFromPointer = (event: ReactPointerEvent<SVGRectElement>) => {
    const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!bounds?.width) return;
    const svgX = ((event.clientX - bounds.left) / bounds.width) * W;
    setValue(Number(Math.max(-bound, Math.min(bound, (svgX - center) / scale)).toFixed(2)));
  };
  const handleKeyDown = (event: ReactKeyboardEvent<SVGRectElement>) => {
    const next = event.key === "ArrowLeft" || event.key === "ArrowDown" ? value - coefficientStep
      : event.key === "ArrowRight" || event.key === "ArrowUp" ? value + coefficientStep
        : event.key === "Home" ? -bound
          : event.key === "End" ? bound
            : null;
    if (next === null) return;
    event.preventDefault();
    setValue(Number(Math.max(-bound, Math.min(bound, next)).toFixed(2)));
  };

  return (
    <section className="convex-envelope" dir="ltr" aria-label={locale === "ar" ? "الغلاف المحدب لمؤشر عدم الصفر" : "Convex envelope of the nonzero indicator"}>
      <svg viewBox={`0 0 ${W} 310`} role="img" aria-label={locale === "ar" ? `على المجال من سالب ${fmt(bound)} إلى ${fmt(bound)}، الغلاف يساوي القيمة المطلقة لـ w مقسومة على M.` : `On the domain from minus ${fmt(bound)} to ${fmt(bound)}, the envelope is absolute w divided by M.`}>
        <line className="envelope-axis" x1="54" x2="666" y1={y(0)} y2={y(0)} />
        <line className="envelope-axis" x1={center} x2={center} y1="42" y2={y(0)} />
        <path className="envelope-indicator" d={`M ${left} ${y(1)} H ${center - 8} M ${center + 8} ${y(1)} H ${right}`} />
        <circle className="envelope-open" cx={center} cy={y(1)} r="5" />
        <circle className="envelope-closed" cx={center} cy={y(0)} r="5" />
        <path className="envelope-line" d={`M ${left} ${y(1)} L ${center} ${y(0)} L ${right} ${y(1)}`} />
        <line className="envelope-selection" x1={point} x2={point} y1={y(1)} y2={y(envelopeValue)} />
        <circle className="envelope-selected-indicator" cx={point} cy={y(1)} r="4" />
        <circle className="envelope-selected-line" cx={point} cy={y(envelopeValue)} r="5" />
        <line className="envelope-bound-tick" x1={left} x2={left} y1={y(0) - 5} y2={y(0) + 6} />
        <line className="envelope-bound-tick" x1={right} x2={right} y1={y(0) - 5} y2={y(0) + 6} />
        <text className="envelope-label" x="58" y="28">{labels.indicator}</text>
        <text className="envelope-label envelope-label-accent" x="58" y="52">{labels.envelope}</text>
        <text className="envelope-tick-label" x="62" y={y(1) + 4} textAnchor="end">1</text>
        <text className="envelope-tick-label" x="62" y={y(0) + 4} textAnchor="end">0</text>
        <text className="envelope-tick-label" x={left} y={y(0) + 26} textAnchor="middle">−M</text>
        <text className="envelope-tick-label" x={center} y={y(0) + 26} textAnchor="middle">0</text>
        <text className="envelope-tick-label" x={right} y={y(0) + 26} textAnchor="middle">M</text>
        <text className="envelope-fixed-label" x={Math.max(78, Math.min(point + 12, 620))} y={y(envelopeValue) - 12}>w = {fmt(value)}</text>
        <rect
          className="envelope-interaction-area"
          x={left}
          y={y(1) - 12}
          width={right - left}
          height={y(0) - y(1) + 42}
          rx="5"
          fill="transparent"
          tabIndex={0}
          role="slider"
          aria-label={labels.coefficient}
          aria-orientation="horizontal"
          aria-valuemin={minValue}
          aria-valuemax={bound}
          aria-valuenow={value}
          aria-valuetext={`w = ${fmt(value)}; |w|/M = ${fmt(envelopeValue)}; L₀ = ${value === 0 ? 0 : 1}`}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setFromPointer(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) setFromPointer(event);
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onKeyDown={handleKeyDown}
        />
      </svg>
      <div className="convex-envelope-readout" dir="ltr">
        <span><SafeLatex>{"\\frac{|w|}{M} ="}</SafeLatex> <strong>{fmt(envelopeValue)}</strong></span>
        <span><SafeLatex>L_0(w) =</SafeLatex> <strong>{value === 0 ? 0 : 1}</strong></span>
      </div>
      <label className="norm-balls-budget convex-envelope-slider" htmlFor={inputId}>
        <span>{labels.bound}</span>
        <output htmlFor={inputId}>M = {fmt(bound)}</output>
        <input id={inputId} type="range" min={min} max={max} step={step} value={bound} onChange={(event) => {
          const nextBound = Number(event.currentTarget.value);
          onChange(nextBound);
          setValue((previous) => Math.max(-nextBound, Math.min(nextBound, previous)));
        }} aria-valuetext={`${labels.bound} ${fmt(bound)}`} />
        <span className="norm-balls-scale"><span>{min}</span><span>{max}</span></span>
      </label>
    </section>
  );
}

function TotalVariation({ row, lambda, min, max, step, onChange, locale }: {
  row: number[];
  lambda: number;
  min: number;
  max: number;
  step: number;
  onChange: (lambda: number) => void;
  locale: Locale;
}) {
  const [playing, setPlaying] = useState(false);
  const inputId = useId();
  const split = row.length / 2;
  const leftMean = sum(row.slice(0, split)) / split;
  const rightMean = sum(row.slice(split)) / split;
  const mean = (leftMean + rightMean) / 2;
  const difference = Math.max(rightMean - leftMean - (2 * lambda) / split, 0);
  const estimate = [
    ...Array(split).fill(mean - difference / 2),
    ...Array(split).fill(mean + difference / 2),
  ] as number[];
  const originalDifferences = row.slice(1).map((value, index) => Math.abs(value - row[index]));
  const estimateDifferences = estimate.slice(1).map((value, index) => Math.abs(value - estimate[index]));
  const labels = locale === "ar"
    ? { observed: "الصف المرصود", estimate: "حل TV", lambda: "قوة TV λ", play: "تشغيل", pause: "إيقاف", replay: "إعادة التشغيل" }
    : { observed: "Observed row", estimate: "TV estimate", lambda: "TV strength λ", play: "Play", pause: "Pause", replay: "Replay" };
  const chart = { left: 112, right: 706, top: 34, signalBottom: 210, diffTop: 278, diffBottom: 362 };
  const xAt = (index: number) => chart.left + (index / (row.length - 1)) * (chart.right - chart.left);
  const signalY = (value: number) => chart.signalBottom - (value / 60) * (chart.signalBottom - chart.top);
  const diffY = (value: number) => chart.diffBottom - (value / 45) * (chart.diffBottom - chart.diffTop);
  const signalPath = (values: number[]) => values.map((value, index) => {
    const x = xAt(index).toFixed(3);
    const y = signalY(value).toFixed(3);
    if (index === 0) return `M${x},${y}`;
    const previousY = signalY(values[index - 1]).toFixed(3);
    const midpoint = ((xAt(index - 1) + xAt(index)) / 2).toFixed(3);
    return `L${midpoint},${previousY} L${midpoint},${y} L${x},${y}`;
  }).join(" ");
  const playLabel = playing ? labels.pause : lambda >= max ? labels.replay : labels.play;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      const increment = Math.max(step, (max - min) / 70);
      const next = Math.min(lambda + increment, max);
      onChange(Number((min + Math.round((next - min) / step) * step).toFixed(4)));
      if (next >= max) setPlaying(false);
    }, 50);
    return () => window.clearTimeout(timer);
  }, [lambda, max, min, onChange, playing, step]);

  return (
    <div className="tv-visual">
      <div className="tv-chart-scroll">
        <svg viewBox="0 0 760 400" role="img" aria-label={locale === "ar" ? "الإشارة المرصودة وتقدير TV وفروق الجيران" : "Observed signal, total variation estimate, and neighboring differences"}>
        <text className="tv-panel-label" x="28" y="38">uᵢ</text>
        {[0, 20, 40, 60].map((value) => (
          <g key={`signal-${value}`}>
            <line className="tv-grid" x1={chart.left} x2={chart.right} y1={signalY(value)} y2={signalY(value)} />
            <text className="tv-tick" x={chart.left - 14} y={signalY(value) + 4} textAnchor="end">{value}</text>
          </g>
        ))}
        <line className="tv-axis" x1={chart.left} x2={chart.right} y1={chart.signalBottom} y2={chart.signalBottom} />
        <path className="tv-observed-line" d={signalPath(row)} />
        <path className="tv-estimate-line" d={signalPath(estimate)} />
        {row.map((value, index) => (
          <g key={index}>
            <circle className="tv-observed-point" cx={xAt(index)} cy={signalY(value)} r="4" />
            <circle className="tv-estimate-point" cx={xAt(index)} cy={signalY(estimate[index])} r="4" />
            <text className="tv-tick" x={xAt(index)} y={chart.signalBottom + 20} textAnchor="middle">{index + 1}</text>
          </g>
        ))}
        <text className="tv-panel-label" x="28" y="288">|Du|</text>
        {[0, 20, 40].map((value) => (
          <g key={`diff-${value}`}>
            <line className="tv-grid" x1={chart.left} x2={chart.right} y1={diffY(value)} y2={diffY(value)} />
            <text className="tv-tick" x={chart.left - 14} y={diffY(value) + 4} textAnchor="end">{value}</text>
          </g>
        ))}
        <line className="tv-axis" x1={chart.left} x2={chart.right} y1={chart.diffBottom} y2={chart.diffBottom} />
        {originalDifferences.map((value, index) => {
          const center = (xAt(index) + xAt(index + 1)) / 2;
          const estimated = estimateDifferences[index];
          return (
            <g key={index}>
              <rect className="tv-observed-bar" x={center - 11} y={diffY(value)} width="8" height={chart.diffBottom - diffY(value)} />
              <rect className="tv-estimate-bar" x={center + 3} y={diffY(estimated)} width="8" height={chart.diffBottom - diffY(estimated)} />
              <text className="tv-tick" x={center} y={chart.diffBottom + 19} textAnchor="middle">{index + 1}–{index + 2}</text>
            </g>
          );
        })}
        </svg>
      </div>
      <div className="tv-legend">
        <span><i className="tv-observed-key" />{labels.observed}</span>
        <span><i className="tv-estimate-key" />{labels.estimate}</span>
      </div>
      <div className="tv-scrubber" dir="ltr">
        <label htmlFor={inputId}>
          <span>{labels.lambda}</span>
          <output>{fmt(lambda)}</output>
        </label>
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={lambda}
          aria-label={labels.lambda}
          onChange={(event) => {
            setPlaying(false);
            onChange(Number(event.currentTarget.value));
          }}
        />
        <button
          type="button"
          className="tv-play"
          aria-label={playLabel}
          aria-pressed={playing}
          onClick={() => {
            if (playing) setPlaying(false);
            else {
              if (lambda >= max) onChange(min);
              setPlaying(true);
            }
          }}
        >
          <span aria-hidden="true">{playing ? "Ⅱ" : lambda >= max ? "↻" : "▶"}</span>
          {playLabel}
        </button>
      </div>
      <div className="tv-equation" dir="ltr">
        <SafeLatex>{String.raw`\hat{u}=(${estimate.map(fmt).join(",")}),\qquad \|D\hat{u}\|_1=${fmt(norm1(estimateDifferences))}`}</SafeLatex>
      </div>
    </div>
  );
}

function StorageComparison({ rows, columns, valueBytes, indexBytes, sparsity, min, max, step, onChange, locale }: {
  rows: number;
  columns: number;
  valueBytes: number;
  indexBytes: number;
  sparsity: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  locale: Locale;
}) {
  const inputId = useId();
  const entries = rows * columns;
  const nonzeros = Math.round(entries * (1 - sparsity / 100));
  const denseBytes = entries * valueBytes;
  const valueSize = nonzeros * valueBytes;
  const indexSize = nonzeros * indexBytes;
  const pointerSize = (rows + 1) * indexBytes;
  const sparseBytes = valueSize + indexSize + pointerSize;
  const fullSparseBytes = entries * (valueBytes + indexBytes) + pointerSize;
  const scaleMax = Math.max(denseBytes, fullSparseBytes);
  const breakEven = Math.max(0, Math.min(100, 100 * (1 - (denseBytes - pointerSize) / (entries * (valueBytes + indexBytes)))));
  const labels = locale === "ar"
    ? { dense: "كثيف", csr: "CSR", values: "القيم", indices: "فهارس الأعمدة", pointers: "مؤشرات الصفوف", zeros: "الأصفار الدقيقة", advantage: "أصغر من الكثيف", overhead: "أكبر من الكثيف", breakEven: "نقطة التعادل", size: "الحجم الخام", play: "نسبة الأصفار الدقيقة" }
    : { dense: "Dense", csr: "CSR", values: "Values", indices: "Column indices", pointers: "Row pointers", zeros: "Exact zeros", advantage: "smaller than dense", overhead: "larger than dense", breakEven: "Break-even", size: "Raw storage", play: "Exact zero share" };
  const mb = (bytes: number) => `${(bytes / 1e6).toFixed(3)} MB`;
  const number = (bytes: number) => Math.round(bytes).toLocaleString("en-US");
  const csrParts = [
    { key: "values", label: labels.values, bytes: valueSize, className: "storage-values" },
    { key: "indices", label: labels.indices, bytes: indexSize, className: "storage-indices" },
    { key: "pointers", label: labels.pointers, bytes: pointerSize, className: "storage-pointers" },
  ];

  return (
    <section className="storage-comparison" dir="ltr" aria-label={labels.size}>
      <div className="storage-chart" role="img" aria-label={`${labels.dense}: ${mb(denseBytes)}; ${labels.csr}: ${mb(sparseBytes)} at ${sparsity}% exact zeros`}>
        <div className="storage-axis"><span>0</span><span>{mb(denseBytes)}</span><span>{mb(scaleMax)}</span></div>
        <div className="storage-row">
          <div className="storage-row-heading"><strong>{labels.dense}</strong><output>{mb(denseBytes)}</output></div>
          <div className="storage-track"><motion.div className="storage-dense-bar" initial={false} animate={{ width: `${denseBytes / scaleMax * 100}%` }} /></div>
        </div>
        <div className="storage-row">
          <div className="storage-row-heading"><strong>{labels.csr}</strong><output>{mb(sparseBytes)}</output></div>
          <div className="storage-track">
            <motion.div className="storage-csr-bar" initial={false} animate={{ width: `${sparseBytes / scaleMax * 100}%` }}>
              {csrParts.map((part) => <motion.span key={part.key} className={part.className} initial={false} animate={{ width: `${part.bytes / sparseBytes * 100}%` }} />)}
            </motion.div>
          </div>
        </div>
        <div className={`storage-result${sparseBytes <= denseBytes ? " is-smaller" : ""}`}>
          <span>{labels.breakEven}: {breakEven.toFixed(1)}% {labels.zeros}</span>
          <strong>{sparseBytes <= denseBytes ? labels.advantage : labels.overhead}</strong>
        </div>
      </div>
      <div className="storage-legend">
        <span><i className="storage-dense-key" />{labels.dense}</span>
        {csrParts.map((part) => <span key={part.key}><i className={part.className} />{part.label}: {number(part.bytes)} B</span>)}
      </div>
      <div className="storage-equation" dir="ltr"><SafeLatex>{String.raw`N_{\mathrm{CSR}}=n_{\mathrm{nz}}(b_v+b_i)+(m+1)b_i`}</SafeLatex></div>
      <label className="storage-scrubber" htmlFor={inputId}>
        <span>{labels.play}</span><output>{sparsity}%</output>
        <input id={inputId} type="range" min={min} max={max} step={step} value={sparsity} onChange={(event) => onChange(Number(event.currentTarget.value))} aria-valuetext={`${sparsity}% ${labels.zeros}`} />
      </label>
    </section>
  );
}

function SingularSpectrum({ singularValues, tau, min, max, step, onChange, locale }: {
  singularValues: number[];
  tau: number;
  min: number;
  max: number;
  step: number;
  onChange: (tau: number) => void;
  locale: Locale;
}) {
  const inputId = useId();
  const peak = Math.max(...singularValues);
  const softValues = singularValues.map((value) => Math.max(value - tau, 0));
  const truncatedValues = singularValues.map((value, index) => index === 0 ? value : 0);
  const labels = locale === "ar"
    ? { soft: "معيار نووي · تقليص ناعم", truncated: "رتبة 1 · اقتطاع", original: "القيمة الأصلية", retained: "بعد التحويل", rank: "الرتبة", nuclear: "المعيار النووي", tau: "عتبة التقليل τ" }
    : { soft: "Nuclear norm · soft shrinkage", truncated: "Rank 1 · truncation", original: "Original value", retained: "Retained", rank: "Rank", nuclear: "Nuclear norm", tau: "Shrinkage threshold τ" };
  const methods = [
    { key: "soft", label: labels.soft, values: softValues, formula: String.raw`(\sigma_i-\tau)_+`, className: "singular-soft" },
    { key: "truncated", label: labels.truncated, values: truncatedValues, formula: String.raw`(\sigma_1,0)`, className: "singular-truncated" },
  ];

  return (
    <section className="singular-spectrum" dir="ltr" aria-label={locale === "ar" ? "مقارنة تقليص القيم المفردة" : "Compare singular-value shrinkage methods"}>
      <div className="singular-methods">
        {methods.map((method) => {
          const rank = method.values.filter((value) => value > 1e-10).length;
          return (
            <section className={`singular-method ${method.className}`} key={method.key}>
              <h3>{method.label}</h3>
              <div className="singular-formula"><SafeLatex>{method.formula}</SafeLatex></div>
              <div className="singular-rows">
                {method.values.map((value, index) => (
                  <div className="singular-row" key={index}>
                    <span className="singular-index"><SafeLatex>{String.raw`\sigma_${index + 1}`}</SafeLatex></span>
                    <div className="singular-track" aria-hidden="true">
                      <motion.span className="singular-original-bar" initial={false} animate={{ width: `${singularValues[index] / peak * 100}%` }} />
                      <motion.span className="singular-retained-bar" initial={false} animate={{ width: `${value / peak * 100}%` }} />
                    </div>
                    <span className="singular-value">{fmt(singularValues[index])} → {fmt(value)}</span>
                  </div>
                ))}
              </div>
              <div className="singular-stats">
                <span>{labels.rank}<strong>{rank}</strong></span>
                <span>{labels.nuclear}<strong>{fmt(sum(method.values))}</strong></span>
              </div>
            </section>
          );
        })}
      </div>
      <div className="singular-legend">
        <span><i className="singular-original-key" />{labels.original}</span>
        <span><i className="singular-soft-key" />{labels.retained} · {labels.soft}</span>
        <span><i className="singular-truncated-key" />{labels.retained} · {labels.truncated}</span>
      </div>
      <label className="singular-scrubber" htmlFor={inputId}>
        <span>{labels.tau}</span><output>τ = {fmt(tau)}</output>
        <input id={inputId} type="range" min={min} max={max} step={step} value={tau} onChange={(event) => onChange(Number(event.currentTarget.value))} aria-valuetext={`tau ${fmt(tau)}`} />
      </label>
    </section>
  );
}

function WeightPatterns({ matrix, lambda, min, max, step, onChange, locale }: {
  matrix: number[][];
  lambda: number;
  min: number;
  max: number;
  step: number;
  onChange: (lambda: number) => void;
  locale: Locale;
}) {
  const [playing, setPlaying] = useState(false);
  const inputId = useId();
  const entrywise = matrix.map((row) => row.map((value) => soft(value, lambda)));
  const displayValue = (value: number) => Math.abs(value) < 1e-9 ? "0" : Math.abs(value) < 0.005 ? "≈0" : Number(value.toFixed(2)).toString();
  const grouped = matrix.map((row) => {
    const scale = Math.max(1 - lambda / (norm2(row) || 1), 0);
    return row.map((value) => value * scale);
  });
  const maxAbs = Math.max(...matrix.flat().map(Math.abs));
  const labels = locale === "ar"
    ? { input: "الأوزان الأصلية", elementwise: "تنظيم عنصرًا بعنصر", grouped: "تنظيم مجموعات الصفوف", lambda: "قوة التنظيم λ", zeros: "أصفار دقيقة", rows: "صفوف محذوفة", play: "تشغيل", pause: "إيقاف", replay: "إعادة التشغيل" }
    : { input: "Input weights", elementwise: "Entrywise L₁", grouped: "Row-group L₂", lambda: "Penalty strength λ", zeros: "Exact zeros", rows: "Zero rows", play: "Play", pause: "Pause", replay: "Replay" };
  const panels = [
    { key: "input", label: labels.input, values: matrix, formula: String.raw`W` },
    { key: "elementwise", label: labels.elementwise, values: entrywise, formula: String.raw`S_\lambda(W_{ij})` },
    { key: "grouped", label: labels.grouped, values: grouped, formula: String.raw`\left(1-\lambda/\|W_{i,:}\|_2\right)_+W_{i,:}` },
  ];
  const playLabel = playing ? labels.pause : lambda >= max ? labels.replay : labels.play;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      const increment = Math.max(step, (max - min) / 50);
      const next = Math.min(lambda + increment, max);
      onChange(Number((min + Math.round((next - min) / step) * step).toFixed(4)));
      if (next >= max) setPlaying(false);
    }, 50);
    return () => window.clearTimeout(timer);
  }, [lambda, max, min, onChange, playing, step]);

  return (
    <div className="weight-patterns">
      <div className="weight-patterns-grid">
        {panels.map((panel) => {
          const zeroCount = panel.values.flat().filter((value) => Math.abs(value) < 1e-9).length;
          const zeroRows = panel.values.filter((row) => row.every((value) => Math.abs(value) < 1e-9)).length;
          return (
            <section className={`weight-pattern-panel weight-pattern-${panel.key}`} key={panel.key}>
              <h3>{panel.label}</h3>
              <SafeLatex>{panel.formula}</SafeLatex>
              <table className="weight-pattern-matrix" aria-label={panel.label}>
                <tbody>
                  {panel.values.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((value, columnIndex) => {
                        const amount = Math.abs(value) / maxAbs;
                        const isZero = Math.abs(value) < 1e-9;
                        return (
                          <td
                            key={columnIndex}
                            className={isZero ? "is-zero" : value < 0 ? "is-negative" : "is-positive"}
                            style={{ "--weight-amount": `${Math.round(15 + amount * 75)}%` } as CSSProperties}
                            aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}: ${fmt(value)}`}
                          >
                            {displayValue(value)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="weight-pattern-counts">
                <span>{labels.zeros} <strong>{zeroCount}/{panel.values.flat().length}</strong></span>
                <span>{labels.rows} <strong>{zeroRows}/{panel.values.length}</strong></span>
              </div>
            </section>
          );
        })}
      </div>
      <div className="weight-pattern-legend" aria-hidden="true">
        <span><i className="is-positive" />+</span>
        <span><i className="is-negative" />−</span>
        <span><i className="is-zero" />0</span>
      </div>
      <div className="weight-pattern-scrubber" dir="ltr">
        <label htmlFor={inputId}>
          <span>{labels.lambda}</span>
          <output>{fmt(lambda)}</output>
        </label>
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={lambda}
          aria-label={labels.lambda}
          onChange={(event) => {
            setPlaying(false);
            onChange(Number(event.currentTarget.value));
          }}
        />
        <button
          type="button"
          className="weight-pattern-play"
          aria-label={playLabel}
          aria-pressed={playing}
          onClick={() => {
            if (playing) setPlaying(false);
            else {
              if (lambda >= max) onChange(min);
              setPlaying(true);
            }
          }}
        >
          <span aria-hidden="true">{playing ? "Ⅱ" : lambda >= max ? "↻" : "▶"}</span>
          {playLabel}
        </button>
      </div>
    </div>
  );
}

function OptimalityGap({ history, initialIteration, locale }: {
  history: [number, number][];
  initialIteration: number;
  locale: Locale;
}) {
  const [iteration, setIteration] = useState(initialIteration);
  const [playing, setPlaying] = useState(false);
  const inputId = useId();
  const lastIteration = history.length - 1;
  const point = history[iteration];
  const [mantissa, exponent] = point[1].toExponential(2).split("e");
  const gapEquation = String.raw`P_k-D_k=${mantissa}\times10^{${Number(exponent)}}`;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      const nextIteration = Math.min(iteration + 5, lastIteration);
      setIteration(nextIteration);
      if (nextIteration >= lastIteration) setPlaying(false);
    }, 40);
    return () => window.clearTimeout(timer);
  }, [iteration, lastIteration, playing]);

  const playLabel = locale === "ar"
    ? playing ? "إيقاف" : iteration >= lastIteration ? "إعادة التشغيل" : "تشغيل"
    : playing ? "Pause" : iteration >= lastIteration ? "Replay" : "Play";

  return (
    <div className="gap-visual">
      <Plot
        x={[-30, 1200]}
        y={[-18, 0.5]}
        xTicks={[0, 300, 600, 900, 1200]}
        yTicks={[-16, -12, -8, -4, 0]}
        axesAtBounds
        formatYTick={(value) => `10${["⁰", "⁻⁴", "⁻⁸", "⁻¹²", "⁻¹⁶"][(-value) / 4]}`}
        xlabel={locale === "ar" ? "الخطوة" : "Iteration"}
        ylabel={locale === "ar" ? "فجوة الهدفين الأولي والثنائي" : "Primal–dual gap"}
        series={[{
          label: locale === "ar" ? "فجوة الهدف" : "Objective gap",
          color: color(0),
          points: history.map(([step, gap]) => [step, Math.log10(gap)]),
        }]}
        points={[{ x: point[0], y: Math.log10(point[1]), label: "Current gap" }]}
      />
      <div className="gap-scrubber" dir="ltr">
        <label htmlFor={inputId}>
          <span>{locale === "ar" ? "التكرار" : "Iteration"}</span>
          <output>{point[0]}</output>
        </label>
        <input
          id={inputId}
          type="range"
          min="0"
          max={lastIteration}
          step="1"
          value={iteration}
          aria-label={locale === "ar" ? "التكرار" : "Iteration"}
          onChange={(event) => {
            setPlaying(false);
            setIteration(Number(event.currentTarget.value));
          }}
        />
        <button
          type="button"
          className="gap-play"
          aria-label={playLabel}
          aria-pressed={playing}
          onClick={() => {
            if (playing) setPlaying(false);
            else {
              if (iteration >= lastIteration) setIteration(0);
              setPlaying(true);
            }
          }}
        >
          <span aria-hidden="true">{playing ? "Ⅱ" : iteration >= lastIteration ? "↻" : "▶"}</span>
          {playLabel}
        </button>
      </div>
      <div className="gap-summary">
        <div>
          <span>{locale === "ar" ? "الفجوة الحالية" : "Current gap"}</span>
          <SafeLatex>{"$$" + gapEquation + "$$"}</SafeLatex>
        </div>
        <div>
          <span>{locale === "ar" ? "حدود الهدف الأمثل" : "Bounds on the optimum"}</span>
          <SafeLatex>{"$$D_k\\leq F^*\\leq P_k$$"}</SafeLatex>
        </div>
      </div>
    </div>
  );
}

function SelectionStability({ selected, initialSamples, locale }: {
  selected: number[][];
  initialSamples: number;
  locale: Locale;
}) {
  const [samples, setSamples] = useState(initialSamples);
  const [playing, setPlaying] = useState(false);
  const inputId = useId();
  const total = selected.length;
  const features = locale === "ar"
    ? ["x₁ · الإشارة", "x₂ · البديل", "x₃ · الضجيج"]
    : ["x₁ · Signal", "x₂ · Proxy", "x₃ · Noise"];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      const nextSamples = Math.min(samples + 5, total);
      setSamples(nextSamples);
      if (nextSamples >= total) setPlaying(false);
    }, 40);
    return () => window.clearTimeout(timer);
  }, [playing, samples, total]);

  const playLabel = locale === "ar"
    ? playing ? "إيقاف" : samples >= total ? "إعادة التشغيل" : "تشغيل"
    : playing ? "Pause" : samples >= total ? "Replay" : "Play";

  return (
    <div className="stability-visual">
      <div className="stability-lanes-scroll">
        <div className="stability-lanes">
          {features.map((feature, featureIndex) => {
            const count = selected.slice(0, samples).filter((row) => row[featureIndex]).length;
            return (
              <div className={`stability-lane stability-lane-${featureIndex + 1}`} key={feature}>
                <div className="stability-lane-heading">
                  <span>{feature}</span>
                  <strong>{count} / {samples} <i>{(count / samples * 100).toFixed(1)}%</i></strong>
                </div>
                <div className="stability-track" role="img" aria-label={`${feature}: selected in ${count} of ${samples} half-samples`}>
                  {selected.map((row, sampleIndex) => (
                    <i
                      key={sampleIndex}
                      aria-hidden="true"
                      className={sampleIndex >= samples ? "future" : row[featureIndex] ? "selected" : "missed"}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="stability-scrubber" dir="ltr">
        <label htmlFor={inputId}>
          <span>{locale === "ar" ? "أنصاف العينات" : "Half-samples"}</span>
          <output>{samples} / {total}</output>
        </label>
        <input
          id={inputId}
          type="range"
          min="10"
          max={total}
          step="1"
          value={samples}
          aria-label={locale === "ar" ? "عدد أنصاف العينات" : "Number of half-samples"}
          onChange={(event) => {
            setPlaying(false);
            setSamples(Number(event.currentTarget.value));
          }}
        />
        <button
          type="button"
          className="stability-play"
          aria-label={playLabel}
          aria-pressed={playing}
          onClick={() => {
            if (playing) setPlaying(false);
            else {
              if (samples >= total) setSamples(10);
              setPlaying(true);
            }
          }}
        >
          <span aria-hidden="true">{playing ? "Ⅱ" : samples >= total ? "↻" : "▶"}</span>
          {playLabel}
        </button>
      </div>
    </div>
  );
}

function RecoveryFailure({ t, onChange, min, max, step, data, locale }: {
  t: number;
  onChange: (t: number) => void;
  min: number;
  max: number;
  step: number;
  data: FigureData;
  locale: Locale;
}) {
  const inputId = useId();
  const labels = locale === "ar"
    ? { recovery: "استعادة صحيحة", failure: "فشل الاستعادة", holds: "شرط فضاء العدم متحقق", fails: "شرط فضاء العدم غير متحقق", truth: "الإشارة الحقيقية", candidate: "المرشح الحالي", minimum: "أصغر معيار L₁", measurement: "القياس الثابت", cost: "تكلفة L₁", parameter: "إزاحة غير مرئية t" }
    : { recovery: "Recovery succeeds", failure: "Recovery fails", holds: "Null-space condition holds", fails: "Null-space condition fails", truth: "True signal", candidate: "Current candidate", minimum: "L₁ minimum", measurement: "Unchanged measurement", cost: "Current L₁ cost", parameter: "Invisible displacement t" };
  const examples = [
    {
      id: "good",
      title: labels.recovery,
      condition: labels.holds,
      conditionMath: String.raw`\|h_S\|_1=1<2=\|h_{S^c}\|_1`,
      matrix: data.A_good,
      candidate: (value: number) => [1 - value, -value, value],
      cost: (value: number) => Math.abs(1 - value) + 2 * Math.abs(value),
      minimumT: 0,
    },
    {
      id: "bad",
      title: labels.failure,
      condition: labels.fails,
      conditionMath: String.raw`\|h_S\|_1=2>1=\|h_{S^c}\|_1`,
      matrix: data.A_bad,
      candidate: (value: number) => [1 - 2 * value, value],
      cost: (value: number) => Math.abs(1 - 2 * value) + Math.abs(value),
      minimumT: 0.5,
    },
  ];
  const chart = { left: 38, right: 326, top: 24, bottom: 164, maxCost: 2.5 };
  const px = (value: number) => chart.left + ((value - min) / (max - min)) * (chart.right - chart.left);
  const py = (value: number) => chart.bottom - (value / chart.maxCost) * (chart.bottom - chart.top);
  const path = (cost: (value: number) => number) => samples(cost, min, max, 121)
    .map(([x, y], index) => `${index ? "L" : "M"}${px(x).toFixed(2)},${py(y).toFixed(2)}`)
    .join(" ");

  return (
    <div className="recovery-visual">
      <div className="recovery-legend">
        <span><i className="truth-marker" />{labels.truth}</span>
        <span><i className="candidate-marker" />{labels.candidate}</span>
        <span><i className="minimum-marker" />{labels.minimum}</span>
      </div>
      <div className="recovery-pair">
        {examples.map((example) => {
          const candidate = example.candidate(t);
          const currentCost = example.cost(t);
          const truthCost = example.cost(0);
          const minimumCost = example.cost(example.minimumT);
          const truthX = px(0), truthY = py(truthCost);
          const minimumX = px(example.minimumT), minimumY = py(minimumCost);
          const currentX = px(t), currentY = py(currentCost);
          return (
            <section className={`recovery-example recovery-${example.id}`} key={example.id}>
              <header>
                <h3>{example.title}</h3>
                <div className="recovery-condition">
                  <span>{example.condition}</span>
                  <SafeLatex>{`$${example.conditionMath}$`}</SafeLatex>
                </div>
              </header>
              <svg viewBox="0 0 350 208" role="img" aria-label={`${example.title}: L1 cost along candidates with unchanged measurements`}>
                {[0, 1, 2].map((value) => (
                  <g key={value}>
                    <line className="recovery-grid" x1={chart.left} x2={chart.right} y1={py(value)} y2={py(value)} />
                    <text className="recovery-tick" x={chart.left - 8} y={py(value) + 4} textAnchor="end">{value}</text>
                  </g>
                ))}
                {[-0.4, 0, 0.5, 1.1].map((value) => (
                  <g key={value}>
                    <line className="recovery-x-grid" x1={px(value)} x2={px(value)} y1={chart.top} y2={chart.bottom} />
                    <text className="recovery-tick" x={px(value)} y="184" textAnchor="middle">{fmt(value)}</text>
                  </g>
                ))}
                <path className="recovery-cost-curve" d={path(example.cost)} />
                <line className="recovery-current-guide" x1={currentX} x2={currentX} y1={chart.top} y2={chart.bottom} />
                <circle className="recovery-truth-point" cx={truthX} cy={truthY} r="7" />
                <circle className="recovery-current-point" cx={currentX} cy={currentY} r="5" />
                <path className="recovery-minimum-point" d={`M ${minimumX} ${minimumY - 7} L ${minimumX + 7} ${minimumY} L ${minimumX} ${minimumY + 7} L ${minimumX - 7} ${minimumY} Z`} />
                <text className="recovery-axis-label" x="181" y="202" textAnchor="middle">t</text>
              </svg>
              <div className="recovery-values">
                <div>
                  <span>{labels.candidate}</span>
                  <SafeLatex>{`$z(${fmt(t)})=(${candidate.map(fmt).join(",")})$`}</SafeLatex>
                </div>
                <div>
                  <span>{labels.measurement}</span>
                  <SafeLatex>{`$Az=(${matvec(example.matrix, candidate).map(fmt).join(",")})=y$`}</SafeLatex>
                </div>
                <div>
                  <span>{labels.cost}</span>
                  <strong>{fmt(currentCost)}</strong>
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <div className="recovery-scrubber" dir="ltr">
        <label htmlFor={inputId}>
          <span>{labels.parameter}</span>
          <output>t = {fmt(t)}</output>
        </label>
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={t}
          aria-label={labels.parameter}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
        />
      </div>
    </div>
  );
}

function ConstraintContact({ budget, min, max, step, onChange, locale }: {
  budget: number;
  min: number;
  max: number;
  step: number;
  onChange: (budget: number) => void;
  locale: Locale;
}) {
  const inputId = useId();
  const clipId = useId().replace(/:/g, "");
  const l1 = contact(budget, "l1");
  const l2 = contact(budget, "l2");
  const plot = { left: 30, top: 20, size: 300, min: -2.8, max: 2.8 };
  const px = (value: number) => plot.left + ((value - plot.min) / (plot.max - plot.min)) * plot.size;
  const py = (value: number) => plot.top + ((plot.max - value) / (plot.max - plot.min)) * plot.size;
  const path = (points: [number, number][]) => points.map(([x, y], index) => `${index ? "L" : "M"}${px(x).toFixed(3)},${py(y).toFixed(3)}`).join(" ");
  const contour = (level: number) => path(linspace(0, 2 * Math.PI, 100).map((angle): [number, number] => [
    2 + Math.sqrt(2 * level) * Math.cos(angle),
    0.3 + Math.sqrt(level) * Math.sin(angle),
  ]));
  const diamondPath = `M ${px(0)} ${py(budget)} L ${px(budget)} ${py(0)} L ${px(0)} ${py(-budget)} L ${px(-budget)} ${py(0)} Z`;
  const labels = locale === "ar"
    ? { l1: "قيد L₁", l2: "قيد L₂", budget: "الميزانية المشتركة", l1Optimum: "حل L₁", l2Optimum: "حل L₂" }
    : { l1: "L₁ constraint", l2: "L₂ constraint", budget: "Shared budget", l1Optimum: "L₁ solution", l2Optimum: "L₂ solution" };
  const panels = [
    { key: "l1", title: labels.l1, solution: l1 },
    { key: "l2", title: labels.l2, solution: l2 },
  ] as const;

  return (
    <section className="constraint-contact" dir="ltr" aria-label={locale === "ar" ? "مقارنة الحلين تحت قيدي L₁ وL₂" : "Compare solutions under L1 and L2 constraints"}>
      <div className="constraint-contact-panels">
        {panels.map(({ key, title, solution }) => (
          <div className={`constraint-contact-panel constraint-contact-${key}`} key={key}>
            <h3>{title}</h3>
            <svg viewBox="0 0 360 340" role="img" aria-label={`${title}, budget ${fmt(budget)}, solution ${vfmt(solution)}`}>
              <defs>
                <clipPath id={`${clipId}-${key}`}>
                  <rect x={plot.left} y={plot.top} width={plot.size} height={plot.size} />
                </clipPath>
              </defs>
              <line className="contact-axis" x1={plot.left} x2={plot.left + plot.size} y1={py(0)} y2={py(0)} />
              <line className="contact-axis" x1={px(0)} x2={px(0)} y1={plot.top} y2={plot.top + plot.size} />
              <g clipPath={`url(#${clipId}-${key})`}>
                {[0.12, 0.3, 0.62].map((level) => <path className="contact-contour" key={level} d={contour(level)} />)}
                {key === "l1" ? (
                  <motion.path className="contact-region" initial={false} animate={{ d: diamondPath }} />
                ) : (
                  <motion.circle className="contact-region" cx={px(0)} cy={py(0)} initial={false} animate={{ r: (budget / (plot.max - plot.min)) * plot.size }} />
                )}
                <circle className="contact-target" cx={px(2)} cy={py(0.3)} r="5" />
                <motion.circle className="contact-solution" initial={false} animate={{ cx: px(solution[0]), cy: py(solution[1]) }} r="6" />
              </g>
              <text className="contact-axis-label" x={plot.left + plot.size - 4} y={py(0) - 8} textAnchor="end">β₁</text>
              <text className="contact-axis-label" x={px(0) + 9} y={plot.top + 12}>β₂</text>
            </svg>
            <div className="constraint-contact-result">
              <span>{key === "l1" ? labels.l1Optimum : labels.l2Optimum}</span>
              <SafeLatex>{`\\hat{\\beta} = (${fmt(solution[0])}, ${fmt(solution[1])})`}</SafeLatex>
            </div>
          </div>
        ))}
      </div>
      <label className="norm-balls-budget constraint-contact-budget" htmlFor={inputId}>
        <span>{labels.budget}</span>
        <output htmlFor={inputId}>t = {fmt(budget)}</output>
        <input id={inputId} type="range" min={min} max={max} step={step} value={budget} onChange={(event) => onChange(Number(event.currentTarget.value))} aria-valuetext={`${labels.budget} ${fmt(budget)}`} />
        <span className="norm-balls-scale"><span>{min}</span><span>{max}</span></span>
      </label>
    </section>
  );
}

function RegularizationPath({ lambda, preferred, max, step, onChange, locale }: {
  lambda: number;
  preferred: number[];
  max: number;
  step: number;
  onChange: (lambda: number) => void;
  locale: Locale;
}) {
  const W = 720;
  const H = 420;
  const L = 70;
  const R = 30;
  const T = 48;
  const B = 58;
  const width = W - L - R;
  const height = H - T - B;
  const x = (value: number) => L + (value / max) * width;
  const y = (value: number) => T + ((2.2 - value) / 3.5) * height;
  const values = preferred.map((coefficient) => soft(coefficient, lambda));
  const xTicks = linspace(0, max, 5);
  const yTicks = [-1, 0, 1, 2];
  const paths = preferred.map((coefficient) => {
    const cutoff = Math.min(max, Math.abs(coefficient));
    return linspace(0, cutoff, 81).map((value): [number, number] => [value, soft(coefficient, value)]);
  });
  const labels = locale === "ar"
    ? { slider: "قوة التنظيم لامبدا" }
    : { slider: "Regularization strength lambda" };
  const setFromPointer = (event: ReactPointerEvent<SVGRectElement>) => {
    const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!bounds?.width) return;
    const viewX = ((event.clientX - bounds.left) / bounds.width) * W;
    onChange(Number(Math.max(0, Math.min(max, ((viewX - L) / width) * max)).toFixed(2)));
  };
  const handleKeyDown = (event: ReactKeyboardEvent<SVGRectElement>) => {
    const next = event.key === "ArrowLeft" || event.key === "ArrowDown" ? lambda - step
      : event.key === "ArrowRight" || event.key === "ArrowUp" ? lambda + step
        : event.key === "PageDown" ? lambda - step * 10
          : event.key === "PageUp" ? lambda + step * 10
            : event.key === "Home" ? 0
              : event.key === "End" ? max
                : null;
    if (next === null) return;
    event.preventDefault();
    onChange(Number(Math.max(0, Math.min(max, next)).toFixed(2)));
  };

  return (
    <section className="regularization-path" dir="ltr" aria-label={locale === "ar" ? "مسارات المعاملات مع زيادة لامبدا" : "Coefficient paths as lambda increases"}>
      <div className="regularization-path-legend">
        {preferred.map((_, index) => <span key={index}><i style={{ background: color(index) }} /><SafeLatex>{`\\beta_${index + 1}`}</SafeLatex></span>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={locale === "ar" ? "اسحب أو استخدم الأسهم لتغيير لامبدا" : "Drag or use the arrow keys to change lambda"}>
        {xTicks.map((tick) => (
          <g key={`x-${tick}`}>
            <line className="path-grid" x1={x(tick)} x2={x(tick)} y1={T} y2={H - B} />
            <text className="tick" x={x(tick)} y={H - B + 24} textAnchor="middle">{tickfmt(tick)}</text>
          </g>
        ))}
        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            {tick !== 0 && <line className="path-grid" x1={L} x2={W - R} y1={y(tick)} y2={y(tick)} />}
            <text className="tick" x={L - 12} y={y(tick) + 5} textAnchor="end">{tick}</text>
          </g>
        ))}
        <line className="axis" x1={L} x2={W - R} y1={y(0)} y2={y(0)} />
        <line className="axis" x1={L} x2={L} y1={T} y2={H - B} />
        {paths.map((points, index) => (
          <motion.path key={index} className="path-series" initial={false} animate={{ d: points.map(([a, b], pointIndex) => `${pointIndex ? "L" : "M"}${x(a)},${y(b)}`).join(" ") }} stroke={color(index)} />
        ))}
        <line className="path-cursor" x1={x(lambda)} x2={x(lambda)} y1={T} y2={H - B} />
        {preferred.map((coefficient, index) => <circle key={`zero-${index}`} className="path-zero-point" cx={x(Math.min(max, Math.abs(coefficient)))} cy={y(0)} r="3.5" fill={color(index)} />)}
        {values.map((value, index) => value !== 0 && <motion.circle key={index} className="path-current" initial={false} animate={{ cx: x(lambda), cy: y(value) }} r="6" fill={color(index)} />)}
        <text className="axis-label" x={L + width / 2} y={H - 10} textAnchor="middle">λ</text>
        <text className="axis-label" x="20" y={T + height / 2} textAnchor="middle" transform={`rotate(-90 20 ${T + height / 2})`}>β</text>
        <rect
          className="path-interaction-area"
          x={L}
          y={T}
          width={width}
          height={height}
          tabIndex={0}
          role="slider"
          aria-label={labels.slider}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={lambda}
          aria-valuetext={`λ = ${fmt(lambda)}; β = ${vfmt(values)}`}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setFromPointer(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) setFromPointer(event);
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onKeyDown={handleKeyDown}
        />
      </svg>
      <div className="regularization-path-readout">
        <span>λ = {fmt(lambda)}</span>
        <SafeLatex>{`\\boldsymbol{\\beta} = (${values.map(fmt).join(",\\; ")})`}</SafeLatex>
      </div>
    </section>
  );
}

function PredictionAgreementPlots({ baseline, comparisons, limit }: {
  baseline: number[];
  comparisons: { method: string; values: number[]; color: string }[];
  limit: number;
}) {
  const W = 300;
  const H = 280;
  const left = 48;
  const top = 16;
  const size = 224;
  const min = -limit;
  const max = limit;
  const px = (value: number) => left + ((value - min) / (max - min)) * size;
  const py = (value: number) => top + ((max - value) / (max - min)) * size;
  const ticks = [min, 0, max];

  return (
    <div className="prediction-agreement-panels" dir="ltr">
      {comparisons.map(({ method, values, color: pointColor }) => (
        <section className="prediction-agreement-panel" key={method}>
          <h3>{method} vs OLS</h3>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Reference predictions from ${method} compared with OLS; points near the diagonal indicate agreement`}>
            {ticks.map((tick) => (
              <g key={tick}>
                <line className="prediction-grid" x1={px(tick)} x2={px(tick)} y1={top} y2={top + size} />
                <line className="prediction-grid" x1={left} x2={left + size} y1={py(tick)} y2={py(tick)} />
                <text className="prediction-tick" x={px(tick)} y={top + size + 17} textAnchor="middle">{tickfmt(tick)}</text>
                <text className="prediction-tick" x={left - 7} y={py(tick) + 4} textAnchor="end">{tickfmt(tick)}</text>
              </g>
            ))}
            <line className="prediction-equality" x1={px(min)} y1={py(min)} x2={px(max)} y2={py(max)} />
            {baseline.map((prediction, index) => <circle key={index} cx={px(prediction)} cy={py(values[index])} r="1.6" fill={pointColor} />)}
            <text className="prediction-axis-label" x={left + size / 2} y={H - 10} textAnchor="middle">OLS prediction</text>
            <text className="prediction-axis-label" x="13" y={top + size / 2} textAnchor="middle" transform={`rotate(-90 13 ${top + size / 2})`}>{method} prediction</text>
          </svg>
        </section>
      ))}
    </div>
  );
}

function Bars({ groups, series, labels, lang }: { groups: LocalizedText[]; series: BarSeries[]; labels?: string; lang: Locale }) {
  const [activeBar, setActiveBar] = useState<{ group: string; series: string; value: number } | null>(null);
  const W = 720,
    H = 360,
    L = 65,
    R = 20,
    T = 30,
    B = 65,
    w = W - L - R,
    h = H - T - B;
  const values = series.flatMap((s) => s.values),
    min = Math.min(0, ...values),
    max = Math.max(0.001, ...values) * 1.14;
  const py = (v: number) => T + ((max - v) / (max - min)) * h;
  const cluster = w / groups.length,
    bw = Math.min(70, (cluster * 0.72) / series.length);
  return (
    <div dir="ltr">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={labels ?? "Bar comparison"}
      >
        {linspace(min, max, 5).map((v) => (
          <g key={v}>
            <line className="grid" x1={L} x2={W - R} y1={py(v)} y2={py(v)} />
            <text className="tick" x={L - 8} y={py(v) + 5} textAnchor="end">
              {tickfmt(v)}
            </text>
          </g>
        ))}
        <line className="axis" x1={L} x2={W - R} y1={py(0)} y2={py(0)} />
        {groups.map((label, i) => (
          <g key={i}>
            {series.map((s, j) => {
              const value = s.values[i],
                height = Math.abs(py(value) - py(0)),
                x = L + cluster * (i + 0.5) + (j - series.length / 2) * bw;
              return (
                <g key={j}>
                  <motion.rect
                    initial={false}
                    animate={{
                      x,
                      y: Math.min(py(value), py(0)),
                      width: bw - 4,
                      height,
                    }}
                    fill={s.color ?? color(j)}
                    className="interactive-bar"
                    tabIndex={0}
                    role="graphics-symbol"
                    aria-label={`${text(label, lang)}, ${text(s.label, lang)}: ${fmt(value)}`}
                    onPointerEnter={() => setActiveBar({ group: text(label, lang), series: text(s.label, lang), value })}
                    onPointerLeave={() => setActiveBar(null)}
                    onFocus={() => setActiveBar({ group: text(label, lang), series: text(s.label, lang), value })}
                    onBlur={() => setActiveBar(null)}
                  >
                    <title>{`${text(s.label, lang)}: ${fmt(value)}`}</title>
                  </motion.rect>
                  {series.length === 1 && (
                    <text
                      className="bar-value"
                      x={x + (bw - 4) / 2}
                      y={value >= 0 ? py(value) - 8 : py(value) + 18}
                      textAnchor="middle"
                    >
                      {fmt(value)}
                    </text>
                  )}
                </g>
              );
            })}
            <text
              className="tick"
              x={L + cluster * (i + 0.5)}
              y={H - B + 28}
              textAnchor="middle"
            >
              {text(label, lang)}
            </text>
          </g>
        ))}
      </svg>
      <p className="chart-inspector">
        {activeBar
          ? `${activeBar.group} · ${activeBar.series}: ${fmt(activeBar.value)}`
          : text({ ar: "مرر أو ركّز على عمود لقراءة قيمته", en: "Hover or focus a bar to inspect its value" }, lang)}
      </p>
      <div className="legend">
        {series.map((s, i) => (
          <span key={i}>
            <i style={{ background: s.color ?? color(i) }} />
            {text(s.label, lang)}
          </span>
        ))}
      </div>
    </div>
  );
}

function Readout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`readout ${className ?? ""}`} aria-live="polite">
      {children}
    </div>
  );
}
function Matrix({ matrix, label, lang }: { matrix: number[][]; label: string; lang: Locale }) {
  const [activeCell, setActiveCell] = useState<{ row: number; column: number; value: number } | null>(null);
  return (
    <div className="matrix-wrap">
      <p>{label}</p>
      <table dir="ltr" className="matrix">
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              {row.map((value, j) => (
                <td
                  key={j}
                  tabIndex={0}
                  aria-label={`Row ${i + 1}, column ${j + 1}: ${fmt(value)}`}
                  onPointerEnter={() => setActiveCell({ row: i + 1, column: j + 1, value })}
                  onPointerLeave={() => setActiveCell(null)}
                  onFocus={() => setActiveCell({ row: i + 1, column: j + 1, value })}
                  onBlur={() => setActiveCell(null)}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor:
                        Math.abs(value) < 1e-9
                          ? "var(--paper)"
                          : "var(--accent)",
                      opacity: 1,
                    }}
                  />
                  <span
                    style={{
                      color:
                        Math.abs(value) < 1e-9 ? "var(--ink)" : "var(--paper)",
                    }}
                  >
                    {fmt(value)}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="matrix-inspector">
        {activeCell
          ? `(${activeCell.row}, ${activeCell.column}) = ${fmt(activeCell.value)}`
          : text({ ar: "مرر أو ركّز على خلية لفحص قيمتها", en: "Hover or focus a cell to inspect its value" }, lang)}
      </p>
    </div>
  );
}

export function Figure({ cfg, state: s, lang, onChange = () => {} }: {
  cfg: FigureConfig;
  state: FigureState;
  lang: Locale;
  onChange?: (patch: Partial<FigureState>) => void;
}) {
  const d = cfg.data,
    t = s.budget;
  const tr = (ar: string, en: string) => (lang === "ar" ? ar : en);
  switch (cfg.renderer) {
    case "normBalls":
      return <NormBalls budget={t} min={cfg.controls[0].min ?? 0.2} max={cfg.controls[0].max ?? 2} step={cfg.controls[0].step ?? 0.02} onChange={(budget) => onChange({ budget })} locale={lang} />;
    case "countMagnitude": {
      const a = s.value;
      return <CountMagnitude value={a} vectors={d.vectors} min={cfg.controls[0].min ?? -2} max={cfg.controls[0].max ?? 2} step={cfg.controls[0].step ?? 0.02} onChange={(value) => onChange({ value })} locale={lang} />;
    }
    case "geometry": {
      return <ConstraintContact budget={t} min={cfg.controls[0].min ?? 0.2} max={cfg.controls[0].max ?? 2.5} step={cfg.controls[0].step ?? 0.02} onChange={(budget) => onChange({ budget })} locale={lang} />;
    }
    case "path": {
      return <RegularizationPath lambda={s.lambda} preferred={d.preferred} max={cfg.controls[0].max ?? 2.2} step={cfg.controls[0].step ?? 0.02} onChange={(lambda) => onChange({ lambda })} locale={lang} />;
    }
    case "regression": {
      const b0 = ridge(d.X, d.y, 0),
        br = ridge(d.X, d.y, s.ridgeLambda),
        bl = lasso(d.X, d.y, s.lassoLambda);
      const bs = [b0, br, bl];
      const methods = ["OLS", "Ridge", "Lasso"];
      const predictions = bs.map((b) => matvec(d.Xreference, b).map((value: number) => value + d.intercept));
      const predictionLimit = Math.max(1, ...predictions.flatMap((values: number[]) => values.map((value) => Math.abs(value)))) * 1.08;
      const mse = bs.map(
        (b) =>
          sum(
            matvec(d.Xreference, b).map(
              (v: number, i: number) => (d.yreference[i] - d.intercept - v) ** 2,
            ),
          ) / d.yreference.length,
      );
      return (
        <div className="regression-comparison" dir="ltr">
          <PredictionAgreementPlots
            baseline={predictions[0]}
            comparisons={[
              { method: "Ridge", values: predictions[1], color: color(1) },
              { method: "Lasso", values: predictions[2], color: color(2) },
            ]}
            limit={predictionLimit}
          />
          <table>
            <thead>
              <tr>
                <th scope="col"></th>
                {[1, 2, 3].map((index) => <th scope="col" key={index}><SafeLatex>{`\\hat{\\beta}_${index}`}</SafeLatex></th>)}
                <th scope="col">{tr("خطأ مرجعي", "Ref. MSE")}</th>
              </tr>
            </thead>
            <tbody>
              {bs.map((coefficients, methodIndex) => (
                <tr key={methods[methodIndex]}>
                  <th scope="row"><i style={{ background: color(methodIndex) }} />{methods[methodIndex]}</th>
                  {coefficients.map((coefficient: number, index: number) => {
                    const width = Math.min(Math.abs(coefficient) / 2.2 * 50, 50);
                    return (
                      <td key={index}>
                        <div className="regression-coefficient">
                          <span className="regression-meter" aria-hidden="true">
                            <i style={{ left: coefficient < 0 ? `calc(50% - ${width}%)` : "50%", width: `${width}%`, background: color(methodIndex) }} />
                          </span>
                          <span>{fmt(coefficient)}</span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="regression-mse">{fmt(mse[methodIndex])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "threshold": {
      const a = s.a,
        l = s.lambda,
        w = soft(a, l),
        wr = a / (1 + l);
      const lassoFormula = String.raw`\hat w_L = S_\lambda(a) = ${fmt(w)}`;
      const ridgeFormula = String.raw`\hat w_R = \frac{a}{1+\lambda} = ${fmt(wr)}`;
      return (
        <div className="threshold-visual">
          <Plot
            x={[-3, 3]}
            y={[-3, 3]}
            xBand={[-l, l]}
            xlabel="a"
            ylabel="ŵ"
            series={[
              {
                label: "OLS",
                points: samples((x) => x, -3, 3),
                color: color(2),
                dash: "5 5",
              },
              {
                label: "Ridge",
                points: samples((x) => x / (1 + l), -3, 3),
                color: color(1),
              },
              {
                label: "Lasso",
                points: samples((x) => soft(x, l), -3, 3),
                color: color(0),
              },
            ]}
            points={[
              { x: a, y: w, label: "Lasso estimate" },
              { x: a, y: wr, color: color(1), label: "Ridge estimate" },
            ]}
          />
          <div className="threshold-readout">
            <div className="threshold-estimate">
              <span>Lasso</span>
              <SafeLatex>{"$$" + lassoFormula + "$$"}</SafeLatex>
            </div>
            <div className="threshold-estimate">
              <span>Ridge</span>
              <SafeLatex>{"$$" + ridgeFormula + "$$"}</SafeLatex>
            </div>
          </div>
        </div>
      );
    }
    case "stability": {
      return <SelectionStability selected={d.selected} initialSamples={s.samples} locale={lang} />;
    }
    case "recovery": {
      return <RecoveryFailure t={s.t} onChange={(t) => onChange({ t })} min={cfg.controls[0].min ?? -0.4} max={cfg.controls[0].max ?? 1.1} step={cfg.controls[0].step ?? 0.01} data={d} locale={lang} />;
    }
    case "tv": {
      return <TotalVariation row={d.row} lambda={s.lambda} min={cfg.controls[0].min ?? 0} max={cfg.controls[0].max ?? 70} step={cfg.controls[0].step ?? 1} onChange={(lambda) => onChange({ lambda })} locale={lang} />;
    }
    case "weights": {
      const control = cfg.controls.find((item) => item.key === "lambda");
      return <WeightPatterns matrix={d.matrix} lambda={s.lambda} min={control?.min ?? 0} max={control?.max ?? 0.4} step={control?.step ?? 0.01} onChange={(lambda) => onChange({ lambda })} locale={lang} />;
    }
    case "storage": {
      const control = cfg.controls.find((item) => item.key === "sparsity");
      return <StorageComparison rows={d.rows} columns={d.columns} valueBytes={d.valueBytes} indexBytes={d.indexBytes} sparsity={s.sparsity} min={control?.min ?? 0} max={control?.max ?? 99} step={control?.step ?? 1} onChange={(sparsity) => onChange({ sparsity })} locale={lang} />;
    }
    case "singular": {
      const control = cfg.controls.find((item) => item.key === "tau");
      return <SingularSpectrum singularValues={d.singularValues} tau={s.tau} min={control?.min ?? 0} max={control?.max ?? 3.5} step={control?.step ?? 0.02} onChange={(tau) => onChange({ tau })} locale={lang} />;
    }
    case "envelope": {
      return <ConvexEnvelope bound={s.M} min={cfg.controls[0].min ?? 0.5} max={cfg.controls[0].max ?? 3} step={cfg.controls[0].step ?? 0.1} onChange={(M) => onChange({ M })} locale={lang} />;
    }
    case "gap": {
      return <OptimalityGap history={d.history} initialIteration={s.iteration} locale={lang} />;
    }
    default:
      throw Error(`Unknown renderer ${cfg.renderer}`);
  }
}

export default function L1Visuals({ figureId, locale, figureNumber }: { figureId: string; locale: Locale; figureNumber: number }) {
  const cfg = figures.find((item) => item.id === figureId);
  if (!cfg) throw new Error(`Unknown L1 figure: ${figureId}`);
  const defaults = () =>
    Object.fromEntries(
      cfg.controls.map((control) => [control.key, control.default]),
    );
  const [state, setState] = useState<FigureState>(defaults);
  const change = (patch: Partial<FigureState>) => setState((previous) => ({ ...previous, ...patch }));
  const hasInlineControls = figureId === "01_norm_balls" || figureId === "02_count_magnitude" || figureId === "04_constraint_geometry" || figureId === "05_regularization_path" || figureId === "09_selection_stability" || figureId === "10_recovery_failure" || figureId === "11_total_variation" || figureId === "12_weight_patterns" || figureId === "13_sparse_storage" || figureId === "14_singular_shrinkage" || figureId === "03_convex_envelope" || figureId === "08_optimization_gap";
  const theme = {
    "--paper": "var(--paper-val)",
    "--ink": "var(--ink-val)",
    "--accent": "var(--accent-val)",
    "--pencil": "var(--pencil-val)",
    "--secondary": "var(--pencil-val)",
    "--olive": cfg.theme.additional_plot_color.olive,
    "--gold": cfg.theme.additional_plot_color.gold,
  };
  return (
    <ResearchFigure
      number={figureNumber}
      title={text(cfg.title, locale)}
      caption={text(cfg.caption, locale)}
      locale={locale}
      className={figureId === "12_weight_patterns" || figureId === "13_sparse_storage" || figureId === "14_singular_shrinkage" ? "l1-wide-figure" : undefined}
      dataInteractive={`l1-${figureId}`}
    >
      <ResearchFigurePanel className="l1-figure-panel">
        <div
          className="l1-visual"
          style={theme as CSSProperties}
          lang={locale}
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <MotionConfig
            transition={{
              duration: cfg.framerMotion.duration,
              ease: cfg.framerMotion.ease,
            }}
            reducedMotion="user"
          >
            <div className={`figure-layout${hasInlineControls ? " figure-layout-inline-controls" : ""}`}>
              <div className="figure-body">
                <Figure
                  cfg={cfg}
                  state={state}
                  lang={locale}
                  onChange={change}
                />
                {cfg.teaching && (
                  <div className="teaching">
                    <h2>
                      {locale === "ar" ? "جرّب ثم لاحظ" : "Try and observe"}
                    </h2>
                    <p>{text(cfg.teaching.try, locale)}</p>
                    <p>{text(cfg.teaching.notice, locale)}</p>
                  </div>
                )}
              </div>
              {!hasInlineControls && <form
                className="controls"
                onSubmit={(event) => event.preventDefault()}
              >
                {cfg.controls.map((control) => {
                  const id = `l1-${figureId}-${control.key}`;
                  return (
                    <label key={control.key} htmlFor={id}>
                      <span>
                        {text(control.label, locale)}{" "}
                        <output dir="ltr">
                          {control.type === "range"
                            ? fmt(Number(state[control.key]))
                            : ""}
                        </output>
                      </span>
                      {control.type === "range" ? (
                        <input
                          id={id}
                          type="range"
                          min={control.min}
                          max={control.max}
                          step={control.step}
                          value={state[control.key]}
                          onChange={(event) => change({ [control.key]: Number(event.target.value) })}
                        />
                      ) : (
                        <select
                          id={id}
                          value={state[control.key]}
                          onChange={(event) => change({ [control.key]: event.target.value })}
                        >
                          {(control.options ?? []).map((option) => (
                            <option key={option.value} value={option.value}>
                              {text(option.label, locale)}
                            </option>
                          ))}
                        </select>
                      )}
                    </label>
                  );
                })}
                <button type="button" onClick={() => setState(defaults())}>
                  {locale === "ar" ? "إعادة القيم" : "Reset values"}
                </button>
              </form>}
            </div>
          </MotionConfig>
        </div>
      </ResearchFigurePanel>
    </ResearchFigure>
  );
}
