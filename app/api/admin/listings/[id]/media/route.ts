import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/helpers';
import { prisma } from '@/lib/db/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';

const MAX_IMAGES = 5;
const MAX_VIDEOS = 5;

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeYouTubeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/watch?v=${id}` : trimmed;
    }

    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (url.pathname.startsWith('/watch')) {
        const id = url.searchParams.get('v');
        return id ? `https://www.youtube.com/watch?v=${id}` : trimmed;
      }

      const embedMatch = url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})/);
      if (embedMatch?.[1]) {
        return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
      }

      const shortsMatch = url.pathname.match(/^\/shorts\/([A-Za-z0-9_-]{11})/);
      if (shortsMatch?.[1]) {
        return `https://www.youtube.com/watch?v=${shortsMatch[1]}`;
      }
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Storage is not configured' }, { status: 500 });
    }

    const { id } = await params;
    const formData = await request.formData();
    const videoUrlEntry = formData.get('videoUrl');
    const videoUrl = typeof videoUrlEntry === 'string' ? videoUrlEntry.trim() : '';
    const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length > MAX_IMAGES) {
      return NextResponse.json({ error: `Upload at most ${MAX_IMAGES} images.` }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { imageUrls: true, videoUrls: true, status: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const uploadedImageUrls: string[] = [];

    for (const file of files) {
      const path = `${id}/${randomUUID()}.webp`;
      const uploadResult = await supabaseAdmin.storage.from('photo').upload(path, file, {
        contentType: file.type || 'image/webp',
        upsert: false,
      });

      if (uploadResult.error) {
        const errorMsg = uploadResult.error.message || 'Unknown upload error';
        if (errorMsg.includes('Bucket not found') || errorMsg.includes('not found')) {
          throw new Error(
            'Photo storage bucket not initialized. Call POST /api/admin/setup/buckets first.'
          );
        }
        throw new Error(errorMsg);
      }

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from('photo').getPublicUrl(uploadResult.data.path);

      uploadedImageUrls.push(publicUrl);
    }

    const existingImages = toStringArray(listing.imageUrls);
    const existingVideos = toStringArray(listing.videoUrls);
    const normalizedVideoUrl = normalizeYouTubeUrl(videoUrl);

    if (normalizedVideoUrl && !isHttpUrl(normalizedVideoUrl)) {
      return NextResponse.json({ error: 'Invalid video URL format' }, { status: 400 });
    }

    const nextImages = dedupe([...existingImages, ...uploadedImageUrls]).slice(0, MAX_IMAGES);
    const nextVideos = normalizedVideoUrl
      ? dedupe([...existingVideos, normalizedVideoUrl]).slice(0, MAX_VIDEOS)
      : existingVideos;

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        imageUrls: nextImages,
        videoUrls: nextVideos,
      },
      select: {
        id: true,
        imageUrls: true,
        videoUrls: true,
      },
    });

    return NextResponse.json(
      {
        id: updatedListing.id,
        imageUrls: toStringArray(updatedListing.imageUrls),
        videoUrls: toStringArray(updatedListing.videoUrls),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading listing media:', error);
    return NextResponse.json({ error: 'Failed to upload listing media' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      imageUrls,
      videoUrls,
      imageUrlsAdd,
      imageUrlsRemove,
      videoUrlsAdd,
      videoUrlsRemove,
    } = body;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { imageUrls: true, videoUrls: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const currentImages = toStringArray(listing.imageUrls);
    const currentVideos = toStringArray(listing.videoUrls);

    const replaceImages = imageUrls !== undefined ? toStringArray(imageUrls) : null;
    const replaceVideos = videoUrls !== undefined ? toStringArray(videoUrls).map(normalizeYouTubeUrl) : null;
    const addImages = toStringArray(imageUrlsAdd);
    const removeImages = new Set(toStringArray(imageUrlsRemove));
    const addVideos = toStringArray(videoUrlsAdd).map(normalizeYouTubeUrl);
    const removeVideos = new Set(toStringArray(videoUrlsRemove).map(normalizeYouTubeUrl));

    const invalidImage = [...(replaceImages ?? []), ...addImages].find((url) => !isHttpUrl(url));
    if (invalidImage) {
      return NextResponse.json({ error: `Invalid image URL: ${invalidImage}` }, { status: 400 });
    }

    const invalidVideo = [...(replaceVideos ?? []), ...addVideos].find((url) => !isHttpUrl(url));
    if (invalidVideo) {
      return NextResponse.json({ error: `Invalid video URL: ${invalidVideo}` }, { status: 400 });
    }

    let nextImages = replaceImages ? dedupe(replaceImages) : dedupe([...currentImages, ...addImages]);
    if (removeImages.size > 0) {
      nextImages = nextImages.filter((url) => !removeImages.has(url));
    }
    nextImages = nextImages.slice(0, MAX_IMAGES);

    let nextVideos = replaceVideos ? dedupe(replaceVideos) : dedupe([...currentVideos, ...addVideos]);
    if (removeVideos.size > 0) {
      nextVideos = nextVideos.filter((url) => !removeVideos.has(url));
    }
    nextVideos = nextVideos.slice(0, MAX_VIDEOS);

    // Allow media URL updates regardless of listing status
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        imageUrls: nextImages,
        videoUrls: nextVideos,
      },
      select: {
        id: true,
        imageUrls: true,
        videoUrls: true,
      },
    });

    return NextResponse.json(
      {
        id: updatedListing.id,
        imageUrls: toStringArray(updatedListing.imageUrls),
        videoUrls: toStringArray(updatedListing.videoUrls),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating listing URLs:', error);
    return NextResponse.json({ error: 'Failed to update listing URLs' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { imageUrl, videoUrl } = body as { imageUrl?: string; videoUrl?: string };

    if (!imageUrl && !videoUrl) {
      return NextResponse.json({ error: 'Provide imageUrl or videoUrl to delete' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { imageUrls: true, videoUrls: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const normalizedVideo = videoUrl ? normalizeYouTubeUrl(videoUrl) : null;
    const nextImages = toStringArray(listing.imageUrls).filter((url) => url !== imageUrl);
    const nextVideos = toStringArray(listing.videoUrls).filter((url) => url !== normalizedVideo);

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        imageUrls: nextImages,
        videoUrls: nextVideos,
      },
      select: {
        id: true,
        imageUrls: true,
        videoUrls: true,
      },
    });

    return NextResponse.json(
      {
        id: updatedListing.id,
        imageUrls: toStringArray(updatedListing.imageUrls),
        videoUrls: toStringArray(updatedListing.videoUrls),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting listing media URL:', error);
    return NextResponse.json({ error: 'Failed to delete listing media URL' }, { status: 500 });
  }
}