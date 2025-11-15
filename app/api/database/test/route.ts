import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// GET /api/database/test - Test MongoDB connection
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    let connectionTime = 0;
    let pingTime = 0;
    let dbName = "";
    let collections: string[] = [];
    let error: string | null = null;

    try {
      // Test connection
      const connectionStart = Date.now();
      const mongooseInstance = await connectDB();
      connectionTime = Date.now() - connectionStart;

      // Get database info
      dbName = mongooseInstance.connection.db?.databaseName || "unknown";
      
      // Test ping
      const pingStart = Date.now();
      await mongooseInstance.connection.db?.admin().ping();
      pingTime = Date.now() - pingStart;

      // List collections
      const db = mongooseInstance.connection.db;
      if (db) {
        const collectionList = await db.listCollections().toArray();
        collections = collectionList.map((c) => c.name);
      }

      return NextResponse.json({
        success: true,
        connected: true,
        database: dbName,
        connectionTime: `${connectionTime}ms`,
        pingTime: `${pingTime}ms`,
        totalTime: `${Date.now() - startTime}ms`,
        collections: collections.sort(),
        collectionCount: collections.length,
        connectionState: mongooseInstance.connection.readyState === 1 ? "connected" : "disconnected",
        message: `Successfully connected to MongoDB database "${dbName}" with ${collections.length} collections.`,
      });
    } catch (e: any) {
      error = e.message || "Unknown error";
      return NextResponse.json(
        {
          success: false,
          connected: false,
          error: error,
          message: `Failed to connect to MongoDB: ${error}`,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to test MongoDB connection" },
      { status: 500 }
    );
  }
}

