import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cacheService } from '@/lib/cache';
import crypto from 'crypto';

/**
 * Webhook payload from payment processor (Stripe, bKash, etc.)
 */
interface PaymentWebhookPayload {
  type: 'payment.success' | 'payment.failed' | 'payment.refund';
  paymentIntentId: string;
  paymentReference: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'refunded';
  timestamp: string;
  signature?: string;
}

/**
 * Verify webhook signature (example using HMAC-SHA256).
 * In production, use the payment processor's SDK for verification.
 */
function verifyWebhookSignature(
  payload: PaymentWebhookPayload,
  signature: string,
  secret: string
): boolean {
  const message = JSON.stringify(payload);
  const computed = crypto.createHmac('sha256', secret).update(message).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PaymentWebhookPayload;

    // Verify webhook signature (optional, but recommended)
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'dev-secret';
    if (body.signature && !verifyWebhookSignature(body, body.signature, webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const { type, paymentIntentId, paymentReference, status } = body;

    if (!paymentIntentId && !paymentReference) {
      return NextResponse.json(
        { error: 'Missing paymentIntentId or paymentReference' },
        { status: 400 }
      );
    }

    // Find the booking by payment intent ID or reference
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { paymentIntentId },
          { paymentReference },
        ],
      },
      select: {
        id: true,
        status: true,
        userId: true,
        listingId: true,
        depositAmount: true,
      },
    });

    if (!booking) {
      console.warn(`Webhook received for unknown booking: ${paymentIntentId || paymentReference}`);
      return NextResponse.json(
        { success: true }, // Return 200 to acknowledge receipt
        { status: 200 }
      );
    }

    // Update booking based on payment status
    let newPaymentStatus: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
    let newBookingStatus = booking.status;

    if (type === 'payment.success' && status === 'succeeded') {
      newPaymentStatus = 'CAPTURED';
      // Auto-confirm booking on successful payment
      if (booking.status === 'PENDING') {
        newBookingStatus = 'CONFIRMED';
      }
    } else if (type === 'payment.failed' || status === 'failed') {
      newPaymentStatus = 'FAILED';
      // Cancel booking on failed payment
      if (['PENDING', 'CONFIRMED'].includes(booking.status)) {
        newBookingStatus = 'CANCELLED';
      }
    } else if (type === 'payment.refund' || status === 'refunded') {
      newPaymentStatus = 'REFUNDED';
      // Mark booking as cancelled on refund
      if (booking.status !== 'CANCELLED' && booking.status !== 'PURCHASED') {
        newBookingStatus = 'CANCELLED';
      }
    } else {
      newPaymentStatus = 'PENDING';
    }

    // Update the booking atomically
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: newPaymentStatus,
        status: newBookingStatus,
        paidAt: newPaymentStatus === 'CAPTURED' ? new Date() : undefined,
      },
    });

    // Invalidate booking cache
    cacheService.invalidateListing(booking.listingId);

    // TODO: Send email notification to buyer and seller
    console.log(`Booking ${booking.id} payment status updated to ${newPaymentStatus}`);

    return NextResponse.json(
      {
        success: true,
        bookingId: updatedBooking.id,
        paymentStatus: updatedBooking.paymentStatus,
        bookingStatus: updatedBooking.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
