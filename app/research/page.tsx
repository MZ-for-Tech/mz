import type { Metadata } from 'next';
import ResearchHome from '@/research/components/ResearchHome';

export const metadata: Metadata = {
  title: 'The Null Hypothesis | MZ Research',
  description: 'The Null Hypothesis follows MZ research from question to product, making the ideas and methods behind what we build explorable through interactive work.',
  alternates: { canonical: '/research', languages: { en: '/research', ar: '/research/ar' } },
  openGraph: {
    title: 'The Null Hypothesis | MZ Research',
    description: 'Research from MZ, made explorable.',
    url: 'https://mzfortech.com/research',
    siteName: 'MZ',
    type: 'website',
  },
};

export default function ResearchPage() {
  return <ResearchHome />;
}
