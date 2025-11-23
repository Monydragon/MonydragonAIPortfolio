import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInviteCode extends Document {
  code: string;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InviteCodeSchema = new Schema<IInviteCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    maxUses: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

InviteCodeSchema.index({ code: 1 });
InviteCodeSchema.index({ active: 1, expiresAt: 1 });

const InviteCode: Model<IInviteCode> =
  mongoose.models.InviteCode || mongoose.model<IInviteCode>("InviteCode", InviteCodeSchema);

export default InviteCode;


