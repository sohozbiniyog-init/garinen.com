"use client";

import BackToDashboard from '@/components/common/BackButton';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

export default function VendorTopNav() {
  const pathname = usePathname() ?? '';

  return (
    <header className="w-full border-b border-white/6 bg-transparent px-4 py-3">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={'/vendor' as Route} className="text-lg font-semibold text-white">
              Vendor
            </Link>
            {pathname !== '/vendor' ? <BackToDashboard base="/vendor" label="Back to Vendor" /> : null}
          </div>
          <nav className="text-sm text-slate-300">
            <Link href={'/' as Route} className="mr-4 hover:underline">Home</Link>
            <Link href={'/vendor/submitted' as Route} className="mr-4 hover:underline">Submitted</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

