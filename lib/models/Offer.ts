import mongoose, { Schema, Document, Model } from 'mongoose';

export type OfferType = 'game' | 'app' | 'website' | 'other';
export type OfferStatus = 'active' | 'inactive' | 'expired';

export interface IOffer extends Document {
  title: string;
  description: string;
  type: OfferType;
  url: string;
  creditsReward: number;
  status: OfferStatus;
  requirements?: {
    playtimeMinutes?: number;
    achievement?: string;
    milestone?: string;
    description: string;
  };
  developerId?: mongoose.Types.ObjectId; // If created by a developer
  expiresAt?: Date;
  maxClaims?: number; // Maximum number of times this can be claimed
  currentClaims: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['game', 'app', 'website', 'other'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    creditsReward: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
    requirements: {
      playtimeMinutes: Number,
      achievement: String,
      milestone: String,
      description: String,
    },
    developerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    expiresAt: {
      type: Date,
    },
    maxClaims: {
      type: Number,
    },
    currentClaims: {
      type: Number,
      default: 0,
      min: 0,
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
OfferSchema.index({ status: 1, type: 1 });
OfferSchema.index({ developerId: 1 });

const Offer: Model<IOffer> =
  mongoose.models.Offer ||
  mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;

