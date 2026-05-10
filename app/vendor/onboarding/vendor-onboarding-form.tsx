'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VendorOnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier') || '';

  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!shopName.trim()) {
      setError('Shop name is required');
      return;
    }

    if (!description.trim()) {
      setError('Shop description is required');
      return;
    }

    if (!location.trim()) {
      setError('Location is required');
      return;
    }

    if (!phone.trim()) {
      setError('Contact phone is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/vendor/submit-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          shopName,
          description,
          location,
          phone,
          category,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Failed to submit vendor information');
      }

      router.push(`/vendor/submitted?identifier=${encodeURIComponent(identifier)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit vendor information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-10">
      <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">ভেন্ডর অনবোর্ডিং</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">আপনার ব্যবসায়িক তথ্য পূরণ করুন</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            সংক্ষিপ্ত তথ্য জমা দিন। প্রশাসক দল পরে পর্যালোচনা করবে।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="shopName" className="block text-sm font-semibold text-ink">
              দোকানের নাম *
            </label>
            <input
              id="shopName"
              name="shopName"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="আপনার ব্যবসার নাম"
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-ink">
              ব্যবসায়িক বিভাগ
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white"
            >
              <option value="">বিভাগ নির্বাচন করুন</option>
              <option value="used-cars">ব্যবহৃত গাড়ি বিক্রয়কারী</option>
              <option value="new-cars">নতুন গাড়ি বিতরণকারী</option>
              <option value="parts">গাড়ির যন্ত্রাংশ বিক্রেতা</option>
              <option value="service">গাড়ি মেরামত ও সেবা</option>
              <option value="financing">আর্থিক সেবা</option>
              <option value="other">অন্যান্য</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-ink">
              ব্যবসার বর্ণনা *
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="আপনার ব্যবসা সম্পর্কে বলুন... (কমপক্ষে ৫০ অক্ষর)"
              rows={5}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400"
            />
            <p className="mt-1 text-xs text-slate-400">{description.length} / ৫০০ অক্ষর</p>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-ink">
              প্রধান অবস্থান *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="শহর, এলাকা বা অঞ্চল"
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-ink">
              যোগাযোগ নম্বর *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801234567890"
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400"
            />
          </div>

          {error && <p className="text-sm font-semibold text-red-200">{error}</p>}

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'জমা দিচ্ছি...' : 'তথ্য জমা দিন'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-white/10 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              ফিরে যান
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          আপনার তথ্য সুরক্ষিত এবং শুধুমাত্র প্রশাসক দলের দ্বারা দেখা হবে।
        </p>
      </div>
    </main>
  );
}
