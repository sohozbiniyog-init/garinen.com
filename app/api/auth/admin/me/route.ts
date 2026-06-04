import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteClient, type PendingCookie, jsonWithCookies } from '@/lib/auth/route-helpers';
import { getCustomClaimsFromSupabaseJwt } from '@/lib/auth/jwt-claims';

export async function GET(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const supabase = createSupabaseRouteClient(request, pendingCookies);
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      return jsonWithCookies({ user: null, claims: null }, 200, pendingCookies);
    }

    const sessionData = await supabase.auth.getSession();
    const token = sessionData.data.session?.access_token;

    if (!token) {
      return jsonWithCookies({ user: null, claims: null }, 200, pendingCookies);
    }

    const claims = await getCustomClaimsFromSupabaseJwt(token);

    if (claims.role !== 'ADMIN') {
      return jsonWithCookies({ user: null, claims: null }, 200, pendingCookies);
    }

    return jsonWithCookies(
      {
        user,
        claims: {
          role: claims.role,
          admin_tier: claims.admin_tier,
        },
      },
      200,
      pendingCookies
    );
  } catch (error) {
    console.error('GET /api/auth/admin/me error:', error);
    return NextResponse.json({ error: 'Failed to get admin auth info' }, { status: 500 });
  }
}
