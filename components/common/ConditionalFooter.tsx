'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from './Footer';

export function ConditionalFooter() {
  const pathname = usePathname();

  if (pathname === '/admin/login' || pathname === '/admin-login') {
    return null;
  }

  return <SiteFooter />;
}