/**
 * Migration script to import static data into MongoDB
 * Run with: npx tsx scripts/migrate-static-data.ts
 */

// IMPORTANT: Load environment variables FIRST using require (synchronous)
const dotenv = require("dotenv");
const path = require("path");

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true
});

if (result.error) {
  console.error("❌ Error loading .env.local:", result.error.message);
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set in environment variables");
  process.exit(1);
}

console.log("✅ Environment variables loaded");

// Now import modules that depend on environment variables
import connectDB from "../lib/mongodb";
import Project from "../lib/models/Project";
import Experience from "../lib/models/Experience";
import SiteContent from "../lib/models/SiteContent";
import User from "../lib/models/User";
import { projects } from "../lib/data/projects";
import { defaultResumeData } from "../lib/resume";

async function migrateData() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Get admin user for updatedBy field
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.error("❌ No admin user found. Please create an admin user first.");
      process.exit(1);
    }
    console.log(`✅ Found admin user: ${adminUser.email}`);

    // 1. Migrate Projects
    console.log("\n📦 Migrating Projects...");
    let projectsCreated = 0;
    let projectsSkipped = 0;

    for (const project of projects) {
      try {
        // Check if project already exists
        const existing = await Project.findOne({ slug: project.id });
        if (existing) {
          console.log(`  ⏭️  Skipping existing project: ${project.title}`);
          projectsSkipped++;
          continue;
        }

        // Convert project to database format
        const dbProject = {
          title: project.title,
          slug: project.id,
          subtitle: project.subtitle,
          description: project.description,
          longDescription: project.longDescription,
          category: project.category,
          technologies: project.technologies,
          platforms: project.platforms,
          links: project.links,
          featured: project.featured ?? false,
          tags: project.tags ?? [],
          coverImage: project.coverImage,
          notes: project.notes ?? [],
          jam: project.jam,
          releasedOn: project.releasedOn ? new Date(project.releasedOn) : undefined,
          sortPriority: project.sortPriority ?? 0,
          order: project.sortPriority ?? 0,
        };

        await Project.create(dbProject);
        console.log(`  ✅ Created project: ${project.title}`);
        projectsCreated++;
      } catch (error: any) {
        console.error(`  ❌ Error creating project ${project.title}:`, error.message);
      }
    }

    console.log(`\n📦 Projects: ${projectsCreated} created, ${projectsSkipped} skipped`);

    // 2. Migrate Experience
    console.log("\n💼 Migrating Experience...");
    let experienceCreated = 0;
    let experienceSkipped = 0;

    // Sort experience by start date (most recent first)
    const sortedExperience = [...defaultResumeData.experience].sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });

    for (let i = 0; i < sortedExperience.length; i++) {
      const exp = sortedExperience[i];
      try {
        // Check if experience already exists (by title, company, and startDate)
        const existing = await Experience.findOne({
          title: exp.title,
          company: exp.company,
          startDate: exp.startDate,
        });

        if (existing) {
          console.log(`  ⏭️  Skipping existing experience: ${exp.title} at ${exp.company}`);
          experienceSkipped++;
          continue;
        }

        const dbExperience = {
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.current,
          description: exp.description,
          technologies: exp.technologies ?? [],
          order: sortedExperience.length - i, // Most recent first
        };

        await Experience.create(dbExperience);
        console.log(`  ✅ Created experience: ${exp.title} at ${exp.company}`);
        experienceCreated++;
      } catch (error: any) {
        console.error(`  ❌ Error creating experience ${exp.title}:`, error.message);
      }
    }

    console.log(`\n💼 Experience: ${experienceCreated} created, ${experienceSkipped} skipped`);

    // 3. Migrate Site Content (About page)
    console.log("\n📄 Migrating Site Content...");
    let contentCreated = 0;
    let contentSkipped = 0;

    // About page skills
    const skillsContent = {
      development: [
        "TypeScript",
        "JavaScript",
        "C#",
        ".NET",
        "Next.js",
        "React",
        "Node.js",
        "Python",
        "Blazor",
        "MAUI",
        "Avalonia",
      ],
      ai: ["AI Integration Patterns", "LLM APIs", "Vector Databases", "Prompt Engineering"],
      architecture: ["System Design", "Scalable Architecture", "Microservices", "Cloud Infrastructure"],
      tools: [
        "Git",
        "GitKraken",
        "JetBrains Rider",
        "JetBrains Tooling",
        "MongoDB",
        "PostgreSQL",
        "SQL",
        "SQLite",
        "Docker",
        "AWS",
        "Azure",
      ],
    };

    const siteContentEntries = [
      {
        key: "about_summary",
        content: {
          title: "About Me",
          subtitle: "Transitioning to AI-First Development",
          summary: "I'm pivoting from traditional software development to embrace AI-first workflows. My focus is on architecture, modern web technologies, and creating engaging interactive experiences that push the boundaries of what's possible.",
        },
      },
      {
        key: "about_story",
        content: {
          paragraph1: "I'm pivoting from traditional software development to embrace AI-first workflows. My focus is on architecture, modern web technologies, and creating engaging interactive experiences that push the boundaries of what's possible.",
          paragraph2: "This portfolio represents my exploration of AI integration patterns, system design, and the future of web development. I'm passionate about building systems that are not just functional, but intelligent, scalable, and delightful to use.",
        },
      },
      {
        key: "about_skills",
        content: skillsContent,
      },
      {
        key: "about_architecture",
        content: {
          title: "Architecture Focus",
          description: "I'm deeply interested in system architecture and design patterns. My work focuses on creating robust, scalable solutions that can evolve with changing requirements. I believe in building systems that are not just functional today, but adaptable for tomorrow's challenges.",
        },
      },
      {
        key: "resume_personal",
        content: defaultResumeData.personal,
      },
    ];

    for (const entry of siteContentEntries) {
      try {
        const existing = await SiteContent.findOne({ key: entry.key });
        if (existing) {
          console.log(`  ⏭️  Skipping existing content: ${entry.key}`);
          contentSkipped++;
          continue;
        }

        await SiteContent.create({
          key: entry.key,
          content: entry.content,
          updatedBy: adminUser._id,
        });

        console.log(`  ✅ Created content: ${entry.key}`);
        contentCreated++;
      } catch (error: any) {
        console.error(`  ❌ Error creating content ${entry.key}:`, error.message);
      }
    }

    console.log(`\n📄 Site Content: ${contentCreated} created, ${contentSkipped} skipped`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ Migration Complete!");
    console.log("=".repeat(60));
    console.log(`📦 Projects: ${projectsCreated} created, ${projectsSkipped} skipped`);
    console.log(`💼 Experience: ${experienceCreated} created, ${experienceSkipped} skipped`);
    console.log(`📄 Site Content: ${contentCreated} created, ${contentSkipped} skipped`);
    console.log("\n✨ All static data has been migrated to MongoDB!");

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Migration error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateData();

