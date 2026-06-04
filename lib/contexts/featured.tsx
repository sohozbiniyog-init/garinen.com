'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface FeaturedListingDetail {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: string;
  location: string;
  imageUrls?: string[] | null;
  year: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD';
}

interface FeaturedListingData {
  id: string;
  listingId: string;
  displayOrder: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  listing?: FeaturedListingDetail;
}

interface FeaturedContextType {
  listings: FeaturedListingDetail[];
  featuredIds: string[];
  loading: boolean;
  error: string | null;
  toggleFeatured: (id: string) => Promise<void>;
  setFeaturedIds: (ids: string[]) => void;
}

const FeaturedContext = createContext<FeaturedContextType | undefined>(undefined);

const fallbackFeaturedContext: FeaturedContextType = {
  listings: [],
  featuredIds: [],
  loading: false,
  error: null,
  toggleFeatured: async () => {},
  setFeaturedIds: () => {},
};

export function FeaturedProvider({
  children,
  initialListings,
  initialFeatured,
}: {
  children: ReactNode;
  initialListings?: FeaturedListingDetail[];
  initialFeatured?: FeaturedListingData[];
}) {
  const [listings, setListings] = useState<FeaturedListingDetail[]>(initialListings ?? []);
  const [featuredIds, setFeaturedIdsState] = useState<string[]>([]);
  const [loading, setLoading] = useState(!(initialListings && initialFeatured));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedListings = async () => {
      try {
        let approvedListings = initialListings;
        let featuredData = initialFeatured;

        if (!approvedListings) {
          const listingsRes = await fetch('/api/admin/listings');
          if (!listingsRes.ok) throw new Error('Failed to load admin listings');
          const listingsJson = await listingsRes.json();
          approvedListings = (listingsJson.listings || []).filter(
            (listing: FeaturedListingDetail) => listing.status === 'APPROVED'
          );
        }

        if (!featuredData) {
          const featuredRes = await fetch('/api/featured?status=APPROVED&details=true');
          if (!featuredRes.ok) throw new Error('Failed to load featured listings');
          featuredData = await featuredRes.json();
        }

        const details = (featuredData || [])
          .filter((f: FeaturedListingData) => f.listing)
          .map((f: FeaturedListingData) => f.listing!)
          .sort((a, b) => {
            const orderA = featuredData!.find((f) => f.listingId === a.id)?.displayOrder || 0;
            const orderB = featuredData!.find((f) => f.listingId === b.id)?.displayOrder || 0;
            return orderA - orderB;
          });

        const ids = (featuredData || []).map((f: FeaturedListingData) => f.listingId);

        setListings(approvedListings ?? details);
        setFeaturedIdsState(ids);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load featured listings');
        setListings(initialListings ?? []);
        setFeaturedIdsState([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedListings();
  }, [initialFeatured, initialListings]);

  const toggleFeatured = async (listingId: string) => {
    try {
      const isCurrentlyFeatured = featuredIds.includes(listingId);

      if (isCurrentlyFeatured) {
        // Remove from featured
        const featureId = (await fetch(`/api/featured?status=APPROVED&details=true`)
          .then((r) => r.json())
          .then((data) => data.find((f: FeaturedListingData) => f.listingId === listingId)))?.id;

        if (featureId) {
          const res = await fetch(`/api/featured?id=${featureId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to unfeature listing');

          setFeaturedIdsState((prev) => prev.filter((id) => id !== listingId));
        }
      } else {
        // Add to featured
        const res = await fetch('/api/featured', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId, sourceRole: 'ADMIN' }),
        });

        if (!res.ok) throw new Error('Failed to feature listing');
        const newFeature = await res.json();

        setFeaturedIdsState((prev) => [...prev, newFeature.listingId]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
      throw err;
    }
  };

  const setFeaturedIds = (ids: string[]) => setFeaturedIdsState(ids);

  return (
    <FeaturedContext.Provider value={{ listings, featuredIds, loading, error, toggleFeatured, setFeaturedIds }}>
      {children}
    </FeaturedContext.Provider>
  );
}

export function useFeatured() {
  const ctx = useContext(FeaturedContext);
  return ctx ?? fallbackFeaturedContext;
}

