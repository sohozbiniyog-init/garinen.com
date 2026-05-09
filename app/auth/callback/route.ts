import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { syncUserProfile } from '@/lib/auth-profile';
import {
  createSupabaseRouteClient,
  PendingCookie,
  redirectWithCookies,
} from '@/lib/auth-route-helpers';

export async function GET(req: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.redirect(`${req.nextUrl.origin}/login?error=supabase_not_configured`);
  }

  const supabase = createSupabaseRouteClient(req, pendingCookies);

  const code = req.nextUrl.searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${req.nextUrl.origin}/login?error=oauth_failed`);
    }
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) {
    return NextResponse.redirect(`${req.nextUrl.origin}/login?error=oauth_failed`);
  }

  const existing = await prisma.user.findUnique({ where: { email: data.user.email } });
  await syncUserProfile({
    email: data.user.email,
    name: existing?.name || data.user.user_metadata?.full_name || data.user.email,
    phone: (data.user.user_metadata?.phone as string | undefined) || existing?.phone || undefined,
    role: existing?.role || 'BUYER',
    adminTier: existing?.adminTier ?? undefined,
    vendorApprovalStatus: existing?.vendorApprovalStatus ?? undefined,
  });

  const redirectToParam = req.nextUrl.searchParams.get('redirectTo');
  const redirectTo = redirectToParam && redirectToParam.startsWith('/') ? redirectToParam : '/dashboard';
  return redirectWithCookies(`${req.nextUrl.origin}${redirectTo}`, pendingCookies);
}