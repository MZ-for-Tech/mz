'use client';

import Link from "next/link";
import type { Study } from '@/research/lib/types';
import { getResearchArticlePath } from '@/research/lib/paths';

interface BookItemProps {
  study: Study;
  locale: string;
}

export default function BookItem({ study, locale }: BookItemProps) {
  const title = locale === 'ar' ? study.title_ar || study.title : study.title;
  const seriesLabel = study.series_number
    ? `${study.series || 'THE NULL HYPOTHESIS'} · ${String(study.series_number).padStart(2, '0')}`
    : 'THE NULL HYPOTHESIS · MZ';
  const authors = study.authors
    ?.map((author) => author.name)
    .sort((a, b) => a.localeCompare(b)) || ['MZ Research'];
  const year = study.published_at?.slice(0, 4);
  return (
    <Link className="moleskine-wrapper group" href={getResearchArticlePath(study, locale === 'ar' ? 'ar' : 'en')} aria-label={`${title} — open research`}>
      <div className="moleskine-notebook">
        <div className="notebook-cover">
          <div className="research-cover">
            <span className="research-cover-label">
              {study.article_type === 'essay' ? seriesLabel.toUpperCase() : 'THE NULL HYPOTHESIS · MZ'}
            </span>
            <div className="research-cover-body">
              {year && <span className="research-cover-year">{year}</span>}
              <h3>{title}</h3>
              <span className="research-cover-rule" />
              <span className="research-cover-authors">
                {authors.map((author) => <span key={author}>{author}</span>)}
              </span>
            </div>
          </div>
        </div>
        <div className="notebook-page ruled">
          <div className="notebook-quote-container">
            <span className="notebook-quote-text line-clamp-[8] opacity-80 text-xs">
              {study.tagline || study.description}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
