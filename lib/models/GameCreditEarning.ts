import mongoose, { Schema, Document, Model } from 'mongoose';

export type EarningType = 'playtime' | 'achievement' | 'milestone' | 'daily_login' | 'completion';
export type EarningStatus = 'pending' | 'completed' | 'claimed' | 'expired';

export interface IGameCreditEarning extends Document {
  gameId: mongoose.Types.ObjectId; // Reference to game/project
  gameTitle: string; // Cached game title
  userId: mongoose.Types.ObjectId;
  type: EarningType;
  status: EarningStatus;
  creditsAwarded: number;
  requirement: {
    playtimeHours?: number; // For playtime-based earnings
    achievementId?: string; // For achievement-based earnings
    milestone?: string; // For milestone-based earnings
    description: string; // Human-readable requirement
  };
  progress: {
    current: number; // Current progress (e.g., hours played)
    target: number; // Target to reach
    percentage: number; // 0-100
  };
  completedAt?: Date;
  claimedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const GameCreditEarningSchema = new Schema<IGameCreditEarning>(
  {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Project', // Using Project model for games
      required: true,
      index: true,
    },
    gameTitle: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['playtime', 'achievement', 'milestone', 'daily_login', 'completion'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'claimed', 'expired'],
      default: 'pending',
    },
    creditsAwarded: {
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
    progress: {
      current: {
        type: Number,
        default: 0,
        min: 0,
      },
      target: {
        type: Number,
        required: true,
        min: 0,
      },
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    completedAt: {
      type: Date,
    },
    claimedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
GameCreditEarningSchema.index({ userId: 1, status: 1 });
GameCreditEarningSchema.index({ gameId: 1, userId: 1 });
GameCreditEarningSchema.index({ status: 1, expiresAt: 1 });

const GameCreditEarning: Model<IGameCreditEarning> =
  mongoose.models.GameCreditEarning ||
  mongoose.model<IGameCreditEarning>('GameCreditEarning', GameCreditEarningSchema);

export default GameCreditEarning;

