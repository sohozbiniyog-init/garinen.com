import { NextRequest, NextResponse } from 'next/server';
import {
  createSupabaseRouteClient,
  jsonWithCookies,
  normalizeIdentifier,
  PendingCookie,
} from '@/lib/auth-route-helpers';

type AuthMode = 'signin' | 'signup';

type RateRecord = { count: number; resetAt: number };

const globalForOtpRateLimit = globalThis as typeof globalThis & {
  otpRequestRateLimit?: Map<string, RateRecord>;
};

const otpRequestRateLimit =
  globalForOtpRateLimit.otpRequestRateLimit ?? new Map<string, RateRecord>();

if (!globalForOtpRateLimit.otpRequestRateLimit) {
  globalForOtpRateLimit.otpRequestRateLimit = otpRequestRateLimit;
}

function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = otpRequestRateLimit.get(key);

  if (!existing || existing.resetAt <= now) {
    otpRequestRateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (existing.count >= limit) {
    return true;
  }

  existing.count += 1;
  otpRequestRateLimit.set(key, existing);
  return false;
}

export async function POST(req: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const body = await req.json();
    const mode = body.mode as AuthMode;
    const parsed = normalizeIdentifier(typeof body.identifier === 'string' ? body.identifier : '');
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const isVendor = Boolean(body.isVendor);
    const captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken : undefined;

    if (!mode || (mode !== 'signin' && mode !== 'signup')) {
      return jsonWithCookies({ error: 'Invalid auth mode' }, 400, pendingCookies);
    }

    if (!parsed) {
      return jsonWithCookies({ error: 'Enter a valid email address' }, 400, pendingCookies);
    }

    if (mode === 'signup' && !name) {
      return jsonWithCookies({ error: 'Name is required for sign up' }, 400, pendingCookies);
    }

    if (mode === 'signup' && !phone) {
      return jsonWithCookies({ error: 'Phone number is required for sign up' }, 400, pendingCookies);
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateKey = `otp-request:${ip}:${parsed.value}`;
    if (isRateLimited(rateKey, 5, 10 * 60 * 1000)) {
      return jsonWithCookies(
        { error: 'Too many OTP requests. Please wait and try again.' },
        429,
        pendingCookies
      );
    }

    const supabase = createSupabaseRouteClient(req, pendingCookies);

    const metadata = mode === 'signup'
      ? {
          full_name: name,
          phone,
          signup_role: isVendor ? 'VENDOR' : 'BUYER',
        }
      : undefined;

    const authResult = await supabase.auth.signInWithOtp({
      email: parsed.value,
      options: {
        shouldCreateUser: mode === 'signup',
        emailRedirectTo: `${req.nextUrl.origin}/auth/callback`,
        data: metadata,
        captchaToken,
      },
    });

    if (authResult.error) {
      if (mode === 'signin') {
        return jsonWithCookies(
          {
            otpSent: true,
            identifier: parsed.value,
            message: 'If an account exists, an OTP has been sent.',
          },
          200,
          pendingCookies
        );
      }

      return jsonWithCookies({ error: authResult.error.message }, 400, pendingCookies);
    }

    return jsonWithCookies(
      {
        otpSent: true,
        identifier: parsed.value,
        message: 'OTP sent successfully.',
      },
      200,
      pendingCookies
    );
  } catch (err) {
    console.error('request-otp error', err);
    return jsonWithCookies({ error: 'Failed to request OTP' }, 500, pendingCookies);
  }
}
