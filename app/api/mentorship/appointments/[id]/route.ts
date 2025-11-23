import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Appointment from '@/lib/models/Appointment';
import creditService from '@/lib/services/credit-service';

// GET /api/mentorship/appointments/[id] - Get specific appointment
export async function GET(
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

    const appointment = await Appointment.findById(params.id)
      .populate('studentId', 'name email firstName lastName')
      .populate('mentorId', 'name email firstName lastName')
      .populate('serviceTypeId', 'name description category creditCost durationMinutes')
      .lean();

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this appointment
    const isStudent = appointment.studentId._id.toString() === user._id.toString();
    const isMentor = appointment.mentorId && appointment.mentorId._id.toString() === user._id.toString();
    const isAdmin = (user as any).role === 'admin';

    if (!isStudent && !isMentor && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ appointment });
  } catch (error: any) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

// PUT /api/mentorship/appointments/[id] - Update appointment
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

    const appointment = await Appointment.findById(params.id);
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const isStudent = appointment.studentId.toString() === user._id.toString();
    const isMentor = appointment.mentorId && appointment.mentorId.toString() === user._id.toString();
    const isAdmin = (user as any).role === 'admin';

    if (!isStudent && !isMentor && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, meetingNotes, rating, feedback, meetingLink } = body;

    // Update allowed fields based on role
    const updates: any = {};

    if (isAdmin || isMentor) {
      if (status) updates.status = status;
      if (meetingNotes !== undefined) updates.meetingNotes = meetingNotes;
      if (meetingLink !== undefined) updates.meetingLink = meetingLink;
    }

    if (isStudent || isAdmin) {
      if (rating !== undefined) updates.rating = rating;
      if (feedback !== undefined) updates.feedback = feedback;
      if (status === 'cancelled') {
        updates.status = 'cancelled';
        updates.cancelledAt = new Date();
        updates.cancelledBy = user._id;
        if (body.cancellationReason) {
          updates.cancellationReason = body.cancellationReason;
        }
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('studentId', 'name email firstName lastName')
      .populate('mentorId', 'name email firstName lastName')
      .populate('serviceTypeId', 'name description category creditCost durationMinutes');

    // If cancelled and credits were charged, refund them
    if (status === 'cancelled' && appointment.creditsCharged) {
      await creditService.addCredits({
        userId: appointment.studentId,
        amount: appointment.creditCost,
        type: 'refunded',
        source: 'refund',
        description: `Refund for cancelled appointment: ${appointment._id}`,
        appointmentId: appointment._id,
      });
    }

    return NextResponse.json({ appointment: updatedAppointment });
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

