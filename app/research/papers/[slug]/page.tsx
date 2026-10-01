import { notFound } from 'next/navigation';
import ResearchArticle, { researchArticleMetadata } from '@/research/components/ResearchArticle';
import { CUSTOM_STUDIES } from '@/research/data/studies';

export function generateStaticParams() {
  return CUSTOM_STUDIES
    .filter((study) => study.published && study.article_type === 'paper')
    .map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return researchArticleMetadata('en', slug);
}

export default async function ResearchPaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!CUSTOM_STUDIES.some((study) => study.slug === slug && study.published && study.article_type === 'paper')) notFound();
  return <ResearchArticle locale="en" slug={slug} />;
}
