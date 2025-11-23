import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    await connectDB();

    const user = await User.findById((session.user as any).id)
      .select("-password -twoFactorSecret -twoFactorBackupCodes")
      .lean();

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { authenticated: false, error: err?.message || "Failed to load current user" },
      { status: 500 },
    );
  }
}

