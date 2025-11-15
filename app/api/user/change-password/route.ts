import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

// POST /api/user/change-password - Change user password
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: error.message || "Failed to change password" },
      { status: 500 }
    );
  }
}

