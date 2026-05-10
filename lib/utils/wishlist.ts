export interface WishlistItem {
  id: string;
  title: string;
  brand?: string;
  model?: string;
  year?: number;
  price?: number | string;
  location?: string;
}

const KEY = 'ghuri_wishlist_v1';

export function getWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveWishlist(items: WishlistItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (e) {
    // ignore
  }
}

export function isWishlisted(id: string) {
  return getWishlist().some((i) => i.id === id);
}

export function toggleWishlist(item: WishlistItem) {
  const list = getWishlist();
  const exists = list.find((i) => i.id === item.id);
  if (exists) {
    const next = list.filter((i) => i.id !== item.id);
    saveWishlist(next);
    return next;
  }
  const next = [item, ...list];
  saveWishlist(next);
  return next;
}
