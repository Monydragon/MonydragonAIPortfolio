import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransactionType = 'earned' | 'purchased' | 'used' | 'refunded' | 'bonus';
export type TransactionSource = 'free_tier' | 'subscription' | 'purchase' | 'referral' | 'promotion' | 'app_development' | 'refund' | 'mentorship' | 'service';

export interface ICreditTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number; // Positive for earned/purchased, negative for used
  balanceAfter: number; // User's credit balance after this transaction
  source: TransactionSource;
  description: string;
  projectId?: mongoose.Types.ObjectId; // If related to a project
  paymentId?: mongoose.Types.ObjectId; // If related to a payment
  subscriptionId?: mongoose.Types.ObjectId; // If related to a subscription
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['earned', 'purchased', 'used', 'refunded', 'bonus'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      enum: ['free_tier', 'subscription', 'purchase', 'referral', 'promotion', 'app_development', 'refund', 'mentorship', 'service'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'AppBuilderProject',
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
CreditTransactionSchema.index({ userId: 1, createdAt: -1 });
CreditTransactionSchema.index({ projectId: 1 });
CreditTransactionSchema.index({ paymentId: 1 });
CreditTransactionSchema.index({ subscriptionId: 1 });

const CreditTransaction: Model<ICreditTransaction> =
  mongoose.models.CreditTransaction ||
  mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema);

export default CreditTransaction;

