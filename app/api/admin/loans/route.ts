import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const loans = await prisma.loanApplication.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(loans, { status: 200 });
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    return NextResponse.json({ error: 'Failed to fetch loan applications' }, { status: 500 });
  }
}

