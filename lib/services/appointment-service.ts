import connectDB from '@/lib/mongodb';
import Appointment from '@/lib/models/Appointment';
import UserSchedule from '@/lib/models/UserSchedule';
import Mentor from '@/lib/models/Mentor';
import ServiceType from '@/lib/models/ServiceType';
import mongoose from 'mongoose';

export interface AvailabilitySlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface CheckAvailabilityOptions {
  mentorId: string | mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  durationMinutes: number;
}

class AppointmentService {
  /**
   * Check if a mentor is available at a specific time
   */
  async checkMentorAvailability(
    mentorId: string | mongoose.Types.ObjectId,
    scheduledAt: Date,
    durationMinutes: number
  ): Promise<boolean> {
    await connectDB();

    // Check if mentor exists and is available for booking
    const mentor = await Mentor.findOne({
      userId: mentorId,
      status: 'active',
      availableForBooking: true,
    });

    if (!mentor) {
      return false;
    }

    // Get mentor's schedule
    const schedule = await UserSchedule.findOne({ userId: mentorId });
    if (!schedule || !schedule.isActive) {
      return false;
    }

    // Check if time is within mentor's available hours
    const scheduledDate = new Date(scheduledAt);
    const dayOfWeek = this.getDayOfWeek(scheduledDate);
    const daySchedule = schedule.weeklySchedule.find(d => d.day === dayOfWeek);

    if (!daySchedule || !daySchedule.available) {
      // Check for exceptions
      const exception = schedule.exceptions.find(
        e => e.date.toDateString() === scheduledDate.toDateString()
      );
      
      if (!exception || !exception.available) {
        return false;
      }
    }

    // Check for conflicts with existing appointments
    const endTime = new Date(scheduledDate.getTime() + durationMinutes * 60000);
    const conflicts = await Appointment.find({
      mentorId: mentor.userId,
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
      $or: [
        {
          scheduledAt: {
            $gte: scheduledDate,
            $lt: endTime,
          },
        },
        {
          $expr: {
            $and: [
              { $gte: ['$scheduledAt', scheduledDate] },
              { $lt: [{ $add: ['$scheduledAt', { $multiply: ['$durationMinutes', 60000] }] }, endTime] },
            ],
          },
        },
      ],
    });

    return conflicts.length === 0;
  }

  /**
   * Get available time slots for a mentor
   */
  async getAvailableSlots(
    mentorId: string | mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date,
    durationMinutes: number
  ): Promise<AvailabilitySlot[]> {
    await connectDB();

    const schedule = await UserSchedule.findOne({ userId: mentorId });
    if (!schedule || !schedule.isActive) {
      return [];
    }

    const slots: AvailabilitySlot[] = [];
    const currentDate = new Date(startDate);
    const bufferMs = schedule.bufferTimeMinutes * 60000;

    while (currentDate <= endDate) {
      const dayOfWeek = this.getDayOfWeek(currentDate);
      const daySchedule = schedule.weeklySchedule.find(d => d.day === dayOfWeek);

      // Check for exceptions
      const exception = schedule.exceptions.find(
        e => e.date.toDateString() === currentDate.toDateString()
      );

      const isAvailable = exception
        ? exception.available
        : daySchedule?.available || false;

      if (isAvailable) {
        const timeSlots = exception?.slots || daySchedule?.slots || [];

        for (const timeSlot of timeSlots) {
          const [startHour, startMinute] = timeSlot.start.split(':').map(Number);
          const [endHour, endMinute] = timeSlot.end.split(':').map(Number);

          const slotStart = new Date(currentDate);
          slotStart.setHours(startHour, startMinute, 0, 0);

          const slotEnd = new Date(currentDate);
          slotEnd.setHours(endHour, endMinute, 0, 0);

          // Check if slot is in the future and meets minimum notice requirement
          const minNotice = new Date();
          minNotice.setHours(minNotice.getHours() + schedule.minBookingNoticeHours);

          if (slotStart >= minNotice && slotStart <= endDate) {
            const slotDuration = slotEnd.getTime() - slotStart.getTime();
            const requiredDuration = durationMinutes * 60000 + bufferMs;

            if (slotDuration >= requiredDuration) {
              // Check for conflicts
              const isAvailable = await this.checkMentorAvailability(
                mentorId,
                slotStart,
                durationMinutes
              );

              if (isAvailable) {
                slots.push({
                  start: slotStart,
                  end: new Date(slotStart.getTime() + durationMinutes * 60000),
                  available: true,
                });
              }
            }
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    return slots;
  }

  /**
   * Get day of week as string
   */
  private getDayOfWeek(date: Date): 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()] as any;
  }

  /**
   * Get upcoming appointments for a user (student or mentor)
   */
  async getUpcomingAppointments(
    userId: string | mongoose.Types.ObjectId,
    role: 'student' | 'mentor' = 'student',
    limit: number = 10
  ) {
    await connectDB();

    const query: any = {
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
      scheduledAt: { $gte: new Date() },
    };

    if (role === 'mentor') {
      query.mentorId = userId;
    } else {
      query.studentId = userId;
    }

    return await Appointment.find(query)
      .populate('studentId', 'name email firstName lastName')
      .populate('mentorId', 'name email firstName lastName')
      .populate('serviceTypeId', 'name description category creditCost durationMinutes')
      .sort({ scheduledAt: 1 })
      .limit(limit)
      .lean();
  }
}

export const appointmentService = new AppointmentService();
export default appointmentService;

