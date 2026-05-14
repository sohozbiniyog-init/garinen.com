import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/db/prisma';
import { createServerClient } from '@supabase/ssr';

export interface AuthSession {
  userId: string;
  email: string;
  userRole: 'BUYER' | 'VENDOR' | 'ADMIN';
  // Optional admin tier when the session belongs to an admin
  adminTier?: 'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN' | null;
  shopId?: string;
}

/**
 * Extract the current user session from a request.
 * Checks Authorization header for JWT token and verifies with Supabase.
 */
export async function getSessionFromRequest(req: NextRequest): Promise<AuthSession | null> {
  try {
    const authHeader = req.headers.get('authorization');
    let email: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);

      if (!supabase) {
        return null;
      }

      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) {
        return null;
      }

      email = data.user.email ?? null;
    } else if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      const cookieSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
          cookies: {
            getAll() {
              return req.cookies.getAll();
            },
            setAll() {
              // Route-level session refresh is not required here.
            },
          },
        }
      );

      const { data, error } = await cookieSupabase.auth.getUser();
      if (error || !data.user) {
        return null;
      }

      email = data.user.email ?? null;
    }

    if (!email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        ownedShop: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return null;
    }

    let adminTier: 'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN' | null = null;
    try {
      if (user.role === 'ADMIN') {
        const admin = await prisma.adminAccount.findUnique({ where: { email: user.email }, select: { tier: true } });
        adminTier = admin?.tier ?? null;
      }
    } catch (err) {
      // Non-fatal: return session without adminTier
      adminTier = null;
    }

    return {
      userId: user.id,
      email: user.email,
      userRole: user.role as 'BUYER' | 'VENDOR' | 'ADMIN',
      adminTier,
      shopId: user.ownedShop?.id,
    };
  } catch (error) {
    console.error('Failed to get session from request:', error);
    return null;
  }
}

/**
 * Get session from cookies (for server components or middleware).
 * Useful when working with client-side session cookies.
 */
export async function getSessionFromCookie(req: NextRequest): Promise<AuthSession | null> {
  try {
    // This is a placeholder for cookie-based auth
    // In a real app, you'd check cookies for session tokens
    const sessionCookie = req.cookies.get('auth-session')?.value;
    if (!sessionCookie) {
      return null;
    }

    // Parse and validate the session cookie
    // For now, just return null to indicate cookie validation failed
    return null;
  } catch (error) {
    console.error('Failed to get session from cookie:', error);
    return null;
  }
}
