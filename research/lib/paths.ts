import type { Study } from '@/research/lib/types';

export function getResearchArticlePath(
  article: Pick<Study, 'slug' | 'article_type'>,
  locale: 'en' | 'ar' = 'en',
) {
  const typeSegment = article.article_type === 'essay' ? 'essays' : 'papers';
  const localeSegment = locale === 'ar' ? '/ar' : '';
  return `/research${localeSegment}/${typeSegment}/${article.slug}`;
}

export function getResearchSeriesPath(slug: string) {
  return `/research/series/${slug}`;
}
