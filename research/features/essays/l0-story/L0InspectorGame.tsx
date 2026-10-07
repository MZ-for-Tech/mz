'use client';

import { useEffect, useRef, useState } from 'react';

type Locale = 'en' | 'ar';

function syncArticleTheme(frame: HTMLIFrameElement) {
  const theme = document.querySelector<HTMLElement>('.tnh-site')?.dataset.theme || 'light';
  frame.contentDocument?.documentElement.setAttribute('data-theme', theme);
}

function copyArticleFonts(frame: HTMLIFrameElement) {
  const frameDocument = frame.contentDocument;
  if (!frameDocument) return;

  const fontRules: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }

    for (const rule of Array.from(rules)) {
      if (rule.type !== CSSRule.FONT_FACE_RULE) continue;
      const fontRule = rule as CSSFontFaceRule;
      const family = fontRule.style.getPropertyValue('font-family').replaceAll('"', '').replaceAll("'", '').trim();
      if (family !== 'Newsreader' && family !== 'Amiri') continue;

      const baseUrl = sheet.href || document.baseURI;
      fontRules.push(fontRule.cssText.replace(/url\((['"]?)([^'")]+)\1\)/g, (_match, _quote: string, url: string) => `url("${new URL(url, baseUrl).href}")`));
    }
  }

  if (!fontRules.length) return;
  const style = frameDocument.createElement('style');
  style.textContent = fontRules.join('\n');
  frameDocument.head.appendChild(style);
}

export default function L0InspectorGame({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(true);
  const [height, setHeight] = useState(820);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const site = document.querySelector<HTMLElement>('.tnh-site');
    if (!site) return;
    const observer = new MutationObserver(() => {
      if (frameRef.current) syncArticleTheme(frameRef.current);
    });
    observer.observe(site, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type !== 'l0-inspector-game-height' || typeof event.data.height !== 'number') return;
      setHeight(Math.max(680, Math.min(1400, Math.ceil(event.data.height))));
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const title = locale === 'ar' ? 'جولة مفتش التذاكر · ٦٠ ثانية' : 'Play the ticket inspector’s round · 60 seconds';

  return (
    <details className="l0-inspector-game" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{title}</summary>
      {open && (
        <iframe
          ref={frameRef}
          className="l0-inspector-game-frame"
          src={`/research/l0-story/inspector-ticket-game.html?lang=${locale}&embedded=1`}
          title={locale === 'ar' ? 'لعبة مفتش التذاكر التفاعلية' : 'Interactive ticket inspector game'}
          style={{ height: `${height}px` }}
          loading="lazy"
          onLoad={(event) => {
            copyArticleFonts(event.currentTarget);
            syncArticleTheme(event.currentTarget);
          }}
        />
      )}
    </details>
  );
}
