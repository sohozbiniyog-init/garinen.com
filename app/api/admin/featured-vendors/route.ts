import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';
import { verifySupabaseAccessToken } from '@/lib/auth/verify-token';

type VendorFeatureRecord = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  createdAt: string;
  featuredOnHomepage: boolean;
  vendorInfo: {
    shopName?: string;
    category?: string;
    locationDivision?: string;
    locationAddress?: string;
    description?: string;
  };
};

function getFeaturedVendorFlag(vendorInfo: unknown): boolean {
  if (!vendorInfo || typeof vendorInfo !== 'object' || Array.isArray(vendorInfo)) {
    return false;
  }

  return Boolean((vendorInfo as Record<string, unknown>).featuredOnHomepage);
}

function getVendorInfo(vendorInfo: unknown): VendorFeatureRecord['vendorInfo'] {
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

async function verifyAdmin(request: NextRequest, pendingCookies: PendingCookie[]) {
  const supabase = createSupabaseRouteClient(request, pendingCookies);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return null;
  }

  try {
    const payload = await verifySupabaseAccessToken(session.access_token);
    const adminTier = payload?.app_metadata?.custom_claims?.admin_tier || null;
    if (!adminTier || (adminTier !== 'SUPER_ADMIN' && adminTier !== 'VENDOR_ADMIN' && adminTier !== 'BASIC_ADMIN')) {
      return null;
    }

    return { session, adminTier };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const auth = await verifyAdmin(request, pendingCookies);
    if (!auth) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    const vendors = await prisma.user.findMany({
      where: {
        role: 'VENDOR',
        vendorApprovalStatus: 'APPROVED',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        vendorInfo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return jsonWithCookies(
      {
        vendors: vendors.map((vendor) => ({
          id: vendor.id,
          email: vendor.email,
          name: vendor.name,
          phone: vendor.phone,
          createdAt: vendor.createdAt.toISOString(),
          featuredOnHomepage: getFeaturedVendorFlag(vendor.vendorInfo),
          vendorInfo: getVendorInfo(vendor.vendorInfo),
        })),
      },
      200,
      pendingCookies
    );
  } catch (error) {
    console.error('GET /api/admin/featured-vendors error:', error);
    return jsonWithCookies({ error: 'Failed to fetch featured vendors' }, 500, pendingCookies);
  }
}

export async function PATCH(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const auth = await verifyAdmin(request, pendingCookies);
    if (!auth) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const featuredOnHomepage = typeof body.featuredOnHomepage === 'boolean' ? body.featuredOnHomepage : null;

    if (!id || featuredOnHomepage === null) {
      return jsonWithCookies({ error: 'Missing required fields: id, featuredOnHomepage' }, 400, pendingCookies);
    }

    const vendor = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        vendorApprovalStatus: true,
        vendorInfo: true,
      },
    });

    if (!vendor) {
      return jsonWithCookies({ error: 'Vendor not found' }, 404, pendingCookies);
    }

    if (vendor.role !== 'VENDOR' || vendor.vendorApprovalStatus !== 'APPROVED') {
      return jsonWithCookies({ error: 'Only approved vendors can be featured' }, 400, pendingCookies);
    }

    const currentInfo = vendor.vendorInfo && typeof vendor.vendorInfo === 'object' && !Array.isArray(vendor.vendorInfo)
      ? (vendor.vendorInfo as Record<string, unknown>)
      : {};

    const updatedVendor = await prisma.user.update({
      where: { id },
      data: {
        vendorInfo: {
          ...currentInfo,
          featuredOnHomepage,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        vendorInfo: true,
      },
    });

    return jsonWithCookies(
      {
        vendor: {
          id: updatedVendor.id,
          email: updatedVendor.email,
          name: updatedVendor.name,
          phone: updatedVendor.phone,
          createdAt: updatedVendor.createdAt.toISOString(),
          featuredOnHomepage: getFeaturedVendorFlag(updatedVendor.vendorInfo),
          vendorInfo: getVendorInfo(updatedVendor.vendorInfo),
        },
      },
      200,
      pendingCookies
    );
  } catch (error) {
    console.error('PATCH /api/admin/featured-vendors error:', error);
    return jsonWithCookies({ error: 'Failed to update featured vendor' }, 500, pendingCookies);
  }
}