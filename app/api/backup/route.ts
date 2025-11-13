import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";
import Project from "@/lib/models/Project";
import Experience from "@/lib/models/Experience";
import SiteContent from "@/lib/models/SiteContent";
import User from "@/lib/models/User";

// GET /api/backup - Generate backup of all site data (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all data
    const [blogPosts, projects, experiences, siteContent, users] = await Promise.all([
      BlogPost.find().lean(),
      Project.find().lean(),
      Experience.find().lean(),
      SiteContent.find().lean(),
      User.find().select("-password").lean(), // Exclude passwords
    ]);

    // Create backup object
    const backup = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      data: {
        blogPosts,
        projects,
        experiences,
        siteContent,
        users,
      },
      metadata: {
        blogPostsCount: blogPosts.length,
        projectsCount: projects.length,
        experiencesCount: experiences.length,
        siteContentCount: siteContent.length,
        usersCount: users.length,
      },
    };

    // Return as JSON download
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="monydragon-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error: any) {
    console.error("Error creating backup:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create backup" },
      { status: 500 }
    );
  }
}

