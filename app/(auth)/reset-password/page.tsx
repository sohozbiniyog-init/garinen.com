'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error) {
    return err.message || fallback;
  }

  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    return typeof message === 'string' && message ? message : fallback;
  }

  return fallback;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const validateRecoverySession = async () => {
      const currentUrl = new URL(window.location.href);
      const hashParams = new URLSearchParams(currentUrl.hash.startsWith('#') ? currentUrl.hash.slice(1) : '');
      const code = currentUrl.searchParams.get('code');
      const tokenHash = currentUrl.searchParams.get('token_hash') || hashParams.get('token_hash');
      const accessToken = currentUrl.searchParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = currentUrl.searchParams.get('refresh_token') || hashParams.get('refresh_token');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError('This recovery link is invalid or expired. Request a new one from the sign-in page.');
          setReady(false);
          return;
        }
      } else if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });

        if (error) {
          setError('This recovery link is invalid or expired. Request a new one from the sign-in page.');
          setReady(false);
          return;
        }
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setError('This recovery link is invalid or expired. Request a new one from the sign-in page.');
          setReady(false);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        if (code || accessToken || refreshToken) {
          router.replace('/reset-password');
        }

        setReady(true);
        setError('');
        return;
      }

      setError('This recovery link is invalid or expired. Request a new one from the sign-in page.');
      setReady(false);
    };

    validateRecoverySession();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      await supabase.auth.signOut();
      setMessage('Password updated successfully. Redirecting you to sign in.');
      router.push('/login?message=password-updated');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md items-center px-6 py-12">
      <section className="w-full rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-soft backdrop-blur-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-gray">Account recovery</p>
        <h1 className="mt-2 text-2xl font-bold text-brand-black">Create a new password</h1>
        <p className="mt-2 text-sm leading-6 text-brand-gray">
          Use a strong password you have not used before. After saving, you will be signed out and should log in again.
        </p>

        {!ready ? (
          <div className="mt-6 rounded-2xl border border-black/10 bg-black/5 p-4 text-sm text-brand-gray">
            <p>{error || 'Checking recovery session…'}</p>
            <div className="mt-4 flex items-center gap-3">
              <Link href="/forgot-password" className="font-semibold text-brand-red transition hover:underline">
                Request a new link
              </Link>
              <Link href="/login" className="font-semibold text-brand-gray transition hover:underline">
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-brand-black">New password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Create a new password"
                className="mt-2 w-full rounded-lg border border-black/10 bg-white/60 px-4 py-3 text-brand-black placeholder-brand-gray focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-brand-black">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Repeat the new password"
                className="mt-2 w-full rounded-lg border border-black/10 bg-white/60 px-4 py-3 text-brand-black placeholder-brand-gray focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              />
            </div>

            {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
            {message ? <p className="text-sm font-semibold text-success" role="status" aria-live="polite">{message}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-moss px-6 py-4 font-semibold text-white transition hover:translate-y-[-1px] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Saving…' : 'Update password'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

