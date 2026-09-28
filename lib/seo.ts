import type { Metadata } from "next";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  locale?: string;
  languages?: Record<string, string>;
  type?: "website" | "article";
};

/** Page-specific search and share metadata with one canonical URL source. */
export function pageMetadata({
  title,
  description,
  path,
  locale = "en_US",
  languages,
  type = "website",
}: PageMetadataOptions): Metadata {
  const imageParams = new URLSearchParams({ title, description, path, locale });
  const imageUrl = `/og?${imageParams.toString()}`;

  return {
    title,
    description,
    alternates: { canonical: path, ...(languages ? { languages } : {}) },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "MZ",
      images: [{ url: imageUrl, alt: title, width: 1200, height: 630 }],
      locale,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
