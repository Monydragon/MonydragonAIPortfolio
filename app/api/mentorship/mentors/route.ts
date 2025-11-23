import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Mentor from '@/lib/models/Mentor';
import permissionService from '@/lib/services/permission-service';
import Role from '@/lib/models/Role';

// GET /api/mentorship/mentors - Get all active mentors
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');
    const experienceLevel = searchParams.get('experienceLevel');
    const status = searchParams.get('status') || 'active';

    const query: any = {
      status: status as any,
      availableForBooking: true,
    };

    if (specialty) {
      query.specialties = { $in: [specialty] };
    }

    if (experienceLevel && experienceLevel !== 'all') {
      query.experienceLevels = { $in: [experienceLevel, 'all'] };
    }

    const mentors = await Mentor.find(query)
      .populate('userId', 'name email firstName lastName')
      .sort({ rating: -1, totalSessions: -1 })
      .lean();

    return NextResponse.json({ mentors });
  } catch (error: any) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch mentors' },
      { status: 500 }
    );
  }
}

// POST /api/mentorship/mentors - Create or update mentor profile
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

    const isAdmin = await permissionService.hasPermission(user._id, 'mentorship.manage_mentors');
    const body = await request.json();
    const { userId, ...mentorData } = body;

    // Determine target user
    const targetUserId = userId && isAdmin ? userId : user._id;
    
    // Check if user is trying to create mentor profile for someone else
    if (userId && !isAdmin) {
      return NextResponse.json(
        { error: 'Only users with mentorship.manage_mentors permission can create mentor profiles for other users' },
        { status: 403 }
      );
    }

    // Assign Mentor role if user doesn't have it
    const mentorRole = await Role.findOne({ name: 'Mentor' });
    if (mentorRole) {
      const hasMentorRole = user.roles?.some(
        (r: any) => r.toString() === mentorRole._id.toString()
      );
      if (!hasMentorRole) {
        if (!user.roles) {
          user.roles = [];
        }
        user.roles.push(mentorRole._id);
        await user.save();
      }
    }

    // Create or update mentor profile
    const mentor = await Mentor.findOneAndUpdate(
      { userId: targetUserId },
      {
        ...mentorData,
        userId: targetUserId,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).populate('userId', 'name email firstName lastName');

    return NextResponse.json({ mentor });
  } catch (error: any) {
    console.error('Error creating/updating mentor:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create/update mentor profile' },
      { status: 500 }
    );
  }
}

