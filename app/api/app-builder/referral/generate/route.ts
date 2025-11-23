import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import AppBuilderSettings from '@/lib/models/AppBuilderSettings';
import creditService from '@/lib/services/credit-service';

// POST /api/app-builder/referral/generate - Generate referral code (if needed)
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

    // Referral code is based on username or user ID
    const code = (user.username || user._id.toString().slice(-8)).toUpperCase();
    
    return NextResponse.json({ code });
  } catch (error: any) {
    console.error('Error generating referral code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate referral code' },
      { status: 500 }
    );
  }
}

