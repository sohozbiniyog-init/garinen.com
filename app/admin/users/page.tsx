'use client';

import { AdminUserCard } from '@/components/admin/UserCard';
import { createBrowserClient } from '@supabase/ssr';
// admin tier is resolved via server-verified endpoint
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'BUYER' | 'VENDOR' | 'ADMIN';
type AdminTier = 'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [adminTier, setAdminTier] = useState<AdminTier | null>(null);
  const [isTierLoading, setIsTierLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to load users');
        }

        const data = (await response.json()) as User[];
        setUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
        setStatusMessage('Could not load users right now.');
      } finally {
        setLoading(false);
      }
    };

    const loadAdminTier = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          setAdminTier(null);
          return;
        }

        const json = await res.json();
        const tier = json?.claims?.admin_tier;

        if (tier === 'SUPER_ADMIN' || tier === 'VENDOR_ADMIN' || tier === 'BASIC_ADMIN') {
          setAdminTier(tier);
        } else {
          setAdminTier(null);
        }
      } catch (error) {
        console.error('Failed to read admin tier:', error);
        setAdminTier(null);
      } finally {
        setIsTierLoading(false);
      }
    };

    loadAdminTier();
    loadUsers();
  }, [supabase]);

  // Redirect if not SUPER_ADMIN
  if (!isTierLoading && adminTier !== 'SUPER_ADMIN') {
    return (
      <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Access Denied</h1>
        <p className="text-slate-300">User management is only available for SUPER_ADMIN accounts.</p>
        <p className="text-sm text-slate-400">VENDOR_ADMIN accounts can only manage vendor approvals.</p>
        <button
          onClick={() => router.push('/admin/vendors')}
          className="mt-4 inline-block rounded-lg bg-moss px-6 py-2 font-semibold text-white transition hover:opacity-95"
        >
          Go to Vendor Management
        </button>
      </div>
    );
  }

  const updateUserRole = async (id: string, role: Role, adminTierValue?: AdminTier) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role, adminTier: adminTierValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      setUsers((current) => current.map((user) => (user.id === id ? { ...user, role } : user)));
      setStatusMessage(role === 'VENDOR' ? `User ${id} promoted to vendor.` : `User ${id} made admin.`);
    } catch (error) {
      console.error('Failed to update user role:', error);
      setStatusMessage('Failed to update user role.');
    }
  };

  const handlePromoteToVendor = (id: string) => {
    void updateUserRole(id, 'VENDOR');
  };

  const handleMakeAdmin = (id: string) => {
    if (adminTier !== 'SUPER_ADMIN') {
      setStatusMessage('Only the super administrator can assign admin access.');
      return;
    }

    void updateUserRole(id, 'ADMIN', 'BASIC_ADMIN');
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Management</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Users & Roles</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Manage user accounts and assign roles with a simple list-based workspace.
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
          {isTierLoading ? 'Checking admin permissions…' : adminTier ? `Active admin tier: ${adminTier.replace('_', ' ')}` : 'Admin tier unavailable'}
        </p>
      </section>

      {statusMessage && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200" role="status" aria-live="polite">
          {statusMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm text-slate-300">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm text-slate-300">No users to manage.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <AdminUserCard
              key={user.id}
              id={user.id}
              email={user.email}
              name={user.name}
              phone={user.phone}
              currentRole={user.role}
              canMakeAdmin={adminTier === 'SUPER_ADMIN'}
              createdAt={user.createdAt}
              onPromoteToSeller={handlePromoteToVendor}
              onMakeAdmin={handleMakeAdmin}
            />
          ))}
        </div>
      )}
    </main>
  );
}

