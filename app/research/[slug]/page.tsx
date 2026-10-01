import { notFound, permanentRedirect } from 'next/navigation';
import { researchArticleMetadata } from '@/research/components/ResearchArticle';
import { CUSTOM_STUDIES } from '@/research/data/studies';
import { getResearchArticlePath } from '@/research/lib/paths';

export function generateStaticParams() {
  return CUSTOM_STUDIES.filter((study) => study.published).map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return researchArticleMetadata('en', slug);
}

export default async function ResearchArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = CUSTOM_STUDIES.find((item) => item.slug === slug && item.published);
  if (!study) notFound();
  permanentRedirect(getResearchArticlePath(study, 'en'));
}
