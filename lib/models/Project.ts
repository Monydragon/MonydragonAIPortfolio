import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  longDescription?: string;
  category: 'unity-asset' | 'rpgmaker-plugin' | 'game' | 'web' | 'other';
  technologies: string[];
  platforms: string[];
  links: Array<{
    type: string;
    label: string;
    url: string;
  }>;
  featured: boolean;
  tags: string[];
  coverImage?: string;
  images?: string[];
  githubUrl?: string;
  liveUrl?: string;
  order: number;
  notes?: string[];
  jam?: {
    name: string;
    url?: string;
    year?: string;
  };
  releasedOn?: Date;
  sortPriority?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    longDescription: {
      type: String,
    },
    category: {
      type: String,
      enum: ['unity-asset', 'rpgmaker-plugin', 'game', 'web', 'other'],
      required: true,
      index: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
    platforms: {
      type: [String],
      default: [],
    },
    links: {
      type: [
        {
          type: { type: String, required: true },
          label: { type: String, required: true },
          url: { type: String, required: true },
        },
      ],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    coverImage: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    githubUrl: {
      type: String,
    },
    liveUrl: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    notes: {
      type: [String],
      default: [],
    },
    jam: {
      name: String,
      url: String,
      year: String,
    },
    releasedOn: {
      type: Date,
      index: true,
    },
    sortPriority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ category: 1, featured: 1, sortPriority: -1 });
ProjectSchema.index({ tags: 1, featured: 1 });

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;

