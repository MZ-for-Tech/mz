import type { Metadata } from 'next';
import ResearchHome from '@/research/components/ResearchHome';

export const metadata: Metadata = {
  title: 'الفرضية الصفرية | أبحاث MZ',
  description: 'أبحاث MZ من السؤال إلى المنتج، مع أفكار وأساليب تفاعلية.',
  alternates: { canonical: '/research/ar', languages: { en: '/research', ar: '/research/ar' } },
  openGraph: {
    title: 'الفرضية الصفرية | أبحاث MZ',
    description: 'أبحاث MZ من السؤال إلى المنتج، مع أفكار وأساليب تفاعلية.',
    url: 'https://mzfortech.com/research/ar',
    siteName: 'MZ',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default function ArabicResearchPage() {
  return <ResearchHome locale="ar" />;
}
