'use client';

import Link from 'next/link';
import { useFeatured } from '@/lib/contexts/featured';

export function AdminFeaturedPreview() {
  const { listings, featuredIds } = useFeatured();

  const featured = featuredIds
    .map((id) => listings.find((l) => l.id === id))
    .filter(Boolean)
    .slice(0, 3) as typeof listings;

  return (
    <div className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white/80 p-6 text-slate-900 shadow-soft">
      <div className="space-y-3">
        <div className="inline-flex rounded-full bg-gold/10 px-3 py-2">
          <span className="text-2xl">⭐</span>
        </div>
        <h2 className="text-xl font-bold text-ink">Featured Cars</h2>
        <p className="text-sm text-smoke">Quick preview of currently featured listings.</p>

        <div className="mt-3 grid gap-3">
          {featured.length === 0 ? (
            <div className="text-sm text-smoke">No featured cars yet.</div>
          ) : (
            featured.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-lg border border-black/5 bg-sand px-3 py-2">
                <div>
                  <div className="text-sm font-semibold text-ink">{f.title}</div>
                  <div className="text-xs text-smoke">৳ {f.price}</div>
                </div>
                <Link href={`/listings/${f.id}`} className="text-sm font-semibold text-moss">View</Link>
              </div>
            ))
          )}
        </div>

        <div className="mt-4">
          <Link href="/admin/featured" className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white">Manage Featured</Link>
        </div>
      </div>
    </div>
  );
}

