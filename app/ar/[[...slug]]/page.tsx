import { notFound } from "next/navigation";
import ArabicCorePage, { ARABIC_PAGES, type ArabicPageKind } from "@/components/CompanyContent/ArabicCorePage";
import { pageMetadata } from "@/lib/seo";

function pageKind(slug?: string[]): ArabicPageKind | null {
  if (!slug?.length) return "home";
  return slug.length === 1 && ["services", "about", "contact", "work"].includes(slug[0]) ? slug[0] as ArabicPageKind : null;
}
export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const kind = pageKind((await params).slug);
  if (!kind) return {};
  const page = ARABIC_PAGES[kind];
  return pageMetadata({ title: page.title, description: page.description, path: page.path, locale: "ar_EG", languages: { en: page.en, ar: page.path, "x-default": page.en } });
}
export default async function ArabicPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const kind = pageKind((await params).slug);
  if (!kind) notFound();
  return <ArabicCorePage kind={kind} />;
}
