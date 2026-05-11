import Link from 'next/link';
import type { Route } from 'next';

export const dynamic = 'force-dynamic';

export default function SellerDashboardPage() {
  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Vendor Console</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Manage shop details, listings, and bookings from a plain vendor workspace.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {([
          { href: '/dashboard/seller/listings', title: 'My Listings', description: 'Create and manage listings.' },
          { href: '/dashboard/seller/shop', title: 'Shop Profile', description: 'Update shop details and KYC.' },
          { href: '/dashboard/seller/bookings', title: 'Bookings', description: 'Track booking requests and deposits.' },
          { href: '/dashboard/seller/offers', title: 'Offers', description: 'Submit promotional offers for review.' },
        ] as const).map((item) => (
          <Link
            key={item.href}
            href={item.href as Route}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:border-white/20 hover:bg-white/10"
          >
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-1 text-sm text-slate-300">{item.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

