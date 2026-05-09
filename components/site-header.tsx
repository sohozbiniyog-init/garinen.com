"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { jwtDecode } from 'jwt-decode';

export function SiteHeader() {
  const [auth, setAuth] = useState<'guest' | 'buyer' | 'vendor' | 'admin'>('guest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setAuth('guest');
          setIsLoading(false);
          return;
        }

        // Get session to access JWT with custom claims
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setAuth('guest');
          setIsLoading(false);
          return;
        }

        // Decode JWT to extract custom claims (set during auth)
        try {
          const decoded = jwtDecode<any>(session.access_token);
          const userRole = decoded.app_metadata?.custom_claims?.role || 'BUYER';

          if (userRole === 'ADMIN') {
            setAuth('admin');
          } else if (userRole === 'VENDOR') {
            setAuth('vendor');
          } else {
            setAuth('buyer');
          }
        } catch (err) {
          console.warn('Failed to decode JWT claims:', err);
          setAuth('guest');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setAuth('guest');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Optional: Subscribe to auth changes
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setAuth('guest');
      } else if (event === 'SIGNED_IN' && session) {
        // Re-check auth state when user signs in
        checkAuth();
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 lg:px-6">
      <div className="glass-shell mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-[1.9rem] px-5 py-4 lg:px-8">
         <Link href="/" aria-label="GariNen home" className="shrink-0">
    <div className="rounded-2xl bg-gradient-to-br from-white/8 to-white/3 px-3 py-2">
    <img
  src="/images/GariNen_Final.svg"
  alt="GariNen"
  className="
    h-14
    w-[180px]
    object-contain
    block
    drop-shadow-[0_0_18px_rgba(255,0,0,0.18)]
  "
/>
    </div>
  </Link>

        {/* Middle: Nav */}
        <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-2 md:flex">
          <Link href="/listings" className="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white">Listings</Link>
          <Link href="/custom-order" className="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white">Custom Order</Link>
          <Link href="/emi-tools" className="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white">EMI Tools</Link>
        </nav>
        {/* Right: Auth area */}
        <div className="flex items-center gap-3">
          <Link
            href="/apply-for-loan"
            className="group relative inline-flex min-w-[164px] items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-r from-brand-red via-brand-red-deep to-brand-red px-6 py-3 text-sm font-semibold tracking-[0.16em] text-white shadow-lg shadow-brand-red/20 transition-transform duration-300 hover:scale-[1.03] active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2 uppercase">
              Apply for Loan
              <span className="text-base transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>

          {/* Auth Button - Conditional Rendering */}
          {isLoading ? (
            // Loading state
            <div className="glass-panel rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/50">
              Loading...
            </div>
          ) : auth === 'guest' ? (
            // Guest: Sign In / Sign Up
            <Link 
              href="/login" 
              className="glass-panel rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/8"
            >
              Sign in / Sign up
            </Link>
          ) : auth === 'buyer' ? (
            // Buyer: My Profile
            <Link 
              href="/dashboard" 
              className="glass-panel rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/8 hover:text-brand-red"
            >
              My Profile
            </Link>
          ) : auth === 'vendor' ? (
            // Vendor: Vendor Dashboard
            <Link 
              href="/dashboard/seller" 
              className="glass-panel rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/8 hover:text-brand-red"
            >
              Dashboard
            </Link>
          ) : (
            // Admin: Admin Panel
            <Link 
              href="/admin" 
              className="glass-panel rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/8 hover:text-brand-red"
            >
              Admin Panel
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}