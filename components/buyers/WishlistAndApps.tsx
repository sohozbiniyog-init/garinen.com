"use client";

import { useEffect, useState } from 'react';
import { getWishlist, WishlistItem } from '@/lib/utils/wishlist';
import { getEmiApps, EmiApplication } from '@/lib/config/emi-apps';
import Link from 'next/link';

export default function BuyerWishlistAndApps() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [apps, setApps] = useState<EmiApplication[]>([]);

  useEffect(() => {
    setWishlist(getWishlist());
    setApps(getEmiApps());
  }, []);

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-2">
      <div className="rounded-[1.5rem] border border-black/10 bg-white/80 p-6 text-ink shadow-soft">
        <h3 className="text-lg font-bold text-ink">Wishlist</h3>
        {wishlist.length === 0 ? (
          <p className="mt-3 text-sm text-smoke">You have no saved cars yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {wishlist.map((w) => (
              <li key={w.id} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-ink">{w.title}</div>
                  <div className="text-xs text-smoke">{w.brand} • {w.model} • ৳ {typeof w.price === 'number' ? w.price.toLocaleString('en-IN') : w.price}</div>
                </div>
                <Link href={`/listings/${w.id}`} className="text-sm font-semibold text-moss">View</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-[1.5rem] border border-black/10 bg-white/80 p-6 text-ink shadow-soft">
        <h3 className="text-lg font-bold text-ink">EMI Applications</h3>
        {apps.length === 0 ? (
          <p className="mt-3 text-sm text-smoke">No EMI applications yet. Save a draft from a listing.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {apps.map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-ink">{a.title || 'Untitled Application'}</div>
                  <div className="text-xs text-smoke">{new Date(a.createdAt).toLocaleString()} • {a.listingId}</div>
                </div>
                <div className="text-sm font-semibold text-ink">{a.status}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

