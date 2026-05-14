import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdminCredentials } from '@/lib/auth/admin-db';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';

type AdminLoginResponse = {
  success: boolean;
  redirectTo: string;
  admin?: {
    id: string;
    email: string;
    name: string;
    tier: 'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN';
  };
  session?: {
    accessToken: string;
    expiresAt: number | null;
  } | null;
  error?: string;
};

export async function POST(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];
  const traceId = request.headers.get('x-trace-id') || crypto.randomUUID();

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      return jsonWithCookies({ error: 'Supabase is not configured' }, 500, pendingCookies);
    }

    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    console.info('admin-login-request', {
      traceId,
      email,
      hasPassword: Boolean(password),
    });

    if (!email || !password) {
      return jsonWithCookies({ error: 'Email and password are required' }, 400, pendingCookies);
    }

    const verifiedAdmin = await verifyAdminCredentials(email, password);
    if (!verifiedAdmin) {
      console.warn('admin-login-failed', {
        traceId,
        email,
        reason: 'invalid-credentials',
      });
      return jsonWithCookies({ error: 'Invalid admin credentials' }, 401, pendingCookies);
    }

    const supabase = createSupabaseRouteClient(request, pendingCookies);

    let session = null;
    let authUser = null;

    const signInResult = await supabase.auth.signInWithPassword({
      email: verifiedAdmin.email,
      password,
    });

    if (!signInResult.error) {
      session = signInResult.data.session ?? null;
      authUser = signInResult.data.user ?? null;
    } else if (supabaseAdmin) {
      await supabaseAdmin.auth.admin.createUser({
        email: verifiedAdmin.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: verifiedAdmin.name,
          admin_tier: verifiedAdmin.tier,
        },
      }).catch((createError) => {
        const message = createError instanceof Error ? createError.message : '';
        if (!message.toLowerCase().includes('already registered')) {
          throw createError;
        }
      });

      const retryResult = await supabase.auth.signInWithPassword({
        email: verifiedAdmin.email,
        password,
      });

      if (retryResult.error) {
        console.error('admin-login-supabase-error', {
          traceId,
          email: verifiedAdmin.email,
          error: retryResult.error.message,
        });
        return jsonWithCookies({ error: retryResult.error.message }, 400, pendingCookies);
      }

      session = retryResult.data.session ?? null;
      authUser = retryResult.data.user ?? null;
    } else {
      console.error('admin-login-supabase-error', {
        traceId,
        email: verifiedAdmin.email,
        error: signInResult.error.message,
      });
      return jsonWithCookies({ error: signInResult.error.message }, 400, pendingCookies);
    }

    if (!authUser) {
      return jsonWithCookies({ error: 'Authentication did not return a user' }, 500, pendingCookies);
    }

    await prisma.adminAccount.update({
      where: { email: verifiedAdmin.email },
      data: { supabaseAuthId: authUser.id },
    }).catch((err) => {
      console.warn('admin-login-link-failed', {
        traceId,
        email: verifiedAdmin.email,
        error: err,
      });
    });

    if (supabaseAdmin) {
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        app_metadata: {
          ...(authUser.app_metadata ?? {}),
          custom_claims: {
            role: 'ADMIN',
            admin_tier: verifiedAdmin.tier,
            vendor_approval_status: null,
          },
        },
      }).catch((err) => {
        console.warn('admin-login-custom-claims-failed', {
          traceId,
          email: verifiedAdmin.email,
          error: err,
        });
      });
    }

    console.info('admin-login-success', {
      traceId,
      email: verifiedAdmin.email,
      tier: verifiedAdmin.tier,
      adminId: verifiedAdmin.id,
      supabaseUserId: authUser.id,
    });

    const responseBody: AdminLoginResponse = {
      success: true,
      redirectTo: '/admin',
      admin: {
        id: verifiedAdmin.id,
        email: verifiedAdmin.email,
        name: verifiedAdmin.name,
        tier: verifiedAdmin.tier,
      },
      session: session
        ? {
            accessToken: session.access_token,
            expiresAt: session.expires_at ?? null,
          }
        : null,
    };

    return jsonWithCookies(responseBody as Record<string, unknown>, 200, pendingCookies);
  } catch (error) {
    console.error('POST /api/auth/admin-login error:', {
      traceId,
      error,
    });
    return jsonWithCookies({ error: 'Failed to authenticate' }, 500, pendingCookies);
  }
}