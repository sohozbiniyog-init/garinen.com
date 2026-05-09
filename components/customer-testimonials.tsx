'use client';

import { useEffect, useState } from 'react';
import { ReviewCard } from './review-card';

type Review = {
  id: string;
  listingId: string;
  listingTitle: string;
  author: string;
  location: string;
  rating: number;
  content: string;
  featured: boolean;
};

const fallbackReviews = [
  {
    id: 'fallback-1',
    author: 'Rezaul Karim',
    location: 'Gulshan, Dhaka',
    rating: 5,
    initials: 'RK',
    content: 'Found my dream Toyota Prado through GariNen in just 5 days. The verified badge gave me full confidence in the seller. Absolutely seamless experience.'
  },
  {
    id: 'fallback-2',
    author: 'Tanvir Ahmed',
    location: 'Chittagong',
    rating: 5,
    initials: 'TA',
    content: 'Sold my BMW within a week of listing. The seller dashboard is incredibly well-designed and professional. GariNen is the future of car selling in Bangladesh.'
  },
  {
    id: 'fallback-3',
    author: 'Nafisa Sultana',
    location: 'Sylhet',
    rating: 5,
    initials: 'NS',
    content: 'The inspection report system is brilliant. I knew exactly what I was buying before I even went to see the car. No surprises, total transparency.'
  }
];

export function CustomerTestimonials() {
  const [reviews, setReviews] = useState(fallbackReviews);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await fetch('/api/reviews?featured=true');
        if (!response.ok) throw new Error('Failed to load reviews');
        const data = (await response.json()) as Review[];

        if (data.length > 0) {
          setReviews(
            data.map((review) => ({
              id: review.id,
              author: review.author,
              location: review.location,
              rating: review.rating,
              initials: review.author
                .split(' ')
                .slice(0, 2)
                .map((part) => part.charAt(0))
                .join('')
                .toUpperCase(),
              content: review.content
            }))
          );
        }
      } catch {
        setReviews(fallbackReviews);
      }
    };

    loadReviews();
  }, []);

  return (
    <section className="py-16">
      <div className="mb-12">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-300">Customer Stories</p>
        <h2 className="text-4xl font-bold text-white md:text-5xl">
          What Buyers <span className="text-brand-red">Say</span>
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            author={review.author}
            location={review.location}
            rating={review.rating}
            content={review.content}
            initials={review.initials}
          />
        ))}
      </div>
    </section>
  );
}
