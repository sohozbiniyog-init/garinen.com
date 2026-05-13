import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';
import { prisma } from '@/lib/db/prisma';
import { Decimal } from '@prisma/client/runtime/library';

async function getDbVendorUser(email: string | null | undefined) {
  if (!email) return null;

  return prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, vendorApprovalStatus: true },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const pendingCookies: PendingCookie[] = [];
  const { id: listingId } = await params;

  try {
    const supabase = createSupabaseRouteClient(request, pendingCookies);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    // Get user and verify vendor status
    const user = await getDbVendorUser(session.user.email);

    if (!user || user.role !== 'VENDOR' || user.vendorApprovalStatus !== 'APPROVED') {
      return jsonWithCookies({ error: 'Only approved vendors can update listings' }, 403, pendingCookies);
    }

    // Get the listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { shop: { select: { ownerId: true } } },
    });

    if (!listing) {
      return jsonWithCookies({ error: 'Listing not found' }, 404, pendingCookies);
    }

    // Verify ownership
    if (listing.shop.ownerId !== user.id) {
      return jsonWithCookies({ error: 'You do not own this listing' }, 403, pendingCookies);
    }

    // Parse request body
    const body = await request.json();
    const { title, brand, model, year, price, condition, mileage, location } = body;

    // Validation
    if (!title || !brand || !model || !year || !price || !condition || !location) {
      return jsonWithCookies(
        { error: 'Missing required fields: title, brand, model, year, price, condition, location' },
        400,
        pendingCookies
      );
    }

    // Validate condition
    if (!['NEW', 'USED', 'RECONDITIONED'].includes(condition)) {
      return jsonWithCookies({ error: 'Invalid condition' }, 400, pendingCookies);
    }

    // Mileage is required for USED and RECONDITIONED
    if ((condition === 'USED' || condition === 'RECONDITIONED') && !mileage) {
      return jsonWithCookies({ error: 'Mileage is required for used and reconditioned vehicles' }, 400, pendingCookies);
    }

    // If the listing was APPROVED, updating it resets status to PENDING for re-approval
    const newStatus = listing.status === 'APPROVED' ? 'PENDING' : listing.status;

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        title,
        brand,
        model,
        year: parseInt(year),
        price: new Decimal(price),
        condition,
        mileage: mileage ? parseInt(mileage) : null,
        location,
        status: newStatus,
        adminNotes: newStatus === 'PENDING' && listing.status === 'APPROVED'
          ? 'Listing updated by vendor. Re-approval required.'
          : listing.adminNotes,
      },
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        year: true,
        price: true,
        condition: true,
        mileage: true,
        location: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return jsonWithCookies(
      {
        success: true,
        message: newStatus === 'PENDING' && listing.status === 'APPROVED'
          ? 'Listing updated and is awaiting admin re-approval'
          : 'Listing updated successfully',
        listing: {
          ...updatedListing,
          price: updatedListing.price.toString(),
        },
      },
      200,
      pendingCookies
    );
  } catch (error) {
    console.error('Error updating listing:', error);
    return jsonWithCookies({ error: 'Failed to update listing' }, 500, pendingCookies);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const pendingCookies: PendingCookie[] = [];
  const { id: listingId } = await params;

  try {
    const supabase = createSupabaseRouteClient(request, pendingCookies);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    const user = await getDbVendorUser(session.user.email);

    if (!user || user.role !== 'VENDOR' || user.vendorApprovalStatus !== 'APPROVED') {
      return jsonWithCookies({ error: 'Only approved vendors can view listings' }, 403, pendingCookies);
    }

    // Get the listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        year: true,
        price: true,
        condition: true,
        mileage: true,
        location: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
        shop: { select: { ownerId: true } },
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'EMI_APPLIED', 'EMI_PROCESSING', 'EMI_APPROVED'],
            },
          },
          select: { id: true },
        },
      },
    });

    if (!listing) {
      return jsonWithCookies({ error: 'Listing not found' }, 404, pendingCookies);
    }

    // Verify ownership
    if (listing.shop.ownerId !== user.id) {
      return jsonWithCookies({ error: 'You do not own this listing' }, 403, pendingCookies);
    }

    return jsonWithCookies(
      {
        listing: {
          id: listing.id,
          title: listing.title,
          brand: listing.brand,
          model: listing.model,
          year: listing.year,
          price: listing.price.toString(),
          condition: listing.condition,
          mileage: listing.mileage,
          location: listing.location,
          status: listing.status,
          adminNotes: listing.adminNotes,
          hasActiveBooking: listing.bookings.length > 0,
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt,
        },
      },
      200,
      pendingCookies
    );
  } catch (error) {
    console.error('Error fetching listing:', error);
    return jsonWithCookies({ error: 'Failed to fetch listing' }, 500, pendingCookies);
  }
}
