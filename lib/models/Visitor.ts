import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVisitor extends Document {
  ip: string;
  userAgent?: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  path: string;
  referer?: string;
  sessionId?: string;
  userId?: mongoose.Types.ObjectId;
  isNewSession: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    ip: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
    },
    country: {
      type: String,
      index: true,
    },
    region: {
      type: String,
    },
    city: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    timezone: {
      type: String,
    },
    path: {
      type: String,
      required: true,
      index: true,
    },
    referer: {
      type: String,
    },
    sessionId: {
      type: String,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    isNewSession: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
VisitorSchema.index({ createdAt: -1 });
VisitorSchema.index({ path: 1, createdAt: -1 });
VisitorSchema.index({ country: 1, createdAt: -1 });
VisitorSchema.index({ userId: 1, createdAt: -1 });

const Visitor: Model<IVisitor> =
  mongoose.models.Visitor ||
  mongoose.model<IVisitor>('Visitor', VisitorSchema);

export default Visitor;

