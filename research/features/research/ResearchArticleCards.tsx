import Link from 'next/link';
import Image from 'next/image';
import type { Study } from '@/research/lib/types';
import { getResearchArticlePath } from '@/research/lib/paths';
import { getStudyReadingMinutes } from '@/research/lib/readingTime';

export default function ResearchArticleCards({
  articles,
  locale,
  label,
}: {
  articles: Study[];
  locale: 'en' | 'ar';
  label?: string;
}) {
  if (!articles.length) return null;
  const isArabic = locale === 'ar';

  return (
    <section
      className="research-article-cards mt-16 border-t border-ink/15 pt-8"
      aria-labelledby="research-articles-label"
      lang={locale}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <p id="research-articles-label" className="font-mono text-xs uppercase tracking-[0.16em] text-ink/45">
        {label || (isArabic ? 'مقالات وأفكار' : 'Articles & essays')}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => {
          const title = isArabic ? article.title_ar || article.title : article.title;
          const tagline = isArabic ? article.tagline_ar || article.tagline : article.tagline;
          const series = isArabic ? article.category_ar || article.category : article.series || article.category;
          const number = article.series_number ? String(article.series_number).padStart(2, '0') : null;
          const readTime = getStudyReadingMinutes(article, locale);

          return (
            <article key={article.slug}>
              <Link
                href={getResearchArticlePath(article, locale)}
                className="group block text-ink no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                aria-label={`${title} — ${isArabic ? 'اقرأ المقال' : 'read article'}`}
              >
                <div
                  className="relative isolate aspect-[16/9] overflow-hidden border border-ink/10 bg-ink/[0.04] transition-colors group-hover:border-accent/45"
                  style={!article.thumbnail ? {
                    backgroundImage: 'radial-gradient(ellipse at 75% 25%, color-mix(in srgb, var(--accent-val) 14%, transparent), transparent 46%), linear-gradient(135deg, var(--paper-val), color-mix(in srgb, var(--ink-val) 5%, var(--paper-val)))',
                  } : undefined}
                >
                  {article.thumbnail && (
                    <Image
                      src={article.thumbnail}
                      alt={article.thumbnail_alt || title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className={`${article.essay_renderer === 'svd-story' ? 'research-image-paper-tone-svd ' : ''}research-image-paper-tone object-cover`}
                    />
                  )}
                  {!article.thumbnail && (
                    <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
                      <span className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
                        {series || 'MZ Research'}
                      </span>
                      <span className="self-end font-latex text-7xl leading-none tracking-tight text-ink/15 sm:text-8xl">
                        {number || '∑'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-[0.13em] text-ink/45">
                  <span>{series || (isArabic ? 'بحث MZ' : 'MZ Research')}{number ? ` · ${isArabic ? `المقال ${number}` : `No. ${number}`}` : ''}</span>
                  {readTime !== null && <span className="shrink-0">{isArabic ? `${readTime} دقائق للقراءة` : `${readTime} min read`}</span>}
                </div>
                <h2 lang={locale} className={`research-article-card-title mt-3 text-2xl text-ink transition-colors group-hover:text-accent ${isArabic ? '' : 'font-latex leading-tight tracking-tight'}`}>
                  {title}
                </h2>
                {tagline && <p className="mt-3 text-sm leading-relaxed text-ink/60">{tagline}</p>}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
