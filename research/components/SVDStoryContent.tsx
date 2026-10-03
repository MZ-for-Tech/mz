import katex from 'katex';
import type { ReactNode } from 'react';
import type { Study } from '@/research/lib/types';
import { readResearchContent } from '@/research/lib/content';
import SVDInteractive from '@/research/features/essays/svd-story/SVDInteractive';
import GlossaryTerm from '@/research/features/essays/svd-story/GlossaryTerm';
import ResearchCodeBlock from '@/research/features/essays/shared/ResearchCodeBlock';

type Term = { label: string; aliases?: string[]; short: string; visual?: Record<string, unknown> };
type Interaction = { id: string; type: string; title: string; instruction?: string; data: Record<string, unknown> };
type Lesson = { glossary: Record<string, Term>; interactives: Interaction[]; ui?: Record<string, string> };
const sectionNames = {
  en: [
    ['svd-opening', 'The Summit'], ['svd-section-1', 'From composition to decomposition'], ['svd-section-8', 'The existence proof'],
    ['svd-section-18', 'From product to layers'], ['svd-section-26', 'PCA and projection'],
    ['svd-section-31', 'SVD in images'], ['svd-section-33', 'Numerical exploration'],
    ['svd-section-37', 'The whole map'], ['svd-section-40', 'From the summit'], ['svd-section-41', 'References'],
  ],
  ar: [
    ['svd-opening', 'قمة الجبل'], ['svd-section-1', 'من التجميع إلى التفكيك'], ['svd-section-8', 'برهان الوجود'],
    ['svd-section-14', 'من حاصل الضرب إلى الطبقات'], ['svd-section-19', 'تحليل المركبات الرئيسية'],
    ['svd-section-20', 'تحليل الصور'], ['svd-section-22', 'استكشاف عددي'],
    ['svd-section-25', 'الخريطة كاملة'], ['svd-section-27', 'من القمة'], ['svd-section-28', 'المراجع'],
  ],
} as const;

export function getSVDStoryContents(locale: 'en' | 'ar') {
  return sectionNames[locale].map(([id, label]) => ({ id, label }));
}

function mathHtml(source: string, display = false) {
  try { return katex.renderToString(source, { displayMode: display, throwOnError: false, trust: false }); }
  catch { return source; }
}

function displayMath(source: string, key: string): ReactNode {
  const boxedText = source.trim().match(/^\\boxed\{\s*\\text\{([^{}]*)\}\s*\}$/);
  if (boxedText) return <div key={key} className="svd-question-box">{boxedText[1]}</div>;
  return <div key={key} className="svd-display-math" dir="ltr" dangerouslySetInnerHTML={{ __html: mathHtml(source, true) }} />;
}

function inline(text: string, glossary: Record<string, Term>, seen: Set<string>, keyPrefix: string): ReactNode[] {
  const syntax = /(\`[^`]+\`|\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const out: ReactNode[] = [];
  const addPlain = (plain: string, baseKey: string) => {
    let rest = plain; let n = 0;
    const aliases = Object.entries(glossary).flatMap(([id, term]) => [term.label, ...(term.aliases || [])].map(alias => ({ id, alias, term }))).filter(x => x.alias.length > 1).sort((a, b) => b.alias.length - a.alias.length);
    while (rest) {
      let hit: { index: number; item: typeof aliases[number]; length: number } | null = null;
      for (const item of aliases) {
        if (seen.has(item.id)) continue;
        const index = rest.toLocaleLowerCase().indexOf(item.alias.toLocaleLowerCase());
        if (index >= 0 && (!hit || index < hit.index || (index === hit.index && item.alias.length > hit.length))) hit = { index, item, length: item.alias.length };
      }
      if (!hit) { out.push(rest); break; }
      if (hit.index) out.push(rest.slice(0, hit.index));
      const alias = rest.slice(hit.index, hit.index + hit.length); seen.add(hit.item.id);
      out.push(<GlossaryTerm key={`${baseKey}-term-${n++}`} term={alias} definition={hit.item.term.short} />);
      rest = rest.slice(hit.index + hit.length);
    }
  };
  let last = 0; let match: RegExpExecArray | null; let i = 0;
  while ((match = syntax.exec(text))) {
    if (match.index > last) addPlain(text.slice(last, match.index), `${keyPrefix}-${i++}`);
    const token = match[0];
    if (token.startsWith('`')) out.push(<code key={`${keyPrefix}-code-${i++}`}>{token.slice(1, -1)}</code>);
    else if (token.startsWith('$$')) out.push(<span key={`${keyPrefix}-math-${i++}`} className="svd-math" dir="ltr" dangerouslySetInnerHTML={{ __html: mathHtml(token.slice(2, -2), true) }} />);
    else if (token.startsWith('$')) out.push(<span key={`${keyPrefix}-math-${i++}`} className="svd-math" dir="ltr" dangerouslySetInnerHTML={{ __html: mathHtml(token.slice(1, -1)) }} />);
    else if (token.startsWith('\\(') || token.startsWith('\\[')) { const display = token.startsWith('\\['); out.push(<span key={`${keyPrefix}-math-${i++}`} className="svd-math" dir="ltr" dangerouslySetInnerHTML={{ __html: mathHtml(token.slice(2, -2), display) }} />); }
    else if (token.startsWith('[')) { const m = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!; out.push(<a key={`${keyPrefix}-link-${i++}`} href={m[2]} target="_blank" rel="noreferrer">{m[1]}</a>); }
    else if (token.startsWith('**')) out.push(<strong key={`${keyPrefix}-bold-${i++}`}>{token.slice(2, -2)}</strong>);
    else out.push(<em key={`${keyPrefix}-italic-${i++}`}>{token.slice(1, -1)}</em>);
    last = syntax.lastIndex;
  }
  if (last < text.length) addPlain(text.slice(last), `${keyPrefix}-tail`);
  return out;
}

function renderMarkdown(markdown: string, locale: 'en' | 'ar', lesson: Lesson) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const result: ReactNode[] = []; const seen = new Set<string>();
  let paragraph: string[] = []; let list: string[] = []; let listType: 'ul' | 'ol' = 'ul'; let code: string[] = []; let language = ''; let inCode = false; let heading = 0; let inMath = false; let math: string[] = []; let inReferences = false;
  const flushParagraph = () => { if (paragraph.length) { result.push(<p key={`p-${result.length}`} className={inReferences ? 'research-essay-reference-entry' : undefined} dir={inReferences ? 'ltr' : undefined} lang={inReferences ? 'en' : undefined}>{inline(paragraph.join(' '), lesson.glossary, seen, `p-${result.length}`)}</p>); paragraph = []; } };
  const flushList = () => { if (list.length) { const ListTag = listType; result.push(<ListTag key={`list-${result.length}`}>{list.map((line, i) => <li key={i}>{inline(line.replace(/^\s*(?:[-*+]\s+|\d+\.\s+)/, ''), lesson.glossary, seen, `li-${result.length}-${i}`)}</li>)}</ListTag>); list = []; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('```')) {
      flushParagraph(); flushList();
      if (inCode) {
        result.push(<ResearchCodeBlock key={`code-${result.length}`} code={code.join('\n')} language={language || 'code'} locale={locale} />);
        code = []; inCode = false;
      } else { inCode = true; language = line.slice(3).trim(); }
      continue;
    }
    if (inCode) { code.push(line); continue; }
    if (line.trim() === '$$' || line.trim() === '\\[') { flushParagraph(); flushList(); if (inMath) { result.push(displayMath(math.join('\n'), `math-${result.length}`)); math = []; inMath = false; } else inMath = true; continue; }
    if (inMath) { if (line.trim() === '\\]') { result.push(displayMath(math.join('\n'), `math-${result.length}`)); math = []; inMath = false; } else math.push(line); continue; }
    const interactive = line.match(/^\[\[interactive:([a-z0-9-]+)\]\]$/);
    if (interactive) { flushParagraph(); flushList(); const figureNumber = lesson.interactives.findIndex(x => x.id === interactive[1]) + 1; const item = lesson.interactives[figureNumber - 1]; if (item) result.push(<SVDInteractive key={`visual-${item.id}`} item={item} locale={locale} ui={lesson.ui || {}} figureNumber={figureNumber} />); else result.push(<p key={`missing-${interactive[1]}`} className="text-semantic-error">Missing interaction: {interactive[1]}</p>); continue; }
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph(); flushList();
      if (headingMatch[1].length === 1 && headingMatch[2] === (locale === 'ar' ? 'قراءة معمقة في SVD' : 'A Deep Reading of SVD')) continue;
      if (headingMatch[1].length === 1) { heading++; const id = `svd-section-${heading}`; inReferences = /^(?:references|المراجع)$/i.test(headingMatch[2]); result.push(<h2 id={id} key={id} className={inReferences ? 'research-essay-references-heading' : undefined}>{inline(headingMatch[2], lesson.glossary, seen, id)}</h2>); }
      else if (headingMatch[1].length === 2 && heading === 0) result.push(<h2 id="svd-opening" key="svd-opening">{inline(headingMatch[2], lesson.glossary, seen, 'svd-opening')}</h2>);
      else if (headingMatch[1].length === 2) result.push(<h3 key={`h3-${result.length}`}>{inline(headingMatch[2], lesson.glossary, seen, `h3-${result.length}`)}</h3>);
      else result.push(<h4 key={`h4-${result.length}`}>{inline(headingMatch[2], lesson.glossary, seen, `h4-${result.length}`)}</h4>);
      continue;
    }
    const boldHeading = line.match(/^\*\*(.+)\*\*$/);
    if (boldHeading) { flushParagraph(); flushList(); result.push(<h3 key={`bold-heading-${result.length}`}>{inline(boldHeading[1], lesson.glossary, seen, `bold-heading-${result.length}`)}</h3>); continue; }
    if (/^\s*(?:[-*+]\s+|\d+\.\s+)/.test(line)) { flushParagraph(); const kind = /^\s*\d+\.\s+/.test(line) ? 'ol' : 'ul'; if (list.length && listType !== kind) flushList(); listType = kind; list.push(line); continue; }
    if (!line.trim()) {
      flushParagraph();
      if (list.length) {
        const nextLine = lines.slice(i + 1).find(candidate => candidate.trim());
        const nextType = nextLine && /^\s*\d+\.\s+/.test(nextLine) ? 'ol' : nextLine && /^\s*[-*+]\s+/.test(nextLine) ? 'ul' : null;
        if (nextType === listType) continue;
      }
      flushList();
      continue;
    }
    const quote = line.match(/^>\s?(.*)$/); if (quote) { flushParagraph(); flushList(); result.push(<blockquote key={`quote-${result.length}`}>{inline(quote[1], lesson.glossary, seen, `quote-${result.length}`)}</blockquote>); continue; }
    if (/^---+$/.test(line.trim())) { flushParagraph(); flushList(); result.push(<hr key={`hr-${result.length}`} />); continue; }
    paragraph.push(line.trim());
  }
  flushParagraph(); flushList();
  return result;
}

export default function SVDStoryContent({ study, locale }: { study: Study; locale: 'en' | 'ar' }) {
  const arabic = locale === 'ar'; const contentFile = arabic ? study.content_file_ar : study.content_file;
  if (!contentFile) return null;
  const report = readResearchContent(contentFile);
  const lessonPath = `svd-story/interactive/${arabic ? 'ar' : 'en'}.json`;
  const lesson = JSON.parse(readResearchContent(lessonPath)) as Lesson;
  return <div className="latex-prose research-essay-prose svd-article-body">{renderMarkdown(report, locale, lesson)}</div>;
}
