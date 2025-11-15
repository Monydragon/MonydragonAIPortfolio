import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir, platform } from "os";

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

// GET /api/database/backup - Create MongoDB dump backup
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbName =
      process.env.MONGODB_URI?.split("/").pop()?.split("?")[0] ||
      "monydragon_portfolio";

    // Optional: container name can be provided via query param (?container=...)
    const url = new URL(request.url);
    const requestedContainerRaw =
      url.searchParams.get("container")?.trim() || "";
    const requestedContainer = sanitizeContainerName(requestedContainerRaw);

    console.log("Backup request - URL:", request.url);
    console.log("Backup request - requestedContainer (raw):", requestedContainerRaw);
    console.log("Backup request - requestedContainer (sanitized):", requestedContainer);
    console.log(
      "Backup request - MONGODB_DOCKER_CONTAINER env:",
      process.env.MONGODB_DOCKER_CONTAINER
    );
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
    const backupFileName = `mongodb-dump-${timestamp}.tar.gz`;
    const tempDir = path.join(tmpdir(), `mongodb-backup-${Date.now()}`);
    const dumpDir = path.join(tempDir, "mongodb-dump");

    try {
      // Create temp directory
      await fs.mkdir(dumpDir, { recursive: true });

      // Check if MongoDB is in Docker
      let containerName = "";

      // 1) Prefer container explicitly provided in the request
      if (requestedContainer) {
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
            
            // Prefer common names
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
            
            console.log("Auto-detected MongoDB container:", containerName || "(none)");
          } catch (e) {
            console.error("Error detecting Docker container:", e);
            // Docker not available or no containers
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

        // Use Docker exec
        console.log(`🚀 Executing mongodump in Docker container: ${containerName}`);
        console.log(`📋 Command: docker exec ${containerName} mongodump --db=${dbName} --out=/tmp/mongodb-dump`);
        
        try {
          // Execute mongodump inside the container
          const mongodumpCmd = `docker exec ${containerName} mongodump --db=${dbName} --out=/tmp/mongodb-dump`;
          console.log(`📋 Full command: ${mongodumpCmd}`);
          await execDocker(mongodumpCmd);
          
          // Copy the dump from container to host
          // Normalize path for Windows
          const normalizedTempDir = tempDir.replace(/\\/g, "/");
          const copyCmd = `docker cp ${containerName}:/tmp/mongodb-dump "${normalizedTempDir}/"`;
          console.log(`📋 Copy command: ${copyCmd}`);
          await execDocker(copyCmd);
          
          // Clean up inside container
          const cleanupCmd = `docker exec ${containerName} rm -rf /tmp/mongodb-dump`;
          console.log(`📋 Cleanup command: ${cleanupCmd}`);
          await execDocker(cleanupCmd);
        } catch (execError: any) {
          console.error("❌ Docker exec error:", execError);
          console.error("Error stdout:", execError.stdout);
          console.error("Error stderr:", execError.stderr);
          const errorMessage = execError.stderr || execError.message || String(execError);
          throw new Error(`Failed to execute mongodump in container '${containerName}': ${errorMessage}`);
        }
      } else {
        console.log("No Docker container detected, using local mongodump");
        // Use local mongodump
        const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:27017/${dbName}`;
        await execAsync(`mongodump --uri="${mongoUri}" --out="${dumpDir}"`);
      }

      // Create tar.gz archive
      await execAsync(`tar -czf "${path.join(tempDir, backupFileName)}" -C "${tempDir}" mongodb-dump`);

      // Read the archive
      const archivePath = path.join(tempDir, backupFileName);
      const archiveBuffer = await fs.readFile(archivePath);

      // Clean up
      await fs.rm(tempDir, { recursive: true, force: true });

      // Return the file
      return new NextResponse(archiveBuffer, {
        headers: {
          "Content-Type": "application/gzip",
          "Content-Disposition": `attachment; filename="${backupFileName}"`,
        },
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
    console.error("Error creating database backup:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create database backup" },
      { status: 500 }
    );
  }
}

