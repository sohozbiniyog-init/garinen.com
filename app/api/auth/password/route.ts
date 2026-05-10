import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdminCredentials } from '@/lib/auth/admin-db';
import { syncUserProfile } from '@/lib/auth/profile';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';

type AuthMode = 'signin' | 'signup';

export async function POST(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      return jsonWithCookies({ error: 'Supabase is not configured' }, 500, pendingCookies);
    }

    const body = await request.json();
    const mode = body.mode as AuthMode;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const isVendor = Boolean(body.isVendor);

    if (!email || !mode || (mode === 'signin' && !password)) {
      return jsonWithCookies({ error: 'Missing required fields' }, 400, pendingCookies);
    }

    // Validate password is provided for signup
    if (mode === 'signup' && !password) {
      return jsonWithCookies({ error: 'Password is required for sign up' }, 400, pendingCookies);
    }

    const supabase = createSupabaseRouteClient(request, pendingCookies);

    let authEmail = email;
    let adminBootstrap: { tier: 'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN'; name: string; email: string; phone?: string } | null = null;

    if (mode === 'signin' && password) {
      // Verify admin credentials against the database
      const verifiedAdmin = await verifyAdminCredentials(email, password);
      if (verifiedAdmin) {
        adminBootstrap = {
          tier: verifiedAdmin.tier,
          name: verifiedAdmin.name,
          email: verifiedAdmin.email
        };
        authEmail = verifiedAdmin.email;

        if (supabaseAdmin) {
          // Ensure admin user exists in Supabase Auth
          await supabaseAdmin.auth.admin.createUser({
            email: verifiedAdmin.email,
            password,
            email_confirm: true,
            user_metadata: { 
              full_name: verifiedAdmin.name,
              admin_tier: verifiedAdmin.tier
            },
          }).catch(() => null);
        }
      }
    }

    // Password-based signup (no OTP)
    const authResult =
      mode === 'signup'
        ? await supabase.auth.signUp({
            email: authEmail,
            password: password,
            options: {
              data: {
                full_name: name,
                phone: phone || undefined,
              },
            },
          })
        : await supabase.auth.signInWithPassword({
            email: authEmail,
            password,
          });

    if (authResult.error) {
      return jsonWithCookies({ error: authResult.error.message }, 400, pendingCookies);
    }

    const authUser = authResult.data.user ?? null;
    const session = authResult.data.session ?? null;

    if (!authUser) {
      return jsonWithCookies({ error: 'Authentication did not return a user' }, 500, pendingCookies);
    }

    const currentProfile = await prisma.user.findUnique({
      where: { email: authUser.email ?? authEmail },
      select: {
        role: true,
        adminTier: true,
        vendorApprovalStatus: true,
      },
    });

    const inferredRole = adminBootstrap
      ? 'ADMIN'
      : 'BUYER'; // All new users start as BUYER, vendor approval is separate
    
    // Determine vendor approval status
    const vendorApprovalStatus = adminBootstrap
      ? currentProfile?.vendorApprovalStatus ?? undefined
      : mode === 'signup' && isVendor
        ? 'PENDING' // Vendor signups stay PENDING until admin approves
        : currentProfile?.vendorApprovalStatus ?? undefined;

    const existingProfile = await syncUserProfile({
      email: authUser.email ?? authEmail,
      name: adminBootstrap?.name || name || authUser.user_metadata?.full_name || authUser.email || authEmail,
      phone: adminBootstrap?.phone || phone || (authUser.user_metadata?.phone as string | undefined),
      role: inferredRole,
      adminTier: adminBootstrap?.tier ?? currentProfile?.adminTier ?? undefined,
      vendorApprovalStatus
    });

    // Set Supabase Custom Claims for JWT-based role propagation
    // This allows middleware to read roles from the JWT without DB access
    if (supabaseAdmin && authUser) {
      const claims = {
        role: inferredRole,
        admin_tier: existingProfile.adminTier || null,
        vendor_approval_status: existingProfile.vendorApprovalStatus || null,
      };

      await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        app_metadata: {
          ...authUser.app_metadata,
          custom_claims: claims,
        },
      }).catch((err) => {
        console.warn('Failed to set custom claims:', err);
        // Non-fatal: proceed without custom claims
      });
    }

    const redirectTo =
      mode === 'signup'
        ? '/login' // After signup, redirect to login for user confirmation
        : adminBootstrap || existingProfile.role === 'ADMIN'
          ? '/admin'
          : existingProfile.role === 'VENDOR'
            ? existingProfile.vendorApprovalStatus === 'PENDING'
              ? '/vendor/onboarding'
              : '/dashboard/seller'
            : '/dashboard/buyer';

    // Password signup doesn't require verification
    return jsonWithCookies(
      {
        success: true,
        redirectTo,
        user: existingProfile,
        session: mode === 'signin' && session ? {
          accessToken: session.access_token,
          expiresAt: session.expires_at,
        } : null,
      },
      200,
      pendingCookies
    );
  } catch (error) {
    console.error('POST /api/auth/password error:', error);
    return jsonWithCookies({ error: 'Failed to authenticate' }, 500, pendingCookies);
  }
}
