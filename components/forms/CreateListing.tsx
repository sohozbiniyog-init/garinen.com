'use client';

import { useState } from 'react';

interface CreateListingFormProps {
  onSubmit: (data: ListingFormData) => void;
  isLoading?: boolean;
}

export interface ListingFormData {
  title: string;
  brand: string;
  model: string;
  year: number;
  price: string;
  mileage: string;
  location: string;
}

export function CreateListingForm({ onSubmit, isLoading }: CreateListingFormProps) {
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    location: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card space-y-6 rounded-[2rem] p-8 shadow-soft">
      <div>
        <label className="block text-sm font-semibold text-ink">Listing Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Toyota Corolla 2022 - Excellent Condition"
          className="glass-field mt-2 w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-ink">Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Toyota"
            className="glass-field mt-2 w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink">Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Corolla"
            className="glass-field mt-2 w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-ink">Year</label>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="glass-field mt-2 w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
            required
          >
            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink">Price (৳)</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="2,500,000"
            className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink">Mileage (km)</label>
        <input
          type="text"
          name="mileage"
          value={formData.mileage}
          onChange={handleChange}
          placeholder="45,000"
          className="glass-field mt-2 w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Dhaka"
          className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="glass-button w-full rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-50"
      >
        {isLoading ? 'Creating...' : 'Create Listing'}
      </button>
    </form>
  );
}

