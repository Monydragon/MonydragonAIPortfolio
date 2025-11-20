import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import VerificationToken from "@/lib/models/VerificationToken";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const token = searchParams.get("token");
	if (!token) {
		return NextResponse.json({ error: "Missing token" }, { status: 400 });
	}
	await connectDB();
	const record = await VerificationToken.findOne({ token });
	if (!record) {
		return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
	}
	const user = await User.findById(record.userId);
	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}
	user.emailVerified = new Date();
	await user.save();
	await VerificationToken.deleteOne({ _id: record._id });
	return NextResponse.redirect(new URL("/login?verified=1", request.url));
}


