import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId; // User who referred
  referredId: mongoose.Types.ObjectId; // User who was referred
  referralCode: string; // Unique referral code
  creditsAwarded: number;
  status: 'pending' | 'completed' | 'cancelled';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referredId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      index: true,
    },
    creditsAwarded: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReferralSchema.index({ referrerId: 1, status: 1 });
ReferralSchema.index({ referredId: 1 });

const Referral: Model<IReferral> =
  mongoose.models.Referral ||
  mongoose.model<IReferral>('Referral', ReferralSchema);

export default Referral;

