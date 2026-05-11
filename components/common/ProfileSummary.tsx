'use client';

import { useEffect, useState } from 'react';
import { PROFESSION_OPTIONS, type ProfessionType } from '@/lib/professions';

export function ProfileSummary() {
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    phone: string | null;
    profession: ProfessionType;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profession, setProfession] = useState<ProfessionType>('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/auth/profile', { cache: 'no-store' });
        if (!res.ok) {
          setProfile(null);
          return;
        }
        const data = await res.json();
        if (mounted) {
          const nextProfile = {
            name: data?.profile?.name || '',
            email: data?.profile?.email || '',
            phone: data?.profile?.phone || null,
            profession: (data?.profile?.profession || '') as ProfessionType,
          };
          setProfile(nextProfile);
          setName(nextProfile.name);
          setPhone(nextProfile.phone || '');
          setProfession(nextProfile.profession || '');
        }
      } catch (err) {
        console.warn('Failed to load profile summary:', err);
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          profession,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update profile.');
      }

      const updatedProfile = {
        name: data?.profile?.name || name,
        email: data?.profile?.email || profile?.email || '',
        phone: data?.profile?.phone || null,
          profession: (data?.profile?.profession || '') as ProfessionType,
      };

      setProfile(updatedProfile);
      setName(updatedProfile.name);
      setPhone(updatedProfile.phone || '');
      setProfession(updatedProfile.profession || '');
      setMessage(data?.message || 'Profile updated.');
    } catch (err) {
      const nextMessage = err instanceof Error ? err.message : 'Failed to update profile.';
      setError(nextMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="glass-card rounded-[2rem] p-4 shadow-soft">
      <p className="text-sm text-ink">Loading profile…</p>
    </div>
  );

  return (
    <div className="glass-card rounded-[2rem] p-4 shadow-soft">
      <p className="text-xs uppercase tracking-[0.16em] text-smoke">My Profile</p>
      <p className="mt-2 text-sm text-smoke">{profile?.email || '—'}</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="dashboard-profile-name" className="block text-xs font-semibold uppercase tracking-[0.14em] text-smoke">
            Name
          </label>
          <input
            id="dashboard-profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink placeholder:text-smoke focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          />
        </div>

        <div>
          <label htmlFor="dashboard-profile-phone" className="block text-xs font-semibold uppercase tracking-[0.14em] text-smoke">
            Phone
          </label>
          <input
            id="dashboard-profile-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+8801XXXXXXXXX"
            inputMode="tel"
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink placeholder:text-smoke focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          />
        </div>

        <div>
          <label htmlFor="dashboard-profile-profession" className="block text-xs font-semibold uppercase tracking-[0.14em] text-smoke">
            Profession
          </label>
          <select
            id="dashboard-profile-profession"
            value={profession}
            onChange={(event) => setProfession(event.target.value as ProfessionType)}
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          >
            {PROFESSION_OPTIONS.map((option) => (
              <option key={option.value || 'empty'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        {message ? <p className="text-xs text-green-700">{message}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Updating…' : 'Update profile'}
        </button>
      </form>
    </div>
  );
}
