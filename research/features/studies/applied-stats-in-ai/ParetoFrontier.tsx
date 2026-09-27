"use client";

import React, { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell
} from "recharts";

interface DataItem {
  name: string;
  f1: number;
  paramRed: number;
  latRed: number;
  color: string;
}

const data: DataItem[] = [
  { name: "Baseline", f1: 98.57, paramRed: 0, latRed: 0, color: "var(--pencil-val)" },
  { name: "L1 Lasso", f1: 98.29, paramRed: 92.8, latRed: -5.8, color: "var(--ink-val)" },
  { name: "SVD", f1: 98.77, paramRed: 84.5, latRed: 6.4, color: "var(--ink-val)" },
  { name: "L0 Surgery", f1: 93.11, paramRed: 74.5, latRed: 50.5, color: "var(--accent-val)" },
];

interface CustomShapeProps {
  cx?: number;
  cy?: number;
  fill?: string;
  payload?: DataItem;
}

const CustomShape = (props: CustomShapeProps) => {
  const { cx, cy, fill, payload } = props;
  if (!cx || !cy || !payload) return null;

  switch (payload.name) {
    case "Baseline":
      return <circle cx={cx} cy={cy} r={6} fill={fill} stroke="white" strokeWidth={1} />;
    case "L1 Lasso":
      return <rect x={cx - 6} y={cy - 6} width={12} height={12} fill={fill} stroke="white" strokeWidth={1} />;
    case "SVD":
      return (
        <path
          d={`M ${cx} ${cy - 8} L ${cx - 7} ${cy + 6} L ${cx + 7} ${cy + 6} Z`}
          fill={fill}
          stroke="white"
          strokeWidth={1}
        />
      );
    case "L0 Surgery":
      return (
        <path
          d={`M ${cx} ${cy - 8} L ${cx + 7} ${cy} L ${cx} ${cy + 8} L ${cx - 7} ${cy} Z`}
          fill={fill}
          stroke="white"
          strokeWidth={1}
        />
      );
    default:
      return <circle cx={cx} cy={cy} r={6} fill={fill} />;
  }
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: DataItem }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-paper border border-ink/10 p-4 rounded-sm">
        <p className="text-sm font-bold text-ink mb-1">{item.name}</p>
        <div className="space-y-1">
          <p className="text-xs text-secondary">Macro F1: <span className="font-mono text-ink">{item.f1}%</span></p>
          <p className="text-xs text-secondary">Param Red: <span className="font-mono text-ink">{item.paramRed}%</span></p>
          <p className="text-xs text-secondary">Latency Red: <span className="font-mono text-ink">{item.latRed}%</span></p>
        </div>
      </div>
    );
  }
  return null;
};

export default function ParetoFrontier() {
  const [metric, setMetric] = useState<"paramRed" | "latRed">("paramRed");

  return (
    <div className="w-full bg-paper border border-ink/10 rounded-sm p-8 my-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h4 className="text-xl font-latex font-bold text-ink mb-1 tracking-tight">The Pareto Efficiency Frontier</h4>
          <p className="text-sm text-secondary">Mapping the trade-off between predictive fidelity and resource constraints.</p>
        </div>
        
        <div className="flex bg-ink/5 p-1 rounded-sm border border-ink/5">
          <button
            onClick={() => setMetric("paramRed")}
            className={`px-4 py-1.5 rounded-sm text-xs font-mono transition-all ${
              metric === "paramRed" 
                ? "bg-paper text-accent" 
                : "text-tertiary hover:text-secondary"
            }`}
          >
            PARAMETERS
          </button>
          <button
            onClick={() => setMetric("latRed")}
            className={`px-4 py-1.5 rounded-sm text-xs font-mono transition-all ${
              metric === "latRed" 
                ? "bg-paper text-accent" 
                : "text-tertiary hover:text-secondary"
            }`}
          >
            LATENCY
          </button>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ink)" strokeOpacity={0.08} vertical={false} />
            <XAxis 
              type="number" 
              dataKey={metric} 
              name="Reduction" 
              unit="%" 
              domain={metric === "latRed" ? [-10, 60] : [0, 100]}
              tick={{ fontSize: 10, fill: "var(--pencil-val)", fontFamily: "var(--font-mono)" }}
              label={{ value: `Reduction in ${metric === "paramRed" ? "Parameters" : "Latency"} (%)`, position: 'bottom', offset: 0, style: { fontSize: 10, fill: 'var(--pencil-val)', fontFamily: "var(--font-mono)", textTransform: 'uppercase', letterSpacing: '0.1em' } }}
            />
            <YAxis 
              type="number" 
              dataKey="f1" 
              name="F1-Score" 
              unit="%" 
              domain={[96, 100]}
              tick={{ fontSize: 10, fill: "var(--pencil-val)", fontFamily: "var(--font-mono)" }}
              label={{ value: 'Macro F1-Score (%)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: 'var(--pencil-val)', fontFamily: "var(--font-mono)", textTransform: 'uppercase', letterSpacing: '0.1em' } }}
            />
            <ZAxis type="number" range={[100, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Methods" data={data} shape={<CustomShape />}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList dataKey="name" position="top" style={{ fontSize: 12, fontWeight: 'bold', fill: 'var(--ink-val)', fontFamily: 'var(--font-latex)' }} offset={10} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <svg width="14" height="14" viewBox="0 0 14 14" className="overflow-visible">
              {item.name === "Baseline" && <circle cx="7" cy="7" r="5" fill={item.color} />}
              {item.name === "L1 Lasso" && <rect x="2" y="2" width="10" height="10" fill={item.color} />}
              {item.name === "SVD" && <path d="M 7 1 L 1 12 L 13 12 Z" fill={item.color} />}
              {item.name === "L0 Surgery" && <path d="M 7 1 L 12 7 L 7 13 L 2 7 Z" fill={item.color} />}
            </svg>
            <span className="text-xxs font-mono uppercase tracking-widest text-secondary">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
