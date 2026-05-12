'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// server-verified claims are fetched from /api/auth/me
import { createBrowserClient } from '@supabase/ssr';
import { showToast } from '@/components/common/Toast';

interface VendorApplication {
  id: string;
  email: string;
  name: string;
  phone?: string;
  vendorInfo?: {
    shopName?: string;
    category?: string;
    locationDivision?: string;
    locationAddress?: string;
    description?: string;
    phone?: string;
    [key: string]: unknown;
  };
  vendorApprovalStatus: string;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  new: 'নতুন গাড়ি বিক্রেতা',
  used: 'ব্যবহৃত গাড়ি বিক্রেতা',
  reconditioned: 'রি-কন্ডিশন গাড়ী বিক্রেতা',
};

export default function VendorApprovalsPage() {
  const router = useRouter();
  const [adminTier, setAdminTier] = useState<string | null>(null);
  const [vendors, setVendors] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Check admin tier and fetch vendors on mount
  useEffect(() => {
    const checkTierAndFetchVendors = async () => {
      try {
        try {
          const res = await fetch('/api/auth/me');
          if (!res.ok) {
            router.push('/login');
            return;
          }

          const json = await res.json();
          const tier = json?.claims?.admin_tier;

          if (!tier || (tier !== 'SUPER_ADMIN' && tier !== 'VENDOR_ADMIN' && tier !== 'BASIC_ADMIN')) {
            showToast('Only admins can access vendor approvals', { type: 'error' });
            router.push('/login');
            return;
          }

          setAdminTier(tier);
          fetchVendors();
        } catch (err) {
          console.error('Failed to verify admin tier:', err);
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to verify admin tier:', error);
        router.push('/login');
      }
    };

    checkTierAndFetchVendors();
  }, [supabase, router]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/vendors');
      if (!res.ok) throw new Error('Failed to fetch vendors');

      const data = await res.json();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      showToast('Failed to load vendor applications', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId: string) => {
    setProcessingId(vendorId);
    try {
      const res = await fetch('/api/admin/vendors/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: vendorId, status: 'APPROVED' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve vendor');
      }

      showToast('Vendor approved successfully', { type: 'success' });
      // Remove from list
      setVendors(vendors.filter(v => v.id !== vendorId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve vendor';
      showToast(message, { type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (vendorId: string) => {
    setProcessingId(vendorId);
    try {
      const res = await fetch('/api/admin/vendors/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: vendorId, status: 'DECLINED' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to decline vendor');
      }

      showToast('Vendor declined', { type: 'success' });
      // Remove from list
      setVendors(vendors.filter(v => v.id !== vendorId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to decline vendor';
      showToast(message, { type: 'error' });
    } finally {
      setProcessingId(null);
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
        <h1 className="text-3xl font-semibold text-white">Vendor Applications</h1>
        <p className="mt-2 text-sm text-slate-300">
          {adminTier === 'SUPER_ADMIN'
            ? 'Review and approve all vendor applications'
            : 'Review and approve pending vendor applications'}
        </p>
      </div>

      {/* Vendor List */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded bg-white/5" />
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-semibold text-slate-300">No pending vendor applications</p>
            <p className="mt-1 text-sm text-slate-400">All vendor applications have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map(vendor => (
              <div
                key={vendor.id}
                className="flex flex-col justify-between rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex-1">
                  <p className="font-semibold text-white">{vendor.name}</p>
                  <p className="text-sm text-slate-400">{vendor.email}</p>
                  {vendor.phone && (
                    <p className="text-sm text-slate-400">{vendor.phone}</p>
                  )}
                  {vendor.vendorInfo?.shopName && (
                    <p className="mt-1 text-xs text-slate-500">
                      Shop: {vendor.vendorInfo.shopName}
                    </p>
                  )}
                  {vendor.vendorInfo?.category && (
                    <p className="mt-1 text-xs text-slate-500">
                      Category: {CATEGORY_LABELS[vendor.vendorInfo.category] || vendor.vendorInfo.category}
                    </p>
                  )}
                  {(vendor.vendorInfo?.locationDivision || vendor.vendorInfo?.locationAddress) && (
                    <p className="mt-1 text-xs text-slate-500">
                      Location: {vendor.vendorInfo.locationDivision}{vendor.vendorInfo.locationAddress ? `, ${vendor.vendorInfo.locationAddress}` : ''}
                    </p>
                  )}
                  {vendor.vendorInfo?.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {vendor.vendorInfo.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    Applied: {new Date(vendor.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex gap-2 sm:mt-0">
                  <button
                    onClick={() => handleApprove(vendor.id)}
                    disabled={processingId === vendor.id}
                    className="rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processingId === vendor.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleDecline(vendor.id)}
                    disabled={processingId === vendor.id}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processingId === vendor.id ? 'Processing...' : 'Decline'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

