import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import creditService from '@/lib/services/credit-service';
import Payment from '@/lib/models/Payment';

// POST /api/app-builder/credits/purchase - Initiate credit purchase
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { credits, paymentProcessor = 'paypal' } = body;

    if (!credits || credits <= 0) {
      return NextResponse.json(
        { error: 'Invalid credit amount' },
        { status: 400 }
      );
    }

    // Get pricing
    const pricing = creditService.getCreditPricing();
    const selectedPackage = pricing.find(p => p.credits === credits);
    
    if (!selectedPackage) {
      return NextResponse.json(
        { error: 'Invalid credit package' },
        { status: 400 }
      );
    }

    const totalCredits = selectedPackage.credits + (selectedPackage.bonus || 0);
    const amount = selectedPackage.price;

    // Create payment record
    const payment = await Payment.create({
      userId: user._id,
      type: 'credits',
      amount,
      currency: 'USD',
      status: 'pending',
      processor: paymentProcessor,
      creditsPurchased: totalCredits,
      description: `Purchase ${totalCredits} credits (${selectedPackage.credits} + ${selectedPackage.bonus || 0} bonus)`,
    });

    // Return payment info for client to process
    // In production, this would redirect to PayPal/Stripe checkout
    return NextResponse.json({
      paymentId: payment._id,
      amount,
      credits: totalCredits,
      processor: paymentProcessor,
      // For PayPal, you would return a checkout URL here
      // checkoutUrl: await createPayPalOrder(payment._id.toString(), amount),
    });
  } catch (error: any) {
    console.error('Error initiating purchase:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate purchase' },
      { status: 500 }
    );
  }
}

