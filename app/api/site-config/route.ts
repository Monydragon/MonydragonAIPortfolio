import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import SiteConfig from "@/lib/models/SiteConfig";

async function getOrCreateConfig() {
  await connectDB();
  let config = await SiteConfig.findOne();
  if (!config) {
    config = await SiteConfig.create({});
  }
  return config;
}

// Public GET: return current site config (non-sensitive)
export async function GET() {
  try {
    const config = await getOrCreateConfig();
    return NextResponse.json({
      registrationMode: config.registrationMode,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load site config" },
      { status: 500 },
    );
  }
}

// Admin-only POST: update site config
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { registrationMode } = body;

    if (
      registrationMode &&
      !["open", "closed", "invite-only"].includes(String(registrationMode))
    ) {
      return NextResponse.json(
        { error: "Invalid registrationMode" },
        { status: 400 },
      );
    }

    const config = await getOrCreateConfig();
    if (registrationMode) {
      config.registrationMode = registrationMode;
    }
    await config.save();

    return NextResponse.json({
      registrationMode: config.registrationMode,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update site config" },
      { status: 500 },
    );
  }
}


