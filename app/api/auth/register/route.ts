import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import VerificationToken from "@/lib/models/VerificationToken";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";

export async function POST(request: Request) {
	try {
		const { email, password, name } = await request.json();
		if (!email || !password || !name) {
			return NextResponse.json({ error: "Missing fields" }, { status: 400 });
		}

		await connectDB();

		const existing = await User.findOne({ email: email.toLowerCase() }).lean();
		if (existing) {
			return NextResponse.json({ error: "Email already in use" }, { status: 409 });
		}

		const user = new User({
			email: email.toLowerCase(),
			password,
			name,
			role: "user",
		});
		await user.save();

		// Create verification token
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
		await VerificationToken.create({
			userId: user._id,
			token,
			expiresAt,
		});

		const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";
		const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

		await sendMail({
			to: user.email,
			subject: "Verify your email",
			html: `<p>Welcome, ${user.name}!</p><p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">Verify Email</a></p><p>This link expires in 24 hours.</p>`,
		});

		return NextResponse.json({ success: true });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || "Registration failed" }, { status: 500 });
	}
}


