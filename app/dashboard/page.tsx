import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Read-only in server component.
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect('/login');
  }

  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (token) {
    const decoded = jwtDecode<any>(token);
    const claims = decoded.app_metadata?.custom_claims;
    const userRole = claims?.role as string | undefined;
    const adminTier = claims?.admin_tier as string | undefined;

    if (userRole === 'ADMIN') {
      redirect('/admin');
    }

    if (userRole === 'VENDOR') {
      redirect('/dashboard/seller');
    }

    if (userRole === 'BUYER') {
      redirect('/dashboard/buyer');
    }
  }

  redirect('/login');
}
