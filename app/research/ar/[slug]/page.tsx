import { notFound } from 'next/navigation';
import ResearchArticle, { researchArticleMetadata } from '@/research/components/ResearchArticle';
import { CUSTOM_STUDIES } from '@/research/data/studies';

export function generateStaticParams() {
  return CUSTOM_STUDIES.filter((study) => study.published).map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!CUSTOM_STUDIES.some((study) => study.slug === slug)) return {};
  return researchArticleMetadata('ar');
}

export default async function ArabicResearchArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!CUSTOM_STUDIES.some((study) => study.slug === slug)) notFound();
  return <ResearchArticle locale="ar" />;
}
