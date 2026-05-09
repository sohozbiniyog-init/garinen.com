'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import WishlistButton from '@/components/WishlistButton';
import { BANGLADESH_DIVISIONS } from '@/lib/bangladesh-divisions';

interface Listing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number; // numeric price in BDT
  location: string;
  shopName: string;
  condition: 'new' ;
}

const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Toyota Corolla 2024 - Brand New',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2024,
    price: 2500000,
    location: 'Dhaka',
    shopName: 'Elite Motors',
    condition: 'new'
  },
  {
    id: '2',
    title: 'Honda Civic 2024 - Brand New',
    brand: 'Honda',
    model: 'Civic',
    year: 2024,
    price: 2200000,
    location: 'Dhaka',
    shopName: 'City Auto Sales',
    condition: 'new'
  },
  {
    id: '3',
    title: 'Hyundai Elantra 2024 - Brand New',
    brand: 'Hyundai',
    model: 'Elantra',
    year: 2024,
    price: 1800000,
    location: 'Chittagong',
    shopName: 'Supreme Automobiles',
    condition: 'new'
  },
  {
    id: '4',
    title: 'Nissan Altima 2024 - Brand New',
    brand: 'Nissan',
    model: 'Altima',
    year: 2024,
    price: 1600000,
    location: 'Dhaka',
    shopName: 'Prime Auto Group',
    condition: 'new'
  },
  {
    id: '5',
    title: 'Mazda CX-5 2024 - Brand New SUV',
    brand: 'Mazda',
    model: 'CX-5',
    year: 2024,
    price: 2400000,
    location: 'Sylhet',
    shopName: 'Family Motors',
    condition: 'new'
  },
  {
    id: '6',
    title: 'Ford Focus 2024 - Brand New Economy Car',
    brand: 'Ford',
    model: 'Focus',
    year: 2024,
    price: 1400000,
    location: 'Khulna',
    shopName: 'Value Cars',
    condition: 'new'
  }
];

// Price range mapping for budget filters
const budgetToPriceRange: Record<string, { min: number; max: number }> = {
  '0 - 10 Lakh': { min: 0, max: 1000000 },
  '10 - 20 Lakh': { min: 1000000, max: 2000000 },
  '20 - 30 Lakh': { min: 2000000, max: 3000000 },
  '30 - 50 Lakh': { min: 3000000, max: 5000000 },
  '50+ Lakh': { min: 5000000, max: Infinity }
};

// Example: we can later fetch from Supabase/Prisma; this mock supports condition and numeric price for sorting.

function ListingsContent() {
  const searchParams = useSearchParams();
  const [searchBrand, setSearchBrand] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState<'all' | Listing['condition']>('all');
  const [sortOption, setSortOption] = useState<'none' | 'price-asc' | 'price-desc' | 'year-desc' | 'location-asc'>('none');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Load budget from URL params on mount
  useEffect(() => {
    const budget = searchParams.get('budget');
    if (budget) {
      setBudgetFilter(budget);
    }

    const brand = searchParams.get('brand');
    if (brand) {
      setSearchBrand(brand);
    }

    const location = searchParams.get('location');
    if (location) {
      setLocationFilter(location);
    }
  }, [searchParams]);

  const brands = ['Audi', 'BMW', 'Chevrolet', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Kia', 'Lexus', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Suzuki', 'Tata', 'Toyota'];
  const locations = [...BANGLADESH_DIVISIONS];

  let results = mockListings.filter((listing) =>
    searchBrand === '' || listing.brand.toLowerCase().includes(searchBrand.toLowerCase())
  );

  if (locationFilter) {
    results = results.filter((listing) => listing.location === locationFilter);
  }

  if (conditionFilter !== 'all') {
    results = results.filter((r) => r.condition === conditionFilter);
  }

  // Apply budget/price range filter
  if (budgetFilter && budgetToPriceRange[budgetFilter]) {
    const { min, max } = budgetToPriceRange[budgetFilter];
    results = results.filter((r) => r.price >= min && r.price <= max);
  }

  if (sortOption === 'price-asc') results = results.slice().sort((a, b) => a.price - b.price);
  if (sortOption === 'price-desc') results = results.slice().sort((a, b) => b.price - a.price);
  if (sortOption === 'year-desc') results = results.slice().sort((a, b) => b.year - a.year);
  if (sortOption === 'location-asc') results = results.slice().sort((a, b) => a.location.localeCompare(b.location) || a.price - b.price);

  const filteredListings = results;
  const displayedListings = filteredListings.slice(0, itemsPerPage);

  function formatBDT(n: number) {
    return n.toLocaleString('en-IN');
  }

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Marketplace</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Browse Cars</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          {filteredListings.length} approved car{filteredListings.length !== 1 ? 's' : ''} available for viewing and booking.
        </p>
      </section>

      <div className="glass-card mb-6 rounded-[2rem] p-5 shadow-soft">
        <div className="grid gap-5 lg:grid-cols-5">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Brand</span>
            <select
              value={searchBrand}
              onChange={(e) => setSearchBrand(e.target.value)}
              className="glass-field w-full rounded-xl px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">By Location</span>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="glass-field w-full rounded-xl px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              <option value="">Select location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Price Range</span>
            <select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              className="glass-field w-full rounded-xl px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              <option value="">All Prices</option>
              {Object.keys(budgetToPriceRange).map((budget) => (
                <option key={budget} value={budget}>
                  {budget}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Sort</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="glass-field w-full rounded-xl px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              <option value="none">Relevance (default)</option>
              <option value="year-desc">Year: New → Old</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="location-asc">By Location: A → Z</option>
            </select>
          </div>

          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">View</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-ink">
                <input type="radio" name="view" checked={viewMode==='grid'} onChange={()=>setViewMode('grid')} className="h-4 w-4 accent-brand-red" />
                Grid
              </label>
              <label className="flex items-center gap-2 text-ink">
                <input type="radio" name="view" checked={viewMode==='list'} onChange={()=>setViewMode('list')} className="h-4 w-4 accent-brand-red" />
                List
              </label>
            </div>
          </div>

          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Items</span>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-ink">
                <input type="radio" name="per" checked={itemsPerPage===10} onChange={()=>setItemsPerPage(10)} className="h-4 w-4 accent-brand-red" />
                10
              </label>
              <label className="flex items-center gap-2 text-ink">
                <input type="radio" name="per" checked={itemsPerPage===20} onChange={()=>setItemsPerPage(20)} className="h-4 w-4 accent-brand-red" />
                20
              </label>
              <label className="flex items-center gap-2 text-ink">
                <input type="radio" name="per" checked={itemsPerPage===50} onChange={()=>setItemsPerPage(50)} className="h-4 w-4 accent-brand-red" />
                50
              </label>
            </div>
          </div>
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-12 text-center shadow-soft">
          <p className="text-lg font-semibold text-ink">No listings found</p>
          <p className="mt-2 text-sm text-slate-600">Try searching by a different brand.</p>
        </div>
      ) : viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedListings.map((listing) => (
              <div key={listing.id} className="group glass-card relative overflow-hidden rounded-[2rem] shadow-soft transition hover:shadow-md">
                <Link href={`/listings/${listing.id}`} className="block">
                  <div className="space-y-4 p-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Approved</p>
                      <h3 className="mt-2 text-lg font-bold text-ink group-hover:text-moss">{listing.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{listing.year} {listing.brand} {listing.model}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-600">Price</p>
                        <p className="font-semibold text-ink">৳ {formatBDT(listing.price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Location</p>
                        <p className="font-semibold text-ink">{listing.location}</p>
                      </div>
                    </div>
                    <div className="border-t border-black/5 pt-4">
                      <p className="text-xs text-smoke">{listing.shopName}</p>
                    </div>
                    <button className="glass-button w-full rounded-full px-4 py-3 text-sm font-semibold text-white transition group-hover:scale-[1.01]">View Details</button>
                  </div>
                </Link>
                <div className="absolute right-3 top-3">
                  <WishlistButton item={{ id: listing.id, title: listing.title, brand: listing.brand, model: listing.model, year: listing.year, price: listing.price, location: listing.location }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedListings.map((listing) => (
              <div key={listing.id} className="glass-card flex w-full items-start gap-6 overflow-hidden rounded-[1rem] p-4 shadow-soft">
                <div className="flex-1">
                  <Link href={`/listings/${listing.id}`} className="block">
                    <h3 className="text-lg font-bold text-ink">{listing.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{listing.year} {listing.brand} {listing.model} • {listing.location}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-600">Price</p>
                        <p className="font-semibold text-ink">৳ {formatBDT(listing.price)}</p>
                      </div>
                      <div className="text-sm text-slate-600">{listing.shopName}</div>
                    </div>
                  </Link>
                </div>
                <div>
                  <WishlistButton item={{ id: listing.id, title: listing.title, brand: listing.brand, model: listing.model, year: listing.year, price: listing.price, location: listing.location }} />
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Bottom controls: duplicate view + items-per-page so controls are available up and down */}
      <div className="glass-card mt-8 rounded-[1rem] p-4 shadow-soft">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">View</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-ink">
                <input type="radio" name="view" checked={viewMode==='grid'} onChange={()=>setViewMode('grid')} className="h-4 w-4 accent-brand-red" />
                Grid
              </label>
              <label className="flex items-center gap-2 text-ink">
                <input type="radio" name="view" checked={viewMode==='list'} onChange={()=>setViewMode('list')} className="h-4 w-4 accent-brand-red" />
                List
              </label>
            </div>
          </div>

          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Items</span>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-ink">
                <input type="radio" name="per" checked={itemsPerPage===10} onChange={()=>setItemsPerPage(10)} className="h-4 w-4 accent-brand-red" />
                10
              </label>
              <label className="flex items-center gap-2 text-ink">
                <input type="radio" name="per" checked={itemsPerPage===20} onChange={()=>setItemsPerPage(20)} className="h-4 w-4 accent-brand-red" />
                20
              </label>
              <label className="flex items-center gap-2 text-ink">
                <input type="radio" name="per" checked={itemsPerPage===50} onChange={()=>setItemsPerPage(50)} className="h-4 w-4 accent-brand-red" />
                50
              </label>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full px-6 py-10 lg:px-10">Loading...</div>}>
      <ListingsContent />
    </Suspense>
  );
}