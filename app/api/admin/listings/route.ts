import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: 'PENDING' },
      include: {
        shop: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      listings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        price: listing.price.toString(),
        shopName: listing.shop.name,
        createdAt: listing.createdAt.toLocaleString(),
        imageUrls: Array.isArray(listing.imageUrls) ? listing.imageUrls.filter((url): url is string => typeof url === 'string') : [],
        videoUrls: Array.isArray(listing.videoUrls) ? listing.videoUrls.filter((url): url is string => typeof url === 'string') : [],
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}
