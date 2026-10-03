import { pageMetadata } from '@/lib/seo';
import ResearchHome from '@/research/components/ResearchHome';

export const metadata = pageMetadata({
  title: 'The Null Hypothesis',
  description: 'أبحاث MZ من السؤال إلى المنتج، مع أفكار وأساليب تفاعلية.',
  path: '/research/ar',
  locale: 'ar_EG',
  languages: { en: '/research', ar: '/research/ar' },
});

export default function ArabicResearchPage() {
  return <ResearchHome locale="ar" />;
}
