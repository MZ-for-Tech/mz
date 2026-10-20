import { pageMetadata } from '@/lib/seo';
import ResearchHome from '@/research/components/ResearchHome';

export const metadata = pageMetadata({
  title: 'The Null Hypothesis — Research',
  description: 'Essays and papers on AI, statistics and model compression from Model Zero, with interactive explanations and selected publications in English and Arabic.',
  path: '/research',
  languages: { en: '/research', ar: '/research/ar' },
});

export default function ResearchPage() {
  return <ResearchHome />;
}
