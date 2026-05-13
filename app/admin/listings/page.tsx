'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/common/Toast';

interface PendingListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: string;
  condition: 'NEW' | 'USED' | 'RECONDITIONED';
  mileage: number | null;
  location: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  shopName: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState<Record<string, string>>({});
  const [selectedListingId, setSelectedListingId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkAccessAndFetchListings = async () => {
      try {
        // Check admin access
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }

        const meData = await meRes.json();
        const tier = meData?.claims?.admin_tier;

        if (!tier || (tier !== 'SUPER_ADMIN' && tier !== 'VENDOR_ADMIN' && tier !== 'BASIC_ADMIN')) {
          showToast('Only admins can access this page', { type: 'error' });
          router.push('/login');
          return;
        }

        setHasAccess(true);

        // Fetch pending listings
        const listingsRes = await fetch('/api/admin/listings');
        if (listingsRes.ok) {
          const data = await listingsRes.json();
          setListings(data.listings || []);
        }
      } catch (error) {
        console.error('Failed to load listings:', error);
        showToast('Failed to load listings', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    checkAccessAndFetchListings();
  }, [router]);

  const handleApprove = async (listingId: string) => {
    setProcessingId(listingId);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE',
          notes: noteValue[listingId] || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to approve listing', { type: 'error' });
        return;
      }

      showToast('Listing approved successfully', { type: 'success' });
      setListings(listings.filter((l) => l.id !== listingId));
      setNoteValue((prev) => {
        const updated = { ...prev };
        delete updated[listingId];
        return updated;
      });
    } catch (error) {
      console.error('Error approving listing:', error);
      showToast('Failed to approve listing', { type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (listingId: string) => {
    setProcessingId(listingId);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          notes: noteValue[listingId] || 'Rejected by admin',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to reject listing', { type: 'error' });
        return;
      }

      showToast('Listing rejected', { type: 'success' });
      setListings(listings.filter((l) => l.id !== listingId));
      setNoteValue((prev) => {
        const updated = { ...prev };
        delete updated[listingId];
        return updated;
      });
    } catch (error) {
      console.error('Error rejecting listing:', error);
      showToast('Failed to reject listing', { type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveMedia = async () => {
    if (!selectedListingId) {
      showToast('Please select a listing first', { type: 'error' });
      return;
    }

    const selectedListing = listings.find((l) => l.id === selectedListingId);
    if (!selectedListing) {
      showToast('Listing not found', { type: 'error' });
      return;
    }

    const hasFiles = selectedFiles.length > 0;
    const hasUrl = youtubeUrl.trim();

    if (!hasFiles && !hasUrl) {
      showToast('Add at least one image or a YouTube URL', { type: 'error' });
      return;
    }

    // File uploads only for PENDING listings
    if (hasFiles && selectedListing.status !== 'PENDING') {
      showToast(
        'File uploads are only allowed for PENDING listings. Use URL updates for approved listings.',
        { type: 'error' }
      );
      return;
    }

    setUploading(true);
    try {
      // If only URL, use PATCH; if files, use POST
      if (hasFiles) {
        const formData = new FormData();
        selectedFiles.slice(0, 5).forEach((file) => formData.append('files', file));
        if (hasUrl) {
          formData.append('videoUrl', youtubeUrl.trim());
        }

        const res = await fetch(`/api/admin/listings/${selectedListingId}/media`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Failed to upload listing media', { type: 'error' });
          return;
        }

        showToast('Listing media uploaded successfully', { type: 'success' });
      } else {
        // URL-only update via PATCH (works for any status)
        const res = await fetch(`/api/admin/listings/${selectedListingId}/media`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrls: hasUrl ? [youtubeUrl.trim()] : [],
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Failed to update listing URLs', { type: 'error' });
          return;
        }

        showToast('Listing URLs updated successfully', { type: 'success' });
      }

      setSelectedFiles([]);
      setYoutubeUrl('');
    } catch (error) {
      console.error('Error saving listing media:', error);
      showToast('Failed to save listing media', { type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full px-6 py-10 lg:px-10">
        <section className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Moderation</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Pending Listings</h1>
        </section>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading pending listings...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Moderation</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Pending Listings</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Review and approve or reject vehicle listings from vendors before they appear on the marketplace.
        </p>
      </section>

      {listings.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-12 text-center shadow-soft border border-white/20">
          <p className="text-lg font-semibold text-white">No pending listings to review.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="glass-card rounded-[1.5rem] p-6 border border-white/20 hover:border-white/40 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{listing.title}</h3>
                  <p className="text-sm text-slate-300">
                    {listing.brand} {listing.model} • {listing.year}
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    Vendor: <span className="font-medium text-white">{listing.owner.name}</span> ({listing.owner.email})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="text-xs text-slate-400 uppercase">Price</p>
                  <p className="font-semibold text-white">৳ {parseFloat(listing.price).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Condition</p>
                  <p className="font-semibold text-white capitalize">{listing.condition.toLowerCase()}</p>
                </div>
                {listing.condition !== 'NEW' && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase">Mileage</p>
                    <p className="font-semibold text-white">{listing.mileage?.toLocaleString()} km</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 uppercase">Location</p>
                  <p className="font-semibold text-white">{listing.location}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Submitted</p>
                  <p className="font-semibold text-white text-sm">{new Date(listing.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {listing.adminNotes && (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-sm text-yellow-200">
                  <p className="font-medium mb-1">Previous Notes:</p>
                  <p>{listing.adminNotes}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Approval Notes (optional)
                </label>
                <textarea
                  value={noteValue[listing.id] || ''}
                  onChange={(e) => setNoteValue({ ...noteValue, [listing.id]: e.target.value })}
                  placeholder="Add notes for the vendor (e.g., reasons for rejection)"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(listing.id)}
                  disabled={processingId === listing.id}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {processingId === listing.id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(listing.id)}
                  disabled={processingId === listing.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {processingId === listing.id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="mt-10 rounded-[2rem] bg-white/5 p-6 text-white shadow-soft border border-white/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Admin Media Gallery</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Upload listing media</h2>
            <p className="mt-2 text-sm text-slate-300">Only admins can add images or videos. Sellers do not upload media from their dashboard. File uploads are for PENDING listings; URL updates work on any listing.</p>
          </div>
          <div className="min-w-[240px]">
            <select
              value={selectedListingId}
              onChange={(e) => setSelectedListingId(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select listing</option>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id} className="text-gray-900">
                  {listing.title} • {listing.year} • [{listing.status}]
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []).slice(0, 5))}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            <p className="text-xs text-slate-400">Upload up to 5 images for PENDING listings. They will be stored in the Supabase photo bucket. Use YouTube URL field for URL-only updates on approved listings.</p>
            {selectedFiles.length > 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                {selectedFiles.map((file) => (
                  <div key={`${file.name}-${file.lastModified}`}>{file.name}</div>
                ))}
              </div>
            ) : null}
          </label>
          <label className="space-y-2 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">YouTube URL</span>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-slate-400">Use an unlisted YouTube URL if you want the listing to show a video. Can be updated for any listing status.</p>
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSaveMedia}
            disabled={uploading}
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Save Media'}
          </button>
        </div>
      </section>
    </main>
  );
}

