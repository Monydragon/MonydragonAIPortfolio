import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import VerificationToken from "@/lib/models/VerificationToken";
import SiteConfig from "@/lib/models/SiteConfig";
import InviteCode from "@/lib/models/InviteCode";
import Referral from "@/lib/models/Referral";
import AppBuilderSettings from "@/lib/models/AppBuilderSettings";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";
import creditService from "@/lib/services/credit-service";
import roleAssignmentService from "@/lib/services/role-assignment-service";

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
			referralCode,
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
			phone: phone || undefined,
			location: location || undefined,
			demographics: demographics || undefined,
			creditBalance: 0, // Will be set by credit service
		});
		await user.save();

		// Assign default role
		await roleAssignmentService.ensureUserRoles(user._id);

		// Give new users free credits
		const freeCredits = parseInt(process.env.APP_BUILDER_FREE_CREDITS || '100');
		if (freeCredits > 0) {
			await creditService.giveFreeCredits(
				user._id,
				freeCredits,
				'Welcome bonus - Free credits to get started with App Builder'
			);
		}

		// Handle referral code
		if (referralCode) {
			try {
				const referralCodeUpper = String(referralCode).toUpperCase().trim();
				// Find user by referral code (username or user ID)
				const referrer = await User.findOne({
					$or: [
						{ username: referralCodeUpper.toLowerCase() },
						{ _id: referralCodeUpper },
					],
				});

				if (referrer && referrer._id.toString() !== user._id.toString()) {
					// Get referral credits from settings
					const settings = await AppBuilderSettings.findOne();
					const referralCredits = settings?.referralCredits || parseInt(process.env.APP_BUILDER_REFERRAL_CREDITS || '100');

					// Create referral record
					await Referral.create({
						referrerId: referrer._id,
						referredId: user._id,
						referralCode: referralCodeUpper,
						creditsAwarded: referralCredits,
						status: 'completed',
						completedAt: new Date(),
					});

					// Award credits to both users
					await creditService.addCredits({
						userId: referrer._id,
						amount: referralCredits,
						type: 'earned',
						source: 'referral',
						description: `Referral bonus: ${user.name} signed up using your code`,
						metadata: { referredUserId: user._id.toString() },
					});

					await creditService.addCredits({
						userId: user._id,
						amount: referralCredits,
						type: 'earned',
						source: 'referral',
						description: `Referral signup bonus`,
						metadata: { referrerId: referrer._id.toString() },
					});
				}
			} catch (refError) {
				console.error('Error processing referral:', refError);
				// Don't fail registration if referral fails
			}
		}

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


