import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/10 bg-[#06070b] text-slate-300">

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-20%] h-[400px] w-[400px] rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute right-[-10%] bottom-[-20%] h-[400px] w-[400px] rounded-full bg-red-500/5 blur-3xl" />
      </div>

      {/* Subtle Grid Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="glass-panel relative mx-auto w-full max-w-7xl overflow-hidden border-x border-white/5 border-b-0 bg-gradient-to-b from-white/[0.02] to-transparent px-6 py-16 lg:px-10">

        <div className="relative grid gap-12 md:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-16">

          {/* LEFT PANEL */}
          <div className="relative overflow-hidden pr-10 md:pr-16">

            {/* ANGLED CRISSCROSS DIVIDER */}
            <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-24 md:block">

              {/* Main angled structure */}
              <div className="absolute inset-0 origin-center skew-x-[-18deg] border-x border-red-500/30 bg-gradient-to-b from-red-500/5 via-transparent to-red-500/5 backdrop-blur-sm" />

              {/* Central neon line */}
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-red-500/40 blur-[1px]" />

              {/* Top angled accent */}
              <div className="absolute left-[-10%] top-[8%] h-[1px] w-[140%] rotate-[18deg] bg-red-500/70 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />

              {/* Bottom angled accent */}
              <div className="absolute bottom-[8%] left-[-10%] h-[1px] w-[140%] rotate-[-18deg] bg-red-500/70 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />

              {/* Extra glow */}
              <div className="absolute inset-0 bg-red-500/5 blur-2xl" />
            </div>

            {/* Brand & Info */}
            <div className="relative z-10">
              <div className="mb-8">
                <img src="/images/GariNen_Final.svg" alt="GariNen" className="h-50 w-auto" />
              </div>

              <p className="max-w-sm text-sm leading-relaxed text-slate-400">
                Bangladesh&apos;s premium automotive marketplace.
                Connecting buyers and vendors with trust, quality, and service.
              </p>

              <div className="mt-8 space-y-5">

                <a
                  href="https://www.google.com/maps/search/?api=1&query=ABM+Tower,+113%2FA,+Gulshan+Avenue,+Dhaka-1212"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-brand-red/20 hover:bg-white/[0.04]"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/10 text-brand-red transition group-hover:bg-brand-red group-hover:text-white">
                    <MapPin size={18} />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-brand-red">Office</span>
                    <span className="mt-1 block text-sm text-slate-300">ABM Tower, 113/A, Gulshan Avenue, Dhaka-1212</span>
                  </span>
                </a>

                <a
                  href="https://wa.me/8801616449801"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-brand-red/20 hover:bg-white/[0.04]"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/10 text-brand-red transition group-hover:bg-brand-red group-hover:text-white">
                    <Phone size={18} />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-brand-red">WhatsApp</span>
                    <span className="mt-1 block text-sm text-slate-300">+880 1616-449801</span>
                  </span>
                </a>

                <a
                  href="mailto:info@ghuriautomobiles.com"
                  className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-brand-red/20 hover:bg-white/[0.04]"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/10 text-brand-red transition group-hover:bg-brand-red group-hover:text-white">
                    <Mail size={18} />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-brand-red">Email</span>
                    <span className="mt-1 block text-sm text-slate-300">info@ghuriautomobiles.com</span>
                  </span>
                </a>

              </div>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h3 className="mb-6 text-xs font-black uppercase tracking-[0.28em] text-brand-red">
              Browse
            </h3>

            <nav className="flex flex-col gap-3">
              <Link href="/listings" className="text-sm text-slate-300 transition hover:text-white">
                All Cars
              </Link>

              <Link href="/listings" className="text-sm text-slate-300 transition hover:text-white">
                New Cars
              </Link>

              <Link href="/listings?condition=used" className="text-sm text-slate-300 transition hover:text-white">
                Used Cars
              </Link>

              <Link href="/listings?condition=reconditioned" className="text-sm text-slate-300 transition hover:text-white">
                Reconditioned
              </Link>

              <Link href="/listings" className="text-sm text-slate-300 transition hover:text-white">
                By Brand
              </Link>

              <a href="/listings?location=Dhaka" className="text-sm text-slate-300 transition hover:text-white">
                By Location
              </a>
            </nav>
          </div>

          {/* Vendors */}
          <div>
            <h3 className="mb-6 text-xs font-black uppercase tracking-[0.28em] text-brand-red">
              Vendors
            </h3>

            <nav className="flex flex-col gap-3">
              <Link href="/register" className="text-sm text-slate-300 transition hover:text-white">
                List a Car
              </Link>

              <Link href="/dashboard/seller" className="text-sm text-slate-300 transition hover:text-white">
                Vendor Dashboard
              </Link>

              <Link href="/contact?topic=pricing" className="text-sm text-slate-300 transition hover:text-white">
                Pricing Plans
              </Link>

              <Link href="/contact?topic=kyc" className="text-sm text-slate-300 transition hover:text-white">
                KYC Verification
              </Link>

              <Link href="/contact?topic=boost" className="text-sm text-slate-300 transition hover:text-white">
                Boost Listings
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-6 text-xs font-black uppercase tracking-[0.28em] text-brand-red">
              Company
            </h3>

            <nav className="flex flex-col gap-3">
              <Link href="/about" className="text-sm text-slate-300 transition hover:text-white">
                About Us
              </Link>

              <Link href="/contact" className="text-sm text-slate-300 transition hover:text-white">
                Contact
              </Link>

              <a href="/contact#privacy" className="text-sm text-slate-300 transition hover:text-white">
                Privacy Policy
              </a>

              <a href="/contact#terms" className="text-sm text-slate-300 transition hover:text-white">
                Terms of Service
              </a>

              <a href="/contact#careers" className="text-sm text-slate-300 transition hover:text-white">
                Careers
              </a>
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 border-t border-white/10" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

          <p className="text-xs text-slate-500">
            © {currentYear} GariNen. All rights reserved. Built in Bangladesh.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-6">

            <Link
              href="/contact?topic=social"
              className="text-slate-500 transition hover:text-brand-red hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
              title="Contact us"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13.5 22v-8.3h2.8l.4-3.2h-3.2V8.3c0-.9.2-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.3H7.5v3.2h2.6V22h3.4Z" />
              </svg>
            </Link>

            <Link href="/contact?topic=social" className="text-slate-500 transition hover:text-brand-red hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" title="Contact us">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6.94 19H4V9.5h2.94V19ZM5.47 8.2C4.53 8.2 4 7.55 4 6.74 4 5.9 4.55 5.3 5.53 5.3s1.47.6 1.48 1.44c0 .81-.52 1.46-1.54 1.46ZM20 19h-2.95v-5.2c0-1.2-.42-2-1.47-2-.8 0-1.27.54-1.48 1.06-.08.2-.1.47-.1.74V19H11.1s.04-8.8 0-9.5h2.9v1.35c.38-.58 1.05-1.4 2.56-1.4 1.87 0 3.27 1.22 3.27 3.83V19Z" />
              </svg>
            </Link>

            <Link href="/contact?topic=social" className="text-slate-500 transition hover:text-brand-red hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" title="Contact us">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6A5.2 5.2 0 0 1 16.8 22H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2A3.2 3.2 0 0 0 4 7.2v9.6A3.2 3.2 0 0 0 7.2 20h9.6a3.2 3.2 0 0 0 3.2-3.2V7.2A3.2 3.2 0 0 0 16.8 4H7.2Zm4.8 2.5A5.5 5.5 0 1 1 6.5 12 5.5 5.5 0 0 1 12 6.5Zm0 2A3.5 3.5 0 1 0 15.5 12 3.5 3.5 0 0 0 12 8.5Zm5.6-2.7a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2Z" />
              </svg>
            </Link>

          </div>
        </div>
      </div>
    </footer>
  );
}