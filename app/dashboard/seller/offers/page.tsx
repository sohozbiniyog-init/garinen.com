'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Offer = {
  id: string;
  vendorId: string;
  vendorName: string;
  sourceRole: 'VENDOR' | 'ADMIN';
  title: string;
  subtitle?: string | null;
  description: string;
  discountLabel: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

const sellerProfile = {
  vendorId: 'seller-001',
  vendorName: 'Elite Motors'
};

const emptyDraft = {
  title: '',
  subtitle: '',
  description: '',
  discountLabel: '',
  ctaLabel: 'View Offer',
  ctaHref: '/listings',
  imageUrl: ''
};

export default function SellerOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(emptyDraft);

  const myOffers = useMemo(() => offers.filter((offer) => offer.sourceRole === 'VENDOR'), [offers]);
  const pendingCount = useMemo(() => myOffers.filter((offer) => offer.status === 'PENDING').length, [myOffers]);
  const approvedCount = useMemo(() => myOffers.filter((offer) => offer.status === 'APPROVED').length, [myOffers]);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const response = await fetch(`/api/offers?vendorId=${sellerProfile.vendorId}&sourceRole=VENDOR`);
        if (!response.ok) throw new Error('Failed to load offers');
        const data = (await response.json()) as Offer[];
        setOffers(data);
      } catch {
        setError('Could not load your offers right now.');
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  const submitOffer = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: sellerProfile.vendorId,
          vendorName: sellerProfile.vendorName,
          sourceRole: 'VENDOR',
          ...draft
        })
      });

      if (!response.ok) throw new Error('Failed to create offer');
      const createdOffer = (await response.json()) as Offer;
      setOffers((current) => [createdOffer, ...current]);
      setDraft(emptyDraft);
    } catch {
      setError('Could not submit offer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <div className="mb-8">
        <Link href="/dashboard/seller" className="text-sm font-semibold text-sky-400 hover:underline">
          ← Back to Vendor Console
        </Link>
      </div>

      <section className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Vendor Offers</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Submit Offer</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Send promotional offers from your dashboard. Admin will review and approve them before they appear on the homepage.
        </p>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card rounded-[1.75rem] p-5 shadow-soft">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-400">Your offers</p>
          <p className="mt-2 text-3xl font-bold text-white">{myOffers.length}</p>
        </div>
        <div className="glass-card rounded-[1.75rem] p-5 shadow-soft">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-400">Pending</p>
          <p className="mt-2 text-3xl font-bold text-white">{pendingCount}</p>
        </div>
        <div className="glass-card rounded-[1.75rem] p-5 shadow-soft">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-400">Approved</p>
          <p className="mt-2 text-3xl font-bold text-white">{approvedCount}</p>
        </div>
      </div>

      {error ? <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <form onSubmit={submitOffer} className="glass-card rounded-[2rem] p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-900">Offer draft</h2>
          <p className="mt-2 text-sm text-slate-700">Create one offer at a time. Keep the copy short and deal-focused.</p>

          <div className="mt-6 grid gap-4">
            <input value={draft.title} onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))} placeholder="Offer title" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <input value={draft.subtitle} onChange={(e) => setDraft((current) => ({ ...current, subtitle: e.target.value }))} placeholder="Subtitle" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <textarea value={draft.description} onChange={(e) => setDraft((current) => ({ ...current, description: e.target.value }))} rows={4} placeholder="Offer description" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <input value={draft.discountLabel} onChange={(e) => setDraft((current) => ({ ...current, discountLabel: e.target.value }))} placeholder="Discount label" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <div className="grid gap-4 md:grid-cols-2">
              <input value={draft.ctaLabel} onChange={(e) => setDraft((current) => ({ ...current, ctaLabel: e.target.value }))} placeholder="CTA label" className="glass-field rounded-xl px-4 py-3 text-sm" />
              <input value={draft.ctaHref} onChange={(e) => setDraft((current) => ({ ...current, ctaHref: e.target.value }))} placeholder="CTA link" className="glass-field rounded-xl px-4 py-3 text-sm" />
            </div>
            <input value={draft.imageUrl} onChange={(e) => setDraft((current) => ({ ...current, imageUrl: e.target.value }))} placeholder="Image URL (optional)" className="glass-field rounded-xl px-4 py-3 text-sm" />
          </div>

          <button disabled={saving} className="mt-6 rounded-full bg-moss px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
            {saving ? 'Submitting…' : 'Submit for review'}
          </button>
        </form>

        <section className="space-y-4">
          {loading ? (
            <div className="glass-card rounded-[2rem] p-6 text-slate-300 shadow-soft">Loading your offers…</div>
          ) : myOffers.length === 0 ? (
            <div className="glass-card rounded-[2rem] p-8 text-center shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">No offers yet</h2>
              <p className="mt-2 text-sm text-slate-700">Submit your first promotion and admin will review it before it goes live.</p>
            </div>
          ) : (
            myOffers.map((offer) => (
              <article key={offer.id} className="glass-card rounded-[2rem] p-6 shadow-soft text-slate-900">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700">
                    {offer.status}
                  </span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {offer.discountLabel}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-950">{offer.title}</h3>
                {offer.subtitle ? <p className="mt-2 text-sm uppercase tracking-[0.15em] text-slate-500">{offer.subtitle}</p> : null}
                <p className="mt-3 text-sm leading-7 text-slate-700">{offer.description}</p>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

