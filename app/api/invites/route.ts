import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import InviteCode from "@/lib/models/InviteCode";

function generateCode(length = 16): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Admin-only list of invite codes
export async function GET() {
  try {
    await connectDB();
    const invites = await InviteCode.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ invites });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch invites" },
      { status: 500 },
    );
  }
}

// Admin-only create invite
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { code, maxUses, expiresAt } = body;

    const finalCode = (code || generateCode()).toUpperCase().trim();

    const invite = await InviteCode.create({
      code: finalCode,
      maxUses: typeof maxUses === "number" && maxUses > 0 ? maxUses : 1,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return NextResponse.json({ invite }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create invite" },
      { status: 500 },
    );
  }
}


