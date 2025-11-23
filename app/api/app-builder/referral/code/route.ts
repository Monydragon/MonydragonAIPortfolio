import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Referral from '@/lib/models/Referral';

// GET /api/app-builder/referral/code - Get user's referral code
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

    // Generate referral code from user ID or username
    const code = (user.username || user._id.toString().slice(-8)).toUpperCase();
    
    return NextResponse.json({ code });
  } catch (error: any) {
    console.error('Error getting referral code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get referral code' },
      { status: 500 }
    );
  }
}

