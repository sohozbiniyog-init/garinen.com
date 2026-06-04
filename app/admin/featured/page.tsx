'use client';

import { useFeatured } from '@/lib/contexts/featured';
import { showToast } from '@/components/common/Toast';

export default function AdminFeaturedPage() {
  const { listings, featuredIds, loading, error, toggleFeatured } = useFeatured();

  if (loading) {
    return (
      <main className="min-h-screen w-full px-6 py-10 lg:px-10">
        <section className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Admin</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Featured Cars</h1>
        </section>
        <div className="text-center text-slate-400">Loading featured listings...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen w-full px-6 py-10 lg:px-10">
        <section className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Admin</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Featured Cars</h1>
        </section>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          Error: {error}
        </div>
      </main>
    );
  }

  const handleToggleFeatured = async (listingId: string) => {
    try {
      await toggleFeatured(listingId);
      showToast(
        featuredIds.includes(listingId) ? 'Removed from featured' : 'Added to featured',
        { type: 'success' }
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update featured status',
        { type: 'error' }
      );
    }
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Admin</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Featured Cars</h1>
        <p className="mt-2 text-sm text-slate-300">
          Select and order cars that appear in the featured carousel.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {listings.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-400">
            No approved listings available to feature.
          </div>
        ) : (
          listings.map((listing) => {
            const active = featuredIds.includes(listing.id);
            return (
              <div key={listing.id} className="glass-card flex items-center justify-between rounded-2xl p-4">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {listing.brand} {listing.model}
                  </div>
                  <div className="text-xs text-slate-400">
                    ৳{Number(listing.price).toLocaleString()} • {listing.location}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{listing.title}</div>
                </div>
                <button
                  onClick={() => handleToggleFeatured(listing.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    active
                      ? 'bg-sky-500 text-white hover:bg-sky-600'
                      : 'border border-white/30 bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {active ? '✓ Featured' : '+ Feature'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}


