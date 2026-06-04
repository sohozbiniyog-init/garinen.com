'use client';

import { useEffect, useState } from 'react';

type FeaturedVendor = {
  id: string;
  name: string;
  shopName?: string;
  category?: string;
  locationDivision?: string;
  locationAddress?: string;
  description?: string;
};

const fallbackVendors: FeaturedVendor[] = [
  {
    id: 'fallback-vendor-1',
    name: 'Elite Motors',
    shopName: 'Elite Motors',
    category: 'Used Car Dealer',
    locationDivision: 'Dhaka',
    locationAddress: 'Gulshan Avenue',
    description: 'Curated inventory of premium used vehicles with full documentation.'
  },
  {
    id: 'fallback-vendor-2',
    name: 'City Auto Sales',
    shopName: 'City Auto Sales',
    category: 'New Car Dealer',
    locationDivision: 'Chattogram',
    locationAddress: 'Agrabad Commercial Area',
    description: 'New arrivals, verified pricing, and fast delivery support.'
  },
  {
    id: 'fallback-vendor-3',
    name: 'Prime Reconditioned',
    shopName: 'Prime Reconditioned',
    category: 'Reconditioned Dealer',
    locationDivision: 'Sylhet',
    locationAddress: 'Zindabazar',
    description: 'Specialists in reconditioned imports with inspection-backed listings.'
  }
];

export function FeaturedVendors() {
  const [vendors, setVendors] = useState<FeaturedVendor[]>(fallbackVendors);

  useEffect(() => {
    const loadFeaturedVendors = async () => {
      try {
        const response = await fetch('/api/vendors/featured');
        if (!response.ok) throw new Error('Failed to load featured vendors');
        const data = (await response.json()) as FeaturedVendor[];

        if (data.length > 0) {
          setVendors(data);
        }
      } catch {
        setVendors(fallbackVendors);
      }
    };

    loadFeaturedVendors();
  }, []);

  return (
    <section className="py-16">
      <div className="mb-12">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-300">Featured Vendors</p>
        <h2 className="text-4xl font-bold text-white md:text-5xl">
          Trusted <span className="text-brand-red">Sellers</span>
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {vendors.map((vendor) => (
          <article key={vendor.id} className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Vendor profile</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{vendor.shopName || vendor.name}</h3>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300">
                {vendor.category || 'Vendor'}
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {vendor.description || 'Verified vendor highlighted on the homepage.'}
            </p>

            <div className="mt-5 space-y-2 text-sm text-slate-300">
              <p>{vendor.locationDivision || 'Bangladesh'}{vendor.locationAddress ? `, ${vendor.locationAddress}` : ''}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}