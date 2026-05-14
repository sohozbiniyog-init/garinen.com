import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { syncUserProfile } from '@/lib/auth/profile';
import { normalizeBangladeshPhone } from '@/lib/auth/phone';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';
import type { Role } from '@prisma/client';
import { isPendingVendorWithinGracePeriod, isVendorGracePeriodExpired } from '@/lib/auth/vendor-grace-period';

type AuthMode = 'signin' | 'signup';

export async function POST(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];
  const traceId = request.headers.get('x-trace-id') || crypto.randomUUID();

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

    console.info('auth-password-request', {
      traceId,
      mode,
      isVendor,
      email,
      hasPassword: Boolean(password),
    });

    if (!email || !mode || (mode === 'signin' && !password)) {
      return jsonWithCookies({ error: 'Missing required fields' }, 400, pendingCookies);
    }

    // Validate password is provided for signup
    if (mode === 'signup' && !password) {
      return jsonWithCookies({ error: 'Password is required for sign up' }, 400, pendingCookies);
    }

    const normalizedPhone = phone ? normalizeBangladeshPhone(phone) : null;
    if (phone && !normalizedPhone) {
      return jsonWithCookies({ error: 'Invalid numbers' }, 400, pendingCookies);
    }

    const supabase = createSupabaseRouteClient(request, pendingCookies);

    const existingAdminAccount = await prisma.adminAccount.findUnique({
      where: { email },
      select: { id: true },
    });

    if (mode === 'signin' && existingAdminAccount) {
      return jsonWithCookies(
        { error: 'Admin accounts must sign in at /admin/login' },
        403,
        pendingCookies
      );
    }

    const authEmail = email;

    // Password-based signup (no OTP or email confirmation in the normal prod path)
    const authResult =
      mode === 'signup' && supabaseAdmin
        ? await (async () => {
            await supabaseAdmin.auth.admin.createUser({
              email: authEmail,
              password,
              email_confirm: true,
              user_metadata: {
                full_name: name,
                phone: phone || undefined,
                is_vendor: isVendor,
              },
            }).catch((createError) => {
              const message = createError instanceof Error ? createError.message : '';
              if (!message.toLowerCase().includes('already registered')) {
                throw createError;
              }
            });

            return supabase.auth.signInWithPassword({
              email: authEmail,
              password,
            });
          })()
        : mode === 'signup'
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
      console.error('auth-password-auth-result-error', {
        traceId,
        mode,
        email,
        isVendor,
        error: authResult.error.message,
      });
      return jsonWithCookies({ error: authResult.error.message }, 400, pendingCookies);
    }

    const authUser = authResult.data.user ?? null;
    const session = authResult.data.session ?? null;

    if (!authUser) {
      console.error('auth-password-missing-user', {
        traceId,
        mode,
        email,
        isVendor,
      });
      return jsonWithCookies({ error: 'Authentication did not return a user' }, 500, pendingCookies);
    }

    const currentProfile = await prisma.user.findUnique({
      where: { email: authUser.email ?? authEmail },
      select: {
        role: true,
        adminTier: true,
        vendorApprovalStatus: true,
        vendorOnboardingCreatedAt: true,
      },
    });

    const pendingVendorWithinGracePeriod = isPendingVendorWithinGracePeriod(
      // helper accepts either vendorApprovalStatus ('PENDING') or role ('PENDING_VENDOR')
      currentProfile?.role ?? currentProfile?.vendorApprovalStatus,
      currentProfile?.vendorOnboardingCreatedAt
    );

    if (
      mode === 'signin' &&
      currentProfile?.vendorApprovalStatus === 'PENDING' &&
      !pendingVendorWithinGracePeriod &&
      currentProfile?.vendorOnboardingCreatedAt
    ) {
      console.info('vendor-grace-period-expired', {
        traceId,
        email: authUser.email ?? authEmail,
        gracePeriodStarted: currentProfile.vendorOnboardingCreatedAt,
      });
    }

    const isApprovedVendor = currentProfile?.role === 'VENDOR' && currentProfile?.vendorApprovalStatus === 'APPROVED';

    let inferredRole: Role;
    if (mode === 'signup' && isVendor) {
      inferredRole = 'PENDING_VENDOR';
    } else if (mode === 'signin' && pendingVendorWithinGracePeriod) {
      inferredRole = 'PENDING_VENDOR';
    } else if (isApprovedVendor) {
      inferredRole = 'VENDOR';
    } else {
      inferredRole = 'BUYER';
    }

    const vendorApprovalStatus = mode === 'signup' && isVendor
      ? 'PENDING'
      : mode === 'signin' && pendingVendorWithinGracePeriod
        ? 'PENDING'
        : isApprovedVendor
          ? currentProfile?.vendorApprovalStatus ?? undefined
          : undefined;

    const vendorOnboardingCreatedAt = mode === 'signup' && isVendor
      ? new Date()
      : currentProfile?.vendorOnboardingCreatedAt ?? undefined;

    const profilePhone = normalizedPhone || (authUser.user_metadata?.phone as string | undefined);

    const existingProfile = await syncUserProfile({
      email: authUser.email ?? authEmail,
      name: name || authUser.user_metadata?.full_name || authUser.email || authEmail,
      phone: profilePhone,
      role: inferredRole,
      adminTier: currentProfile?.adminTier ?? undefined,
      vendorApprovalStatus,
      vendorOnboardingCreatedAt,
    });

    console.info('auth-password-profile-synced', {
      traceId,
      mode,
      email: existingProfile.email,
      role: existingProfile.role,
      vendorApprovalStatus: existingProfile.vendorApprovalStatus,
      isVendor,
    });

    // Set Supabase Custom Claims for JWT-based role propagation
    // This allows middleware to read roles from the JWT without DB access
    if (supabaseAdmin && authUser) {
      const claims = {
        role: inferredRole,
        admin_tier: existingProfile.adminTier || null,
        vendor_approval_status: existingProfile.vendorApprovalStatus || null,
        vendor_onboarding_created_at: existingProfile.vendorOnboardingCreatedAt
          ? existingProfile.vendorOnboardingCreatedAt.toISOString()
          : null,
      };

      await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        app_metadata: {
          ...authUser.app_metadata,
          custom_claims: claims,
        },
      }).catch((err) => {
        console.warn('auth-password-custom-claims-failed', {
          traceId,
          mode,
          email: existingProfile.email,
          error: err,
        });
        // Non-fatal: proceed without custom claims
      });
    }

    let redirectTo: string;

    if (mode === 'signup') {
        redirectTo = isVendor ? '/vendor/onboarding' : '/dashboard/buyer';
      } else if (
        existingProfile.vendorApprovalStatus === 'PENDING' &&
        existingProfile.vendorOnboardingCreatedAt &&
        !isVendorGracePeriodExpired(existingProfile.vendorOnboardingCreatedAt)
      ) {
        redirectTo = '/vendor/onboarding';
    } else if (existingProfile.role === 'VENDOR' && existingProfile.vendorApprovalStatus === 'APPROVED') {
      redirectTo = '/dashboard/seller';
    } else {
      redirectTo = '/dashboard/buyer';
    }

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
    console.error('POST /api/auth/password error:', {
      traceId,
      error,
    });
    return jsonWithCookies({ error: 'Failed to authenticate' }, 500, pendingCookies);
  }
}
