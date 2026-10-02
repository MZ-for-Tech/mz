'use client';

import { useId, useState } from 'react';

export default function GlossaryTerm({ term, definition }: { term: string; definition: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <span className="svd-glossary-term">
    <button type="button" aria-expanded={open} aria-describedby={open ? id : undefined} onClick={() => setOpen(value => !value)} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
      {term}
    </button>
    {open && <span id={id} role="tooltip">{definition}</span>}
  </span>;
}
