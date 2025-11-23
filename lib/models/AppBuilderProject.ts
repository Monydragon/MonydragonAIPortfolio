import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentType = 'per_hour' | 'per_project' | 'subscription' | 'credits';
export type ProjectStatus = 'draft' | 'in_progress' | 'review' | 'completed' | 'cancelled';

export interface IAppBuilderProject extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  appType: string; // web, mobile, desktop, etc.
  features: string[];
  requirements: string;
  paymentType: PaymentType;
  estimatedHours?: number;
  estimatedCost?: number;
  creditsUsed: number;
  tokensUsed: number;
  selectedModel?: string; // LLM model selected
  modelProvider?: string; // ollama, openai, anthropic, google
  generatedCode?: string;
  generatedFiles?: Array<{
    filename: string;
    content: string;
    type: string;
  }>;
  status: ProjectStatus;
  professionalNotes?: string;
  clientFeedback?: string;
  termsAccepted: boolean;
  termsAcceptedAt?: Date;
  // Questionnaire data
  questionnaireData?: {
    budget?: string;
    timeline?: string;
    complexity?: string;
    techStack?: string[];
    targetAudience?: string;
    platform?: string[];
    integrations?: string[];
    customQuestions?: Record<string, any>;
  };
  // Project details
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  complexity?: 'simple' | 'medium' | 'complex' | 'enterprise';
  techStack?: string[]; // Determined through creation
  queuePosition?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  // Kickoff meeting
  kickoffMeetingRequested?: boolean;
  kickoffMeetingScheduled?: Date;
  kickoffMeetingCompleted?: boolean;
  kickoffMeetingNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppBuilderProjectSchema = new Schema<IAppBuilderProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    appType: {
      type: String,
      required: true,
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    requirements: {
      type: String,
      default: '',
    },
    paymentType: {
      type: String,
      enum: ['per_hour', 'per_project', 'subscription', 'credits'],
      required: true,
    },
    estimatedHours: {
      type: Number,
      min: 0,
    },
    estimatedCost: {
      type: Number,
      min: 0,
    },
    creditsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    tokensUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    selectedModel: {
      type: String,
    },
    modelProvider: {
      type: String,
      enum: ['ollama', 'openai', 'anthropic', 'google', 'local'],
    },
    generatedCode: {
      type: String,
    },
    generatedFiles: {
      type: [
        {
          filename: String,
          content: String,
          type: String,
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'in_progress', 'review', 'completed', 'cancelled'],
      default: 'draft',
    },
    professionalNotes: {
      type: String,
    },
    clientFeedback: {
      type: String,
    },
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    termsAcceptedAt: {
      type: Date,
    },
    questionnaireData: {
      budget: String,
      timeline: String,
      complexity: String,
      techStack: [String],
      targetAudience: String,
      platform: [String],
      integrations: [String],
      customQuestions: Schema.Types.Mixed,
    },
    size: {
      type: String,
      enum: ['small', 'medium', 'large', 'enterprise'],
    },
    complexity: {
      type: String,
      enum: ['simple', 'medium', 'complex', 'enterprise'],
    },
    techStack: {
      type: [String],
      default: [],
    },
    queuePosition: {
      type: Number,
      min: 0,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    kickoffMeetingRequested: {
      type: Boolean,
      default: false,
    },
    kickoffMeetingScheduled: {
      type: Date,
    },
    kickoffMeetingCompleted: {
      type: Boolean,
      default: false,
    },
    kickoffMeetingNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
AppBuilderProjectSchema.index({ userId: 1, createdAt: -1 });
AppBuilderProjectSchema.index({ status: 1 });
AppBuilderProjectSchema.index({ queuePosition: 1, priority: 1 });
AppBuilderProjectSchema.index({ status: 1, queuePosition: 1 });

const AppBuilderProject: Model<IAppBuilderProject> =
  mongoose.models.AppBuilderProject ||
  mongoose.model<IAppBuilderProject>('AppBuilderProject', AppBuilderProjectSchema);

export default AppBuilderProject;

