import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import AppBuilderProject from '@/lib/models/AppBuilderProject';
import AppBuilderSettings from '@/lib/models/AppBuilderSettings';

// POST /api/app-builder/projects/request - Create new app request
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

    // Check email verification
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Email verification required. Please verify your email to create app requests.' },
        { status: 403 }
      );
    }

    // Check if app requests are enabled
    const settings = await AppBuilderSettings.findOne();
    if (!settings || !settings.enabled) {
      return NextResponse.json(
        { error: 'App Builder requests are currently full. Please subscribe to be notified when availability opens.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      appType,
      features,
      requirements,
      paymentType,
      questionnaireData,
      kickoffMeetingRequested,
    } = body;

    if (!title || !description || !appType || !paymentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate queue position
    const queueCount = await AppBuilderProject.countDocuments({
      status: { $in: ['draft', 'in_progress', 'review'] },
    });

    // Determine complexity and size from questionnaire
    const complexity = questionnaireData?.complexity || 'medium';
    const size = questionnaireData?.budget 
      ? (questionnaireData.budget.includes('Under $100') || questionnaireData.budget.includes('$100-$500') ? 'small' :
         questionnaireData.budget.includes('$500-$2,000') ? 'medium' :
         questionnaireData.budget.includes('$2,000-$5,000') ? 'large' : 'enterprise')
      : 'medium';

    // Determine priority based on subscription
    const priority = paymentType === 'subscription' ? 'high' : 'normal';

    const project = await AppBuilderProject.create({
      userId: user._id,
      title,
      description,
      appType,
      features: features || [],
      requirements: requirements || '',
      paymentType,
      questionnaireData: questionnaireData || {},
      size,
      complexity,
      techStack: questionnaireData?.techStack || [],
      queuePosition: queueCount + 1,
      priority,
      kickoffMeetingRequested: kickoffMeetingRequested || false,
      status: 'draft',
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });

    // TODO: Send notification to admin about new request

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create project request' },
      { status: 500 }
    );
  }
}

