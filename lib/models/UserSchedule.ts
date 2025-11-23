import mongoose, { Schema, Document, Model } from 'mongoose';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeSlot {
  start: string; // Format: "HH:mm" (24-hour), e.g., "09:00"
  end: string; // Format: "HH:mm" (24-hour), e.g., "17:00"
}

export interface DaySchedule {
  day: DayOfWeek;
  available: boolean;
  slots: TimeSlot[];
}

export interface IUserSchedule extends Document {
  userId: mongoose.Types.ObjectId;
  timezone: string; // e.g., 'America/New_York'
  weeklySchedule: DaySchedule[]; // Recurring weekly schedule
  exceptions: Array<{
    date: Date; // Specific date
    available: boolean;
    slots?: TimeSlot[];
    reason?: string; // e.g., "Holiday", "Vacation"
  }>;
  bufferTimeMinutes: number; // Buffer time between sessions (default 15)
  minBookingNoticeHours: number; // Minimum hours in advance to book (default 24)
  maxBookingAdvanceDays: number; // Maximum days in advance to book (default 90)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new Schema<TimeSlot>(
  {
    start: {
      type: String,
      required: true,
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm'],
    },
    end: {
      type: String,
      required: true,
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm'],
    },
  },
  { _id: false }
);

const DayScheduleSchema = new Schema<DaySchedule>(
  {
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    available: {
      type: Boolean,
      default: false,
    },
    slots: {
      type: [TimeSlotSchema],
      default: [],
    },
  },
  { _id: false }
);

const ExceptionSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    available: {
      type: Boolean,
      required: true,
    },
    slots: {
      type: [TimeSlotSchema],
    },
    reason: {
      type: String,
    },
  },
  { _id: false }
);

const UserScheduleSchema = new Schema<IUserSchedule>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    weeklySchedule: {
      type: [DayScheduleSchema],
      default: [
        { day: 'monday', available: false, slots: [] },
        { day: 'tuesday', available: false, slots: [] },
        { day: 'wednesday', available: false, slots: [] },
        { day: 'thursday', available: false, slots: [] },
        { day: 'friday', available: false, slots: [] },
        { day: 'saturday', available: false, slots: [] },
        { day: 'sunday', available: false, slots: [] },
      ],
    },
    exceptions: {
      type: [ExceptionSchema],
      default: [],
    },
    bufferTimeMinutes: {
      type: Number,
      default: 15,
      min: 0,
    },
    minBookingNoticeHours: {
      type: Number,
      default: 24,
      min: 0,
    },
    maxBookingAdvanceDays: {
      type: Number,
      default: 90,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserScheduleSchema.index({ userId: 1, isActive: 1 });

const UserSchedule: Model<IUserSchedule> =
  mongoose.models.UserSchedule ||
  mongoose.model<IUserSchedule>('UserSchedule', UserScheduleSchema);

export default UserSchedule;

