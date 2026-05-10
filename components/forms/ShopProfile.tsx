'use client';

import { useState } from 'react';

interface ShopProfileFormProps {
  shopName: string;
  onUpdate: (data: ShopProfileData) => void;
  isLoading?: boolean;
}

export interface ShopProfileData {
  shopName: string;
  phone: string;
  address: string;
  city: string;
}

export function ShopProfileForm({ shopName: initialShopName, onUpdate, isLoading }: ShopProfileFormProps) {
  const [formData, setFormData] = useState<ShopProfileData>({
    shopName: initialShopName,
    phone: '',
    address: '',
    city: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card-strong space-y-6 rounded-[2rem] p-8 shadow-strong">
      <div>
        <label htmlFor="shopName" className="block text-sm font-semibold text-slate-700">Shop Name</label>
        <input
          id="shopName"
          type="text"
          name="shopName"
          value={formData.shopName}
          onChange={handleChange}
          autoComplete="organization"
          className="glass-field mt-2 w-full rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">Phone</label>
        <input
          id="phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
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
            name="address"
            value={formData.address}
            onChange={handleChange}
            autoComplete="street-address"
            placeholder="ABM Tower, Gulshan…"
            className="glass-field mt-2 w-full rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            required
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-slate-700">City</label>
          <input
            id="city"
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            autoComplete="address-level2"
            placeholder="Dhaka…"
            className="glass-field mt-2 w-full rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="glass-button w-full rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-50"
      >
        {isLoading ? 'Updating…' : 'Update Shop Profile'}
      </button>
    </form>
  );
}

