'use client';

import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle, Vec2 } from 'ogl';
import ResearchFigure from '@/research/components/ResearchFigure';
import { fragment, vertex } from './DarkVeil';
import './DarkVeilActivationComparison.css';

const WIDTH = 360;
const HEIGHT = 225;
const FIXED_TIME = 2.5;

const ACTIVATIONS = [
  {
    id: 'sigmoid', name: 'Sigmoid', formula: '1 / (1 + e⁻ˣ)', glsl: '1.0 / (1.0 + exp(-x))',
    xMin: -6, xMax: 6, yMin: -0.1, yMax: 1.1,
    evaluate: (x: number) => 1 / (1 + Math.exp(-x)),
  },
  {
    id: 'relu', name: 'ReLU', formula: 'max(0, x)', glsl: 'max(x, vec4(0.0))',
    xMin: -2.5, xMax: 2.5, yMin: -0.25, yMax: 2.5,
    evaluate: (x: number) => Math.max(0, x),
  },
  {
    id: 'gaussian', name: 'Gaussian', formula: 'exp(−x²)', glsl: 'exp(-(x * x))',
    xMin: -2.5, xMax: 2.5, yMin: -0.1, yMax: 1.1,
    evaluate: (x: number) => Math.exp(-(x * x)),
  },
  {
    id: 'sine', name: 'Sine', formula: 'sin(x)', glsl: 'sin(x)',
    xMin: -2 * Math.PI, xMax: 2 * Math.PI, yMin: -1.2, yMax: 1.2,
    evaluate: (x: number) => Math.sin(x),
  },
] as const;

type Activation = (typeof ACTIVATIONS)[number];

function ActivationCurve({ activation, locale }: { activation: Activation; locale: 'en' | 'ar' }) {
  const plot = { left: 8, right: 172, top: 5, bottom: 43 };
  const toX = (x: number) => plot.left + ((x - activation.xMin) / (activation.xMax - activation.xMin)) * (plot.right - plot.left);
  const toY = (y: number) => plot.bottom - ((y - activation.yMin) / (activation.yMax - activation.yMin)) * (plot.bottom - plot.top);
  const path = Array.from({ length: 96 }, (_, index) => {
    const x = activation.xMin + (index / 95) * (activation.xMax - activation.xMin);
    return `${index === 0 ? 'M' : 'L'}${toX(x).toFixed(2)} ${toY(activation.evaluate(x)).toFixed(2)}`;
  }).join(' ');
  const zeroY = toY(0);
  const zeroX = toX(0);
  const curveDescriptions = {
    sigmoid: locale === 'ar' ? 'منحنى السيني، ينتقل بسلاسة من صفر إلى واحد' : 'Sigmoid curve, smoothly rising from zero to one',
    relu: locale === 'ar' ? 'منحنى ري إل يو، يساوي صفرًا للقيم السالبة ثم يرتفع خطيًا' : 'ReLU curve, zero for negative values then rising linearly',
    gaussian: locale === 'ar' ? 'منحنى غاوسي، قمة وسطية تتلاشى عند الطرفين' : 'Gaussian curve, a central peak that falls off at both ends',
    sine: locale === 'ar' ? 'منحنى جيبي دوري' : 'Periodic sine curve',
  };

  return (
    <svg
      className="darkveil-activation-curve"
      viewBox="0 0 180 48"
      role="img"
      aria-label={curveDescriptions[activation.id]}
    >
      <line x1={plot.left} y1={zeroY} x2={plot.right} y2={zeroY} className="darkveil-activation-axis" />
      <line x1={zeroX} y1={plot.top} x2={zeroX} y2={plot.bottom} className="darkveil-activation-axis" />
      <path d={path} className="darkveil-activation-curve-line" />
    </svg>
  );
}

function activationFragment(glsl: string) {
  const renamed = fragment.replaceAll('sigmoid(', 'activation(');
  return renamed.replace(
    'vec4 activation(vec4 x){return 1./(1.+exp(-x));}',
    `vec4 activation(vec4 x){return ${glsl};}`,
  );
}

function ActivationCanvas({ activation }: { activation: Activation }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.dataset.rendered === 'true') return;

    const renderer = new Renderer({ dpr: 1, canvas, antialias: false });
    renderer.setSize(WIDTH, HEIGHT);
    const gl = renderer.gl;
    const program = new Program(gl, {
      vertex,
      fragment: activationFragment(activation.glsl),
      uniforms: {
        uTime: { value: FIXED_TIME },
        uResolution: { value: new Vec2(WIDTH, HEIGHT) },
        uHueShift: { value: 0 },
        uNoise: { value: 0 },
        uScan: { value: 0 },
        uScanFreq: { value: 0 },
        uWarp: { value: 0 },
        uLightMode: { value: 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    renderer.render({ scene: mesh });
    canvas.dataset.rendered = 'true';
  }, [activation]);

  return <canvas ref={canvasRef} className="darkveil-activation-canvas" aria-label={`${activation.name} activation shader preview`} />;
}

export default function DarkVeilActivationComparison({ locale }: { locale: 'en' | 'ar' }) {
  const isArabic = locale === 'ar';

  return (
    <ResearchFigure
      number={2}
      caption={isArabic
        ? 'يوضح كل منحنى دالة التنشيط، وتوضح كل صورة ما تنتجه داخل الشبكة نفسها.'
        : 'Each curve shows an activation function; each image shows what it produces in the same network.'}
      locale={locale}
      className="darkveil-activation-figure"
      dataInteractive="darkveil-activation-comparison"
    >
      <div className="darkveil-activation-grid">
        {ACTIVATIONS.map((activation) => (
          <div className="darkveil-activation-panel" key={activation.id}>
            <div className="darkveil-activation-label">
              <div className="darkveil-activation-name-row">
                <h3>{activation.name}</h3>
              </div>
              <code>{activation.formula}</code>
            </div>
            <div className="darkveil-activation-curve-wrap">
              <ActivationCurve activation={activation} locale={locale} />
            </div>
            <div className="darkveil-activation-preview">
              <ActivationCanvas activation={activation} />
            </div>
          </div>
        ))}
      </div>
    </ResearchFigure>
  );
}
