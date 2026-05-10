import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function BuyerDashboardPage() {
  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Buyer Console</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Browse listings, request bookings, apply for EMI, and track your applications.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/listings" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-moss/10 px-3 py-2">
              <span className="text-2xl">📋</span>
            </div>
            <h2 className="text-xl font-bold text-ink">Browse Listings</h2>
            <p className="text-sm text-smoke">View approved cars for sale</p>
            <p className="text-xs font-semibold text-moss group-hover:underline">Browse →</p>
          </div>
        </Link>
        
          <Link href="/dashboard/buyer/loan-apply" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
            <div className="space-y-3">
              <div className="inline-flex rounded-full bg-gold/10 px-3 py-2">
                <span className="text-2xl">🏦</span>
              </div>
              <h2 className="text-xl font-bold text-ink">Apply for Car Loan</h2>
              <p className="text-sm text-smoke">Create a draft loan application and prefill it from a car page or your budget.</p>
              <p className="text-xs font-semibold text-gold group-hover:underline">Start application →</p>
            </div>
          </Link>

        <a href="/dashboard/buyer/bookings" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-clay/10 px-3 py-2">
              <span className="text-2xl">📲</span>
            </div>
            <h2 className="text-xl font-bold text-ink">My Bookings</h2>
            <p className="text-sm text-smoke">Track booking requests and deposits</p>
            <p className="text-xs font-semibold text-clay group-hover:underline">View →</p>
          </div>
        </a>

        <div className="glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft opacity-50">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-sand px-3 py-2">
              <span className="text-2xl">💰</span>
            </div>
            <h2 className="text-xl font-bold text-ink">EMI Applications</h2>
            <p className="text-sm text-smoke">Apply for financing on bookings</p>
            <p className="text-xs font-semibold text-smoke">Coming</p>
          </div>
        </div>

        <div className="glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft opacity-50">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-smoke/10 px-3 py-2">
              <span className="text-2xl">❤️</span>
            </div>
            <h2 className="text-xl font-bold text-ink">Wishlist</h2>
            <p className="text-sm text-smoke">Save favorite cars</p>
            <p className="text-xs font-semibold text-smoke">Coming</p>
          </div>
        </div>
      </div>
    </main>
  );
}

