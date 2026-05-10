'use client';

interface SellerListingCardProps {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD';
  createdAt: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SellerListingCard({
  id,
  title,
  brand,
  model,
  year,
  price,
  status,
  createdAt,
  onEdit,
  onDelete
}: SellerListingCardProps) {
  const statusColor =
    status === 'APPROVED'
      ? 'bg-white/10 text-white'
      : status === 'PENDING'
        ? 'bg-white/10 text-slate-200'
        : status === 'REJECTED'
          ? 'bg-red-500/15 text-red-200'
          : 'bg-white/10 text-slate-200';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-300">
              {year} {brand} {model}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${statusColor}`}>
            {status}
          </span>
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="text-lg font-semibold text-white">৳ {price}</p>
          <p className="mt-1 text-xs text-slate-400">Created {createdAt}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onEdit(id)}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(id)}
            className="flex-1 rounded-lg bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/25"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

