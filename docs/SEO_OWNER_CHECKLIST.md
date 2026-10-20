# Model Zero: owner decisions and publication checklist

The implementation uses confirmed public facts. Missing information is omitted from public HTML, structured data and discovery files. This document is an internal checklist, not a public page.

## Content decisions

- [ ] About / organization: 2026 is the founding-year default authorized in the plan. Supply an earlier trading year only if you prefer it and can substantiate it.
- [ ] About / team: confirm consent to publish all three partners; supply approved display names, roles, biographies, portraits and LinkedIn URLs. No founder or employee identities have been inferred from research bylines.
- [ ] About / story: provide the actual founding story and reason for the name “Model Zero.” The current page describes the approach without inventing a history.
- [ ] Footer: provide commercial registry and tax card numbers after issuance. Current copy says “under incorporation”; no registry or tax number is claimed.
- [ ] Services: decide whether tech incubation and startup support should be public. It is omitted pending that decision.
- [ ] Services / contact: confirm target countries and any supported working arrangements beyond Egypt. Public copy invites a scope discussion and makes no unsupported regional coverage claim.
- [ ] Services / pricing: approve any public ranges. Existing contact-form budget choices remain; the Services page explains scoping without adding unapproved price promises.
- [ ] Services / technologies: confirm the delivery stack beyond this website's demonstrated Next.js, React and TypeScript. No Python, PyTorch, PostgreSQL or Odoo delivery claim has been inferred.
- [ ] Services / evidence: map each service to work that may be discussed publicly. Unmapped services link to contact rather than fabricated evidence.
- [ ] Services / timelines: supply any typical delivery windows you want published. Current descriptions explain the scoping dependencies rather than inventing numerical estimates.
- [ ] Work / clients: confirm permission and detailed project descriptions for FEPS and Lux, and product descriptions for Z Studio, Misura and Thanawaya Bank. Existing public catalog classifications are preserved; no new capabilities or results are invented.
- [ ] Misura: confirm whether the product is public, private or beta, and provide access to its separate repository/hosting. Its crawler rules cannot be changed from this repository.
- [x] LinkedIn: owner supplied https://www.linkedin.com/company/mzfortech — use in `sameAs` and public links.
- [ ] Profiles: provide the official GitHub organization and any independently sourced Wikidata item. Neither URL is guessed.
- [ ] Arabic: review the five new Arabic core pages before production publication, including terminology and service scope.

## Off-site entity building (owner actions)

Use **Model Zero · Cairo, Egypt · hello@mzfortech.com · https://www.mzfortech.com/** consistently. Do not publish the incorporation application's registered-office address or personal information.

1. [ ] Verify the domain in Google Search Console. Submit `/sitemap.xml`; request indexing of `/`, `/services` and `/about`. Record brand-query impressions and position monthly.
2. [ ] Import the verified site into Bing Webmaster Tools and submit the sitemap. After deployment, run the included IndexNow command and confirm key verification.
3. [ ] Create or complete a Google Business Profile as a Cairo service-area software business, with a hidden address unless there is a public office customers can visit.
4. [ ] Complete the supplied LinkedIn company profile, link the website, and have consenting founders update their employer information.
5. [ ] Create or confirm the GitHub organization. Publish research code only after checking licenses, privacy and publication rights; then provide the organization URL for `sameAs`.
6. [ ] Consider Wikidata only after an independent source exists. Supply that source and the resulting item URL; do not create an unsupported entry.
7. [ ] Complete relevant Clutch, GoodFirms, DesignRush, Crunchbase and Wuzzuf profiles using the same company identity and approved description.
8. [ ] Choose appropriate research distribution venues such as arXiv, SSRN or Zenodo; review submission requirements and publish approved work. Share it through the company's own channels.
9. [ ] Request client backlinks or footer credits where the client consents, including Nested United and other approved clients.
10. [ ] Prepare a substantiated research or client story for relevant Egyptian and regional technology publications.
11. [ ] Use “Model Zero” as the display name on official social accounts, and link the website from their biographies.

## Hosting and post-deployment verification

- [ ] Review CDN/hosting bot-blocking controls. `robots.txt` cannot override a firewall challenge or a hosting-level denial.
- [ ] Verify HTTPS and the non-www to www 301 at the production host. Application redirect rules are included, but hosting may apply its own redirects first.
- [ ] Check the three Rich Results Test links and Schema Markup Validator against the newly deployed content. A valid FAQ schema does not itself promise a Google FAQ search feature.
- [ ] Fetch `/`, `/services` and `/about` using GPTBot and ClaudeBot user agents and confirm full copy and JSON-LD in the response. Repeat for the Arabic pages and the discovery files.
- [ ] Run mobile Lighthouse on production; record lab scores separately from field Core Web Vitals. Establish real-user monitoring if available.
- [ ] Connect the included IndexNow command to a successful deployment step. Do not submit undeployed routes.

## Monthly measurement

- Log Google and Bing impressions/position for “Model Zero,” “Model Zero Cairo,” “mzfortech” and the service terms in the plan.
- Ask the named search assistants the same three questions from the plan; record date, answer, mention and citation URLs.
- Count contact-form referrals marked Search and AI assistant. Keep individual submissions private.
- If an analytics platform is used, group referrers from chatgpt.com, perplexity.ai, claude.ai, gemini.google.com and copilot.microsoft.com. No analytics account or tracking identifier was supplied, so none is fabricated.

No owner placeholder is intended for public deployment. Missing items above remain owner decisions, not asserted company facts.
