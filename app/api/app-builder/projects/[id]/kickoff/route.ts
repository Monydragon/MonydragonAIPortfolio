import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import AppBuilderProject from '@/lib/models/AppBuilderProject';
import AppBuilderSettings from '@/lib/models/AppBuilderSettings';
import Payment from '@/lib/models/Payment';

// POST /api/app-builder/projects/[id]/kickoff - Request/schedule kickoff meeting
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

    const project = await AppBuilderProject.findOne({
      _id: params.id,
      userId: user._id,
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const { scheduledDate, notes } = body;

    const settings = await AppBuilderSettings.findOne();
    if (!settings || !settings.kickoffMeetingEnabled) {
      return NextResponse.json(
        { error: 'Kickoff meetings are not currently available' },
        { status: 400 }
      );
    }

    // If scheduled date provided, create payment
    if (scheduledDate) {
      const payment = await Payment.create({
        userId: user._id,
        type: 'one_time',
        amount: settings.kickoffMeetingPrice,
        currency: 'USD',
        status: 'pending',
        processor: 'paypal',
        projectId: project._id,
        description: `Kickoff meeting for project: ${project.title}`,
        metadata: { scheduledDate, notes },
      });

      project.kickoffMeetingRequested = true;
      project.kickoffMeetingScheduled = new Date(scheduledDate);
      project.kickoffMeetingNotes = notes;
      await project.save();

      return NextResponse.json({
        message: 'Kickoff meeting scheduled',
        paymentId: payment._id,
        amount: settings.kickoffMeetingPrice,
        scheduledDate,
      });
    } else {
      // Just request meeting
      project.kickoffMeetingRequested = true;
      await project.save();

      return NextResponse.json({
        message: 'Kickoff meeting requested',
        price: settings.kickoffMeetingPrice,
      });
    }
  } catch (error: any) {
    console.error('Error scheduling kickoff meeting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule kickoff meeting' },
      { status: 500 }
    );
  }
}

