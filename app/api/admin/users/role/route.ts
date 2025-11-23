import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

// POST /api/admin/users/role - update a user's role (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id, role } = await request.json();
    if (!id || !role) {
      return NextResponse.json({ error: "User id and role are required" }, { status: 400 });
    }

    if (!["admin", "user", "guest"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true },
    ).select("-password -twoFactorSecret -twoFactorBackupCodes");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("Admin user role update error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update user role" },
      { status: 500 },
    );
  }
}

