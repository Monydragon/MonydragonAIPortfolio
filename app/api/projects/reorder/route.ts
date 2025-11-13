import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/lib/models/Project";

// POST /api/projects/reorder - Reorder projects (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { items } = body; // Array of { id, order }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items must be an array" },
        { status: 400 }
      );
    }

    // Update all items in parallel - use bulkWrite for better performance
    const bulkOps = items.map((item: { id: string; order: number }) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { sortPriority: item.order } },
      },
    }));

    await Project.bulkWrite(bulkOps);

    return NextResponse.json({ message: "Projects reordered successfully" });
  } catch (error: any) {
    console.error("Error reordering projects:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reorder projects" },
      { status: 500 }
    );
  }
}

