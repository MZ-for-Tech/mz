import { notFound } from 'next/navigation';
import ResearchArticle, { researchArticleMetadata } from '@/research/components/ResearchArticle';
import { CUSTOM_STUDIES, hasArabicStudyMetadata } from '@/research/data/studies';

export const dynamicParams = false;

export function generateStaticParams() {
  return CUSTOM_STUDIES
    .filter((study) => study.published && study.article_type === 'essay' && hasArabicStudyMetadata(study) && study.arabic_translation_status !== 'draft')
    .map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return researchArticleMetadata('ar', slug);
}

export default async function ArabicResearchEssayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!CUSTOM_STUDIES.some((study) => study.slug === slug && study.published && study.article_type === 'essay' && hasArabicStudyMetadata(study) && study.arabic_translation_status !== 'draft')) notFound();
  return <ResearchArticle locale="ar" slug={slug} />;
}
