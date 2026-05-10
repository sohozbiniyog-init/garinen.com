import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const locations = await prisma.listing.findMany({
      where: {
        status: 'APPROVED',
      },
      select: {
        location: true,
      },
      distinct: ['location'],
      orderBy: {
        location: 'asc',
      },
    });

    const uniqueLocations = locations
      .map((l) => l.location)
      .filter((loc) => loc && loc.trim() !== '');

    return NextResponse.json(uniqueLocations, { status: 200 });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

