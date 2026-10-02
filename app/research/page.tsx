import { pageMetadata } from '@/lib/seo';
import ResearchHome from '@/research/components/ResearchHome';

export const metadata = pageMetadata({
  title: 'The Null Hypothesis: Applied Research | MZ',
  description: 'The Null Hypothesis follows MZ research from question to product, making the ideas and methods behind what we build explorable through interactive work.',
  path: '/research',
  languages: { en: '/research', ar: '/research/ar' },
});

export default function ResearchPage() {
  return <ResearchHome />;
}
