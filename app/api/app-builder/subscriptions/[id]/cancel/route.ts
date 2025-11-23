import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Subscription from '@/lib/models/Subscription';

// POST /api/app-builder/subscriptions/[id]/cancel - Cancel subscription
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const isAdmin = (user as any).role === 'admin';
    
    // Support both subscription ID and user ID (for admin)
    let subscription;
    
    // If admin and looks like ObjectId, try as user ID first
    if (isAdmin && /^[0-9a-fA-F]{24}$/.test(params.id)) {
      subscription = await Subscription.findOne({
        userId: params.id,
        status: 'active',
      });
    }
    
    // If not found or not admin, try as subscription ID
    if (!subscription) {
      subscription = await Subscription.findOne({
        _id: params.id,
        ...(isAdmin ? {} : { userId: user._id }),
      });
    }

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    // In production, cancel subscription with payment processor
    // await cancelPayPalSubscription(subscription.externalSubscriptionId);

    return NextResponse.json({
      message: 'Subscription cancelled',
      subscription,
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

