import DarkVeil from './DarkVeil';
import ResearchFigure, { ResearchFigurePanel } from '@/research/components/ResearchFigure';

export default function DarkVeilEssayVisual({ locale }: { locale: 'en' | 'ar' }) {
  const isArabic = locale === 'ar';

  return (
    <ResearchFigure
      number={1}
      title="DarkVeil"
      caption={isArabic ? 'تعمل كخلفية متحركة بتظليل GLSL داخل المتصفح.' : 'running as an animated shader in the browser.'}
      locale={locale}
    >
      <ResearchFigurePanel className="relative aspect-[16/9] overflow-hidden bg-[#08090b]">
        <DarkVeil />
      </ResearchFigurePanel>
    </ResearchFigure>
  );
}
