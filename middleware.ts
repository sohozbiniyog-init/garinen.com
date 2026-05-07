import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth-helpers';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the current session
  const session = await getSessionFromRequest(request);

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!session || session.userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Buyers can access /dashboard/buyer
    if (pathname.startsWith('/dashboard/buyer') && session.userRole !== 'BUYER') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Vendors can access /dashboard/seller
    if (pathname.startsWith('/dashboard/seller') && session.userRole !== 'VENDOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect vendor onboarding/submitted routes
  if (pathname.startsWith('/vendor/onboarding') || pathname.startsWith('/vendor/submitted')) {
    if (!session || session.userRole !== 'VENDOR') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/vendor/:path*'],
};