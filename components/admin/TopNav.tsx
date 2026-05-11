"use client";

import BackToDashboard from '@/components/common/BackButton';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

export default function AdminTopNav() {
  const pathname = usePathname() ?? '';

  return (
    <header className="w-full border-b border-white/6 bg-transparent px-4 py-3">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={'/admin' as Route} className="text-lg font-semibold text-white">
              Admin
            </Link>
            {pathname !== '/admin' ? <BackToDashboard base="/admin" label="Back to Admin" /> : null}
          </div>
          <nav className="text-sm text-slate-300">
            <Link href={'/' as Route} className="mr-4 hover:underline">Home</Link>
            <Link href={'/admin/listings' as Route} className="mr-4 hover:underline">Listings</Link>
            <Link href={'/admin/users' as Route} className="hover:underline">Users</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

