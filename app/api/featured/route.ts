import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/lib/utils/cache';
import { getCustomClaimsFromSupabaseJwt } from '@/lib/auth/jwt-claims';
import { createServerClient } from '@supabase/ssr';
import { prisma } from '@/lib/db/prisma';
import { requestFeatureSchema, approveFeatureSchema, reorderFeaturesSchema } from '@/lib/schemas/featured';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includeListingDetails = searchParams.get('details') === 'true';

    // Cache approved featured listings (most frequently accessed)
    if (status === 'APPROVED') {
      const cachedFeatures = await cacheService.getListings(
        async () =>
          prisma.featuredListing.findMany({
            where: {
              status: 'APPROVED',
              listing: {
                status: 'APPROVED',
              },
            },
            include: includeListingDetails
              ? {
                  listing: {
                    select: {
                      id: true,
                      title: true,
                      brand: true,
                      model: true,
                      price: true,
                      location: true,
                      imageUrls: true,
                      year: true,
                    },
                  },
                }
              : { listing: false },
            orderBy: {
              displayOrder: 'asc',
            },
          }),
        {
          entity: 'featured-listings-approved',
          includeListingDetails,
        }
      );

      return NextResponse.json(cachedFeatures);
    }

    // For other queries, fetch fresh data
    const features = await prisma.featuredListing.findMany({
      where:
        status === 'PENDING' || status === 'REJECTED'
          ? {
              status: status as 'PENDING' | 'REJECTED',
              listing: {
                status: 'APPROVED', // Can only feature approved listings
              },
            }
          : {
              listing: {
                status: 'APPROVED',
              },
            },
      include: includeListingDetails
        ? {
            listing: {
              select: {
                id: true,
                title: true,
                brand: true,
                model: true,
                price: true,
                location: true,
                imageUrls: true,
                year: true,
                shopId: true,
              },
            },
            requester: {
              select: {
                id: true,
                email: true,
              },
            },
            approver: {
              select: {
                id: true,
                email: true,
              },
            },
          }
        : {},
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return NextResponse.json(features);
  } catch (error) {
    console.error('Error fetching featured listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = sessionData.session?.access_token;
    const claims = token ? await getCustomClaimsFromSupabaseJwt(token) : null;

    // Parse and validate request body
    const body = await request.json();
    const parsed = requestFeatureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { listingId, sourceRole } = parsed.data;

    // Verify listing exists and is APPROVED
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, shopId: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved listings can be featured' },
        { status: 400 }
      );
    }

    // Check if already featured
    const existingFeature = await prisma.featuredListing.findUnique({
      where: { listingId },
    });

    if (existingFeature) {
      return NextResponse.json(
        { error: 'This listing is already featured' },
        { status: 400 }
      );
    }

    // Authorization: vendor can only request their own listings; admin can request any
    if (sourceRole === 'VENDOR') {
      const vendor = await prisma.user.findUnique({
        where: { id: user.id },
        select: { vendorInfo: true },
      });

      if (!vendor?.vendorInfo) {
        return NextResponse.json(
          { error: 'You must be a vendor to request features' },
          { status: 403 }
        );
      }

      // Verify ownership
      const shop = await prisma.shop.findFirst({
        where: { id: listing.shopId, ownerId: user.id },
      });

      if (!shop) {
        return NextResponse.json(
          { error: 'You can only feature your own listings' },
          { status: 403 }
        );
      }
    } else if (sourceRole === 'ADMIN') {
      // Only SUPER_ADMIN can create admin feature requests
      if (claims?.role !== 'ADMIN' || claims?.admin_tier !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Only SUPER_ADMIN can create admin feature requests' },
          { status: 403 }
        );
      }
    }

    // Create feature request
    const featureRequest = await prisma.featuredListing.create({
      data: {
        listingId,
        requestedBy: user.id,
        sourceRole: sourceRole as 'VENDOR' | 'ADMIN',
        status: sourceRole === 'ADMIN' ? 'APPROVED' : 'PENDING',
        approvedBy: sourceRole === 'ADMIN' ? user.id : null,
      },
      include: {
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
    });

    // Invalidate cache
    cacheService.clear();

    return NextResponse.json(featureRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating feature request:', error);
    return NextResponse.json(
      { error: 'Failed to create feature request' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = sessionData.session?.access_token;
    const claims = token ? await getCustomClaimsFromSupabaseJwt(token) : null;

    // Only admins can approve/reject
    if (claims?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can approve feature requests' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Handle reorder (displayOrder updates)
    if ('orders' in body && typeof body.orders === 'object') {
      const parsed = reorderFeaturesSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid reorder request', details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const { orders } = parsed.data;
      const updates = await Promise.all(
        Object.entries(orders).map(([featureId, order]) =>
          prisma.featuredListing.update({
            where: { id: featureId },
            data: { displayOrder: order },
          })
        )
      );

      cacheService.clear();
      return NextResponse.json(updates);
    }

    // Handle approve/reject
    const approveSchema = approveFeatureSchema.safeParse(body);
    if (!approveSchema.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: approveSchema.error.flatten() },
        { status: 400 }
      );
    }

    const { id, status } = approveSchema.data;

    // Verify feature exists
    const feature = await prisma.featuredListing.findUnique({
      where: { id },
    });

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      );
    }

    // Update status
    const updated = await prisma.featuredListing.update({
      where: { id },
      data: {
        status: status as 'APPROVED' | 'REJECTED',
        approvedBy: status === 'APPROVED' ? user.id : feature.approvedBy,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
          },
        },
      },
    });

    // Invalidate cache
    cacheService.clear();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating feature request:', error);
    return NextResponse.json(
      { error: 'Failed to update feature request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = sessionData.session?.access_token;
    const claims = token ? await getCustomClaimsFromSupabaseJwt(token) : null;

    // Only admins can delete
    if (claims?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can delete feature requests' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Feature ID is required' },
        { status: 400 }
      );
    }

    // Verify exists
    const feature = await prisma.featuredListing.findUnique({ where: { id } });
    if (!feature) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      );
    }

    // Delete
    await prisma.featuredListing.delete({ where: { id } });

    // Invalidate cache
    cacheService.clear();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feature request:', error);
    return NextResponse.json(
      { error: 'Failed to delete feature request' },
      { status: 500 }
    );
  }
}
