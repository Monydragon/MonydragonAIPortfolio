import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Appointment from '@/lib/models/Appointment';
import ServiceType from '@/lib/models/ServiceType';
import creditService from '@/lib/services/credit-service';
import appointmentService from '@/lib/services/appointment-service';
import Mentor from '@/lib/models/Mentor';
import UserSchedule from '@/lib/models/UserSchedule';

// GET /api/mentorship/appointments - Get user's appointments
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
    const role = searchParams.get('role'); // 'student' or 'mentor'
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';

    const query: any = {};
    
    if (role === 'mentor') {
      query.mentorId = user._id;
    } else {
      query.studentId = user._id;
    }

    if (status) {
      query.status = status;
    }

    if (upcoming) {
      query.scheduledAt = { $gte: new Date() };
    }

    const appointments = await Appointment.find(query)
      .populate('studentId', 'name email firstName lastName')
      .populate('mentorId', 'name email firstName lastName')
      .populate('serviceTypeId', 'name description category creditCost durationMinutes')
      .sort({ scheduledAt: 1 })
      .lean();

    return NextResponse.json({ appointments });
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST /api/mentorship/appointments - Book a new appointment
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
      serviceTypeId,
      mentorId,
      scheduledAt,
      studentNotes,
      timezone,
    } = body;

    // Validate service type
    const serviceType = await ServiceType.findById(serviceTypeId);
    if (!serviceType || !serviceType.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive service type' },
        { status: 400 }
      );
    }

    // Check if user has enough credits
    const creditBalance = await creditService.getBalance(user._id);
    if (creditBalance < serviceType.creditCost) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          required: serviceType.creditCost,
          available: creditBalance,
        },
        { status: 400 }
      );
    }

    // Validate mentor if required
    if (serviceType.requiresMentor) {
      if (!mentorId) {
        return NextResponse.json(
          { error: 'Mentor is required for this service' },
          { status: 400 }
        );
      }

      const mentor = await Mentor.findOne({
        userId: mentorId,
        status: 'active',
        availableForBooking: true,
      });

      if (!mentor) {
        return NextResponse.json(
          { error: 'Mentor not available' },
          { status: 400 }
        );
      }
    }

    // Validate scheduled time
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book appointments in the past' },
        { status: 400 }
      );
    }

    // Check mentor availability if mentor is specified
    if (mentorId) {
      const isAvailable = await appointmentService.checkMentorAvailability(
        mentorId,
        scheduledDate,
        serviceType.durationMinutes
      );

      if (!isAvailable) {
        return NextResponse.json(
          { error: 'Mentor is not available at the requested time' },
          { status: 400 }
        );
      }
    }

    // Create appointment
    const appointment = await Appointment.create({
      studentId: user._id,
      mentorId: mentorId || undefined,
      serviceTypeId: serviceType._id,
      type: serviceType.category as any,
      status: 'pending',
      scheduledAt: scheduledDate,
      durationMinutes: serviceType.durationMinutes,
      timezone: timezone || (user as any).timezone || 'UTC',
      creditCost: serviceType.creditCost,
      creditsCharged: false,
      studentNotes,
    });

    // Charge credits
    try {
      await creditService.useCreditsForService(
        user._id,
        serviceType._id,
        appointment._id,
        `Appointment: ${serviceType.name}`
      );

      // Update appointment to mark credits as charged
      appointment.creditsCharged = true;
      await appointment.save();
    } catch (creditError: any) {
      // If credit charging fails, delete the appointment
      await Appointment.findByIdAndDelete(appointment._id);
      return NextResponse.json(
        { error: `Failed to charge credits: ${creditError.message}` },
        { status: 500 }
      );
    }

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('studentId', 'name email firstName lastName')
      .populate('mentorId', 'name email firstName lastName')
      .populate('serviceTypeId', 'name description category creditCost durationMinutes')
      .lean();

    return NextResponse.json(
      { appointment: populatedAppointment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

