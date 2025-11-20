import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const session = await auth();
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();
		// eslint-disable-next-line
		const speakeasy = require("speakeasy");

		const { code } = await request.json();
		if (!code) {
			return NextResponse.json({ error: "Missing code" }, { status: 400 });
		}

		const user = await User.findById((session.user as any).id).select("+twoFactorSecret");
		if (!user || !user.twoFactorSecret) {
			return NextResponse.json({ error: "2FA not initialized" }, { status: 400 });
		}

		const verified = speakeasy.totp.verify({
			secret: user.twoFactorSecret,
			encoding: "base32",
			token: String(code),
			window: 1,
		});

		if (!verified) {
			return NextResponse.json({ error: "Invalid code" }, { status: 400 });
		}

		user.twoFactorEnabled = true;
		await user.save();

		return NextResponse.json({ success: true });
	} catch (err: any) {
		const message = err?.message || "Failed to verify 2FA";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}


