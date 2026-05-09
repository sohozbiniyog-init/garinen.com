'use client';

import { AdminUserCard } from '@/components/admin-user-card';
import { useState } from 'react';

type Role = 'BUYER' | 'VENDOR' | 'ADMIN';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  createdAt: string;
}

// Mock pending users
const mockPendingUsers: User[] = [
  {
    id: '1',
    email: 'rahman@example.com',
    name: 'Abdul Rahman',
    phone: '+880 1712345678',
    role: 'BUYER',
    createdAt: 'May 2, 10:15 AM'
  },
  {
    id: '2',
    email: 'nasrin@example.com',
    name: 'Nasrin Akhtar',
    phone: '+880 1823456789',
    role: 'BUYER',
    createdAt: 'May 1, 3:45 PM'
  },
  {
    id: '3',
    email: 'karim@example.com',
    name: 'Karim Hassan',
    phone: '+880 1934567890',
    role: 'BUYER',
    createdAt: 'Apr 30, 9:20 AM'
  }
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockPendingUsers);
  const [statusMessage, setStatusMessage] = useState('');

  const handlePromoteToVendor = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, role: 'VENDOR' as const } : u)));
    setStatusMessage(`User ${id} promoted to vendor.`);
  };

  const handleMakeAdmin = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, role: 'ADMIN' as const } : u)));
    setStatusMessage(`User ${id} made admin.`);
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Management</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Users & Roles</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Manage user accounts and assign roles. Promote buyers to vendors or admins as needed.
        </p>
      </section>

      {statusMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950" role="status" aria-live="polite">
          {statusMessage}
        </div>
      )}

      {users.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-8 text-center shadow-soft">
          <p className="text-sm text-smoke">No users to manage.</p>
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
