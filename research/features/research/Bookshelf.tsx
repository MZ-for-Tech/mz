'use client';

import type { Study } from '@/research/lib/types';
import ShelfGroup from '@/research/features/research/ShelfGroup';
import '@/research/features/research/bookshelf.css';

interface BookshelfProps {
  studies: Study[];
  locale: string;
}

export default function Bookshelf({ studies, locale }: BookshelfProps) {
  if (!studies.length) return null;

  return (
    <section className="bookshelf-section w-full" aria-label={locale === 'ar' ? 'الأبحاث المنشورة' : 'Published research'}>
      <div className="bookshelf-container w-full">
        <div className="category-shelves w-full">
          {studies.reduce<Study[][]>((rows, study, index) => {
            if (index % 4 === 0) rows.push([]);
            rows[rows.length - 1].push(study);
            return rows;
          }, []).map((row, index) => (
            <div
              key={row.map((study) => study.slug).join('-')}
              className="w-full"
            >
              <ShelfGroup studies={row} locale={locale} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
