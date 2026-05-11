'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { showToast } from '@/components/common/Toast';

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-white">Admin Management</h1>
        <p className="mt-2 text-sm text-slate-300">Create new admin accounts (SUPER_ADMIN and VENDOR_ADMIN)</p>
      </div>

      {/* Create Admin Form */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Create New Admin Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@ghuri.local"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-400 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-white">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Admin Name"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-400 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-white">
                Phone (optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+880 1X XXX XX XX"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-400 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              />
            </div>

            <div>
              <label htmlFor="tier" className="block text-sm font-semibold text-white">
                Admin Tier
              </label>
              <select
                id="tier"
                name="tier"
                value={formData.tier}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              >
                <option value="VENDOR_ADMIN" className="bg-slate-800">VENDOR_ADMIN (vendor approval)</option>
                <option value="SUPER_ADMIN" className="bg-slate-800">SUPER_ADMIN (create admins)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="At least 8 characters"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-400 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Repeat password"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-400 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              />
            </div>
          </div>

          {formError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-sm text-red-200">{formError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-lg bg-moss px-6 py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>
      </div>

      {/* Admin List */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Existing Admin Accounts</h2>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 rounded bg-white/5" />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <p className="text-sm text-slate-300">No admin accounts created yet</p>
        ) : (
          <div className="space-y-2">
            {admins.map(admin => (
              <div key={admin.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="font-semibold text-white">{admin.name}</p>
                  <p className="text-xs text-slate-400">{admin.email}</p>
                  {admin.phone && <p className="text-xs text-slate-400">{admin.phone}</p>}
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    admin.tier === 'SUPER_ADMIN' 
                      ? 'bg-brand-red/20 text-brand-red'
                      : 'bg-moss/20 text-moss'
                  }`}>
                    {admin.tier}
                  </span>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

