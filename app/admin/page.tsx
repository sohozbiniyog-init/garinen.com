import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
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

  if (!token) {
    redirect('/login');
  }

  const decoded = jwtDecode<any>(token);
  const claims = decoded.app_metadata?.custom_claims;
  const userRole = claims?.role as string | undefined;
  const adminTier = claims?.admin_tier as string | undefined;

  if (userRole !== 'ADMIN') {
    redirect(userRole === 'VENDOR' ? '/dashboard/seller' : '/dashboard/buyer');
  }

  const allowedCards = [
    {
      title: 'Vendor Approvals',
      description: 'Review pending vendor applications and approve or reject them.',
      href: '/admin/vendors',
      allowed: true,
    },
    {
      title: 'Admin Management',
      description: 'Create and manage admin accounts and assign admin tiers.',
      href: '/admin/admins',
      allowed: adminTier === 'SUPER_ADMIN',
    },
    {
      title: 'Users & Roles',
      description: 'Review users, promote vendors, and manage access levels.',
      href: '/admin/users',
      allowed: adminTier === 'SUPER_ADMIN',
    },
    {
      title: 'Listings',
      description: 'Moderate public listings and keep marketplace inventory current.',
      href: '/admin/listings',
      allowed: true,
    },
    {
      title: 'Bookings',
      description: 'Inspect booking activity and coordinate follow-ups.',
      href: '/admin/bookings',
      allowed: true,
    },
    {
      title: 'Loan Applications',
      description: 'Review and manage financing requests from the marketplace.',
      href: '/admin/loan-applications',
      allowed: true,
    },
  ].filter((card) => card.allowed);

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Admin Hub</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-white">Admin dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              Use this hub to reach every admin workspace. Super admins get the full management set,
              while other admin tiers keep access to the operations they are allowed to handle.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
            {adminTier ? adminTier.replace('_', ' ') : 'ADMIN'}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {allowedCards.map((card) => (
          <Link
            key={card.href}
            href={card.href as any}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Workspace</p>
            <h2 className="mt-3 text-xl font-semibold text-white transition group-hover:text-rose-200">
              {card.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{card.description}</p>
            <p className="mt-6 text-sm font-medium text-rose-300">Open section</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
