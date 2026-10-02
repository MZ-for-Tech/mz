'use client';

import { Check, ChevronDown, ChevronUp, Copy, LoaderCircle, Play, Upload } from 'lucide-react';
import Image from 'next/image';
import { useId, useState } from 'react';
import { runResearchPython, type ResearchPythonFile, type ResearchPythonOutput } from '@/research/lib/researchPyodide';

type TokenKind = 'keyword' | 'builtin' | 'string' | 'comment' | 'number' | 'decorator' | 'plain';
type Token = { kind: TokenKind; value: string };

const keywords = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del',
  'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import',
  'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True',
  'try', 'while', 'with', 'yield', 'None',
]);

const builtins = new Set([
  'abs', 'all', 'any', 'bool', 'dict', 'enumerate', 'float', 'int', 'len', 'list',
  'map', 'max', 'min', 'open', 'print', 'range', 'round', 'set', 'str', 'sum', 'tuple',
  'zip', 'np', 'pd', 'plt', 'sns', 'torch', 'nn', 'optim', 'Image', 'DataLoader',
]);

function tokenizePython(line: string): Token[] {
  const tokens: Token[] = [];
  let rest = line;

  while (rest.length) {
    if (rest[0] === '#') {
      tokens.push({ kind: 'comment', value: rest });
      break;
    }

    const stringMatch = rest.match(/^(?:[rubfRUBF]{1,2})?(?:""".*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/);
    if (stringMatch) {
      tokens.push({ kind: 'string', value: stringMatch[0] });
      rest = rest.slice(stringMatch[0].length);
      continue;
    }

    const decoratorMatch = rest.match(/^@\w+/);
    if (decoratorMatch) {
      tokens.push({ kind: 'decorator', value: decoratorMatch[0] });
      rest = rest.slice(decoratorMatch[0].length);
      continue;
    }

    const numberMatch = rest.match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
    if (numberMatch) {
      tokens.push({ kind: 'number', value: numberMatch[0] });
      rest = rest.slice(numberMatch[0].length);
      continue;
    }

    const wordMatch = rest.match(/^[A-Za-z_]\w*/);
    if (wordMatch) {
      const word = wordMatch[0];
      tokens.push({ kind: keywords.has(word) ? 'keyword' : builtins.has(word) ? 'builtin' : 'plain', value: word });
      rest = rest.slice(word.length);
      continue;
    }

    tokens.push({ kind: 'plain', value: rest[0] });
    rest = rest.slice(1);
  }

  return tokens;
}

export default function ResearchCodeBlock({ code, language = 'python', locale = 'en', sessionNote = false }: { code: string; language?: string; locale?: 'en' | 'ar'; sessionNote?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [codeExpanded, setCodeExpanded] = useState(false);
  const [output, setOutput] = useState<ResearchPythonOutput[] | null>(null);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<ResearchPythonFile | undefined>();
  const [uploadedFileName, setUploadedFileName] = useState('');
  const lines = code.replace(/\n$/, '').split('\n');
  const codePanelId = useId();
  const copyLabel = locale === 'ar' ? 'نسخ' : 'Copy';
  const copiedLabel = locale === 'ar' ? 'تم النسخ' : 'Copied';
  const isPython = language.toLowerCase() === 'python';
  const imagePath = code.match(/Image\.open\(\s*["']([^"']+\.(?:png|jpe?g|webp))["']/i)?.[1];
  const runLabel = locale === 'ar' ? 'تشغيل' : 'Run';
  const showCodeLabel = locale === 'ar' ? 'إظهار الشيفرة' : 'Show code';
  const hideCodeLabel = locale === 'ar' ? 'إخفاء الشيفرة' : 'Hide code';
  const runningLabel = locale === 'ar' ? 'جارٍ التشغيل…' : 'Running…';
  const uploadLabel = locale === 'ar' ? 'ارفع صورة لتشغيل هذا المثال' : 'Upload an image to run this example';

  async function handleRun() {
    if (running || (imagePath && !uploadedFile)) return;
    setRunning(true);
    setOutput(null);
    setError('');
    try {
      setOutput(await runResearchPython(code, uploadedFile ? [uploadedFile] : []));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRunning(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure className="research-code-block" dir="ltr" aria-label={locale === 'ar' ? `مثال شيفرة ${language}` : `${language} code example`}>
      <figcaption className="research-code-header">
        <span>{language || 'code'}</span>
        <div className="research-code-actions">
          {isPython && codeExpanded && <button className="research-code-run" type="button" onClick={handleRun} disabled={running || Boolean(imagePath && !uploadedFile)} aria-label={running ? runningLabel : runLabel}>
            {running ? <LoaderCircle className="research-code-spinner" aria-hidden="true" /> : <Play aria-hidden="true" />}
            <span>{running ? runningLabel : runLabel}</span>
          </button>}
          {isPython && codeExpanded && <button className="research-code-copy" type="button" onClick={copyCode} aria-label={locale === 'ar' ? (copied ? 'تم نسخ الشيفرة' : 'نسخ الشيفرة') : (copied ? 'Code copied' : 'Copy code')}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            <span>{copied ? copiedLabel : copyLabel}</span>
          </button>}
          {isPython && <button type="button" aria-expanded={codeExpanded} aria-controls={codePanelId} onClick={() => setCodeExpanded((expanded) => !expanded)}>
            {codeExpanded ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
            <span>{codeExpanded ? hideCodeLabel : showCodeLabel}</span>
          </button>}
        </div>
      </figcaption>
      {sessionNote && <p className="research-code-session-note">{locale === 'ar' ? 'تستخدم الأمثلة جلسة بايثون مشتركة؛ شغّلها بالترتيب.' : 'Examples share one Python session; run them in order.'}</p>}
      <div id={isPython ? codePanelId : undefined} hidden={isPython && !codeExpanded}>
        <pre className="research-code-pre"><code>{lines.map((line, index) => (
          <span className="research-code-line" key={index}>
            <span className="research-code-number" aria-hidden="true">{index + 1}</span>
            <span className="research-code-source">{tokenizePython(line).map((token, tokenIndex) => (
              <span className={`research-code-token-${token.kind}`} key={tokenIndex}>{token.value}</span>
            ))}{line.length === 0 ? ' ' : null}</span>
          </span>
        ))}</code></pre>
      </div>
      {imagePath && <label className="research-code-upload">
        <Upload aria-hidden="true" />
        <span>{uploadedFile ? uploadedFileName : uploadLabel}</span>
        <input type="file" accept="image/*" onChange={async (event) => {
          const file = event.currentTarget.files?.[0];
          if (!file || !imagePath) return;
          setUploadedFile({ name: imagePath, content: new Uint8Array(await file.arrayBuffer()) });
          setUploadedFileName(file.name);
          setOutput(null);
          setError('');
        }} />
      </label>}
      {(output !== null || error) && <section className="research-code-result" aria-live="polite" aria-label={locale === 'ar' ? 'ناتج الشيفرة' : 'Code output'}>
        <div className="research-code-result-title">{locale === 'ar' ? 'الناتج' : 'Output'}</div>
        {error ? <pre className="research-code-error">{error}</pre> : output?.length ? output.map((item, index) => item.type === 'plot'
          ? <Image className="research-code-plot" src={`data:image/png;base64,${item.value}`} alt={locale === 'ar' ? 'رسم ناتج عن الشيفرة' : 'Plot generated by the code'} width={640} height={480} unoptimized key={`plot-${index}`} />
          : item.type === 'file'
            ? <a className="research-code-download" href={item.dataUrl} download={item.name} key={`file-${index}`}>{locale === 'ar' ? `تنزيل ${item.name}` : `Download ${item.name}`}</a>
            : <pre className="research-code-output-text" key={`text-${index}`}>{item.value}</pre>)
          : <p className="research-code-empty">{locale === 'ar' ? 'تم التشغيل بنجاح، ولم تُطبع أي نتيجة.' : 'Ran successfully with no printed output.'}</p>}
      </section>}
    </figure>
  );
}
