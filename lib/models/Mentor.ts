import mongoose, { Schema, Document, Model } from 'mongoose';

export type MentorStatus = 'active' | 'inactive' | 'pending_approval';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all';

export interface IMentor extends Document {
  userId: mongoose.Types.ObjectId;
  status: MentorStatus;
  bio?: string;
  specialties: string[]; // e.g., ['React', 'Node.js', 'Architecture', 'Code Review']
  experienceLevels: ExperienceLevel[]; // Levels they can teach
  hourlyRate?: number; // Optional hourly rate (if not using credits)
  rating?: number; // Average rating from students
  totalSessions: number; // Total sessions conducted
  totalStudents: number; // Unique students taught
  languages?: string[]; // Languages they speak
  timezone?: string; // e.g., 'America/New_York'
  availableForBooking: boolean;
  maxConcurrentSessions?: number; // Max sessions they can handle at once
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const MentorSchema = new Schema<IMentor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending_approval'],
      default: 'pending_approval',
      index: true,
    },
    bio: {
      type: String,
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
    },
    specialties: {
      type: [String],
      default: [],
      index: true,
    },
    experienceLevels: {
      type: [String],
      enum: ['beginner', 'intermediate', 'advanced', 'expert', 'all'],
      default: ['all'],
    },
    hourlyRate: {
      type: Number,
      min: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalSessions: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
      min: 0,
    },
    languages: {
      type: [String],
      default: ['en'], // Default to English
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    availableForBooking: {
      type: Boolean,
      default: true,
      index: true,
    },
    maxConcurrentSessions: {
      type: Number,
      default: 5,
      min: 1,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MentorSchema.index({ status: 1, availableForBooking: 1 });
MentorSchema.index({ specialties: 1 });
MentorSchema.index({ experienceLevels: 1 });

const Mentor: Model<IMentor> =
  mongoose.models.Mentor ||
  mongoose.model<IMentor>('Mentor', MentorSchema);

export default Mentor;

