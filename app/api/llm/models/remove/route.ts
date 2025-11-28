import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import permissionService from "@/lib/services/permission-service";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// DELETE /api/llm/models/remove - Remove a model from Ollama
export async function DELETE(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const modelName = searchParams.get("modelName");

    if (!modelName) {
      return NextResponse.json({ error: "Model name is required" }, { status: 400 });
    }

    const containerName = process.env.OLLAMA_CONTAINER_NAME || "ollama";

    // Check if container is running
    try {
      const { stdout: containerStatus } = await execAsync(`docker ps --filter "name=${containerName}" --format "{{.Names}}"`);
      if (!containerStatus.trim()) {
        return NextResponse.json(
          { error: `Container "${containerName}" is not running.` },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to check Docker container. Is Docker running?" },
        { status: 500 }
      );
    }

    // Remove the model
    try {
      const { stdout, stderr } = await execAsync(`docker exec ${containerName} ollama rm ${modelName}`);
      
      return NextResponse.json({
        success: true,
        message: `Model "${modelName}" has been removed.`,
        modelName,
      });
    } catch (error: any) {
      // Check if error is because model doesn't exist
      if (error.stderr && error.stderr.includes("not found")) {
        return NextResponse.json(
          { error: `Model "${modelName}" not found.` },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to remove model: ${error.message || error.stderr}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error removing model:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove model" },
      { status: 500 }
    );
  }
}

