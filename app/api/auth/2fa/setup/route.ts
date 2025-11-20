import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export async function POST() {
	try {
		const session = await auth();
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Lazy load to avoid hard dependency if not installed yet
		// eslint-disable-next-line
		const speakeasy = require("speakeasy");
		// eslint-disable-next-line
		const QRCode = require("qrcode");

		const user = await User.findById((session.user as any).id);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const secret = speakeasy.generateSecret({
			name: `Monydragon (${user.email})`,
			length: 32,
		});

		// Store temp secret until verified
		user.twoFactorSecret = secret.base32;
		await user.save();

		const otpauthUrl = secret.otpauth_url;
		const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

		return NextResponse.json({
			otpauthUrl,
			qrDataUrl,
			secret: secret.base32,
		});
	} catch (err: any) {
		const message = err?.message || "Failed to setup 2FA";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}


