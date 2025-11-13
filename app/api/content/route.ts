import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import SiteContent from "@/lib/models/SiteContent";

// GET /api/content - List all site content entries
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    const query: any = {};
    if (key) {
      query.key = key;
    }

    const contents = await SiteContent.find(query)
      .populate("updatedBy", "name email")
      .sort({ key: 1 })
      .lean();

    return NextResponse.json({ contents });
  } catch (error: any) {
    console.error("Error fetching site content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch site content" },
      { status: 500 }
    );
  }
}

// POST /api/content - Create or update site content (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { key, content } = body;

    if (!key || !content) {
      return NextResponse.json(
        { error: "Key and content are required" },
        { status: 400 }
      );
    }

    // Upsert: update if exists, create if not
    const siteContent = await SiteContent.findOneAndUpdate(
      { key },
      {
        key,
        content,
        updatedBy: (session.user as any).id,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(siteContent, { status: 201 });
  } catch (error: any) {
    console.error("Error saving site content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save site content" },
      { status: 500 }
    );
  }
}

