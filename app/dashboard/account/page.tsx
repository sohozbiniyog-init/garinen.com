'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Password strength validation
const validatePasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const allPass = Object.values(checks).every(Boolean);
  
  return { checks, passedChecks, allPass };
};

export default function AccountPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const passwordStrength = validatePasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Client-side validation
    if (!currentPassword) {
      setError('Current password is required');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setLoading(false);
      setError('New passwords do not match.');
      return;
    }

    if (!passwordStrength.allPass) {
      setLoading(false);
      setError('Password does not meet security requirements. Please check the requirements below.');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to change password');
      }

      setMessage(data?.message || 'Password updated successfully.');
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordRequirements(false);
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/login?message=password-updated');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mx-auto mb-10 max-w-5xl">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Account settings</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Manage your account</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Keep your login details current, maintain a strong password, and use this page for account recovery guidance.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
        <div className="glass-card rounded-[2rem] p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Password</p>
          <h2 className="mt-3 text-xl font-bold text-white">Change your password</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Update your current password here. For safety, the session will be refreshed after the update.
          </p>
        </div>
        <div className="glass-card rounded-[2rem] p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recovery</p>
          <h2 className="mt-3 text-xl font-bold text-white">Need a reset link?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            If you lose access, go back to sign in and request a recovery email from the forgot password flow.
          </p>
        </div>
        <div className="glass-card rounded-[2rem] p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Access</p>
          <h2 className="mt-3 text-xl font-bold text-white">Session safety</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Signing out or changing password ends the current session and sends you back to the login page.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-5xl rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-soft backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-gray">Security</p>
            <h2 className="mt-2 text-2xl font-bold text-brand-black">Change password</h2>
            <p className="mt-2 text-sm leading-6 text-brand-gray">
              Confirm your current password, then choose a stronger one. You will be signed out after saving.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-brand-red transition hover:underline">
            Back to dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label htmlFor="currentPassword" className="block text-sm font-semibold text-brand-black">Current password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Your current password"
              className="mt-2 w-full rounded-lg border border-black/10 bg-white/60 px-4 py-3 text-brand-black placeholder-brand-gray focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-brand-black">New password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              onFocus={() => setShowPasswordRequirements(true)}
              autoComplete="new-password"
              placeholder="Create a new password"
              className="mt-2 w-full rounded-lg border border-black/10 bg-white/60 px-4 py-3 text-brand-black placeholder-brand-gray focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-brand-black">Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Repeat the new password"
              className="mt-2 w-full rounded-lg border border-black/10 bg-white/60 px-4 py-3 text-brand-black placeholder-brand-gray focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
            />
            {confirmPassword && !passwordsMatch && <p className="mt-1 text-xs text-red-600">Passwords do not match</p>}
            {passwordsMatch && <p className="mt-1 text-xs text-green-600">Passwords match ✓</p>}
          </div>

          {/* Password strength requirements */}
          {showPasswordRequirements && newPassword && (
            <div className="lg:col-span-2 rounded-lg bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-brand-black">Password requirements:</p>
              <ul className="space-y-2 text-sm">
                <li className={`flex items-center gap-2 ${passwordStrength.checks.length ? 'text-green-700' : 'text-red-600'}`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${passwordStrength.checks.length ? 'bg-green-700' : 'bg-red-600'}`}></span>
                  At least 8 characters
                </li>
                <li className={`flex items-center gap-2 ${passwordStrength.checks.uppercase ? 'text-green-700' : 'text-red-600'}`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${passwordStrength.checks.uppercase ? 'bg-green-700' : 'bg-red-600'}`}></span>
                  At least one uppercase letter (A-Z)
                </li>
                <li className={`flex items-center gap-2 ${passwordStrength.checks.lowercase ? 'text-green-700' : 'text-red-600'}`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${passwordStrength.checks.lowercase ? 'bg-green-700' : 'bg-red-600'}`}></span>
                  At least one lowercase letter (a-z)
                </li>
                <li className={`flex items-center gap-2 ${passwordStrength.checks.number ? 'text-green-700' : 'text-red-600'}`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${passwordStrength.checks.number ? 'bg-green-700' : 'bg-red-600'}`}></span>
                  At least one number (0-9)
                </li>
                <li className={`flex items-center gap-2 ${passwordStrength.checks.special ? 'text-green-700' : 'text-red-600'}`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${passwordStrength.checks.special ? 'bg-green-700' : 'bg-red-600'}`}></span>
                  At least one special character (!@#$%^&* etc.)
                </li>
              </ul>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div 
                  className={`h-full transition-all ${
                    passwordStrength.passedChecks <= 2 ? 'w-1/3 bg-red-600' :
                    passwordStrength.passedChecks <= 3 ? 'w-2/3 bg-yellow-600' :
                    passwordStrength.passedChecks <= 4 ? 'w-5/6 bg-blue-600' :
                    'w-full bg-green-600'
                  }`}
                />
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Strength: {passwordStrength.passedChecks}/5 requirements met
              </p>
            </div>
          )}

          <div className="lg:col-span-2 flex flex-col gap-3">
            {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
            {message ? <p className="text-sm font-semibold text-success" role="status" aria-live="polite">{message}</p> : null}

            <button
              type="submit"
              disabled={loading || !passwordStrength.allPass}
              className="flex w-full items-center justify-center rounded-lg bg-moss px-6 py-4 font-semibold text-white transition hover:translate-y-[-1px] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="font-semibold text-brand-gray transition hover:underline">
            Need a reset link?
          </Link>
          <Link href="/login" className="font-semibold text-brand-gray transition hover:underline">
            Back to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
