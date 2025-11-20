import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import PasswordResetToken from "@/lib/models/PasswordResetToken";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";

export async function POST(request: Request) {
	try {
		const { email } = await request.json();
		if (!email) {
			return NextResponse.json({ error: "Missing email" }, { status: 400 });
		}
		await connectDB();
		const user = await User.findOne({ email: email.toLowerCase() }).lean();
		// Always respond success to prevent user enumeration
		if (!user) {
			return NextResponse.json({ success: true });
		}
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 mins
		await PasswordResetToken.create({
			userId: user._id,
			token,
			expiresAt,
			used: false,
		});

		const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";
		const resetUrl = `${baseUrl}/reset-password?token=${token}`;

		await sendMail({
			to: email.toLowerCase(),
			subject: "Password reset",
			html: `<p>Use the link below to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p><p>This link expires in 30 minutes.</p>`,
		});

		return NextResponse.json({ success: true });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || "Failed to request reset" }, { status: 500 });
	}
}


