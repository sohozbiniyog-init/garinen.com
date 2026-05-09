import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth-helpers';

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
    const { vendorId } = body;

    if (!vendorId) {
      return NextResponse.json(
        { error: 'Missing vendor ID' },
        { status: 400 }
      );
    }

    // Update vendor approval status
    const vendor = await prisma.user.update({
      where: { id: vendorId },
      data: {
        vendorApprovalStatus: 'APPROVED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor approved successfully',
      vendor: {
        id: vendor.id,
        email: vendor.email,
        vendorApprovalStatus: vendor.vendorApprovalStatus,
      },
    });
  } catch (err) {
    console.error('POST /api/admin/vendors/approve error:', err);
    return NextResponse.json(
      { error: 'Failed to approve vendor' },
      { status: 500 }
    );
  }
}
