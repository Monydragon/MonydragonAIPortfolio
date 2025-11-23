import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  roles: mongoose.Types.ObjectId[]; // Multiple roles (permission system)
  username: string;
  phone?: string;
  location?: string;
  demographics?: string;
  emailVerified?: Date | null;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  twoFactorBackupCodes?: string[];
  creditBalance: number; // Cached credit balance (calculated from transactions)
  lastCreditUpdate?: Date; // Last time credit balance was updated
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert'; // User's experience level
  timezone?: string; // User's timezone
  bio?: string; // User bio/profile description
  avatar?: string; // Avatar URL
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true, // allow existing users without username
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    roles: {
      type: [Schema.Types.ObjectId],
      ref: 'Role',
      default: [],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    demographics: {
      type: String,
      trim: true,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: null,
      select: false,
    },
    twoFactorBackupCodes: {
      type: [String],
      default: undefined,
      select: false,
    },
    creditBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastCreditUpdate: {
      type: Date,
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    bio: {
      type: String,
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  try {
    // Ensure display name from first/last if not manually set
    if (!this.name && (this.firstName || this.lastName)) {
      const parts = [this.firstName, this.middleName, this.lastName].filter(Boolean);
      this.name = parts.join(' ').trim();
    }

    // Auto-generate username from email if missing
    if (!this.username && this.email) {
      const base = this.email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
      let candidate = base || `user${Math.floor(Math.random() * 10000)}`;
      let suffix = 0;
      // Ensure uniqueness
      // Use model to check existence; 'this' may not have model method in TS types, so cast
      const ModelRef = (this as any).constructor as Model<IUser>;
      // Loop with small upper bound for safety
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const exists = await ModelRef.findOne({ username: candidate }).select('_id').lean();
        if (!exists) break;
        suffix += 1;
        candidate = `${base}${suffix}`;
      }
      this.username = candidate;
    }

    // Note: Role assignment is handled by roleAssignmentService
    // This keeps the pre-save hook lightweight and avoids circular dependencies

    // Hash password if modified
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

