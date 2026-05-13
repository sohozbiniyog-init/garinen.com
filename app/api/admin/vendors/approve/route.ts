import { NextRequest, NextResponse } from 'next/server';
import { verifySupabaseAccessToken } from '@/lib/auth/verify-token';
import { prisma } from '@/lib/db/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

async function resolveAuthUserIdByEmail(email: string | null): Promise<string | null> {
  if (!supabaseAdmin || !email) return null;

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error || !data?.users?.length) return null;

  const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return match?.id ?? null;
}

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
      // Idempotent success for repeated approve clicks
      if (status === 'APPROVED' && user.vendorApprovalStatus === 'APPROVED' && user.role === 'VENDOR') {
        return jsonWithCookies(
          {
            success: true,
            message: 'Vendor already approved',
            user,
          },
          200,
          pendingCookies
        );
      }

      return jsonWithCookies({ error: 'User is not awaiting vendor approval' }, 400, pendingCookies);
    }

    // Update vendor approval status and role
    // When APPROVED: set role to VENDOR and vendorApprovalStatus to APPROVED
    // When DECLINED: keep role as BUYER and set vendorApprovalStatus to REJECTED
    const nextApprovalStatus = status === 'APPROVED' ? 'APPROVED' : 'REJECTED';

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: status === 'APPROVED' ? 'VENDOR' : 'BUYER',
        vendorApprovalStatus: nextApprovalStatus,
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
      // Fetch full user data including vendorInfo for profile curation
      const fullUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          vendorInfo: true,
        },
      });

      // Use shopName from vendorInfo if available, otherwise fall back to user name
      const shopName = fullUser?.vendorInfo && typeof fullUser.vendorInfo === 'object'
        ? (fullUser.vendorInfo as any).shopName || user.name
        : user.name;

      await prisma.shop.upsert({
        where: { ownerId: userId },
        create: {
          ownerId: userId,
          name: shopName,
          isVerified: true,
        },
        update: {
          name: shopName,
          isVerified: true,
        },
      });
    }

    // Vendor approval status is stored in Prisma (source of truth)
    // Also update Supabase custom claims so the user's JWT reflects the new
    // role and vendor approval status immediately (avoids needing re-login).
    if (supabaseAdmin) {
      try {
        const claims = {
          role: updatedUser.role,
          vendor_approval_status: updatedUser.vendorApprovalStatus || null,
          admin_tier: null,
          vendor_onboarding_created_at: null,
        };

        // Resolve Supabase auth user ID
        // userId from request is database ID, need to map to Supabase UUID
        let authUserId: string | null = null;
        
        if (isUuid(userId)) {
          // Already a UUID (rare case)
          authUserId = userId;
        } else if (user.email) {
          // userId is database ID; resolve via email
          authUserId = await resolveAuthUserIdByEmail(user.email);
        }

        if (!authUserId) {
          throw new Error(
            `Unable to resolve Supabase auth user ID. Database ID: ${userId}, Email: ${user.email || 'null'}`
          );
        }

        await supabaseAdmin.auth.admin.updateUserById(authUserId, {
          app_metadata: {
            ...{},
            custom_claims: claims,
          },
        });

        // Attempt to invalidate the user's refresh tokens so they must re-auth
        // and receive updated JWT claims. This is best-effort and may not be
        // supported on older supabase-js versions; wrap in try/catch.
        try {
          // @ts-expect-error - method may not exist on all client versions
          if (typeof supabaseAdmin.auth.admin.invalidateUserRefreshTokens === 'function') {
            // Invalidate refresh tokens server-side
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await supabaseAdmin.auth.admin.invalidateUserRefreshTokens(authUserId);
          }
        } catch (err) {
          console.warn('Could not invalidate user refresh tokens:', err);
        }
      } catch (err) {
        console.warn('Failed to update Supabase custom claims for approved vendor:', err);
        // non-fatal: DB is authoritative
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

