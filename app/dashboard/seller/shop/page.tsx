'use client';

import { ShopProfileForm, ShopProfileData } from '@/components/forms/ShopProfile';
import { useEffect, useState } from 'react';

interface VendorProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  vendorApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  vendorInfo: {
    shopName?: string;
    phone?: string;
    description?: string;
    category?: string;
    locationDivision?: string;
    locationAddress?: string;
  } | null;
}

interface ShopInfo extends ShopProfileData {
  isVerified: boolean;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  ownerName: string;
  email: string;
}

const emptyShop: ShopInfo = {
  shopName: '',
  phone: '',
  address: '',
  city: '',
  isVerified: false,
  kycStatus: 'PENDING',
  ownerName: '',
  email: '',
};

export default function SellerShopPage() {
  const [shop, setShop] = useState<ShopInfo>(emptyShop);
  const [loading, setLoading] = useState(true);
  const [updatingPhone, setUpdatingPhone] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = (await response.json()) as { profile?: VendorProfileResponse | null };

        if (!response.ok) {
          throw new Error('Failed to load seller profile');
        }

        const profile = data.profile;
        if (!profile) {
          throw new Error('Seller profile not found');
        }

        const vendorInfo = profile.vendorInfo ?? {};
        const approvalStatus = profile.vendorApprovalStatus;

        setShop({
          shopName: vendorInfo.shopName || profile.name || '',
          phone: vendorInfo.phone || profile.phone || '',
          address: vendorInfo.locationAddress || '',
          city: vendorInfo.locationDivision || '',
          isVerified: approvalStatus === 'APPROVED' && profile.role === 'VENDOR',
          kycStatus: approvalStatus === 'APPROVED'
            ? 'VERIFIED'
            : approvalStatus === 'REJECTED'
              ? 'REJECTED'
              : 'PENDING',
          ownerName: profile.name,
          email: profile.email,
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load seller profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleUpdatePhone = async (phone: string) => {
    setUpdatingPhone(true);
    setError('');

    try {
      const response = await fetch('/api/vendor/profile/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update phone number');
      }

      setShop((prev) => ({
        ...prev,
        phone,
      }));
      setStatusMessage('Phone number updated successfully.');
    } finally {
      setUpdatingPhone(false);
    }
  };

  const kycColor =
    shop.kycStatus === 'VERIFIED'
      ? 'bg-moss/10 text-moss'
      : shop.kycStatus === 'PENDING'
        ? 'bg-sand text-ink'
        : 'bg-red-100 text-red-700';

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Vendor Account</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Shop Profile</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Manage your shop details and verification status from a simple profile view.
        </p>
      </section>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {statusMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950" role="status" aria-live="polite">
              {statusMessage}
            </div>
          )}
          {loading ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-slate-300">
              Loading seller profile...
            </div>
          ) : (
            <ShopProfileForm
              profile={{
                shopName: shop.shopName,
                phone: shop.phone,
                address: shop.address,
                city: shop.city,
              }}
              onPhoneUpdate={handleUpdatePhone}
              isLoading={updatingPhone}
            />
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Status</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{shop.shopName || 'Shop Profile'}</h2>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-slate-400">KYC status</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`rounded-full border border-white/10 px-4 py-2 text-xs font-semibold ${kycColor}`}>
                    {shop.kycStatus}
                  </span>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-slate-400">Verification</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {shop.isVerified ? '✓ Verified' : '○ Not verified'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold text-white">Next steps</p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li>✓ Complete shop profile</li>
              <li>◯ Upload KYC documents</li>
              <li>◯ Wait for admin verification</li>
              <li>◯ Start selling</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

