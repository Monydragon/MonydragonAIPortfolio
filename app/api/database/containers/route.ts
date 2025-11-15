import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Strip any accidental leading/trailing quotes from container names
const sanitizeContainerName = (name: string): string =>
  name.replace(/^['"]+|['"]+$/g, "");

// GET /api/database/containers - List available Docker containers for MongoDB
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let containers: string[] = [];
    let dockerAvailable = true;

    try {
      const { stdout } = await execAsync("docker ps --format '{{.Names}}'");
      containers = stdout
        .split("\n")
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
        .map(sanitizeContainerName);
    } catch (error) {
      dockerAvailable = false;
      containers = [];
    }

    // Determine a sensible default
    const rawEnvContainer = process.env.MONGODB_DOCKER_CONTAINER?.trim();
    const envContainer = rawEnvContainer
      ? sanitizeContainerName(rawEnvContainer)
      : undefined;
    let defaultContainer: string | null = null;

    if (envContainer && containers.includes(envContainer)) {
      defaultContainer = envContainer;
    } else if (containers.includes("monydragon-mongodb")) {
      defaultContainer = "monydragon-mongodb";
    } else if (containers.includes("mongodb")) {
      defaultContainer = "mongodb";
    } else if (containers.includes("mongo")) {
      defaultContainer = "mongo";
    } else {
      const mongoContainer = containers.find((c) =>
        c.toLowerCase().includes("mongo")
      );
      defaultContainer = mongoContainer || null;
    }

    return NextResponse.json({
      dockerAvailable,
      containers,
      defaultContainer,
      envContainer: envContainer || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to list Docker containers" },
      { status: 500 }
    );
  }
}


