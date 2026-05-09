'use client';

import { CreateListingForm, ListingFormData } from '@/components/create-listing-form';
import { SellerListingCard } from '@/components/seller-listing-card';
import { useState } from 'react';

interface Listing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD';
  createdAt: string;
}

const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Toyota Corolla 2022 - Excellent Condition',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    price: '2,500,000',
    status: 'APPROVED',
    createdAt: 'Apr 28'
  },
  {
    id: '2',
    title: 'Honda Civic 2020 - Well Maintained',
    brand: 'Honda',
    model: 'Civic',
    year: 2020,
    price: '2,200,000',
    status: 'PENDING',
    createdAt: 'May 1'
  }
];

export default function SellerListingsPage() {
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [showForm, setShowForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleCreateListing = (data: ListingFormData) => {
    const newListing: Listing = {
      id: String(Date.now()),
      title: data.title,
      brand: data.brand,
      model: data.model,
      year: data.year,
      price: data.price,
      status: 'PENDING',
      createdAt: 'Just now'
    };
    setListings((current) => [newListing, ...current]);
    setShowForm(false);
    setStatusMessage('Listing created. It will appear on the marketplace after admin approval.');
  };

  const handleEdit = (id: string) => {
    setStatusMessage(`Editing listing ${id} will be available next.`);
  };

  const handleDelete = (id: string) => {
    setListings((current) => current.filter((l) => l.id !== id));
    setStatusMessage('Listing deleted.');
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Vendor Tools</p>
        <h1 className="mt-3 text-4xl font-bold text-white">My Listings</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Manage your car listings. New listings are pending admin approval before appearing on the marketplace.
        </p>
      </section>

      <div className="mb-10 flex items-center gap-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="glass-button rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
        >
          {showForm ? 'Cancel' : '+ New Listing'}
        </button>
        <span className="text-sm text-smoke">
          {listings.length} listing{listings.length !== 1 ? 's' : ''} • {listings.filter((l) => l.status === 'APPROVED').length} approved
        </span>
      </div>

      {statusMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950" role="status" aria-live="polite">
          {statusMessage}
        </div>
      )}

      {showForm && (
        <div className="mb-10">
          <CreateListingForm onSubmit={handleCreateListing} />
        </div>
      )}

      {listings.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-12 text-center shadow-soft">
          <p className="text-lg font-semibold text-ink">No listings yet</p>
          <p className="mt-2 text-sm text-smoke">Create your first listing to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <SellerListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              brand={listing.brand}
              model={listing.model}
              year={listing.year}
              price={listing.price}
              status={listing.status}
              createdAt={listing.createdAt}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
}
