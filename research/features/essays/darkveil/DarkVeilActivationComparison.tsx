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
  { id: 'sigmoid', name: 'Sigmoid', formula: '1 / (1 + e⁻ˣ)', glsl: '1.0 / (1.0 + exp(-x))' },
  { id: 'relu', name: 'ReLU', formula: 'max(0, x)', glsl: 'max(x, vec4(0.0))' },
  { id: 'gaussian', name: 'Gaussian', formula: 'exp(−x²)', glsl: 'exp(-(x * x))' },
  { id: 'sine', name: 'Sine', formula: 'sin(x)', glsl: 'sin(x)' },
] as const;

type Activation = (typeof ACTIVATIONS)[number];

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
      caption={isArabic ? 'مخرجات الشبكة نفسها مع أربع دوال تنشيط.' : 'The same network’s output with four activation functions.'}
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
            <div className="darkveil-activation-preview">
              <ActivationCanvas activation={activation} />
            </div>
          </div>
        ))}
      </div>
    </ResearchFigure>
  );
}
