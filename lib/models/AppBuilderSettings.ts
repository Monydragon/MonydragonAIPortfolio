import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAppBuilderSettings extends Document {
  enabled: boolean; // Master toggle for app requests
  freeTier: {
    credits: number;
    creditsPerMonth: number;
    responseTime: string; // e.g., "up to 2 weeks"
    features: string[];
  };
  starterTier: {
    monthlyPrice: number;
    creditsPerMonth: number;
    responseTime: string; // e.g., "up to 2 weeks" or "Standard response"
    additionalCreditPrice: number;
    features: string[];
  };
  professionalTier: {
    monthlyPrice: number;
    creditsPerMonth: number;
    responseTime: string; // e.g., "24 hours to 1 week (priority)"
    additionalCreditPrice: number;
    features: string[];
  };
  enterpriseTier: {
    monthlyPrice: number;
    creditsPerMonth: number;
    responseTime: string;
    additionalCreditPrice: number;
    features: string[];
  };
  referralCredits: number; // Credits given for each referral
  kickoffMeetingEnabled: boolean;
  kickoffMeetingPrice: number; // Price for kickoff meeting
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AppBuilderSettingsSchema = new Schema<IAppBuilderSettings>(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    freeTier: {
      credits: {
        type: Number,
        default: 100,
      },
      creditsPerMonth: {
        type: Number,
        default: 50,
      },
      responseTime: {
        type: String,
        default: 'Up to 2 weeks',
      },
      features: {
        type: [String],
        default: [],
      },
    },
    starterTier: {
      monthlyPrice: {
        type: Number,
        default: 20,
      },
      creditsPerMonth: {
        type: Number,
        default: 200,
      },
      responseTime: {
        type: String,
        default: 'Standard response (up to 2 weeks)',
      },
      additionalCreditPrice: {
        type: Number,
        default: 0.05,
      },
      features: {
        type: [String],
        default: [],
      },
    },
    professionalTier: {
      monthlyPrice: {
        type: Number,
        default: 100,
      },
      creditsPerMonth: {
        type: Number,
        default: 2500,
      },
      responseTime: {
        type: String,
        default: 'Priority (24 hours to 1 week)',
      },
      additionalCreditPrice: {
        type: Number,
        default: 0.04,
      },
      features: {
        type: [String],
        default: [],
      },
    },
    enterpriseTier: {
      monthlyPrice: {
        type: Number,
        default: 500,
      },
      creditsPerMonth: {
        type: Number,
        default: 15000,
      },
      responseTime: {
        type: String,
        default: 'Priority (24 hours to 1 week)',
      },
      additionalCreditPrice: {
        type: Number,
        default: 0.03,
      },
      features: {
        type: [String],
        default: [],
      },
    },
    referralCredits: {
      type: Number,
      default: 100,
    },
    kickoffMeetingEnabled: {
      type: Boolean,
      default: true,
    },
    kickoffMeetingPrice: {
      type: Number,
      default: 50,
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

// Only allow one settings document
AppBuilderSettingsSchema.index({}, { unique: true });

const AppBuilderSettings: Model<IAppBuilderSettings> =
  mongoose.models.AppBuilderSettings ||
  mongoose.model<IAppBuilderSettings>('AppBuilderSettings', AppBuilderSettingsSchema);

export default AppBuilderSettings;

