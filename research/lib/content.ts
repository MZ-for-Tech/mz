import { readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

const contentRoot = resolve(process.cwd(), 'research', 'content');

export function readResearchContent(contentFile: string) {
  const path = resolve(contentRoot, contentFile);
  const relativePath = relative(contentRoot, path);

  if (isAbsolute(contentFile) || relativePath === '..' || relativePath.startsWith(`..${sep}`)) {
    throw new Error(`Research content path must stay inside research/content: ${contentFile}`);
  }

  return readFileSync(path, 'utf8');
}
