import { NextRequest } from 'next/server';
import { verifySupabaseAccessToken } from '@/lib/auth/verify-token';
import { prisma } from '@/lib/db/prisma';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';
import { logAdminAction } from '@/lib/admin-activity';

export async function PATCH(request: NextRequest) {
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
        return jsonWithCookies({ error: 'Forbidden: Only SUPER_ADMIN can update admins' }, 403, pendingCookies);
      }
      currentAdminEmail = payload?.email;
    } catch (err) {
      return jsonWithCookies({ error: 'Unauthorized: invalid token' }, 401, pendingCookies);
    }

    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : undefined;
    const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;
    const tier = typeof body.tier === 'string' ? body.tier : undefined;

    if (!id) return jsonWithCookies({ error: 'Missing admin id' }, 400, pendingCookies);

    const existing = await prisma.adminAccount.findUnique({ where: { id } });
    if (!existing) return jsonWithCookies({ error: 'Admin not found' }, 404, pendingCookies);

    const before = existing;

    const updated = await prisma.adminAccount.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(tier ? { tier } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        tier: true,
        updatedAt: true,
      },
    });

    // Log update
    await logAdminAction({
      actorEmail: currentAdminEmail ?? null,
      action: 'UPDATE',
      entityType: 'AdminAccount',
      entityId: id,
      before: JSON.parse(JSON.stringify(before)),
      after: JSON.parse(JSON.stringify(updated)),
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
    });

    return jsonWithCookies({ success: true, admin: updated }, 200, pendingCookies);
  } catch (error) {
    console.error('PATCH /api/admin/update-admin error:', error);
    return jsonWithCookies({ error: 'Failed to update admin' }, 500, pendingCookies);
  }
}
