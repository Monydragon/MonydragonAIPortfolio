import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISkillCategory extends Document {
  value: string; // machine key, e.g. "languages"
  label: string; // display label, e.g. "Languages"
  color?: string; // tailwind color name, e.g. "blue"
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillCategorySchema = new Schema<ISkillCategory>(
  {
    value: {
      type: String,
      required: [true, 'Category value is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: [true, 'Category label is required'],
      trim: true,
    },
    color: {
      type: String,
      default: 'blue',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

SkillCategorySchema.index({ order: 1 });

const SkillCategory: Model<ISkillCategory> =
  mongoose.models.SkillCategory || mongoose.model<ISkillCategory>('SkillCategory', SkillCategorySchema);

export default SkillCategory;


