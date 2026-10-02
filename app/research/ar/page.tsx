import { pageMetadata } from '@/lib/seo';
import ResearchHome from '@/research/components/ResearchHome';

export const metadata = pageMetadata({
  title: 'الفرضية الصفرية: أبحاث تطبيقية | MZ',
  description: 'أبحاث MZ من السؤال إلى المنتج، مع أفكار وأساليب تفاعلية.',
  path: '/research/ar',
  locale: 'ar_EG',
  languages: { en: '/research', ar: '/research/ar' },
});

export default function ArabicResearchPage() {
  return <ResearchHome locale="ar" />;
}
