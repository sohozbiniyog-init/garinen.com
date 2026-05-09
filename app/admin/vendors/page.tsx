'use client';

import { useEffect, useState } from 'react';

interface VendorRequest {
  id: string;
  email: string;
  name: string;
  vendorInfo: {
    shopName: string;
    description: string;
    location: string;
    phone: string;
    category: string;
    submittedAt: string;
  };
  vendorApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function VendorApprovalsPage() {
  const [vendors, setVendors] = useState<VendorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/vendors');
      if (!res.ok) {
        throw new Error('Failed to fetch vendors');
      }
      const data = await res.json();
      setVendors(data.vendors || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId: string) => {
    try {
      const res = await fetch('/api/admin/vendors/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      });

      if (!res.ok) {
        throw new Error('Failed to approve vendor');
      }

      // Refresh vendor list
      fetchVendors();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = async (vendorId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const res = await fetch('/api/admin/vendors/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, reason }),
      });

      if (!res.ok) {
        throw new Error('Failed to reject vendor');
      }

      // Refresh vendor list
      fetchVendors();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">ভেন্ডর অনুমোদন</h1>
        <p className="mt-2 text-sm text-smoke">নতুন ভেন্ডর অ্যাপ্লিকেশন পরীক্ষা এবং অনুমোদন করুন</p>
      </div>

      {loading && (
        <div className="rounded-lg border border-black/10 bg-white/50 p-8 text-center">
          <p className="text-smoke">লোড হচ্ছে...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-clay bg-clay/10 p-4">
          <p className="text-clay text-sm">{error}</p>
        </div>
      )}

      {!loading && vendors.length === 0 && (
        <div className="rounded-lg border border-black/10 bg-white/50 p-8 text-center">
          <p className="text-smoke">কোনো পেন্ডিং ভেন্ডর অ্যাপ্লিকেশন নেই</p>
        </div>
      )}

      <div className="space-y-4">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="rounded-lg border border-black/10 bg-white/50 p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ink">{vendor.vendorInfo.shopName}</h3>
                <p className="text-sm text-smoke">{vendor.email} • {vendor.vendorInfo.phone}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                vendor.vendorApprovalStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                vendor.vendorApprovalStatus === 'APPROVED' ? 'bg-moss/10 text-moss' :
                'bg-clay/10 text-clay'
              }`}>
                {vendor.vendorApprovalStatus === 'PENDING' ? 'পেন্ডিং' :
                 vendor.vendorApprovalStatus === 'APPROVED' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
              </span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-smoke">অবস্থান</p>
                <p className="font-medium text-ink">{vendor.vendorInfo.location}</p>
              </div>
              <div>
                <p className="text-xs text-smoke">বিভাগ</p>
                <p className="font-medium text-ink capitalize">{vendor.vendorInfo.category}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-smoke">বর্ণনা</p>
                <p className="font-medium text-ink line-clamp-2">{vendor.vendorInfo.description}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-smoke">জমা দেওয়ার সময়</p>
                <p className="font-medium text-ink">
                  {new Date(vendor.vendorInfo.submittedAt).toLocaleDateString('bn-BD')}
                </p>
              </div>
            </div>

            {vendor.vendorApprovalStatus === 'PENDING' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(vendor.id)}
                  className="flex-1 rounded-lg bg-moss px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  অনুমোদন করুন
                </button>
                <button
                  onClick={() => handleReject(vendor.id)}
                  className="flex-1 rounded-lg border border-clay bg-white/50 px-4 py-2 font-semibold text-clay hover:bg-clay/5 transition-colors"
                >
                  প্রত্যাখ্যান করুন
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
