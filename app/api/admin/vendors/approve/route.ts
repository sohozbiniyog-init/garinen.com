import { NextRequest, NextResponse } from 'next/server';
import { verifySupabaseAccessToken } from '@/lib/auth/verify-token';
import { prisma } from '@/lib/db/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';

export async function POST(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const supabase = createSupabaseRouteClient(request, pendingCookies);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    // Verify admin access (signature-checked)
    let adminTier: string | null = null;
    try {
      const payload = await verifySupabaseAccessToken(session.access_token);
      adminTier = payload?.app_metadata?.custom_claims?.admin_tier || null;
    } catch (err) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    if (!adminTier || (adminTier !== 'SUPER_ADMIN' && adminTier !== 'VENDOR_ADMIN' && adminTier !== 'BASIC_ADMIN')) {
      return jsonWithCookies({ error: 'Forbidden: Only admins can approve vendors' }, 403, pendingCookies);
    }

    // Parse request body
    const body = await request.json();
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    const status = typeof body.status === 'string' ? body.status.toUpperCase() : '';

    // Validation
    if (!userId || !status) {
      return jsonWithCookies({ error: 'Missing required fields: userId, status' }, 400, pendingCookies);
    }

    if (status !== 'APPROVED' && status !== 'DECLINED') {
      return jsonWithCookies({ error: 'Invalid status: must be APPROVED or DECLINED' }, 400, pendingCookies);
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        vendorApprovalStatus: true,
      },
    });

    if (!user) {
      return jsonWithCookies({ error: 'User not found' }, 404, pendingCookies);
    }

    if (user.vendorApprovalStatus !== 'PENDING') {
      return jsonWithCookies({ error: 'User is not awaiting vendor approval' }, 400, pendingCookies);
    }

    // Update vendor approval status and role
    // When APPROVED: set role to VENDOR and vendorApprovalStatus to APPROVED
    // When DECLINED: keep role as BUYER and set vendorApprovalStatus to DECLINED
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: status === 'APPROVED' ? 'VENDOR' : 'BUYER',
        vendorApprovalStatus: status,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        vendorApprovalStatus: true,
      },
    });

    if (status === 'APPROVED') {
      await prisma.shop.upsert({
        where: { ownerId: userId },
        create: {
          ownerId: userId,
          name: user.name,
          isVerified: true,
        },
        update: {
          isVerified: true,
        },
      });
    }

    // Vendor approval status is stored in Prisma (source of truth)
    // Supabase metadata is optional - database is the authoritative store

    return jsonWithCookies(
      {
        success: true,
        message: `Vendor ${status.toLowerCase()}`,
        user: updatedUser,
      },
      200,
      pendingCookies
    );
  } catch (error) {
    console.error('POST /api/admin/vendors/approve error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update vendor status';
    return jsonWithCookies({ error: errorMessage }, 500, pendingCookies);
  }
}

