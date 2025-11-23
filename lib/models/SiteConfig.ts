import mongoose, { Schema, Document, Model } from "mongoose";

export type RegistrationMode = "open" | "closed" | "invite-only";

export interface ISiteConfig extends Document {
  registrationMode: RegistrationMode;
  createdAt: Date;
  updatedAt: Date;
}

const SiteConfigSchema = new Schema<ISiteConfig>(
  {
    registrationMode: {
      type: String,
      enum: ["open", "closed", "invite-only"],
      default: "open",
    },
  },
  {
    timestamps: true,
  },
);

const SiteConfig: Model<ISiteConfig> =
  mongoose.models.SiteConfig || mongoose.model<ISiteConfig>("SiteConfig", SiteConfigSchema);

export default SiteConfig;


