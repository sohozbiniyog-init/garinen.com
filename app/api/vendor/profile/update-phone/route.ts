import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';

export async function POST(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const supabase = createSupabaseRouteClient(request, pendingCookies);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token || !session.user) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    const email = session.user.email?.trim().toLowerCase();

    if (!email) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    // Resolve the database user by email because Prisma IDs are not the same as Supabase auth IDs.
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        vendorApprovalStatus: true,
        vendorInfo: true,
      },
    });

    if (!user) {
      return jsonWithCookies({ error: 'User not found' }, 404, pendingCookies);
    }

    if (user.role !== 'VENDOR' || user.vendorApprovalStatus !== 'APPROVED') {
      return jsonWithCookies(
        { error: 'Only approved vendors can update their profile' },
        403,
        pendingCookies
      );
    }

    // Parse request body
    const body = await request.json();
    const newPhone = typeof body.phone === 'string' ? body.phone.trim() : '';

    if (!newPhone) {
      return jsonWithCookies(
        { error: 'Phone number is required' },
        400,
        pendingCookies
      );
    }

    // Validate phone format (basic validation - adjust regex as needed for Bangladesh)
    const phoneRegex = /^(\+880|880|0)?\d{10,11}$/;
    if (!phoneRegex.test(newPhone.replace(/\s/g, ''))) {
      return jsonWithCookies(
        { error: 'Invalid phone number format' },
        400,
        pendingCookies
      );
    }

    // Check if new phone is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        phone: newPhone.trim(),
        id: { not: user.id },
      },
    });

    if (existingUser) {
      return jsonWithCookies(
        { error: 'This phone number is already in use' },
        400,
        pendingCookies
      );
    }

    // Update user phone and update vendorInfo with new phone
    const previousVendorInfo = (user.vendorInfo as Record<string, unknown> | null) ?? {};
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        phone: newPhone.trim(),
        vendorInfo: {
          ...previousVendorInfo,
          phone: newPhone.trim(),
        },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        vendorInfo: true,
      },
    });

    return jsonWithCookies(
      {
        success: true,
        message: 'Phone number updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          phone: updatedUser.phone,
          vendorInfo: updatedUser.vendorInfo,
        },
      },
      200,
      pendingCookies
    );
  } catch (error) {
    console.error('POST /api/vendor/profile/update-phone error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update phone number';
    return jsonWithCookies({ error: errorMessage }, 500, pendingCookies);
  }
}
