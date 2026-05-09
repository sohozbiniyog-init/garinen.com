import { AdminFeaturedPreview } from '@/components/admin-featured-preview';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Admin Console</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Manage the marketplace: review listings, assign roles, monitor bookings, and configure financing options.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <a href="/admin/listings" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-moss/10 px-3 py-2">
              <span className="text-2xl">📋</span>
            </div>
            <h2 className="text-xl font-bold text-ink">Pending Listings</h2>
            <p className="text-sm text-smoke">Review and approve car listings</p>
            <p className="text-xs font-semibold text-moss group-hover:underline">3 awaiting review →</p>
          </div>
        </a>

        <a href="/admin/users" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-clay/10 px-3 py-2">
              <span className="text-2xl">👥</span>
            </div>
            <h2 className="text-xl font-bold text-ink">Users & Roles</h2>
            <p className="text-sm text-smoke">Manage users and assign roles</p>
            <p className="text-xs font-semibold text-clay group-hover:underline">3 pending roles →</p>
          </div>
        </a>

        <a href="/admin/bank-rates" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-sand/10 px-3 py-2">
              <span className="text-2xl">💳</span>
            </div>
            <h2 className="text-xl font-bold text-ink">Bank Rates</h2>
            <p className="text-sm text-smoke">Configure EMI financing options</p>
            <p className="text-xs font-semibold text-sand group-hover:underline">2 banks →</p>
          </div>
        </a>

        <a href="/admin/loan-applications" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-gold/10 px-3 py-2">
              <span className="text-2xl">🏦</span>
            </div>
            <h2 className="text-xl font-bold text-ink">Loan Applications</h2>
            <p className="text-sm text-smoke">Review draft applications and submit after in-person docs</p>
            <p className="text-xs font-semibold text-gold group-hover:underline">View queue →</p>
          </div>
        </a>

        <a href="/admin/offers" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-emerald-500/10 px-3 py-2">
              <span className="text-2xl">🏷️</span>
            </div>
            <h2 className="text-xl font-bold text-ink">Offers</h2>
            <p className="text-sm text-smoke">Create admin offers and review vendor submissions</p>
            <p className="text-xs font-semibold text-emerald-700 group-hover:underline">Manage offers →</p>
          </div>
        </a>

        <a href="/admin/featured-reviews" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-yellow-400/10 px-3 py-2">
              <span className="text-2xl">💬</span>
            </div>
            <h2 className="text-xl font-bold text-ink">Landing Reviews</h2>
            <p className="text-sm text-smoke">Curate homepage testimonials from the admin dashboard</p>
            <p className="text-xs font-semibold text-yellow-600 group-hover:underline">Manage reviews →</p>
          </div>
        </a>

        <a href="/admin/custom-order" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-purple/10 px-3 py-2">
              <span className="text-2xl"></span>
            </div>
            <h2 className="text-xl font-bold text-ink">Custom Orders</h2>
            <p className="text-sm text-smoke">Manage custom car import requests from buyers</p>
            <p className="text-xs font-semibold text-purple group-hover:underline">View requests →</p>
          </div>
        </a>

        <a href="/admin/bookings" className="group glass-card overflow-hidden rounded-[2rem] p-6 shadow-soft transition hover:shadow-md">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-sky-500/10 px-3 py-2">
              <span className="text-2xl">📦</span>
            </div>
            <h2 className="text-xl font-bold text-ink">Bookings & Orders</h2>
            <p className="text-sm text-smoke">View booking requests, test drives, and loan applications</p>
            <p className="text-xs font-semibold text-sky-500 group-hover:underline">Manage orders →</p>
          </div>
        </a>

            <AdminFeaturedPreview />
      </div>
    </main>
  );
}