import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import translate from 'google-translate-api-x';

const [inputArg, outputArg] = process.argv.slice(2);

if (!inputArg || !outputArg) {
  throw new Error('Usage: node scripts/translate-research-markdown.mjs <input.md> <output.md>');
}

const inputPath = resolve(inputArg);
const outputPath = resolve(outputArg);
const source = await readFile(inputPath, 'utf8');
const blocks = source.trim().split(/\n\s*\n/);
const referencesIndex = blocks.findIndex((block) => /^\*\*References\*\*$/.test(block.trim()));
const placeholders = new Map();
let placeholderCount = 0;
// Named works stay verbatim when regenerating this article's translation.
const workTitles = [
  'Attention Is All You Need',
  'Deep Reinforcement Learning from Human Preferences',
];

function protect(value) {
  const token = `QZXPLACEHOLDER${placeholderCount++}XZQ`;
  placeholders.set(token, value);
  return token;
}

function restore(value) {
  return [...placeholders.entries()]
    .reduce((text, [token, original]) => text.replaceAll(token, original), value)
    .replace(/\*\s+([^*]+?)\s+\*/g, '*$1*');
}

function restoreBlockquote(sourceBlock, translatedBlock) {
  if (!/^\s*>/m.test(sourceBlock)) return translatedBlock;
  return translatedBlock
    .split('\n')
    .map((line) => `> ${line.replace(/^\s*>\s?/, '')}`)
    .join('\n');
}

function prepareBlock(block) {
  let value = block;
  value = value.replace(/<!--[\s\S]*?-->/g, protect);
  for (const title of workTitles) value = value.replaceAll(title, protect(title));
  value = value.replace(/`[^`\n]+`/g, protect);
  value = value.replace(/\$[^$\n]+\$/g, protect);
  value = value.replace(/https?:\/\/[^\s)]+/g, protect);
  value = value.replace(/\([^()\n]*(?:\b(?:19|20)\d{2}[a-z]?|n\.d\.)[^()\n]*\)/gi, protect);
  value = value.replace(/^[ \t]*> ?/gm, (prefix) => protect(prefix));
  value = value.replace(/\*\*/g, () => protect('**'));
  value = value.replace(/(?<!\*)\*(?!\*)/g, () => protect('*'));
  return value;
}

const translatable = blocks.map((block, index) => {
  if (referencesIndex >= 0 && index >= referencesIndex) return null;
  if (/^```[\w+#.-]*\n[\s\S]*\n```$/.test(block.trim())) return null;
  if (/^<!--\s*visual:[a-z0-9-]+\s*-->$/.test(block.trim())) return null;
  return prepareBlock(block);
});

const indices = translatable.flatMap((value, index) => value === null ? [] : [index]);
const translatedBlocks = [...blocks];
const batchSize = 4;

for (let offset = 0; offset < indices.length; offset += batchSize) {
  const batchIndices = indices.slice(offset, offset + batchSize);
  const results = await translate(batchIndices.map((index) => translatable[index]), { from: 'en', to: 'ar' });
  batchIndices.forEach((index, batchIndex) => {
    translatedBlocks[index] = restoreBlockquote(blocks[index], restore(results[batchIndex].text));
  });
}

if (referencesIndex >= 0) translatedBlocks[referencesIndex] = '**المراجع**';

const output = [...translatedBlocks].join('\n\n') + '\n';

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, output, 'utf8');
console.log(`Wrote ${outputPath}`);
