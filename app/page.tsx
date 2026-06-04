import FeaturedCarousel from '@/components/listings/FeaturedCarousel';
import EmiCalculator from '@/components/landing/EMICalculator';
import { SiteHeader } from '@/components/common/Header';
import NewCarsCarousel from '@/components/landing/NewCarsCarousel';
import HeroSearchForm from '@/components/landing/HeroSearch';
import { CustomerTestimonials } from '@/components/landing/Testimonials';
import { FeaturedVendors } from '@/components/landing/FeaturedVendors';
import { OffersShowcase, PublicOffer } from '@/components/landing/Offers';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const highlights = [
  'Public car marketplace',
  'Admin-controlled vendor access',
  'bKash deposit flow',
  'EMI application tracking'
];

const steps = [
  'Browse approved listings',
  'Request booking with deposit',
  'Apply for EMI with documents',
  'Admin reviews and approves'
];

// Minimal carousel items for landing page. In production the admin panel will provide uploads and targets.
const carouselItems = [
  { id: 'c1', price: 2500000, image: '/images/carousel/toyota.png', redirectTo: '/listings?brand=Toyota' },
  { id: 'c2', price: 2300000, image: '/images/carousel/honda.png', redirectTo: '/listings?brand=Honda' },
  { id: 'c3', price: 2100000, image: '/images/carousel/hyundai.png', redirectTo: '/listings?brand=Hyundai' },
  { id: 'c4', price: 2400000, image: '/images/carousel/nissan.png', redirectTo: '/listings?brand=Nissan' },
  { id: 'c5', price: 4500000, image: '/images/carousel/bmw.png', redirectTo: '/listings?brand=BMW' },
  { id: 'c6', price: 5200000, image: '/images/carousel/mercedes-benz.png', redirectTo: '/listings?brand=Mercedes-Benz' }
];

async function getApprovedOffers(): Promise<PublicOffer[]> {
  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    if (!host) {
      return [];
    }

    const response = await fetch(`${protocol}://${host}/api/offers?status=APPROVED`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return [];
    }

    const offers = (await response.json()) as Array<{
      id: string;
      vendorName: string;
      title: string;
      subtitle?: string | null;
      description: string;
      discountLabel: string;
      ctaLabel: string;
      ctaHref: string;
      imageUrl?: string | null;
    }>;

    return offers.map((offer) => ({
      id: offer.id,
      vendorName: offer.vendorName,
      title: offer.title,
      subtitle: offer.subtitle,
      description: offer.description,
      discountLabel: offer.discountLabel,
      ctaLabel: offer.ctaLabel,
      ctaHref: offer.ctaHref,
      imageUrl: offer.imageUrl
    }));
  } catch {
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const code = typeof params.code === 'string' ? params.code : null;
  const redirectTo = typeof params.redirectTo === 'string' ? params.redirectTo : '/dashboard/buyer';

  if (code) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const offers = await getApprovedOffers();

  return (
    <main className="min-h-screen w-full px-6 py-8 lg:px-10">
      <SiteHeader />

      <section className="glass-shell relative h-[620px] overflow-hidden rounded-[2.5rem] bg-transparent lg:h-[680px]">
        <div className="absolute inset-0">
          <NewCarsCarousel cars={carouselItems} />
        </div>
        <div className="bg-hero-overlay absolute inset-0 z-10" />

        <div className="absolute inset-0 z-20 flex items-center justify-start px-6 lg:px-12">
          <div className="pointer-events-auto w-full max-w-md">
            <HeroSearchForm />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold text-white">Featured Cars</h2>
        <FeaturedCarousel />
      </section>

      <FeaturedVendors />

      <OffersShowcase offers={offers} />
      <section className="mt-16">
        <CustomerTestimonials />
      </section>
    </main>
  );
}
