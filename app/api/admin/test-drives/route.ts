import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const testDrives = await prisma.testDrive.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(testDrives, { status: 200 });
  } catch (error) {
    console.error('Error fetching test drives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test drives' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await prisma.testDrive.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating test drive:', error);
    return NextResponse.json(
      { error: 'Failed to update test drive' },
      { status: 500 }
    );
  }
}
