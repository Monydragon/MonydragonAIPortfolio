import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import LLMConfig from "@/lib/models/LLMConfig";
import User from "@/lib/models/User";
import permissionService from "@/lib/services/permission-service";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// POST /api/llm/models/pull - Pull a model from Ollama library
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if user has admin.settings permission
    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasPermission = await permissionService.hasPermission(user._id, 'admin.settings');
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { modelName, ollamaBaseUrl } = body;

    if (!modelName) {
      return NextResponse.json({ error: "Model name is required" }, { status: 400 });
    }

    const baseUrl = ollamaBaseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const containerName = process.env.OLLAMA_CONTAINER_NAME || "ollama";

    // Check if container is running
    try {
      const { stdout: containerStatus } = await execAsync(`docker ps --filter "name=${containerName}" --format "{{.Names}}"`);
      if (!containerStatus.trim()) {
        return NextResponse.json(
          { error: `Container "${containerName}" is not running. Please start it first.` },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to check Docker container. Is Docker running?" },
        { status: 500 }
      );
    }

    // Pull the model using Docker exec
    try {
      // Start the pull process (this can take a while, so we'll return immediately)
      // In production, you might want to use a job queue for this
      const pullProcess = exec(`docker exec ${containerName} ollama pull ${modelName}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error pulling model ${modelName}:`, error);
          console.error(`Stderr:`, stderr);
        } else {
          console.log(`Model ${modelName} pulled successfully:`, stdout);
        }
      });

      // Don't wait for completion - return immediately
      // The pull is happening in the background
      pullProcess.unref(); // Allow Node.js to exit even if process is running

      return NextResponse.json({
        success: true,
        message: `Model "${modelName}" is being downloaded. This may take several minutes. Check the status to see when it's ready.`,
        modelName,
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: `Failed to pull model: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error pulling model:", error);
    return NextResponse.json(
      { error: error.message || "Failed to pull model" },
      { status: 500 }
    );
  }
}

