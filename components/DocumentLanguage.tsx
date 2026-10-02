'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { localeForPath } from '@/lib/localization';

export default function DocumentLanguage() {
  const pathname = usePathname();
  useEffect(() => {
    const arabic = localeForPath(pathname) === 'ar';
    document.documentElement.lang = arabic ? 'ar' : 'en';
    document.documentElement.dir = arabic ? 'rtl' : 'ltr';
  }, [pathname]);
  return null;
}
