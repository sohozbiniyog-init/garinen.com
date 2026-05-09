import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId, brand, model, yearFrom, yearTo, budget, color, features, notes } = body;

    // Validate required fields
    if (!userId || !brand || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, brand, model' },
        { status: 400 }
      );
    }

    // Create custom order
    const customOrder = await prisma.customOrder.create({
      data: {
        userId,
        brand,
        model,
        yearFrom: yearFrom ? parseInt(yearFrom) : null,
        yearTo: yearTo ? parseInt(yearTo) : null,
        budget: budget || null,
        color: color || null,
        features: features || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(customOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating custom order:', error);
    return NextResponse.json(
      { error: 'Failed to create custom order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    let customOrders;

    if (isAdmin) {
      // Admin: get all custom orders sorted by creation date (newest first)
      customOrders = await prisma.customOrder.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // User: get only their own custom orders
      customOrders = await prisma.customOrder.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json(customOrders);
  } catch (error) {
    console.error('Error fetching custom orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom orders' },
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
        { error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }

    // Validate status is valid enum value
    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'QUOTED', 'PURCHASED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.customOrder.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating custom order:', error);
    return NextResponse.json(
      { error: 'Failed to update custom order' },
      { status: 500 }
    );
  }
}
