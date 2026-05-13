import { NextRequest, NextResponse } from 'next/server';
import { verifySupabaseAccessToken } from '@/lib/auth/verify-token';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';
import { prisma } from '@/lib/db/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const pendingCookies: PendingCookie[] = [];
  const { id: listingId } = await params;

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
      return jsonWithCookies({ error: 'Forbidden: Only admins can approve listings' }, 403, pendingCookies);
    }

    // Parse request
    const body = await request.json();
    const { action, notes } = body;

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return jsonWithCookies({ error: 'Invalid action: must be APPROVE or REJECT' }, 400, pendingCookies);
    }

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return jsonWithCookies({ error: 'Listing not found' }, 404, pendingCookies);
    }

    if (listing.status !== 'PENDING') {
      return jsonWithCookies({ error: 'Only pending listings can be approved or rejected' }, 400, pendingCookies);
    }

    // Update listing
    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: newStatus,
        adminNotes: notes || (action === 'APPROVE' ? 'Approved by admin' : 'Rejected by admin'),
      },
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
    });

    return jsonWithCookies(
      {
        success: true,
        message: `Listing ${action.toLowerCase()}d successfully`,
        listing: {
          id: updatedListing.id,
          title: updatedListing.title,
          status: updatedListing.status,
          adminNotes: updatedListing.adminNotes,
        },
      },
      200,
      pendingCookies
    );
  } catch (error) {
    console.error('Error approving listing:', error);
    return jsonWithCookies({ error: 'Failed to approve listing' }, 500, pendingCookies);
  }
}
