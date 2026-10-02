import Link from 'next/link';
import Image from 'next/image';
import type { Study } from '@/research/lib/types';
import { getResearchArticlePath, getResearchSeriesPath } from '@/research/lib/paths';
import { readResearchContent } from '@/research/lib/content';
import { VisualizationEngine } from '@/research/features/engine/VisualizationEngine';
import ResearchContentsSidebar from '@/research/components/ResearchContentsSidebar';
import SafeLatex from '@/research/components/SafeLatex';

function inlineMarkdown(text: string) {
  const pieces = text.split(/(\[[^\]]+\]\(https?:\/\/[^)\s]+\)|\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return pieces.map((piece, index) => {
    if (piece.startsWith('$') && piece.endsWith('$')) {
      return <SafeLatex key={index} content={piece} />;
    }
    const link = piece.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (link) {
      return (
        <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
          {inlineMarkdown(link[1])}
        </a>
      );
    }
    if (piece.startsWith('**') && piece.endsWith('**')) {
      return <strong key={index}>{piece.slice(2, -2)}</strong>;
    }
    if (piece.startsWith('*') && piece.endsWith('*')) {
      return <em key={index}>{piece.slice(1, -1)}</em>;
    }
    return <span key={index}>{piece.replace(/\\([.!])/g, '$1')}</span>;
  });
}

function headingId(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function estimateReadingMinutes(markdown: string, title: string, locale: 'en' | 'ar') {
  const referenceHeading = locale === 'ar' ? 'المراجع' : 'References';
  const articleBody = markdown.split(new RegExp(`\\n\\*\\*${referenceHeading}\\*\\*\\s*\\n`))[0];
  const readingText = articleBody
    .trim()
    .split(/\n\s*\n/)
    .filter((block, index) => {
      if (index === 0 && block.trim() === `**${title}**`) return false;
      return !/^<!--\s*visual:[a-z0-9-]+\s*-->$/.test(block.trim());
    })
    .join(' ')
    .replace(/<!--\s*paragraph:thesis\s*-->/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#]/g, ' ');
  const wordCount = readingText.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length || 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

const essayVisuals = {
  'r2-inflation': 'R2InflationDemo',
  'double-goodhart': 'DoubleGoodhartFlow',
  benchmaxxing: 'BenchmaxxingLeaderboard',
} as const;

export default function ResearchEssay({ study, locale = 'en' }: { study: Study; locale?: 'en' | 'ar' }) {
  const isArabic = locale === 'ar';
  const contentFile = isArabic ? study.content_file_ar : study.content_file;
  if (!contentFile) return null;

  const title = (isArabic && study.title_ar) || study.title;
  const tagline = (isArabic && study.tagline_ar) || study.tagline;
  const description = (isArabic && study.description_ar) || study.description || tagline;
  const keywords = (isArabic && study.keywords_ar) || study.keywords;
  const toc = (isArabic && study.toc_ar) || study.toc;
  const markdown = readResearchContent(contentFile);
  const blocks = markdown.trim().split(/\n\s*\n/);
  const referencesLabel = isArabic ? 'المراجع' : 'References';
  const referencesIndex = blocks.findIndex((block) => block.trim() === `**${referencesLabel}**`);
  const series = (isArabic && study.series_ar) || study.series || 'The Institutional Machine';
  const articleNumber = String(study.series_number || 1).padStart(2, '0');
  const readingMinutes = estimateReadingMinutes(markdown, title, locale);
  const publicationDate = study.published_at
    ? new Intl.DateTimeFormat(isArabic ? 'ar-EG' : 'en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(study.published_at))
    : null;
  const canonicalUrl = `https://www.mzfortech.com${getResearchArticlePath(study, locale)}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    keywords,
    inLanguage: locale,
    author: study.authors?.map((author) => ({
      '@type': 'Person',
      name: author.name,
    })),
    datePublished: study.published_at,
    dateModified: study.updated_at || study.published_at,
    isPartOf: {
      '@type': 'CreativeWorkSeries',
      name: series,
      position: study.series_number,
      ...(study.series_slug ? { url: `https://www.mzfortech.com${getResearchSeriesPath(study.series_slug)}` } : {}),
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://www.mzfortech.com/#organization',
      name: 'MZ',
      url: 'https://www.mzfortech.com/',
    },
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };

  return (
    <div className="research-content" data-reading-progress lang={locale} dir={isArabic ? 'rtl' : 'ltr'}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c'),
        }}
      />
      <article className="mx-auto max-w-4xl px-5 pt-8 pb-16 md:px-8 md:pt-10 md:pb-24">
        <header className="mb-12">
          <Link href={isArabic ? '/research/ar' : '/research'} className="font-mono text-xs uppercase tracking-widest text-ink/55 hover:text-accent">
            {isArabic ? '→ العودة إلى المقالات' : '← Back to articles'}
          </Link>
          <p className="mt-8 border-t-[3px] border-ink py-3 font-mono text-xs uppercase tracking-widest text-accent">
            {study.series_slug && !(isArabic && study.arabic_translation_status === 'draft') ? (
              <Link href={getResearchSeriesPath(study.series_slug)} className="hover:text-ink">{series}</Link>
            ) : series} · {isArabic ? `المقال ${articleNumber}` : `Article ${articleNumber}`}
          </p>
          <h1 lang={locale} className={`research-essay-title max-w-4xl ${isArabic ? '' : 'font-latex'} text-4xl ${isArabic ? '' : 'leading-[0.98]'} tracking-tight text-ink md:text-6xl`}>
            {title}
          </h1>
          {tagline && (
            <p className="mt-5 max-w-3xl font-serif text-xl italic leading-relaxed text-ink/65 md:text-2xl">
              {tagline}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 border-y border-ink/15 py-3 font-mono text-xs uppercase tracking-widest text-ink/55">
            <span>{isArabic ? 'مقال' : 'Essay'}</span>
            {publicationDate && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={study.published_at}>{publicationDate}</time>
              </>
            )}
            {study.authors?.map((author) => (
              <span key={author.name} className="contents">
                <span aria-hidden="true">·</span>
                <span>{isArabic ? author.name : `By ${author.name}`}</span>
              </span>
            ))}
            <span aria-hidden="true">·</span>
            <span>{isArabic ? `${readingMinutes} دقائق للقراءة` : `${readingMinutes} min read`}</span>
          </div>
          {keywords?.length ? (
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-ink/60">
              <span className="font-semibold text-ink/75">{isArabic ? 'كلمات مفتاحية:' : 'Keywords:'}</span> {keywords.join(' · ')}
            </p>
          ) : null}
        </header>

        {(study.hero_image || study.thumbnail) && (
          <figure className="relative mb-12 aspect-[16/9] overflow-hidden border border-ink/10 bg-ink/[0.04]">
            <Image
              src={study.hero_image || study.thumbnail!}
              alt={study.hero_image_alt || study.thumbnail_alt || title}
              fill
              sizes="(min-width: 896px) 896px, calc(100vw - 40px)"
              className="research-image-paper-tone research-image-paper-tone-hero object-cover"
            />
          </figure>
        )}

        {isArabic && study.arabic_translation_status === 'draft' && (
          <p className="mb-6 border-y border-accent/25 py-3 font-latex text-base text-ink/65">
            مسودة ترجمة آلية للمراجعة.
          </p>
        )}
        {toc?.length ? <ResearchContentsSidebar items={toc} locale={locale} /> : null}

        <div className="latex-prose space-y-4 text-xl">
          {blocks.map((block, index) => {
            if (index === 0 && block.trim() === `**${title}**`) return null;
            const visualMarker = block.trim().match(/^<!--\s*visual:([a-z0-9-]+)\s*-->$/);
            if (visualMarker && visualMarker[1] in essayVisuals) {
              const id = essayVisuals[visualMarker[1] as keyof typeof essayVisuals];
              return <VisualizationEngine key={index} id={id} locale={locale} />;
            }
            const quoteLines = block.split('\n');
            if (quoteLines.every((line) => /^>\s?/.test(line))) {
              return (
                <blockquote key={index} className="my-8 max-w-3xl ps-4 font-latex text-xl italic leading-relaxed text-ink/75 md:text-2xl">
                  {quoteLines
                    .map((line) => line.replace(/^>\s?/, '').trim())
                    .filter(Boolean)
                    .map((line, quoteIndex) => <p key={quoteIndex} className={quoteIndex > 0 ? 'mt-4' : undefined}>{inlineMarkdown(line)}</p>)}
                </blockquote>
              );
            }
            const thesis = block.match(/^<!--\s*paragraph:thesis\s*-->\s*([\s\S]+)$/);
            if (thesis) {
              return (
                <p key={index} className="my-10 max-w-3xl font-latex text-2xl leading-snug text-ink md:text-3xl">
                  {inlineMarkdown(thesis[1].replace(/\n/g, ' '))}
                </p>
              );
            }
            const heading = block.match(/^\*\*(.+)\*\*$/);
            if (heading) {
              const label = heading[1].replace(/[.!?]+$/, '');
              const isReferencesHeading = label === referencesLabel;
              const headingIndex = blocks
                .slice(0, index)
                .filter((candidate) => /^\*\*.+\*\*$/.test(candidate.trim())).length;
              const id = toc?.[headingIndex]?.id || headingId(label);
              return (
                <h2 key={index} id={id} className={`${isReferencesHeading ? 'mt-12 border-t border-ink/20 pt-8' : 'pt-8'} scroll-mt-24 text-3xl font-bold text-ink`}>
                  {inlineMarkdown(label)}
                </h2>
              );
            }
            const isReferenceEntry = referencesIndex >= 0 && index > referencesIndex;
            return (
              <p
                key={index}
                dir={isArabic && isReferenceEntry ? 'ltr' : undefined}
                lang={isArabic && isReferenceEntry ? 'en' : undefined}
                className={isReferenceEntry ? 'text-base leading-relaxed' : undefined}
              >
                {inlineMarkdown(block.replace(/\n/g, ' '))}
              </p>
            );
          })}
        </div>
        {study.series_slug && !(isArabic && study.arabic_translation_status === 'draft') && (
          <footer className="mt-16 border-t border-ink/15 pt-6">
            <Link href={getResearchSeriesPath(study.series_slug)} className="font-serif text-lg text-ink/65 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
              {isArabic ? `اكتشف السلسلة: ${series}` : `Explore the series: ${series}`}
            </Link>
          </footer>
        )}
      </article>
    </div>
  );
}
