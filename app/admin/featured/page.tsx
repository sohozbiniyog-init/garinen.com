'use client';

import { useFeatured, ListingMini } from '@/lib/contexts/featured';

export default function AdminFeaturedPage() {
  const { listings, featuredIds, toggleFeatured } = useFeatured();

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Admin</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Featured Cars</h1>
        <p className="mt-2 text-sm text-slate-300">Select which cars appear in the featured carousel.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {listings.map((l: ListingMini) => {
          const active = featuredIds.includes(l.id);
          return (
            <div key={l.id} className="glass-card flex items-center justify-between rounded-2xl p-4">
              <div>
                <div className="text-sm font-semibold text-ink">{l.title}</div>
                <div className="text-xs text-smoke">৳ {l.price} • {l.location}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleFeatured(l.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? 'bg-sky-500 text-white' : 'border border-white/30 bg-white/80 text-ink'}`}>
                  {active ? 'Featured' : 'Make Featured'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

