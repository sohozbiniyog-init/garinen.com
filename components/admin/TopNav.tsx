"use client";

import BackToDashboard from '@/components/common/BackButton';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminTopNav() {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
      setAuth('guest');
      router.refresh();
      router.push('/login?message=signed-out');
    } finally {
      setIsLoggingOut(false);
    }
  };

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
           <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-white transition hover:bg-rose-500/10 disabled:opacity-60"
                  >
                    Logout
                  </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

function setAuth(arg0: string) {
  if (typeof window === 'undefined') return;

  if (arg0 === 'guest') {
    window.localStorage.removeItem('auth');
    return;
  }

  window.localStorage.setItem('auth', arg0);
}

