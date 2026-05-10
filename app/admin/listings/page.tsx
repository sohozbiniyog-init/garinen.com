'use client';

import { AdminListingCard } from '@/components/admin/ListingCard';
import { useEffect, useState } from 'react';

type Listing = {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: string;
  shopName: string;
  createdAt: string;
  imageUrls?: string[];
  videoUrls?: string[];
};

function compressImageToWebp(file: File, maxSide = 1600, quality = 0.82): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      try {
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Canvas context unavailable');
        }

        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            resolve(
              new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, {
                type: 'image/webp',
                lastModified: Date.now(),
              })
            );
          },
          'image/webp',
          quality
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to read image'));
    };

    image.src = objectUrl;
  });
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadListings = async () => {
      try {
        const response = await fetch('/api/admin/listings');
        if (!response.ok) {
          throw new Error('Failed to load listings');
        }

        const data = (await response.json()) as Listing[];
        setListings(data);
        setSelectedListingId((current) => current || data[0]?.id || '');
      } catch (error) {
        console.error('Error loading listings:', error);
        setStatusMessage('Could not load pending listings right now.');
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  useEffect(() => {
    const currentListing = listings.find((listing) => listing.id === selectedListingId);
    setYoutubeUrl((currentListing?.videoUrls?.[0] ?? '').trim());
  }, [listings, selectedListingId]);

  const handleModerate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${status.toLowerCase()} listing`);
      }

      setListings((current) => current.filter((listing) => listing.id !== id));
      setStatusMessage(`Listing ${id} ${status.toLowerCase()}.`);
    } catch (error) {
      console.error('Error updating listing:', error);
      setStatusMessage(`Failed to ${status.toLowerCase()} listing ${id}.`);
    }
  };

  const saveMedia = async () => {
    if (!selectedListingId) {
      setStatusMessage('Select a listing first.');
      return;
    }

    if (selectedFiles.length > 5) {
      setStatusMessage('Upload at most 5 images.');
      return;
    }

    setUploading(true);

    try {
      const compressedFiles = await Promise.all(selectedFiles.map((file) => compressImageToWebp(file)));
      const formData = new FormData();

      compressedFiles.forEach((file) => {
        formData.append('files', file);
      });

      if (youtubeUrl.trim()) {
        formData.append('videoUrl', youtubeUrl.trim());
      }

      const response = await fetch(`/api/admin/listings/${selectedListingId}/media`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save media');
      }

      const data = (await response.json()) as { imageUrls?: string[]; videoUrls?: string[] };
      setListings((current) =>
        current.map((listing) =>
          listing.id === selectedListingId
            ? {
                ...listing,
                imageUrls: data.imageUrls ?? [],
                videoUrls: data.videoUrls ?? [],
              }
            : listing
        )
      );
      setSelectedFiles([]);
      setYoutubeUrl('');
      setStatusMessage('Listing media saved.');
    } catch (error) {
      console.error('Error saving listing media:', error);
      setStatusMessage('Failed to save listing media.');
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = (id: string) => void handleModerate(id, 'APPROVED');
  const handleReject = (id: string) => void handleModerate(id, 'REJECTED');

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Moderation</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Pending Listings</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Review and approve or reject new car listings before they appear on the public marketplace. Media is managed by admins only.
        </p>
      </section>

      {statusMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950" role="status" aria-live="polite">
          {statusMessage}
        </div>
      )}

      <section className="mt-8 rounded-[2rem] bg-white/5 p-6 text-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Admin Media Gallery</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Upload listing media</h2>
            <p className="mt-2 text-sm text-slate-300">Only admins can add images or videos. Sellers do not upload media from their dashboard.</p>
          </div>
          <div className="min-w-[240px]">
            <select
              value={selectedListingId}
              onChange={(e) => setSelectedListingId(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-moss"
            >
              <option value="">Select listing</option>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id} className="text-ink">
                  {listing.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">WebP images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []).slice(0, 5))}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-moss file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            <p className="text-xs text-slate-400">Upload up to 5 images. They will be compressed to WebP before being uploaded to the Supabase `photo` bucket.</p>
            {selectedFiles.length > 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                {selectedFiles.map((file) => (
                  <div key={`${file.name}-${file.lastModified}`}>{file.name}</div>
                ))}
              </div>
            ) : null}
          </label>
          <label className="space-y-2 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Unlisted YouTube URL</span>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-moss"
            />
            <p className="text-xs text-slate-400">Use a single unlisted YouTube URL. The public listing page renders it with the privacy-enhanced no-cookie player.</p>
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={saveMedia}
            disabled={uploading}
            className="rounded-full bg-moss px-5 py-3 text-sm font-semibold text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : 'Save Media'}
          </button>
        </div>
      </section>

      {loading ? (
        <div className="glass-card rounded-[2rem] p-8 text-center shadow-soft">
          <p className="text-sm text-smoke">Loading pending listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-8 text-center shadow-soft">
          <p className="text-sm text-smoke">No pending listings to review.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <AdminListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              brand={listing.brand}
              model={listing.model}
              price={listing.price}
              status="PENDING"
              shopName={listing.shopName}
              createdAt={listing.createdAt}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </main>
  );
}

