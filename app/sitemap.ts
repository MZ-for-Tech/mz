import type { MetadataRoute } from "next";
import { CUSTOM_STUDIES, hasArabicStudyMetadata } from "@/research/data/studies";

const SITE = "https://mzfortech.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "/",
    "/home",
    "/work",
    "/work/nested-united",
    "/services",
    "/intel",
    "/contact",
    "/privacy",
  ];

  const pages: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${SITE}${path}`,
  }));

  for (const study of CUSTOM_STUDIES.filter((item) => item.published)) {
    const english = `/research/${study.slug}`;
    const arabic = `/research/ar/${study.slug}`;
    const hasArabic = hasArabicStudyMetadata(study);
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
