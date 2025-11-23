import mongoose, { Schema, Document, Model } from 'mongoose';

export type ServiceCategory = 
  | 'code_review' 
  | 'architecture' 
  | 'prompt_advice' 
  | 'tailored_service' 
  | 'lesson' 
  | 'consultation'
  | 'other';

export type ServiceLevel = 'mentored' | 'professional' | 'expert';

export interface IServiceType extends Document {
  name: string;
  description: string;
  category: ServiceCategory;
  level: ServiceLevel;
  creditCost: number; // Credits required for this service
  durationMinutes: number; // Expected duration in minutes
  suitableForLevels: ('beginner' | 'intermediate' | 'advanced' | 'expert' | 'all')[];
  requiresMentor: boolean; // Whether this service requires a mentor
  maxParticipants?: number; // For group sessions
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceTypeSchema = new Schema<IServiceType>(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: ['code_review', 'architecture', 'prompt_advice', 'tailored_service', 'lesson', 'consultation', 'other'],
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: ['mentored', 'professional', 'expert'],
      default: 'professional',
      index: true,
    },
    creditCost: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 15, // Minimum 15 minutes
      default: 60,
    },
    suitableForLevels: {
      type: [String],
      enum: ['beginner', 'intermediate', 'advanced', 'expert', 'all'],
      default: ['all'],
    },
    requiresMentor: {
      type: Boolean,
      default: true,
    },
    maxParticipants: {
      type: Number,
      min: 1,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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
ServiceTypeSchema.index({ category: 1, isActive: 1 });
ServiceTypeSchema.index({ level: 1, isActive: 1 });
ServiceTypeSchema.index({ suitableForLevels: 1 });

const ServiceType: Model<IServiceType> =
  mongoose.models.ServiceType ||
  mongoose.model<IServiceType>('ServiceType', ServiceTypeSchema);

export default ServiceType;

