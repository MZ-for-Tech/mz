import type { Study } from '@/research/lib/types';
import Image from 'next/image';
import { getResearchArticlePath, getResearchSeriesPath } from '@/research/lib/paths';
import { readResearchContent } from '@/research/lib/content';
import { VisualizationEngine } from '@/research/features/engine/VisualizationEngine';
import ResearchEssayShell from '@/research/components/ResearchEssayShell';
import SVDStoryContent, { getSVDStoryContents } from '@/research/components/SVDStoryContent';
import L0StoryContent, { getL0StoryContents } from '@/research/components/L0StoryContent';
import SafeLatex from '@/research/components/SafeLatex';
import ResearchCodeBlock from '@/research/features/essays/shared/ResearchCodeBlock';
import ResearchTable from '@/research/components/ResearchTable';
import ResearchReferences from '@/research/components/ResearchReferences';
import ResearchFigure from '@/research/components/ResearchFigure';
import ResearchPaperGauge from '@/research/components/ResearchPaperGauge';
import VGG19Figure from '@/research/features/papers/vgg19/VGG19Figures';
import DarkVeilEssayVisual from '@/research/features/essays/darkveil/DarkVeilEssayVisual';
import DarkVeilFunctionSignature from '@/research/features/essays/darkveil/DarkVeilFunctionSignature';
import DarkVeilActivationComparison from '@/research/features/essays/darkveil/DarkVeilActivationComparison';
import DarkVeilRadialFunction from '@/research/features/essays/darkveil/DarkVeilRadialFunction';
import DarkVeilTimeDiagram from '@/research/features/essays/darkveil/DarkVeilTimeDiagram';
import { ChangingUncertaintyMixture, ForecastCalibration } from '@/research/features/essays/changing-uncertainty/ChangingUncertaintyVisuals';
import L1Visuals from '@/research/features/essays/l1-story/L1Visuals';
import { CUSTOM_STUDIES, hasArabicStudyMetadata } from '@/research/data/studies';
import { estimateReadingMinutes } from '@/research/lib/readingTime';

function inlineMarkdown(text: string) {
  const pieces = text.split(/(\$\$[\s\S]+?\$\$|\[[^\]]+\]\([^)\s]+\)|<https?:\/\/[^>]+>|\$[^$\n]+\$|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return pieces.map((piece, index) => {
    if (piece.startsWith('$') && piece.endsWith('$')) {
      return <SafeLatex key={index} content={piece} />;
    }
    const link = piece.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const isExternal = /^https?:\/\//.test(link[2]);
      if (!isExternal && (!link[2].startsWith('/') || link[2].startsWith('//'))) return piece;
      return (
        <a key={index} href={link[2]} {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})} className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
          {inlineMarkdown(link[1])}
        </a>
      );
    }
    const autolink = piece.match(/^<(https?:\/\/[^>]+)>$/);
    if (autolink) return <a key={index} href={autolink[1]} target="_blank" rel="noreferrer" className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">{autolink[1]}</a>;
    if (piece.startsWith('`') && piece.endsWith('`')) {
      return <code key={index}>{piece.slice(1, -1)}</code>;
    }
    if (piece.startsWith('**') && piece.endsWith('**')) {
      return <strong key={index}>{piece.slice(2, -2)}</strong>;
    }
    if (piece.startsWith('*') && piece.endsWith('*')) {
      return <em key={index}>{piece.slice(1, -1)}</em>;
    }
    return <span key={index}>{piece.replace(/\\([.!])/g, '$1')}</span>;
  });
}

function headingId(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseMarkdownTable(block: string) {
  const lines = block.trim().split('\n').map((line) => line.trim()).filter(Boolean);
  const markerIndex = lines.findIndex((line) => /^<!--\s*table:[a-z0-9-]+\s*-->$/.test(line));
  const marker = markerIndex >= 0 ? lines[markerIndex].match(/^<!--\s*table:([a-z0-9-]+)\s*-->$/)?.[1] : undefined;
  if (markerIndex >= 0) lines.splice(markerIndex, 1);
  if (lines.length < 2) return null;

  const parseCells = (line: string) => line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
  const headers = parseCells(lines[0]);
  const separators = parseCells(lines[1]);
  if (
    headers.length < 2
    || separators.length !== headers.length
    || !separators.every((cell) => /^:?-{3,}:?$/.test(cell))
  ) return null;

  const rows = lines.slice(2).map(parseCells);
  if (rows.some((row) => row.length !== headers.length)) return null;
  return { headers, rows, marker };
}

const essayVisuals = {
  'r2-inflation': 'R2InflationDemo',
  'double-goodhart': 'DoubleGoodhartFlow',
  benchmaxxing: 'BenchmaxxingLeaderboard',
} as const;

const paperVisuals = {
  'vgg19-architecture': {
    id: 'VGGArchitectureExplorer',
    number: 1,
    title: 'VGG19 architecture adapted for eight-class BloodMNIST+ classification',
  },
  'bloodmnist-dataset': {
    id: 'BloodMNISTExplorer',
    number: 2,
    title: 'BloodMNIST+ class counts and representative images',
  },
  'tensor-surgery': {
    id: 'TensorSurgeryVisualizer',
    number: 4,
    title: 'Illustrative tensor surgery: channel removal and resulting tensor dimensions',
  },
} as const;

const l1Figures = {
  'l1-norm-balls': '01_norm_balls',
  'l1-count-magnitude': '02_count_magnitude',
  'l1-constraint-geometry': '04_constraint_geometry',
  'l1-regularization-path': '05_regularization_path',
  'l1-regression-comparison': '06_regression_comparison',
  'l1-soft-threshold': '07_soft_threshold',
  'l1-selection-stability': '09_selection_stability',
  'l1-recovery-failure': '10_recovery_failure',
  'l1-total-variation': '11_total_variation',
  'l1-weight-patterns': '12_weight_patterns',
  'l1-sparse-storage': '13_sparse_storage',
  'l1-singular-shrinkage': '14_singular_shrinkage',
  'l1-convex-envelope': '03_convex_envelope',
  'l1-optimization-gap': '08_optimization_gap',
} as const;

export default function ResearchEssay({ study, locale = 'en' }: { study: Study; locale?: 'en' | 'ar' }) {
  const isArabic = locale === 'ar';
  const contentFile = isArabic ? study.content_file_ar : study.content_file;
  if (!contentFile) return null;

  const title = (isArabic && study.title_ar) || study.title;
  const tagline = (isArabic && study.tagline_ar) || study.tagline;
  const description = (isArabic && study.description_ar) || study.description || tagline;
  const keywords = (isArabic && study.keywords_ar) || study.keywords;
  const toc = (isArabic && study.toc_ar) || study.toc;
  const relatedArticles = study.slug === 'vgg19-bloodmnist-compression'
    ? ['a-deep-reading-of-l1', 'a-deep-reading-of-l0', 'a-deep-reading-of-svd']
      .map((slug) => CUSTOM_STUDIES.find((article) => article.slug === slug && article.published))
      .filter((article): article is Study => article !== undefined && (!isArabic || (article.arabic_translation_status !== 'draft' && hasArabicStudyMetadata(article))))
    : CUSTOM_STUDIES.filter((article) =>
        article.published
        && article.article_type === 'essay'
        && article.slug !== study.slug
        && (!isArabic || (article.arabic_translation_status !== 'draft' && hasArabicStudyMetadata(article))),
      ).slice(0, 3);
  const markdown = readResearchContent(contentFile);
  const equationDetails: { summary: string; body: string }[] = [];
  const markdownWithDetails = markdown.replace(/<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*([\s\S]*?)<\/details>/g, (_match, summary: string, body: string) => {
    const index = equationDetails.push({ summary: summary.trim(), body: body.trim() }) - 1;
    return `\n\n<!-- equation-detail:${index} -->\n\n`;
  });
  const blocks = markdownWithDetails.trim().split(/\n\s*\n/);
  const l1FigureNumbers = new Map<string, number>();
  for (const block of blocks) {
    const marker = block.trim().match(/^<!--\s*visual:([a-z0-9-]+)\s*-->$/);
    if (marker && marker[1] in l1Figures) l1FigureNumbers.set(marker[1], l1FigureNumbers.size + 1);
  }
  const referencesLabel = isArabic ? 'المراجع' : 'References';
  const referencesIndex = blocks.findIndex((block) => {
    const heading = block.trim();
    return heading === `**${referencesLabel}**`
      || (/^#{1,3}\s+/.test(heading) && heading.replace(/^#{1,3}\s+/, '') === referencesLabel);
  });
  const series = (isArabic && study.series_ar) || study.series || (isArabic && study.category_ar) || study.category;
  const contents = study.article_type === 'paper'
    ? blocks.flatMap((block) => {
        const heading = block.trim().match(/^#\s+(.+)$/);
        if (!heading) return [];
        const label = heading[1].trim();
        return [{ id: headingId(label), label }];
      })
    : study.essay_renderer === 'svd-story'
    ? getSVDStoryContents(locale)
    : study.essay_renderer === 'l0-story' ? getL0StoryContents(locale) : toc;
  const readingMinutes = estimateReadingMinutes(markdown, title);
  const canonicalUrl = `https://www.mzfortech.com${getResearchArticlePath(study, locale)}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': study.article_type === 'paper' ? 'ScholarlyArticle' : 'Article',
    headline: title,
    description,
    keywords,
    image: `https://www.mzfortech.com${study.hero_image || study.thumbnail}`,
    inLanguage: locale,
    author: study.authors?.map((author) => ({
      '@type': 'Person',
      name: isArabic ? author.name_ar || author.name : author.name,
    })),
    datePublished: study.published_at,
    dateModified: study.updated_at || study.published_at,
    ...(study.series ? { isPartOf: {
      '@type': 'CreativeWorkSeries',
      name: (isArabic && study.series_ar) || study.series,
      position: study.series_number,
      ...(study.series_slug ? { url: `https://www.mzfortech.com${getResearchSeriesPath(study.series_slug)}` } : {}),
    } } : {}),
    publisher: {
      '@type': 'Organization',
      '@id': 'https://www.mzfortech.com/#organization',
      name: 'MZ',
      url: 'https://www.mzfortech.com/',
    },
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };

  return (
    <ResearchEssayShell
      locale={locale}
      title={title}
      tagline={tagline}
      seriesLabel={series}
      seriesHref={study.series_slug && !(isArabic && study.arabic_translation_status === 'draft') ? getResearchSeriesPath(study.series_slug) : undefined}
      articleNumber={study.series_slug ? study.series_number || 1 : undefined}
      articleLabel={study.article_type === 'paper' ? (isArabic ? 'بحث' : 'Research paper') : undefined}
      articleType={study.article_type}
      publishedAt={study.published_at}
      authors={study.authors}
      readTimeMinutes={readingMinutes}
      keywords={keywords}
      heroImage={study.hero_image || study.thumbnail}
      heroImageAlt={study.hero_image_alt || study.thumbnail_alt || title}
      heroImageToneClass={study.essay_renderer === 'svd-story' ? 'research-image-paper-tone-svd' : undefined}
      contents={contents}
      translationNotice={isArabic && study.arabic_translation_status === 'draft' ? <p className="research-essay-translation-notice mb-6 border-y border-accent/25 py-3 font-latex text-base text-ink/65">مسودة ترجمة آلية للمراجعة.</p> : undefined}
      relatedArticles={relatedArticles}
      articleSchema={articleSchema}
    >
        {study.essay_renderer === 'svd-story' ? <SVDStoryContent study={study} locale={locale} /> : study.essay_renderer === 'l0-story' ? <L0StoryContent study={study} locale={locale} /> : <div className="latex-prose research-essay-prose">
          {blocks.map((block, index) => {
            if (referencesIndex >= 0 && index > referencesIndex) return null;
            if (index === 0 && block.trim() === `**${title}**`) return null;
            const codeBlock = block.match(/^```([\w+#.-]*)\n([\s\S]*?)\n```$/);
            if (codeBlock) {
              const language = codeBlock[1] || 'code';
              return <ResearchCodeBlock key={index} code={codeBlock[2]} language={language} locale={locale} sessionId={study.slug === 'a-deep-reading-of-l1' ? study.slug : undefined} />;
            }
            if (/^\$\$[\s\S]+\$\$$/.test(block)) {
              return <SafeLatex key={index} content={block} />;
            }
            const markdownImage = block.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
            if (markdownImage) {
              const [, alt, src] = markdownImage;
              const caption = alt.match(/^Figure\s+(\d+):\s*(.*)$/i);
              return (
                <ResearchFigure key={index} number={Number(caption?.[1] || 1)} caption={caption?.[2] || alt} locale={locale}>
                  {src.startsWith('/research/vgg19/figures/') ? <VGG19Figure src={src} /> : <Image src={src} alt={alt} width={1200} height={800} sizes="(min-width: 896px) 896px, calc(100vw - 40px)" className="h-auto w-full" />}
                </ResearchFigure>
              );
            }
            if (/^\*Figure\s+\d+\./i.test(block.trim()) && /^!\[[^\]]*\]\([^)]+\)$/.test(blocks[index - 1]?.trim() || '')) return null;
            const equationDetail = block.trim().match(/^<!--\s*equation-detail:(\d+)\s*-->$/);
            if (equationDetail) {
              const detail = equationDetails[Number(equationDetail[1])];
              if (!detail) return null;
              return (
                <details key={index} className="research-equation-detail">
                  <summary>{inlineMarkdown(detail.summary)}</summary>
                  <div>
                    {detail.body.split(/\n\s*\n/).map((detailBlock, detailIndex) => {
                      const detailHeading = detailBlock.match(/^####\s+(.+)$/);
                      return detailHeading
                        ? <h4 key={detailIndex}>{inlineMarkdown(detailHeading[1])}</h4>
                        : <p key={detailIndex}>{inlineMarkdown(detailBlock.replace(/\n/g, ' '))}</p>;
                    })}
                  </div>
                </details>
              );
            }
            const visualMarker = block.trim().match(/^<!--\s*visual:([a-z0-9-]+)\s*-->$/);
            if (visualMarker && visualMarker[1] in paperVisuals) {
              const figure = paperVisuals[visualMarker[1] as keyof typeof paperVisuals];
              return (
                <ResearchFigure key={index} number={figure.number} title={figure.title} locale={locale} dataInteractive={visualMarker[1]}>
                  <VisualizationEngine id={figure.id} locale={locale} />
                </ResearchFigure>
              );
            }
            if (visualMarker && visualMarker[1] in l1Figures) {
              return <L1Visuals key={index} figureId={l1Figures[visualMarker[1] as keyof typeof l1Figures]} figureNumber={l1FigureNumbers.get(visualMarker[1]) ?? 0} locale={locale} />;
            }
            if (visualMarker?.[1] === 'darkveil') {
              return <DarkVeilEssayVisual key={index} locale={locale} />;
            }
            if (visualMarker?.[1] === 'darkveil-activation-comparison') {
              return <DarkVeilActivationComparison key={index} locale={locale} />;
            }
            if (visualMarker?.[1] === 'darkveil-function-signature') {
              return <DarkVeilFunctionSignature key={index} locale={locale} />;
            }
            if (visualMarker?.[1] === 'darkveil-radial-function') {
              return <DarkVeilRadialFunction key={index} locale={locale} />;
            }
            if (visualMarker?.[1] === 'darkveil-time-diagram') {
              return <DarkVeilTimeDiagram key={index} locale={locale} />;
            }
            if (visualMarker?.[1] === 'changing-uncertainty-mixture') {
              return <ChangingUncertaintyMixture key={index} />;
            }
            if (visualMarker?.[1] === 'forecast-calibration') {
              return <ForecastCalibration key={index} />;
            }
            if (visualMarker && visualMarker[1] in essayVisuals) {
              const id = essayVisuals[visualMarker[1] as keyof typeof essayVisuals];
              return <VisualizationEngine key={index} id={id} locale={locale} />;
            }
            const table = parseMarkdownTable(block);
            if (table) {
              const isComparisonTable = table.marker === 'ann-cppn-comparison';
              return (
                <ResearchTable
                  key={index}
                  number={isComparisonTable ? 1 : undefined}
                  caption={isComparisonTable
                    ? (isArabic ? 'مقارنة بين الشبكات العصبية القياسية وشبكات CPPN' : 'How standard ANNs and CPPNs differ')
                    : undefined}
                  locale={locale}
                  headers={table.headers.map(inlineMarkdown)}
                  rows={table.rows.map((row) => row.map(inlineMarkdown))}
                />
              );
            }
            const quoteLines = block.split('\n');
            if (quoteLines.every((line) => /^>\s?/.test(line))) {
              return (
                <blockquote key={index} className="max-w-3xl font-latex leading-relaxed text-ink/75">
                  {quoteLines
                    .map((line) => line.replace(/^>\s?/, '').trim())
                    .filter(Boolean)
                    .map((line, quoteIndex) => <p key={quoteIndex} className={quoteIndex > 0 ? 'mt-4' : undefined}>{inlineMarkdown(line)}</p>)}
                </blockquote>
              );
            }
            const thesis = block.match(/^<!--\s*paragraph:thesis\s*-->\s*([\s\S]+)$/);
            if (thesis) {
              return (
                <p key={index} className="my-10 max-w-3xl font-latex text-2xl leading-snug text-ink md:text-3xl">
                  {inlineMarkdown(thesis[1].replace(/\n/g, ' '))}
                </p>
              );
            }
            const emphasis = block.match(/^<!--\s*paragraph:emphasis\s*-->\s*([\s\S]+)$/);
            if (emphasis) {
              return (
                <p key={index} className="research-essay-emphasis">
                  {inlineMarkdown(emphasis[1].replace(/\n/g, ' '))}
                </p>
              );
            }
            const heading = block.match(/^(#{1,3})\s+(.+)$/) || block.match(/^\*\*(.+)\*\*$/);
            if (heading) {
              const markdownHeading = heading.length === 3;
              const level = markdownHeading ? heading[1].length : 2;
              const label = (markdownHeading ? heading[2] : heading[1]).replace(/[.!?]+$/, '');
              const isReferencesHeading = label === referencesLabel;
              const headingIndex = blocks
                .slice(0, index)
                .filter((candidate) => /^\*\*.+\*\*$/.test(candidate.trim()) && candidate.trim() !== `**${title}**`).length;
              const id = study.article_type === 'paper' && markdownHeading
                ? headingId(label)
                : toc?.[headingIndex]?.id || headingId(label);
              if (isReferencesHeading) {
                const entries = blocks.slice(index + 1).filter(Boolean).map((entry) => inlineMarkdown(entry.replace(/\n/g, ' ')));
                return <ResearchReferences key={index} id={id} title={label} entries={entries} />;
              }
              const Heading = `h${markdownHeading ? Math.min(level + 1, 4) : 2}` as 'h2' | 'h3' | 'h4';
              return <Heading key={index} id={id}>{inlineMarkdown(label)}</Heading>;
            }
            return (
              <p key={index}>{inlineMarkdown(block.replace(/\n/g, ' '))}</p>
            );
          })}
        </div>}
        {study.article_type === 'paper' && study.paper_metrics && <ResearchPaperGauge {...study.paper_metrics} />}
    </ResearchEssayShell>
  );
}
