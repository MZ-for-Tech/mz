import { CUSTOM_STUDIES } from '@/research/data/studies';
import Bookshelf from '@/research/features/research/Bookshelf';

export default function ResearchHome({ locale = 'en' }: { locale?: 'en' | 'ar' }) {
  const isArabic = locale === 'ar';

  return (
    <main className="research-main" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="research-home">
        <h1 className="max-w-4xl font-latex text-5xl leading-[1.04] tracking-tight text-ink md:text-7xl">
          {isArabic ? <>النظرية <span className="italic text-accent">تأتي أولاً.</span></> : <>Theory <span className="italic text-accent">comes first.</span></>}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink/65 md:text-xl">
          {isArabic
            ? 'يتتبع منشور الفرضية الصفرية أبحاث MZ من السؤال إلى المنتج، ويتيح استكشاف الأفكار والأساليب وراء ما نبنيه من خلال تجارب تفاعلية.'
            : 'The Null Hypothesis follows MZ research from question to product, making the ideas and methods behind what we build explorable through interactive work.'}
        </p>

        <section className="mt-24 border-t border-ink/15 pt-8" aria-labelledby="research-shelf-label">
          <p id="research-shelf-label" className="font-mono text-xs uppercase tracking-[0.16em] text-ink/45">
            {isArabic ? 'بحث مختار' : 'Research on the shelf'}
          </p>
          <Bookshelf studies={CUSTOM_STUDIES.filter((study) => study.published)} locale={locale} />
        </section>
      </div>
    </main>
  );
}
