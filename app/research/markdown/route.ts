import { NextRequest, NextResponse } from 'next/server';
import { CUSTOM_STUDIES } from '@/research/data/studies';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const originalPath = url.searchParams.get('path');
  const requestedPath = originalPath || '/research';
  const locale = requestedPath.startsWith('/research/ar') ? 'ar' : 'en';
  const isArticle = CUSTOM_STUDIES.some(
    (item) => item.published && requestedPath.includes(item.slug),
  );
  const study = CUSTOM_STUDIES.find(
    (item) => item.published && requestedPath.includes(item.slug),
  ) || CUSTOM_STUDIES.find((item) => item.published);
  if (!study) {
    return new NextResponse('# The Null Hypothesis — MZ Research', {
      status: 404,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'X-Robots-Tag': 'noindex, follow',
      },
    });
  }

  const articlePath = requestedPath.includes('/ar/')
    ? `/research/ar/${study.slug}`
    : `/research/${study.slug}`;

  const content = isArticle
    ? [
        `# ${locale === 'ar' && study.title_ar ? study.title_ar : study.title}`,
        '',
        locale === 'ar' && study.tagline_ar ? study.tagline_ar : study.tagline,
        '',
        `By ${study.authors?.map((author) => author.name).join(', ') || 'MZ Research'}`,
        '',
        locale === 'ar' && study.description_ar ? study.description_ar : study.description,
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

  const headers: Record<string, string> = {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  };
  // The route itself is a utility URL. Proxy rewrites for canonical research
  // pages pass their original path in the query, so their response must not
  // inherit this noindex directive.
  if (!originalPath) headers['X-Robots-Tag'] = 'noindex, follow';

  return new NextResponse(content, { headers });
}
