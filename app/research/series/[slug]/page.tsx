import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/seo';
import ResearchSeriesPage from '@/research/components/ResearchSeriesPage';
import { CUSTOM_STUDIES } from '@/research/data/studies';
import { RESEARCH_SERIES } from '@/research/data/series';
import { getResearchSeriesPath } from '@/research/lib/paths';

export function generateStaticParams() {
  return RESEARCH_SERIES.map((series) => ({ slug: series.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const series = RESEARCH_SERIES.find((item) => item.slug === slug);
  if (!series) return {};

  return pageMetadata({
    title: series.title,
    description: series.description,
    path: getResearchSeriesPath(series.slug),
  });
}

export default async function ResearchSeriesRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = RESEARCH_SERIES.find((item) => item.slug === slug);
  if (!series) notFound();

  const articles = CUSTOM_STUDIES
    .filter((study) => study.published && study.series_slug === series.slug)
    .sort((a, b) => (a.series_number || 0) - (b.series_number || 0));

  return <ResearchSeriesPage series={series} articles={articles} />;
}
