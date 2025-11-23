import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOfferClaim extends Document {
  userId: mongoose.Types.ObjectId;
  offerId: mongoose.Types.ObjectId;
  status: 'pending' | 'completed' | 'claimed';
  creditsAwarded: number;
  completedAt?: Date;
  claimedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const OfferClaimSchema = new Schema<IOfferClaim>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: 'Offer',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'claimed'],
      default: 'pending',
    },
    creditsAwarded: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
    claimedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate claims
OfferClaimSchema.index({ userId: 1, offerId: 1 }, { unique: true });

const OfferClaim: Model<IOfferClaim> =
  mongoose.models.OfferClaim ||
  mongoose.model<IOfferClaim>('OfferClaim', OfferClaimSchema);

export default OfferClaim;

