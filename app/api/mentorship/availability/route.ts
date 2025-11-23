import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import appointmentService from '@/lib/services/appointment-service';
import ServiceType from '@/lib/models/ServiceType';

// GET /api/mentorship/availability - Check mentor availability and get available slots
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get('mentorId');
    const serviceTypeId = searchParams.get('serviceTypeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!mentorId) {
      return NextResponse.json(
        { error: 'mentorId is required' },
        { status: 400 }
      );
    }

    if (!serviceTypeId) {
      return NextResponse.json(
        { error: 'serviceTypeId is required' },
        { status: 400 }
      );
    }

    const serviceType = await ServiceType.findById(serviceTypeId);
    if (!serviceType) {
      return NextResponse.json(
        { error: 'Service type not found' },
        { status: 404 }
      );
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days

    const slots = await appointmentService.getAvailableSlots(
      mentorId,
      start,
      end,
      serviceType.durationMinutes
    );

    return NextResponse.json({
      mentorId,
      serviceTypeId,
      durationMinutes: serviceType.durationMinutes,
      availableSlots: slots,
      totalSlots: slots.length,
    });
  } catch (error: any) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check availability' },
      { status: 500 }
    );
  }
}

