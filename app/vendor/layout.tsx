'use client';

import { usePathname } from 'next/navigation';
import VendorTopNav from '@/components/vendor/TopNav';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboardingRoute = pathname.startsWith('/vendor/onboarding');

  return (
    <div className={`min-h-screen bg-transparent ${isOnboardingRoute ? 'text-slate-900' : 'text-white vendor-minimal'}`}>
      <VendorTopNav />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

