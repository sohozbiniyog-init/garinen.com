'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/Card';
import { createBrowserClient } from '@supabase/ssr';
import { isPendingVendorWithinGracePeriod } from '@/lib/auth/vendor-grace-period';

function LoginContent() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const redirectPath = '/dashboard/buyer';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('redirect');
    if (target && target.startsWith('/')) {
      (window as Window & { __loginRedirectPath?: string }).__loginRedirectPath = target;
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // User is already authenticated, redirect to dashboard
        try {
          const res = await fetch('/api/auth/me');
          const json = await res.json();
          const role = json?.profile?.role || json?.claims?.role || 'BUYER';
          const vendorApprovalStatus = json?.profile?.vendorApprovalStatus || json?.claims?.vendor_approval_status || null;
          const vendorOnboardingCreatedAt = json?.profile?.vendorOnboardingCreatedAt || json?.claims?.vendor_onboarding_created_at || null;
          const isPendingVendor = isPendingVendorWithinGracePeriod(role || vendorApprovalStatus, vendorOnboardingCreatedAt);
          const target = (window as Window & { __loginRedirectPath?: string }).__loginRedirectPath || redirectPath;

          if (role === 'ADMIN') {
            router.replace('/admin');
          } else if (isPendingVendor) {
            router.replace('/vendor/onboarding');
          } else if (role === 'VENDOR' && vendorApprovalStatus === 'APPROVED') {
            router.replace('/dashboard/seller');
          } else {
            router.replace(target as Parameters<typeof router.replace>[0]);
          }
        } catch {
          // If error fetching auth info, redirect to buyer dashboard
          const target = (window as Window & { __loginRedirectPath?: string }).__loginRedirectPath || redirectPath;
          router.replace(target as Parameters<typeof router.replace>[0]);
        }
      }
    };

    checkAuth();
  }, [router]);

  return (
    <main suppressHydrationWarning className="mx-auto flex min-h-[100dvh] max-w-md items-center px-6 py-12">
      <Suspense fallback={<div className="h-64 w-full rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-soft" />}>
        {isMounted ? (
          <div className="space-y-4">
            <AuthCard initialNotice="" />
           
          </div>
        ) : (
          <div className="h-64 w-full rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-soft" />
        )}
      </Suspense>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-white" />}>
      <LoginContent />
    </Suspense>
  );
}
