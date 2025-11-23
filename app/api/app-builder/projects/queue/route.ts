import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import AppBuilderProject from '@/lib/models/AppBuilderProject';

// GET /api/app-builder/projects/queue - Get project queue
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

    const isAdmin = (user as any).role === 'admin';

    // Get projects in queue (pending, in_progress, review)
    const queueProjects = await AppBuilderProject.find({
      status: { $in: ['draft', 'in_progress', 'review'] },
    })
      .populate('userId', 'name email')
      .sort({ priority: -1, queuePosition: 1, createdAt: 1 })
      .lean();

    // If admin, return all. If user, return only their projects
    const projects = isAdmin
      ? queueProjects
      : queueProjects.filter((p: any) => p.userId._id.toString() === user._id.toString());

    return NextResponse.json({ projects, isAdmin });
  } catch (error: any) {
    console.error('Error fetching queue:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch queue' },
      { status: 500 }
    );
  }
}

