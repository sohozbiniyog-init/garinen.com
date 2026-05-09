'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Review = {
  id: string;
  listingId: string;
  listingTitle: string;
  author: string;
  location: string;
  rating: number;
  content: string;
  featured: boolean;
  createdAt: string;
};

const emptyDraft = {
  listingId: '',
  listingTitle: '',
  author: '',
  location: '',
  rating: 5,
  content: '',
  featured: true
};

export default function FeaturedReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [message, setMessage] = useState('');

  const featuredCount = useMemo(() => reviews.filter((review) => review.featured).length, [reviews]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        if (!response.ok) throw new Error('Failed to load reviews');
        const data = (await response.json()) as Review[];
        setReviews(data);
      } catch {
        setMessage('Could not load reviews right now.');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const resetDraft = () => {
    setDraft(emptyDraft);
    setEditingId(null);
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingId('form');
    setMessage('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      });

      if (!response.ok) throw new Error('Failed to save review');
      const createdReview = (await response.json()) as Review;
      setReviews((current) => [createdReview, ...current]);
      resetDraft();
    } catch {
      setMessage('Could not create review.');
    } finally {
      setSavingId(null);
    }
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setDraft({
      listingId: review.listingId,
      listingTitle: review.listingTitle,
      author: review.author,
      location: review.location,
      rating: review.rating,
      content: review.content,
      featured: review.featured
    });
  };

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingId) return;

    setSavingId(editingId);
    setMessage('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...draft })
      });

      if (!response.ok) throw new Error('Failed to update review');
      const updatedReview = (await response.json()) as Review;
      setReviews((current) => current.map((review) => (review.id === updatedReview.id ? updatedReview : review)));
      resetDraft();
    } catch {
      setMessage('Could not update review.');
    } finally {
      setSavingId(null);
    }
  };

  const toggleFeatured = async (review: Review) => {
    setSavingId(review.id);
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: review.id, featured: !review.featured })
      });

      if (!response.ok) throw new Error('Failed to toggle review');
      const updatedReview = (await response.json()) as Review;
      setReviews((current) => current.map((item) => (item.id === updatedReview.id ? updatedReview : item)));
    } catch {
      setMessage('Could not update the featured status.');
    } finally {
      setSavingId(null);
    }
  };

  const deleteReview = async (id: string) => {
    setSavingId(id);
    try {
      const response = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete review');
      setReviews((current) => current.filter((review) => review.id !== id));
    } catch {
      setMessage('Could not delete review.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <div className="mb-8">
        <Link href="/admin" className="text-sm font-semibold text-sky-400 hover:underline">
          ← Back to Admin
        </Link>
      </div>

      <section className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Homepage content</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Landing Reviews CRUD</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Manage the testimonials that appear on the homepage. Feature the strongest reviews, edit copy, or remove outdated entries.
        </p>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="glass-card rounded-[1.75rem] p-5 shadow-soft">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-400">Total reviews</p>
          <p className="mt-2 text-3xl font-bold text-white">{reviews.length}</p>
        </div>
        <div className="glass-card rounded-[1.75rem] p-5 shadow-soft">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-400">Featured on homepage</p>
          <p className="mt-2 text-3xl font-bold text-white">{featuredCount}</p>
        </div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">{message}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <form onSubmit={editingId ? saveEdit : submitReview} className="glass-card rounded-[2rem] p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit review' : 'Create review'}</h2>
              <p className="mt-2 text-sm text-slate-700">Feature reviews here and they will appear in the homepage testimonials section.</p>
            </div>
            {editingId ? (
              <button type="button" onClick={resetDraft} className="rounded-full border border-white/20 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900">
                Cancel edit
              </button>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4">
            <input value={draft.listingId} onChange={(e) => setDraft((current) => ({ ...current, listingId: e.target.value }))} placeholder="Listing ID" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <input value={draft.listingTitle} onChange={(e) => setDraft((current) => ({ ...current, listingTitle: e.target.value }))} placeholder="Listing title" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <input value={draft.author} onChange={(e) => setDraft((current) => ({ ...current, author: e.target.value }))} placeholder="Reviewer name" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <input value={draft.location} onChange={(e) => setDraft((current) => ({ ...current, location: e.target.value }))} placeholder="Reviewer location" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <input type="number" min="1" max="5" value={draft.rating} onChange={(e) => setDraft((current) => ({ ...current, rating: Number(e.target.value) }))} placeholder="Rating" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <textarea value={draft.content} onChange={(e) => setDraft((current) => ({ ...current, content: e.target.value }))} rows={5} placeholder="Review content" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <label className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/70 px-4 py-3 text-sm text-slate-900">
              <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft((current) => ({ ...current, featured: e.target.checked }))} />
              Feature on homepage
            </label>
          </div>

          <button disabled={savingId === 'form'} className="mt-6 rounded-full bg-moss px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
            {editingId ? (savingId === editingId ? 'Saving…' : 'Save changes') : savingId === 'form' ? 'Creating…' : 'Create review'}
          </button>
        </form>

        <section className="space-y-4">
          {loading ? (
            <div className="glass-card rounded-[2rem] p-6 text-slate-300 shadow-soft">Loading reviews…</div>
          ) : reviews.length === 0 ? (
            <div className="glass-card rounded-[2rem] p-8 text-center shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">No reviews yet</h2>
              <p className="mt-2 text-sm text-slate-700">Create a review to populate the homepage testimonials section.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="glass-card rounded-[2rem] p-6 shadow-soft text-slate-900">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700">
                    {review.featured ? 'Featured' : 'Hidden'}
                  </span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {review.rating} stars
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-950">{review.listingTitle}</h3>
                <p className="mt-1 text-sm uppercase tracking-[0.15em] text-slate-500">{review.author} • {review.location}</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">{review.content}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => startEdit(review)} className="rounded-full border border-white/20 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900">Edit</button>
                  <button onClick={() => toggleFeatured(review)} className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white">
                    {review.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button onClick={() => deleteReview(review.id)} className="rounded-full border border-rose-300/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-700">Delete</button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
