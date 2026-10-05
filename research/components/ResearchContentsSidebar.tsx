'use client';

import { useId, useRef, useState } from 'react';

type ContentsItem = { id: string; label: string };

export default function ResearchContentsSidebar({
  items,
  locale = 'en',
}: {
  items: ContentsItem[];
  locale?: 'en' | 'ar';
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || focused || pinned;
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isArabic = locale === 'ar';
  const title = isArabic ? 'في هذا المقال' : 'In this essay';
  const tabTitle = isArabic ? 'المحتويات' : 'Contents';
  const label = isArabic ? 'جدول المحتويات' : 'Table of contents';

  if (!items.length) return null;

  const links = () => items.map((item) => (
    <a
      key={item.id}
      href={`#${item.id}`}
      onClick={() => {
        setHovered(false);
        setFocused(false);
        setPinned(false);
      }}
      className="block rounded-sm px-3 py-2 font-latex text-base leading-snug text-ink/75 transition-colors hover:bg-ink/[0.05] hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      {item.label}
    </a>
  ));

  return (
    <>
      <details className="mx-auto mb-8 max-w-4xl border-y border-ink/15 py-3 text-ink md:hidden">
        <summary className="cursor-pointer list-none font-latex text-lg text-ink/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
          {title}
        </summary>
        <nav aria-label={label} className="mt-2 grid gap-1">
          {links()}
        </nav>
      </details>

      <aside
        className="research-contents-sidebar fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 items-stretch md:flex"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setPinned(false);
            setFocused(false);
            setHovered(false);
            triggerRef.current?.focus();
          }
        }}
      >
        <nav
          id={panelId}
          aria-label={label}
          hidden={!open}
          className="max-h-[65vh] w-64 overflow-y-auto border border-r-0 border-ink/15 bg-paper p-2"
        >
          <p className="px-3 pb-2 pt-1 font-latex text-lg italic text-ink/55">{title}</p>
          {links()}
        </nav>
        <button
          ref={triggerRef}
          type="button"
          aria-label={label}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setPinned((current) => !current)}
          onFocus={() => setFocused(true)}
          className="flex h-36 w-9 items-center justify-center border border-ink/20 bg-paper text-ink/60 transition-colors hover:text-accent focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span className="font-latex text-base italic" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            {tabTitle}
          </span>
        </button>
      </aside>
    </>
  );
}
