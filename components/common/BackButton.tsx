"use client";

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

export default function BackToDashboard({ base = '/admin', label = 'Back to dashboard' }: { base?: string; label?: string }) {
  const pathname = usePathname() ?? '';
  if (pathname === base) return null;

  return (
    <div className="mb-4">
      <Link href={base as Route} className="text-sm font-semibold text-sky-400 hover:underline">
        ← {label}
      </Link>
    </div>
  );
}

