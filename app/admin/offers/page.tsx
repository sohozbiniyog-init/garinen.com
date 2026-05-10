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

type OfferDraft = {
  sourceRole: 'VENDOR' | 'ADMIN';
  title: string;
  subtitle: string;
  description: string;
  discountLabel: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

const emptyDraft: OfferDraft = {
  sourceRole: 'ADMIN',
  title: '',
  subtitle: '',
  description: '',
  discountLabel: '',
  ctaLabel: 'View Offer',
  ctaHref: '/listings',
  imageUrl: '',
  status: 'APPROVED'
};

const vendorProfile = {
  vendorId: 'seller-001',
  vendorName: 'Elite Motors'
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const pendingCount = useMemo(() => offers.filter((offer) => offer.status === 'PENDING').length, [offers]);
  const approvedCount = useMemo(() => offers.filter((offer) => offer.status === 'APPROVED').length, [offers]);
  const vendorCount = useMemo(() => offers.filter((offer) => offer.sourceRole === 'VENDOR').length, [offers]);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const response = await fetch('/api/offers');
        if (!response.ok) throw new Error('Failed to load offers');
        const data = (await response.json()) as Offer[];
        setOffers(data);
      } catch {
        setError('Could not load offers right now.');
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  const resetDraft = () => {
    setDraft(emptyDraft);
    setEditingId(null);
  };

  const submitOffer = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingId('form');
    setError('');

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          vendorId: draft.sourceRole === 'ADMIN' ? 'admin' : vendorProfile.vendorId,
          vendorName: draft.sourceRole === 'ADMIN' ? 'Ghuri Automobiles' : vendorProfile.vendorName
        })
      });

      if (!response.ok) throw new Error('Failed to save offer');
      const createdOffer = (await response.json()) as Offer;
      setOffers((current) => [createdOffer, ...current]);
      resetDraft();
    } catch {
      setError('Could not save the offer.');
    } finally {
      setSavingId(null);
    }
  };

  const startEdit = (offer: Offer) => {
    setEditingId(offer.id);
    setDraft({
      sourceRole: offer.sourceRole,
      title: offer.title,
      subtitle: offer.subtitle || '',
      description: offer.description,
      discountLabel: offer.discountLabel,
      ctaLabel: offer.ctaLabel,
      ctaHref: offer.ctaHref,
      imageUrl: offer.imageUrl || '',
      status: offer.status
    });
  };

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingId) return;

    setSavingId(editingId);
    setError('');

    try {
      const response = await fetch('/api/offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          ...draft,
          vendorId: draft.sourceRole === 'ADMIN' ? 'admin' : vendorProfile.vendorId,
          vendorName: draft.sourceRole === 'ADMIN' ? 'Ghuri Automobiles' : vendorProfile.vendorName
        })
      });

      if (!response.ok) throw new Error('Failed to update offer');
      const updatedOffer = (await response.json()) as Offer;
      setOffers((current) => current.map((offer) => (offer.id === updatedOffer.id ? updatedOffer : offer)));
      resetDraft();
    } catch {
      setError('Could not update the offer.');
    } finally {
      setSavingId(null);
    }
  };

  const updateStatus = async (id: string, status: Offer['status']) => {
    setSavingId(id);
    try {
      const response = await fetch('/api/offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (!response.ok) throw new Error('Failed to update offer');
      const updatedOffer = (await response.json()) as Offer;
      setOffers((current) => current.map((offer) => (offer.id === updatedOffer.id ? updatedOffer : offer)));
    } catch {
      setError('Could not update the offer status.');
    } finally {
      setSavingId(null);
    }
  };

  const deleteOffer = async (id: string) => {
    setSavingId(id);
    try {
      const response = await fetch(`/api/offers?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete offer');
      setOffers((current) => current.filter((offer) => offer.id !== id));
    } catch {
      setError('Could not delete the offer.');
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
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Promotions</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Offers CRUD</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Create admin-only offers, review vendor submissions, approve what should go public, and edit or delete anything outdated.
        </p>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="glass-card rounded-[1.75rem] p-5 shadow-soft">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-400">Pending</p>
          <p className="mt-2 text-3xl font-bold text-white">{pendingCount}</p>
        </div>
        <div className="glass-card rounded-[1.75rem] p-5 shadow-soft">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-400">Approved</p>
          <p className="mt-2 text-3xl font-bold text-white">{approvedCount}</p>
        </div>
        <div className="glass-card rounded-[1.75rem] p-5 shadow-soft">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-400">Vendor submissions</p>
          <p className="mt-2 text-3xl font-bold text-white">{vendorCount}</p>
        </div>
      </div>

      {error ? <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <form onSubmit={editingId ? saveEdit : submitOffer} className="glass-card rounded-[2rem] p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit offer' : 'Create offer'}</h2>
              <p className="mt-2 text-sm text-slate-700">Admin-created offers can go live immediately. Vendor offers stay pending until approved.</p>
            </div>
            {editingId ? (
              <button type="button" onClick={resetDraft} className="rounded-full border border-white/20 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900">
                Cancel edit
              </button>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4">
            <select value={draft.sourceRole} onChange={(e) => setDraft((current) => ({ ...current, sourceRole: e.target.value as 'ADMIN' | 'VENDOR' }))} className="glass-field rounded-xl px-4 py-3 text-sm">
              <option value="ADMIN">Admin offer</option>
              <option value="VENDOR">Vendor submission</option>
            </select>
            <input value={draft.title} onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))} placeholder="Offer title" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <input value={draft.subtitle} onChange={(e) => setDraft((current) => ({ ...current, subtitle: e.target.value }))} placeholder="Subtitle" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <textarea value={draft.description} onChange={(e) => setDraft((current) => ({ ...current, description: e.target.value }))} rows={4} placeholder="Offer description" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <input value={draft.discountLabel} onChange={(e) => setDraft((current) => ({ ...current, discountLabel: e.target.value }))} placeholder="Discount label" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <div className="grid gap-4 md:grid-cols-2">
              <input value={draft.ctaLabel} onChange={(e) => setDraft((current) => ({ ...current, ctaLabel: e.target.value }))} placeholder="CTA label" className="glass-field rounded-xl px-4 py-3 text-sm" />
              <input value={draft.ctaHref} onChange={(e) => setDraft((current) => ({ ...current, ctaHref: e.target.value }))} placeholder="CTA link" className="glass-field rounded-xl px-4 py-3 text-sm" />
            </div>
            <input value={draft.imageUrl} onChange={(e) => setDraft((current) => ({ ...current, imageUrl: e.target.value }))} placeholder="Image URL (optional)" className="glass-field rounded-xl px-4 py-3 text-sm" />
            <select value={draft.status} onChange={(e) => setDraft((current) => ({ ...current, status: e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED' }))} className="glass-field rounded-xl px-4 py-3 text-sm">
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <button disabled={savingId === 'form'} className="mt-6 rounded-full bg-moss px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
            {editingId ? (savingId === editingId ? 'Saving…' : 'Save changes') : savingId === 'form' ? 'Creating…' : 'Create offer'}
          </button>
        </form>

        <section className="space-y-4">
          {loading ? (
            <div className="glass-card rounded-[2rem] p-6 text-slate-300 shadow-soft">Loading offers…</div>
          ) : offers.length === 0 ? (
            <div className="glass-card rounded-[2rem] p-8 text-center shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">No offers yet</h2>
              <p className="mt-2 text-sm text-slate-700">Vendor submissions and admin offers will appear here.</p>
            </div>
          ) : (
            offers.map((offer) => (
              <article key={offer.id} className="glass-card rounded-[2rem] p-6 shadow-soft text-slate-900">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700">
                    {offer.sourceRole}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700">
                    {offer.status}
                  </span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {offer.discountLabel}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <h3 className="text-xl font-bold text-slate-950">{offer.title}</h3>
                  {offer.subtitle ? <p className="text-sm uppercase tracking-[0.15em] text-slate-500">{offer.subtitle}</p> : null}
                  <p className="text-sm leading-7 text-slate-700">{offer.description}</p>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Uploaded by {offer.vendorName}</p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => startEdit(offer)} className="rounded-full border border-white/20 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900">Edit</button>
                  <button onClick={() => updateStatus(offer.id, 'APPROVED')} className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white">Approve</button>
                  <button onClick={() => updateStatus(offer.id, 'REJECTED')} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-900">Reject</button>
                  <button onClick={() => deleteOffer(offer.id)} className="rounded-full border border-rose-300/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-700">Delete</button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}


