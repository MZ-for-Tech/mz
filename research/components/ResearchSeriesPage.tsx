import Link from 'next/link';
import type { ResearchSeries } from '@/research/data/series';
import type { Study } from '@/research/lib/types';
import ResearchArticleCards from '@/research/features/research/ResearchArticleCards';
import { getResearchArticlePath } from '@/research/lib/paths';

export default function ResearchSeriesPage({
  series,
  articles,
}: {
  series: ResearchSeries;
  articles: Study[];
}) {
  const firstArticle = articles[0];

  return (
    <main className="research-main" lang="en" dir="ltr">
      <div className="research-home research-home-editorial">
        <header className="max-w-4xl">
          <Link href="/research" className="font-mono text-xs uppercase tracking-widest text-ink/55 transition-colors hover:text-accent">
            ← Research
          </Link>
          <div className="mt-10 border-t-[3px] border-ink pt-5">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">{series.format}</p>
            <h1 className="mt-4 font-latex text-5xl leading-[0.98] tracking-tight text-ink md:text-7xl">
              {series.title}
            </h1>
            <p className="mt-6 max-w-3xl font-serif text-xl leading-relaxed text-ink/65 md:text-2xl">
              {series.description}
            </p>
            {firstArticle && (
              <Link
                href={getResearchArticlePath(firstArticle, 'en')}
                className="mt-8 inline-flex items-center gap-3 border-b border-ink/30 pb-2 font-serif text-lg text-ink transition-colors hover:border-accent hover:text-accent"
              >
                Start with Article {String(firstArticle.series_number || 1).padStart(2, '0')}
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </header>

        <ResearchArticleCards articles={articles} locale="en" />
      </div>
    </main>
  );
}
