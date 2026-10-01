import Image from 'next/image';
import Link from 'next/link';
import type { Study } from '@/research/lib/types';
import { getResearchArticlePath } from '@/research/lib/paths';

export default function FeaturedResearchEssay({
  article,
  locale,
}: {
  article: Study;
  locale: 'en' | 'ar';
}) {
  const isArabic = locale === 'ar';
  const title = isArabic ? article.title_ar || article.title : article.title;
  const tagline = isArabic ? article.tagline_ar || article.tagline : article.tagline;
  const series = isArabic ? article.category_ar || article.category : article.series || article.category;
  const number = String(article.series_number || 1).padStart(2, '0');
  const author = article.authors?.[0]?.name;
  const year = article.published_at?.slice(0, 4);

  return (
    <section
      className="research-featured-essay"
      aria-labelledby="research-featured-title"
      lang={locale}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="grid items-center gap-8 border-b border-ink/15 pb-12 sm:gap-10 md:grid-cols-[1fr_0.94fr] md:gap-12 md:pb-16">
        <div className="order-2 md:order-1">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            {isArabic ? 'مقال مختار' : 'Featured essay'}
          </p>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-ink/50">
            {[series, isArabic ? `المقال ${number}` : `Article ${number}`, year].filter(Boolean).join(' · ')}
          </p>
          <h1 id="research-featured-title" className="mt-4 max-w-2xl font-latex text-4xl leading-[1.04] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {tagline && <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/65 sm:text-xl">{tagline}</p>}
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            {author && <span className="text-sm text-ink/55">{author}</span>}
            <Link
              href={getResearchArticlePath(article, locale)}
              className="inline-flex items-center gap-3 bg-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.14em] text-paper no-underline transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {isArabic ? 'اقرأ المقال' : 'Read the essay'}
              <span aria-hidden="true">{isArabic ? '←' : '→'}</span>
            </Link>
          </div>
        </div>

        <Link
          href={getResearchArticlePath(article, locale)}
          className="group order-1 block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:order-2"
          aria-label={`${title} — ${isArabic ? 'اقرأ المقال' : 'read article'}`}
        >
          <div className="relative aspect-[16/10] overflow-hidden border border-ink/10 bg-ink/[0.04]">
            {article.hero_image || article.thumbnail ? (
              <Image
                src={article.hero_image || article.thumbnail!}
                alt={article.hero_image_alt || article.thumbnail_alt || title}
                fill
                priority
                sizes="(min-width: 768px) 46vw, 100vw"
                className="research-image-paper-tone research-image-paper-tone-hero object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full items-end justify-end p-6 font-latex text-8xl text-ink/15">{number}</div>
            )}
          </div>
        </Link>
      </div>
    </section>
  );
}
