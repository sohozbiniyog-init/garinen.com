import { useState } from 'react';

interface UseAvatarUploadOptions {
  userId: string;
}

export function useAvatarUpload({ userId }: UseAvatarUploadOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = async (file: File, uploadPath: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadPath', uploadPath);
      formData.append('userId', userId);

      const response = await fetch('/api/avatars/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      return data.url; // Return the public URL
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadAvatar,
    isLoading,
    error,
  };
}
