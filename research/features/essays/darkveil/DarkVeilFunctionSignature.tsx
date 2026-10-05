import ResearchFigure, { ResearchFigurePanel } from '@/research/components/ResearchFigure';
import './DarkVeilFunctionSignature.css';

type Layer = {
  id: string;
  title: string;
  buffers: [string, string];
  x: number;
  y: number;
  tone: string;
};

const LAYERS: Layer[] = [
  { id: 'a', title: 'STAGE 01', buffers: ['buf[0]', 'buf[1]'], x: 235, y: 64, tone: 'sage' },
  { id: 'b', title: 'STAGE 02', buffers: ['buf[2]', 'buf[3]'], x: 235, y: 342, tone: 'blue' },
  { id: 'c', title: 'STAGE 03', buffers: ['buf[4]', 'buf[5]'], x: 490, y: 203, tone: 'violet' },
  { id: 'd', title: 'STAGE 04', buffers: ['buf[6]', 'buf[7]'], x: 730, y: 203, tone: 'rust' },
];

const LAYER_WIDTH = 150;
const LAYER_HEIGHT = 164;

function layerNodes(layer: Layer) {
  return [0, 1].flatMap((bufferIndex) => [0, 1, 2, 3].map((channelIndex) => ({
    x: layer.x + 70 + channelIndex * 14,
    y: layer.y + (bufferIndex === 0 ? 79 : 121),
  })));
}

function connect(
  sources: { x: number; y: number }[],
  targets: { x: number; y: number }[],
  key: string,
  tone: string,
  routeY?: number,
) {
  return sources.flatMap((source, sourceIndex) => targets.map((target, targetIndex) => {
    const middle = (source.x + target.x) / 2;
    const path = routeY === undefined
      ? `M${source.x},${source.y} C${middle},${source.y} ${middle},${target.y} ${target.x},${target.y}`
      : `M${source.x},${source.y} C${middle},${routeY} ${middle},${routeY} ${target.x},${target.y}`;
    return <path key={`${key}-${sourceIndex}-${targetIndex}`} d={path} className={`darkveil-network-connection darkveil-network-connection-${tone}`} />;
  }));
}

function NetworkLayer({ layer }: { layer: Layer }) {
  const channelXs = [0, 1, 2, 3].map((index) => layer.x + 70 + index * 14);
  const rowYs = [layer.y + 79, layer.y + 121];

  return (
    <g className={`darkveil-network-layer darkveil-network-layer-${layer.tone}`}>
      <path d={`M${layer.x},${layer.y} l18,-12 h${LAYER_WIDTH} l-18,12 Z`} className="darkveil-network-layer-top" />
      <path d={`M${layer.x + LAYER_WIDTH},${layer.y} l18,-12 v${LAYER_HEIGHT} l-18,12 Z`} className="darkveil-network-layer-side" />
      <rect x={layer.x} y={layer.y} width={LAYER_WIDTH} height={LAYER_HEIGHT} className="darkveil-network-layer-front" />
      <text x={layer.x + 10} y={layer.y + 24} className="darkveil-network-stage-label">{layer.title}</text>
      <line x1={layer.x + 8} y1={layer.y + 42} x2={layer.x + LAYER_WIDTH - 8} y2={layer.y + 42} className="darkveil-network-layer-rule" />
      {layer.buffers.map((buffer, index) => (
        <g key={buffer}>
          <text x={layer.x + 10} y={rowYs[index] + 4} className="darkveil-network-buffer-label">{buffer}</text>
          {channelXs.map((x, channelIndex) => (
            <circle key={`${buffer}-${channelIndex}`} cx={x} cy={rowYs[index]} r="4.3" className="darkveil-network-neuron" />
          ))}
        </g>
      ))}
      <text x={layer.x + 10} y={layer.y + LAYER_HEIGHT - 10} className="darkveil-network-operation">× W + b  →  σ</text>
    </g>
  );
}

function NetworkDiagram({ locale }: { locale: 'en' | 'ar' }) {
  const inputNodes = Array.from({ length: 5 }, (_, index) => ({ x: 170, y: 250 + index * 18 }));
  const outputNodes = [
    { x: 1003, y: 264 },
    { x: 1003, y: 284 },
    { x: 1003, y: 304 },
    { x: 1003, y: 324 },
  ];
  const byId = Object.fromEntries(LAYERS.map((layer) => [layer.id, layer])) as Record<string, Layer>;
  const networkLabel = locale === 'ar'
    ? 'مخطط توضيحي لتدفق بكسل واحد عبر أربع مراحل مترابطة من شبكة DarkVeil.'
    : 'Schematic of one pixel flowing through DarkVeil’s four connected computation stages.';

  return (
    <svg className="darkveil-signature-diagram" viewBox="0 0 1140 550" role="img" aria-label={networkLabel}>
      <defs>
        <pattern id="darkveil-network-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" className="darkveil-network-grid-line" />
        </pattern>
      </defs>
      <rect width="1140" height="550" fill="url(#darkveil-network-grid)" />

      <g className="darkveil-network-connections" aria-hidden="true">
        {connect(inputNodes, layerNodes(byId.a), 'input-a', 'sage')}
        {connect(inputNodes, layerNodes(byId.b), 'input-b', 'blue')}
        {connect(layerNodes(byId.a), layerNodes(byId.c), 'a-c', 'sage')}
        {connect(layerNodes(byId.b), layerNodes(byId.c), 'b-c', 'blue')}
        {connect(layerNodes(byId.a), layerNodes(byId.d), 'a-d', 'sage', 36)}
        {connect(layerNodes(byId.b), layerNodes(byId.d), 'b-d', 'blue', 530)}
        {connect(layerNodes(byId.c), layerNodes(byId.d), 'c-d', 'violet')}
        {connect(layerNodes(byId.a), outputNodes, 'a-out', 'sage', 24)}
        {connect(layerNodes(byId.b), outputNodes, 'b-out', 'blue', 536)}
        {connect(layerNodes(byId.c), outputNodes, 'c-out', 'violet', 112)}
        {connect(layerNodes(byId.d), outputNodes, 'd-out', 'rust')}
      </g>

      <g className="darkveil-network-input">
        <rect x="34" y="211" width="148" height="146" className="darkveil-network-input-frame" />
        <text x="47" y="235" className="darkveil-network-section-label">{locale === 'ar' ? 'مدخلات الدالة' : 'FUNCTION INPUTS'}</text>
        <text x="47" y="261" className="darkveil-network-code-label">vec2 coordinate</text>
        <g transform="translate(49 273)" className="darkveil-network-pixel-grid" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((index) => <line key={`x-${index}`} x1={index * 8} y1="0" x2={index * 8} y2="32" />)}
          {[0, 1, 2, 3, 4].map((index) => <line key={`y-${index}`} x1="0" y1={index * 8} x2="32" y2={index * 8} />)}
          <rect x="16" y="16" width="8" height="8" className="darkveil-network-picked-pixel" />
        </g>
        <text x="89" y="293" className="darkveil-network-code-label">(x, y)</text>
        <text x="47" y="326" className="darkveil-network-code-label">in0  in1  in2</text>
        <text x="47" y="345" className="darkveil-network-small-label">{locale === 'ar' ? 'إشارات زمنية' : 'TIME SIGNALS'}</text>
        {inputNodes.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="3.2" className="darkveil-network-input-node" />)}
      </g>

      {LAYERS.map((layer) => <NetworkLayer key={layer.id} layer={layer} />)}

      <g className="darkveil-network-output">
        <path d="M990 203 h120 v164 h-120 z" className="darkveil-network-output-frame" />
        <text x="1003" y="229" className="darkveil-network-section-label">{locale === 'ar' ? 'الإخراج' : 'OUTPUT'}</text>
        <text x="1003" y="247" className="darkveil-network-code-label">vec4</text>
        {outputNodes.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="4.2" className={`darkveil-network-output-node darkveil-network-output-node-${index}`} />)}
        <text x="1015" y="268" className="darkveil-network-channel-label">R</text>
        <text x="1015" y="288" className="darkveil-network-channel-label">G</text>
        <text x="1015" y="308" className="darkveil-network-channel-label">B</text>
        <text x="1015" y="328" className="darkveil-network-channel-label">1</text>
        <text x="1003" y="351" className="darkveil-network-small-label">{locale === 'ar' ? 'لون البكسل' : 'PIXEL COLOR'}</text>
      </g>

    </svg>
  );
}

export default function DarkVeilFunctionSignature({ locale }: { locale: 'en' | 'ar' }) {
  const isArabic = locale === 'ar';

  return (
    <ResearchFigure
      number={3}
      caption={isArabic
        ? 'تدفق بكسل واحد عبر أربع مراحل تحويل موزونة؛ تعيد المراحل اللاحقة استخدام التنشيطات السابقة قبل إنتاج اللون.'
        : 'One pixel flows through four weighted stages; later stages reuse earlier activations before producing its color.'}
      locale={locale}
      className="darkveil-signature-figure"
      dataInteractive="darkveil-function-signature"
    >
      <ResearchFigurePanel className="darkveil-signature-panel">
        <div className="darkveil-signature-diagram-wrap">
          <NetworkDiagram locale={locale} />
        </div>
      </ResearchFigurePanel>
    </ResearchFigure>
  );
}
