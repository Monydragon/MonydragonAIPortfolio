import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Visitor from "@/lib/models/Visitor";
import { auth } from "@/auth";

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();
  
  return "unknown";
}

// Update visitor location using IP geolocation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorId, locationData } = body;

    if (!visitorId || !locationData) {
      return NextResponse.json(
        { error: "Visitor ID and location data are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Update visitor with location data
    const visitor = await Visitor.findByIdAndUpdate(
      visitorId,
      {
        country: locationData.country,
        region: locationData.region,
        city: locationData.city,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timezone: locationData.timezone,
      },
      { new: true }
    );

    if (!visitor) {
      return NextResponse.json(
        { error: "Visitor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, visitor });
  } catch (error: any) {
    console.error("Error updating visitor location:", error);
    return NextResponse.json(
      { error: "Failed to update visitor location" },
      { status: 500 }
    );
  }
}

// Get location stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get location-based stats
    const [
      visitorsByCountry,
      visitorsByCity,
      visitorsWithLocation,
      topCountries,
      topCities,
    ] = await Promise.all([
      // Visitors by country
      Visitor.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate },
            country: { $exists: true, $ne: null }
          } 
        },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      
      // Visitors by city
      Visitor.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate },
            city: { $exists: true, $ne: null }
          } 
        },
        { 
          $group: { 
            _id: { city: "$city", country: "$country" }, 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      
      // Total visitors with location data
      Visitor.countDocuments({
        createdAt: { $gte: startDate },
        country: { $exists: true, $ne: null },
      }),
      
      // Top 10 countries
      Visitor.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate },
            country: { $exists: true, $ne: null }
          } 
        },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      
      // Top 10 cities
      Visitor.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate },
            city: { $exists: true, $ne: null }
          } 
        },
        { 
          $group: { 
            _id: { city: "$city", country: "$country", region: "$region" }, 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return NextResponse.json({
      visitorsByCountry,
      visitorsByCity,
      visitorsWithLocation,
      topCountries,
      topCities,
      period: days,
    });
  } catch (error: any) {
    console.error("Error fetching location stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch location stats" },
      { status: 500 }
    );
  }
}

