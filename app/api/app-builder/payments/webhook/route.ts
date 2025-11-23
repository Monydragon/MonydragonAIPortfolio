import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/lib/models/Payment';
import creditService from '@/lib/services/credit-service';

// POST /api/app-builder/payments/webhook - Handle payment webhooks (PayPal, Stripe, etc.)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { event, paymentId, orderId, status, amount, processor } = body;

    // Verify webhook signature (implement based on processor)
    // For PayPal: verify PayPal webhook signature
    // For Stripe: verify Stripe webhook signature

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { error: 'Missing payment ID or order ID' },
        { status: 400 }
      );
    }

    // Find payment by external ID
    const payment = await Payment.findOne({
      $or: [
        { externalPaymentId: paymentId },
        { externalOrderId: orderId },
      ],
    });

    if (!payment) {
      console.error('Payment not found:', { paymentId, orderId });
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    if (status === 'completed' || status === 'approved') {
      payment.status = 'completed';
      payment.processedAt = new Date();
      payment.externalPaymentId = paymentId || payment.externalPaymentId;
      payment.externalOrderId = orderId || payment.externalOrderId;
      await payment.save();

      // If purchasing credits, add them to user account
      if (payment.type === 'credits' && payment.creditsPurchased) {
        await creditService.addCredits({
          userId: payment.userId,
          amount: payment.creditsPurchased,
          type: 'purchased',
          source: 'purchase',
          description: `Purchased ${payment.creditsPurchased} credits`,
          paymentId: payment._id,
        });
      }
    } else if (status === 'failed' || status === 'cancelled') {
      payment.status = status === 'failed' ? 'failed' : 'cancelled';
      await payment.save();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

