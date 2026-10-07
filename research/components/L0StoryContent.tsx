import katex from 'katex';
import type { ReactNode } from 'react';
import type { Study } from '@/research/lib/types';
import { readResearchContent } from '@/research/lib/content';
import ResearchReferences from '@/research/components/ResearchReferences';
import ResearchCodeBlock from '@/research/features/essays/shared/ResearchCodeBlock';
import { VisualizationEngine } from '@/research/features/engine/VisualizationEngine';
import L0InspectorGame from '@/research/features/essays/l0-story/L0InspectorGame';

type Locale = 'en' | 'ar';

function cleanHeading(value: string) {
  return value.replace(/\*\*/g, '').trim();
}

function isMajorSection(value: string, locale: Locale) {
  const heading = cleanHeading(value).toLowerCase();
  const sections = locale === 'en'
    ? [
        'the conscientious inspector', 'neural-network compression', 'walking down the hill', 'the gate',
        'counting gates on average', 'the objective', 'continuous relaxation', 'reparameterizing randomness',
        'hard-concrete — louizos', 'group sparsity', 'yamada et al. — gaussian stochastic gates',
        'hard-concrete and gaussian side by side', 'back to the inspector',
      ]
    : [
        'المفتش الأمين', 'ضغط الشبكات العصبية', 'النزول من التل', 'البوابة', 'العدد المتوقع للبوابات النشطة',
        'الهدف', 'الاسترخاء المستمر', 'إعادة صياغة العشوائية', 'hard-concrete — بوابة لويزو',
        'group sparsity', 'yamada et al. — gaussian stochastic gates', 'hard-concrete و gaussian جنبًا إلى جنب',
        'عودة إلى المفتش',
      ];
  return sections.some((section) => heading.includes(section));
}

function normalizeArticle(markdown: string, locale: Locale) {
  if (locale === 'en') {
    let articleChapterStarted = false;
    const normalized = markdown.split('\n').map((line) => {
      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (!heading || /^#\s+A Deep Reading of/i.test(line)) return line;
      if (heading[1].length === 1) {
        articleChapterStarted = true;
        return `## ${heading[2]}`;
      }
      const label = heading[2].replace(/^Step 7\s*[—–-]\s*/i, '');
      if (articleChapterStarted) return `${'#'.repeat(heading[1].length + 1)} ${label}`;
      return `${heading[1]} ${label}`;
    });
    return normalized.map((line) => {
      const heading = line.match(/^(#{2})\s+(.+)$/);
      return heading && !isMajorSection(heading[2], locale) ? `### ${heading[2]}` : line;
    }).join('\n');
  }

  const sectionHeadings = new Map([
    ['المفتش الأمين', 'المفتش الأمين'],
    ['الL 0 و ضغط الشبكات العصبية', 'الL 0 و ضغط الشبكات العصبية'],
    ['النزول من التل', 'النزول من التل'],
    ['البوابة', 'البوابة'],
  ]);

  const normalized = markdown
    .replace(/\\?&#xA;/gi, '\n')
    .replace(/&#xA0;|&nbsp;/gi, '\u00a0')
    .replace(/&#x20;/gi, ' ')
    .replace(/(^|\n)(?=\*\*حسنا الخطوة القادمة أن نصل إلي التوقع)/g, '$1# العدد المتوقع للبوابات النشطة\n')
    .replace(/(?<!\\)\\(?=\s*(?:\r?\n|$))/g, '')
    .split('\n')
    .map((line) => {
      const unquotedLine = line
        .replace(/^(\s*)>\s?/, '$1')
        .replace(/^(\s*)\*\*(.+)\*\*(\\?)\s*$/, '$1$2$3');
      const plain = unquotedLine.trim().replace(/^\*\*(.*?)\*\*$/, '$1').trim();
      if (/^\*\*\s*\*\*$/.test(unquotedLine.trim())) return '';
      const quoted = line.trim().replace(/^>\s*/, '').replace(/^\*\*(.*?)\*\*$/, '$1').trim();
      if (quoted === 'Gaussian أفضل دائمًا من Hard-Concrete.') return line;
      if (quoted === 'الهدف') return '# الهدف';
      if (quoted.startsWith('كيف تتعلم الشبكة العصبية')) return `## ${quoted}`;
      if (/^الخطوة\s*7\s*[—–-]\s*الاسترخاء المستمر/.test(quoted)) return `# ${quoted.replace(/^الخطوة\s*7\s*[—–-]\s*/, '')}`;
      const section = sectionHeadings.get(plain);
      return section ? `# ${section}` : unquotedLine;
    });

  const leveled = normalized.map((line) => {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (!heading) return line;
    const label = heading[2].replace(/^الخطوة\s*7\s*[—–-]\s*/, '');
    return `${'#'.repeat(heading[1].length + 1)} ${label}`;
  });
  return leveled.map((line) => {
    const heading = line.match(/^(#{2})\s+(.+)$/);
    return heading && !isMajorSection(heading[2], locale) ? `### ${heading[2]}` : line;
  }).join('\n').replace(/\n{3,}/g, '\n\n');
}

function headingId(index: number) {
  return `l0-section-${index}`;
}

function math(source: string, display = false) {
  try { return katex.renderToString(source, { displayMode: display, throwOnError: false, trust: false }); }
  catch { return source; }
}

function displayMath(source: string, key: string, locale: Locale): ReactNode {
  const boxedText = source.trim().match(/^\\boxed\{\s*\\text\{([^{}\\]*)\}\s*\}$/);
  if (boxedText) {
    return (
      <div key={key} className="l0-question-box" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {boxedText[1]}
      </div>
    );
  }
  return <div key={key} className="l0-display-math" dir="ltr" dangerouslySetInnerHTML={{ __html: math(source, true) }} />;
}

function inlineMarkdown(value: string, keyPrefix: string): ReactNode[] {
  const syntax = /(\[[^\]]+\]\(https?:\/\/[^)\s]+\)|\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+\$|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_\n]+_)/g;
  const result: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = syntax.exec(value))) {
    if (match.index > last) result.push(value.slice(last, match.index));
    const token = match[0];
    const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (link) result.push(<a key={`${keyPrefix}-${index++}`} href={link[2]} target="_blank" rel="noreferrer">{inlineMarkdown(link[1], `${keyPrefix}-link`)}</a>);
    else if (token.startsWith('$$')) result.push(<span key={`${keyPrefix}-${index++}`} className="l0-display-math" dir="ltr" dangerouslySetInnerHTML={{ __html: math(token.slice(2, -2), true) }} />);
    else if (token.startsWith('\\[')) result.push(<span key={`${keyPrefix}-${index++}`} className="l0-display-math" dir="ltr" dangerouslySetInnerHTML={{ __html: math(token.slice(2, -2), true) }} />);
    else if (token.startsWith('\\(')) result.push(<span key={`${keyPrefix}-${index++}`} className="l0-inline-math" dir="ltr" dangerouslySetInnerHTML={{ __html: math(token.slice(2, -2)) }} />);
    else if (token.startsWith('$')) result.push(<span key={`${keyPrefix}-${index++}`} className="l0-inline-math" dir="ltr" dangerouslySetInnerHTML={{ __html: math(token.slice(1, -1), token.startsWith('$$')) }} />);
    else if (token.startsWith('`')) result.push(<code key={`${keyPrefix}-${index++}`}>{token.slice(1, -1)}</code>);
    else if (token.startsWith('**')) result.push(<strong key={`${keyPrefix}-${index++}`}>{inlineMarkdown(token.slice(2, -2), `${keyPrefix}-bold`)}</strong>);
    else if (token.startsWith('_')) result.push(<em key={`${keyPrefix}-${index++}`}>{inlineMarkdown(token.slice(1, -1), `${keyPrefix}-italic`)}</em>);
    else result.push(<em key={`${keyPrefix}-${index++}`}>{inlineMarkdown(token.slice(1, -1), `${keyPrefix}-italic`)}</em>);
    last = syntax.lastIndex;
  }
  if (last < value.length) result.push(value.slice(last));
  return result;
}

function figureForHeading(heading: string, locale: Locale) {
  const normalized = heading.toLowerCase();
  if (locale === 'en') {
    if (normalized.includes('conscientious inspector')) return 'l0-versus-l1';
    if (normalized.includes('continuous relaxation')) return 'continuous-clipping';
    if (normalized.includes('hard-concrete — louizos')) return 'hard-concrete-path';
    if (normalized.includes('activity probability for a gaussian gate')) return 'gaussian-activity-probability';
    if (normalized.includes('group sparsity')) return 'structured-channel-pruning';
  } else {
    if (normalized.includes('المفتش الأمين')) return 'l0-versus-l1';
    if (normalized.includes('الاسترخاء المستمر')) return 'continuous-clipping';
    if (normalized.includes('hard-concrete — بوابة لويزو')) return 'hard-concrete-path';
    if (normalized.includes('احتمال النشاط في gaussian gate')) return 'gaussian-activity-probability';
    if (normalized.includes('group sparsity')) return 'structured-channel-pruning';
  }
  return null;
}

function headings(markdown: string) {
  return markdown.split('\n')
    .map((line) => line.match(/^##\s+(.+)$/)?.[1])
    .filter((value): value is string => Boolean(value))
    .filter((value) => !/^a deep reading of/i.test(cleanHeading(value)) && !/^قراءة معمقة في/i.test(cleanHeading(value)));
}

export function getL0StoryContents(locale: Locale) {
  const file = locale === 'ar' ? 'l0-story/a-deep-reading-of-l0-ar.md' : 'l0-story/a-deep-reading-of-l0.md';
  const markdown = normalizeArticle(readResearchContent(file), locale);
  return [
    ...headings(markdown).map((heading, index) => ({ id: headingId(index), label: cleanHeading(heading) })),
    { id: 'l0-references', label: locale === 'ar' ? 'المراجع' : 'References' },
  ];
}

export default function L0StoryContent({ study, locale }: { study: Study; locale: Locale }) {
  const contentFile = locale === 'ar' ? study.content_file_ar : study.content_file;
  if (!contentFile) return null;
  const handoffHeading = locale === 'ar' ? '## الملفات التفاعلية وطريقة استخدامها' : '## Interactive files and how to use them';
  const markdown = normalizeArticle(readResearchContent(contentFile), locale).replace(/\r/g, '').split(handoffHeading)[0];
  const lines = markdown.split('\n');
  const result: ReactNode[] = [];
  let sectionIndex = -1;
  let paragraph: string[] = [];
  let list: string[] = [];
  let mathBlock: string[] | null = null;
  let code: string[] | null = null;
  let codeLanguage = 'code';
  let inReferences = false;
  let referenceTitle = '';
  const referenceEntries: ReactNode[] = [];
  let listType: 'ul' | 'ol' = 'ul';
  let firstContent = true;
  let introText = true;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(' ').trim();
    if (firstContent && (/^\*\*A Deep Reading of/i.test(text) || /^\*\*قراءة معمقة في/i.test(text))) {
      firstContent = false;
      paragraph = [];
      return;
    }
    firstContent = false;
    let renderedText = introText ? text.replace(/\*\*/g, '') : text;
    if (locale === 'ar') renderedText = renderedText.replace(/^\*\*([\s\S]+)\*\*$/, '$1');
    const standaloneMath = renderedText.match(/^\\\(([\s\S]+?)\\\)$/)
      || renderedText.match(/^\$([\s\S]+)\$$/);
    if (standaloneMath) {
      result.push(displayMath(standaloneMath[1], `math-${result.length}`, locale));
    } else {
      result.push(<p key={`p-${result.length}`}>{inlineMarkdown(renderedText, `p-${result.length}`)}</p>);
    }
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    const Tag = listType;
    result.push(<Tag key={`list-${result.length}`}>{list.map((item, index) => <li key={index}>{inlineMarkdown(item.replace(/^\s*(?:[-*+]\s+|\d+\.\s+)/, ''), `li-${result.length}-${index}`)}</li>)}</Tag>);
    list = [];
  };
  const flushText = () => { flushParagraph(); flushList(); };

  for (const line of lines) {
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (inReferences && !heading) {
      const entry = line.trim().replace(/^[-*+]\s+/, '');
      if (entry && !/^---+$/.test(entry)) referenceEntries.push(inlineMarkdown(entry, `reference-${referenceEntries.length}`));
      continue;
    }
    if (heading) {
      flushText();
      const label = cleanHeading(heading[2]);
      if (/^(?:references|sources behind this section|المراجع|المصادر التي يقوم عليها هذا الجزء)$/i.test(label)) {
        inReferences = true;
        referenceTitle = locale === 'ar' ? 'المراجع' : 'References';
        continue;
      }
      const isTitle = firstContent && (/^A Deep Reading of/i.test(label) || /^قراءة معمقة في/i.test(label));
      if (isTitle) { firstContent = false; continue; }
      const isOpeningInspector = locale === 'ar'
        ? label.includes('المفتش الأمين')
        : label.toLowerCase().includes('the conscientious inspector');
      if (isOpeningInspector) result.push(<L0InspectorGame key="l0-inspector-game" locale={locale} />);
      const isSection = heading[1].length === 2;
      if (isSection) {
        introText = false;
        sectionIndex += 1;
      }
      const id = isSection ? headingId(sectionIndex) : undefined;
      const Tag = heading[1].length === 2 ? 'h2' : heading[1].length === 3 ? 'h3' : 'h4';
      result.push(<Tag key={`heading-${result.length}`} id={id}>{inlineMarkdown(label, `heading-${result.length}`)}</Tag>);
      const figure = figureForHeading(label, locale);
      if (figure) result.push(<VisualizationEngine key={`figure-${figure}`} id="L0Visuals" config={{ figure }} locale={locale} />);
      continue;
    }
    if (line.startsWith('```')) {
      flushText();
      if (code) {
        const source = code.join('\n');
        result.push(<ResearchCodeBlock key={`code-${result.length}`} code={source} language={codeLanguage} locale={locale} />);
        code = null;
      } else {
        code = [];
        codeLanguage = line.slice(3).trim() || 'code';
      }
      continue;
    }
    if (code) { code.push(line); continue; }
    if (line.trim() === '\\[' || line.trim() === '$$') {
      flushText();
      if (mathBlock) {
        result.push(displayMath(mathBlock.join('\n'), `math-${result.length}`, locale));
        mathBlock = null;
      } else mathBlock = [];
      continue;
    }
    if (mathBlock) {
      if (line.trim() === '\\]' || line.trim() === '$$') {
        result.push(displayMath(mathBlock.join('\n'), `math-${result.length}`, locale));
        mathBlock = null;
      } else mathBlock.push(line);
      continue;
    }
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushText();
      const quoteText = locale === 'ar' ? quote[1].replace(/^\*\*([\s\S]+)\*\*$/, '$1') : quote[1];
      result.push(<blockquote key={`quote-${result.length}`}>{inlineMarkdown(quoteText, `quote-${result.length}`)}</blockquote>);
      continue;
    }
    if (/^\s*(?:[-*+]\s+|\d+\.\s+)/.test(line)) {
      flushParagraph();
      const nextType = /^\s*\d+\.\s+/.test(line) ? 'ol' : 'ul';
      if (list.length && listType !== nextType) flushList();
      listType = nextType;
      list.push(line);
      continue;
    }
    if (!line.trim()) { flushText(); continue; }
    if (/^---+$/.test(line.trim())) { flushText(); result.push(<hr key={`hr-${result.length}`} />); continue; }
    paragraph.push(line.trim());
  }
  flushText();
  if (referenceTitle) result.push(<ResearchReferences key="l0-references" id="l0-references" title={referenceTitle} entries={referenceEntries} entryLocale={locale} />);
  return <div className="latex-prose research-essay-prose l0-article-body">{result}</div>;
}
