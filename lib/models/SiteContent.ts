import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteContent extends Document {
  key: string; // e.g., 'about_summary', 'about_story', 'skills', etc.
  content: any; // Flexible content structure
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    key: {
      type: String,
      required: [true, 'Key is required'],
      unique: true,
      trim: true,
    },
    content: {
      type: Schema.Types.Mixed,
      required: [true, 'Content is required'],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

SiteContentSchema.index({ key: 1 });

const SiteContent: Model<ISiteContent> = mongoose.models.SiteContent || mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);

export default SiteContent;

