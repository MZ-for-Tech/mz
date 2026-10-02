import { mkdir, writeFile } from 'node:fs/promises';

const origin = process.argv[2] || 'http://localhost:3000';
const output = process.argv[3] || 'docs/seo/route-audit.json';
if (origin === '--destinations') {
  const results = [];
  for (const url of ['http://mzfortech.com/', 'https://mzfortech.com/', 'http://www.mzfortech.com/', 'https://www.mzfortech.com/research-applied-stats-in-ai.pdf', 'https://github.com/MZ-for-Tech/vgg19-compression', 'https://misura.mzfortech.com/', 'https://zstore.mzfortech.com/', 'https://nestedunited.com/']) {
    try { const r = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(30000) }); results.push({ url, status: r.status, location: r.headers.get('location'), contentType: r.headers.get('content-type') }); }
    catch (error) { results.push({ url, error: String(error) }); }
  }
  await writeFile(output, JSON.stringify({ recordedAt: new Date().toISOString(), results, note: 'Public HEAD requests only. No product code, accounts or infrastructure changed.' }, null, 2));
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}
const decode = (s = '') => s.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]*>/g, '').trim();
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], decode(m[2])]));
const fetchPage = async (path, agent) => {
  const start = performance.now();
  const response = await fetch(new URL(path, origin), { redirect: 'manual', headers: agent ? { 'user-agent': agent } : {}, signal: AbortSignal.timeout(30000) });
  const html = await response.text();
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map(m => attrs(m[0]));
  const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map(m => attrs(m[0]));
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const document = html.replace(/<svg\b[\s\S]*?<\/svg>/g, '');
  const head = document.match(/<head>([\s\S]*?)<\/head>/)?.[1] || '';
  return { path, status: response.status, redirect: response.headers.get('location'), canonical: links.filter(l => l.rel === 'canonical').map(l => l.href), title: [...document.matchAll(/<title>([\s\S]*?)<\/title>/g)].map(m => decode(m[1])), headTitle: [...head.matchAll(/<title>([\s\S]*?)<\/title>/g)].map(m => decode(m[1])), description: meta.filter(m => m.name === 'description').map(m => m.content), h1: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(m => decode(m[1])), language: attrs(html.match(/<html\b[^>]*>/)?.[0] || ''), robots: meta.filter(m => /robots|googlebot/.test(m.name || '')), robotsHeader: response.headers.get('x-robots-tag'), alternates: links.filter(l => l.hreflang), social: meta.filter(m => /^(og:|twitter:)/.test(m.property || m.name || '')), schemas, internalLinks: [...new Set([...html.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map(m => decode(m[1])).filter(l => l.startsWith('/') && !l.startsWith('//')))], hasMainTarget: html.includes('id="main-content"'), bytes: Buffer.byteLength(html), responseMs: Math.round(performance.now() - start) };
};
await mkdir('docs/seo', { recursive: true });
const sitemapResponse = await fetch(new URL('/sitemap.xml', origin), { signal: AbortSignal.timeout(30000) });
const sitemap = await sitemapResponse.text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
const results = [];
for (const path of [...new Set([...paths, '/home?utm_source=audit', '/services/unknown', '/unknown-audit-path', '/research/ar/essays/the-measure-and-the-target', '/logo', '/start', '/menu', '/services/'])]) {
  try { results.push({ ...await fetchPage(path), sitemap: paths.includes(path) }); }
  catch (error) { results.push({ path, error: String(error) }); }
}
const resources = [];
for (const path of ['/robots.txt', '/llms.txt', '/content.md', '/research-applied-stats-in-ai.pdf', '/og?title=MZ&path=/', '/og?title=MZ&locale=ar_EG&path=/research/ar']) {
  try { const r = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(30000) }); resources.push({ path, status: r.status, contentType: r.headers.get('content-type'), bytes: (await r.arrayBuffer()).byteLength }); }
  catch (error) { resources.push({ path, error: String(error) }); }
}
const bots = [];
for (const agent of ['Googlebot', 'Twitterbot', 'OAI-SearchBot']) {
  try { bots.push({ agent, ...await fetchPage('/', agent) }); } catch (error) { bots.push({ agent, error: String(error) }); }
}
const report = { origin, recordedAt: new Date().toISOString(), sitemapStatus: sitemapResponse.status, results, resources, bots, note: 'Simulated user agents do not verify real crawler or WAF access. Response timings are fetch diagnostics, not Core Web Vitals.' };
await writeFile(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ output, routes: results.length, errors: results.filter(r => r.error), resources, titles: results.map(r => ({ path: r.path, status: r.status, title: r.title, h1: r.h1 })) }, null, 2));
