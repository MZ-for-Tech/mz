import type { ReactNode } from 'react';

export default function AnalysisSection({
  title,
  children,
  description,
  id,
}: {
  title: string;
  children: ReactNode;
  description?: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mb-24 last:mb-0">
      <div className="mb-8">
        <h2 className="mb-4 font-latex text-4xl font-bold text-ink">{title}</h2>
        {description && <div className="max-w-2xl leading-relaxed">{description}</div>}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
