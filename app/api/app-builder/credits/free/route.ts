import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import creditService from '@/lib/services/credit-service';
import CreditTransaction from '@/lib/models/CreditTransaction';

// POST /api/app-builder/credits/free - Give free credits (for new users)
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

    // Check if user already received free credits
    const existingFreeCredits = await CreditTransaction.findOne({
      userId: user._id,
      type: 'earned',
      source: 'free_tier',
    });

    if (existingFreeCredits) {
      return NextResponse.json(
        { error: 'Free credits already claimed', balance: await creditService.getBalance(user._id) },
        { status: 400 }
      );
    }

    // Give free credits
    const transaction = await creditService.giveFreeCredits(
      user._id,
      100, // 100 free credits
      'Welcome! Start building apps with free credits'
    );

    return NextResponse.json({
      message: 'Free credits added',
      credits: 100,
      balance: await creditService.getBalance(user._id),
      transaction,
    });
  } catch (error: any) {
    console.error('Error giving free credits:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to give free credits' },
      { status: 500 }
    );
  }
}

