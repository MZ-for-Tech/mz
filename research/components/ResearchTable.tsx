import type { ReactNode } from 'react';

type ResearchTableProps = {
  number?: number;
  caption?: string;
  locale?: 'en' | 'ar';
  headers: ReactNode[];
  rows: ReactNode[][];
};

export default function ResearchTable({
  number,
  caption,
  locale = 'en',
  headers,
  rows,
}: ResearchTableProps) {
  const isArabic = locale === 'ar';

  return (
    <figure className="research-table-figure" dir={isArabic ? 'rtl' : 'ltr'}>
      {number !== undefined || caption ? (
        <figcaption className="research-table-caption">
          {number !== undefined && (
            <span className="research-table-number">
              {isArabic ? `الجدول ${number}:` : `Table ${number}:`}
            </span>
          )}
          {caption && <span className="research-table-title"> {caption}</span>}
        </figcaption>
      ) : null}
      <div
        className="research-essay-table-scroll"
        role="region"
        aria-label={isArabic ? 'جدول قابل للتمرير' : 'Scrollable table'}
        tabIndex={0}
      >
        <table className="research-essay-table">
          <thead>
            <tr>{headers.map((cell, index) => <th key={index} scope="col">{cell}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => cellIndex === 0
                  ? <th key={cellIndex} scope="row">{cell}</th>
                  : <td key={cellIndex}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
