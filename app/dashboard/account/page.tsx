import Link from 'next/link';

export default function AccountPage() {
  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-soft backdrop-blur-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-gray">Account</p>
        <h1 className="mt-3 text-3xl font-bold text-brand-black">Account settings moved</h1>
        <p className="mt-3 text-sm leading-7 text-brand-gray">
          Profile editing and password changes now live in your buyer dashboard to keep everything in one place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard/buyer" className="rounded-lg bg-moss px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95">
            Go to buyer dashboard
          </Link>
          <Link href="/dashboard/buyer#account-settings" className="rounded-lg border border-black/10 px-5 py-3 text-sm font-semibold text-brand-black transition hover:bg-black/5">
            Open account settings
          </Link>
        </div>
      </section>
    </main>
  );
}
