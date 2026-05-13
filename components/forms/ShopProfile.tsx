'use client';

import { useEffect, useState } from 'react';

interface ShopProfileFormProps {
  profile: ShopProfileData;
  onPhoneUpdate: (phone: string) => Promise<void>;
  isLoading?: boolean;
}

export interface ShopProfileData {
  shopName: string;
  phone: string;
  address: string;
  city: string;
}

export function ShopProfileForm({ profile, onPhoneUpdate, isLoading }: ShopProfileFormProps) {
  const [phone, setPhone] = useState(profile.phone);
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setPhone(profile.phone);
  }, [profile.phone]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsUpdatingPhone(true);

    try {
      await onPhoneUpdate(phone);
      setSuccess('Phone number updated successfully');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update phone number');
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  return (
    <form onSubmit={handlePhoneSubmit} className="glass-card-strong space-y-6 rounded-[2rem] p-8 shadow-strong">
      <div>
        <label htmlFor="shopName" className="block text-sm font-semibold text-slate-700">Shop Name</label>
        <input
          id="shopName"
          type="text"
          value={profile.shopName}
          disabled
          autoComplete="organization"
          className="glass-field mt-2 w-full rounded-lg px-4 py-3 text-sm opacity-80 focus:outline-none"
        />
        <p className="mt-2 text-xs text-slate-500">Shop profile data is read-only here.</p>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">Phone</label>
        <input
          id="phone"
          type="tel"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          inputMode="tel"
          placeholder="+880 17…"
          className="glass-field mt-2 w-full rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-slate-700">Address</label>
          <input
            id="address"
            type="text"
            value={profile.address}
            disabled
            autoComplete="street-address"
            placeholder="ABM Tower, Gulshan…"
            className="glass-field mt-2 w-full rounded-lg px-4 py-3 text-sm opacity-80 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-slate-700">City</label>
          <input
            id="city"
            type="text"
            value={profile.city}
            disabled
            autoComplete="address-level2"
            placeholder="Dhaka…"
            className="glass-field mt-2 w-full rounded-lg px-4 py-3 text-sm opacity-80 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || isUpdatingPhone}
        className="glass-button w-full rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-50"
      >
        {isLoading || isUpdatingPhone ? 'Updating…' : 'Update Phone Number'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-moss">{success}</p>}
    </form>
  );
}

