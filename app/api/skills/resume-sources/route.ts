import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import ResumeSource from "@/lib/models/ResumeSource";
import { defaultResumeData } from "@/lib/resume";

// Simple heuristics for auto-categorizing skill tokens
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  languages: ["typescript", "javascript", "c#", "csharp", "python", "vb", "vb.net"],
  frameworks: [
    "react",
    "next.js",
    "nextjs",
    ".net",
    "asp.net",
    "xamarin",
    "maui",
    "blazor",
    "wpf",
    "mvc",
    "avalonia",
  ],
  tools: [
    "git",
    "github",
    "gitkraken",
    "docker",
    "aws",
    "azure",
    "mongodb",
    "postgresql",
    "postgres",
    "sql",
    "sqlite",
    "rabbitmq",
    "tfs",
    "devops",
    "azure devops",
  ],
  ai: ["ai", "llm", "vector", "machine learning", "ml", "ai integration"],
};

function normalizeToken(token: string): string {
  return token.trim().toLowerCase();
}

function parseSkillsFromText(rawText: string): Record<string, string[]> {
  const byCategory: Record<string, Set<string>> = {
    languages: new Set(),
    frameworks: new Set(),
    tools: new Set(),
    ai: new Set(),
    other: new Set(),
  };

  const lower = rawText.toLowerCase();

  // Seed with living resume core skills so we can detect them even if the
  // uploaded resume text is similar
  const core = defaultResumeData.skills;
  const allKnown = new Set<string>([
    ...(core.languages || []),
    ...(core.frameworks || []),
    ...(core.tools || []),
    ...(core.ai || []),
  ].map(normalizeToken));

  // Tokenize by commas and line breaks first, then split on spaces
  const roughTokens = rawText
    .split(/[\n,;]+/g)
    .flatMap((segment) => segment.split(/\/|·|\u2022/g))
    .map((t) => t.trim())
    .filter(Boolean);

  for (const segment of roughTokens) {
    const norm = normalizeToken(segment);
    if (!norm || norm.length < 2) continue;

    let matchedCategory: string | null = null;

    // Direct match on known skills
    if (allKnown.has(norm)) {
      // Attempt category inference from CATEGORY_KEYWORDS
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.includes(norm)) {
          matchedCategory = cat;
          break;
        }
      }
      if (!matchedCategory) {
        matchedCategory = "other";
      }
    } else {
      // Keyword-based matching inside the segment
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some((kw) => norm.includes(kw))) {
          matchedCategory = cat;
          break;
        }
      }
    }

    const targetCategory = matchedCategory || "other";
    byCategory[targetCategory].add(segment.trim());
  }

  const result: Record<string, string[]> = {};
  for (const [cat, set] of Object.entries(byCategory)) {
    if (set.size > 0) {
      result[cat] = Array.from(set).sort((a, b) => a.localeCompare(b));
    }
  }
  return result;
}

// GET /api/skills/resume-sources - list sources (admin only)
export async function GET() {
  try {
    await connectDB();
    const sources = await ResumeSource.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ sources });
  } catch (error: any) {
    console.error("Error fetching resume sources:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resume sources" },
      { status: 500 },
    );
  }
}

// POST /api/skills/resume-sources - create new source from pasted resume text (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { name, rawText } = body;
    if (!name || !rawText) {
      return NextResponse.json(
        { error: "Name and resume text are required" },
        { status: 400 },
      );
    }

    const skillsByCategory = parseSkillsFromText(rawText);

    const source = await ResumeSource.create({
      name: name.trim(),
      rawText,
      skillsByCategory,
    });

    return NextResponse.json({ source }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating resume source:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create resume source" },
      { status: 500 },
    );
  }
}


