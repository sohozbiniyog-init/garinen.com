'use client';

type Role = 'BUYER' | 'VENDOR' | 'ADMIN';

interface AdminUserCardProps {
  id: string;
  email: string;
  name: string;
  phone?: string;
  currentRole: Role;
  createdAt: string;
  onPromoteToSeller: (id: string) => void;
  onMakeAdmin: (id: string) => void;
}

export function AdminUserCard({
  id,
  email,
  name,
  phone,
  currentRole,
  createdAt,
  onPromoteToSeller,
  onMakeAdmin
}: AdminUserCardProps) {
  const roleColor =
    currentRole === 'VENDOR'
      ? 'bg-clay text-white'
      : currentRole === 'ADMIN'
        ? 'bg-ink text-white'
        : 'bg-sand text-ink';

  return (
    <div className="glass-card overflow-hidden rounded-2xl shadow-soft transition hover:shadow-md">
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">{name}</h3>
            <p className="mt-1 text-sm text-smoke">{email}</p>
            {phone && <p className="text-sm text-smoke">{phone}</p>}
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleColor}`}>
            {currentRole}
          </span>
        </div>
        <div className="border-t border-black/10 pt-4">
          <p className="text-xs text-smoke">Joined {createdAt}</p>
        </div>
        {currentRole === 'BUYER' && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onPromoteToSeller(id)}
              className="flex-1 rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Make Vendor
            </button>
            <button
              onClick={() => onMakeAdmin(id)}
              className="flex-1 rounded-full border border-black/10 bg-white/80 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white"
            >
              Make Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
