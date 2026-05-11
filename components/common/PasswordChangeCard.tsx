'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const validatePasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const allPass = Object.values(checks).every(Boolean);

  return { checks, passedChecks, allPass };
};

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

export function PasswordChangeCard() {
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
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to change password');
      }

      setMessage(data?.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordRequirements(false);

      setTimeout(() => {
        router.push('/login?message=password-updated');
      }, 2000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to change password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="account-settings" className="mx-auto mt-6 max-w-5xl rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-soft backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-brand-gray">Security</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-black">Change password</h2>
          <p className="mt-2 text-sm leading-6 text-brand-gray">
            Confirm your current password, then choose a stronger one. You will be signed out after saving.
          </p>
        </div>
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
          <label htmlFor="newPassword" className="mb-2 block min-h-[3rem] text-sm font-semibold leading-5 text-brand-black">New password</label>
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
          <label htmlFor="confirmPassword" className="mb-2 block min-h-[3rem] text-sm font-semibold leading-5 text-brand-black">Confirm new password</label>
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
    </section>
  );
}
