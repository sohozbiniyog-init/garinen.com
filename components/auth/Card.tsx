'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VendorTOSModal } from '@/components/vendor/TOSModal';
import { showToast } from '@/components/common/Toast';

type Mode = 'signin' | 'signup';

interface AuthCardProps {
  initialMode?: Mode;
  initialNotice?: string;
}

export function AuthCard({ initialMode = 'signin', initialNotice = '' }: AuthCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(initialNotice);
  const [wantToSignupAsVendor, setWantToSignupAsVendor] = useState(false);
  const [showVendorTOS, setShowVendorTOS] = useState(false);

  useEffect(() => {
    if (initialNotice) {
      setMessage(initialNotice);
    }
  }, [initialNotice]);

  const submitAuth = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to authenticate');
      }

      // For signup: show success and redirect to login
      if (mode === 'signup') {
        showToast('Account created successfully! Redirecting to login...', { type: 'success' });
        router.push('/login');
        return;
      }

      // For signin: redirect to dashboard
      showToast('Signed in successfully', { type: 'success' });
      router.push(data.redirectTo || '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const activeIdentifier = email.trim();
    if (!activeIdentifier) {
      setError('Please enter your email.');
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }

      if (!phone.trim()) {
        setError('Please enter a phone number for sales follow-up.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      if (wantToSignupAsVendor) {
        setShowVendorTOS(true);
        return;
      }
    }

    await submitAuth({
      mode,
      email: activeIdentifier,
      name,
      phone,
      password,
      isVendor: mode === 'signup' && wantToSignupAsVendor,
    });
  };

  const handleGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  const submitButtonLabel = loading
    ? 'Processing…'
    : mode === 'signin'
      ? 'Sign in'
      : 'Create account';

  return (
    <div className="w-full rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-soft backdrop-blur-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-brand-gray">Welcome</p>
          <h1 className="mt-1 text-2xl font-bold text-brand-black">{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
          <p className="mt-1 max-w-[26ch] text-xs leading-5 text-brand-gray">{mode === 'signup' ? 'Email, password, and phone for sales follow-up.' : 'Sign in with email and password.'}</p>
        </div>
        <div className="flex gap-2" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            onClick={() => {
              setError('');
              setMessage('');
              setMode('signin');
            }}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${mode === 'signin' ? 'bg-brand-black text-white' : 'bg-white/70 text-brand-black hover:bg-white'}`}
            aria-pressed={mode === 'signin'}
            aria-label="Switch to sign in"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setError('');
              setMessage('');
              setMode('signup');
            }}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${mode === 'signup' ? 'bg-brand-black text-white' : 'bg-white/70 text-brand-black hover:bg-white'}`}
            aria-pressed={mode === 'signup'}
            aria-label="Switch to sign up"
          >
            Sign up
          </button>
        </div>
      </div>

      {/* OTP/Password toggle removed - password-only auth now */}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field always shown */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-brand-black">Email</label>
          <input
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            autoFocus
            className="mt-2 w-full rounded-lg border border-black/10 bg-white/60 px-4 py-3 text-brand-black placeholder-brand-gray focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          />
        </div>

        {mode === 'signup' && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-brand-black">Full name</label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Your name"
                className="mt-2 w-full rounded-lg border border-black/10 bg-white/60 px-4 py-3 text-brand-black placeholder-brand-gray focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-brand-black">Phone number</label>
              <input
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                inputMode="tel"
                placeholder="+880 1X XXX XX XX"
                className="mt-2 w-full rounded-lg border border-black/10 bg-white/60 px-4 py-3 text-brand-black placeholder-brand-gray focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
                required
              />
              <p className="mt-2 text-xs text-brand-gray">Used only for sales calls and support follow-up.</p>
            </div>

            <div className="rounded-lg border border-brand-red/10 bg-primary-soft p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantToSignupAsVendor}
                  onChange={(e) => setWantToSignupAsVendor(e.target.checked)}
                  className="h-5 w-5 rounded border border-black/20 cursor-pointer"
                />
                <span className="text-sm font-semibold text-brand-black">আমি ভেন্ডর হিসাবে সাইন আপ করতে চাই</span>
              </label>
              {wantToSignupAsVendor && (
                <p className="mt-2 text-xs text-brand-gray">
                  ভেন্ডর হিসেবে সাইন আপ করলে আপনাকে শর্তাবলী পড়তে এবং সম্মত হতে হবে। তারপর আপনার ব্যবসায়িক তথ্য পূরণ করতে হবে।
                </p>
              )}
            </div>
          </>
        )}

        {/* Password field always shown (no more OTP) */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-brand-black">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            placeholder={mode === 'signin' ? 'Your account password...' : 'Create a password...'}
            className="mt-2 w-full rounded-lg border border-black/10 bg-white/60 px-4 py-3 text-brand-black placeholder-brand-gray focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          />
          {mode === 'signin' ? (
            <div className="mt-2 flex items-center justify-between gap-3 text-xs">
              <p className="text-brand-gray">Need help getting back in?</p>
              <Link href="/forgot-password" className="font-semibold text-brand-red transition hover:underline">
                Forgot password?
              </Link>
            </div>
          ) : null}
        </div>

        {mode === 'signup' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-brand-black">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Repeat your password..."
              className="mt-2 w-full rounded-lg border border-black/10 bg-white/60 px-4 py-3 text-brand-black placeholder-brand-gray focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
            />
          </div>
        )}

        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        {message && <p className="text-sm font-semibold text-success" role="status" aria-live="polite">{message}</p>}

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            aria-label={submitButtonLabel}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-moss px-6 py-4 font-semibold text-white transition hover:translate-y-[-1px] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading && (
              <svg aria-hidden="true" className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
            <span>{submitButtonLabel}</span>
          </button>

          {/* Google login always available */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full rounded-lg border border-black/10 bg-white/80 px-6 py-4 font-semibold text-brand-black transition-colors hover:bg-black/5"
          >
            Continue with Google
          </button>
        </div>
      </form>

      <p className="mt-6 text-sm text-brand-gray">
        By continuing you agree to our <a className="underline">Terms</a> and <a className="underline">Privacy Policy</a>.
      </p>

      <VendorTOSModal
        isOpen={showVendorTOS}
        onDecline={() => {
          setShowVendorTOS(false);
          setWantToSignupAsVendor(false);
        }}
        onAccept={async () => {
          setShowVendorTOS(false);
          // Password-only flow - no OTP needed
          await submitAuth({
            mode: 'signup',
            email: email.trim(),
            name,
            phone,
            password,
            isVendor: true,
          });
        }}
      />
    </div>
  );
}

