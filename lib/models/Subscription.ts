import mongoose, { Schema, Document, Model } from 'mongoose';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';
export type SubscriptionTier = 'starter' | 'professional' | 'enterprise' | 'custom';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  monthlyPrice: number;
  creditsPerMonth: number; // Credits included in subscription
  additionalCreditPrice?: number; // Price per additional credit token
  startDate: Date;
  endDate?: Date;
  nextBillingDate?: Date;
  cancelledAt?: Date;
  paymentMethodId?: string; // Payment processor method ID
  paymentProcessor: string; // paypal, stripe, etc.
  externalSubscriptionId?: string; // ID from payment processor
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ['starter', 'professional', 'enterprise', 'custom'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'pending'],
      default: 'pending',
    },
    monthlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    creditsPerMonth: {
      type: Number,
      required: true,
      min: 0,
    },
    additionalCreditPrice: {
      type: Number,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    nextBillingDate: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    paymentMethodId: {
      type: String,
    },
    paymentProcessor: {
      type: String,
      required: true,
      default: 'paypal',
    },
    externalSubscriptionId: {
      type: String,
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
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ externalSubscriptionId: 1 });
SubscriptionSchema.index({ nextBillingDate: 1 });

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;

