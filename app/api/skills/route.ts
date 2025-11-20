import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Skill from "@/lib/models/Skill";

// GET - Public endpoint to fetch all skills
export async function GET() {
  try {
    await connectDB();
    const skills = await Skill.find().sort({ category: 1, order: 1 });
    
    // Group by category
    const grouped = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill.name);
      return acc;
    }, {} as Record<string, string[]>);

    return NextResponse.json({ skills: grouped, raw: skills });
  } catch (error: any) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

// POST - Admin only: Create new skill
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { name, category, order } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    const skill = new Skill({
      name,
      category,
      order: order ?? 0,
    });

    await skill.save();
    return NextResponse.json({ skill }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create skill" },
      { status: 500 }
    );
  }
}

// PUT - Admin only: Update skill
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { id, name, category, order } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const skill = await Skill.findByIdAndUpdate(
      id,
      { name, category, order },
      { new: true, runValidators: true }
    );

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json({ skill });
  } catch (error: any) {
    console.error("Error updating skill:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update skill" },
      { status: 500 }
    );
  }
}

// DELETE - Admin only: Delete skill
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Skill deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting skill:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete skill" },
      { status: 500 }
    );
  }
}

