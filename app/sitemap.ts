import type { MetadataRoute } from "next";
import { CUSTOM_STUDIES, hasArabicStudyMetadata } from "@/research/data/studies";
import { RESEARCH_SERIES } from "@/research/data/series";
import { getResearchArticlePath, getResearchSeriesPath } from "@/research/lib/paths";
import { SERVICE_PAGES } from '@/lib/service-pages';

const SITE = "https://www.mzfortech.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "/",
    "/work",
    "/work/nested-united",
    "/services",
    "/intel",
    "/contact",
    "/privacy",
    ...SERVICE_PAGES.map(service => `/services/${service.slug}`),
  ];

  const pages: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${SITE}${path}`,
  }));

  for (const study of CUSTOM_STUDIES.filter((item) => item.published)) {
    const english = getResearchArticlePath(study, 'en');
    const arabic = getResearchArticlePath(study, 'ar');
    const hasArabic = hasArabicStudyMetadata(study) && study.arabic_translation_status !== 'draft';
    const alternates = {
      languages: {
        en: `${SITE}${english}`,
        ...(hasArabic ? { ar: `${SITE}${arabic}` } : {}),
      },
    };
    const lastModified = study.updated_at || study.published_at;

    pages.push({ url: `${SITE}${english}`, lastModified, alternates });
    if (hasArabic) {
      pages.push({
        url: `${SITE}${arabic}`,
        lastModified,
        alternates: {
          languages: {
            en: `${SITE}${english}`,
            ar: `${SITE}${arabic}`,
          },
        },
      });
    }
  }

  for (const series of RESEARCH_SERIES) {
    pages.push({ url: `${SITE}${getResearchSeriesPath(series.slug)}` });
  }

  pages.push({
    url: `${SITE}/research`,
    alternates: { languages: { en: `${SITE}/research`, ar: `${SITE}/research/ar` } },
  });
  pages.push({
    url: `${SITE}/research/ar`,
    alternates: { languages: { en: `${SITE}/research`, ar: `${SITE}/research/ar` } },
  });

  return pages;
}
