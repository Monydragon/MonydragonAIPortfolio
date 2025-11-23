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

    if (!key) {
      return NextResponse.json(
        { error: "Content key is required" },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 }
      );
    }

    // Check if content exists to determine if we should increment version
    const existingContent = await SiteContent.findOne({ key });
    
    let siteContent;
    
    if (existingContent) {
      // Update existing content and increment version
      siteContent = await SiteContent.findOneAndUpdate(
        { key },
        {
          $set: {
            content,
            updatedBy: userId,
          },
          $inc: { version: 1 }, // Increment version on each update
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new content with version 1
      siteContent = await SiteContent.create({
        key,
        content,
        updatedBy: userId,
        version: 1,
      });
    }

    if (!siteContent) {
      return NextResponse.json(
        { error: "Failed to save content" },
        { status: 500 }
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

