import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
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

    // Verify admin access
    const decoded = jwtDecode<any>(session.access_token);
    const adminTier = decoded.app_metadata?.custom_claims?.admin_tier;

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

    if (user.role !== 'VENDOR') {
      return jsonWithCookies({ error: 'User is not a vendor' }, 400, pendingCookies);
    }

    // Update vendor approval status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
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

    // Update Supabase user metadata if approved
    if (status === 'APPROVED' && supabaseAdmin) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          app_metadata: {
            custom_claims: {
              role: 'VENDOR',
              vendor_approval_status: 'APPROVED',
            },
          },
        });
      } catch (err) {
        console.error('Failed to update Supabase metadata:', err);
        // Continue anyway - database is the source of truth
      }
    }

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

