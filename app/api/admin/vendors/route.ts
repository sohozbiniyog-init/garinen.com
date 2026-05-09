import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    // Verify admin session
    const session = await getSessionFromRequest(req);
    if (!session || session.userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch pending vendors
    const vendors = await prisma.user.findMany({
      where: {
        role: 'VENDOR',
        vendorApprovalStatus: 'PENDING',
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        vendorInfo: true,
        vendorApprovalStatus: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({
      vendors: vendors.map((v) => ({
        ...v,
        vendorInfo: v.vendorInfo || {},
      })),
    });
  } catch (err) {
    console.error('GET /api/admin/vendors error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}
