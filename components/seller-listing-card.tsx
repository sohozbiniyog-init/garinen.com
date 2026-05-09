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
      ? 'bg-moss/10 text-moss'
      : status === 'PENDING'
        ? 'bg-sand text-ink'
        : status === 'REJECTED'
          ? 'bg-red-100 text-red-700'
          : 'bg-ink/10 text-ink';

  return (
    <div className="glass-card overflow-hidden rounded-2xl shadow-soft transition hover:shadow-md">
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-smoke">
              {year} {brand} {model}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${statusColor}`}>
            {status}
          </span>
        </div>
        <div className="border-t border-white/20 pt-4">
          <p className="text-lg font-bold text-ink">৳ {price}</p>
          <p className="mt-1 text-xs text-smoke">Created {createdAt}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onEdit(id)}
            className="flex-1 rounded-full border border-white/30 bg-white/80 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(id)}
            className="flex-1 rounded-full bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-500/25"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
