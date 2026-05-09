import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { prisma } from '@/lib/prisma';

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
  const email = !error ? data.user?.email ?? null : null;

  const session = email
    ? await prisma.user.findUnique({
        where: { email },
        select: {
          role: true,
        },
      })
    : null;

  const redirectTo = (path: string) => {
    const redirectResponse = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  };

  const userRole = session?.role;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!userRole || userRole !== 'ADMIN') {
      return redirectTo('/login');
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