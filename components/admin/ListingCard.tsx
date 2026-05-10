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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Pending review</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-300">
            {brand} {model}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400">Price</p>
            <p className="font-semibold text-white">৳ {price}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Shop</p>
            <p className="font-semibold text-white">{shopName}</p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-slate-400">Submitted {createdAt}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onApprove(id)}
            className="flex-1 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(id)}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

