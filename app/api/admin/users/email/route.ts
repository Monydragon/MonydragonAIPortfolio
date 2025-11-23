import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { sendMail } from "@/lib/mailer";

// POST /api/admin/users/email - send an email to a specific user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { userId, subject, html, text } = await request.json();
    if (!userId || !subject || !html) {
      return NextResponse.json(
        { error: "userId, subject, and html are required" },
        { status: 400 },
      );
    }

    const user = await User.findById(userId).select("email name");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await sendMail({
      to: user.email,
      subject,
      html,
      text,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin send user email error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to send user email" },
      { status: 500 },
    );
  }
}


