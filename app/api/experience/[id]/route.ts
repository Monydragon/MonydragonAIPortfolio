import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Experience from "@/lib/models/Experience";

// GET /api/experience/[id] - Get single experience entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const experience = await Experience.findById(id).lean();

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(experience);
  } catch (error: any) {
    console.error("Error fetching experience:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch experience" },
      { status: 500 }
    );
  }
}

// PUT /api/experience/[id] - Update experience entry (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { title, company, location, startDate, endDate, current, description, technologies, order } = body;

    const experience = await Experience.findByIdAndUpdate(
      id,
      {
        ...(title !== undefined && { title }),
        ...(company !== undefined && { company }),
        ...(location !== undefined && { location }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(current !== undefined && { current }),
        ...(description !== undefined && { description }),
        ...(technologies !== undefined && { technologies }),
        ...(order !== undefined && { order }),
      },
      { new: true, runValidators: true }
    );

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(experience);
  } catch (error: any) {
    console.error("Error updating experience:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update experience" },
      { status: 500 }
    );
  }
}

// DELETE /api/experience/[id] - Delete experience entry (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const experience = await Experience.findByIdAndDelete(id);

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Experience deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting experience:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete experience" },
      { status: 500 }
    );
  }
}

