import { NextRequest, NextResponse } from 'next/server';
import {
  createSupabaseRouteClient,
  jsonWithCookies,
  PendingCookie,
  redirectWithCookies,
} from '@/lib/auth/route-helpers';

export async function GET(req: NextRequest) {
  const pendingCookies: PendingCookie[] = [];
  let supabase;

  try {
    supabase = createSupabaseRouteClient(req, pendingCookies);
  } catch {
    return jsonWithCookies({ error: 'Supabase not configured' }, 500, pendingCookies);
  }

  const redirectToParam = req.nextUrl.searchParams.get('redirectTo');
  const redirectTo =
    redirectToParam && redirectToParam.startsWith('/') ? redirectToParam : '/dashboard';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${req.nextUrl.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error) {
    return jsonWithCookies({ error: error.message }, 500, pendingCookies);
  }

  return redirectWithCookies(data.url, pendingCookies);
}

