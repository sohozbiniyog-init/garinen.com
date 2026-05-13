import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createSupabaseRouteClient } from '@/lib/auth/route-helpers';
import type { PendingCookie } from '@/lib/auth/route-helpers';

export async function POST(req: NextRequest) {
  const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();

  try {
    const body = await req.json();
    let identifier: string | undefined = body.identifier;
    const { shopName, description, locationDivision, locationAddress, phone, category } = body;

    // If identifier not provided, attempt to get authenticated user's email from Supabase session
    if (!identifier) {
      try {
        const pendingCookies: PendingCookie[] = [];
        const supabase = createSupabaseRouteClient(req, pendingCookies);
        const { data } = await supabase.auth.getUser();
        const authUser = data.user ?? null;
        if (authUser?.email) {
          identifier = authUser.email;
        }
      } catch (err) {
        // ignore and proceed; identifier may still be empty
      }
    }

    const normalizedCategory = typeof category === 'string' ? category.trim().toLowerCase() : '';
    const allowedCategories = new Set(['new', 'used', 'reconditioned']);

    console.info('vendor-submit-info-request', {
      traceId,
      identifier: identifier || null,
      hasShopName: Boolean(shopName),
      hasDescription: Boolean(description),
      hasLocationDivision: Boolean(locationDivision),
      hasLocationAddress: Boolean(locationAddress),
      hasPhone: Boolean(phone),
      category: normalizedCategory || null,
    });

    if (!identifier || !shopName || !description || !locationDivision || !locationAddress || !phone || !normalizedCategory) {
      console.warn('vendor-submit-info-missing-fields', {
        traceId,
        identifier,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!allowedCategories.has(normalizedCategory)) {
      console.warn('vendor-submit-info-invalid-category', {
        traceId,
        identifier,
        category: normalizedCategory,
      });
      return NextResponse.json(
        { error: 'Invalid business category' },
        { status: 400 }
      );
    }

    // Find the user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      console.warn('vendor-submit-info-user-not-found', {
        traceId,
        identifier,
      });
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Allow pending vendor signups (new `PENDING_VENDOR` role) to complete onboarding before the role upgrade.
    const roleStr = String(user.role);
    const isPendingVendor = roleStr === 'PENDING_VENDOR' || (roleStr === 'BUYER' && user.vendorApprovalStatus === 'PENDING');

    if (user.role !== 'VENDOR' && !isPendingVendor) {
      console.warn('vendor-submit-info-non-vendor-user', {
        traceId,
        identifier,
        userId: user.id,
        role: user.role,
        vendorApprovalStatus: user.vendorApprovalStatus,
      });
      return NextResponse.json(
        { error: 'User is not a vendor' },
        { status: 400 }
      );
    }

    // Update user with vendor info
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        vendorInfo: {
          shopName,
          description,
          phone,
          category: normalizedCategory,
          locationDivision,
          locationAddress,
        },
      },
    });

    console.info('vendor-submit-info-success', {
      traceId,
      userId: updatedUser.id,
      email: updatedUser.email,
      vendorApprovalStatus: updatedUser.vendorApprovalStatus,
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor information submitted successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        vendorApprovalStatus: updatedUser.vendorApprovalStatus,
      },
    });
  } catch (err) {
    console.error('submit-vendor-info error', {
      traceId,
      err,
    });
    return NextResponse.json(
      { error: 'Failed to submit vendor information' },
      { status: 500 }
    );
  }
}

