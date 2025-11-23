import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITermsOfService extends Document {
  version: string;
  content: string;
  effectiveDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITermsAcceptance extends Document {
  userId: mongoose.Types.ObjectId;
  termsVersion: string;
  acceptedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const TermsOfServiceSchema = new Schema<ITermsOfService>(
  {
    version: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const TermsAcceptanceSchema = new Schema<ITermsAcceptance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    termsVersion: {
      type: String,
      required: true,
    },
    acceptedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TermsAcceptanceSchema.index({ userId: 1, termsVersion: 1 });

const TermsOfService: Model<ITermsOfService> =
  mongoose.models.TermsOfService ||
  mongoose.model<ITermsOfService>('TermsOfService', TermsOfServiceSchema);

const TermsAcceptance: Model<ITermsAcceptance> =
  mongoose.models.TermsAcceptance ||
  mongoose.model<ITermsAcceptance>('TermsAcceptance', TermsAcceptanceSchema);

export { TermsAcceptance };
export default TermsOfService;

