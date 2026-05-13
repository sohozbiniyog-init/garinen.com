import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { syncUserProfile } from '@/lib/auth/profile';
import { isPendingVendorWithinGracePeriod } from '@/lib/auth/vendor-grace-period';
import {
  createSupabaseRouteClient,
  jsonWithCookies,
  normalizeIdentifier,
  PendingCookie,
} from '@/lib/auth/route-helpers';

type AuthMode = 'signin' | 'signup';

type RateRecord = { count: number; resetAt: number };

const globalForOtpVerifyRateLimit = globalThis as typeof globalThis & {
  otpVerifyRateLimit?: Map<string, RateRecord>;
};

const otpVerifyRateLimit =
  globalForOtpVerifyRateLimit.otpVerifyRateLimit ?? new Map<string, RateRecord>();

if (!globalForOtpVerifyRateLimit.otpVerifyRateLimit) {
  globalForOtpVerifyRateLimit.otpVerifyRateLimit = otpVerifyRateLimit;
}

function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = otpVerifyRateLimit.get(key);

  if (!existing || existing.resetAt <= now) {
    otpVerifyRateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (existing.count >= limit) {
    return true;
  }

  existing.count += 1;
  otpVerifyRateLimit.set(key, existing);
  return false;
}

export async function POST(req: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const body = await req.json();
    const parsed = normalizeIdentifier(typeof body.identifier === 'string' ? body.identifier : '');
    const otp = typeof body.otp === 'string' ? body.otp.trim() : '';
    const mode = (body.mode as AuthMode) || 'signin';

    if (!parsed || !otp) {
      return jsonWithCookies({ error: 'Missing or invalid fields' }, 400, pendingCookies);
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateKey = `otp-verify:${ip}:${parsed.value}`;
    if (isRateLimited(rateKey, 10, 10 * 60 * 1000)) {
      return jsonWithCookies(
        { error: 'Too many verification attempts. Please wait and try again.' },
        429,
        pendingCookies
      );
    }

    const supabase = createSupabaseRouteClient(req, pendingCookies);

    const { data, error } = await supabase.auth.verifyOtp({
      email: parsed.value,
      token: otp,
      type: 'email',
    });

    if (error) {
      return jsonWithCookies({ error: 'Invalid or expired OTP' }, 400, pendingCookies);
    }

    const authUser = data.user;
    if (!authUser) {
      return jsonWithCookies({ error: 'Verification did not return a user' }, 500, pendingCookies);
    }

    const email = authUser.email ?? (parsed.kind === 'email' ? parsed.value : undefined);

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        adminTier: true,
        vendorApprovalStatus: true,
        vendorOnboardingCreatedAt: true,
      },
    });

    const desiredRoleFromMetadata = authUser.user_metadata?.signup_role === 'VENDOR' ? 'VENDOR' : 'BUYER';
    const pendingVendorWithinGracePeriod = isPendingVendorWithinGracePeriod(
      existing?.role ?? existing?.vendorApprovalStatus,
      existing?.vendorOnboardingCreatedAt
    );

    const role = existing?.role === 'ADMIN'
      ? 'ADMIN'
      : pendingVendorWithinGracePeriod
        ? 'PENDING_VENDOR'
        : existing?.vendorApprovalStatus === 'APPROVED'
          ? existing?.role ?? 'BUYER'
          : mode === 'signup'
            ? desiredRoleFromMetadata
            : 'BUYER';

    const vendorApprovalStatus = pendingVendorWithinGracePeriod
      ? 'PENDING'
      : existing?.vendorApprovalStatus === 'APPROVED'
        ? 'APPROVED'
        : undefined;

    const profile = await syncUserProfile({
      email,
      name:
        existing?.name ||
        (authUser.user_metadata?.full_name as string | undefined) ||
        email ||
        'User',
      role,
      adminTier: existing?.adminTier ?? undefined,
      vendorApprovalStatus,
      vendorOnboardingCreatedAt: pendingVendorWithinGracePeriod ? existing?.vendorOnboardingCreatedAt ?? undefined : undefined,
    });

    // Set Supabase Custom Claims for JWT-based role propagation
    // This allows middleware to read roles from the JWT without DB access
    if (supabaseAdmin && authUser) {
      const claims = {
        role: profile.role,
        admin_tier: profile.adminTier || null,
        vendor_approval_status: profile.vendorApprovalStatus || null,
        vendor_onboarding_created_at: profile.vendorOnboardingCreatedAt
          ? profile.vendorOnboardingCreatedAt.toISOString()
          : null,
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

    let redirectTo = '/dashboard';
    if (profile.role === 'ADMIN') {
      redirectTo = '/admin';
    } else if (isPendingVendorWithinGracePeriod(profile.role ?? profile.vendorApprovalStatus, profile.vendorOnboardingCreatedAt)) {
      redirectTo = '/vendor/onboarding';
    } else if (profile.role === 'VENDOR') {
      redirectTo = '/dashboard/seller';
    } else {
      redirectTo = '/dashboard/buyer';
    }

    return jsonWithCookies({
      success: true,
      redirectTo,
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
      },
    }, 200, pendingCookies);
  } catch (err) {
    console.error('verify-otp error', err);
    return jsonWithCookies({ error: 'Failed to verify OTP' }, 500, pendingCookies);
  }
}

