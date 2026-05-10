import { ListingDetail } from '@/components/listings/Detail';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findFirst({
    where: { id, status: 'APPROVED' },
    include: {
      shop: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  return (
    <ListingDetail
      id={listing.id}
      title={listing.title}
      brand={listing.brand}
      model={listing.model}
      year={listing.year}
      price={listing.price.toString()}
      mileage={listing.mileage ? listing.mileage.toString() : '0'}
      location={listing.location}
      shopName={listing.shop.name}
      imageUrls={toStringArray(listing.imageUrls)}
      videoUrls={toStringArray(listing.videoUrls)}
    />
  );
}
