import { NextRequest, NextResponse } from 'next/server';
import { CUSTOM_STUDIES } from '@/research/data/studies';

export async function GET(request: NextRequest) {
  const requestedPath = new URL(request.url).searchParams.get('path') || '/research';
  const study = CUSTOM_STUDIES[0];
  const isArticle = requestedPath.includes(study.slug);
  const articlePath = requestedPath.includes('/ar/')
    ? `/research/ar/${study.slug}`
    : `/research/${study.slug}`;

  const content = isArticle
    ? [
        `# ${study.title}`,
        '',
        study.tagline,
        '',
        `By ${study.authors?.map((author) => author.name).join(', ') || 'MZ Research'}`,
        '',
        study.description,
        '',
        '## In this paper',
        '',
        '- Research methodology and BloodMNIST dataset',
        '- VGG19 baseline model analysis',
        '- L1 Lasso regularization',
        '- Structured L0 gates and channel pruning',
        '- Low-rank SVD compression',
        '- Interactive visualizations are available on the web page.',
        '',
        `Read the paper: https://mzfortech.com${articlePath}`,
        `Download the PDF: https://mzfortech.com/research-applied-stats-in-ai.pdf`,
      ].join('\n')
    : [
        '# The Null Hypothesis — MZ Research',
        '',
        'Theory comes first.',
        '',
        'The Null Hypothesis follows MZ research from question to product, making the ideas and methods behind what we build explorable through interactive work.',
        '',
        '## Featured research',
        '',
        `- [${study.title}](https://mzfortech.com/research/${study.slug}) — ${study.tagline}`,
      ].join('\n');

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
