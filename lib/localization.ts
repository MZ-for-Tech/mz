export type PublicLocale = 'en' | 'ar';

// Preserves existing research URLs and supports future reviewed /ar pages.
// This helper does not publish routes or translations.
export function localeForPath(pathname: string): PublicLocale {
  return pathname === '/ar' || pathname.startsWith('/ar/') || pathname === '/research/ar' || pathname.startsWith('/research/ar/') ? 'ar' : 'en';
}
