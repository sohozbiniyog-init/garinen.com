import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSessionFromRequest } from '@/lib/auth/helpers';

export async function POST(req: NextRequest) {
  try {
    // Verify admin session
    const session = await getSessionFromRequest(req);
    if (!session || session.userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { vendorId, reason } = body;

    if (!vendorId || !reason) {
      return NextResponse.json(
        { error: 'Missing vendor ID or reason' },
        { status: 400 }
      );
    }

    // Get vendor to update their vendorInfo with rejection reason
    const vendor = await prisma.user.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Update vendor approval status and add rejection reason
    const prevInfo = (vendor.vendorInfo as Record<string, unknown> | null) ?? {};
    const updatedVendor = await prisma.user.update({
      where: { id: vendorId },
      data: {
        vendorApprovalStatus: 'REJECTED',
        vendorInfo: {
          ...prevInfo,
          rejectionReason: reason,
          rejectedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor rejected successfully',
      vendor: {
        id: updatedVendor.id,
        email: updatedVendor.email,
        vendorApprovalStatus: updatedVendor.vendorApprovalStatus,
      },
    });
  } catch (err) {
    console.error('POST /api/admin/vendors/reject error:', err);
    return NextResponse.json(
      { error: 'Failed to reject vendor' },
      { status: 500 }
    );
  }
}

