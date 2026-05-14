import { NextRequest } from 'next/server';
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

    if (adminTier !== 'SUPER_ADMIN' && adminTier !== 'VENDOR_ADMIN') {
      return jsonWithCookies({ error: 'Forbidden' }, 403, pendingCookies);
    }

    const params = new URL(request.url).searchParams;
    const limit = Math.min(Number(params.get('limit') || '100'), 1000);
    const cursor = params.get('cursor') || undefined;

    const logs = await prisma.auditLog.findMany({
      take: limit,
      where: {},
      orderBy: { createdAt: 'desc' },
    });

    return jsonWithCookies({ success: true, logs }, 200, pendingCookies);
  } catch (error) {
    console.error('GET /api/admin/admin-actions error:', error);
    return jsonWithCookies({ error: 'Failed to fetch admin actions' }, 500, pendingCookies);
  }
}
