import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import VerificationToken from "@/lib/models/VerificationToken";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const token = searchParams.get("token");
		
		if (!token) {
			return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
		}
		
		await connectDB();
		
		// Find token and check expiration
		const record = await VerificationToken.findOne({ token });
		if (!record) {
			return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
		}
		
		// Check if token is expired
		if (record.expiresAt < new Date()) {
			await VerificationToken.deleteOne({ _id: record._id });
			return NextResponse.redirect(new URL("/login?error=expired_token", request.url));
		}
		
		const user = await User.findById(record.userId);
		if (!user) {
			return NextResponse.redirect(new URL("/login?error=user_not_found", request.url));
		}
		
		// Verify email
		if (!user.emailVerified) {
			user.emailVerified = new Date();
			await user.save();
		}
		
		// Clean up token
		await VerificationToken.deleteOne({ _id: record._id });
		
		// Redirect to login with success message
		return NextResponse.redirect(new URL("/login?verified=1", request.url));
	} catch (error: any) {
		console.error("Email verification error:", error);
		return NextResponse.redirect(new URL("/login?error=verification_failed", request.url));
	}
}


