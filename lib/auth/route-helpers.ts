import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export type PendingCookie = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type IdentifierKind = 'email';

export function normalizeIdentifier(input: string): { kind: IdentifierKind; value: string } | null {
  const raw = input.trim();
  if (!raw) {
    return null;
  }

  if (raw.includes('@')) {
    const email = raw.toLowerCase();
    return EMAIL_RE.test(email) ? { kind: 'email', value: email } : null;
  }

  return null;
}

function secureCookieOptions(options?: Record<string, unknown>): Record<string, unknown> {
  const isProd = process.env.NODE_ENV === 'production';
  const merged = {
    ...(options ?? {}),
  } as Record<string, unknown>;

  if (merged.sameSite == null) {
    merged.sameSite = 'lax';
  }
  if (merged.httpOnly == null) {
    merged.httpOnly = true;
  }
  if (merged.secure == null) {
    merged.secure = isProd;
  }
  if (merged.path == null) {
    merged.path = '/';
  }

  return merged;
}

export function createSupabaseRouteClient(request: NextRequest, pendingCookies: PendingCookie[]) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Supabase is not configured');
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            pendingCookies.push({
              name,
              value,
              options: secureCookieOptions((options ?? {}) as Record<string, unknown>),
            });
          });
        },
      },
    }
  );
}

export function jsonWithCookies(
  body: Record<string, unknown>,
  status: number,
  pendingCookies: PendingCookie[]
) {
  const response = NextResponse.json(body, { status });
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as any);
  });
  return response;
}

export function redirectWithCookies(url: string, pendingCookies: PendingCookie[]) {
  const response = NextResponse.redirect(url);
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as any);
  });
  return response;
}
