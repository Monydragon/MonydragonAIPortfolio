import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Payment from '@/lib/models/Payment';
import creditService from '@/lib/services/credit-service';

// GET /api/app-builder/payments - Get user's payment history
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const payments = await Payment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST /api/app-builder/payments - Create payment (for per-hour or per-project)
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
    const { amount, type, projectId, description, paymentProcessor = 'paypal' } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const payment = await Payment.create({
      userId: user._id,
      type: type || 'one_time',
      amount,
      currency: 'USD',
      status: 'pending',
      processor: paymentProcessor,
      projectId: projectId ? projectId : undefined,
      description: description || `Payment for ${type === 'one_time' ? 'project' : type}`,
    });

    // Return payment info for client to process
    return NextResponse.json({
      paymentId: payment._id,
      amount,
      processor: paymentProcessor,
      // In production, return checkout URL
      // checkoutUrl: await createPayPalOrder(payment._id.toString(), amount),
    });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}

