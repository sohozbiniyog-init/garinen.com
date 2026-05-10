import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { jwtDecode } from 'jwt-decode';

/**
 * Edge-safe middleware for route protection
 * Uses JWT claims instead of Prisma for role-based routing
 * No database queries in middleware (Edge-compatible)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  const user = !error ? data.user : null;

  /**
   * Extract role from JWT claims
   * This avoids database queries in Edge runtime
   */
  let userRole: string | null = null;
  let adminTier: string | null = null;
  let vendorApprovalStatus: string | null = null;

  if (user) {
    try {
      // Get the session to access the JWT
      const sessionData = await supabase.auth.getSession();
      if (sessionData.data.session?.access_token) {
        const decoded = jwtDecode<any>(sessionData.data.session.access_token);
        const customClaims = decoded.app_metadata?.custom_claims;
        
        if (customClaims) {
          userRole = customClaims.role || null;
          adminTier = customClaims.admin_tier || null;
          vendorApprovalStatus = customClaims.vendor_approval_status || null;
        }
      }
    } catch (err) {
      console.warn('Failed to decode JWT claims:', err);
    }
  }

  const redirectTo = (path: string) => {
    const redirectResponse = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  };

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!userRole || userRole !== 'ADMIN') {
      return redirectTo('/login');
    }
    
    // Specific tier-based route protection
    // Only SUPER_ADMIN can create admins
    if (pathname.startsWith('/admin/admins') && adminTier !== 'SUPER_ADMIN') {
      return redirectTo('/admin/vendors');
    }
    
    // Only SUPER_ADMIN can manage users
    if (pathname.startsWith('/admin/users') && adminTier !== 'SUPER_ADMIN') {
      return redirectTo('/admin/vendors');
    }
    
    // VENDOR_ADMIN and SUPER_ADMIN can access vendors
    if (pathname.startsWith('/admin/vendors')) {
      if (adminTier !== 'SUPER_ADMIN' && adminTier !== 'VENDOR_ADMIN' && adminTier !== 'BASIC_ADMIN') {
        return redirectTo('/admin');
      }
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!userRole) {
      return redirectTo('/login');
    }

    // Buyers can access /dashboard/buyer
    if (pathname.startsWith('/dashboard/buyer') && userRole !== 'BUYER') {
      return redirectTo('/dashboard');
    }

    // Vendors can access /dashboard/seller
    if (pathname.startsWith('/dashboard/seller') && userRole !== 'VENDOR') {
      return redirectTo('/dashboard');
    }
  }

  // Protect vendor onboarding/submitted routes
  if (pathname.startsWith('/vendor/onboarding') || pathname.startsWith('/vendor/submitted')) {
    if (!userRole || userRole !== 'VENDOR') {
      return redirectTo('/login');
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/vendor/:path*'],
};