import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import ResearchContentsSidebar from '@/research/components/ResearchContentsSidebar';
import ResearchArticleCards from '@/research/features/research/ResearchArticleCards';
import type { Study, StudyAuthor } from '@/research/lib/types';

type Locale = 'en' | 'ar';
type ContentsItem = { id: string; label: string };

export type ResearchEssayShellProps = {
  locale: Locale;
  title: string;
  tagline?: string;
  seriesLabel?: string;
  seriesHref?: string;
  articleNumber?: number;
  publishedAt?: string;
  authors?: StudyAuthor[];
  readTimeMinutes: number;
  keywords?: string[];
  heroImage?: string;
  heroImageAlt?: string;
  heroImageToneClass?: string;
  contents?: ContentsItem[];
  relatedArticles?: Study[];
  translationNotice?: ReactNode;
  articleSchema: Record<string, unknown>;
  children: ReactNode;
};

export default function ResearchEssayShell({
  locale,
  title,
  tagline,
  seriesLabel,
  seriesHref,
  articleNumber,
  publishedAt,
  authors = [],
  readTimeMinutes,
  keywords,
  heroImage,
  heroImageAlt,
  heroImageToneClass,
  contents = [],
  relatedArticles = [],
  translationNotice,
  articleSchema,
  children,
}: ResearchEssayShellProps) {
  const isArabic = locale === 'ar';
  const publicationDate = publishedAt
    ? new Intl.DateTimeFormat(isArabic ? 'ar-EG' : 'en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(publishedAt))
    : null;

  return (
    <div className="research-content" data-reading-progress lang={locale} dir={isArabic ? 'rtl' : 'ltr'}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }} />
      <article className="research-essay-shell mx-auto max-w-4xl px-5 pt-8 pb-16 md:px-8 md:pt-10 md:pb-24">
        <header className="research-essay-header mb-12">
          <Link href={isArabic ? '/research/ar' : '/research'} className="research-essay-back font-mono text-xs uppercase tracking-widest text-ink/55 hover:text-accent">
            {isArabic ? '→ العودة إلى المقالات' : '← Back to articles'}
          </Link>
          {seriesLabel && (
            <p className="research-essay-eyebrow mt-8 border-t-[3px] border-ink py-3 font-mono text-xs uppercase tracking-widest text-accent">
              {seriesHref ? <Link href={seriesHref} className="hover:text-ink">{seriesLabel}</Link> : seriesLabel}
              {articleNumber ? <> · {isArabic ? `المقال ${String(articleNumber).padStart(2, '0')}` : `Article ${String(articleNumber).padStart(2, '0')}`}</> : null}
            </p>
          )}
          <h1 lang={locale} className={`research-essay-title max-w-4xl tracking-tight text-ink ${isArabic ? '' : 'font-latex'}`}>{title}</h1>
          {tagline && <p className="research-essay-tagline mt-5 max-w-3xl font-serif italic leading-relaxed text-ink/65">{tagline}</p>}
          <div className="research-essay-metadata mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 border-y border-ink/15 py-3 font-mono text-xs uppercase tracking-widest text-ink/55">
            <span>{isArabic ? 'مقال' : 'Essay'}</span>
            {publicationDate && <><span aria-hidden="true">·</span><time dateTime={publishedAt}>{publicationDate}</time></>}
            {authors.map((author) => {
              const name = isArabic ? author.name_ar || author.name : author.name;
              return <span key={author.name} className="contents"><span aria-hidden="true">·</span><span>{isArabic ? name : `By ${name}`}</span></span>;
            })}
            <span aria-hidden="true">·</span>
            <span>{isArabic ? `${readTimeMinutes} دقائق للقراءة` : `${readTimeMinutes} min read`}</span>
          </div>
          {keywords?.length ? <p className="research-essay-keywords mt-3 max-w-4xl text-sm leading-relaxed text-ink/60"><span className="font-semibold text-ink/75">{isArabic ? 'كلمات مفتاحية:' : 'Keywords:'}</span> {keywords.join(' · ')}</p> : null}
        </header>

        {heroImage && <figure className="relative m-0 mb-12 aspect-[16/9] w-full overflow-hidden border border-ink/10 bg-ink/[0.04]"><Image src={heroImage} alt={heroImageAlt || title} fill sizes="(min-width: 896px) 896px, calc(100vw - 40px)" className={`research-image-paper-tone research-image-paper-tone-hero ${heroImageToneClass || ''} object-cover`} /></figure>}
        {translationNotice}
        <ResearchContentsSidebar items={contents} locale={locale} />
        {children}
        <ResearchArticleCards articles={relatedArticles} locale={locale} label={isArabic ? 'اقرأ المزيد' : 'Read more'} />
        {seriesHref && <footer className="mt-16 border-t border-ink/15 pt-6"><Link href={seriesHref} className="font-serif text-lg text-ink/65 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">{isArabic ? `اكتشف السلسلة: ${seriesLabel}` : `Explore the series: ${seriesLabel}`}</Link></footer>}
      </article>
    </div>
  );
}
