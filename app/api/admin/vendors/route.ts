import { NextRequest, NextResponse } from 'next/server';
import { verifySupabaseAccessToken } from '@/lib/auth/verify-token';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';

export async function GET(req: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    // Verify admin session via JWT
    const supabase = createSupabaseRouteClient(req, pendingCookies);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin tier (verify token signature)
    let adminTier: string | null = null;
    try {
      const payload = await verifySupabaseAccessToken(session.access_token);
      adminTier = payload?.app_metadata?.custom_claims?.admin_tier || null;
    } catch (err) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!adminTier || (adminTier !== 'SUPER_ADMIN' && adminTier !== 'VENDOR_ADMIN' && adminTier !== 'BASIC_ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden: Must be SUPER_ADMIN or VENDOR_ADMIN' },
        { status: 403 }
      );
    }

    // VENDOR_ADMIN: fetch PENDING vendors only (optimized)
    // SUPER_ADMIN: fetch all vendors
    const whereClause: Prisma.UserWhereInput = adminTier === 'SUPER_ADMIN'
      ? { role: 'VENDOR' }
      : { role: 'VENDOR', vendorApprovalStatus: 'PENDING' };

    // Fetch pending vendors
    const vendors = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        vendorInfo: true,
        vendorApprovalStatus: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({
      vendors: vendors.map((v) => ({
        ...v,
        vendorInfo: v.vendorInfo || {},
      })),
    });
  } catch (err) {
    console.error('GET /api/admin/vendors error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

