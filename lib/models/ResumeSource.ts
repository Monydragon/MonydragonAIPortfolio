import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResumeSource extends Document {
  name: string;
  rawText: string;
  // Parsed skills by category key (e.g. languages, frameworks, tools, ai, other)
  skillsByCategory: Record<string, string[]>;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSourceSchema = new Schema<IResumeSource>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    rawText: {
      type: String,
      required: [true, "Resume text is required"],
      trim: true,
    },
    skillsByCategory: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

const ResumeSource: Model<IResumeSource> =
  mongoose.models.ResumeSource ||
  mongoose.model<IResumeSource>("ResumeSource", ResumeSourceSchema);

export default ResumeSource;


