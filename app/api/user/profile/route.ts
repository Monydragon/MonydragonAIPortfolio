import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import VerificationToken from "@/lib/models/VerificationToken";
import { sendMail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      firstName,
      middleName,
      lastName,
      username,
      email,
      phone,
      location,
      demographics,
    } = body;

    if (firstName) user.firstName = firstName;
    if (typeof middleName === "string") user.middleName = middleName || undefined;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone || undefined;
    if (location !== undefined) user.location = location || undefined;
    if (demographics !== undefined) user.demographics = demographics || undefined;

    if (firstName || middleName || lastName) {
      const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
      user.name = parts.join(" ").trim();
    }

    if (username) {
      const existingUsername = await User.findOne({
        _id: { $ne: user._id },
        username: username.toLowerCase(),
      }).select("_id");
      if (existingUsername) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
      user.username = username.toLowerCase();
    }

    let emailChanged = false;
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existingEmail = await User.findOne({
        _id: { $ne: user._id },
        email: email.toLowerCase(),
      }).select("_id");
      if (existingEmail) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }

      user.email = email.toLowerCase();
      user.emailVerified = null;
      emailChanged = true;
    }

    await user.save();

    if (emailChanged) {
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
        subject: "Verify your new email address",
        html: `<p>Hello, ${user.name || user.email}!</p><p>Please verify your new email by clicking the link below:</p><p><a href="${verifyUrl}">Verify Email</a></p><p>This link expires in 24 hours.</p>`,
      });
    }

    return NextResponse.json({
      success: true,
      emailChanged,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update profile" },
      { status: 500 },
    );
  }
}


