import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { CUSTOM_STUDIES, hasArabicStudyMetadata } from '@/research/data/studies';
import { getResearchArticlePath } from '@/research/lib/paths';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const originalPath = url.searchParams.get('path');
  const requestedPath = originalPath || '/research';
  const locale = requestedPath.startsWith('/research/ar') ? 'ar' : 'en';
  const isResearchIndex = requestedPath === '/research' || requestedPath === '/research/ar';
  const articleMatch = requestedPath.match(/^\/research\/(?:ar\/)?(papers|essays)\/([^/]+)\/?$/);
  const requestedType = articleMatch?.[1] === 'essays' ? 'essay' : 'paper';
  const requestedSlug = articleMatch?.[2];
  const requestedStudy = CUSTOM_STUDIES.find(
    (item) => item.published && item.slug === requestedSlug && item.article_type === requestedType,
  );
  const study = isResearchIndex
    ? CUSTOM_STUDIES.find((item) => item.published)
    : requestedStudy;

  if (!study || (!isResearchIndex && !requestedStudy) || (locale === 'ar' && !hasArabicStudyMetadata(study))) {
    return new NextResponse('# The Null Hypothesis — MZ Research', {
      status: 404,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'X-Robots-Tag': 'noindex, follow',
      },
    });
  }

  const articlePath = getResearchArticlePath(study, locale);
  const title = locale === 'ar' ? study.title_ar! : study.title;
  const tagline = locale === 'ar' ? study.tagline_ar! : study.tagline;
  const description = locale === 'ar' ? study.description_ar! : study.description;
  const outline = locale === 'ar'
    ? [
        'منهجية البحث ومجموعة BloodMNIST',
        'تحليل نموذج VGG19 الأساسي',
        'تنظيم L1 بطريقة Lasso',
        'بوابات L0 المهيكلة وتقليص القنوات',
        'ضغط منخفض الرتبة باستخدام SVD',
        'تتوفر التصورات التفاعلية على صفحة البحث.',
      ]
    : [
        'Research methodology and BloodMNIST dataset',
        'VGG19 baseline model analysis',
        'L1 Lasso regularization',
        'Structured L0 gates and channel pruning',
        'Low-rank SVD compression',
        'Interactive visualizations are available on the web page.',
      ];
  const essayBlocks = requestedStudy?.content_file
    ? readFileSync(join(process.cwd(), 'research', 'content', basename(requestedStudy.content_file)), 'utf8').trim().split(/\n\s*\n/)
    : [];
  if (essayBlocks[0] === `**${title}**`) essayBlocks.shift();
  const essayText = essayBlocks
    .filter((block) => !/^<!--\s*visual:[a-z0-9-]+\s*-->$/.test(block.trim()))
    .map((block) => block.replace(/<!--\s*paragraph:thesis\s*-->\s*/, ''))
    .join('\n\n');

  const content = requestedStudy?.article_type === 'essay' && requestedStudy.content_file
    ? [
        `# ${title}`,
        '',
        `*${requestedStudy.series || 'The Institutional Machine'} · Article ${String(requestedStudy.series_number || 1).padStart(2, '0')}*`,
        '',
        `_${tagline}_`,
        '',
        essayText,
        '',
        `Read online: https://www.mzfortech.com${articlePath}`,
      ].join('\n')
    : requestedStudy
    ? [
        `# ${title}`,
        '',
        tagline,
        '',
        `${locale === 'ar' ? 'إعداد' : 'By'} ${study.authors?.map((author) => author.name).join(', ') || 'MZ Research'}`,
        '',
        description,
        '',
        locale === 'ar' ? '## يتناول البحث' : '## In this paper',
        '',
        ...outline.map((item) => `- ${item}`),
        '',
        `${locale === 'ar' ? 'صفحة البحث' : 'Read the paper'}: https://www.mzfortech.com${articlePath}`,
        `${locale === 'ar' ? 'تنزيل ملف PDF' : 'Download the PDF'}: https://www.mzfortech.com/research-applied-stats-in-ai.pdf`,
      ].join('\n')
    : [
        locale === 'ar' ? '# الفرضية الصفرية — أبحاث MZ' : '# The Null Hypothesis — MZ Research',
        '',
        locale === 'ar' ? 'النظرية تأتي أولاً.' : 'Theory comes first.',
        '',
        locale === 'ar'
          ? 'يتتبع منشور الفرضية الصفرية أبحاث MZ من السؤال إلى المنتج، ويتيح استكشاف الأفكار والأساليب وراء ما نبنيه من خلال تجارب تفاعلية.'
          : 'The Null Hypothesis follows MZ research from question to product, making the ideas and methods behind what we build explorable through interactive work.',
        '',
        locale === 'ar' ? '## بحث مختار' : '## Featured research',
        '',
        `- [${title}](https://www.mzfortech.com${articlePath}) — ${tagline}`,
      ].join('\n');

  const headers: Record<string, string> = {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  };
  // This Markdown representation has its own URL and must not compete with
  // the canonical HTML article in search results.
  headers['X-Robots-Tag'] = 'noindex, follow';

  return new NextResponse(content, { headers });
}
