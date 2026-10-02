'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { measure } from '@/lib/measurement';

export default function Measurement() {
  const path = usePathname();
  useEffect(() => {
    if (path.startsWith('/services/')) measure('service_view', path, path.split('/')[2]);
    if (path === '/work/nested-united') measure('case_study_view', path, 'nested-united');
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement)?.closest('a');
      if (!link) return;
      const destination = new URL(link.href, window.location.origin);
      if (destination.origin === window.location.origin && destination.pathname === '/contact') measure('contact_cta_click', path);
      const products: Record<string, string> = { 'misura.mzfortech.com': 'misura', 'zstore.mzfortech.com': 'zstore' };
      const slug = products[destination.hostname];
      if (slug) measure('product_outbound_click', path, slug);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [path]);
  return null;
}
