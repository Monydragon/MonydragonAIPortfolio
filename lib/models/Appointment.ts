import mongoose, { Schema, Document, Model } from 'mongoose';

export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export type AppointmentType = 
  | 'code_review' 
  | 'architecture' 
  | 'prompt_advice' 
  | 'tailored_service' 
  | 'lesson' 
  | 'consultation'
  | 'other';

export interface IAppointment extends Document {
  studentId: mongoose.Types.ObjectId; // User booking the session
  mentorId?: mongoose.Types.ObjectId; // Mentor conducting the session (optional for some services)
  serviceTypeId: mongoose.Types.ObjectId; // Type of service
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: Date; // When the session is scheduled
  durationMinutes: number; // Duration of the session
  timezone: string; // Timezone for the appointment
  creditCost: number; // Credits charged for this appointment
  creditsCharged: boolean; // Whether credits have been charged
  meetingLink?: string; // Video call link (Zoom, Google Meet, etc.)
  meetingNotes?: string; // Notes from the session
  studentNotes?: string; // Pre-session notes from student
  rating?: number; // Rating given by student (1-5)
  feedback?: string; // Feedback from student
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId; // Who cancelled (student or mentor)
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    serviceTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceType',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['code_review', 'architecture', 'prompt_advice', 'tailored_service', 'lesson', 'consultation', 'other'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 15,
    },
    timezone: {
      type: String,
      required: true,
      default: 'UTC',
    },
    creditCost: {
      type: Number,
      required: true,
      min: 0,
    },
    creditsCharged: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
    },
    meetingNotes: {
      type: String,
      maxlength: [5000, 'Meeting notes cannot exceed 5000 characters'],
    },
    studentNotes: {
      type: String,
      maxlength: [2000, 'Student notes cannot exceed 2000 characters'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
    },
    cancellationReason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
AppointmentSchema.index({ studentId: 1, status: 1, scheduledAt: 1 });
AppointmentSchema.index({ mentorId: 1, status: 1, scheduledAt: 1 });
AppointmentSchema.index({ scheduledAt: 1, status: 1 });
AppointmentSchema.index({ serviceTypeId: 1 });

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;

