import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySupabaseAccessToken } from '@/lib/auth/verify-token';

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
    try {
      const payload = await verifySupabaseAccessToken(token);
      const claims = payload?.app_metadata?.custom_claims;
      const userRole = claims?.role as string | undefined;

      if (userRole === 'ADMIN') return redirect('/admin');
      if (userRole === 'VENDOR') return redirect('/dashboard/seller');
      if (userRole === 'BUYER') return redirect('/dashboard/buyer');
    } catch (err) {
      // verification failed - fall through to login
      console.warn('Token verification failed in dashboard page:', err);
    }
  }

  redirect('/login');
}
