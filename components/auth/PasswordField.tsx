'use client';

import { useMemo, useState } from 'react';
import { getPasswordStrength } from './passwordStrength';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
  error?: string;
  showStrength?: boolean;
}

export function PasswordField({
  id,
  label,
  value,
  placeholder,
  autoComplete,
  onChange,
  error,
  showStrength = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  const strength = useMemo(() => (showStrength ? getPasswordStrength(value) : null), [showStrength, value]);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-brand-black">
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full rounded-lg border border-black/10 bg-white/60 px-4 py-3 pr-14 text-brand-black placeholder-brand-gray focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
        />

        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-3 flex items-center text-sm font-medium text-brand-gray transition hover:text-brand-black"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>

      {showStrength && value.length > 0 && strength && (
        <p className="mt-2 text-xs text-brand-gray">
          Password strength: <span className="font-semibold capitalize">{strength}</span>
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
