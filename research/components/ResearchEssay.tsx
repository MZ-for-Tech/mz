import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import Link from 'next/link';
import Image from 'next/image';
import type { Study } from '@/research/lib/types';
import { getResearchArticlePath } from '@/research/lib/paths';
import { VisualizationEngine } from '@/research/features/engine/VisualizationEngine';
import ResearchContentsSidebar from '@/research/components/ResearchContentsSidebar';

function inlineMarkdown(text: string) {
  const pieces = text.split(/(\[[^\]]+\]\(https?:\/\/[^)\s]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return pieces.map((piece, index) => {
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
  const articleBody = markdown.split(/\n\*\*References\*\*\s*\n/)[0];
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

export default function ResearchEssay({ study }: { study: Study }) {
  if (!study.content_file) return null;

  const markdown = readFileSync(join(process.cwd(), 'research', 'content', basename(study.content_file)), 'utf8');
  const blocks = markdown.trim().split(/\n\s*\n/);
  const referencesIndex = blocks.findIndex((block) => block.trim() === '**References**');
  const series = study.series || 'The Institutional Machine';
  const articleNumber = String(study.series_number || 1).padStart(2, '0');
  const readingMinutes = estimateReadingMinutes(markdown, study.title);
  const publicationDate = study.published_at
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(study.published_at))
    : null;
  const canonicalUrl = `https://www.mzfortech.com${getResearchArticlePath(study, 'en')}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: study.title,
    description: study.description || study.tagline,
    keywords: study.keywords,
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
    <div className="research-content" data-reading-progress lang="en" dir="ltr">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c'),
        }}
      />
      <article className="mx-auto max-w-4xl px-5 pt-8 pb-16 md:px-8 md:pt-10 md:pb-24">
        <header className="mb-12">
          <Link href="/research" className="font-mono text-xs uppercase tracking-widest text-ink/55 hover:text-accent">
            ← Back to essays
          </Link>
          <p className="mt-8 border-t-[3px] border-ink py-3 font-mono text-xs uppercase tracking-widest text-accent">
            {series} · Article {articleNumber}
          </p>
          <h1 className="max-w-4xl font-latex text-4xl leading-[0.98] tracking-tight text-ink md:text-6xl">
            {study.title}
          </h1>
          {study.tagline && (
            <p className="mt-5 max-w-3xl font-serif text-xl italic leading-relaxed text-ink/65 md:text-2xl">
              {study.tagline}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 border-y border-ink/15 py-3 font-mono text-xs uppercase tracking-widest text-ink/55">
            <span>Essay</span>
            {publicationDate && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={study.published_at}>{publicationDate}</time>
              </>
            )}
            {study.authors?.map((author) => (
              <span key={author.name} className="contents">
                <span aria-hidden="true">·</span>
                <span>By {author.name}</span>
              </span>
            ))}
            <span aria-hidden="true">·</span>
            <span>{readingMinutes} min read</span>
          </div>
          {study.keywords?.length ? (
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-ink/60">
              <span className="font-semibold text-ink/75">Keywords:</span> {study.keywords.join(' · ')}
            </p>
          ) : null}
        </header>

        {(study.hero_image || study.thumbnail) && (
          <figure className="relative mb-12 aspect-[16/9] overflow-hidden border border-ink/10 bg-ink/[0.04]">
            <Image
              src={study.hero_image || study.thumbnail!}
              alt={study.hero_image_alt || study.thumbnail_alt || study.title}
              fill
              sizes="(min-width: 896px) 896px, calc(100vw - 40px)"
              className="research-image-paper-tone research-image-paper-tone-hero object-cover"
            />
          </figure>
        )}

        {study.toc?.length ? <ResearchContentsSidebar items={study.toc} /> : null}

        <div className="latex-prose space-y-4 text-xl">
          {blocks.map((block, index) => {
            if (index === 0 && block.trim() === `**${study.title}**`) return null;
            const visualMarker = block.trim().match(/^<!--\s*visual:([a-z0-9-]+)\s*-->$/);
            if (visualMarker && visualMarker[1] in essayVisuals) {
              const id = essayVisuals[visualMarker[1] as keyof typeof essayVisuals];
              return <VisualizationEngine key={index} id={id} />;
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
              const isReferencesHeading = label === 'References';
              return (
                <h2 key={index} id={headingId(label)} className={`${isReferencesHeading ? 'mt-12 border-t border-ink/20 pt-8' : 'pt-8'} scroll-mt-24 text-3xl font-bold text-ink`}>
                  {label}
                </h2>
              );
            }
            return <p key={index} className={referencesIndex >= 0 && index > referencesIndex ? 'text-base leading-relaxed' : undefined}>{inlineMarkdown(block.replace(/\n/g, ' '))}</p>;
          })}
        </div>
      </article>
    </div>
  );
}
