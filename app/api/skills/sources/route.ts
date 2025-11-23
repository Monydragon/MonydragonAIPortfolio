import { NextResponse } from "next/server";
import { defaultResumeData } from "@/lib/resume";
import connectDB from "@/lib/mongodb";
import ResumeSource from "@/lib/models/ResumeSource";

// GET /api/skills/sources
// Returns skill suggestions aggregated from the living resume data
// and any uploaded ResumeSource entries
export async function GET() {
  try {
    const core = defaultResumeData.skills || {
      languages: [],
      frameworks: [],
      tools: [],
      ai: [],
    };

    const technologySet = new Set<string>();

    // Collect technologies used in experience entries
    for (const exp of defaultResumeData.experience || []) {
      if (exp.technologies) {
        for (const tech of exp.technologies) {
          technologySet.add(tech);
        }
      }
    }

    // Collect technologies from projects
    for (const proj of defaultResumeData.projects || []) {
      if (proj.technologies) {
        for (const tech of proj.technologies) {
          technologySet.add(tech);
        }
      }
    }

    await connectDB();
    const sources = await ResumeSource.find().lean();

    const fromSourcesSet = new Set<string>();
    const fromSourcesByCategory: Record<string, Set<string>> = {};

    for (const src of sources) {
      const map = (src as any).skillsByCategory || {};
      Object.entries(map).forEach(([cat, arr]) => {
        if (!Array.isArray(arr)) return;
        if (!fromSourcesByCategory[cat]) fromSourcesByCategory[cat] = new Set();
        for (const skill of arr) {
          fromSourcesByCategory[cat].add(skill);
          fromSourcesSet.add(skill);
        }
      });
    }

    const technologies = Array.from(technologySet).sort((a, b) =>
      a.localeCompare(b),
    );

    const all = Array.from(
      new Set([
        ...(core.languages || []),
        ...(core.frameworks || []),
        ...(core.tools || []),
        ...(core.ai || []),
        ...technologies,
        ...Array.from(fromSourcesSet),
      ]),
    ).sort((a, b) => a.localeCompare(b));

    // Flatten fromSourcesByCategory into plain arrays
    const sourcesByCategory: Record<string, string[]> = {};
    for (const [cat, set] of Object.entries(fromSourcesByCategory)) {
      sourcesByCategory[cat] = Array.from(set).sort((a, b) =>
        a.localeCompare(b),
      );
    }

    return NextResponse.json({
      core,
      technologies,
      fromSources: sourcesByCategory,
      all,
    });
  } catch (error: any) {
    console.error("Error building resume skill sources:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load skill sources" },
      { status: 500 },
    );
  }
}


