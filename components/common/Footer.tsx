import Link from 'next/link';
import { MapPin, Mail } from 'lucide-react';

function normalizeUsername(value: string | undefined) {
  return value?.trim().replace(/^@+/, '') || '';
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.8 6.2c-1.2-.8-2-2-2.2-3.5h-3.3v14.2c0 1.5-1.2 2.8-2.8 2.8s-2.8-1.2-2.8-2.8 1.2-2.8 2.8-2.8c.3 0 .6 0 .8.1V11c-.3 0-.6-.1-.9-.1A5.6 5.6 0 0 0 4.8 16.5C4.8 19.6 7.4 22 10.5 22s5.7-2.5 5.7-5.5v-5.5a8 8 0 0 0 4.3 1.3V8.9a5.8 5.8 0 0 1-1.7-.2Z" />
    </svg>
  );
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, '') || '8801616449801';
  const tiktokUsername = normalizeUsername(process.env.NEXT_PUBLIC_TIKTOK_USERNAME);
  const youtubeUsername = normalizeUsername(process.env.NEXT_PUBLIC_YOUTUBE_USERNAME);
  const tiktokHref = tiktokUsername ? `https://www.tiktok.com/@${tiktokUsername}` : '/contact?topic=social';
  const youtubeHref = youtubeUsername ? `https://www.youtube.com/@${youtubeUsername}` : '/contact?topic=social';

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
                Bangladesh&apos;s 1st On-demand Automotive Marketplace with 360° solutions.
              </p>

              <div className="mt-8 space-y-5">

                <a
                  href="https://www.google.com/maps/search/?api=1&query=house+no-8,road+19,nikunja+2,dhaka+1229"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-brand-red/20 hover:bg-white/[0.04]"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/10 text-brand-red transition group-hover:bg-brand-red group-hover:text-white">
                    <MapPin size={18} />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-brand-red">Office</span>
                    <span className="mt-1 block text-sm text-slate-300">house no-8,road 19,nikunja 2,Dhaka 1229,Dhaka</span>
                  </span>
                </a>

                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-brand-red/20 hover:bg-white/[0.04]"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/10 text-brand-red transition group-hover:bg-brand-red group-hover:text-white">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.52 3.48A11.88 11.88 0 0 0 12 0C5.373 0 0 5.373 0 12c0 2.112.553 4.176 1.603 6.014L0 24l6.246-1.612A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12 0-1.99-.492-3.86-1.48-5.52zM12 21.5c-1.8 0-3.55-.48-5.07-1.39l-.36-.21-3.71.96.99-3.62-.23-.37A9.34 9.34 0 0 1 2 12C2 6.48 6.48 2 12 2c2.5 0 4.86.82 6.76 2.33C20.18 6.24 21 8.5 21 11c0 5.52-4.48 10.5-9 10.5z" />
                      <path d="M17.3 14.1c-.3-.1-1.7-.9-1.9-1-.2-.1-.4-.1-.6.1-.2.2-.7.9-.8 1.1-.1.2-.2.3-.5.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6.1-.1.3-.3.5-.5.2-.2.3-.3.5-.5.2-.2.1-.4 0-.6-.1-.2-.6-1.4-.9-1.9-.2-.4-.5-.3-.6-.3-.2 0-.4 0-.6 0-.2 0-.6.1-.9.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.1 3 .1.2 1.8 3 4.4 4.3 3 1.5 3.1.9 3.6.8.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.3z" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-brand-red">WhatsApp</span>
                    <span className="mt-1 block text-sm text-slate-300">+{whatsappNumber}</span>
                  </span>
                </a>

                <a
                  href="mailto:contact@garinen.com"
                  className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-brand-red/20 hover:bg-white/[0.04]"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/10 text-brand-red transition group-hover:bg-brand-red group-hover:text-white">
                    <Mail size={18} />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-brand-red">Email</span>
                    <span className="mt-1 block text-sm text-slate-300">contact@garinen.com</span>
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

              <Link href="/listings?location=Dhaka" className="text-sm text-slate-300 transition hover:text-white">
                By Location
              </Link>
            </nav>
          </div>
       
          {/*
          Vendors
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
          */}
        
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

          <div className="md:justify-self-start md:self-start">
            <h3 className="mb-6 text-xs font-black uppercase tracking-[0.28em] text-brand-red">
              Social links
            </h3>

            <div className="flex flex-col items-start gap-3 text-left">
              <a
                href="/contact?topic=social"
                className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 22v-8.3h2.8l.4-3.2h-3.2V8.3c0-.9.2-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.3H7.5v3.2h2.6V22h3.4Z" />
                </svg>
                <span>Facebook</span>
              </a>

              <a
                href="/contact?topic=social"
                className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6A5.2 5.2 0 0 1 16.8 22H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2A3.2 3.2 0 0 0 4 7.2v9.6A3.2 3.2 0 0 0 7.2 20h9.6a3.2 3.2 0 0 0 3.2-3.2V7.2A3.2 3.2 0 0 0 16.8 4H7.2Zm4.8 2.5A5.5 5.5 0 1 1 6.5 12 5.5 5.5 0 0 1 12 6.5Zm0 2A3.5 3.5 0 1 0 15.5 12 3.5 3.5 0 0 0 12 8.5Zm5.6-2.7a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2Z" />
                </svg>
                <span>Instagram</span>
              </a>

              <a
                href={tiktokHref}
                target={tiktokUsername ? '_blank' : undefined}
                rel={tiktokUsername ? 'noreferrer' : undefined}
                className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                aria-label={tiktokUsername ? `TikTok @${tiktokUsername}` : 'TikTok'}
              >
                <TikTokIcon className="h-5 w-5" />
                <span>{tiktokUsername ? `@${tiktokUsername}` : 'TikTok'}</span>
              </a>

              <a
                href={youtubeHref}
                target={youtubeUsername ? '_blank' : undefined}
                rel={youtubeUsername ? 'noreferrer' : undefined}
                className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                aria-label={youtubeUsername ? `YouTube @${youtubeUsername}` : 'YouTube'}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21.8 8.2s-.2-1.5-.8-2.2c-.8-.9-1.8-.9-2.2-1C15.9 4.8 12 4.8 12 4.8h0s-3.9 0-6.8.2c-.4.1-1.4.1-2.2 1-.6.7-.8 2.2-.8 2.2S2 9.9 2 11.6v1.8c0 1.8.2 3.4.2 3.4s.2 1.5.8 2.2c.8.9 1.8.9 2.2 1 2.9.2 6.8.2 6.8.2s3.9 0 6.8-.2c.4-.1 1.4-.1 2.2-1 .6-.7.8-2.2.8-2.2s.2-1.6.2-3.4v-1.8c0-1.7-.2-3.4-.2-3.4ZM10 14.6V9.4l5.2 2.6L10 14.6Z" />
                </svg>
                <span>{youtubeUsername ? `@${youtubeUsername}` : 'YouTube'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
          <p className="text-xs text-slate-500 absolute bottom-3 center align-middle w-full text-center">
            © {currentYear} GariNen. All rights reserved. Built in Bangladesh.
          </p>
        
      </footer>
  );
}
