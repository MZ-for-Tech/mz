import type { Study } from '@/research/lib/types';
import { getResearchArticlePath, getResearchSeriesPath } from '@/research/lib/paths';
import { readResearchContent } from '@/research/lib/content';
import { VisualizationEngine } from '@/research/features/engine/VisualizationEngine';
import ResearchEssayShell from '@/research/components/ResearchEssayShell';
import SVDStoryContent, { getSVDStoryContents } from '@/research/components/SVDStoryContent';
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

function estimateReadingMinutes(markdown: string, title: string) {
  const articleBody = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\\\[[\s\S]*?\\\]/g, ' ')
    .replace(/\\\([\s\S]*?\\\)/g, ' ')
    .replace(/\$[^$]+\$/g, ' ')
    .replace(/^#\s+[^\n]+\n/, ' ')
    .split(/\n(?:\*\*(?:References|المراجع)\*\*|#{1,2}\s*(?:References|Sources|المراجع|المصادر))\s*\n/i)[0]
    .replace(/^\[\[interactive:[^\]]+\]\]$/gm, ' ');
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
  return Math.max(1, Math.ceil(wordCount / 180));
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
  const series = (isArabic && study.series_ar) || study.series || (isArabic && study.category_ar) || study.category;
  const contents = study.essay_renderer === 'svd-story' ? getSVDStoryContents(locale) : toc;
  const readingMinutes = estimateReadingMinutes(markdown, title);
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
    ...(study.series ? { isPartOf: {
      '@type': 'CreativeWorkSeries',
      name: (isArabic && study.series_ar) || study.series,
      position: study.series_number,
      ...(study.series_slug ? { url: `https://www.mzfortech.com${getResearchSeriesPath(study.series_slug)}` } : {}),
    } } : {}),
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
    <ResearchEssayShell
      locale={locale}
      title={title}
      tagline={tagline}
      seriesLabel={series}
      seriesHref={study.series_slug && !(isArabic && study.arabic_translation_status === 'draft') ? getResearchSeriesPath(study.series_slug) : undefined}
      articleNumber={study.series_slug ? study.series_number || 1 : undefined}
      publishedAt={study.published_at}
      authors={study.authors}
      readTimeMinutes={readingMinutes}
      keywords={keywords}
      heroImage={study.hero_image || study.thumbnail}
      heroImageAlt={study.hero_image_alt || study.thumbnail_alt || title}
      heroImageToneClass={study.essay_renderer === 'svd-story' ? 'research-image-paper-tone-svd' : undefined}
      contents={contents}
      translationNotice={isArabic && study.arabic_translation_status === 'draft' ? <p className="research-essay-translation-notice mb-6 border-y border-accent/25 py-3 font-latex text-base text-ink/65">مسودة ترجمة آلية للمراجعة.</p> : undefined}
      articleSchema={articleSchema}
    >
        {study.essay_renderer === 'svd-story' ? <SVDStoryContent study={study} locale={locale} /> : <div className="latex-prose research-essay-prose">
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
                <blockquote key={index} className="max-w-3xl font-latex leading-relaxed text-ink/75">
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
                <h2 key={index} id={id} className={isReferencesHeading ? 'research-essay-references-heading' : undefined}>
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
                className={isReferenceEntry ? 'research-essay-reference-entry' : undefined}
              >
                {inlineMarkdown(block.replace(/\n/g, ' '))}
              </p>
            );
          })}
        </div>}
    </ResearchEssayShell>
  );
}
