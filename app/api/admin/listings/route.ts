import { prisma } from '@/lib/db/prisma';
import { verifySupabaseAccessToken } from '@/lib/auth/verify-token';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const supabase = createSupabaseRouteClient(request, pendingCookies);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    // Verify admin access
    let adminTier: string | null = null;
    try {
      const payload = await verifySupabaseAccessToken(session.access_token);
      adminTier = payload?.app_metadata?.custom_claims?.admin_tier || null;
    } catch (err) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    if (!adminTier || (adminTier !== 'SUPER_ADMIN' && adminTier !== 'VENDOR_ADMIN' && adminTier !== 'BASIC_ADMIN')) {
      return jsonWithCookies({ error: 'Forbidden: Only admins can view pending listings' }, 403, pendingCookies);
    }

    const listings = await prisma.listing.findMany({
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // PENDING first, then APPROVED, REJECTED, SOLD
        { createdAt: 'desc' }, // Newest within each status
      ],
    });

    return jsonWithCookies(
      {
        listings: listings.map((listing) => ({
          id: listing.id,
          title: listing.title,
          brand: listing.brand,
          model: listing.model,
          year: listing.year,
          price: listing.price.toString(),
          condition: listing.condition,
          mileage: listing.mileage,
          location: listing.location,
          imageUrls: Array.isArray(listing.imageUrls) ? listing.imageUrls : [],
          videoUrls: Array.isArray(listing.videoUrls) ? listing.videoUrls : [],
          status: listing.status,
          adminNotes: listing.adminNotes,
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt,
          shopName: listing.shop.name,
          owner: {
            id: listing.shop.owner.id,
            name: listing.shop.owner.name,
            email: listing.shop.owner.email,
          },
        })),
      },
      200,
      pendingCookies
    );
  } catch (error) {
    console.error('Error fetching admin listings:', error);
    return jsonWithCookies({ error: 'Failed to fetch listings' }, 500, pendingCookies);
  }
}
