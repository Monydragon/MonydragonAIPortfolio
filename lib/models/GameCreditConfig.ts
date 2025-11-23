import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGameCreditConfig extends Document {
  gameId: mongoose.Types.ObjectId; // Reference to Project
  gameTitle: string;
  enabled: boolean;
  developerId: mongoose.Types.ObjectId; // User who configured this
  earningRules: Array<{
    type: 'playtime' | 'achievement' | 'milestone' | 'daily_login' | 'completion';
    credits: number;
    requirement: {
      playtimeHours?: number;
      achievementId?: string;
      milestone?: string;
      description: string;
    };
    maxClaims?: number; // Maximum times this can be claimed (null = unlimited)
    cooldownHours?: number; // Hours before can claim again
  }>;
  totalCreditsDistributed: number;
  totalPlayers: number;
  createdAt: Date;
  updatedAt: Date;
}

const GameCreditConfigSchema = new Schema<IGameCreditConfig>(
  {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true,
      index: true,
    },
    gameTitle: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    developerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    earningRules: {
      type: [
        {
          type: {
            type: String,
            enum: ['playtime', 'achievement', 'milestone', 'daily_login', 'completion'],
            required: true,
          },
          credits: {
            type: Number,
            required: true,
            min: 0,
          },
          requirement: {
            playtimeHours: Number,
            achievementId: String,
            milestone: String,
            description: {
              type: String,
              required: true,
            },
          },
          maxClaims: Number,
          cooldownHours: Number,
        },
      ],
      default: [],
    },
    totalCreditsDistributed: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPlayers: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
GameCreditConfigSchema.index({ developerId: 1, enabled: 1 });
GameCreditConfigSchema.index({ enabled: 1 });

const GameCreditConfig: Model<IGameCreditConfig> =
  mongoose.models.GameCreditConfig ||
  mongoose.model<IGameCreditConfig>('GameCreditConfig', GameCreditConfigSchema);

export default GameCreditConfig;

