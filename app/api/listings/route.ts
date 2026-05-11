import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    if (location === 'list') {
      // Return unique locations
      const locations = await prisma.listing.findMany({
        where: {
          status: 'APPROVED',
        },
        select: {
          location: true,
        },
        distinct: ['location'],
        orderBy: {
          location: 'asc',
        },
      });

      const uniqueLocations = locations
        .map((l) => l.location)
        .filter((loc) => loc && loc.trim() !== '');

      return NextResponse.json(uniqueLocations, { status: 200 });
    }

    // Filter listings by location if specified
    const query: Prisma.ListingWhereInput = {
      status: 'APPROVED',
    };

    if (location && location !== '') {
      query.location = location;
    }

    const listings = await prisma.listing.findMany({
      where: query,
      include: {
        shop: {
          select: {
            name: true,
            isVerified: true,
          },
        },
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'EMI_APPLIED', 'EMI_PROCESSING', 'EMI_APPROVED'],
            },
          },
          select: { id: true },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedListings = listings.map((listing) => {
      const avgRating = listing.reviews.length > 0
        ? (listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length).toFixed(1)
        : null;

      return {
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        year: listing.year,
        price: listing.price.toString(),
        location: listing.location,
        mileage: listing.mileage,
        shopName: listing.shop.name,
        isVerified: listing.shop.isVerified,
        hasActiveBooking: listing.bookings.length > 0,
        rating: avgRating,
        reviewCount: listing.reviews.length,
      };
    });

    return NextResponse.json(formattedListings, { status: 200 });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

