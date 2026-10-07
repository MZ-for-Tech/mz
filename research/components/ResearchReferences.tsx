import type { ReactNode } from 'react';

type Locale = 'en' | 'ar';

export default function ResearchReferences({
  id,
  title,
  entries,
  entryLocale = 'en',
}: {
  id: string;
  title: string;
  entries: ReactNode[];
  entryLocale?: Locale;
}) {
  return <>
    <h2 id={id} className="research-essay-references-heading">{title}</h2>
    {entries.map((entry, index) => (
      <p key={index} className="research-essay-reference-entry" dir="ltr" lang={entryLocale}>{entry}</p>
    ))}
  </>;
}
