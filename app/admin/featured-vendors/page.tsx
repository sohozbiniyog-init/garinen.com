'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/common/Toast';

interface VendorFeatureRow {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  createdAt: string;
  featuredOnHomepage: boolean;
  vendorInfo: {
    shopName?: string;
    category?: string;
    locationDivision?: string;
    locationAddress?: string;
    description?: string;
  };
}

export default function FeaturedVendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<VendorFeatureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const checkTierAndFetch = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }

        const json = await res.json();
        const tier = json?.claims?.admin_tier;

        if (!tier || (tier !== 'SUPER_ADMIN' && tier !== 'VENDOR_ADMIN' && tier !== 'BASIC_ADMIN')) {
          showToast('Only admins can access featured vendors', { type: 'error' });
          router.push('/login');
          return;
        }

        const vendorsRes = await fetch('/api/admin/featured-vendors');
        if (!vendorsRes.ok) throw new Error('Failed to load vendors');
        const data = await vendorsRes.json();
        setVendors(data.vendors || []);
      } catch (error) {
        console.error('Failed to load featured vendors:', error);
        showToast('Failed to load featured vendors', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    checkTierAndFetch();
  }, [router]);

  const toggleFeatured = async (vendor: VendorFeatureRow) => {
    setSavingId(vendor.id);
    try {
      const response = await fetch('/api/admin/featured-vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendor.id, featuredOnHomepage: !vendor.featuredOnHomepage }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update vendor');
      }

      setVendors((current) =>
        current.map((item) =>
          item.id === data.vendor.id ? { ...item, featuredOnHomepage: data.vendor.featuredOnHomepage } : item
        )
      );
      showToast(vendor.featuredOnHomepage ? 'Vendor removed from homepage' : 'Vendor featured on homepage', { type: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update vendor';
      showToast(message, { type: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full px-6 py-10 lg:px-10">
        <section className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Admin</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Featured Vendors</h1>
        </section>
        <div className="text-center text-slate-400">Loading featured vendors...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Admin</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Featured Vendors</h1>
        <p className="mt-2 text-sm text-slate-300">
          Choose which approved vendors should be highlighted on the homepage.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {vendors.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-400">
            No approved vendors available.
          </div>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor.id} className="glass-card flex flex-col justify-between rounded-2xl p-4 sm:flex-row sm:items-center">
              <div>
                <div className="text-sm font-semibold text-white">
                  {vendor.vendorInfo.shopName || vendor.name}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {vendor.vendorInfo.category || 'Vendor'}
                  {vendor.vendorInfo.locationDivision ? ` • ${vendor.vendorInfo.locationDivision}` : ''}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {vendor.vendorInfo.locationAddress || 'No location details provided'}
                </div>
              </div>

              <button
                onClick={() => toggleFeatured(vendor)}
                disabled={savingId === vendor.id}
                className={`mt-3 rounded-full px-4 py-2 text-sm font-semibold transition-all sm:mt-0 ${
                  vendor.featuredOnHomepage
                    ? 'bg-sky-500 text-white hover:bg-sky-600'
                    : 'border border-white/30 bg-white/10 text-white hover:bg-white/20'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {savingId === vendor.id ? 'Saving…' : vendor.featuredOnHomepage ? '✓ Featured' : '+ Feature'}
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}