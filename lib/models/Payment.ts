import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentType = 'one_time' | 'subscription' | 'credits';
export type PaymentProcessor = 'paypal' | 'stripe' | 'other';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  type: PaymentType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  processor: PaymentProcessor;
  externalPaymentId?: string; // ID from payment processor
  externalOrderId?: string; // Order ID from payment processor
  creditsPurchased?: number; // If purchasing credits
  subscriptionId?: mongoose.Types.ObjectId; // If subscription payment
  projectId?: mongoose.Types.ObjectId; // If project payment
  description: string;
  metadata?: Record<string, any>;
  processedAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['one_time', 'subscription', 'credits'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
    },
    processor: {
      type: String,
      enum: ['paypal', 'stripe', 'other'],
      required: true,
      default: 'paypal',
    },
    externalPaymentId: {
      type: String,
      index: true,
    },
    externalOrderId: {
      type: String,
      index: true,
    },
    creditsPurchased: {
      type: Number,
      min: 0,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'AppBuilderProject',
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    processedAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ externalPaymentId: 1 });
PaymentSchema.index({ externalOrderId: 1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment ||
  mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;

