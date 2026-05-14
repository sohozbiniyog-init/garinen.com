'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { showToast } from '@/components/common/Toast';
import type { AuditLog } from '@prisma/client';
interface AdminAccount {
  id: string;
  email: string;
  name: string;
  phone?: string;
  tier: 'SUPER_ADMIN' | 'VENDOR_ADMIN';
  createdAt: string;
}

export default function AdminManagementPage() {
  const router = useRouter();
  const [adminTier, setAdminTier] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [logs, setLogs] = useState<AuditLog[] | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    tier: 'VENDOR_ADMIN' as const,
  });
  const [formError, setFormError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Check admin tier on mount
  useEffect(() => {
    const checkAdminTier = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }

        const json = await res.json();
        const tier = json?.claims?.admin_tier;

        if (tier !== 'SUPER_ADMIN') {
          showToast('Only SUPER_ADMIN can access this page', { type: 'error' });
          router.push('/admin');
          return;
        }

        setAdminTier(tier);
        fetchAdmins();
      } catch (error) {
        console.error('Failed to verify admin tier:', error);
        router.push('/admin');
      }
    };

    checkAdminTier();
  }, [supabase, router]);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/list-admins');
      if (!res.ok) throw new Error('Failed to fetch admins');

      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/admin-actions');
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs', err);
      setLogs([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this admin?')) return;
    try {
      const res = await fetch('/api/admin/delete-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      showToast('Deleted', { type: 'success' });
      await fetchAdmins();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete', { type: 'error' });
    }
  };

  const handleUpdate = async (admin: AdminAccount) => {
    const newName = prompt('New name', admin.name) || admin.name;
    const newTier = prompt('Tier (SUPER_ADMIN|VENDOR_ADMIN|BASIC_ADMIN)', admin.tier) || admin.tier;
    try {
      const res = await fetch('/api/admin/update-admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: admin.id, name: newName, tier: newTier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      showToast('Updated', { type: 'success' });
      await fetchAdmins();
    } catch (err) {
      console.error(err);
      showToast('Failed to update', { type: 'error' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.email || !formData.name || !formData.password) {
      setFormError('Email, name, and password are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Invalid email format');
      return;
    }

    setCreating(true);

    try {
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone || undefined,
          password: formData.password,
          tier: formData.tier,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create admin');
      }

      showToast(`${formData.tier} account created successfully`, { type: 'success' });

      // Reset form
      setFormData({
        email: '',
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
        tier: 'VENDOR_ADMIN',
      });

      // Refresh admin list
      await fetchAdmins();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create admin';
      setFormError(message);
      showToast(message, { type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  if (!adminTier) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Admin Management (SUPER_ADMIN)</h1>

      {/* Create form (minimal) */}
      <div>
        <h2 className="font-semibold text-white">Create Admin</h2>
        <form onSubmit={handleSubmit} className="space-y-2 max-w-md">
          <input name="email" value={formData.email} onChange={handleInputChange} placeholder="email" className="w-full rounded p-2 bg-white/5" />
          <input name="name" value={formData.name} onChange={handleInputChange} placeholder="name" className="w-full rounded p-2 bg-white/5" />
          <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="phone" className="w-full rounded p-2 bg-white/5" />
          <input name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="password" className="w-full rounded p-2 bg-white/5" />
          <input name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} type="password" placeholder="confirm" className="w-full rounded p-2 bg-white/5" />
          <select name="tier" value={formData.tier} onChange={handleInputChange} className="w-full rounded p-2 bg-white/5">
            <option value="VENDOR_ADMIN">VENDOR_ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
          {formError && <div className="text-rose-400">{formError}</div>}
          <button disabled={creating} className="px-4 py-2 rounded bg-moss">{creating ? 'Creating...' : 'Create'}</button>
        </form>
      </div>

      {/* Admin list */}
      <div>
        <h2 className="font-semibold text-white">Admins</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-300"><th>Email</th><th>Name</th><th>Tier</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id} className="border-t border-white/5">
                  <td className="py-2">{a.email}</td>
                  <td>{a.name}</td>
                  <td>{a.tier}</td>
                  <td>{new Date(a.createdAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleUpdate(a)} className="mr-2 underline">Edit</button>
                    <button onClick={() => handleDelete(a.id)} className="underline text-rose-400">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <button onClick={fetchAdmins} className="underline mr-2">Refresh</button>
        <button onClick={fetchLogs} className="underline">View Activity Log</button>
      </div>

      {logs && (
        <div>
          <h3 className="font-semibold">Activity Log</h3>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap bg-white/5 p-3 text-xs">{JSON.stringify(logs, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

