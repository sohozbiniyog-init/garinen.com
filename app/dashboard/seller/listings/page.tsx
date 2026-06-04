'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { showToast } from '@/components/common/Toast';

interface VendorListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: string;
  condition: 'NEW' | 'USED' | 'RECONDITIONED';
  mileage: number | null;
  location: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD';
  adminNotes: string | null;
  hasActiveBooking: boolean;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  SOLD: 'bg-blue-100 text-blue-800',
};

export default function SellerListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<VendorListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccessAndFetchListings = async () => {
      try {
        // Check access
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }

        const meData = await meRes.json();
        const role = meData?.claims?.role;
        const vendorStatus = meData?.profile?.vendorApprovalStatus;

        if (role !== 'VENDOR' || vendorStatus !== 'APPROVED') {
          showToast('Only approved vendors can view listings', { type: 'error' });
          router.push('/dashboard');
          return;
        }

        setHasAccess(true);

        // Fetch listings
        const listingsRes = await fetch('/api/vendor/listings');
        if (listingsRes.ok) {
          const data = await listingsRes.json();
          setListings(data.listings || []);
        }
      } catch (error) {
        console.error('Failed to load listings:', error);
        showToast('Failed to load listings', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    checkAccessAndFetchListings();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen w-full px-6 py-10 lg:px-10">
        <section className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Vendor Tools</p>
          <h1 className="mt-3 text-4xl font-bold text-white">My Listings</h1>
        </section>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading listings...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const approvedCount = listings.filter((l) => l.status === 'APPROVED').length;
  const pendingCount = listings.filter((l) => l.status === 'PENDING').length;

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Vendor Tools</p>
        <h1 className="mt-3 text-4xl font-bold text-white">My Listings</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Manage your vehicle listings. New listings are pending admin approval before appearing on the marketplace.
        </p>
      </section>

      <div className="mb-10 flex items-center gap-4 flex-wrap">
        <Link href="/dashboard/seller/listings/new">
          <button className="glass-button rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]">
            + New Listing
          </button>
        </Link>
        <span className="text-sm text-smoke">
          {listings.length} listing{listings.length !== 1 ? 's' : ''} • {approvedCount} approved • {pendingCount} pending
        </span>
      </div>

      <div className="mb-6 rounded-2xl border border-sky-200/40 bg-sky-50/70 px-4 py-3 text-sm text-slate-700">
        New listings will be reviewed by our admin team. You can edit draft and pending listings until they are approved.
      </div>

      {listings.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-12 text-center shadow-soft">
          <p className="text-lg font-semibold text-ink">No listings yet</p>
          <p className="mt-2 text-sm text-smoke">Create your first listing to get started.</p>
          <Link href="/dashboard/seller/listings/new">
            <button className="mt-6 glass-button rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]">
              Create Listing
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="glass-card rounded-[1.5rem] p-6 border border-white/20 hover:border-white/40 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black">{listing.title}</h3>
                  <p className="text-sm text-black">
                    {listing.brand} {listing.model} • {listing.year}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[listing.status]}`}>
                  {listing.status}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm py-3 border-y border-white/10">
                <div>
                  <p className="text-black">Price</p>
                  <p className="font-semibold text-black">৳ {parseFloat(listing.price).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-black">Condition</p>
                  <p className="font-semibold text-black capitalize">{listing.condition.toLowerCase()}</p>
                </div>
                {listing.condition !== 'NEW' && (
                  <div>
                    <p className="text-black">Mileage</p>
                    <p className="font-semibold text-black">{listing.mileage?.toLocaleString()} km</p>
                  </div>
                )}
                <div>
                  <p className="text-black">Location</p>
                  <p className="font-semibold text-black">{listing.location}</p>
                </div>
              </div>

              {listing.adminNotes && listing.status !== 'APPROVED' && (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-sm text-yellow-200">
                  <p className="font-medium mb-1">Admin Notes:</p>
                  <p>{listing.adminNotes}</p>
                </div>
              )}

              {listing.hasActiveBooking && (
                <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-200">
                  ℹ️ This listing has active bookings
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Link href={`/dashboard/seller/listings/${listing.id}`}>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-black hover:bg-white/20 transition">
                    View Details
                  </button>
                </Link>
                {!listing.hasActiveBooking && (
                  <Link href={`/dashboard/seller/listings/${listing.id}/edit`}>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-black hover:bg-white/20 transition">
                      Edit
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

