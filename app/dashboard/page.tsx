import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  // In production, this would check the user's actual role from auth
  // For now, we'll show a role selector for testing

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">User Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Welcome Back</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Select your role below to access the appropriate tools and workflows.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/dashboard/seller" className="group glass-card overflow-hidden rounded-[2rem] p-8 shadow-soft transition hover:shadow-md">
          <div className="space-y-4">
            <div className="inline-flex rounded-full bg-clay/10 px-4 py-3">
              <span className="text-3xl">🏪</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Vendor</h2>
            <p className="text-sm leading-6 text-slate-300">
              Create and manage listings, track bookings, view sales reports, and handle EMI applications.
            </p>
            <p className="text-sm font-semibold text-clay group-hover:underline">Access vendor tools →</p>
          </div>
        </Link>

        <Link href="/dashboard/buyer" className="group glass-card overflow-hidden rounded-[2rem] p-8 shadow-soft transition hover:shadow-md">
          <div className="space-y-4">
            <div className="inline-flex rounded-full bg-moss/10 px-4 py-3">
              <span className="text-3xl">🛒</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Buyer</h2>
            <p className="text-sm leading-6 text-slate-300">
              Browse approved listings, request bookings with deposits, apply for EMI, and track your applications.
            </p>
            <p className="text-sm font-semibold text-moss group-hover:underline">Access buyer tools →</p>
          </div>
        </Link>
      </div>
    </main>
  );
}