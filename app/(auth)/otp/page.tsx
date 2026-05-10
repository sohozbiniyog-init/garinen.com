/*
COMMENTED OUT: OTP page no longer needed with password-only authentication flow
The signup flow now uses direct password registration, redirecting to login after account creation.

Original OTP content:

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function OtpContent() {
  const search = useSearchParams();
  const router = useRouter();
  const identifier = search.get('identifier');
  const mode = (search.get('mode') || 'signin') as 'signin' | 'signup';
  const maskedEmail = identifier ? identifier.replace(/^(.{2}).+(@.+)$/, '$1***$2') : '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!identifier) {
      setError('Missing identifier.');
    }
  }, [identifier]);

  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft <= 0;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp, mode }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Failed to verify OTP');
      }

      const data = await res.json();
      router.push(data.redirectTo || '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!identifier) return;
    if (timeLeft > 0) return;

    setError('');
    setMessage('');
    setResending(true);

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, mode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to resend OTP');
      }

      setMessage('OTP sent again. Please check your inbox.');
      setTimeLeft(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full rounded-[2rem] border border-black/10 bg-white/92 p-8 shadow-soft backdrop-blur-sm">
      <p className="text-sm uppercase tracking-[0.2em] text-brand-gray">Verification</p>
      <h1 className="mt-2 text-2xl font-bold text-brand-black">Enter the OTP</h1>
      <p className="mt-3 text-sm leading-6 text-brand-gray">We sent a one-time code to your email. Enter it below to complete {mode === 'signup' ? 'signup' : 'sign in'}.</p>

      {maskedEmail && (
        <p className="mt-2 text-sm font-semibold text-brand-black">{maskedEmail}</p>
      )}

      <div className="mt-4 rounded-xl border border-brand-red/10 bg-primary-soft px-4 py-3 text-sm text-brand-black" role="status" aria-live="polite">
        {isExpired ? 'The code has expired. Request a new one to continue.' : `Code expires in ${minutes}:${seconds.toString().padStart(2, '0')}`}
      </div>

      <form onSubmit={handleVerify} className="mt-6 space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-semibold text-brand-black">One-time passcode</label>
          <input
            id="otp"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            autoFocus
            disabled={isExpired}
            className="mt-2 w-full rounded-lg border border-black/10 bg-white/60 px-4 py-3 text-center text-lg tracking-[0.35em] text-brand-black placeholder-brand-gray focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        {message && <p className="text-sm font-semibold text-success" role="status" aria-live="polite">{message}</p>}

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || otp.length !== 6 || isExpired}
            aria-busy={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-moss px-6 py-4 font-semibold text-white transition hover:translate-y-[-1px] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <svg aria-hidden="true" className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
            <span>{loading ? 'Verifying…' : 'Verify & Continue'}</span>
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || timeLeft > 0}
              className="rounded-lg border border-black/10 px-6 py-4 font-semibold text-brand-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={timeLeft > 0 ? `Resend available in ${minutes}:${seconds.toString().padStart(2, '0')}` : 'Resend OTP'}
            >
              {resending ? 'Sending…' : 'Resend OTP'}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-lg border border-black/10 px-6 py-4 font-semibold text-brand-black">
              Back
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function OtpPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md items-center px-6 py-10">
      <Suspense fallback={<div className="h-64 w-full rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-soft" />}>
        <OtpContent />
      </Suspense>
    </main>
  );
}
*/

// Deprecated: OTP flow replaced with password-only authentication
export default function OtpPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>OTP Page Disabled</h1>
      <p>Password-only authentication is now active. This OTP endpoint is no longer in use.</p>
      <p>Please use /login or /register instead.</p>
    </div>
  );
}

