import { NextRequest } from 'next/server';
import { verifySupabaseAccessToken } from '@/lib/auth/verify-token';
import { prisma } from '@/lib/db/prisma';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';
import { logAdminAction } from '@/lib/admin-activity';

export async function POST(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const supabase = createSupabaseRouteClient(request, pendingCookies);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    let currentAdminEmail: string | undefined = undefined;
    try {
      const payload = await verifySupabaseAccessToken(session.access_token);
      const adminTier = payload?.app_metadata?.custom_claims?.admin_tier;
      if (adminTier !== 'SUPER_ADMIN') {
        return jsonWithCookies({ error: 'Forbidden: Only SUPER_ADMIN can delete admins' }, 403, pendingCookies);
      }
      currentAdminEmail = payload?.email;
    } catch (err) {
      return jsonWithCookies({ error: 'Unauthorized: invalid token' }, 401, pendingCookies);
    }

    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id.trim() : '';

    if (!id) return jsonWithCookies({ error: 'Missing admin id' }, 400, pendingCookies);

    const existing = await prisma.adminAccount.findUnique({ where: { id } });
    if (!existing) return jsonWithCookies({ error: 'Admin not found' }, 404, pendingCookies);

    await prisma.adminAccount.delete({ where: { id } });

    // Log delete
    await logAdminAction({
      actorEmail: currentAdminEmail ?? null,
      action: 'DELETE',
      entityType: 'AdminAccount',
      entityId: id,
      before: JSON.parse(JSON.stringify(existing)),
      after: null,
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
    });

    return jsonWithCookies({ success: true }, 200, pendingCookies);
  } catch (error) {
    console.error('POST /api/admin/delete-admin error:', error);
    return jsonWithCookies({ error: 'Failed to delete admin' }, 500, pendingCookies);
  }
}
