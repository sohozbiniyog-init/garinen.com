'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface ListingMini {
  id: string;
  title: string;
  price: string;
  location: string;
  img?: string;
}

interface FeaturedContextType {
  listings: ListingMini[];
  featuredIds: string[];
  toggleFeatured: (id: string) => void;
  setFeaturedIds: (ids: string[]) => void;
}

const FeaturedContext = createContext<FeaturedContextType | undefined>(undefined);

const defaultListings: ListingMini[] = [
  { id: '1', title: 'Toyota Corolla 2022', price: '2,500,000', location: 'Dhaka' },
  { id: '2', title: 'Honda Civic 2020', price: '2,200,000', location: 'Dhaka' },
  { id: '3', title: 'Hyundai Elantra 2021', price: '1,800,000', location: 'Chittagong' },
  { id: '4', title: 'Mazda CX-5 2020', price: '2,400,000', location: 'Sylhet' },
  { id: '5', title: 'Nissan Altima 2019', price: '1,600,000', location: 'Khulna' }
];

const fallbackFeaturedContext: FeaturedContextType = {
  listings: defaultListings,
  featuredIds: ['1', '2', '3'],
  toggleFeatured: () => {},
  setFeaturedIds: () => {},
};

export function FeaturedProvider({ children }: { children: ReactNode }) {
  const [listings] = useState<ListingMini[]>(defaultListings);
  const [featuredIds, setFeaturedIdsState] = useState<string[]>(['1', '2', '3']);

  const toggleFeatured = (id: string) => {
    setFeaturedIdsState((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const setFeaturedIds = (ids: string[]) => setFeaturedIdsState(ids);

  return (
    <FeaturedContext.Provider value={{ listings, featuredIds, toggleFeatured, setFeaturedIds }}>
      {children}
    </FeaturedContext.Provider>
  );
}

export function useFeatured() {
  const ctx = useContext(FeaturedContext);
  return ctx ?? fallbackFeaturedContext;
}
