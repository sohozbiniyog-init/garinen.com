'use client';

type Role = 'BUYER' | 'VENDOR' | 'ADMIN';

interface AdminUserCardProps {
  id: string;
  email: string;
  name: string;
  phone?: string;
  currentRole: Role;
  canMakeAdmin: boolean;
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
  canMakeAdmin,
  createdAt,
  onPromoteToSeller,
  onMakeAdmin
}: AdminUserCardProps) {
  const roleColor =
    currentRole === 'VENDOR'
      ? 'bg-white/10 text-white'
      : currentRole === 'ADMIN'
        ? 'bg-white/15 text-white'
        : 'bg-white/10 text-slate-200';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <p className="mt-1 text-sm text-slate-300">{email}</p>
            {phone && <p className="text-sm text-slate-300">{phone}</p>}
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleColor}`}>
            {currentRole}
          </span>
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-slate-400">Joined {createdAt}</p>
        </div>
        {currentRole === 'BUYER' && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onPromoteToSeller(id)}
              className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Make Vendor
            </button>
            {canMakeAdmin ? (
              <button
                onClick={() => onMakeAdmin(id)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Make Admin
              </button>
            ) : (
              <div className="flex-1 rounded-lg border border-dashed border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm font-semibold text-slate-300">
                Admin only
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

