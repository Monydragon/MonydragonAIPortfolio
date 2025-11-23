import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import AppBuilderProject from '@/lib/models/AppBuilderProject';
import User from '@/lib/models/User';

// GET /api/app-builder/projects - Get user's projects
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

    const projects = await AppBuilderProject.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/app-builder/projects - Create new project
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
    const {
      title,
      description,
      appType,
      features,
      requirements,
      paymentType,
      estimatedHours,
      estimatedCost,
      selectedModel,
      modelProvider,
      termsAccepted,
    } = body;

    if (!title || !description || !appType || !paymentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const project = await AppBuilderProject.create({
      userId: user._id,
      title,
      description,
      appType,
      features: features || [],
      requirements: requirements || '',
      paymentType,
      estimatedHours,
      estimatedCost,
      selectedModel,
      modelProvider,
      termsAccepted: termsAccepted || false,
      termsAcceptedAt: termsAccepted ? new Date() : undefined,
      status: 'draft',
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}

