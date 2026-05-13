import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/helpers';
import { prisma } from '@/lib/db/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';

const MAX_IMAGES = 5;

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
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

    // File uploads only allowed when listing is in PENDING status
    if (files.length > 0 && listing.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'File uploads only allowed for listings in PENDING approval state. Use URL updates to modify approved listings.' },
        { status: 403 }
      );
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

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : toStringArray(listing.imageUrls),
        videoUrls: videoUrl ? [videoUrl] : toStringArray(listing.videoUrls),
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
    const { imageUrls, videoUrls } = body;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { imageUrls: true, videoUrls: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Allow URL updates regardless of listing status
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        imageUrls: imageUrls ? imageUrls : toStringArray(listing.imageUrls),
        videoUrls: videoUrls ? videoUrls : toStringArray(listing.videoUrls),
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