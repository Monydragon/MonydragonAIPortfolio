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

		const user = await User.findById((session.user as any).id).select("+twoFactorSecret +twoFactorBackupCodes");
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		user.twoFactorEnabled = false;
		user.twoFactorSecret = null;
		user.twoFactorBackupCodes = [];
		await user.save();

		return NextResponse.json({ success: true });
	} catch (err: any) {
		const message = err?.message || "Failed to disable 2FA";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}


