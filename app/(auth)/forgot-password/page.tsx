'use client';

import Link from 'next/link';
import { useState } from 'react';
import { showToast } from '@/components/common/Toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send reset link');
      }

      setMessage(data?.message || 'If the email exists, a password reset link has been sent.');
      showToast('Password reset email sent if the account exists.', { type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md items-center px-6 py-12">
      <section className="w-full rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-soft backdrop-blur-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-gray">Account recovery</p>
        <h1 className="mt-2 text-2xl font-bold text-brand-black">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-brand-gray">
          Enter the email you use to sign in. We will send a secure password reset link if the account exists.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-brand-black">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
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
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/login" className="font-semibold text-brand-red transition hover:underline">
            Back to sign in
          </Link>
          <Link href="/reset-password" className="font-semibold text-brand-gray transition hover:underline">
            Already have a reset link?
          </Link>
        </div>
      </section>
    </main>
  );
}

