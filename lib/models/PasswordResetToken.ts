import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPasswordResetToken extends Document {
	userId: mongoose.Types.ObjectId;
	token: string;
	expiresAt: Date;
	used: boolean;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		token: { type: String, required: true, unique: true },
		expiresAt: { type: Date, required: true },
		used: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken: Model<IPasswordResetToken> =
	mongoose.models.PasswordResetToken ||
	mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);

export default PasswordResetToken;


