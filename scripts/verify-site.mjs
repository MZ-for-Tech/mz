import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const file = process.argv[2] || 'docs/seo/after-local.json';
const report = JSON.parse(await readFile(file, 'utf8'));
const origin = report.origin;
const pages = report.results.filter(page => page.sitemap);
const checks = [];
function check(name, fn) { try { fn(); checks.push({ name, passed: true }); } catch (error) { checks.push({ name, passed: false, message: error.message }); } }
for (const page of pages) {
  check(`${page.path}: rendered page, metadata and headings`, () => {
    assert.equal(page.status, 200); assert.equal(page.title.length, 1); assert.ok(page.title[0]);
    assert.equal(page.description.length, 1); assert.ok(page.description[0]);
    assert.deepEqual(page.canonical.map(url => new URL(url).href), [`https://www.mzfortech.com${page.path}`]);
    assert.equal(page.h1.length, 1); assert.ok(page.h1[0]);
    assert.ok(!page.robots.some(item => /noindex|nosnippet/.test(item.content)));
    assert.ok(!/noindex|nosnippet/.test(page.robotsHeader || ''));
    assert.equal(page.language.lang, page.path.startsWith('/research/ar') ? 'ar' : 'en');
    assert.equal(page.language.dir, page.path.startsWith('/research/ar') ? 'rtl' : 'ltr');
    assert.ok(page.hasMainTarget, 'skip-link target exists');
    assert.equal(page.social.find(item => item.property === 'og:url')?.content, page.canonical[0]);
    assert.equal(page.social.find(item => item.name === 'twitter:card')?.content, 'summary_large_image');
  });
  for (const alternate of page.alternates) {
    if (alternate.hreflang === 'x-default') continue;
    check(`${page.path}: reciprocal ${alternate.hreflang} alternate`, () => {
      const target = pages.find(item => item.path === new URL(alternate.href).pathname);
      assert.ok(target, 'alternate is a published page');
      assert.ok(target.alternates.some(item => item.href === page.canonical[0]));
    });
  }
  for (const schema of page.schemas) {
    for (const entity of schema['@graph'] || [schema]) {
      check(`${page.path}: ${entity['@type']} JSON-LD`, () => {
        assert.ok(entity['@type']); assert.ok(entity.name || entity.headline || entity.itemListElement);
        if (entity.provider) assert.equal(entity.provider['@id'], 'https://www.mzfortech.com/#organization');
        assert.ok(!entity.aggregateRating && !entity.review, 'no invented ratings');
      });
    }
  }
}
check('homepage consolidation and unknown routes', () => {
  const old = report.results.find(item => item.path === '/home?utm_source=audit');
  assert.equal(old.status, 308); assert.equal(new URL(old.redirect, origin).pathname, '/'); assert.equal(new URL(old.redirect, origin).search, '?utm_source=audit');
  for (const path of ['/services/unknown', '/unknown-audit-path', '/research/ar/essays/the-measure-and-the-target']) assert.equal(report.results.find(item => item.path === path).status, 404);
  assert.ok(!pages.some(item => item.path === '/home'));
});
check('no duplicate public titles or descriptions', () => {
  assert.equal(new Set(pages.map(item => item.title[0])).size, pages.length);
  assert.equal(new Set(pages.map(item => item.description[0])).size, pages.length);
});
for (const bot of report.bots) check(`${bot.agent}: simulated fetch`, () => { assert.equal(bot.status, 200); assert.equal(bot.title.length, 1); if (bot.agent === 'Twitterbot') assert.equal(bot.headTitle.length, 1); });
const internalLinks = [...new Set(pages.flatMap(page => page.internalLinks).map(link => link.split('#')[0]).filter(Boolean))];
const links = [];
for (const path of internalLinks) {
  try { const response = await fetch(new URL(path, origin), { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15000) }); links.push({ path, status: response.status }); }
  catch (error) { links.push({ path, error: String(error) }); }
}
check('internal links resolve directly', () => assert.ok(links.every(link => link.status === 200), JSON.stringify(links.filter(link => link.status !== 200))));
const images = [];
for (const image of [...new Set(pages.map(page => page.social.find(item => item.property === 'og:image')?.content).filter(Boolean))]) {
  try { const r = await fetch(new URL(new URL(image).pathname + new URL(image).search, origin), { signal: AbortSignal.timeout(20000) }); const buffer = new Uint8Array(await r.arrayBuffer()); images.push({ image, status: r.status, contentType: r.headers.get('content-type'), bytes: buffer.length }); }
  catch (error) { images.push({ image, error: String(error) }); }
}
check('all actual page social images are accessible', () => assert.ok(images.every(image => image.status === 200 && image.contentType.startsWith('image/') && image.bytes > 0)));
for (const resource of report.resources) check(`${resource.path}: public resource`, () => assert.equal(resource.status, 200));
const negotiation = [];
for (const path of ['/', '/services/ai-development', '/research/ar', '/research/ar/essays/the-measure-and-the-target', '/research/unknown', '/services/unknown']) {
  const r = await fetch(new URL(path, origin), { headers: { accept: 'text/markdown' }, redirect: 'manual' });
  negotiation.push({ path, status: r.status, location: r.headers.get('location') });
}
check('Markdown negotiation respects publication and errors', () => {
  for (const item of negotiation) assert.equal(item.status, item.path.includes('unknown') || item.path.includes('/essays/') ? 404 : 307);
});
// Only send an invalid request through the running endpoint; valid-delivery tests use injected mocks.
const invalid = await fetch(new URL('/api/contact', origin), { method: 'POST', body: new FormData() });
check('contact endpoint rejects invalid request', () => assert.equal(invalid.status, 400));
await writeFile('docs/seo/verification.json', JSON.stringify({ recordedAt: new Date().toISOString(), checks, links, images, negotiation, note: 'JSON parsing and application assertions, not an external Schema.org or rich-results validator. Bot agents are simulated.' }, null, 2));
console.log(JSON.stringify({ passed: checks.filter(item => item.passed).length, failed: checks.filter(item => !item.passed) }, null, 2));
if (checks.some(item => !item.passed)) process.exitCode = 1;
