"use client";

import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { VizToggleGroup } from "@/research/features/studies/applied-stats-in-ai/VizPrimitives";
import { RESEARCH_CHART_FONT_SIZE } from "@/research/lib/typography";

// Values come from the PNG labels and the original report's appendix (Tables 22–23, 29–32); nothing is read off a plot.

const INK = "var(--color-ink)";
const PENCIL = "var(--pencil-val)";
const tick = { fontSize: RESEARCH_CHART_FONT_SIZE, fill: PENCIL, fontFamily: "var(--font-mono)" };
const grid = <CartesianGrid vertical={false} stroke={INK} strokeOpacity={0.08} />;
const tooltipProps = {
  contentStyle: { background: "var(--paper-val)", border: "1px solid var(--border-val)", borderRadius: 2, fontFamily: "var(--font-mono)", fontSize: RESEARCH_CHART_FONT_SIZE },
  labelStyle: { color: "var(--ink-val)", marginBottom: 4 },
  itemStyle: { color: "var(--ink-val)", padding: 0 },
  cursor: { stroke: INK, strokeOpacity: 0.2, fill: INK, fillOpacity: 0.04 },
  isAnimationActive: false,
};
const pct = (value: number, digits = 2) => `${value.toFixed(digits)}%`;

const METHODS = [
  { key: "baseline", label: "Baseline", color: PENCIL },
  { key: "l1", label: "L1 + IMP", color: "var(--viz-l1)" },
  { key: "svd", label: "SVD", color: "var(--viz-svd)" },
  { key: "l0", label: "L0 reconstructed", color: "var(--viz-l0)" },
] as const;

function Panel({ controls, children, table }: { controls?: React.ReactNode; children: React.ReactNode; table?: { headers: string[]; rows: (string | number)[][] } }) {
  return (
    <div className="research-figure-panel p-4 md:p-5">
      {controls && <div className="mb-4 flex flex-wrap items-center gap-3">{controls}</div>}
      {children}
      {table && <details className="mt-3 font-mono text-xs text-ink/60">
        <summary className="cursor-pointer select-none hover:text-accent">Data table</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead><tr>{table.headers.map((h) => <th key={h} className="border-b border-ink/15 py-1 pe-3 font-normal">{h}</th>)}</tr></thead>
            <tbody>{table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="border-b border-ink/5 py-1 pe-3 text-ink">{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </details>}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 font-mono text-xs text-ink/70">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <svg width="16" height="8" aria-hidden="true"><line x1="0" y1="4" x2="16" y2="4" stroke={item.color} strokeWidth="2" strokeDasharray={item.dashed ? "4 3" : undefined} /></svg>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

// Figure 3
const PCA = [
  { layer: "Block 3", k: 41, width: 256 },
  { layer: "Block 4", k: 122, width: 512 },
  { layer: "Block 5", k: 59, width: 512 },
  { layer: "FC0", k: 285, width: 4096 },
  { layer: "FC3", k: 137, width: 4096 },
].map((d) => ({ ...d, share: (d.k / d.width) * 100 }));

function PCAAudit() {
  const [mode, setMode] = useState("count");
  const key = mode === "count" ? "k" : "share";
  return (
    <Panel
      controls={<VizToggleGroup value={mode} onChange={setMode} options={[{ value: "count", label: "Components" }, { value: "share", label: "% of layer width" }]} />}
      table={{ headers: ["Layer", "Components for 95%", "Layer width", "Share"], rows: PCA.map((d) => [d.layer, d.k, d.width, pct(d.share, 1)]) }}
    >
      <div style={{ height: 288 }}>
        <ResponsiveContainer>
          <BarChart data={PCA} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
            {grid}
            <XAxis dataKey="layer" tick={tick} tickLine={false} axisLine={{ stroke: INK, strokeOpacity: 0.3 }} />
            <YAxis tick={tick} tickLine={false} axisLine={false} width={44} tickFormatter={(v) => (mode === "count" ? v : `${v}%`)} />
            <Tooltip {...tooltipProps} formatter={(_v, _n, item) => [`${item.payload.k} of ${item.payload.width} (${pct(item.payload.share, 1)})`, "Components for 95% variance"]} />
            <Bar isAnimationActive={false} dataKey={key} fill={INK} fillOpacity={0.75} radius={[4, 4, 0, 0]} maxBarSize={56}>
              <LabelList dataKey={key} position="top" style={{ ...tick, fill: INK }} formatter={(v: number) => (mode === "count" ? v : pct(v, 1))} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

// Figure 5 — exact VGG19 counts; total 139,603,016.
const PARAMS = [
  { group: "Convolutions", n: 20_024_384 },
  { group: "FC0", n: 102_764_544 },
  { group: "FC3", n: 16_781_312 },
  { group: "FC6", n: 32_776 },
];
const PARAM_TOTAL = PARAMS.reduce((sum, d) => sum + d.n, 0);

function BaselineParameters() {
  const [mode, setMode] = useState("millions");
  const data = PARAMS.map((d) => ({ ...d, value: mode === "millions" ? d.n / 1e6 : (d.n / PARAM_TOTAL) * 100 }));
  return (
    <Panel
      controls={<VizToggleGroup value={mode} onChange={setMode} options={[{ value: "millions", label: "Millions" }, { value: "share", label: "% of total" }]} />}
      table={{ headers: ["Group", "Parameters", "Share"], rows: [...PARAMS.map((d) => [d.group, d.n.toLocaleString("en-US"), pct((d.n / PARAM_TOTAL) * 100)]), ["Total", PARAM_TOTAL.toLocaleString("en-US"), "100%"]] }}
    >
      <div style={{ height: 224 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 64, left: 8, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke={INK} strokeOpacity={0.08} />
            <XAxis type="number" tick={tick} tickLine={false} axisLine={false} tickFormatter={(v) => (mode === "millions" ? `${v}M` : `${v}%`)} />
            <YAxis type="category" dataKey="group" tick={tick} tickLine={false} axisLine={{ stroke: INK, strokeOpacity: 0.3 }} width={96} />
            <Tooltip {...tooltipProps} formatter={(_v, _n, item) => [`${item.payload.n.toLocaleString("en-US")} (${pct((item.payload.n / PARAM_TOTAL) * 100)})`, "Parameters"]} />
            <Bar isAnimationActive={false} dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {data.map((d) => <Cell key={d.group} fill={d.group === "Convolutions" ? INK : "var(--viz-l1)"} fillOpacity={d.group === "Convolutions" ? 0.75 : 1} />)}
              <LabelList dataKey="value" position="right" style={{ ...tick, fill: INK }} formatter={(v: number) => (mode === "millions" ? `${v.toFixed(2)}M` : pct(v))} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 font-mono text-xs text-ink/60">Fully connected classifier: {pct(((PARAM_TOTAL - PARAMS[0].n) / PARAM_TOTAL) * 100)} of all parameters.</p>
    </Panel>
  );
}

// Figure 6 — saved epochs from notebook CELL 4 (values match report Tables 22–23).
const L1_EPOCHS = [
  { epoch: 1, sparsity: 21.5, f1: 98.1 },
  { epoch: 3, sparsity: 47.9, f1: 98.96 },
  { epoch: 5, sparsity: 70.5, f1: 98.42 },
  { epoch: 10, sparsity: 82.3, f1: 98.58 },
  { epoch: 15, sparsity: 91.4, f1: 97.83 },
  { epoch: 20, sparsity: 92.5, f1: 98.19 },
  { epoch: 21, sparsity: 93.7, f1: 91.47 },
  { epoch: 22, sparsity: 94.7, f1: 72.23 },
];

function EpochPanel({ title, data, sync, height = 160, children, yDomain, yFormat, xTicks, yTicks, format = (v) => String(v), selected, xLabel }: {
  title: string;
  data: object[];
  sync: string;
  height?: number;
  children: React.ReactNode;
  yDomain?: [number, number];
  yFormat?: (v: number) => string;
  xTicks?: number[];
  yTicks?: number[];
  format?: (v: number) => string;
  selected?: number;
  xLabel?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 font-mono text-xs uppercase tracking-widest text-ink/60">{title}</p>
      <div style={{ height }}>
        <ResponsiveContainer>
          <LineChart data={data} syncId={sync} margin={{ top: 6, right: 12, left: 0, bottom: xLabel ? 14 : 0 }}>
            {grid}
            <XAxis dataKey="epoch" type="number" domain={["dataMin", "dataMax"]} ticks={xTicks} allowDecimals={false} tick={tick} tickLine={false} axisLine={{ stroke: INK, strokeOpacity: 0.3 }}
              label={xLabel ? { value: "Epoch", position: "insideBottom", offset: -10, style: tick } : undefined} />
            <YAxis tick={tick} tickLine={false} axisLine={false} width={44} domain={yDomain ?? ["auto", "auto"]} ticks={yTicks} tickFormatter={yFormat} />
            <Tooltip {...tooltipProps} formatter={(v: number) => format(v)} labelFormatter={(e) => `Epoch ${e}${e === selected ? " · selected checkpoint" : ""}`} />
            {selected !== undefined && <ReferenceLine x={selected} stroke={INK} strokeOpacity={0.45} strokeDasharray="4 3" />}
            {children}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function L1Progression() {
  return (
    <Panel table={{ headers: ["Epoch", "Soft sparsity", "Validation macro-F1"], rows: L1_EPOCHS.map((d) => [d.epoch, pct(d.sparsity, 1), pct(d.f1)]) }}>
      <div className="grid gap-4">
        <EpochPanel title="Soft sparsity (%)" format={(v) => pct(v, 1)} data={L1_EPOCHS} xTicks={[1, 5, 10, 15, 20, 22]} sync="l1" selected={20} yDomain={[0, 100]} yFormat={(v) => `${v}%`}>
          <Line dataKey="sparsity" name="Soft sparsity" stroke="var(--viz-l1)" strokeWidth={2} dot={{ r: 4, strokeWidth: 0, fill: "var(--viz-l1)" }} activeDot={{ r: 6 }} isAnimationActive={false} />
        </EpochPanel>
        <EpochPanel title="Validation macro-F1 (%)" format={(v) => pct(v)} data={L1_EPOCHS} xTicks={[1, 5, 10, 15, 20, 22]} sync="l1" selected={20} yDomain={[70, 100]} yTicks={[70, 80, 90, 100]} yFormat={(v) => `${v}%`} xLabel>
          <Line dataKey="f1" name="Validation macro-F1" stroke={INK} strokeWidth={2} dot={{ r: 4, strokeWidth: 0, fill: INK }} activeDot={{ r: 6 }} isAnimationActive={false} />
        </EpochPanel>
      </div>
      <p className="mt-2 font-mono text-xs text-ink/60">Dashed line: selected checkpoint (epoch 20). Hover either panel to read both.</p>
    </Panel>
  );
}

// Figure 7 — dots, not bars: the differences live in a narrow band a zero-based bar would hide.
const SVD_STAGES = [
  { stage: "Before fine-tuning", split: "validation", f1: 95.32 },
  { stage: "Selected epoch 8", split: "validation", f1: 98.86 },
  { stage: "Held-out test", split: "test", f1: 98.77 },
];

function SVDRecovery() {
  return (
    <Panel table={{ headers: ["Stage", "Split", "Macro-F1"], rows: SVD_STAGES.map((d) => [d.stage, d.split, pct(d.f1)]) }}>
      <div style={{ height: 240 }}>
        <ResponsiveContainer>
          <LineChart data={SVD_STAGES} margin={{ top: 24, right: 32, left: 0, bottom: 0 }}>
            {grid}
            <XAxis dataKey="stage" tick={tick} tickLine={false} axisLine={{ stroke: INK, strokeOpacity: 0.3 }} interval={0} padding={{ left: 40, right: 40 }} />
            <YAxis tick={tick} tickLine={false} axisLine={false} width={44} domain={[94, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip {...tooltipProps} formatter={(v: number, _n, item) => [`${pct(v)} (${item.payload.split})`, "Macro-F1"]} />
            <ReferenceLine y={98.57} stroke={PENCIL} strokeDasharray="4 3" label={{ value: "Baseline test 98.57%", position: "insideTopLeft", style: tick }} />
            <Line dataKey="f1" stroke="var(--viz-svd)" strokeWidth={2} dot={{ r: 6, strokeWidth: 0, fill: "var(--viz-svd)" }} activeDot={{ r: 8 }} isAnimationActive={false}>
              <LabelList dataKey="f1" position="top" offset={10} style={{ ...tick, fill: INK }} formatter={(v: number) => pct(v)} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

// Figure 8 — report Tables 29–32. lambda is ×10⁻³.
const L0_ROWS: [number, number, number, number, number, number][] = [
  // [lambda, trainLoss, valLoss, valF1, gateSparsity, weightSparsity]
  [1.0, 5.051, 0.182, 95.5, 0.0, 0.0], [1.1, 4.781, 0.454, 94.7, 6.0, 7.3], [1.1, 4.597, 0.211, 97.5, 12.8, 15.3], [1.1, 4.41, 0.35, 96.8, 19.6, 23.3],
  [1.2, 4.274, 0.398, 96.8, 26.1, 30.7], [1.2, 4.088, 0.48, 96.9, 32.1, 37.4], [1.2, 3.956, 0.514, 95.9, 37.8, 43.6], [1.3, 3.846, 0.574, 94.9, 42.8, 48.9],
  [1.3, 3.716, 0.809, 93.7, 46.9, 53.1], [1.3, 3.659, 0.652, 92.3, 50.8, 57.0], [1.4, 3.575, 0.963, 89.7, 53.9, 60.0], [1.4, 3.523, 0.349, 94.4, 56.6, 62.7],
  [1.4, 3.415, 0.582, 90.9, 59.1, 65.3], [1.0, 3.318, 0.353, 93.0, 60.9, 67.0], [1.0, 2.374, 0.229, 95.4, 61.9, 68.0], [1.0, 2.317, 0.326, 91.9, 63.0, 69.2],
  [1.0, 2.295, 0.466, 88.3, 63.8, 69.9], [1.0, 2.227, 0.422, 91.2, 64.6, 70.7], [1.0, 2.186, 0.279, 93.0, 65.4, 71.4], [1.0, 2.182, 0.367, 91.1, 66.0, 71.8],
  [1.0, 2.155, 0.476, 88.2, 66.5, 72.3], [1.0, 2.113, 0.328, 90.5, 66.9, 72.7], [1.0, 2.105, 0.246, 92.6, 67.2, 72.9], [1.0, 2.072, 0.277, 92.1, 67.5, 73.2],
  [1.0, 2.06, 0.213, 93.0, 67.9, 73.5], [1.0, 2.034, 0.243, 93.1, 68.2, 73.7], [1.0, 2.011, 0.208, 93.4, 68.4, 74.0], [1.0, 2.01, 0.22, 92.8, 68.7, 74.2],
  [1.0, 1.993, 0.253, 92.6, 68.9, 74.4], [1.0, 1.997, 0.242, 92.9, 69.1, 74.5], [1.0, 1.98, 0.278, 91.5, 69.2, 74.7], [1.0, 1.973, 0.274, 91.5, 69.3, 74.8],
  [1.0, 1.953, 0.282, 91.2, 69.3, 74.8], [1.0, 1.953, 0.252, 92.1, 69.5, 74.9], [1.0, 1.959, 0.254, 91.5, 69.5, 75.0], [1.0, 1.959, 0.232, 92.0, 69.6, 75.0],
  [1.0, 1.956, 0.224, 92.0, 69.6, 75.0], [1.0, 1.942, 0.222, 92.3, 69.6, 75.0], [1.0, 1.964, 0.222, 92.2, 69.6, 75.0], [1.0, 1.956, 0.222, 92.2, 69.6, 75.0],
];
const L0_EPOCHS = L0_ROWS.map(([lambda, trainLoss, valLoss, valF1, gate, weight], i) => ({ epoch: i + 1, lambda, trainLoss, valLoss, valF1, gate, weight }));

function L0Training() {
  const l0 = "var(--viz-l0)";
  return (
    <Panel table={{ headers: ["Epoch", "λ ×10⁻³", "Train loss", "Val loss", "Val macro-F1", "Gate sparsity", "Weight sparsity"], rows: L0_EPOCHS.map((d) => [d.epoch, d.lambda.toFixed(1), d.trainLoss.toFixed(3), d.valLoss.toFixed(3), pct(d.valF1, 1), pct(d.gate, 1), pct(d.weight, 1)]) }}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <EpochPanel title="Loss" format={(v) => v.toFixed(3)} data={L0_EPOCHS} xTicks={[1, 10, 20, 30, 40]} sync="l0" selected={30}>
            <Line dataKey="trainLoss" name="Train loss" stroke={INK} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="valLoss" name="Val loss" stroke={INK} strokeWidth={2} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          </EpochPanel>
          <Legend items={[{ label: "Train", color: INK }, { label: "Validation", color: INK, dashed: true }]} />
        </div>
        <div className="grid gap-2">
          <EpochPanel title="Validation macro-F1 (%)" format={(v) => pct(v, 1)} data={L0_EPOCHS} xTicks={[1, 10, 20, 30, 40]} sync="l0" selected={30} yDomain={[86, 100]} yFormat={(v) => `${v}%`}>
            <ReferenceLine y={98.57} stroke={PENCIL} strokeDasharray="2 3" label={{ value: "Baseline test 98.57%", position: "insideTopRight", style: tick }} />
            <Line dataKey="valF1" name="Val macro-F1" stroke={l0} strokeWidth={2} dot={false} isAnimationActive={false} />
          </EpochPanel>
        </div>
        <div className="grid gap-2">
          <EpochPanel title="Sparsity (%)" format={(v) => pct(v, 1)} data={L0_EPOCHS} xTicks={[1, 10, 20, 30, 40]} sync="l0" selected={30} yDomain={[0, 80]} yFormat={(v) => `${v}%`} xLabel>
            <ReferenceLine y={60} stroke={PENCIL} strokeDasharray="2 3" label={{ value: "Controller target 60%", position: "insideTopRight", style: tick }} />
            <Line dataKey="gate" name="Gate sparsity" stroke={l0} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="weight" name="Weight sparsity" stroke={l0} strokeWidth={2} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          </EpochPanel>
          <Legend items={[{ label: "Gate", color: l0 }, { label: "Weight", color: l0, dashed: true }]} />
        </div>
        <EpochPanel title="Penalty λ (×10⁻³)" format={(v) => v.toFixed(1)} data={L0_EPOCHS} xTicks={[1, 10, 20, 30, 40]} sync="l0" selected={30} yDomain={[0.9, 1.5]} yTicks={[1, 1.2, 1.4]} xLabel>
          <Line dataKey="lambda" name="λ ×10⁻³" type="stepAfter" stroke={INK} strokeWidth={2} dot={false} isAnimationActive={false} />
        </EpochPanel>
      </div>
      <p className="mt-3 font-mono text-xs text-ink/60">Dashed vertical line: retained checkpoint (epoch 30). Hover any panel to read all four at that epoch.</p>
    </Panel>
  );
}

// Figure 9 — color encodes the drop below 100%, so the eye goes to the losses.
const CLASSES = ["Basophil", "Eosinophil", "Erythroblast", "ImGran", "Lymphocyte", "Monocyte", "Neutrophil", "Platelet"];
const PER_CLASS = [
  { model: "Baseline", f1: [99.6, 99.9, 98.4, 96.3, 98.8, 97.9, 97.7, 100.0] },
  { model: "L1 + IMP", f1: [98.8, 99.8, 98.1, 96.4, 98.6, 97.0, 97.9, 99.8] },
  { model: "SVD", f1: [99.2, 99.8, 99.2, 97.1, 98.4, 98.6, 98.0, 100.0] },
  { model: "L0 masked", f1: [88.1, 98.4, 96.0, 88.6, 89.5, 90.2, 94.9, 99.2] },
  { model: "L0 reconstructed", f1: [88.1, 98.4, 96.0, 88.6, 89.5, 90.2, 94.9, 99.2] },
];

function PerClassF1() {
  const [mode, setMode] = useState("f1");
  const [hover, setHover] = useState<[number, number] | null>(null);
  const baseline = PER_CLASS[0].f1;
  return (
    <Panel
      controls={<VizToggleGroup value={mode} onChange={setMode} options={[{ value: "f1", label: "F1" }, { value: "delta", label: "Δ vs baseline" }]} />}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-separate border-spacing-0.5 font-mono text-xs" onMouseLeave={() => setHover(null)}>
          <thead>
            <tr>
              <th />
              {CLASSES.map((c, j) => <th key={c} className={`whitespace-nowrap px-0.5 pb-1 text-center text-[10px] font-normal ${hover?.[1] === j ? "text-ink" : "text-ink/60"}`}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {PER_CLASS.map((row, i) => (
              <tr key={row.model}>
                <th className={`pe-2 text-end font-normal whitespace-nowrap ${hover?.[0] === i ? "text-ink" : "text-ink/60"}`}>{row.model}</th>
                {row.f1.map((v, j) => {
                  const drop = 100 - v;
                  const delta = v - baseline[j];
                  const active = hover && (hover[0] === i || hover[1] === j);
                  return (
                    <td
                      key={j}
                      onMouseEnter={() => setHover([i, j])}
                      title={`${row.model} · ${CLASSES[j]}: ${v.toFixed(1)}% (${delta >= 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)} pp vs baseline)`}
                      className={`h-10 rounded-sm text-center text-ink transition-opacity ${hover && !active ? "opacity-40" : ""}`}
                      style={{ background: `color-mix(in srgb, var(--accent-val) ${Math.min(drop / 12, 1) * 60}%, transparent)` }}
                    >
                      {mode === "f1" ? v.toFixed(1) : i === 0 ? "—" : `${delta >= 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)}`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 font-mono text-xs text-ink/60">Darker cells fall further below 100% F1. Masked and reconstructed L0 are identical: surgery preserved predictions.</p>
    </Panel>
  );
}

// Figure 10 — Table: test macro-F1 and minimum class F1.
const PREDICTIVE = [
  { ...METHODS[0], macro: 98.57, min: 96.28 },
  { ...METHODS[1], macro: 98.29, min: 96.36 },
  { ...METHODS[2], macro: 98.77, min: 97.06 },
  { ...METHODS[3], macro: 93.11, min: 88.07 },
];

function PredictiveComparison() {
  const [metric, setMetric] = useState<"macro" | "min">("macro");
  const data = PREDICTIVE.map((d, i) => ({ ...d, y: i, x: d[metric] }));
  return (
    <Panel
      controls={<VizToggleGroup value={metric} onChange={(v) => setMetric(v as "macro" | "min")} options={[{ value: "macro", label: "Macro-F1" }, { value: "min", label: "Weakest class F1" }]} />}
      table={{ headers: ["Model", "Test macro-F1", "Minimum class F1"], rows: PREDICTIVE.map((d) => [d.label, pct(d.macro), pct(d.min)]) }}
    >
      <div style={{ height: 224 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 8, right: 56, left: 8, bottom: 8 }}>
            <CartesianGrid horizontal={false} stroke={INK} strokeOpacity={0.08} />
            <XAxis type="number" dataKey="x" domain={[86, 100]} tick={tick} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis type="number" dataKey="y" domain={[-0.5, 3.5]} reversed ticks={[0, 1, 2, 3]} tick={tick} tickLine={false} axisLine={{ stroke: INK, strokeOpacity: 0.3 }} width={112} tickFormatter={(i) => PREDICTIVE[i]?.label ?? ""} />
            <ZAxis range={[120, 120]} />
            <Tooltip {...tooltipProps} cursor={false} formatter={(v: number, name) => (name === "x" ? [pct(v), metric === "macro" ? "Test macro-F1" : "Weakest class F1"] : [null, null])} labelFormatter={() => ""} />
            <ReferenceLine x={PREDICTIVE[0][metric]} stroke={PENCIL} strokeDasharray="4 3" />
            <Scatter data={data} isAnimationActive={false}>
              {data.map((d) => <Cell key={d.key} fill={d.color} />)}
              <LabelList dataKey="x" position="right" offset={12} style={{ ...tick, fill: INK }} formatter={(v: number) => pct(v)} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 font-mono text-xs text-ink/60">Dashed line: baseline. Switch to the weakest class to see where L0&apos;s cost concentrates.</p>
    </Panel>
  );
}

// Figure 11
const PHYSICAL = [
  { ...METHODS[0], size: 532.6, latency: 231.3 },
  { ...METHODS[1], size: 532.6, latency: 238.8 },
  { ...METHODS[2], size: 82.4, latency: 216.6 },
  { ...METHODS[3], size: 134.9, latency: 96.9 },
];

function PhysicalBars({ metric, relative, title, unit }: { metric: "size" | "latency"; relative: boolean; title: string; unit: string }) {
  const base = PHYSICAL[0][metric];
  const data = PHYSICAL.map((d) => ({ ...d, value: relative ? (d[metric] / base) * 100 : d[metric] }));
  return (
    <div>
      <p className="mb-1 font-mono text-xs uppercase tracking-widest text-ink/60">{title}</p>
      <div style={{ height: 192 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 72, left: 8, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke={INK} strokeOpacity={0.08} />
            <XAxis type="number" tick={tick} tickLine={false} axisLine={false} domain={[0, relative ? 110 : "auto"]} tickFormatter={(v) => (relative ? `${v}%` : v)} />
            <YAxis type="category" dataKey="label" tick={tick} tickLine={false} axisLine={{ stroke: INK, strokeOpacity: 0.3 }} width={112} />
            <Tooltip {...tooltipProps} formatter={(_v, _n, item) => [`${item.payload[metric]} ${unit} (${pct((item.payload[metric] / base) * 100, 1)} of baseline)`, title]} />
            {relative && <ReferenceLine x={100} stroke={PENCIL} strokeDasharray="4 3" />}
            <Bar isAnimationActive={false} dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={26}>
              {data.map((d) => <Cell key={d.key} fill={d.color} />)}
              <LabelList dataKey="value" content={({ x, y, width, height, value }) => (
                <text x={Number(x) + Number(width) + 6} y={Number(y) + Number(height) / 2} dy={4} style={{ ...tick, fill: INK }}>{relative ? pct(Number(value), 1) : `${value} ${unit}`}</text>
              )} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PhysicalComparison() {
  const [mode, setMode] = useState("absolute");
  const relative = mode === "relative";
  return (
    <Panel
      controls={<VizToggleGroup value={mode} onChange={setMode} options={[{ value: "absolute", label: "Absolute" }, { value: "relative", label: "% of baseline" }]} />}
      table={{ headers: ["Model", "State size (MiB)", "Latency (ms/batch)"], rows: PHYSICAL.map((d) => [d.label, d.size, d.latency]) }}
    >
      <div className="grid gap-4">
        <PhysicalBars metric="size" relative={relative} title="Serialized model-state size" unit="MiB" />
        <PhysicalBars metric="latency" relative={relative} title="Forward-pass latency" unit="ms" />
      </div>
    </Panel>
  );
}

export const VGG19_FIGURES = {
  "/research/vgg19/figures/pca_audit.png": PCAAudit,
  "/research/vgg19/figures/baseline_parameters.png": BaselineParameters,
  "/research/vgg19/figures/l1_progression.png": L1Progression,
  "/research/vgg19/figures/svd_recovery.png": SVDRecovery,
  "/research/vgg19/figures/source_l0_training.png": L0Training,
  "/research/vgg19/figures/source_per_class_f1.png": PerClassF1,
  "/research/vgg19/figures/predictive_comparison.png": PredictiveComparison,
  "/research/vgg19/figures/physical_comparison.png": PhysicalComparison,
} as const;

export default function VGG19Figure({ src }: { src: string }) {
  const Figure = VGG19_FIGURES[src as keyof typeof VGG19_FIGURES];
  return Figure ? <Figure /> : null;
}
