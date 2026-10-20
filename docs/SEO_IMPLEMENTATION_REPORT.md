# Model Zero SEO and AI-discoverability implementation

Date: 20 October 2026. Final application code: 7676654. Changes are committed locally; nothing was deployed or pushed, no directory/profile was created, and no contact email was sent.

## Result and remaining limits

The repository now has a complete homepage at /, a 301 legacy /home redirect, a substantive Services page with eight service guides, an expanded About page, connected organization and page structured data, consistent metadata, generated discovery exports, a dated sitemap, public LinkedIn links and five Arabic core pages. Existing typography, green glass artwork and desktop motion are retained. The square logo was rasterized from existing artwork; the same fonts are now stored locally with their licenses.

The work is ready for owner review, with explicit remaining items: mobile LCP does not meet the plan's target in the local simulated Lighthouse runs; Google Rich Results and Schema Markup Validator certification remain unverified; external hosting controls and Misura require separate access; team and other unconfirmed content are omitted. See [the owner checklist](SEO_OWNER_CHECKLIST.md). No owner placeholder was published.

## Commits by phase

- `c5fb70b` fix(seo): consolidate homepage and remove unsupported case-study claims
- `ef7cfdf` feat(services): add detailed offerings, service guides and FAQ content
- `b53245b` feat(about): explain company approach with confirmed public facts
- `4b87132` feat(seo): link organization, service, FAQ and research entities
- `7f7ffb9` fix(metadata): unify brand titles, descriptions and article dates
- `637bd1d` feat(discovery): generate crawler content and prepare IndexNow submissions
- `bcce8bb` feat(seo): improve navigation, sitemap and mobile rendering
- `b74d5c4` feat(i18n): add Arabic core pages with server document language
- `431fe48` fix(seo): finalize shared copy, validation and mobile loading behavior

- `7676654` fix(home): render the animated heading as readable text

The final documentation commit contains this report, the owner checklist, score summaries, bot-response proof and screenshots. No PR was created or pushed.

## Verification

- Standard npm run build: passed after the final source changes. Earlier font-loader failures were resolved by storing the same font assets locally. Build logs are available in seo-reports/ in this workspace.
- ESLint: passed with npm run lint -- app components lib research scripts proxy.ts next.config.ts. The unrestricted root scan was stopped because it traversed the pre-existing untracked local npm cache; all application, research and script source directories were checked.
- npm run seo:verify: passed across 37 canonical HTML pages. It checks unique titles of at most 60 characters, unique descriptions of 140-155 characters, canonicals, one H1, JSON-LD parsing, the confirmed LinkedIn identity, matching visible FAQ text, English/Arabic document attributes, the 512px logo, sitemap dates and exclusions, redirects, unknown-route 404s, crawler responses and Markdown negotiation.
- Services: 2161 words in the main server-rendered HTML. About: 711 words, with the required entity definition as its first paragraph.
- All eight service guides passed the minimum 600-word check. Counts include navigation, headings and FAQs.
- IndexNow dry run passed for /, /services and /about; a cross-domain URL was rejected before any request. No URLs were submitted. The command checks the deployed key before posting. Run npm run seo:indexnow -- --dry-run / /services /about, then run without --dry-run only after deployment. With no URL arguments it reads the live sitemap. Add it to a successful deployment hook; deployment configuration was not supplied. [IndexNow protocol](https://www.indexnow.org/documentation).
- Existing research rendering still emits KaTeX warnings for Arabic text inside mathematical expressions. These warnings do not fail the build and were present in the baseline.

Detailed page checks and bot excerpts: [html-verification.json](seo-reports/html-verification.json). Audit scores and metrics for the baseline, every phase checkpoint and final pages: [lighthouse-summary.json](seo-reports/lighthouse-summary.json). Full local Lighthouse payloads and build logs remain available in this workspace and are excluded from git to avoid committing trace/screenshot payloads repeatedly.

## Before and after Lighthouse (mobile)

| Page | Before performance | After performance | Before / after SEO | Before / after accessibility |
| --- | ---: | ---: | ---: | ---: |
| / | 55 | 53 | 100 / 100 | 100 / 100 |
| /services | 39 | 72 | 100 / 100 | 100 / 100 |
| /about | 40 | 75 | 100 / 100 | 100 / 100 |

Final metrics:

| Page | Simulated LCP | Total blocking time | CLS |
| --- | ---: | ---: | ---: |
| / | 8.8 s | 703 ms | 0.000 |
| /services | 8.1 s | 206 ms | 0.000 |
| /about | 8.4 s | 68 ms | 0.000 |

Lighthouse used mobile defaults and simulated throttling on local production builds. Scores vary with the environment; these are lab results, not field Core Web Vitals. The LCP target of less than 2.5 seconds is not met. INP was not measured; no real-user analytics account was provided. Mobile shader/3D mounting, page blur and smooth-scroll overhead were reduced. Services and About improved in these runs; homepage performance is close to baseline and still below target. Further performance work remains necessary before claiming green mobile Core Web Vitals.

Screenshots: [Home](seo-reports/after-home.jpg), [Services](seo-reports/after-services.jpg), [About](seo-reports/after-about.jpg).

## Raw HTML proof

Executed against the final local production server:

~~~powershell
curl.exe -sS -A GPTBot http://localhost:3100/services
curl.exe -sS -A ClaudeBot http://localhost:3100/about
~~~

Services first paragraph:

> Model Zero (MZ) designs, builds and deploys software and AI systems for organizations in Cairo and beyond — and then trains your team so you own the system and the knowledge to run it.

About first paragraph:

> Model Zero (MZ) is a software and artificial-intelligence company based in Cairo, Egypt. Model Zero builds custom software and AI systems for organizations, publishes applied research through The Null Hypothesis, and trains client teams to operate what it builds.

Both returned HTTP 200 with script type=application/ld+json. The automated check repeated both GPTBot and ClaudeBot on /, /services and /about, parsed their JSON-LD and checked the visible copy. Services FAQ answers were also checked against the JSON-LD text. Full curl responses are saved locally as seo-reports/gptbot-services.html and seo-reports/claudebot-about.html.

## External structured-data validation

Local JSON syntax, required local content relationships and visible FAQ parity passed. This is not a claim that Google's external validator or validator.schema.org accepted the pages. No browser connector was available to submit local code to those tools, and these changes are not deployed. The following links test production and must be used after deploying this revision:

- [Home Rich Results Test](https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.mzfortech.com%2F)
- [Services Rich Results Test](https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.mzfortech.com%2Fservices)
- [About Rich Results Test](https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.mzfortech.com%2Fabout)
- [Schema Markup Validator](https://validator.schema.org/): test the same three production URLs and the new service/Arabic routes.

No successful external-test screenshots or certification are claimed.

## Architecture and publication decisions

- Visual screenshot review caught and corrected an invisible homepage-heading regression. The hero now uses one readable copy of each word with CSS motion, while the desktop 3D logo remains. The raw-HTML verification also asserts the complete heading text.
- Root organization, website and research-publication IDs are stable. Services have an offer catalog, services, visible FAQs and breadcrumbs; About and Contact have their respective page types. Research authors remain publication bylines, not invented company-team roles.
- Core English/Arabic pairs have reciprocal alternate links and x-default. Proxy derives a language header from the URL; the root layout reads it to emit the correct HTML language and direction before JavaScript. This makes HTML routes render at request time. The sitemap and discovery routes remain static. A small client component maintains document language during client navigation.
- /llms.txt, /llms-full.txt and /content.md are generated from shared company, service, FAQ, case-study, project and research content. Text resources are excluded from the XML sitemap.
- Public location is city-level Cairo, Egypt. Founding year uses the plan's authorized 2026 default. About explicitly states under incorporation. Team identities, street addresses, capital, ownership, identification numbers and tracking numbers are absent from the published content.
- Existing project classifications are retained. No capability, metric or new case study was fabricated for products whose details were not supplied. The owner checklist records the missing descriptions and permissions. Service offerings without approved proof link to contact.
- LinkedIn uses the exact URL the owner supplied: https://www.linkedin.com/company/mzfortech.

## Production and off-site work

A read-only request to the current production Services URL returned 200 from Vercel. HTTP non-www currently upgrades to HTTPS with 308. The application now adds a 301 non-www-to-www rule, but host-level redirect behavior needs rechecking after deployment. The separate Misura hostname could not be resolved from this environment; this repository cannot change its DNS, robots or application. CDN crawler-blocking settings were not accessible.

The [owner checklist](SEO_OWNER_CHECKLIST.md) consolidates every missing fact/approval from the plan, all eleven off-site entity-building tasks, deployment checks and monthly measurement. Unconfirmed items are omitted from public output instead of shipping TODO_OWNER values.

The pre-existing backup/MZ.original.svg modification, untracked .npm-cache directory and supplied planning Markdown were left untouched.
