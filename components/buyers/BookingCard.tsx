'use client';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PURCHASED' | 'EMI_APPLIED' | 'EMI_APPROVED';

interface BookingCardProps {
  id: string;
  buyerName: string;
  buyerPhone: string;
  listingTitle: string;
  carPrice: string;
  depositAmount: string;
  status: BookingStatus;
  createdAt: string;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onApproveEmi?: (id: string) => void;
}

export function BookingCard({
  id,
  buyerName,
  buyerPhone,
  listingTitle,
  carPrice,
  depositAmount,
  status,
  createdAt,
  onConfirm,
  onCancel,
  onApproveEmi
}: BookingCardProps) {
  const statusColor =
    status === 'CONFIRMED'
      ? 'bg-moss/10 text-moss'
      : status === 'PENDING'
        ? 'bg-sand text-ink'
        : status === 'EMI_APPROVED'
          ? 'bg-clay/10 text-clay'
          : status === 'CANCELLED'
            ? 'bg-red-100 text-red-700'
            : 'bg-ink/10 text-ink';

  return (
    <div className="glass-card overflow-hidden rounded-2xl shadow-soft transition hover:shadow-md">
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-ink">{listingTitle}</h3>
            <p className="mt-1 text-sm text-smoke">{buyerName}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${statusColor}`}>
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 text-sm">
          <div>
            <p className="text-xs text-smoke">Car Price</p>
            <p className="mt-1 font-semibold text-ink">৳ {carPrice}</p>
          </div>
          <div>
            <p className="text-xs text-smoke">Deposit</p>
            <p className="mt-1 font-semibold text-ink">৳ {depositAmount}</p>
          </div>
          <div>
            <p className="text-xs text-smoke">Phone</p>
            <p className="mt-1 font-semibold text-ink">{buyerPhone}</p>
          </div>
          <div>
            <p className="text-xs text-smoke">Created</p>
            <p className="mt-1 font-semibold text-ink">{createdAt}</p>
          </div>
        </div>

        {(status === 'PENDING' || status === 'EMI_APPLIED') && (
          <div className="flex gap-3 border-t border-white/20 pt-4">
            {status === 'PENDING' && onConfirm && (
              <>
                <button
                  onClick={() => onConfirm(id)}
                  className="flex-1 rounded-full bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
                >
                  Confirm
                </button>
                {onCancel && (
                  <button
                    onClick={() => onCancel(id)}
                    className="flex-1 rounded-full border border-white/30 bg-white/80 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white"
                  >
                    Reject
                  </button>
                )}
              </>
            )}
            {status === 'EMI_APPLIED' && onApproveEmi && (
              <button
                onClick={() => onApproveEmi(id)}
                className="flex-1 rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Approve EMI
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

