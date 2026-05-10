import { NextRequest } from 'next/server';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';

export async function POST(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const supabase = createSupabaseRouteClient(request, pendingCookies);
    await supabase.auth.signOut();

    return jsonWithCookies(
      {
        success: true,
        message: 'Signed out successfully',
      },
      200,
      pendingCookies
    );
  } catch (error) {
    console.error('POST /api/auth/logout error:', error);
    return jsonWithCookies({ error: 'Failed to sign out' }, 500, pendingCookies);
  }
}

