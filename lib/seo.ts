import type { Metadata } from "next";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  locale?: string;
  languages?: Record<string, string>;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

function fitDescription(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const candidate = normalized.slice(0, maxLength - 1).trimEnd();
  const boundary = candidate.lastIndexOf(" ");
  const shortened = boundary >= maxLength * 0.7 ? candidate.slice(0, boundary) : candidate;
  return `${shortened}…`;
}

/** Page-specific search and share metadata with one canonical URL source. */
export function pageMetadata({
  title,
  description,
  path,
  locale = "en_US",
  languages,
  type = "website",
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Metadata {
  const metaDescription = fitDescription(description, 155);
  const socialDescription = fitDescription(description, 125);
  const imageParams = new URLSearchParams({ title, description: socialDescription, path, locale });
  const imageUrl = `/og?${imageParams.toString()}`;
  const searchTitle = fitDescription(title, path === "/" ? 60 : 47);
  const languageAlternates = languages ? { ...languages, "x-default": languages["x-default"] || languages.en || path } : undefined;

  return {
    title: path === "/" ? { absolute: searchTitle } : searchTitle,
    description: metaDescription,
    alternates: { canonical: path, ...(languageAlternates ? { languages: languageAlternates } : {}) },
    openGraph: {
      title,
      description: socialDescription,
      url: path,
      siteName: "Model Zero",
      images: [{ url: imageUrl, alt: title, width: 1200, height: 630 }],
      locale,
      ...(languages?.ar ? { alternateLocale: locale === "ar_EG" ? ["en_US"] : ["ar_EG"] } : {}),
      type,
      ...(type === "article" ? { ...(publishedTime ? { publishedTime } : {}), ...(modifiedTime ? { modifiedTime } : {}) } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: socialDescription,
      images: [imageUrl],
    },
  };
}
