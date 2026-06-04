'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VendorTOSModal } from '@/components/vendor/TOSModal';
import { showToast } from '@/components/common/Toast';
import { z } from 'zod';

import { PasswordField } from './PasswordField';
import { VendorSignupSection } from './VendorSignupSection';
import { authSchema } from './validation';

type Mode = 'signin' | 'signup';

interface AuthCardProps {
  initialMode?: Mode;
  initialNotice?: string;
  authEndpoint?: '/api/auth/password' | '/api/auth/admin-login';
  allowSignup?: boolean;
}

export function AuthCard({
  initialMode = 'signin',
  initialNotice = '',
  authEndpoint = '/api/auth/password',
  allowSignup = true,
}: AuthCardProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mode, setMode] = useState<Mode>(allowSignup ? initialMode : 'signin');
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
  const [redirectTarget, setRedirectTarget] = useState<string>('/dashboard');

  const createTraceId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `trace_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  };

  useEffect(() => {
    if (initialNotice) {
      setMessage(initialNotice);
    }
  }, [initialNotice]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('redirect');
    if (target && target.startsWith('/')) {
      setRedirectTarget(target);
    }
  }, []);

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
  const submitAuth = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError('');
    setMessage('');

    const traceId = createTraceId();
    const isVendorSignup = payload.mode === 'signup' && Boolean(payload.isVendor);
    try {
      try {
        authSchema.parse(payload);
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.issues?.[0]?.message || 'Invalid form data.');
          setLoading(false);
          return;
        }
        throw err;
      }
      const res = await fetch(authEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-trace-id': traceId,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('vendor-signup-auth-failed', {
          traceId,
          isVendorSignup,
          mode: payload.mode,
          email: typeof payload.email === 'string' ? payload.email : undefined,
          status: res.status,
          error: data?.error,
        });
        throw new Error(data?.error || 'Failed to authenticate');
      }

      if (isVendorSignup) {
        console.info('vendor-signup-auth-success', {
          traceId,
          redirectTo: data?.redirectTo,
          email: typeof payload.email === 'string' ? payload.email : undefined,
        });
      }

      // For signup: follow the server-directed post-signup destination
      if (mode === 'signup') {
        const nextTarget = typeof data?.redirectTo === 'string' && data.redirectTo ? data.redirectTo : '/dashboard/buyer';
        showToast(
          nextTarget === '/vendor/onboarding'
            ? 'Account created successfully! Redirecting to vendor onboarding...'
            : 'Account created successfully! Redirecting to your dashboard...',
          { type: 'success' }
        );
        router.push(nextTarget);
        return;
      }

      // For signin: follow the server-directed destination.
      // This keeps admin logins on /admin and regular users on their dashboards.
      showToast('Signed in successfully', { type: 'success' });
      const nextTarget = typeof data?.redirectTo === 'string' && data.redirectTo
        ? data.redirectTo
        : redirectTarget || '/dashboard';
      router.push(nextTarget);
    } catch (err: unknown) {
      console.error('vendor-signup-auth-exception', {
        traceId,
        mode: payload.mode,
        isVendorSignup,
        error: err,
      });
      setError(getErrorMessage(err, 'Failed to authenticate'));
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
      confirmPassword,
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
          {allowSignup ? (
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
          ) : null}
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

        {allowSignup && mode === 'signup' && (
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

            <VendorSignupSection checked={wantToSignupAsVendor} onChange={setWantToSignupAsVendor} />
          </>
        )}

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          placeholder={mode === 'signin' ? 'Your account password...' : 'Create a password...'}
          showStrength={mode === 'signup'}
        />

        {mode === 'signin' && (
          <div className="flex justify-end text-xs">
            <Link href="/forgot-password" className="font-semibold text-brand-red hover:underline">
              Forgot password?
            </Link>
          </div>
        )}

        {allowSignup && mode === 'signup' && (
          <PasswordField
            id="confirmPassword"
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Repeat your password..."
          />
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
          console.warn('vendor-signup-tos-declined', {
            email: email.trim().toLowerCase() || null,
          });
          setShowVendorTOS(false);
          setWantToSignupAsVendor(false);
        }}
        onAccept={async () => {
          setShowVendorTOS(false);
          console.info('vendor-signup-tos-accepted', {
            email: email.trim().toLowerCase() || null,
          });
          // Password-only flow - no OTP needed
          await submitAuth({
            mode: 'signup',
            email: email.trim(),
            name,
            phone,
            password,
            confirmPassword,
            isVendor: true,
          });
        }}
      />
    </div>
  );
}

