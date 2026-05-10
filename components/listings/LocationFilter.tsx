'use client';

import { useState, useEffect } from 'react';
import { BANGLADESH_DIVISIONS } from '@/lib/config/divisions';

interface LocationFilterProps {
  onFilterChange?: (location: string) => void;
  selectedLocation?: string;
}

export function LocationFilter({ onFilterChange, selectedLocation = '' }: LocationFilterProps) {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      setLocations([...BANGLADESH_DIVISIONS]);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-ink">Filter by Location</label>
      <select
        value={selectedLocation}
        onChange={(e) => onFilterChange?.(e.target.value)}
        disabled={loading}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-red disabled:opacity-50"
      >
        <option value="">All Divisions</option>
        {locations.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>
    </div>
  );
}

