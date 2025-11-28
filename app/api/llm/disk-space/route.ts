import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import permissionService from "@/lib/services/permission-service";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// GET /api/llm/disk-space - Get disk space information for Ollama container
export async function GET(request: NextRequest) {
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

    const containerName = process.env.OLLAMA_CONTAINER_NAME || "ollama";

    try {
      // Check if container is running
      const { stdout: containerStatus } = await execAsync(`docker ps --filter "name=${containerName}" --format "{{.Names}}"`);
      if (!containerStatus.trim()) {
        return NextResponse.json({
          containerRunning: false,
          message: `Container "${containerName}" is not running.`,
        });
      }

      // Get disk usage from container
      const { stdout: diskUsage } = await execAsync(`docker exec ${containerName} df -h /root/.ollama 2>/dev/null || docker exec ${containerName} df -h / 2>/dev/null || echo "N/A"`);
      
      // Parse disk usage (format: Filesystem Size Used Avail Use% Mounted on)
      const lines = diskUsage.trim().split('\n');
      let diskInfo: any = {
        containerRunning: true,
        hasDiskInfo: false,
      };

      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/);
        if (parts.length >= 5) {
          diskInfo = {
            containerRunning: true,
            hasDiskInfo: true,
            filesystem: parts[0],
            size: parts[1],
            used: parts[2],
            available: parts[3],
            usePercent: parts[4],
            mounted: parts.slice(5).join(' '),
          };
        }
      }

      // Get volume information
      try {
        const { stdout: volumeInfo } = await execAsync(`docker volume inspect ${containerName.replace('ollama', 'monydragon-ai-portfolio_ollama_data')} 2>/dev/null || docker volume inspect ollama_data 2>/dev/null || echo "{}"`);
        const volume = JSON.parse(volumeInfo.trim().split('\n')[0] || '{}');
        if (volume.Mountpoint) {
          // Get host disk usage for the volume
          try {
            const { stdout: hostDiskUsage } = await execAsync(`df -h "${volume.Mountpoint}" 2>/dev/null || echo ""`);
            if (hostDiskUsage) {
              const hostLines = hostDiskUsage.trim().split('\n');
              if (hostLines.length > 1) {
                const hostParts = hostLines[1].split(/\s+/);
                diskInfo.volume = {
                  mountpoint: volume.Mountpoint,
                  size: hostParts[1],
                  used: hostParts[2],
                  available: hostParts[3],
                  usePercent: hostParts[4],
                };
              }
            }
          } catch {
            // Ignore host disk check errors
          }
        }
      } catch {
        // Ignore volume check errors
      }

      return NextResponse.json(diskInfo);
    } catch (error: any) {
      return NextResponse.json({
        containerRunning: false,
        error: error.message || "Failed to get disk space information",
      });
    }
  } catch (error: any) {
    console.error("Error getting disk space:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get disk space information" },
      { status: 500 }
    );
  }
}

