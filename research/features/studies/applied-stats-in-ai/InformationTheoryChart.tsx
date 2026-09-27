"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Info } from "lucide-react";

const infoData = [
  { name: "Baseline", aic: 279.2, bic: 1136.0, mdl: 142.0 },
  { name: "L1 Lasso", aic: 20.0, bic: 81.3, mdl: 10.2 },
  { name: "SVD", aic: 43.2, bic: 175.8, mdl: 22.0 },
  { name: "L0 Surgery", aic: 71.1, bic: 289.2, mdl: 36.2 },
];

export default function InformationTheoryChart() {
  return (
    <div className="w-full bg-paper border border-ink/10 rounded-sm p-8 my-8 ">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-latex font-bold text-ink tracking-tight">Statistical Parsimony Audit</h3>
          </div>
          <p className="text-sm text-secondary max-w-md italic leading-relaxed">
            Evaluating model selection through Information-Theoretic criteria. Lower values indicate a more efficient trade-off between empirical fit and parameter complexity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Charts */}
        <div className="lg:col-span-8 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={infoData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-ink)" strokeOpacity={0.05} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "var(--pencil-val)", fontFamily: "var(--font-mono)" }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--pencil-val)", fontFamily: "var(--font-mono)" }}
                label={{ value: 'Score (Millions)', angle: -90, position: 'insideLeft', fontSize: 10, fontFamily: "var(--font-mono)" }}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-ink)', fillOpacity: 0.03 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-paper border border-ink/10 p-3 rounded-sm  font-mono text-xxs">
                        <p className="font-bold text-ink mb-2 border-b border-ink/5 pb-1">{payload[0].payload.name}</p>
                        <div className="space-y-1">
                          <p className="text-ink">AIC: {payload[0].value}M</p>
                          <p className="text-accent">BIC: {payload[1].value}M</p>
                          <p className="text-tertiary">MDL: {payload[2].value}M</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '20px' }}
              />
              <Bar dataKey="aic" name="AIC (Akaike)" fill="var(--color-ink)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="bic" name="BIC (Bayesian)" fill="var(--color-accent)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="mdl" name="MDL (Min Description)" fill="var(--color-tertiary)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-ink/5 rounded-sm border border-ink/10">
            <h4 className="text-xs font-mono uppercase tracking-widest text-tertiary mb-4">Metric Definitions</h4>
            <div className="space-y-4">
              <div>
                <span className="text-xxs font-mono font-bold text-ink block mb-1">AIC / BIC</span>
                <p className="text-xs text-secondary leading-relaxed latex-prose">
                  Penalize complexity to prevent overfitting. BIC imposes a stronger penalty based on sample size, favouring simpler models.
                </p>
              </div>
              <div>
                <span className="text-xxs font-mono font-bold text-tertiary block mb-1">MDL</span>
                <p className="text-xs text-secondary leading-relaxed latex-prose">
                  Minimum Description Length. Evaluates the statistical hypothesis by the length of its shortest possible description.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border border-ink/10 rounded-sm bg-paper italic">
            <div className="flex gap-3">
              <Info className="w-4 h-4 text-accent shrink-0 mt-1" />
              <p className="text-xs text-secondary leading-relaxed">
                The massive reduction in AIC/BIC/MDL confirms that VGG19 is severely over-parameterized for the BloodMNIST task, captured here by the <strong className="text-ink not-italic">Parsimony Gap</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
