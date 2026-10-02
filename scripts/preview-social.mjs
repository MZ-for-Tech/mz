import { readFile, writeFile } from 'node:fs/promises';

const report = JSON.parse(await readFile('docs/seo/after-local.json', 'utf8'));
const origin = process.argv[2] || 'http://127.0.0.1:3000';
for (const [path, name] of [['/', 'home'], ['/research/ar/papers/vgg19-bloodmnist-compression', 'arabic-research']]) {
  const page = report.results.find(page => page.path === path);
  if (!page) throw new Error(`Missing audited page ${path}`);
  const url = new URL(page.social.find(item => item.property === 'og:image').content);
  const response = await fetch(new URL(url.pathname + url.search, origin));
  if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
  await writeFile(`docs/seo/og-${name}.png`, Buffer.from(await response.arrayBuffer()));
  console.log(`Saved ${name} preview from rendered metadata`);
}
