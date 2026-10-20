import { CONTENT_UPDATED, SITE } from "./company-content";
import { SERVICE_GUIDES } from "./service-guides";
import { CUSTOM_STUDIES, hasArabicStudyMetadata } from "@/research/data/studies";
import { RESEARCH_SERIES } from "@/research/data/series";
import { getResearchArticlePath, getResearchSeriesPath } from "@/research/lib/paths";

export const CORE_PAGES = [
  { path: "/", name: "Model Zero home", arabic: "/ar" },
  { path: "/services", name: "Services", arabic: "/ar/services" },
  { path: "/about", name: "About Model Zero", arabic: "/ar/about" },
  { path: "/work", name: "Projects and products", arabic: "/ar/work" },
  { path: "/contact", name: "Contact Model Zero", arabic: "/ar/contact" },
  { path: "/research", name: "The Null Hypothesis", arabic: "/research/ar" },
];

export function getPublicPages() {
  const core = CORE_PAGES.flatMap((page) => {
    const languages = { en: SITE + page.path, ar: SITE + page.arabic, "x-default": SITE + page.path };
    return [{ path: page.path, name: page.name, lastModified: CONTENT_UPDATED, languages }, { path: page.arabic, name: `${page.name} (Arabic)`, lastModified: CONTENT_UPDATED, languages }];
  });
  const other = [
    { path: "/work/nested-united", name: "Nested United case study", lastModified: CONTENT_UPDATED },
    { path: "/privacy", name: "Privacy policy", lastModified: "2026-09-26" },
    { path: "/brand", name: "Model Zero brand guidelines", lastModified: CONTENT_UPDATED },
    ...SERVICE_GUIDES.map((guide) => ({ path: `/services/${guide.slug}`, name: guide.title, lastModified: CONTENT_UPDATED })),
    ...RESEARCH_SERIES.map((series) => ({ path: getResearchSeriesPath(series.slug), name: series.title, lastModified: CONTENT_UPDATED })),
  ];
  const research = CUSTOM_STUDIES.filter((study) => study.published).flatMap((study) => {
    const english = getResearchArticlePath(study, "en");
    const arabic = getResearchArticlePath(study, "ar");
    const hasArabic = hasArabicStudyMetadata(study) && study.arabic_translation_status !== "draft";
    const languages: Record<string, string> = { en: SITE + english, "x-default": SITE + english, ...(hasArabic ? { ar: SITE + arabic } : {}) };
    const lastModified = study.updated_at || study.published_at;
    return [{ path: english, name: study.title, lastModified, languages }, ...(hasArabic ? [{ path: arabic, name: study.title_ar!, lastModified, languages }] : [])];
  });
  return [...core, ...other, ...research];
}
