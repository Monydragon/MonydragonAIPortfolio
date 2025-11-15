import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir, platform } from "os";
import { writeFile } from "fs/promises";

const execAsync = promisify(exec);

// Helper to execute Docker commands with proper escaping
const execDocker = async (
  command: string
): Promise<{ stdout: string; stderr: string }> => {
  const isWindows = platform() === "win32";
  const fullCommand = isWindows ? `cmd.exe /c ${command}` : command;
  console.log(
    `🔧 Executing (${isWindows ? "Windows" : "Unix"}): ${fullCommand}`
  );
  return execAsync(fullCommand);
};

// Strip any accidental leading/trailing quotes from container names
const sanitizeContainerName = (name: string): string =>
  name.replace(/^['"]+|['"]+$/g, "");

// POST /api/database/restore - Restore MongoDB from dump file
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const requestedContainerRaw =
      (formData.get("container") as string | null)?.trim() || "";
    const requestedContainer = sanitizeContainerName(requestedContainerRaw);

    console.log(
      "Restore request - requestedContainer (raw):",
      requestedContainerRaw
    );
    console.log(
      "Restore request - requestedContainer (sanitized):",
      requestedContainer
    );

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith(".tar.gz") && !file.name.endsWith(".gz")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a .tar.gz file" },
        { status: 400 }
      );
    }

    const dbName = process.env.MONGODB_URI?.split("/").pop()?.split("?")[0] || "monydragon_portfolio";
    const tempDir = path.join(tmpdir(), `mongodb-restore-${Date.now()}`);
    const archivePath = path.join(tempDir, file.name);
    const extractDir = path.join(tempDir, "extracted");

    try {
      // Create temp directory
      await fs.mkdir(tempDir, { recursive: true });
      await fs.mkdir(extractDir, { recursive: true });

      // Save uploaded file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(archivePath, buffer);

      // Extract archive
      await execAsync(`tar -xzf "${archivePath}" -C "${extractDir}"`);

      // Find the dump directory
      const extractedFiles = await fs.readdir(extractDir);
      let dumpPath = path.join(extractDir, extractedFiles[0]);
      
      // Check if it's a directory or if we need to go deeper
      const stats = await fs.stat(dumpPath);
      if (stats.isDirectory()) {
        // Check if it contains the database folder
        const subFiles = await fs.readdir(dumpPath);
        if (subFiles.includes(dbName)) {
          dumpPath = path.join(dumpPath, dbName);
        } else if (subFiles.some((f) => f.endsWith(".bson"))) {
          // Already at the collection level
        } else {
          // Try to find the database folder
          for (const subFile of subFiles) {
            const subPath = path.join(dumpPath, subFile);
            const subStats = await fs.stat(subPath);
            if (subStats.isDirectory() && subFile === dbName) {
              dumpPath = subPath;
              break;
            }
          }
        }
      }

      // Check if MongoDB is in Docker
      let containerName = "";

      if (requestedContainer) {
        // 1) Prefer container explicitly provided in the request
        containerName = requestedContainer;
        console.log(
          "✅ Using MongoDB Docker container from request (before sanitize):",
          containerName
        );
      } else {
        console.log(
          "⚠️ No container in request, checking env and auto-detection..."
        );
        // 2) Prefer explicit container name from env, e.g. MONGODB_DOCKER_CONTAINER=monydragon-mongodb
        const envContainerRaw = process.env.MONGODB_DOCKER_CONTAINER?.trim();
        const envContainer = envContainerRaw
          ? sanitizeContainerName(envContainerRaw)
          : "";

        if (envContainer) {
          containerName = envContainer;
          console.log(
            "Using MongoDB Docker container from env (sanitized):",
            containerName
          );
        } else {
          // 3) Auto-detect running mongo container
          try {
            const { stdout: containers } = await execDocker(
              "docker ps --format '{{.Names}}'"
            );
            const containerList = containers
              .split("\n")
              .map((c: string) => sanitizeContainerName(c.trim()))
              .filter((c: string) => c.length > 0);
            
            console.log("Available containers:", containerList);
            
            if (containerList.includes("monydragon-mongodb")) {
              containerName = "monydragon-mongodb";
            } else if (containerList.includes("mongodb")) {
              containerName = "mongodb";
            } else if (containerList.includes("mongo")) {
              containerName = "mongo";
            } else {
              const mongoContainer = containerList.find((c: string) =>
                c.toLowerCase().includes("mongo")
              );
              if (mongoContainer) {
                containerName = mongoContainer;
              }
            }
            
            console.log(
              "Auto-detected MongoDB container (sanitized):",
              containerName || "(none)"
            );
          } catch (e) {
            console.error("Error detecting Docker container:", e);
            // Docker not available
          }
        }
      }

      // Final sanitize before use
      containerName = sanitizeContainerName(containerName);

      if (containerName) {
        // Verify container exists before using it
        try {
          const { stdout: containers } = await execDocker(
            "docker ps --format '{{.Names}}'"
          );
          const containerList = containers
            .split("\n")
            .map((c: string) => sanitizeContainerName(c.trim()))
            .filter((c: string) => c.length > 0);
          
          if (!containerList.includes(containerName)) {
            console.error(`❌ Container '${containerName}' not found in running containers:`, containerList);
            return NextResponse.json(
              { 
                error: `Docker container '${containerName}' is not running. Available containers: ${containerList.join(", ") || "none"}` 
              },
              { status: 400 }
            );
          }
          
          console.log(`✅ Container '${containerName}' verified and running`);
        } catch (e) {
          console.error("Error verifying Docker container:", e);
          return NextResponse.json(
            { error: "Failed to verify Docker container. Is Docker running?" },
            { status: 500 }
          );
        }

        // Copy to container and restore
        // Convert Windows path to Unix-style if needed, and escape properly
        const normalizedPath = dumpPath.replace(/\\/g, "/");
        console.log(`🚀 Copying ${normalizedPath} to container ${containerName}`);
        
        await execDocker(
          `docker cp "${normalizedPath}" ${containerName}:/tmp/mongodb-dump`
        );
        await execDocker(
          `docker exec ${containerName} mongorestore --host localhost --port 27017 --db="${dbName}" --drop --noIndexRestore /tmp/mongodb-dump`
        );
        await execDocker(`docker exec ${containerName} rm -rf /tmp/mongodb-dump`);
      } else {
        // Use local mongorestore
        const mongoUri = process.env.MONGODB_URI?.replace(/\/[^\/]*$/, "") || "mongodb://localhost:27017";
        await execAsync(
          `mongorestore --uri="${mongoUri}" --db="${dbName}" --drop --noIndexRestore "${dumpPath}"`
        );
      }

      // Clean up
      await fs.rm(tempDir, { recursive: true, force: true });

      return NextResponse.json({
        success: true,
        message: "Database restored successfully",
      });
    } catch (error: any) {
      // Clean up on error
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error restoring database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to restore database" },
      { status: 500 }
    );
  }
}

