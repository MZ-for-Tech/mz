import { pageMetadata } from '@/lib/seo';
import ResearchHome from '@/research/components/ResearchHome';

export const metadata = pageMetadata({
  title: 'الفرضية الصفرية — أبحاث موديل زيرو',
  description: 'مقالات وأوراق بحثية من موديل زيرو عن الذكاء الاصطناعي والإحصاء وضغط النماذج، مع شروح تفاعلية ومنشورات مختارة باللغة العربية والإنجليزية لفهم الأفكار والأساليب.',
  path: '/research/ar',
  locale: 'ar_EG',
  languages: { en: '/research', ar: '/research/ar' },
});

export default function ArabicResearchPage() {
  return <ResearchHome locale="ar" />;
}
