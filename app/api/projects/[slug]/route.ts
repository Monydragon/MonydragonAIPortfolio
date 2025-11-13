import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/lib/models/Project";

// GET /api/projects/[slug] - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;
    const project = await Project.findOne({ slug }).lean();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[slug] - Update project (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { slug } = await params;
    const body = await request.json();
    const { title, subtitle, description, longDescription, category, technologies, platforms, links, featured, tags, coverImage, images, githubUrl, liveUrl, notes, jam, releasedOn, sortPriority } = body;

    // If title changed, generate new slug
    let newSlug = slug;
    if (title) {
      newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if new slug conflicts with another project
      if (newSlug !== slug) {
        const existing = await Project.findOne({ slug: newSlug, _id: { $ne: (await Project.findOne({ slug }))?._id } });
        if (existing) {
          return NextResponse.json(
            { error: "A project with this title already exists" },
            { status: 400 }
          );
        }
      }
    }

    const project = await Project.findOneAndUpdate(
      { slug },
      {
        ...(title && { title }),
        ...(newSlug !== slug && { slug: newSlug }),
        ...(subtitle !== undefined && { subtitle }),
        ...(description !== undefined && { description }),
        ...(longDescription !== undefined && { longDescription }),
        ...(category !== undefined && { category }),
        ...(technologies !== undefined && { technologies }),
        ...(platforms !== undefined && { platforms }),
        ...(links !== undefined && { links }),
        ...(featured !== undefined && { featured }),
        ...(tags !== undefined && { tags }),
        ...(coverImage !== undefined && { coverImage }),
        ...(images !== undefined && { images }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(liveUrl !== undefined && { liveUrl }),
        ...(notes !== undefined && { notes }),
        ...(jam !== undefined && { jam }),
        ...(releasedOn !== undefined && { releasedOn: releasedOn ? new Date(releasedOn) : undefined }),
        ...(sortPriority !== undefined && { sortPriority }),
      },
      { new: true, runValidators: true }
    );

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[slug] - Delete project (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { slug } = await params;
    const project = await Project.findOneAndDelete({ slug });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}

