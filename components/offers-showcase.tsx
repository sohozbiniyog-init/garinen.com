import Link from 'next/link';

export type PublicOffer = {
  id: string;
  vendorName: string;
  title: string;
  subtitle?: string | null;
  description: string;
  discountLabel: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl?: string | null;
};

const fallbackOffers: PublicOffer[] = [
  {
    id: 'fallback-1',
    vendorName: 'Elite Motors',
    title: 'Zero-cost booking on selected sedans',
    subtitle: 'Limited-time deal',
    description: 'Reserve a verified sedan with reduced deposit requirements and faster admin approval for in-stock vehicles.',
    discountLabel: 'Save up to 10% on booking',
    ctaLabel: 'Explore listings',
    ctaHref: '/listings?bodyType=Sedan'
  },
  {
    id: 'fallback-2',
    vendorName: 'City Auto Sales',
    title: 'Lower EMI rates with partner banks',
    subtitle: 'Finance spotlight',
    description: 'Compare bank offers directly from the homepage and move into the EMI flow without extra steps.',
    discountLabel: 'From 11% interest',
    ctaLabel: 'Open EMI tools',
    ctaHref: '/emi-tools'
  }
];

export function OffersShowcase({ offers = [] }: { offers?: PublicOffer[] }) {
  const items = offers.length > 0 ? offers : fallbackOffers;

  return (
    <section className="mt-16">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Fresh from vendors</p>
          <h2 className="mt-3 text-3xl font-bold text-white">Available Offers</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
            current deals & exclusive offers curated for you.
          </p>
        </div>
        <Link href="/custom-order" className="text-sm font-semibold text-brand-red transition hover:text-white hover:underline">
          Submit a custom request →
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {items.map((offer) => (
          <article key={offer.id} className="glass-card group overflow-hidden rounded-[2rem] p-6 text-slate-900 shadow-soft transition hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700">
                    {offer.vendorName}
                  </span>
                  <span className="rounded-full border border-brand-red/20 bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red-deep">
                    {offer.discountLabel}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-950">{offer.title}</h3>
                  {offer.subtitle ? <p className="mt-2 text-sm uppercase tracking-[0.15em] text-slate-500">{offer.subtitle}</p> : null}
                </div>
                <p className="max-w-xl text-sm leading-7 text-slate-700">{offer.description}</p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <Link
                  href={offer.ctaHref as any}
                  className="inline-flex items-center justify-center rounded-full bg-brand-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-deep"
                >
                  {offer.ctaLabel}
                </Link>
                <div className="h-10 w-10 rounded-full border border-slate-200 bg-white/60" aria-hidden="true" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}