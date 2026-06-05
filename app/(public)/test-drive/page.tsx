'use client';

import { TestDriveForm, type TestDriveFormData } from '@/components/forms/TestDriveForm';
import { BANGLADESH_DIVISIONS } from '@/lib/config/divisions';
import { useEffect, useMemo, useState } from 'react';

type VehicleCondition = 'NEW' | 'USED' | 'RECONDITIONED';

interface Listing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: VehicleCondition;
  location: string;
  shopName: string;
}

const budgetToRange: Record<string, { min: number; max: number }> = {
  '0 - 10 Lakh': { min: 0, max: 1_000_000 },
  '10 - 20 Lakh': { min: 1_000_000, max: 2_000_000 },
  '20 - 30 Lakh': { min: 2_000_000, max: 3_000_000 },
  '30 - 50 Lakh': { min: 3_000_000, max: 5_000_000 },
  '50+ Lakh': { min: 5_000_000, max: Infinity },
};

const brands = [
  'Audi', 'BMW', 'Chevrolet', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Kia',
  'Lexus', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Suzuki', 'Tata', 'Toyota',
];

const conditionOptions = [
  { value: 'all', label: 'All Conditions' },
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'reconditioned', label: 'Reconditioned' },
] as const;

function formatBDT(n: number) {
  return n.toLocaleString('en-IN');
}

export default function TestDrivePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  const [brandFilter, setBrandFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');

  const [profileData, setProfileData] = useState<Partial<TestDriveFormData> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/listings');
        if (res.ok) {
          const data = await res.json();
          setListings(
            data.map((l: Record<string, unknown>) => ({
              ...l,
              price: Number(l.price),
            })) as Listing[]
          );
        }
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setLoadingListings(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const p = data?.profile;
        if (p) {
          setProfileData({
            name: p.name || '',
            email: p.email || '',
            phone: p.phone || '',
            profession: p.profession || 'OTHER',
          });
        }
      } catch {
        // not authenticated — fine
      }
    };
    loadProfile();
  }, []);

  const filtered = useMemo(() => {
    let results = listings;

    if (brandFilter) {
      results = results.filter((l) => l.brand === brandFilter);
    }
    if (conditionFilter !== 'all') {
      const mapped = conditionFilter.toUpperCase() as VehicleCondition;
      results = results.filter((l) => l.condition === mapped);
    }
    if (locationFilter) {
      results = results.filter((l) => l.location === locationFilter);
    }
    if (budgetFilter && budgetToRange[budgetFilter]) {
      const { min, max } = budgetToRange[budgetFilter];
      results = results.filter((l) => l.price >= min && l.price <= max);
    }

    return results;
  }, [listings, brandFilter, conditionFilter, locationFilter, budgetFilter]);

  const selectedListing = useMemo(
    () => listings.find((l) => l.id === selectedListingId) || null,
    [listings, selectedListingId]
  );

  const handleSubmit = async (data: TestDriveFormData): Promise<boolean | void> => {
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      const body: Record<string, unknown> = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        preferredDate: data.preferredDate || null,
        preferredTime: data.preferredTime || null,
        listingId: selectedListingId || null,
        notes: data.notes || null,
      };

      const res = await fetch('/api/test-drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit');
      }

      setSubmitMessage('Your test drive request has been submitted! We will contact you shortly.');
      return true;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Experience</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Book a Test Drive</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Pick a car from our listings and schedule a test drive at your convenience.
        </p>
      </section>

      {submitMessage && (
        <div className="glass-card mb-8 rounded-[2rem] p-8 text-center shadow-soft">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-moss/20">
              <svg className="h-7 w-7 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-ink">Request Sent!</h2>
          <p className="mt-2 text-sm text-slate-600">{submitMessage}</p>
        </div>
      )}

      {!submitMessage && (
        <>
          {/* Car Picker Section */}
          <section className="mb-10">
            <h2 className="mb-6 text-2xl font-bold text-white">Select a Car</h2>

            {/* Filters */}
            <div className="glass-card mb-6 grid gap-4 rounded-[2rem] p-5 shadow-soft md:grid-cols-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Brand</label>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="glass-field w-full rounded-xl px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
                >
                  <option value="">All Brands</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Condition</label>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="glass-field w-full rounded-xl px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
                >
                  {conditionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="glass-field w-full rounded-xl px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
                >
                  <option value="">All Locations</option>
                  {BANGLADESH_DIVISIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Price Range</label>
                <select
                  value={budgetFilter}
                  onChange={(e) => setBudgetFilter(e.target.value)}
                  className="glass-field w-full rounded-xl px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
                >
                  <option value="">All Prices</option>
                  {Object.keys(budgetToRange).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Listing Cards */}
            {loadingListings ? (
              <div className="glass-card rounded-[2rem] p-12 text-center shadow-soft">
                <p className="text-lg font-semibold text-ink">Loading available cars...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="glass-card rounded-[2rem] p-12 text-center shadow-soft">
                <p className="text-lg font-semibold text-ink">No cars match your filters</p>
                <p className="mt-2 text-sm text-slate-600">Try adjusting the criteria above.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((listing) => {
                  const isSelected = selectedListingId === listing.id;
                  return (
                    <button
                      key={listing.id}
                      type="button"
                      onClick={() => setSelectedListingId(isSelected ? null : listing.id)}
                      className={`glass-card w-full rounded-[1.5rem] border p-5 text-left transition ${
                        isSelected
                          ? 'border-moss ring-2 ring-moss/30 shadow-md'
                          : 'border-black/10 shadow-soft hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-ink truncate">{listing.title}</h3>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {listing.year} &middot; {listing.brand} {listing.model}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="shrink-0 rounded-full bg-moss px-2.5 py-0.5 text-[11px] font-semibold text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-semibold text-ink">৳ {formatBDT(listing.price)}</span>
                        <span className="text-xs text-slate-500">{listing.location}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Form Section */}
          {selectedListing && (
            <section className="max-w-2xl">
              <h2 className="mb-6 text-2xl font-bold text-white">Your Details</h2>
              <TestDriveForm
                initialData={profileData || undefined}
                selectedCar={{ title: selectedListing.title, price: formatBDT(selectedListing.price) }}
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
              />
            </section>
          )}

          {submitError && (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {submitError}
            </div>
          )}
        </>
      )}
    </main>
  );
}
