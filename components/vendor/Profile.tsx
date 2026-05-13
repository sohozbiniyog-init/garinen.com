'use client';

import { useState } from 'react';
import { AvatarUpload } from '@/components/landing/AvatarUpload';
import { useAvatarUpload } from '@/lib/hooks/useAvatarUpload';

interface VendorInfo {
  shopName?: string;
  description?: string;
  phone?: string;
  category?: string;
  locationDivision?: string;
  locationAddress?: string;
}

interface VendorProfileProps {
  userId: string;
  vendorName: string;
  vendorEmail: string;
  currentPhone?: string;
  vendorInfo?: VendorInfo;
  currentAvatarUrl?: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

export function VendorProfile({
  userId,
  vendorName,
  vendorEmail,
  currentPhone = '',
  vendorInfo = {},
  currentAvatarUrl,
  onAvatarUpdate,
}: VendorProfileProps) {
  const { uploadAvatar, isLoading: isUploading } = useAvatarUpload({ userId });
  const [phoneNumber, setPhoneNumber] = useState(currentPhone || vendorInfo.phone || '');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState('');

  const shopName = vendorInfo.shopName || '';
  const description = vendorInfo.description || '';
  const category = vendorInfo.category || '';
  const locationDivision = vendorInfo.locationDivision || '';
  const locationAddress = vendorInfo.locationAddress || '';

  const handleAvatarUpload = async (file: File, uploadPath: string) => {
    try {
      const newAvatarUrl = await uploadAvatar(file, uploadPath);
      onAvatarUpdate?.(newAvatarUrl);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw error;
    }
  };

  const handlePhoneUpdate = async () => {
    setPhoneError('');
    setPhoneSuccess('');

    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      return;
    }

    // Validate phone format
    const phoneRegex = /^(\+880|880|0)?\d{10,11}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      setPhoneError('Invalid phone number format');
      return;
    }

    setIsUpdatingPhone(true);

    try {
      const response = await fetch('/api/vendor/profile/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        setPhoneError(error.error || 'Failed to update phone number');
        return;
      }

      setPhoneSuccess('Phone number updated successfully');
      setTimeout(() => setPhoneSuccess(''), 3000);
    } catch (error) {
      console.error('Phone update error:', error);
      setPhoneError('An error occurred while updating phone number');
    } finally {
      setIsUpdatingPhone(false);
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

      {/* Business Information Section (Read-Only) */}
      {shopName && (
        <div className="rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-soft">
          <h2 className="text-xl font-bold text-ink mb-6">Business Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-smoke">Shop Name</label>
              <p className="mt-2 text-sm text-ink">{shopName}</p>
            </div>

            {description && (
              <div>
                <label className="block text-sm font-semibold text-smoke">Description</label>
                <p className="mt-2 text-sm text-ink">{description}</p>
              </div>
            )}

            {category && (
              <div>
                <label className="block text-sm font-semibold text-smoke">Category</label>
                <p className="mt-2 text-sm text-ink capitalize">{category}</p>
              </div>
            )}

            {locationDivision && (
              <div>
                <label className="block text-sm font-semibold text-smoke">Location Division</label>
                <p className="mt-2 text-sm text-ink">{locationDivision}</p>
              </div>
            )}

            {locationAddress && (
              <div>
                <label className="block text-sm font-semibold text-smoke">Address</label>
                <p className="mt-2 text-sm text-ink">{locationAddress}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Personal Information Section */}
      <div className="rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-soft">
        <h2 className="text-xl font-bold text-ink mb-6">Personal Information</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-ink">Full Name</label>
            <input
              type="text"
              value={vendorName}
              disabled
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm opacity-60 focus:outline-none"
            />
            <p className="mt-2 text-xs text-smoke">Name cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink">Email</label>
            <input
              type="email"
              value={vendorEmail}
              disabled
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm opacity-60 focus:outline-none"
            />
            <p className="mt-2 text-xs text-smoke">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink">Phone Number</label>
            <div className="mt-2 flex gap-3">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setPhoneError('');
                  setPhoneSuccess('');
                }}
                placeholder="+880 1234567890"
                className="flex-1 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              />
              <button
                onClick={handlePhoneUpdate}
                disabled={isUpdatingPhone}
                className="rounded-lg bg-moss px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"
              >
                {isUpdatingPhone ? 'Saving...' : 'Update'}
              </button>
            </div>
            {phoneError && <p className="mt-2 text-xs text-red-600">{phoneError}</p>}
            {phoneSuccess && <p className="mt-2 text-xs text-moss">{phoneSuccess}</p>}
            <p className="mt-2 text-xs text-smoke">Only phone number can be updated</p>
          </div>
        </div>
      </div>
    </div>
  );
}

