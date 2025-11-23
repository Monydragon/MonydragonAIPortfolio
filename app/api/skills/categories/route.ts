import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import SkillCategory from "@/lib/models/SkillCategory";

// GET - Public: fetch all skill categories
export async function GET() {
  try {
    await connectDB();
    const categories = await SkillCategory.find().sort({ order: 1, label: 1 }).lean();
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Error fetching skill categories:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch skill categories" },
      { status: 500 },
    );
  }
}

// POST - Admin only: create category
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { value, label, color, order } = body;

    if (!value || !label) {
      return NextResponse.json(
        { error: "Value and label are required" },
        { status: 400 },
      );
    }

    const existing = await SkillCategory.findOne({ value: value.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { error: "Category value must be unique" },
        { status: 400 },
      );
    }

    const category = new SkillCategory({
      value: value.toLowerCase().trim(),
      label: label.trim(),
      color: (color || "blue").trim(),
      order: typeof order === "number" ? order : 0,
    });

    await category.save();
    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating skill category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create skill category" },
      { status: 500 },
    );
  }
}

// PUT - Admin only: update category
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { id, value, label, color, order } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const update: any = {};
    if (value) update.value = value.toLowerCase().trim();
    if (label) update.label = label.trim();
    if (color !== undefined) update.color = color.trim();
    if (typeof order === "number") update.order = order;

    const category = await SkillCategory.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error("Error updating skill category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update skill category" },
      { status: 500 },
    );
  }
}

// DELETE - Admin only: delete category
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

    const category = await SkillCategory.findByIdAndDelete(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting skill category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete skill category" },
      { status: 500 },
    );
  }
}


