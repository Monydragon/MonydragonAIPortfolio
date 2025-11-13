import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/lib/models/Project";

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const tag = searchParams.get("tag");

    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (tag) {
      query.tags = tag;
    }

    const projects = await Project.find(query)
      .sort({ sortPriority: -1, releasedOn: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { title, subtitle, description, longDescription, category, technologies, platforms, links, featured, tags, coverImage, images, githubUrl, liveUrl, notes, jam, releasedOn, sortPriority } = body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug exists
    const existing = await Project.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "A project with this title already exists" },
        { status: 400 }
      );
    }

    const project = await Project.create({
      title,
      slug,
      subtitle,
      description,
      longDescription,
      category: category || "other",
      technologies: technologies || [],
      platforms: platforms || [],
      links: links || [],
      featured: featured || false,
      tags: tags || [],
      coverImage,
      images: images || [],
      githubUrl,
      liveUrl,
      notes: notes || [],
      jam,
      releasedOn: releasedOn ? new Date(releasedOn) : undefined,
      sortPriority: sortPriority || 0,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create project" },
      { status: 500 }
    );
  }
}

