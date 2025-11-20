import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVerificationToken extends Document {
	userId: mongoose.Types.ObjectId;
	token: string;
	expiresAt: Date;
}

const VerificationTokenSchema = new Schema<IVerificationToken>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		token: { type: String, required: true, unique: true },
		expiresAt: { type: Date, required: true },
	},
	{ timestamps: true }
);

VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const VerificationToken: Model<IVerificationToken> =
	mongoose.models.VerificationToken ||
	mongoose.model<IVerificationToken>('VerificationToken', VerificationTokenSchema);

export default VerificationToken;


