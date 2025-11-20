import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import PasswordResetToken from "@/lib/models/PasswordResetToken";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { token, password } = await request.json();
		if (!token || !password) {
			return NextResponse.json({ error: "Missing fields" }, { status: 400 });
		}
		await connectDB();
		const record = await PasswordResetToken.findOne({ token, used: false });
		if (!record) {
			return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
		}
		if (record.expiresAt.getTime() < Date.now()) {
			return NextResponse.json({ error: "Token expired" }, { status: 400 });
		}
		const user = await User.findById(record.userId).select("+password +twoFactorSecret +twoFactorBackupCodes");
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		user.password = password;
		// Best practice: disabling 2FA after a password reset via emailed token
		user.twoFactorEnabled = false;
		user.twoFactorSecret = null;
		user.twoFactorBackupCodes = [];
		await user.save();

		record.used = true;
		await record.save();

		return NextResponse.json({ success: true });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || "Failed to reset password" }, { status: 500 });
	}
}


