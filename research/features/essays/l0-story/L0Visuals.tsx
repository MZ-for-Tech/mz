'use client';

import React, { useMemo, useState } from "react";
import katex from "katex";
import { AnimatePresence, motion } from "framer-motion";
import { EditorialPlate } from "@/research/features/studies/applied-stats-in-ai/VizPrimitives";

const initialWeights = [0.9, -0.45, 0.2, 0.7, -0.8];
type Locale = "en" | "ar";

interface FigurePlateProps {
  number: number;
  caption: string;
  locale: Locale;
  children: React.ReactNode;
}

interface L0VisualsProps {
  figure?: string;
  locale?: Locale;
}

function normalCdf(x: number) {
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * z);
  const erf = 1 - (((((1.061405429*t - 1.453152027)*t + 1.421413741)*t - 0.284496736)*t + 0.254829592)*t) * Math.exp(-z*z);
  return 0.5 * (1 + sign * erf);
}

function normalDensity(x: number, mean: number, sigma: number) {
  return Math.exp(-0.5 * ((x - mean) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}

function FigurePlate({ number, caption, locale, children }: FigurePlateProps) {
  return <EditorialPlate compact figureCaption={{ number, text: caption, label: locale === "ar" ? "الشكل" : "Figure" }}>{children}</EditorialPlate>;
}

export default function L0Visuals({ figure = "all", locale = "en" }: L0VisualsProps) {
  const [weights, setWeights] = useState(initialWeights);
  const [raw, setRaw] = useState(0.62);
  const [mean, setMean] = useState(0.4);
  const [uniformSample, setUniformSample] = useState(0.1);
  const [logAlpha, setLogAlpha] = useState(0);
  const [channels, setChannels] = useState([true, true, true, true, true]);
  const sigma = 0.5;
  const beta = 2 / 3;
  const gamma = -0.1;
  const zeta = 1.1;
  const ar = locale === "ar";
  const clipped = Math.max(0, Math.min(1, raw));
  const logisticNoise = Math.log(uniformSample) - Math.log1p(-uniformSample);
  const hardLogit = (logisticNoise + logAlpha) / beta;
  const hardSoft = 1 / (1 + Math.exp(-hardLogit));
  const hardStretched = hardSoft * (zeta - gamma) + gamma;
  const hardGate = Math.max(0, Math.min(1, hardStretched));
  const hardGateState = hardStretched <= 0 ? "zero" : hardStretched >= 1 ? "one" : "soft";
  const pActive = useMemo(() => normalCdf(mean / sigma), [mean]);
  const l0 = weights.filter((w) => w !== 0).length;
  const l1 = weights.reduce((sum, w) => sum + Math.abs(w), 0);
  function toggleChannel(i: number) {
    setChannels((prev) => prev.map((v, j) => j === i ? !v : v));
  }

  return <div className="l0v">
    <style>{`
      .l0v{--paper:var(--paper-val);--ink:var(--ink-val);--muted:var(--pencil-val);--line:var(--border-val);--red:var(--accent-val);--soft:color-mix(in srgb,var(--paper-val),var(--ink-val) 5%);color:var(--ink);font-family:var(--font-serif),serif}.l0v *{box-sizing:border-box}.l0v-k{font:10px ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase;color:var(--red)}.l0v h2{font-size:clamp(30px,5vw,52px);line-height:1.03;font-weight:500;letter-spacing:-.035em;margin:10px 0}.l0v h3{font-size:25px;line-height:1.1;font-weight:500;margin:8px 0}.l0v p{font-size:15px;line-height:1.65;color:var(--pencil-val)}.l0v-section{padding:24px}.l0v-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:25px}.l0v-range{width:100%;accent-color:var(--red)}.l0v-read{font:12px ui-monospace,monospace;color:var(--red);margin:10px 0}.l0v-track{height:16px;border:1px solid var(--line);background:color-mix(in srgb,var(--paper-val),var(--ink-val) 8%);margin:12px 0}.l0v-fill{height:100%;background:var(--red)}.l0v-bars{display:flex;align-items:flex-end;gap:10px;height:126px;padding:8px 5px;border-bottom:2px solid var(--ink)}.l0v-barbox{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:5px}.l0v-bar{width:70%;max-width:48px;background:var(--red);min-height:2px}.l0v-bar.zero{background:transparent;border:1px dashed var(--line)}.l0v-mini{font:9px ui-monospace,monospace;color:var(--muted)}.l0v-btn{font:10px ui-monospace,monospace;letter-spacing:.09em;text-transform:uppercase;background:var(--ink);color:var(--paper);border:1px solid var(--ink);padding:10px 12px;cursor:pointer}.l0v-btn.alt{background:transparent;color:var(--ink)}.l0v-channels{display:flex;gap:9px;flex-wrap:wrap;padding:16px 0}.l0v-channel{width:52px;height:62px;border:1px solid var(--line);display:grid;place-items:center;cursor:pointer;background:color-mix(in srgb,var(--paper-val),white 25%);font:10px ui-monospace,monospace}.l0v-channel.off{opacity:.35;text-decoration:line-through;background:var(--soft)}.l0v-chips{display:flex;gap:7px;flex-wrap:wrap;margin:14px 0}.l0v-chip{background:transparent;border:1px solid var(--line);padding:8px 10px;cursor:pointer;font:10px ui-monospace,monospace;color:var(--ink)}.l0v-chip.on{background:var(--red);border-color:var(--red);color:var(--paper-val)}.l0v-definition{border-inline-start:2px solid var(--red);padding:2px 15px;min-height:74px}.l0v-callout{padding:12px;background:color-mix(in srgb,var(--paper-val),white 25%);border:1px solid var(--line);font:12px/1.6 ui-monospace,monospace}.l0v-caption{font:10px/1.5 ui-monospace,monospace!important;color:var(--muted)!important}.l0v-measure{display:grid;gap:16px}.l0v-vector{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font:12px ui-monospace,monospace}.l0v-vector-label{color:var(--muted);margin-inline-end:4px}.l0v-vector-value{border:1px solid var(--line);padding:7px 9px;color:var(--muted)}.l0v-vector-value.active{border-color:var(--red);color:var(--red);background:color-mix(in srgb,var(--paper-val),var(--red) 7%)}.l0v-plot{display:block;width:100%;height:auto;overflow:visible}.l0v-plot text{font:11px ui-monospace,monospace;fill:var(--muted)}.l0v-plot .measure-label{font-size:12px;fill:var(--ink)}.l0v-plot .guide{stroke:var(--line);stroke-width:1}.l0v-plot .measure-curve{fill:none;stroke:var(--red);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.l0v-plot .measure-marker{fill:var(--paper-val);stroke:var(--red);stroke-width:3}.l0v-plot .measure-open{fill:var(--paper-val);stroke:var(--red);stroke-width:2}.l0v-slider-row{display:grid;grid-template-columns:auto minmax(100px,1fr) auto;align-items:center;gap:14px;font:12px ui-monospace,monospace}.l0v-slider-name{color:var(--muted)}.l0v-slider-value{color:var(--red);min-width:4.5em;text-align:end}.l0v-clip-zone{fill:color-mix(in srgb,var(--paper-val),var(--red) 8%)}.l0v-clip-line{fill:none;stroke:var(--red);stroke-width:3;stroke-linejoin:round;stroke-linecap:round}.l0v-clip-projection{stroke:var(--muted);stroke-width:1.5;stroke-dasharray:4 5;opacity:.8}.l0v-clip-input{fill:var(--paper-val);stroke:var(--ink);stroke-width:2}.l0v-clip-output{fill:var(--paper-val);stroke:var(--red);stroke-width:3}.l0v-gaussian-tail{fill:color-mix(in srgb,var(--paper-val),var(--red) 28%);stroke:none}.l0v-gaussian-line{fill:none;stroke:var(--red);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.l0v-gaussian-mean{stroke:var(--muted);stroke-width:1.5;stroke-dasharray:4 5}.l0v-prune-flow{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:14px}.l0v-prune-panel{min-width:0}.l0v-prune-heading{display:flex;justify-content:space-between;align-items:center;gap:8px;padding-bottom:10px;border-bottom:1px solid var(--line);font:10px ui-monospace,monospace;letter-spacing:.08em;color:var(--muted);text-transform:uppercase}.l0v-prune-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(54px,1fr));gap:7px;padding-top:10px}.l0v-prune-channel{min-height:78px;padding:7px 4px;border:1px solid var(--line);background:transparent;color:var(--muted);display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:5px;font:9px ui-monospace,monospace;cursor:pointer}.l0v-prune-channel.on{border-color:var(--red);color:var(--ink);background:color-mix(in srgb,var(--paper-val),var(--red) 5%)}.l0v-prune-channel.off{opacity:.48}.l0v-map-glyph{display:grid;grid-template-columns:repeat(3,6px);gap:2px}.l0v-map-glyph i{width:6px;height:6px;background:var(--red);opacity:.72}.l0v-map-glyph i:nth-child(2n){opacity:.28}.l0v-prune-arrow{font-size:24px;color:var(--red)}.l0v-prune-survivor{min-height:74px;border:1px solid var(--red);background:color-mix(in srgb,var(--paper-val),var(--red) 6%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font:9px ui-monospace,monospace;color:var(--ink)}.l0v-prune-survivor .l0v-map-glyph i{opacity:.9}.l0v-prune-count{display:flex;justify-content:space-between;gap:8px;padding-top:10px;font:11px ui-monospace,monospace;color:var(--red)}.l0v-prune-shapes{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:4px}.l0v-prune-shape{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px;border-top:1px solid var(--line);font:10px ui-monospace,monospace;color:var(--muted)}.l0v-prune-shape strong{color:var(--ink);font-weight:500}.l0v-prune-shape b{color:var(--red);font-weight:500}
    .l0v-hard-inputs{display:grid;grid-template-columns:1fr 1fr;gap:12px}.l0v-hard-control{display:grid;grid-template-columns:1fr auto;align-items:center;gap:9px 12px;padding:12px;border:1px solid var(--line)}.l0v-hard-control-name{font-size:13px}.l0v-hard-control .l0v-range{grid-column:1/-1}.l0v-hard-control-value{font:10px ui-monospace,monospace;color:var(--red)}.l0v-hard-flow{display:grid;grid-template-columns:minmax(0,1fr) 16px minmax(0,1fr) 16px minmax(0,1.3fr) 16px minmax(0,1fr);align-items:stretch;gap:8px}.l0v-hard-step{min-width:0;min-height:116px;padding:12px;border:1px solid var(--line);display:flex;flex-direction:column;justify-content:space-between;gap:10px}.l0v-hard-step-name{font-size:12px;line-height:1.25}.l0v-hard-step code{font:10px/1.5 ui-monospace,monospace;color:var(--muted);white-space:normal;overflow-wrap:anywhere}.l0v-hard-step strong{font:15px ui-monospace,monospace;font-weight:400;color:var(--red)}.l0v-hard-step-sub{font:10px ui-monospace,monospace;color:var(--muted)}.l0v-hard-arrow{align-self:center;color:var(--red);font:18px ui-monospace,monospace}.l0v-hard-output.zero,.l0v-hard-output.one{border-color:var(--red);background:color-mix(in srgb,var(--paper-val),var(--red) 6%)}.l0v-hard-footer{display:flex;align-items:center;justify-content:space-between;gap:12px}.l0v-hard-constants{font:10px ui-monospace,monospace;color:var(--muted)}.l0v-hard-state{font:10px ui-monospace,monospace;color:var(--red)}.l0v-hard-scale{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;font:10px ui-monospace,monospace;color:var(--muted)}.l0v-hard-track{height:2px;background:var(--line);position:relative}.l0v-hard-track i{position:absolute;top:50%;width:12px;height:12px;border:2px solid var(--red);border-radius:50%;background:var(--paper-val);transform:translate(-50%,-50%)}
    @media(max-width:640px){.l0v-section{padding:16px}.l0v-grid{grid-template-columns:1fr}.l0v-slider-row{grid-template-columns:1fr auto;gap:8px}.l0v-slider-row input{grid-column:1/-1;grid-row:2}.l0v-plot text{font-size:23px}.l0v-plot text.measure-label{font-size:25px}.l0v-prune-flow{grid-template-columns:1fr}.l0v-prune-arrow{justify-self:center;transform:rotate(90deg)}.l0v-prune-shapes{grid-template-columns:1fr}.l0v-hard-inputs{grid-template-columns:1fr}.l0v-hard-flow{grid-template-columns:1fr}.l0v-hard-arrow{justify-self:center;transform:rotate(90deg)}.l0v-hard-step{min-height:88px}}
    `}</style>
    {figure === "all" && <><h2>{ar ? "شاهد ما الذي تغيره البوابة" : "See what the gate changes"}</h2><p>{ar ? "تشرح هذه المرئيات رياضيات الندرة من خلال الأوزان والاحتمالات والقنوات." : "These visualizations explain sparsity through weights, probabilities, and channels."}</p></>}

    {(figure === "all" || figure === "l0-versus-l1") && <FigurePlate number={1} locale={locale} caption={ar ? "يتغير مجموع L₁ مع مقدار الوزن، بينما لا يتغير عدد L₀ إلا عندما يصبح الوزن صفرًا تمامًا." : "The L₁ sum changes with weight magnitude; the L₀ count changes only when a weight becomes exactly zero."}><section className="l0v-section l0v-measure">
      <div className="l0v-vector" dir="ltr" aria-label={ar ? "متجه الأوزان" : "Weight vector"}>
        <span className="l0v-vector-label">θ =</span>
        {weights.map((w, i) => <span className={`l0v-vector-value ${i === 0 ? "active" : ""}`} key={i}>{w.toFixed(2)}</span>)}
      </div>
      <svg className="l0v-plot" style={{ direction: "ltr" }} viewBox="0 0 640 228" role="img" aria-label={ar ? "مساهمة الوزن في L0 تقفز عند الصفر بينما تزداد مساهمته في L1 بسلاسة مع المقدار" : "The weight’s L0 contribution jumps at zero while its L1 contribution changes continuously with magnitude"}>
        <text className="measure-label" x="76" y="20">L₀</text>
        <text x="105" y="20">{ar ? "مساهمة الوزن" : "weight contribution"}</text>
        <line className="guide" x1="72" y1="42" x2="572" y2="42" />
        <line className="guide" x1="72" y1="88" x2="572" y2="88" />
        <text x="52" y="46" textAnchor="end">1</text>
        <text x="52" y="92" textAnchor="end">0</text>
        <path className="measure-curve" d="M72 42 H319 M321 42 H572" />
        <circle className="measure-open" cx="320" cy="42" r="5" />
        <circle className="measure-marker" cx="320" cy="88" r="5" />
        <line className="guide" x1="72" y1="132" x2="572" y2="132" />
        <line className="guide" x1="72" y1="184" x2="572" y2="184" />
        <text x="52" y="136" textAnchor="end">1</text>
        <text x="52" y="188" textAnchor="end">0</text>
        <text className="measure-label" x="76" y="119">L₁</text>
        <text x="105" y="119">{ar ? "مقدار الوزن" : "weight magnitude"}</text>
        <path className="measure-curve" d="M72 132 L320 184 L568 132" />
        <line className="guide" x1="320" y1="28" x2="320" y2="190" strokeDasharray="3 5" />
        <line x1={72 + (weights[0] + 1) * 248} y1="28" x2={72 + (weights[0] + 1) * 248} y2="190" stroke="var(--accent-val)" strokeOpacity=".55" strokeDasharray="4 4" />
        <circle className="measure-marker" cx={72 + (weights[0] + 1) * 248} cy={weights[0] === 0 ? 88 : 42} r="6" />
        <circle className="measure-marker" cx={72 + (weights[0] + 1) * 248} cy={184 - Math.abs(weights[0]) * 52} r="6" />
        <line className="guide" x1="72" y1="198" x2="572" y2="198" />
        <line className="guide" x1="72" y1="194" x2="72" y2="202" />
        <line className="guide" x1="320" y1="194" x2="320" y2="202" />
        <line className="guide" x1="568" y1="194" x2="568" y2="202" />
        <text x="72" y="218" textAnchor="middle">−1</text>
        <text x="320" y="218" textAnchor="middle">0</text>
        <text x="568" y="218" textAnchor="middle">1</text>
      </svg>
      <label className="l0v-slider-row" dir="ltr">
        <span className="l0v-slider-name" dir={ar ? "rtl" : "ltr"}>{ar ? "الوزن النشط · w₁" : "Active weight · w₁"}</span>
        <input className="l0v-range" aria-label={ar ? "قيمة الوزن الأول" : "First weight value"} type="range" min="-1" max="1" step="0.01" value={weights[0]} onChange={e => setWeights(prev => prev.map((w, i) => i === 0 ? Number(e.target.value) : w))} />
        <span className="l0v-slider-value">{weights[0] > 0 ? "+" : ""}{weights[0].toFixed(2)}</span>
      </label>
      <div className="l0v-read" dir="ltr" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 16px" }}>
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(`\\|\\theta\\|_0 = \\sum_j \\mathbf 1\\{\\theta_j\\ne0\\} = ${l0}`, { throwOnError: false }) }} />
        <span aria-hidden="true">·</span>
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(`\\|\\theta\\|_1 = \\sum_j |\\theta_j| = ${l1.toFixed(2)}`, { throwOnError: false }) }} />
      </div>
    </section></FigurePlate>}

    {(figure === "all" || figure === "continuous-clipping") && <FigurePlate number={2} locale={locale} caption={ar ? "يحافظ القص على قيم البوابة الوسيطة مع السماح أيضًا بصفر وواحد حقيقيين." : "Clipping preserves intermediate gate values while allowing exact zero and one."}><section className="l0v-section l0v-measure">
      <div className="l0v-vector" dir="ltr">
        <span className="l0v-vector-label">z = clip(s, 0, 1)</span>
        <span className="l0v-vector-value">s = {raw.toFixed(2)}</span>
        <span className="l0v-vector-value active">z = {clipped.toFixed(2)}</span>
      </div>
      <svg className="l0v-plot l0v-clip-plot" style={{ direction: "ltr" }} viewBox="0 0 640 248" role="img" aria-label={ar ? "دالة القص تثبت القيم خارج المجال بين صفر وواحد، وتبقي القيمة كما هي داخل المجال" : "The clipping function fixes values outside zero to one and preserves values inside the interval"}>
        <rect className="l0v-clip-zone" x="80" y="34" width="120" height="156" />
        <rect className="l0v-clip-zone" x="440" y="34" width="120" height="156" />
        <text className="measure-label" x="80" y="20">z = clip(s, 0, 1)</text>
        <line className="guide" x1="80" y1="34" x2="560" y2="34" />
        <line className="guide" x1="80" y1="112" x2="560" y2="112" />
        <line className="guide" x1="80" y1="190" x2="560" y2="190" />
        <line className="guide" x1="80" y1="34" x2="80" y2="190" />
        <line className="guide" x1="80" y1="190" x2="560" y2="190" />
        <text x="62" y="38" textAnchor="end">1</text>
        <text x="62" y="194" textAnchor="end">0</text>
        <path className="l0v-clip-line" d="M80 190 H200 L440 34 H560" />
        <line className="l0v-clip-projection" x1={80 + (raw + 0.5) * 240} y1="34" x2={80 + (raw + 0.5) * 240} y2="190" />
        <circle className="l0v-clip-input" cx={80 + (raw + 0.5) * 240} cy="190" r="5" />
        <circle className="l0v-clip-output" cx={80 + (raw + 0.5) * 240} cy={190 - clipped * 156} r="7" />
        <line className="guide" x1="80" y1="190" x2="80" y2="198" />
        <line className="guide" x1="200" y1="190" x2="200" y2="198" />
        <line className="guide" x1="440" y1="190" x2="440" y2="198" />
        <line className="guide" x1="560" y1="190" x2="560" y2="198" />
        <text x="80" y="218" textAnchor="middle">−0.5</text>
        <text x="200" y="218" textAnchor="middle">0</text>
        <text x="440" y="218" textAnchor="middle">1</text>
        <text x="560" y="218" textAnchor="middle">1.5</text>
        <text className="measure-label" x="564" y="207">s</text>
      </svg>
      <label className="l0v-slider-row" dir="ltr">
        <span className="l0v-slider-name">{ar ? "العينة · s" : "Sample · s"}</span>
        <input className="l0v-range" aria-label={ar ? "عينة القص s" : "Clipping sample s"} type="range" min="-0.5" max="1.5" step="0.01" value={raw} onChange={e=>setRaw(Number(e.target.value))}/>
        <span className="l0v-slider-value">{raw.toFixed(2)}</span>
      </label>
    </section></FigurePlate>}

    {(figure === "all" || figure === "hard-concrete-path") && <FigurePlate number={3} locale={locale} caption={ar ? "تتحول ضوضاء Logistic ومعامل متعلَّم إلى بوابة Hard-Concrete عبر sigmoid والتمديد والقص." : "Logistic noise and a learned parameter become a Hard-Concrete gate through sigmoid, stretching, and clipping."}><section className="l0v-section l0v-measure l0v-hard-concrete">
      <div className="l0v-hard-inputs" dir="ltr">
        <label className="l0v-hard-control">
          <span className="l0v-hard-control-name" dir={ar ? "rtl" : "ltr"}>{ar ? "عينة عشوائية · u ∼ U(0,1)" : "Random draw · u ∼ U(0,1)"}</span>
          <input className="l0v-range" type="range" min="0.01" max="0.99" step="0.01" value={uniformSample} aria-label={ar ? "العينة العشوائية المنتظمة" : "Uniform random draw"} onChange={event => setUniformSample(Number(event.target.value))} />
          <span className="l0v-hard-control-value">u = {uniformSample.toFixed(2)}</span>
        </label>
        <label className="l0v-hard-control">
          <span className="l0v-hard-control-name" dir={ar ? "rtl" : "ltr"}>{ar ? "المعامل المتعلَّم · log αⱼ" : "Learned parameter · log αⱼ"}</span>
          <input className="l0v-range" type="range" min="-4" max="4" step="0.01" value={logAlpha} aria-label={ar ? "المعامل المتعلَّم log alpha" : "Learned log alpha parameter"} onChange={event => setLogAlpha(Number(event.target.value))} />
          <span className="l0v-hard-control-value">log αⱼ = {logAlpha.toFixed(2)}</span>
        </label>
      </div>
      <div className="l0v-hard-flow" dir="ltr">
        <div className="l0v-hard-step">
          <span className="l0v-hard-step-name">{ar ? "ضوضاء Logistic" : "Logistic noise"}</span>
          <code>g = ln(u) − ln(1−u)</code>
          <strong>{logisticNoise.toFixed(3)}</strong>
        </div>
        <span className="l0v-hard-arrow" aria-hidden="true">→</span>
        <div className="l0v-hard-step">
          <span className="l0v-hard-step-name">{ar ? "الإزاحة المتعلَّمة" : "Learned shift"}</span>
          <code>q = (g + log αⱼ) / β</code>
          <strong>{hardLogit.toFixed(3)}</strong>
        </div>
        <span className="l0v-hard-arrow" aria-hidden="true">→</span>
        <div className="l0v-hard-step">
          <span className="l0v-hard-step-name">{ar ? "تطبيق Sigmoid ثم التمديد" : "Sigmoid + stretch"}</span>
          <code>s̃ = sigmoid(q)</code>
          <code>s̄ = s̃(ζ−γ)+γ</code>
          <strong>{hardSoft.toFixed(3)} <span className="l0v-hard-step-sub">→ {hardStretched.toFixed(3)}</span></strong>
        </div>
        <span className="l0v-hard-arrow" aria-hidden="true">→</span>
        <div className={`l0v-hard-step l0v-hard-output ${hardGateState}`}>
          <span className="l0v-hard-step-name">{ar ? "البوابة بعد القص" : "Clipped gate"}</span>
          <code>z = clip(s̄, 0, 1)</code>
          <strong>z = {hardGate.toFixed(3)}</strong>
        </div>
      </div>
      <div className="l0v-hard-footer" dir="ltr">
        <span className="l0v-hard-constants">β = 2/3 · γ = −0.1 · ζ = 1.1</span>
        <span className={`l0v-hard-state ${hardGateState}`} dir={ar ? "rtl" : "ltr"}>{hardGateState === "zero" ? (ar ? "صفر حقيقي" : "Exact zero") : hardGateState === "one" ? (ar ? "واحد حقيقي" : "Exact one") : (ar ? "قيمة مستمرة" : "Continuous value")}</span>
      </div>
      <div className="l0v-hard-scale" dir="ltr" aria-label={ar ? `قيمة البوابة ${hardGate.toFixed(2)} من صفر إلى واحد` : `Gate value ${hardGate.toFixed(2)} from zero to one`}>
        <span>0</span><div className="l0v-hard-track"><i style={{ left: `${hardGate * 100}%` }} /></div><span>1</span>
      </div>
    </section></FigurePlate>}

    {(figure === "all" || figure === "gaussian-activity-probability") && <FigurePlate number={5} locale={locale} caption={ar ? "هذا احتمال طويل الأمد لبوابة غير صفرية، وليس قيمة عينة واحدة." : "This is the long-run probability of a nonzero gate, not the value of one sample."}><section className="l0v-section l0v-measure">
      <div className="l0v-vector" dir="ltr">
        <span className="l0v-vector-label">s ∼ 𝒩(m, σ²)</span>
        <span className="l0v-vector-value">σ = {sigma.toFixed(2)}</span>
        <span className="l0v-vector-value active">P(z &gt; 0) = Φ(m/σ) = {(pActive * 100).toFixed(1)}%</span>
      </div>
      <svg className="l0v-plot l0v-gaussian-plot" style={{ direction: "ltr" }} viewBox="0 0 640 244" role="img" aria-label={ar ? "منحنى التوزيع الغاوسي مع تظليل المساحة الواقعة يمين الصفر، وهي احتمال نشاط البوابة" : "A Gaussian curve with the area right of zero shaded as the gate activity probability"}>
        <line className="guide" x1="80" y1="42" x2="560" y2="42" />
        <line className="guide" x1="80" y1="112" x2="560" y2="112" />
        <line className="guide" x1="80" y1="188" x2="560" y2="188" />
        <path className="l0v-gaussian-tail" d={`M320 188 ${Array.from({ length: 49 }, (_, i) => {
          const x = i / 16;
          const px = 80 + (x + 3) * 80;
          const py = 188 - normalDensity(x, mean, sigma) * 160;
          return `L${px.toFixed(2)} ${py.toFixed(2)}`;
        }).join(' ')} L560 188 Z`} />
        <line className="l0v-gaussian-mean" x1="320" y1="32" x2="320" y2="188" />
        <line className="l0v-gaussian-mean" x1={80 + (mean + 3) * 80} y1="32" x2={80 + (mean + 3) * 80} y2="188" />
        <path className="l0v-gaussian-line" d={Array.from({ length: 97 }, (_, i) => {
          const x = -3 + i / 16;
          const px = 80 + (x + 3) * 80;
          const py = 188 - normalDensity(x, mean, sigma) * 160;
          return `${i === 0 ? 'M' : 'L'}${px.toFixed(2)} ${py.toFixed(2)}`;
        }).join(' ')} />
        <circle className="measure-marker" cx={80 + (mean + 3) * 80} cy={188 - normalDensity(mean, mean, sigma) * 160} r="6" />
        <line className="guide" x1="80" y1="188" x2="80" y2="196" />
        <line className="guide" x1="200" y1="188" x2="200" y2="196" />
        <line className="guide" x1="320" y1="188" x2="320" y2="196" />
        <line className="guide" x1="440" y1="188" x2="440" y2="196" />
        <line className="guide" x1="560" y1="188" x2="560" y2="196" />
        <text x="80" y="218" textAnchor="middle">−3</text>
        <text x="200" y="218" textAnchor="middle">−1.5</text>
        <text className="measure-label" x="320" y="218" textAnchor="middle">0</text>
        <text x="440" y="218" textAnchor="middle">1.5</text>
        <text x="560" y="218" textAnchor="middle">3</text>
        <text className="measure-label" x="568" y="208">s</text>
      </svg>
      <label className="l0v-slider-row" dir="ltr">
        <span className="l0v-slider-name" dir={ar ? "rtl" : "ltr"}>{ar ? "المتوسط · m" : "Mean · m"}</span>
        <input className="l0v-range" aria-label={ar ? "متوسط البوابة الغاوسية" : "Gaussian gate mean"} type="range" min="-1.2" max="1.2" step="0.01" value={mean} onChange={e=>setMean(Number(e.target.value))}/>
        <span className="l0v-slider-value">{mean > 0 ? "+" : ""}{mean.toFixed(2)}</span>
      </label>
    </section></FigurePlate>}

    {(figure === "all" || figure === "structured-channel-pruning") && <FigurePlate number={4} locale={locale} caption={ar ? "تحتاج القناة المحذوفة إلى إعادة بناء الموترات المتصلة بها فعليًا لتحقيق مكسب في السرعة." : "A real speed benefit requires rebuilding the connected tensors after a channel is removed."}><section className="l0v-section l0v-measure">
      <div className="l0v-prune-flow">
        <div className="l0v-prune-panel">
          <div className="l0v-prune-heading"><span>{ar ? "قنوات الخرج" : "Output channels"}</span><span>C_out = {channels.length}</span></div>
          <div className="l0v-prune-grid">{channels.map((on, i) => <motion.button key={i} layout whileTap={{ scale: 0.96 }} className={`l0v-prune-channel ${on ? "on" : "off"}`} onClick={() => toggleChannel(i)} aria-pressed={on} aria-label={`${ar ? "القناة" : "Channel"} ${i + 1}: ${on ? (ar ? "نشطة" : "active") : (ar ? "معطلة" : "inactive")}`}>
            <span className="l0v-map-glyph" aria-hidden="true">{Array.from({ length: 9 }, (_, j) => <i key={j} style={{ opacity: 0.22 + ((i * 5 + j * 3) % 8) * 0.09 }} />)}</span>
            <span>c{i + 1}</span>
            <span>{on ? "●" : "×"}</span>
          </motion.button>)}</div>
        </div>
        <div className="l0v-prune-arrow" aria-hidden="true">→</div>
        <div className="l0v-prune-panel">
          <div className="l0v-prune-heading"><span>{ar ? "بعد إعادة البناء" : "After compaction"}</span><span>C_out = {channels.filter(Boolean).length}</span></div>
          <div className="l0v-prune-grid"><AnimatePresence initial={false}>{channels.map((on, i) => on && <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="l0v-prune-survivor" key={i}>
            <span className="l0v-map-glyph" aria-hidden="true">{Array.from({ length: 9 }, (_, j) => <i key={j} style={{ opacity: 0.22 + ((i * 5 + j * 3) % 8) * 0.09 }} />)}</span>
            <span>c{i + 1}</span>
          </motion.div>)}</AnimatePresence></div>
          <div className="l0v-prune-count"><span>{ar ? "القنوات المحتفظ بها" : "Retained"}</span><span>{channels.filter(Boolean).length} / {channels.length}</span></div>
        </div>
      </div>
      <div className="l0v-prune-shapes">
        <div className="l0v-prune-shape"><span>{ar ? "مرشحات الطبقة" : "Filter outputs"}</span><strong>C_out <b>{channels.length} → {channels.filter(Boolean).length}</b></strong></div>
        <div className="l0v-prune-shape"><span>{ar ? "مدخلات الطبقة التالية" : "Next-layer inputs"}</span><strong>C_in <b>{channels.length} → {channels.filter(Boolean).length}</b></strong></div>
      </div>
    </section></FigurePlate>}

  </div>;
}
