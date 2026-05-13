'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { showToast } from '@/components/common/Toast';
import { VendorListingForm } from '@/components/vendor/VendorListingForm';

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
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccessAndFetchListing = async () => {
      try {
        if (!listingId) {
          router.push('/dashboard/seller/listings');
          return;
        }

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
          showToast('Only approved vendors can edit listings', { type: 'error' });
          router.push('/dashboard');
          return;
        }

        // Fetch listing details
        const listingRes = await fetch(`/api/vendor/listings/${listingId}`);
        if (!listingRes.ok) {
          if (listingRes.status === 404) {
            showToast('Listing not found', { type: 'error' });
          } else if (listingRes.status === 403) {
            showToast('You do not own this listing', { type: 'error' });
          } else {
            showToast('Failed to load listing', { type: 'error' });
          }
          router.push('/dashboard/seller/listings');
          return;
        }

        const data = await listingRes.json();
        setListing(data.listing);
        setHasAccess(true);
      } catch (error) {
        console.error('Failed to load listing:', error);
        showToast('Failed to load listing', { type: 'error' });
        router.push('/dashboard/seller/listings');
      } finally {
        setLoading(false);
      }
    };

    checkAccessAndFetchListing();
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

  if (!hasAccess || !listing) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Edit Listing</h1>
        <p className="text-gray-600 mb-8">
          Update your vehicle listing details. If this listing is already approved, the changes will need to be reviewed by our admin team.
        </p>
        <VendorListingForm
          editingListing={listing}
          onSuccess={() => router.push('/dashboard/seller/listings')}
        />
      </div>
    </div>
  );
}
