'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { PasswordField } from '@/components/auth/PasswordField';

type FormState = {
  email: string;
  password: string;
  loading: boolean;
  error: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<FormState>({
    email: '',
    password: '',
    loading: false,
    error: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      try {
        const res = await fetch('/api/auth/me');
        const json = await res.json();
        const role = json?.profile?.role || json?.claims?.role || 'BUYER';

        if (role === 'ADMIN') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard/buyer');
        }
      } catch {
        router.replace('/dashboard/buyer');
      }
    };

    checkAuth();
  }, [router]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState((current) => ({ ...current, loading: true, error: '' }));

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email.trim(),
          password: state.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState((current) => ({
          ...current,
          loading: false,
          error: data?.error || 'Unable to sign in',
        }));
        return;
      }

      router.replace(typeof data?.redirectTo === 'string' && data.redirectTo ? data.redirectTo : '/admin');
    } catch {
      setState((current) => ({
        ...current,
        loading: false,
        error: 'Unable to sign in',
      }));
      return;
    }

    setState((current) => ({ ...current, loading: false }));
  };

  return (
    <main className="min-h-screen bg-[#f6f4ef] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full rounded-[1.5rem] border border-slate-200 bg-white/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Admin access</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Sign in</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use your admin credentials to continue.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={state.email}
                    onChange={(event) => setState((current) => ({ ...current, email: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
                    required
                  />
            </div>

            <PasswordField
              id="password"
              label="Password"
              value={state.password}
              onChange={(v) => setState((current) => ({ ...current, password: v }))}
              autoComplete="current-password"
              placeholder="••••••••"
            />

            {state.error ? (
              <p className="text-sm text-rose-600" role="alert">
                {state.error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={state.loading}
              className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state.loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}