import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import VerificationToken from "@/lib/models/VerificationToken";
import { sendMail } from "@/lib/mailer";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, message: "Email already verified" });
    }

    // Remove existing tokens for this user
    await VerificationToken.deleteMany({ userId: user._id });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await VerificationToken.create({
      userId: user._id,
      token,
      expiresAt,
    });

    const baseUrl =
      process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

    await sendMail({
      to: user.email,
      subject: "Verify your email",
      html: `<p>Hello, ${user.name || user.email}!</p><p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">Verify Email</a></p><p>This link expires in 24 hours.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to resend verification" },
      { status: 500 },
    );
  }
}


