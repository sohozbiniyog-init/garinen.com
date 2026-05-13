'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { showToast } from '@/components/common/Toast';

interface ListingDetails {
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

export default function ListingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        if (!listingId) {
          router.push('/dashboard/seller/listings');
          return;
        }

        // Check auth first
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }

        // Fetch listing details
        const listingRes = await fetch(`/api/vendor/listings/${listingId}`);
        if (!listingRes.ok) {
          if (listingRes.status === 404) {
            showToast('Listing not found', { type: 'error' });
          } else if (listingRes.status === 403) {
            showToast('You do not own this listing', { type: 'error' });
          }
          router.push('/dashboard/seller/listings');
          return;
        }

        const data = await listingRes.json();
        setListing(data.listing);
      } catch (error) {
        console.error('Failed to load listing:', error);
        showToast('Failed to load listing', { type: 'error' });
        router.push('/dashboard/seller/listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{listing.title}</h1>
            <p className="text-gray-600">
              {listing.brand} {listing.model} • {listing.year}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${STATUS_COLORS[listing.status]}`}>
            {listing.status}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
          <div>
            <p className="text-gray-600 text-sm mb-1">Price</p>
            <p className="text-2xl font-bold">৳ {parseFloat(listing.price).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Condition</p>
            <p className="text-lg font-semibold capitalize">{listing.condition.toLowerCase()}</p>
          </div>
          {listing.condition !== 'NEW' && (
            <div>
              <p className="text-gray-600 text-sm mb-1">Mileage</p>
              <p className="text-lg font-semibold">{listing.mileage?.toLocaleString()} km</p>
            </div>
          )}
          <div>
            <p className="text-gray-600 text-sm mb-1">Location</p>
            <p className="text-lg font-semibold">{listing.location}</p>
          </div>
        </div>

        {listing.adminNotes && listing.status !== 'APPROVED' && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="font-medium text-amber-900 mb-2">Admin Notes:</p>
            <p className="text-amber-800">{listing.adminNotes}</p>
          </div>
        )}

        {listing.hasActiveBooking && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            ℹ️ This listing has active bookings and cannot be edited or deleted.
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/dashboard/seller/listings">
            <button className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
              Back to Listings
            </button>
          </Link>
          {!listing.hasActiveBooking && (
            <Link href={`/dashboard/seller/listings/${listing.id}/edit`}>
              <button className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition">
                Edit Listing
              </button>
            </Link>
          )}
        </div>

        <div className="mt-12 pt-8 border-t text-gray-600 text-sm">
          <p>Created: {new Date(listing.createdAt).toLocaleDateString()}</p>
          <p>Last Updated: {new Date(listing.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
