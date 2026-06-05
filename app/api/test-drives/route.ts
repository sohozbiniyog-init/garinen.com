import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, preferredDate, preferredTime, listingId, notes } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const testDrive = await prisma.testDrive.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        preferredDate: preferredDate?.trim() || null,
        preferredTime: preferredTime?.trim() || null,
        listingId: listingId?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(testDrive, { status: 201 });
  } catch (error) {
    console.error('Error submitting test drive request:', error);
    return NextResponse.json(
      { error: 'Failed to submit test drive request' },
      { status: 500 }
    );
  }
}
