import type { Study } from '@/research/lib/types';
import { readResearchContent } from '@/research/lib/content';

export function estimateReadingMinutes(markdown: string, title: string) {
  const articleBody = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\\\[[\s\S]*?\\\]/g, ' ')
    .replace(/\\\([\s\S]*?\\\)/g, ' ')
    .replace(/\$[^$]+\$/g, ' ')
    .replace(/^#\s+[^\n]+\n/, ' ')
    .split(/\n(?:\*\*(?:References|المراجع)\*\*|#{1,2}\s*(?:References|Sources|المراجع|المصادر))\s*\n/i)[0]
    .replace(/^\[\[interactive:[^\]]+\]\]$/gm, ' ');
  const visualCount = articleBody.match(/^<!--\s*visual:[a-z0-9-]+\s*-->$/gm)?.length || 0;
  const readingText = articleBody
    .trim()
    .split(/\n\s*\n/)
    .filter((block, index) => {
      if (index === 0 && block.trim() === `**${title}**`) return false;
      return !/^<!--\s*visual:[a-z0-9-]+\s*-->$/.test(block.trim());
    })
    .join(' ')
    .replace(/<!--\s*paragraph:(?:thesis|emphasis)\s*-->/g, ' ')
    .replace(/<!--\s*table:[a-z0-9-]+\s*-->/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#]/g, ' ');
  const wordCount = readingText.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length || 0;
  const visualMinutes = (visualCount * 20) / 60;
  return Math.max(1, Math.ceil(wordCount / 180 + visualMinutes));
}

export function getStudyReadingMinutes(study: Study, locale: 'en' | 'ar') {
  const contentFile = (locale === 'ar' && study.content_file_ar) || study.content_file;
  if (!contentFile) return null;

  const hasArabicContent = locale === 'ar' && Boolean(study.content_file_ar);
  const title = (hasArabicContent && study.title_ar) || study.title;
  return estimateReadingMinutes(readResearchContent(contentFile), title);
}
