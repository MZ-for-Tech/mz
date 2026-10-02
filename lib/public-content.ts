import { SERVICE_PAGES } from './service-pages';

export const SITE_ORIGIN = 'https://www.mzfortech.com';
export const COMPANY_DESCRIPTION = 'MZ for Tech is the public brand of Model Zero for Technology Solutions, based in Cairo, Egypt. We build custom software, websites and e-commerce, ERP and internal systems, and applied AI, with training that helps client teams operate what we deliver.';

export function publicSummary() {
  return [
    '# MZ for Tech', '', COMPANY_DESCRIPTION, '',
    'Priority audiences: businesses and institutions in Egypt and Saudi Arabia. Location: Cairo, Egypt.',
    'Contact: [hello@mzfortech.com](mailto:hello@mzfortech.com).', '',
    '## Company', '',
    `[Home](${SITE_ORIGIN}/) · [About](${SITE_ORIGIN}/intel) · [Work](${SITE_ORIGIN}/work) · [Contact](${SITE_ORIGIN}/contact) · [Privacy](${SITE_ORIGIN}/privacy)`, '',
    `## Services`, '', `[Service overview](${SITE_ORIGIN}/services)`, '',
    ...SERVICE_PAGES.map(service => `- [${service.title.split(' | ')[0]}](${SITE_ORIGIN}/services/${service.slug}): ${service.description}`), '',
    '## Work, products and demonstrations', '',
    `- [Nested United case study](${SITE_ORIGIN}/work/nested-united): Multi-brand website work, bringing five specialist brands into one web experience. The case study contains scope, approach and screenshots.`,
    '- [Misura](https://misura.mzfortech.com): Statistical-analysis product by MZ. Contact the team for current features and availability.',
    '- Z Studio: Product-configuration work by MZ. Contact the team for current scope and availability.',
    '- [ZStore](https://zstore.mzfortech.com): Fictional e-commerce demonstration, not a real merchant or commercial client.', '',
    '## Research', '',
    `- [The Null Hypothesis](${SITE_ORIGIN}/research): Published essays and experiments, with methods and supporting sources.`,
    `- [Arabic research collection](${SITE_ORIGIN}/research/ar)`,
    `- [The Measure and the Target](${SITE_ORIGIN}/research/essays/the-measure-and-the-target): An essay on metrics, optimization and proxy goals.`,
    `- [The Institutional Machine](${SITE_ORIGIN}/research/series/institutional-machine): Research essay series.`,
    `- [VGG19 compression on BloodMNIST](${SITE_ORIGIN}/research/papers/vgg19-bloodmnist-compression): Experiments with L1 regularization, structured L0 gates and low-rank SVD.`,
    `- [VGG19 study in Arabic](${SITE_ORIGIN}/research/ar/papers/vgg19-bloodmnist-compression)`,
    `- [Research PDF](${SITE_ORIGIN}/research-applied-stats-in-ai.pdf)`,
    '- [Accompanying research code](https://github.com/MZ-for-Tech/vgg19-compression)', '',
    `## Public resources`, '', `[Sitemap](${SITE_ORIGIN}/sitemap.xml) · [Plain-text summary](${SITE_ORIGIN}/content.md) · [llms.txt](${SITE_ORIGIN}/llms.txt)`, '',
  ].join('\n');
}
