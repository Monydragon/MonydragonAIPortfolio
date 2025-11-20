import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  username: string;
  emailVerified?: Date | null;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  twoFactorBackupCodes?: string[];
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
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'guest'],
      default: 'user',
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
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  try {
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

