import { CUSTOM_STUDIES, hasArabicStudyMetadata } from '@/research/data/studies';
import Bookshelf from '@/research/features/research/Bookshelf';
import FeaturedResearchEssay from '@/research/features/research/FeaturedResearchEssay';
import ResearchArticleCards from '@/research/features/research/ResearchArticleCards';

export default function ResearchHome({ locale = 'en' }: { locale?: 'en' | 'ar' }) {
  const isArabic = locale === 'ar';
  const essays = CUSTOM_STUDIES.filter((study) =>
    study.published
    && study.article_type === 'essay'
    && (!isArabic || study.arabic_translation_status !== 'draft')
    && (!isArabic || hasArabicStudyMetadata(study)),
  );
  const featuredEssay = essays.find((essay) => essay.is_featured) || essays[0];

  return (
    <main className="research-main" lang={locale} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="research-home research-home-editorial">
        {featuredEssay && <FeaturedResearchEssay article={featuredEssay} locale={locale} />}

        <section className="research-brand-intro" aria-labelledby="research-brand-title">
          <div className="research-brand-layout">
            <h2 id="research-brand-title" className={`research-brand-title ${isArabic ? '' : 'font-latex'}`}>
              {isArabic ? (
                <><span>{'النظرية'}</span><span className="research-brand-emphasis">تأتي أولاً.</span></>
              ) : (
                <><span>Theory</span><span className="research-brand-emphasis">comes first.</span></>
              )}
            </h2>
            <p className="research-brand-copy">
              {isArabic
                ? 'يتتبع The Null Hypothesis أبحاث MZ من السؤال إلى المنتج، ويتيح استكشاف الأفكار والأساليب وراء ما نبنيه من خلال تجارب تفاعلية.'
                : 'The Null Hypothesis follows MZ research from question to product, making the ideas and methods behind what we build explorable through interactive work.'}
            </p>
          </div>
        </section>

        <section className="mt-20 border-t border-ink/15 pt-8" aria-labelledby="research-shelf-label">
          <p id="research-shelf-label" className="font-mono text-xs uppercase tracking-[0.16em] text-ink/45">
            {isArabic ? 'بحث مختار' : 'Research on the shelf'}
          </p>
          <Bookshelf
            studies={CUSTOM_STUDIES.filter((study) =>
              study.published
              && study.article_type === 'paper'
              && (!isArabic || hasArabicStudyMetadata(study)),
            )}
            locale={locale}
          />
        </section>

        <ResearchArticleCards articles={essays} locale={locale} />
      </div>
    </main>
  );
}
