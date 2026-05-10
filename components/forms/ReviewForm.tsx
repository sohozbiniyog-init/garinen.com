'use client';

import { useState } from 'react';

interface ReviewFormProps {
  listingId: string;
  listingTitle: string;
  onSubmit: (data: ReviewSubmitData) => void;
  isLoading?: boolean;
}

export interface ReviewSubmitData {
  rating: number;
  content: string;
  buyerName: string;
}

export function ReviewForm({
  listingId,
  listingTitle,
  onSubmit,
  isLoading = false
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!buyerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!content.trim()) {
      setError('Please write a review');
      return;
    }

    if (content.trim().length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    onSubmit({ rating, content, buyerName });

    // Reset form
    setRating(5);
    setContent('');
    setBuyerName('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-[1.5rem] p-6 space-y-6 shadow-soft">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-600 mb-2">Leave a Review</p>
        <h3 className="text-lg font-bold text-slate-900">{listingTitle}</h3>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Your Rating</label>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className="transition transform hover:scale-110"
            >
              <svg
                className={`h-8 w-8 ${i < rating ? 'text-yellow-400' : 'text-yellow-100'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
          Your Name
        </label>
        <input
          id="name"
          type="text"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          placeholder="Your name"
          className="glass-field w-full rounded-lg px-4 py-3 text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="review" className="block text-sm font-semibold text-slate-700 mb-2">
          Your Review
        </label>
        <textarea
          id="review"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience with this car..."
          rows={4}
          className="glass-field w-full rounded-lg px-4 py-3 text-sm"
          required
        />
        <p className="mt-1 text-xs text-slate-500">{content.length} / 500 characters</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50/80 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="glass-button w-full rounded-lg py-3 font-semibold text-white transition disabled:opacity-50"
      >
        {isLoading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

