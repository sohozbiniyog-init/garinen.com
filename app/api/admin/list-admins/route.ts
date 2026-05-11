import { NextRequest, NextResponse } from 'next/server';
import { verifySupabaseAccessToken } from '@/lib/auth/verify-token';
import { prisma } from '@/lib/db/prisma';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';

export async function GET(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const supabase = createSupabaseRouteClient(request, pendingCookies);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    let adminTier: string | null = null;
    try {
      const payload = await verifySupabaseAccessToken(session.access_token);
      adminTier = payload?.app_metadata?.custom_claims?.admin_tier || null;
    } catch (err) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    // Only SUPER_ADMIN and VENDOR_ADMIN can list admins
    if (adminTier !== 'SUPER_ADMIN' && adminTier !== 'VENDOR_ADMIN') {
      return jsonWithCookies({ error: 'Forbidden' }, 403, pendingCookies);
    }

    // Fetch all admin accounts
    const admins = await prisma.adminAccount.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        tier: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return jsonWithCookies(
      {
        success: true,
        admins,
      },
      200,
      pendingCookies
    );
  } catch (error) {
    console.error('GET /api/admin/list-admins error:', error);
    return jsonWithCookies({ error: 'Failed to list admin accounts' }, 500, pendingCookies);
  }
}

