import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Visitor from "@/lib/models/Visitor";
import { auth } from "@/auth";

// Get client IP address from request
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip"); // Cloudflare
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();
  
  // Fallback
  return "unknown";
}

// Get user agent
function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

// Get referer
function getReferer(request: NextRequest): string | undefined {
  const referer = request.headers.get("referer");
  return referer || undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, sessionId } = body;

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    await connectDB();

    // Get user session if available
    const session = await auth();
    const userId = session?.user ? (session.user as any).id : undefined;

    // Get request metadata
    const ip = getClientIP(request);
    const userAgent = getUserAgent(request);
    const referer = getReferer(request);

    // Check if this is a new session (no recent visit from this IP/sessionId)
    let isNewSession = true;
    if (sessionId) {
      const recentVisit = await Visitor.findOne({
        sessionId,
        createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // 30 minutes
      });
      isNewSession = !recentVisit;
    } else {
      // Check by IP if no sessionId
      const recentVisit = await Visitor.findOne({
        ip,
        createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
      });
      isNewSession = !recentVisit;
    }

    // Create visitor record
    const visitor = new Visitor({
      ip,
      userAgent,
      path,
      referer,
      sessionId: sessionId || undefined,
      userId: userId ? userId : undefined,
      isNewSession,
    });

    await visitor.save();

    // Return IP for client-side geolocation
    return NextResponse.json({ 
      success: true, 
      isNewSession,
      visitorId: (visitor._id as any).toString(),
      ip, // Return IP so client can fetch location
    });
  } catch (error: any) {
    console.error("Visitor tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track visitor" },
      { status: 500 }
    );
  }
}

// GET endpoint to get visitor stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7", 10);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get stats
    const [
      totalVisits,
      uniqueVisitors,
      newSessions,
      visitsByCountry,
      visitsByPath,
      recentVisits,
    ] = await Promise.all([
      // Total visits
      Visitor.countDocuments({ createdAt: { $gte: startDate } }),
      
      // Unique visitors (by IP)
      Visitor.distinct("ip", { createdAt: { $gte: startDate } }).then(ips => ips.length),
      
      // New sessions
      Visitor.countDocuments({ 
        isNewSession: true, 
        createdAt: { $gte: startDate } 
      }),
      
      // Visits by country
      Visitor.aggregate([
        { $match: { createdAt: { $gte: startDate }, country: { $exists: true } } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      
      // Visits by path
      Visitor.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      
      // Recent visits
      Visitor.find({ createdAt: { $gte: startDate } })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("userId", "name email")
        .lean(),
    ]);

    return NextResponse.json({
      totalVisits,
      uniqueVisitors,
      newSessions,
      visitsByCountry,
      visitsByPath,
      recentVisits,
      period: days,
    });
  } catch (error: any) {
    console.error("Error fetching visitor stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitor stats" },
      { status: 500 }
    );
  }
}

