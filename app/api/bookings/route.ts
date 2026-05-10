import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { cacheService } from '@/lib/utils/cache';
import { getSessionFromRequest } from '@/lib/auth/helpers';

const ACTIVE_BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'EMI_APPLIED', 'EMI_PROCESSING', 'EMI_APPROVED'] as const;

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where:
        session.userRole === 'ADMIN'
          ? undefined
          : session.userRole === 'VENDOR'
            ? {
                listing: {
                  shop: {
                    ownerId: session.userId,
                  },
                },
              }
            : {
                userId: session.userId,
              },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            price: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      bookings.map((booking) => ({
        id: booking.id,
        buyerName: booking.user.name,
        buyerPhone: booking.user.phone ?? '',
        listingTitle: booking.listing.title,
        carPrice: booking.listing.price.toString(),
        depositAmount: booking.depositAmount?.toString() ?? '0',
        status: booking.status,
        createdAt: booking.createdAt.toLocaleString(),
        userId: booking.userId,
        listingId: booking.listingId,
        listing: booking.listing,
        user: booking.user,
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      listingId,
      userId,
      buyerName,
      buyerPhone,
      buyerEmail,
      address,
      profession,
      idempotencyKey,
    } = body as Record<string, unknown>;

    if (!listingId || typeof listingId !== 'string') {
      return NextResponse.json({ error: 'Missing required field: listingId' }, { status: 400 });
    }

    if (!buyerName || !buyerPhone || !buyerEmail || !address) {
      return NextResponse.json(
        { error: 'Missing required buyer details: buyerName, buyerPhone, buyerEmail, address' },
        { status: 400 }
      );
    }

    const resolvedIdempotencyKey = typeof idempotencyKey === 'string' && idempotencyKey.trim()
      ? idempotencyKey.trim()
      : randomUUID();

    const existingBooking = await prisma.booking.findFirst({
      where: { idempotencyKey: resolvedIdempotencyKey },
    });

    if (existingBooking) {
      return NextResponse.json(existingBooking, { status: 200 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        select: { id: true, price: true, status: true, title: true },
      });

      if (!listing) {
        throw new Error('LISTING_NOT_FOUND');
      }

      if (listing.status !== 'APPROVED') {
        throw new Error('LISTING_NOT_BOOKABLE');
      }

      const conflictingBooking = await tx.booking.findFirst({
        where: {
          listingId,
          status: { in: [...ACTIVE_BOOKING_STATUSES] },
        },
        select: { id: true },
      });

      if (conflictingBooking) {
        throw new Error('LISTING_ALREADY_RESERVED');
      }

      let bookingUserId = typeof userId === 'string' && userId.trim() ? userId.trim() : null;

      if (!bookingUserId) {
        const user = await tx.user.upsert({
          where: { email: String(buyerEmail).toLowerCase() },
          create: {
            email: String(buyerEmail).toLowerCase(),
            phone: String(buyerPhone),
            name: String(buyerName),
            role: 'BUYER',
          },
          update: {
            phone: String(buyerPhone),
            name: String(buyerName),
          },
          select: { id: true },
        });

        bookingUserId = user.id;
      }

      if (!bookingUserId) {
        throw new Error('USER_LOOKUP_FAILED');
      }

      const depositAmount = new Prisma.Decimal(listing.price.toString()).mul(new Prisma.Decimal('0.10'));

      const booking = await tx.booking.create({
        data: {
          userId: bookingUserId,
          listingId: listing.id,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          address: String(address),
          profession: (typeof profession === 'string' && profession) ? (profession as any) : undefined,
          paymentReference: `BK-${Date.now()}`,
          idempotencyKey: resolvedIdempotencyKey,
          emiDetails: {
            buyerName: String(buyerName),
            buyerPhone: String(buyerPhone),
            buyerEmail: String(buyerEmail).toLowerCase(),
            address: String(address),
            profession: typeof profession === 'string' ? profession : null,
            listingTitle: listing.title,
          },
        },
      });

      return booking;
    });

    // Invalidate listing cache since availability changed
    cacheService.invalidateListing(listingId);
    cacheService.invalidateListings();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create booking';

    if (message === 'LISTING_NOT_FOUND') {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (message === 'LISTING_NOT_BOOKABLE') {
      return NextResponse.json({ error: 'Only approved listings can be booked' }, { status: 409 });
    }

    if (message === 'LISTING_ALREADY_RESERVED') {
      return NextResponse.json({ error: 'This listing already has an active booking' }, { status: 409 });
    }

    if (message === 'USER_LOOKUP_FAILED') {
      return NextResponse.json({ error: 'Unable to resolve booking user' }, { status: 400 });
    }

    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
