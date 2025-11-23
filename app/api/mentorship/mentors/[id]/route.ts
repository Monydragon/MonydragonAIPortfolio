import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Mentor from '@/lib/models/Mentor';

// GET /api/mentorship/mentors/[id] - Get specific mentor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const mentor = await Mentor.findById(params.id)
      .populate('userId', 'name email firstName lastName timezone experienceLevel')
      .lean();

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ mentor });
  } catch (error: any) {
    console.error('Error fetching mentor:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch mentor' },
      { status: 500 }
    );
  }
}

// PUT /api/mentorship/mentors/[id] - Update mentor profile
export async function PUT(
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

    const mentor = await Mentor.findById(params.id);
    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    const isAdmin = (user as any).role === 'admin';
    const isOwner = mentor.userId.toString() === user._id.toString();

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'You can only update your own mentor profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updatedMentor = await Mentor.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email firstName lastName');

    return NextResponse.json({ mentor: updatedMentor });
  } catch (error: any) {
    console.error('Error updating mentor:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update mentor' },
      { status: 500 }
    );
  }
}

