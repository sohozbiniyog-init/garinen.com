import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';
import { prisma } from '@/lib/db/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';


async function getDbVendorUser(email: string | null | undefined) {
  if (!email) return null;

  return prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, vendorApprovalStatus: true, vendorInfo: true },
  });
}

function getVendorShopName(vendorInfo: unknown): string {
  if (!vendorInfo || typeof vendorInfo !== 'object' || Array.isArray(vendorInfo)) {
    return 'Shop';
  }

  const shopName = (vendorInfo as Record<string, unknown>).shopName;
  return typeof shopName === 'string' && shopName.trim() ? shopName : 'Shop';
}

export async function POST(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const supabase = createSupabaseRouteClient(request, pendingCookies);
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    // Get user from DB to verify vendor status
    const user = await getDbVendorUser(authUser.email);

    if (!user || user.role !== 'VENDOR' || user.vendorApprovalStatus !== 'APPROVED') {
      return jsonWithCookies({ error: 'Only approved vendors can create listings' }, 403, pendingCookies);
    }

    // Parse request body
    const body = await request.json();
    const { title, brand, model, year, price, condition, mileage, location } = body;

    // Validation
    if (!title || !brand || !model || !year || !price || !condition || !location) {
      return jsonWithCookies(
        { error: 'Missing required fields: title, brand, model, year, price, condition, location' },
        400,
        pendingCookies
      );
    }

    // Validate condition
    if (!['NEW', 'USED', 'RECONDITIONED'].includes(condition)) {
      return jsonWithCookies({ error: 'Invalid condition' }, 400, pendingCookies);
    }

    // Mileage is required for USED and RECONDITIONED
    if ((condition === 'USED' || condition === 'RECONDITIONED') && !mileage) {
      return jsonWithCookies({ error: 'Mileage is required for used and reconditioned vehicles' }, 400, pendingCookies);
    }

    // Get or create shop for vendor
    let shop = await prisma.shop.findUnique({
      where: { ownerId: user.id },
    });

    if (!shop) {
      shop = await prisma.shop.create({
        data: {
          id: randomUUID().replace(/-/g, ''),
          ownerId: user.id,
          name: getVendorShopName(user.vendorInfo),
          isVerified: true,
        },
      });
    }

    // Create listing
    const listingId = randomUUID().replace(/-/g, '');
    const now = new Date();
    const createData = {
      id: listingId,
      title,
      brand,
      model,
      year: parseInt(year),
      price: new Decimal(price),
      condition,
      mileage: mileage ? parseInt(mileage) : null,
      location,
      shopId: shop.id,
      status: 'PENDING' as const, // New listings go to PENDING for admin approval
    };

    console.log('Listing createData:', { title, brand });

    await prisma.$executeRaw`
      INSERT INTO "Listing" (
        "id",
        "shopId",
        "title",
        "brand",
        "model",
        "year",
        "price",
        "condition",
        "mileage",
        "location",
        "status"
        ,
        "updatedAt"
      ) VALUES (
        ${listingId},
        ${shop.id},
        ${title},
        ${brand},
        ${model},
        ${parseInt(year)},
        ${new Decimal(price)},
        ${condition}::"VehicleCondition",
        ${mileage ? parseInt(mileage) : null},
        ${location},
        'PENDING'::"ListingStatus",
        ${now}
      )
    `;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        year: true,
        price: true,
        condition: true,
        mileage: true,
        location: true,
        status: true,
        createdAt: true,
      },
    });

    if (!listing) {
      throw new Error('Listing insert succeeded but record could not be reloaded');
    }

    return jsonWithCookies(
      {
        success: true,
        message: 'Listing created successfully and is awaiting admin approval',
        listing,
      },
      201,
      pendingCookies
    );
  } catch (error: unknown) {
    let name: string | undefined;
let code: string | undefined;
let message: string | undefined;
let meta: unknown;
   if (typeof error === 'object' && error !== null) {
  const e = error as Record<string, unknown>;
  name = typeof e.name === 'string' ? e.name : undefined;
  code = typeof e.code === 'string' ? e.code : undefined;
  message = typeof e.message === 'string' ? e.message : undefined;
  meta = e.meta;
}
console.error('Error creating listing:', { name, code, message, meta });
return jsonWithCookies({ error: 'Failed to create listing' }, 500, pendingCookies);
  }
}

export async function GET(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const supabase = createSupabaseRouteClient(request, pendingCookies);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    // Get user's shop
    const user = await getDbVendorUser(session.user.email);

    if (!user || user.role !== 'VENDOR' || user.vendorApprovalStatus !== 'APPROVED') {
      return jsonWithCookies({ error: 'Only approved vendors can view listings' }, 403, pendingCookies);
    }

    const shop = await prisma.shop.findUnique({
      where: { ownerId: user.id },
      select: { id: true },
    });

    if (!shop) {
      return jsonWithCookies({ listings: [] }, 200, pendingCookies);
    }

    // Get vendor's listings
    const listings = await prisma.listing.findMany({
      where: { shopId: shop.id },
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        year: true,
        price: true,
        condition: true,
        mileage: true,
        location: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'EMI_APPLIED', 'EMI_PROCESSING', 'EMI_APPROVED'],
            },
          },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedListings = listings.map((listing) => ({
      ...listing,
      price: listing.price.toString(),
      hasActiveBooking: listing.bookings.length > 0,
    }));

    return jsonWithCookies({ listings: formattedListings }, 200, pendingCookies);
  } catch (error) {
    console.error('Error fetching vendor listings:', error);
    return jsonWithCookies({ error: 'Failed to fetch listings' }, 500, pendingCookies);
  }
}
