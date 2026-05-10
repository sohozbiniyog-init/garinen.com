'use client';

import { useState } from 'react';
import { AvatarUpload } from '@/components/landing/AvatarUpload';
import { useAvatarUpload } from '@/lib/hooks/useAvatarUpload';

interface VendorProfileProps {
  userId: string;
  vendorName: string;
  vendorEmail: string;
  shopName?: string;
  currentAvatarUrl?: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

export function VendorProfile({
  userId,
  vendorName,
  vendorEmail,
  shopName = '',
  currentAvatarUrl,
  onAvatarUpdate,
}: VendorProfileProps) {
  const { uploadAvatar, isLoading: isUploading } = useAvatarUpload({ userId });
  const [profileData, setProfileData] = useState({
    name: vendorName,
    email: vendorEmail,
    shopName: shopName,
  });

  const handleAvatarUpload = async (file: File, uploadPath: string) => {
    try {
      const newAvatarUrl = await uploadAvatar(file, uploadPath);
      onAvatarUpdate?.(newAvatarUrl);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-soft">
        <h2 className="text-xl font-bold text-ink mb-6">Profile Picture</h2>
        <AvatarUpload
          currentAvatarUrl={currentAvatarUrl}
          userName={vendorName}
          userRole="VENDOR"
          onUpload={handleAvatarUpload}
          isLoading={isUploading}
        />
      </div>

      {/* Profile Information Section */}
      <div className="rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-soft">
        <h2 className="text-xl font-bold text-ink mb-6">Profile Information</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-ink">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink">Shop Name</label>
            <input
              type="text"
              value={profileData.shopName}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, shopName: e.target.value }))
              }
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink">Email</label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm opacity-60 focus:outline-none"
            />
            <p className="mt-2 text-xs text-smoke">Email cannot be changed</p>
          </div>

          <button className="rounded-full bg-moss px-6 py-3 text-sm font-semibold text-white transition hover:bg-opacity-90">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

