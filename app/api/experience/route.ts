import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Experience from "@/lib/models/Experience";

// GET /api/experience - List all experience entries
export async function GET() {
  try {
    await connectDB();

    const experiences = await Experience.find()
      .sort({ order: -1, startDate: -1 })
      .lean();

    return NextResponse.json({ experiences });
  } catch (error: any) {
    console.error("Error fetching experience:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch experience" },
      { status: 500 }
    );
  }
}

// POST /api/experience - Create new experience entry (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { title, company, location, startDate, endDate, current, description, technologies, order } = body;

    const experience = await Experience.create({
      title,
      company,
      location,
      startDate,
      endDate,
      current: current || false,
      description: description || [],
      technologies: technologies || [],
      order: order || 0,
    });

    return NextResponse.json(experience, { status: 201 });
  } catch (error: any) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create experience" },
      { status: 500 }
    );
  }
}

