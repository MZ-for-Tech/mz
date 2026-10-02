import { readFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

// Regenerate after changing Arabic metadata and running the production route audit.
// Pango handles mixed Arabic/Latin ordering; Satori does not fully implement bidi.
const report = JSON.parse(await readFile('docs/seo/after-local.json', 'utf8'));
const logo = (await readFile('public/mz.svg')).toString('base64');
const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
await mkdir('public/og', { recursive: true });
for (const [path, name] of [['/research/ar', 'arabic-research'], ['/research/ar/papers/vgg19-bloodmnist-compression', 'arabic-vgg19']]) {
  const page = report.results.find(page => page.path === path);
  const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0b0f07"/><path d="M280 630 Q580 440 820 550 T1200 290" fill="none" stroke="#acaa25" stroke-width="6"/><path d="M280 630 Q580 440 820 550 T1200 290" fill="none" stroke="#acaa25" stroke-opacity=".12" stroke-width="65"/><image href="data:image/svg+xml;base64,${logo}" x="800" y="165" width="300" height="300"/><path d="M76 100H1124" stroke="#f5f5f0" stroke-opacity=".15"/></svg>`);
  const layers = [];
  for (const [text, fontSize, color, top, width] of [['MZFORTECH.COM', 14, '#999c94', 58, 630], [page.title[0], 48, '#f5f5f0', 180, 650], [page.description[0], 23, '#b2b5ab', 390, 650]]) {
    const input = await sharp({ text: {
      text: `<span foreground="${color}">${escape(text)}</span>`,
      font: `Noto Naskh Arabic UI ${fontSize}`,
      fontfile: 'public/fonts/og/NotoNaskhArabicUI-Regular.ttf',
      width, align: 'right', rgba: true,
    }}).png().toBuffer();
    const meta = await sharp(input).metadata();
    if (top + meta.height > 565) throw new Error(`Social text overflow: ${path}`);
    layers.push({ input, top, left: 76 + width - meta.width });
  }
  await sharp(background).composite(layers).png().toFile(`public/og/${name}.png`);
  console.log(`Generated ${name} from audited Arabic metadata`);
}
