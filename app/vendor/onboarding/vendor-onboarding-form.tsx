'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BANGLADESH_DIVISIONS } from '@/lib/config/divisions';
import { normalizeBangladeshPhone } from '@/lib/auth/phone';
import { isVendorGracePeriodExpired, getGracePeriodStatus } from '@/lib/auth/vendor-grace-period';

const CATEGORY_OPTIONS = [
  { value: 'new', label: 'নতুন গাড়ি বিক্রেতা' },
  { value: 'used', label: 'ব্যবহৃত গাড়ি বিক্রেতা' },
  { value: 'reconditioned', label: 'রি-কন্ডিশন গাড়ী বিক্রেতা' },
] as const;

export default function VendorOnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier') || '';

  const createTraceId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `trace_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  };

  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [locationDivision, setLocationDivision] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gracePeriodExpired, setGracePeriodExpired] = useState(false);
  const [remainingDays, setRemainingDays] = useState(7);
  const [checkingGracePeriod, setCheckingGracePeriod] = useState(true);

  // Check grace period on mount
  useEffect(() => {
    const checkGracePeriod = async () => {
      try {
        const userRes = await fetch('/api/auth/me', { method: 'GET' });
        if (!userRes.ok) {
          router.push('/login');
          return;
        }

        const userData = await userRes.json();
        const onboardingCreatedAt = userData.vendorOnboardingCreatedAt ? new Date(userData.vendorOnboardingCreatedAt) : null;

        if (isVendorGracePeriodExpired(onboardingCreatedAt)) {
          setGracePeriodExpired(true);
          console.warn('vendor-grace-period-expired-on-form', {
            identifier,
            gracePeriodStarted: onboardingCreatedAt,
          });
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard/buyer');
          }, 3000);
        } else {
          const status = getGracePeriodStatus(onboardingCreatedAt);
          setRemainingDays(status.remainingDays);
          setGracePeriodExpired(false);
        }
      } catch (err) {
        console.error('grace-period-check-failed', err);
        // Continue anyway - grace period check is not critical
      } finally {
        setCheckingGracePeriod(false);
      }
    };

    checkGracePeriod();
  }, [router, identifier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const traceId = createTraceId();

    if (!shopName.trim()) {
      setError('Shop name is required');
      return;
    }

    if (!category) {
      setError('Business category is required');
      return;
    }

    if (!description.trim()) {
      setError('Shop description is required');
      return;
    }

    if (!locationDivision) {
      setError('Division is required');
      return;
    }

    if (!locationAddress.trim()) {
      setError('Detailed address is required');
      return;
    }

    if (!phone.trim()) {
      setError('Contact phone is required');
      return;
    }

    const normalizedPhone = normalizeBangladeshPhone(phone);
    if (!normalizedPhone) {
      setError('Invalid numbers');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/vendor/submit-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-trace-id': traceId,
        },
        body: JSON.stringify({
          identifier,
          shopName,
          category,
          description,
          locationDivision,
          locationAddress: locationAddress.trim(),
          phone: normalizedPhone,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error('vendor-onboarding-submit-failed', {
          traceId,
          identifier,
          status: res.status,
          error: err?.error,
        });
        throw new Error(err?.error || 'Failed to submit vendor information');
      }

      console.info('vendor-onboarding-submit-success', {
        traceId,
        identifier,
      });

      router.push(`/vendor/submitted?identifier=${encodeURIComponent(identifier)}`);
    } catch (err: unknown) {
      console.error('vendor-onboarding-submit-exception', {
        traceId,
        identifier,
        error: err,
      });
      setError(err instanceof Error ? err.message : 'Failed to submit vendor information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
      <div className="glass-card-strong w-full rounded-[2rem] p-6 shadow-strong sm:p-8">
        {/* Grace Period Warning */}
        {!checkingGracePeriod && !gracePeriodExpired && remainingDays <= 3 && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <p className="text-sm font-semibold text-amber-700">
              ⏰ গুরুত্বপূর্ণ: আপনার কাছে মাত্র <strong>{remainingDays} দিন</strong> বাকি আছে অনবোর্ডিং সম্পন্ন করতে।
            </p>
            <p className="mt-1 text-xs text-amber-600">
              {remainingDays} দিনের পরে আপনার ভেন্ডর অ্যাকাউন্ট বন্ধ করা হবে এবং সাধারণ ক্রেতা হিসেবে আচরণ করা হবে।
            </p>
          </div>
        )}

        {/* Grace Period Expired */}
        {gracePeriodExpired && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">
              ❌ আপনার গ্রেস পিরিয়ড শেষ হয়েছে
            </p>
            <p className="mt-1 text-xs text-red-600">
              আপনি সময়মতো অনবোর্ডিং সম্পন্ন করেননি। আপনার অ্যাকাউন্ট সাধারণ ক্রেতা হিসেবে ডাউনগ্রেড করা হয়েছে। আপনি এখন ড্যাশবোর্ডে পুনর্নির্দেশিত হচ্ছেন...
            </p>
          </div>
        )}

        {/* Regular Display */}
        {!gracePeriodExpired && (
          <>
            <div className="mb-8 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">ভেন্ডর অনবোর্ডিং</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">আপনার ব্যবসায়িক তথ্য পূরণ করুন</h1>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                বিভাগ, ঠিকানা, এবং ব্যবসার ধরন দিন। আমরা শুধুমাত্র আপনার জমা দেওয়া তথ্যই সংরক্ষণ করব।
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="shopName" className="block text-sm font-semibold text-slate-700">
              দোকানের নাম <span className="text-red-500">*</span>
            </label>
            <input
              id="shopName"
              name="shopName"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="আপনার ব্যবসার নাম"
              className="glass-field mt-2 w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-slate-700">
              ব্যবসায়িক বিভাগ <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="glass-field hero-select mt-2 w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              required
            >
              <option value="">বিভাগ নির্বাচন করুন</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
              ব্যবসার বর্ণনা <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="আপনার ব্যবসা সম্পর্কে বলুন..."
              rows={5}
              className="glass-field mt-2 w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              required
            />
            <p className="mt-2 text-xs text-slate-500">{description.length} / ৫০০ অক্ষর</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <label htmlFor="locationDivision" className="block text-sm font-semibold text-slate-700">
                প্রধান অবস্থান - বিভাগ <span className="text-red-500">*</span>
              </label>
              <select
                id="locationDivision"
                name="locationDivision"
                value={locationDivision}
                onChange={(e) => setLocationDivision(e.target.value)}
                className="glass-field hero-select mt-2 w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
                required
              >
                <option value="">বিভাগ নির্বাচন করুন</option>
                {BANGLADESH_DIVISIONS.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="locationAddress" className="block text-sm font-semibold text-slate-700">
                বিস্তারিত ঠিকানা <span className="text-red-500">*</span>
              </label>
              <input
                id="locationAddress"
                name="locationAddress"
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="রোড, ব্লক, এলাকা, ভবন"
                className="glass-field mt-2 w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
              যোগাযোগ নম্বর <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801234567890"
              className="glass-field mt-2 w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              required
            />
          </div>

          {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">{error}</p>}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="glass-button flex-1 rounded-full px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'জমা দিচ্ছি...' : 'তথ্য জমা দিন'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-slate-300 bg-white/80 px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-white sm:w-auto"
            >
              ফিরে যান
            </button>
          </div>
        </form>

            <p className="mt-8 text-center text-xs text-slate-500">
              আপনার তথ্য সুরক্ষিত এবং শুধুমাত্র প্রশাসক দলের দ্বারা দেখা হবে।
            </p>
          </>
        )}
      </div>
    </main>
  );
}
