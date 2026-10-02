import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const readJson = async file => JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
const before = await readJson('docs/seo/baseline-production.json');
const after = await readJson('docs/seo/after-local.json');
const verified = await readJson('docs/seo/verification.json');
const destinations = await readJson('docs/seo/public-destinations.json');
const pkg = await readJson('package.json');
const pages = after.results.filter(page => page.sitemap);
const escape = value => String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const table = (headers, rows) => [headers.join(' | '), headers.map(() => '---').join(' | '), ...rows.map(row => row.map(escape).join(' | '))].map(row => `| ${row} |`).join('\n');
const routeMatrix = table(['Route', 'HTTP', 'Canonical', 'H1', 'lang / dir', 'Robots', 'Schema types'], pages.map(page => [page.path, page.status, page.canonical.join(', '), page.h1.join(', '), `${page.language.lang} / ${page.language.dir}`, page.robots.map(item => `${item.name}: ${item.content}`).join('; '), page.schemas.flatMap(schema => (schema['@graph'] || [schema]).map(entity => entity['@type'])).join(', ')]));
const metadata = table(['Route', 'Document title', 'Description', 'Language alternatives'], pages.map(page => [page.path, page.title.join(', '), page.description.join(', '), page.alternates.map(item => `${item.hreflang}: ${item.href}`).join('; ') || 'None; no matching translation published']));
const statusBefore = table(['Route', 'HTTP', 'Canonical', 'Title', 'H1', 'Language', 'Sitemap'], before.results.map(page => [page.path, page.status, page.canonical?.join(', '), page.title?.join(', '), page.h1?.join(', '), page.language?.lang, page.sitemap ? 'Yes' : 'No']));
const diagnostics = table(['Route', 'Before HTML bytes (live)', 'After HTML bytes (local)', 'Before fetch ms', 'After fetch ms'], ['/', '/services', '/intel', '/work', '/contact', '/research', '/research/ar'].map(path => { const b = before.results.find(page => page.path === path); const a = pages.find(page => page.path === path); return [path, b.bytes, a.bytes, b.responseMs, a.responseMs]; }));
const changed = [...new Set([
  ...execFileSync('git', ['-c', 'core.quotepath=false', '-c', 'core.safecrlf=false', 'diff', '--name-only'], { encoding: 'utf8' }).trim().split('\n'),
  ...execFileSync('git', ['-c', 'core.quotepath=false', 'ls-files', '--others', '--exclude-standard'], { encoding: 'utf8' }).trim().split('\n'),
  'docs/seo/completion-report.md',
])].filter(file => file && file !== 'backup/MZ.original.svg' && file !== 'MZ_Main_Site_SEO_AI_Implementation_Brief_EN.md');
const text = `# MZ main-site implementation report

Recorded: ${after.recordedAt}. Scope: main company website only. Changes are local and reviewable; no deployment or third-party account changes were performed.

## Implemented

- Consolidated useful launcher home content into a substantive canonical homepage at /, preserving the brand mark, visual theme, featured project tiles and interactive Work shelf. /home permanently redirects to / with query preservation. Home navigation now links directly to /; /intel is labelled About.
- Added six service pages: custom software, web development, ERP/internal systems, applied AI, model optimization and knowledge transfer. The first four implement the priority commercial scope; the other two have distinct research/training content. Each contains customer problems, deliverables, process, limitations, evidence context, FAQs, related links and a contact CTA. No arbitrary keyword/city pages were added.
- Expanded About and Work with legal/brand identity, Cairo location, operating approach and crawlable project links. Product details stay in Work because available evidence does not yet support standalone Products pages. Misura and Z Studio descriptions remain limited to their supplied purposes; product feature and availability claims are not inferred.
- Corrected Nested United performance/ranking claims and removed unverified FEPS/LUX endorsements and FEPS/Thanawaya shelf entries. Their existing assets and underlying records are retained for later owner verification. ZStore is labelled a fictional demonstration. No invented testimonials, ratings, credentials or outcome metrics were added.
- Unified metadata and preserved existing Organization/WebSite IDs. Added per-service Service and BreadcrumbList data, preview-friendly robots defaults, an Apple touch icon from existing brand artwork and locally loaded OG fonts. The global metadata helper uses an absolute title to prevent duplicate brand suffixes.
- Sitemap derives new service routes from the same source as the visible pages and summaries. /home is excluded. Existing research dates remain source dates; build-time timestamps are not used as lastmod. Static company routes omit lastmod when a reliable content-date ledger is unavailable.
- Existing robots wildcard Allow policy remains unchanged, including existing training-use permissions. Public content.md and llms.txt now derive from the same service catalogue and verified company facts. They remain supplementary resources, not special ranking controls.
- Preserved English/Arabic research paths, original methods, experimental numbers, essays, citations and the PDF. Added collection headings, reciprocal language handling, accurate server html language/direction, and safe language-switch destinations. Draft Arabic essay content is unavailable publicly and excluded from sitemap, hub links and Markdown negotiation. A simulated image reconstruction is now explicitly labelled as an illustration rather than diagnostic proof.
- Added skip links and targets, preserved native details/form keyboard behavior, deferred the decorative shader, disabled it for reduced motion, and prevented entrance loaders from covering server output when JavaScript is absent.
- Contact email is readable/selectable with a mailto fallback. SMTP secrets stay server-side. Success requires SMTP acceptance, failure preserves the brief for retry, delivery timeouts are bounded, and raw transport errors are not logged. No real test inquiry was sent. Local measurement events provide stable page/slug properties without form values; no external analytics destination or consent policy was invented.
- Dependency version after implementation: Next.js ${pkg.dependencies.next}. The original production audit flagged a critical Next.js advisory; the framework and matching tooling were updated within version 16, then compatible transitive fixes were applied without force. The final production audit reports zero vulnerabilities. Original findings: dependency-audit.json; final result: dependency-audit-after.json.

## Verified

- Production build, TypeScript and ESLint pass on the final dependency versions: see build.log, typecheck.log and lint.log. Contact handler: six mocked test scenarios pass (validation/honeypot, attachment size, missing configuration, SMTP rejection/failure, accepted delivery, STARTTLS); see contact-tests.log. No production SMTP destination was used.
- ${pages.length} sitemap routes return 200. Rendered output checks: ${verified.checks.filter(check => check.passed).length} passed, ${verified.checks.filter(check => !check.passed).length} failed. Tests cover single title/description/canonical/H1, public robots, html lang/dir, skip targets, OG URLs/cards, reciprocal translations, JSON-LD parsing/reference checks, internal link resolution, actual per-page OG image fetches, redirects, unknown/draft routes, Markdown negotiation and invalid contact submission. Full evidence: after-local.json and verification.json.
- Local robots.txt, sitemap.xml, llms.txt, content.md, the research PDF and English/Arabic OG images are public resources. Social images were fetched using their actual rendered metadata URLs, rather than only testing a sample image route.
- Homepage and Arabic research social images were visually inspected. Mixed Arabic/Latin ordering was incorrect in Satori, so published Arabic routes use pre-rendered Pango cards from their audited metadata. Assets: public/og/arabic-research.png and arabic-vgg19.png; regeneration: node scripts/build-arabic-social.mjs after auditing updated Arabic metadata. New Arabic routes need their own reviewed card. These static assets avoid runtime font/platform dependencies; the image endpoint traces them for deployment. Preview evidence: og-home.png and og-arabic-research.png.
- Simulated Googlebot, Twitterbot and OAI-SearchBot requests returned the public homepage. The Twitterbot check requires its document title in the head. These are response-path tests; they do not verify genuine crawler identity, firewall access or indexing. Default Next.js HTML-limited bot handling remains unchanged.
- JSON-LD validated by parsing rendered scripts and application assertions. No Schema.org validator or Google Rich Results Test submission was performed, and no eligibility/appearance guarantee is claimed.
- Next.js logged Internal: NoFallbackError during out-of-parameter route probes; the audited HTTP responses were genuine 404s, not 500s. Recheck runtime logs after deployment; this observation is distinct from the passing build and response assertions.
- Public destination checks: ${destinations.results.map(item => `${item.url}: ${item.status || item.error}${item.location ? ` → ${item.location}` : ''}`).join('; ')}. The public PDF HEAD check succeeds even though the earlier full-body production download timed out. See public-destinations.json.

## Final route, canonical and language policy

Canonical origin is https://www.mzfortech.com. Unique public pages self-canonicalize, tracking parameters are excluded from canonicals, and non-root trailing slashes redirect to clean paths. Next.js renders the root canonical as the bare origin; this is the same root URL as the slash form. /home uses a configured 308 and passes query parameters through. Existing /start → /contact, /menu → /, /menu/{panel} → /{panel} and legacy research redirects are retained. Utility /logo is noindex and outside the sitemap. Unknown paths and unpublished Arabic essays return genuine 404 responses.

The live host currently redirects HTTP apex → HTTPS apex → HTTPS www (two steps); HTTPS apex and HTTP www each redirect to HTTPS www. Consolidating the apex HTTP redirect at the hosting layer requires administrator access. No DNS/CDN configuration was changed.

The English/Arabic counterparts are only /research ↔ /research/ar and the matching VGG19 paper pages. The English essay and series have no published Arabic equivalents. No x-default is invented for unrelated pages. New company Arabic routes remain unserved until reviewed; route proposals and copy drafts are in arabic-review-draft.md. The path-locale foundation supports the existing research convention and future /ar routes.

${routeMatrix}

## Final metadata matrix

Open Graph and Twitter titles/descriptions derive from the same page metadata; Twitter uses summary_large_image. General pages use website, genuine research articles use article. Real accessible images include alt text and declared dimensions. Article authors and dates derive from existing research records, not invented biographies. Arabic research metadata retains existing Arabic descriptions; new English commercial content has no unreviewed Arabic hreflang counterpart.

${metadata}

## Structured-data graph

The homepage defines Organization at https://www.mzfortech.com/#organization (MZ for Tech, verified legal name, Cairo/EG and public email) and WebSite at https://www.mzfortech.com/#website. No unverified street address, telephone, office, opening hours or country-specific office entity was added. The service hub retains its existing Service fragment IDs; detail pages have their own #service and BreadcrumbList records referencing the same provider. Nested United retains its #case-study CreativeWork. Existing research Article and ScholarlyArticle types retain source author/date records and publisher references. ScholarlyArticle does not imply peer review. No disconnected competing company ID, fake Person credential, Review/AggregateRating, Offer, unsupported Product schema or FAQ rich-result promise was added.

## Content and editorial evidence still needed

- Confirm the research repository’s public URL/visibility: the recorded GitHub URL returned 404. Confirm Misura’s current public destination and availability: its recorded URL was not fetchable. Do not infer why (private repository, removal, DNS, service outage, etc.) without owner evidence.
- Confirm Misura features/status, Z Studio availability, Occhio’s current development status, and official Thanawaya spelling/scope/quality review before expanding their copy. Occhio was removed from the supplementary summary because its old multilingual capability statements were not supported by the visible catalogue; no false replacement claim was added.
- FEPS delivery/relationship and LUX publication permission remain unverified, so they are not public proof. Supply written scope, delivery evidence and publication permission before restoring endorsements or adding case studies.
- Company founder/team roles, affiliations and credentials need explicit confirmation for About biographies. Existing research author credits are preserved in the publications and are not promoted into invented company roles.
- Arabic drafts need a business/editorial reviewer, full translated body and labels, and RTL interaction checks before release. Preserve technical findings and existing source citations during review.
- Privacy retention and actual account-level processor configuration need owner confirmation. Current wording describes the implemented form, configured SMTP pathway and local event behavior without fabricated legal compliance claims.

## Performance and accessibility limits

Baseline method: public production HTML fetches with Node fetch, recording full UTF-8 response size and wall-clock fetch duration. After method: the same audit against a local next start production build on Windows/Node 24. These are different network/runtime environments, so fetch-time differences are not a performance improvement claim. More useful server-rendered content increases the HTML size of several company pages.

${diagnostics}

The root layout reads a proxy-provided locale header to preserve existing research URLs and send the correct html language/direction. This opts HTML routes into request-time SSR. This tradeoff must be measured on deployed infrastructure; static service params do not imply cached HTML when the root reads request headers. A future locale-segment/root-layout organization could restore static HTML without changing public URLs, but no large route migration was undertaken for this release.

No connected browser was available (computer-use inventory returned no browsers or apps), so desktop/mobile visual review, hydrated interaction checks, contrast measurement, Lighthouse mobile/desktop scores, LCP/INP/CLS and field percentile comparison are **unverified**. Source/HTML checks cover labels, skip targets, direction, semantic links, reduced-motion branches and no-JavaScript overlay behavior; they do not prove visual accessibility. No universal 100 score or Core Web Vitals pass is claimed.

## Contact and measurement configuration

The integration in this repository is Zoho Mail SMTP, not a verified Zoho CRM API. No local SMTP credentials or analytics account access were supplied. Configure server-only ZOHO_SMTP_HOST, ZOHO_SMTP_PORT (465 TLS or 587 STARTTLS), ZOHO_SMTP_USER, ZOHO_SMTP_PASSWORD, CONTACT_FROM_EMAIL and CONTACT_TO_EMAIL using the account’s real data-center/plan settings. Use an account-generated app password where required. Verify sender permission and recipient reception against an approved internal test inbox before switching to the company destination.

Success means the SMTP server accepted the brief; it is not a guarantee of inbox delivery or a qualified lead. The handler mocks confirm logic, not live Zoho authentication or reception. Hosting upload/request limits and rate controls must be checked against the configured deployment. The form’s existing budget/timeline choices are user inputs, not published fixed quotes or delivery promises.

Local events are dispatched as mz:measurement with name, clean path and optional fixed slug: service_view, case_study_view, contact_cta_click, contact_form_start, contact_form_success, contact_form_error and product_outbound_click. Connect a reviewed consent-aware analytics adapter only after selecting the actual account/property and lawful data policy. Do not attach form data, query strings, arbitrary URLs, email, budgets, names, attachments or phone numbers. Decide how analytics sessions and qualified leads are defined. No actual measurement data has been collected by this implementation.

## Prioritized owner checklist — requires access or evidence

| Priority | Owner/account | Exact action/input | Verify completion |
|---|---|---|---|
| 1 | Engineering/deployment owner | Review local diff, dependency advisory outcome and production-build evidence; deploy through existing authorized workflow | Repeat route audit/verification against HTTPS www after deployment; inspect representative desktop/mobile pages |
| 1 | Zoho Mail + hosting environment owner | Supply the real SMTP settings above and approved internal test inbox; verify payload limits/rate controls | Confirm real receipt, reply-to, attachment, failure/retry and SMTP-accepted success event; then restore company recipient |
| 1 | Research/product owner | Correct public research-code URL and confirm Misura destination/features/status | Anonymous public GET succeeds; main-site links and summaries match the verified destinations |
| 2 | Hosting/CDN/DNS administrator | Review HTTP/apex redirect chain, verified permitted search crawler access, asset/public-PDF access, preview headers and staging protection | Use vendor IP/reverse-DNS verification as appropriate; inspect CDN logs and real HTTP responses, not just spoofed user agents |
| 2 | Google Search Console owner | Verify main-host URL-prefix property (https://www.mzfortech.com/) or authorized Domain property; submit /sitemap.xml | Property verification, accepted sitemap and key URL inspection after release; record indexing reasons |
| 2 | Search Console owner | Review applicable generative-AI inclusion settings and report availability in this actual account | Record actual settings/features and data, without claiming they exist for every account |
| 2 | Bing Webmaster Tools owner | Verify property and submit final sitemap; review available AI Performance features | Account verification and sitemap processing; record actual reporting availability |
| 2 | Analytics/CRM administrator | Choose real analytics property and consent policy; attach local-event adapter; define lead qualification | Debug stable event payloads and consent behavior; reconcile confirmed inquiries with actual qualified leads |
| 3 | Arabic editorial/business reviewer | Approve drafts, full translation and supported company/product facts | Publish only complete route pairs; repeat H1/meta/RTL/hreflang/sitemap/form/visual checks |
| 3 | Company owner | Confirm team roles, client permissions and accurate official profiles | Approved facts/links match site copy; no invented locations, endorsements or credentials |
| 3 | Hosting owner (optional) | Evaluate IndexNow support, supply an actual key and key file only if implemented | Validate supported-engine notifications; do not use Google’s restricted Indexing API for ordinary company pages |

No search-engine credentials/tokens, analytics account, CRM access, DNS or firewall administrative session was available. No profile registration, backlink purchase, third-party posting or account submission was performed. Indexing, search rankings, AI citations and lead qualification remain external monitoring outcomes.

## 30 / 60 / 90-day monitoring and publishing plan

Before release, record main-host indexed/submitted pages, impressions/queries/clicks, service visits, confirmed inquiries and qualification criteria from the actual accounts. Establish a small fixed English/Arabic AI-retrieval sample with exact prompt, date, platform/model/search mode, cited URLs and factual errors; no results are invented here.

| Review | What to inspect | Evidence-led publishing output |
|---|---|---|
| 30 days | Canonical indexing reasons, crawler failures, broken destinations, service views, contact delivery and qualified leads; actual AI report availability | One verified project story, plus an engineer-authored explanation of website vs web application. Author: owner-appointed delivery engineer; evidence: approved scope/screenshots; CTA: web service/contact |
| 60 days | Query/lead fit by service, available AI referrals, recurring customer questions and fixed retrieval-sample errors | ERP scoping or local-inference tradeoffs. Author/reviewer: owner-appointed specialist; evidence: anonymized workflows or reproducible runtime tests; destination: ERP/AI service; CTA: scoped inquiry |
| 90 days | Change from account baseline in discovery, relevant acquisition and qualified inquiries; review publication accuracy and Arabic coverage | Model-compression limitations or practical handover guide. Author: actual research/delivery contributor; evidence: methods, measured results and review; destination: optimization/knowledge-transfer service; CTA: evaluation or workshop inquiry |

Monthly: recheck content/status/links, crawl failures, sitemap, canonical/language changes, field/lab performance where available, inquiries and public-profile consistency. Publish fewer useful evidence-backed pieces, not a volume of duplicate keyword pages. Missing AI referrers are inconclusive; the form’s discovery-source answer can add context.

## Exact modified/added/deleted files

The pre-existing user change to backup/MZ.original.svg and the supplied implementation brief were left untouched. Public summary files moved from public/ to generated route handlers. The original /home layout was extracted into HomeFeatured before the legacy page became a redirect. Other research/scientific source content was preserved except the explicit simulated-illustration explanation.

${changed.map(file => '- ' + file).join('\n')}

## Reference basis

Bundled installed Next.js guides were read for metadata/OG, inheritance/streaming, async headers, proxy, sitemap, redirects, icons and lazy loading. The docs directory appeared only once the dependency extraction completed; initial fallback reads used official Next.js documentation. Google references consulted: [AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [language alternatives](https://developers.google.com/search/docs/specialty/international/localized-versions), [Organization data](https://developers.google.com/search/docs/appearance/structured-data/organization), and [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap). Dependency security references are in the audit records and the [Next.js advisory](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j).
`;
await writeFile('docs/seo/completion-report.md', text);
await writeFile('docs/seo/baseline-route-matrix.md', '# Before implementation — live production\n\n' + statusBefore + '\n\nFull descriptions, directives, schema and links: baseline-production.json. Fetch diagnostics are not Core Web Vitals.\n');
console.log('Wrote completion-report.md and baseline-route-matrix.md');
