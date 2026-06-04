import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

function getFeaturedVendorFlag(vendorInfo: unknown): boolean {
  if (!vendorInfo || typeof vendorInfo !== 'object' || Array.isArray(vendorInfo)) {
    return false;
  }

  return Boolean((vendorInfo as Record<string, unknown>).featuredOnHomepage);
}

function getVendorInfo(vendorInfo: unknown) {
  if (!vendorInfo || typeof vendorInfo !== 'object' || Array.isArray(vendorInfo)) {
    return {};
  }

  const record = vendorInfo as Record<string, unknown>;

  return {
    shopName: typeof record.shopName === 'string' ? record.shopName : undefined,
    category: typeof record.category === 'string' ? record.category : undefined,
    locationDivision: typeof record.locationDivision === 'string' ? record.locationDivision : undefined,
    locationAddress: typeof record.locationAddress === 'string' ? record.locationAddress : undefined,
    description: typeof record.description === 'string' ? record.description : undefined,
  };
}

export async function GET() {
  try {
    const vendors = await prisma.user.findMany({
      where: {
        role: 'VENDOR',
        vendorApprovalStatus: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        vendorInfo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const featured = vendors
      .filter((vendor) => getFeaturedVendorFlag(vendor.vendorInfo))
      .map((vendor) => ({
        id: vendor.id,
        name: vendor.name,
        ...getVendorInfo(vendor.vendorInfo),
      }));

    return NextResponse.json(featured);
  } catch (error) {
    console.error('Error fetching featured vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch featured vendors' }, { status: 500 });
  }
}