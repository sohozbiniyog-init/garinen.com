import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session || session.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, imageUrls, videoUrls } = body;

    const data: Record<string, unknown> = {};

    if (status !== undefined) {
      if (status !== 'APPROVED' && status !== 'REJECTED') {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      data.status = status;
    }

    if (imageUrls !== undefined) {
      data.imageUrls = Array.isArray(imageUrls)
        ? imageUrls.filter((url) => typeof url === 'string' && url.trim())
        : [];
    }

    if (videoUrls !== undefined) {
      data.videoUrls = Array.isArray(videoUrls)
        ? videoUrls.filter((url) => typeof url === 'string' && url.trim())
        : [];
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedListing, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    console.error('Error updating listing:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}