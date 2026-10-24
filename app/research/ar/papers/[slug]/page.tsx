import { notFound, redirect } from 'next/navigation';
import ResearchArticle, { researchArticleMetadata } from '@/research/components/ResearchArticle';
import { CUSTOM_STUDIES, hasArabicStudyMetadata } from '@/research/data/studies';

export function generateStaticParams() {
  return CUSTOM_STUDIES
    .filter((study) => study.published && study.article_type === 'paper' && hasArabicStudyMetadata(study))
    .map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const metadata = researchArticleMetadata('ar', slug);
  const study = CUSTOM_STUDIES.find((item) => item.slug === slug);
  return study?.unlisted ? { ...metadata, robots: { index: false, follow: false } } : metadata;
}

export default async function ArabicResearchPaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = CUSTOM_STUDIES.find((item) => item.slug === slug && item.published && item.article_type === 'paper' && hasArabicStudyMetadata(item));
  if (!study) notFound();
  if (study.unlisted) redirect(`/research/papers/${slug}`);
  return <ResearchArticle locale="ar" slug={slug} />;
}
