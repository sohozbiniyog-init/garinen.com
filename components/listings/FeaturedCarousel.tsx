'use client';

import Link from 'next/link';
import { useFeatured } from '@/lib/contexts/featured';

export default function FeaturedCarousel() {
  const { listings, featuredIds } = useFeatured();

  const featured = featuredIds
    .map((id) => listings.find((l) => l.id === id))
    .filter(Boolean) as typeof listings;

  if (featured.length === 0) return null;

  return (
    <div className="glass-card relative overflow-hidden rounded-[2rem] p-4 text-ink shadow-soft">
      <div className="flex overflow-hidden">
        <div className="marquee-track flex gap-6 will-change-transform">
          {featured.concat(featured).map((car, idx) => (
            <Link 
              key={`${car.id}-${idx}`} 
              href={`/listings/${car.id}`} 
              className="group glass-card-strong min-w-[320px] flex-shrink-0 rounded-2xl p-4 transition hover:shadow-md"
            >
              <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-200/40 to-slate-100/20 transition group-hover:scale-105">
                <svg className="h-12 w-12 text-brand-red/35" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="mt-4">
                <div className="text-sm font-semibold text-ink transition group-hover:text-brand-red-deep">{car.title}</div>
                <div className="text-xs text-slate-600 mt-1">৳ {car.price} • {car.location}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .marquee-track {
          animation: marquee 30s linear infinite;
          display: flex;
        }
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-100% - 24px));
          }
        }
        /* Smooth scroll by pausing on hover */
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

