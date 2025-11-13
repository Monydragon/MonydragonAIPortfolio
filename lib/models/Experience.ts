import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string[];
  technologies?: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: String,
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: [String],
      required: [true, 'Description is required'],
    },
    technologies: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ExperienceSchema.index({ order: -1, startDate: -1 });

const Experience: Model<IExperience> = mongoose.models.Experience || mongoose.model<IExperience>('Experience', ExperienceSchema);

export default Experience;

