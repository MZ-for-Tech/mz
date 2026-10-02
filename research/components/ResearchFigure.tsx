import type { ReactNode } from 'react';

type ResearchFigureProps = {
  number: number;
  title?: string;
  caption?: string;
  locale?: 'en' | 'ar';
  children: ReactNode;
  className?: string;
  dataInteractive?: string;
};

export default function ResearchFigure({
  number,
  title,
  caption,
  locale = 'en',
  children,
  className,
  dataInteractive,
}: ResearchFigureProps) {
  const isArabic = locale === 'ar';

  return (
    <figure className={`research-figure${className ? ` ${className}` : ''}`} dir={isArabic ? 'rtl' : 'ltr'} data-interactive={dataInteractive}>
      {children}
      <figcaption className="research-figure-caption">
        <p>
          <span className="research-figure-number">{isArabic ? `الشكل ${number}:` : `Figure ${number}:`}</span>
          {title && <> <strong className="research-figure-title">{title}</strong></>}
          {caption && <>{title ? '. ' : ' '}{caption}</>}
        </p>
      </figcaption>
    </figure>
  );
}

export function ResearchFigurePanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`research-figure-panel${className ? ` ${className}` : ''}`}>{children}</div>;
}
