'use client';

type ListingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD';

interface AdminListingCardProps {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: string;
  status: ListingStatus;
  shopName: string;
  createdAt: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function AdminListingCard({
  id,
  title,
  brand,
  model,
  price,
  shopName,
  createdAt,
  onApprove,
  onReject
}: AdminListingCardProps) {
  return (
    <div className="glass-card overflow-hidden rounded-2xl shadow-soft transition hover:shadow-md">
      <div className="space-y-4 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-smoke">Pending Review</p>
          <h3 className="mt-2 text-lg font-bold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-smoke">
            {brand} {model}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-smoke">Price</p>
            <p className="font-semibold text-ink">৳ {price}</p>
          </div>
          <div>
            <p className="text-xs text-smoke">Shop</p>
            <p className="font-semibold text-ink">{shopName}</p>
          </div>
        </div>
        <div className="border-t border-black/10 pt-4">
          <p className="text-xs text-smoke">Submitted {createdAt}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onApprove(id)}
            className="flex-1 rounded-full bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(id)}
            className="flex-1 rounded-full border border-black/10 bg-white/80 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
