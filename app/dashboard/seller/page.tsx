import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SellerDashboardPage() {
  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Vendor Console</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Manage your shop, list cars, and track bookings and EMI applications.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/seller/listings" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-moss/10 px-3 py-2">
              <span className="text-2xl">📋</span>
            </div>
            <h2 className="text-xl font-bold text-ink">My Listings</h2>
            <p className="text-sm text-smoke">Create and manage car listings</p>
            <p className="text-xs font-semibold text-moss group-hover:underline">Manage →</p>
          </div>
        </Link>

        <Link href="/dashboard/seller/shop" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-clay/10 px-3 py-2">
              <span className="text-2xl">🏪</span>
            </div>
            <h2 className="text-xl font-bold text-ink">Shop Profile</h2>
            <p className="text-sm text-smoke">Update shop details and KYC</p>
            <p className="text-xs font-semibold text-clay group-hover:underline">View →</p>
          </div>
        </Link>

        <a href="/dashboard/seller/bookings" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-sand/10 px-3 py-2">
              <span className="text-2xl">📲</span>
            </div>
            <h2 className="text-xl font-bold text-ink">Bookings</h2>
            <p className="text-sm text-smoke">Track booking requests and deposits</p>
            <p className="text-xs font-semibold text-sand group-hover:underline">Manage →</p>
          </div>
        </a>

        <a href="/dashboard/seller/offers" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-emerald-500/10 px-3 py-2">
              <span className="text-2xl">🏷️</span>
            </div>
            <h2 className="text-xl font-bold text-ink">Offers</h2>
            <p className="text-sm text-smoke">Submit promotional offers for admin review</p>
            <p className="text-xs font-semibold text-emerald-700 group-hover:underline">Submit →</p>
          </div>
        </a>

        <div className="glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft opacity-50">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-smoke/10 px-3 py-2">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-xl font-bold text-ink">Reports</h2>
            <p className="text-sm text-smoke">View sales and performance data</p>
            <p className="text-xs font-semibold text-smoke">Coming</p>
          </div>
        </div>
      </div>
    </main>
  );
}
