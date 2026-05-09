"use client";

import { useEffect, useState } from 'react';
import { WishlistItem, toggleWishlist, isWishlisted } from '@/lib/wishlist';

type WishlistButtonProps = {
  item: WishlistItem;
  className?: string;
};

export default function WishlistButton({ item, className = '' }: WishlistButtonProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isWishlisted(item.id));
  }, [item.id]);

  const onToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleWishlist(item);
    setActive(next.some((i) => i.id === item.id));
  };

  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      title={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`inline-flex items-center justify-center rounded-full p-2 shadow-sm transition ${active ? 'bg-moss text-white' : 'bg-white/90 text-ink border border-black/5'} ${className}`}
    >
      <span className="text-sm">{active ? '♥' : '♡'}</span>
    </button>
  );
}
