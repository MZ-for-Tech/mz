import type { MetadataRoute } from "next";
import { getPublicPages } from "@/lib/public-pages";
import { SITE } from "@/lib/company-content";
export default function sitemap(): MetadataRoute.Sitemap {
  return getPublicPages().map(page => ({ url: SITE + page.path, lastModified: page.lastModified, ...('languages' in page ? { alternates: { languages: page.languages } } : {}) }));
}
