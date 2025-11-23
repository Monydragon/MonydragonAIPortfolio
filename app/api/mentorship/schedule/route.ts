import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import UserSchedule from '@/lib/models/UserSchedule';

// GET /api/mentorship/schedule - Get user's schedule
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
    const userId = searchParams.get('userId'); // For admins to view other users' schedules

    const isAdmin = (user as any).role === 'admin';
    const targetUserId = userId && isAdmin ? userId : user._id;

    if (userId && !isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can view other users\' schedules' },
        { status: 403 }
      );
    }

    let schedule = await UserSchedule.findOne({ userId: targetUserId });

    // Create default schedule if doesn't exist
    if (!schedule) {
      schedule = await UserSchedule.create({
        userId: targetUserId,
        timezone: (user as any).timezone || 'UTC',
      });
    }

    return NextResponse.json({ schedule });
  } catch (error: any) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

// POST /api/mentorship/schedule - Create or update user's schedule
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
    const { userId, ...scheduleData } = body;

    const isAdmin = (user as any).role === 'admin';
    const targetUserId = userId && isAdmin ? userId : user._id;

    if (userId && !isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can update other users\' schedules' },
        { status: 403 }
      );
    }

    const schedule = await UserSchedule.findOneAndUpdate(
      { userId: targetUserId },
      {
        ...scheduleData,
        userId: targetUserId,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json({ schedule });
  } catch (error: any) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

