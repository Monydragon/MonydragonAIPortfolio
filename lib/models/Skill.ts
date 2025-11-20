import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: 'languages' | 'frameworks' | 'tools' | 'ai' | 'development' | 'architecture';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['languages', 'frameworks', 'tools', 'ai', 'development', 'architecture'],
      required: [true, 'Category is required'],
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

SkillSchema.index({ category: 1, order: 1 });

const Skill: Model<ISkill> = mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);

export default Skill;

