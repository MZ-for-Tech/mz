import { ABOUT_SECTIONS, COMPANY_FACTS, COMPANY_SUMMARY, CONTENT_UPDATED, DIFFERENTIATORS, ENGAGEMENT_OVERVIEW, ENTITY_DEFINITION, OFFERINGS, SERVICES_FAQ, SERVICES_INTRO, SITE, TECHNOLOGY_OVERVIEW, WORKFLOW } from "./company-content";
import { SERVICE_PILLARS } from "./services";
import { SERVICE_GUIDES } from "./service-guides";
import { PROJECTS } from "./projects";
import { CUSTOM_STUDIES } from "@/research/data/studies";
import { getResearchArticlePath } from "@/research/lib/paths";
import { getPublicPages } from "./public-pages";
import { LINKEDIN_URL } from "./site-structured-data";
import { ARABIC_ABOUT, ARABIC_ENTITY, ARABIC_FAQ, ARABIC_SERVICES } from "./arabic-content";
import { NESTED_STUDY } from "./case-study-content";

export function discoveryContent(full = false) {
  const sections = [
    `# Model Zero\n\n${ENTITY_DEFINITION}\n\n${COMPANY_SUMMARY}\n\nUpdated: ${CONTENT_UPDATED}`,
    `## Facts\n\n${COMPANY_FACTS.map(([key, value]) => `- ${key}: ${value}`).join("\n")}\n- Official LinkedIn: ${LINKEDIN_URL}`,
    `## Public pages\n\n${getPublicPages().map((page) => `- [${page.name}](${SITE}${page.path})`).join("\n")}`,
    `## Services\n\n${SERVICES_INTRO}\n\n${SERVICE_PILLARS.map((pillar) => `### ${pillar.name} — ${pillar.title}\n\n${pillar.description}\n\n${pillar.scope.join("\n")}`).join("\n\n")}\n\n${OFFERINGS.map((item) => `### ${item.name}\n\n${item.text}\n\nWho it is for: ${item.audience}\nDeliverables: ${item.deliverables}\nTiming: ${item.timing}\n${SITE}/services/${item.guide}`).join("\n\n")}`,
    `## Why Model Zero\n\n${DIFFERENTIATORS.map((item) => `### ${item.title}\n\n${item.text}`).join("\n\n")}\n\n## Technologies\n\n${TECHNOLOGY_OVERVIEW}\n\n## Engagement\n\n${ENGAGEMENT_OVERVIEW}`,
    `## How we work\n\n${WORKFLOW.map((step, index) => `${index + 1}. ${step.title}: ${step.text}`).join("\n\n")}`,
    `## About\n\n${ABOUT_SECTIONS.map((section) => `### ${section.title}\n\n${section.paragraphs.join("\n\n")}`).join("\n\n")}`,
    `## Products and selected work\n\n${PROJECTS.filter((project) => project.showOnWorkShelf !== false).map((project) => `- ${project.name} (${project.kind === "product" ? "Model Zero product" : project.kind === "demo" ? "Demo" : "Client work"}): ${project.description || project.category}${project.link ? ` — ${project.link}` : project.hasCaseStudy ? ` — ${SITE}/work/${project.slug}` : ` — ${SITE}/work`}`).join("\n")}`,
    `## Team\n\nFor company and team inquiries, contact hello@mzfortech.com. Team profiles are not currently published. Research bylines identify the authors of individual publications.`,
    `## FAQ\n\n${SERVICES_FAQ.map((faq) => `### ${faq.question}\n\n${faq.answer}`).join("\n\n")}`,
    `## Research abstracts\n\n${CUSTOM_STUDIES.filter((study) => study.published).map((study) => `### ${study.title}\n\n${study.description}\nPublished: ${study.published_at}\nUpdated: ${study.updated_at || study.published_at}\n${SITE}${getResearchArticlePath(study, "en")}`).join("\n\n")}`,
  ];
  if (full) sections.push(
    `## ${NESTED_STUDY.title}\n\nUpdated: ${NESTED_STUDY.updated}\n\n${[...NESTED_STUDY.sections, ...NESTED_STUDY.capabilities].map((section) => `### ${section.title}\n\n${section.text}`).join("\n\n")}\n\n${NESTED_STUDY.design}\n\n${NESTED_STUDY.preview}\n${SITE}/work/nested-united`,
    `## Service guides\n\n${SERVICE_GUIDES.map((guide) => `### ${guide.heading}\n\n${guide.intro}\n\n${guide.paragraphs.join("\n\n")}\n${SITE}/services/${guide.slug}`).join("\n\n")}`,
    `## بالعربية\n\n${ARABIC_ENTITY}\n\n${ARABIC_ABOUT.map((section) => `### ${section.title}\n\n${section.text}`).join("\n\n")}\n\n${ARABIC_SERVICES.map((service) => `### ${service.name}\n\n${service.text}\n${SITE}${service.href}`).join("\n\n")}\n\n${ARABIC_FAQ.map((faq) => `### ${faq.question}\n\n${faq.answer}`).join("\n\n")}`,
  );
  sections.push(`## Contact\n\nModel Zero · Cairo, Egypt · hello@mzfortech.com\n${SITE}/contact`);
  return sections.join("\n\n") + "\n";
}
