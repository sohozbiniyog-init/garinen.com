'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userName: string;
  userRole: 'BUYER' | 'VENDOR' | 'ADMIN';
  onUpload: (file: File, uploadUrl: string) => Promise<void>;
  isLoading?: boolean;
}

export function AvatarUpload({
  currentAvatarUrl,
  userName,
  userRole,
  onUpload,
  isLoading
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setUploading(true);
      setError(null);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `${userRole.toLowerCase()}-${timestamp}-${randomStr}`;
      const uploadUrl = `avatars/${userRole.toLowerCase()}/${fileName}`;

      await onUpload(file, uploadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-moss/30 bg-moss/10 flex items-center justify-center">
        {preview ? (
          <Image
            src={preview}
            alt="Avatar preview"
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        ) : currentAvatarUrl ? (
          <Image
            src={currentAvatarUrl}
            alt={userName}
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-2xl font-bold text-moss">{initials}</span>
        )}
      </div>

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading || isLoading}
          className="hidden"
          aria-label="Upload avatar"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isLoading}
          className="inline-flex items-center gap-2 rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>📸</span>
          {uploading || isLoading ? 'Uploading…' : 'Change Avatar'}
        </button>
      </div>

      {/* User Info */}
      <div className="text-center">
        <p className="text-sm font-semibold text-ink">{userName}</p>
        <p className="text-xs text-smoke capitalize">{userRole.toLowerCase()} Account</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success Message */}
      {preview && !error && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          Avatar updated successfully!
        </div>
      )}
    </div>
  );
}

