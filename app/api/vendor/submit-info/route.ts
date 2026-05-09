import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, shopName, description, location, phone, category } = body;

    if (!identifier || !shopName || !description || !location || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is VENDOR role
    if (user.role !== 'VENDOR') {
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
          location,
          phone,
          category: category || 'other',
          submittedAt: new Date().toISOString(),
        },
      },
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
    console.error('submit-vendor-info error', err);
    return NextResponse.json(
      { error: 'Failed to submit vendor information' },
      { status: 500 }
    );
  }
}
