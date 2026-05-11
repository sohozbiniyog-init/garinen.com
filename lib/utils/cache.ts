/**
 * In-memory cache with TTL support.
 * Can be upgraded to Redis without changing the public API.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * Set a value in the cache with optional TTL (in milliseconds).
   */
  set<T>(key: string, value: T, ttlMs: number = 5 * 60 * 1000): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Get a value from the cache if it exists and hasn't expired.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Delete a value from the cache.
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Delete multiple values by pattern (prefix).
   */
  deleteByPattern(pattern: string): void {
    const regex = new RegExp(`^${pattern}`);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all cache.
   */
  clear(): void {
    this.store.clear();
  }
}

// Global cache instance
const globalCache = new MemoryCache();

/**
 * Cache keys for different entities.
 */
export const cacheKeys = {
  listing: (id: string) => `listing:${id}`,
  listings: (filters?: Record<string, unknown>) => `listings:${JSON.stringify(filters || {})}`,
  offer: (id: string) => `offer:${id}`,
  offers: (status?: string) => `offers:${status || 'all'}`,
  user: (id: string) => `user:${id}`,
  booking: (id: string) => `booking:${id}`,
  userBookings: (userId: string) => `bookings:${userId}`,
};

/**
 * Cache service with listing and offer support.
 */
export const cacheService = {
  /**
   * Get or set a listing from cache.
   */
  getListing: async <T extends { id: string }>(
    id: string,
    fetcher: () => Promise<T>
  ): Promise<T | null> => {
    const cacheKey = cacheKeys.listing(id);
    const cached = globalCache.get<T>(cacheKey);
    if (cached) {
      return cached;
    }

    const listing = await fetcher();
    if (listing) {
      globalCache.set(cacheKey, listing, 10 * 60 * 1000); // 10 minutes
    }
    return listing;
  },

  /**
   * Get or set listings from cache.
   */
  getListings: async <T extends { id: string }>(
    fetcher: () => Promise<T[]>,
    filters?: Record<string, unknown>
  ): Promise<T[]> => {
    const cacheKey = cacheKeys.listings(filters);
    const cached = globalCache.get<T[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const listings = await fetcher();
    globalCache.set(cacheKey, listings, 5 * 60 * 1000); // 5 minutes
    return listings;
  },

  /**
   * Get or set an offer from cache.
   */
  getOffer: async <T extends { id: string }>(
    id: string,
    fetcher: () => Promise<T>
  ): Promise<T | null> => {
    const cacheKey = cacheKeys.offer(id);
    const cached = globalCache.get<T>(cacheKey);
    if (cached) {
      return cached;
    }

    const offer = await fetcher();
    if (offer) {
      globalCache.set(cacheKey, offer, 10 * 60 * 1000); // 10 minutes
    }
    return offer;
  },

  /**
   * Get or set offers from cache.
   */
  getOffers: async <T extends { id: string }>(
    fetcher: () => Promise<T[]>,
    status?: string
  ): Promise<T[]> => {
    const cacheKey = cacheKeys.offers(status);
    const cached = globalCache.get<T[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const offers = await fetcher();
    globalCache.set(cacheKey, offers, 5 * 60 * 1000); // 5 minutes
    return offers;
  },

  /**
   * Invalidate listing cache.
   */
  invalidateListing: (id: string) => {
    globalCache.delete(cacheKeys.listing(id));
    globalCache.deleteByPattern('listings:'); // Invalidate all listing lists
  },

  /**
   * Invalidate all listings cache.
   */
  invalidateListings: () => {
    globalCache.deleteByPattern('listings:');
  },

  /**
   * Invalidate offer cache.
   */
  invalidateOffer: (id: string) => {
    globalCache.delete(cacheKeys.offer(id));
    globalCache.deleteByPattern('offers:'); // Invalidate all offer lists
  },

  /**
   * Invalidate all offers cache.
   */
  invalidateOffers: () => {
    globalCache.deleteByPattern('offers:');
  },

  /**
   * Clear all cache (use sparingly).
   */
  clear: () => {
    globalCache.clear();
  },
};
