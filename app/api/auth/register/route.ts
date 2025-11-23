import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import VerificationToken from "@/lib/models/VerificationToken";
import SiteConfig from "@/lib/models/SiteConfig";
import InviteCode from "@/lib/models/InviteCode";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";

export async function POST(request: Request) {
	try {
		const {
			email,
			password,
			firstName,
			lastName,
			middleName,
			username,
			phone,
			location,
			demographics,
			inviteCode,
		} = await request.json();

		if (!email || !password || !firstName || !lastName) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		await connectDB();

		// Registration mode gating
		let registrationMode: "open" | "closed" | "invite-only" = "open";
		const config = await SiteConfig.findOne();
		if (config) {
			registrationMode = config.registrationMode as any;
		}

		if (registrationMode === "closed") {
			return NextResponse.json({ error: "Registration is currently disabled" }, { status: 403 });
		}

		if (registrationMode === "invite-only") {
			if (!inviteCode) {
				return NextResponse.json({ error: "An invite code is required to register" }, { status: 403 });
			}

			const codeDoc = await InviteCode.findOne({ code: String(inviteCode).toUpperCase().trim() });
			const now = new Date();
			if (
				!codeDoc ||
				!codeDoc.active ||
				(codeDoc.expiresAt && codeDoc.expiresAt < now) ||
				codeDoc.usedCount >= codeDoc.maxUses
			) {
				return NextResponse.json({ error: "Invalid or expired invite code" }, { status: 403 });
			}

			codeDoc.usedCount += 1;
			if (codeDoc.usedCount >= codeDoc.maxUses) {
				codeDoc.active = false;
			}
			await codeDoc.save();
		}

		const existing = await User.findOne({ email: email.toLowerCase() }).lean();
		if (existing) {
			return NextResponse.json({ error: "Email already in use" }, { status: 409 });
		}

		const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ").trim();

		const user = new User({
			email: email.toLowerCase(),
			password,
			firstName,
			middleName: middleName || undefined,
			lastName,
			name: fullName,
			username: username || undefined,
			role: "user",
			phone: phone || undefined,
			location: location || undefined,
			demographics: demographics || undefined,
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


