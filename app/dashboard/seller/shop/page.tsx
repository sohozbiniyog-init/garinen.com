'use client';

import { ShopProfileForm, ShopProfileData } from '@/components/forms/ShopProfile';
import { useState } from 'react';

interface ShopInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  isVerified: boolean;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

const mockShop: ShopInfo = {
  name: 'Elite Motors',
  phone: '+880 1712345678',
  address: '123 Auto Road, Block A',
  city: 'Dhaka',
  isVerified: false,
  kycStatus: 'PENDING'
};

export default function SellerShopPage() {
  const [shop, setShop] = useState<ShopInfo>(mockShop);
  const [statusMessage, setStatusMessage] = useState('');

  const handleUpdateShop = (data: ShopProfileData) => {
    setShop((prev) => ({
      ...prev,
      name: data.shopName,
      phone: data.phone,
      address: data.address,
      city: data.city
    }));
    setStatusMessage('Shop profile updated. Changes are saved locally for now.');
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

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {statusMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950" role="status" aria-live="polite">
              {statusMessage}
            </div>
          )}
          <ShopProfileForm shopName={shop.name} onUpdate={handleUpdateShop} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Status</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{shop.name}</h2>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-slate-400">KYC status</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white">
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

