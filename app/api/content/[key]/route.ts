import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import SiteContent from "@/lib/models/SiteContent";

// GET /api/content/[key] - Get single site content entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await connectDB();

    const { key } = await params;
    const content = await SiteContent.findOne({ key })
      .populate("updatedBy", "name email")
      .lean();

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error: any) {
    console.error("Error fetching site content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch site content" },
      { status: 500 }
    );
  }
}

// PUT /api/content/[key] - Update site content (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { key } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const siteContent = await SiteContent.findOneAndUpdate(
      { key },
      {
        content,
        updatedBy: (session.user as any).id,
      },
      { new: true, runValidators: true }
    );

    if (!siteContent) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(siteContent);
  } catch (error: any) {
    console.error("Error updating site content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update site content" },
      { status: 500 }
    );
  }
}

// DELETE /api/content/[key] - Delete site content (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { key } = await params;
    const content = await SiteContent.findOneAndDelete({ key });

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Content deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting site content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete site content" },
      { status: 500 }
    );
  }
}

