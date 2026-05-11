'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const budgetRanges = [
  '0 - 10 Lakh',
  '10 - 20 Lakh',
  '20 - 30 Lakh',
  '30 - 50 Lakh',
  '50+ Lakh'
];

const brandOptions = [
  'All Brands',
  'Audi',
  'BMW',
  'Chevrolet',
  'Ford',
  'GMC',
  'Honda',
  'Hyundai',
  'Kia',
  'Lexus',
  'Mazda',
  'Mercedes-Benz',
  'Mitsubishi',
  'Nissan',
  'Suzuki',
  'Tata',
  'Toyota'
];

export default function HeroSearchForm() {
  const router = useRouter();
  const [budget, setBudget] = useState('');
  const [brand, setBrand] = useState('All Brands');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (budget) params.append('budget', budget);
    if (brand && brand !== 'All Brands') params.append('brand', brand);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-[2rem] p-8 shadow-lg border border-white/10 backdrop-blur-2xl" style={{ background: 'rgba(15, 23, 42, 0.22)' }}>
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Find your right car</p>
        <h2 className="mt-2 text-2xl font-bold text-white">New Car</h2>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Budget Dropdown */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-white mb-2">Select Budget</label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
              className="hero-select w-full rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.92)' }}
          >
            <option value="">Select Budget</option>
            {budgetRanges.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Dropdown */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-white mb-2">Brand</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
              className="hero-select w-full rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.92)' }}
          >
            {brandOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="glass-button w-full rounded-lg py-3 font-semibold transition hover:scale-[1.01]"
        >
          Search
        </button>

        {/* Advanced Search Link */}
        <div className="text-center pt-2">
          <Link href="/listings" className="text-xs font-semibold text-brand-red transition hover:text-white hover:underline">
            Advanced Search →
          </Link>
        </div>
      </form>
    </div>
  );
}

