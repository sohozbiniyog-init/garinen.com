'use client';

import { AdminListingCard } from '@/components/admin-listing-card';
import { useState } from 'react';

// Mock pending listings
const mockPendingListings = [
  {
    id: '1',
    title: 'Toyota Corolla 2022 - Excellent Condition',
    brand: 'Toyota',
    model: 'Corolla',
    price: '2,500,000',
    shopName: 'Elite Motors',
    createdAt: 'May 2, 2:30 PM'
  },
  {
    id: '2',
    title: 'Honda Civic 2020 - Well Maintained',
    brand: 'Honda',
    model: 'Civic',
    price: '2,200,000',
    shopName: 'City Auto Sales',
    createdAt: 'May 1, 4:15 PM'
  },
  {
    id: '3',
    title: 'Hyundai Elantra 2021 - Original Owner',
    brand: 'Hyundai',
    model: 'Elantra',
    price: '1,800,000',
    shopName: 'Supreme Automobiles',
    createdAt: 'Apr 30, 10:45 AM'
  }
];

export default function AdminListingsPage() {
  const [listings, setListings] = useState(mockPendingListings);
  const [statusMessage, setStatusMessage] = useState('');

  const handleApprove = (id: string) => {
    setListings(listings.filter((l) => l.id !== id));
    setStatusMessage(`Listing ${id} approved.`);
  };

  const handleReject = (id: string) => {
    setListings(listings.filter((l) => l.id !== id));
    setStatusMessage(`Listing ${id} rejected.`);
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Moderation</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Pending Listings</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Review and approve or reject new car listings before they appear on the public marketplace.
        </p>
      </section>

      {statusMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950" role="status" aria-live="polite">
          {statusMessage}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-8 text-center shadow-soft">
          <p className="text-sm text-smoke">No pending listings to review.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <AdminListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              brand={listing.brand}
              model={listing.model}
              price={listing.price}
              status="PENDING"
              shopName={listing.shopName}
              createdAt={listing.createdAt}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </main>
  );
}
