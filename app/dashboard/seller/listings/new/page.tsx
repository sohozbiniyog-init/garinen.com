'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { showToast } from '@/components/common/Toast';
import { VendorListingForm } from '@/components/vendor/VendorListingForm';

export default function NewListingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        const role = data?.claims?.role;
        const vendorStatus = data?.profile?.vendorApprovalStatus;

        if (role !== 'VENDOR' || vendorStatus !== 'APPROVED') {
          showToast('Only approved vendors can create listings', { type: 'error' });
          router.push('/dashboard');
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error('Failed to verify access:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-gradient min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-3 text-white">List a Vehicle</h1>
        <p className="text-white mb-8 text-lg">
          Fill in the details below to list your vehicle. Your listing will be reviewed by our admin team.
        </p>
        <VendorListingForm onSuccess={() => router.push('/dashboard/seller/listings')} />
      </div>
    </div>
  );
}
