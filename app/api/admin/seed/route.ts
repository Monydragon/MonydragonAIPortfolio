import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

// GET /api/admin/seed - check if any admin user exists
export async function GET() {
  try {
    await connectDB();

    const adminCount = await User.countDocuments({ role: "admin" });

    return NextResponse.json({
      hasAdmin: adminCount > 0,
      count: adminCount,
    });
  } catch (error: any) {
    console.error("Error checking admin existence:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check admin users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/seed - create initial admin user if none exists
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount > 0) {
      return NextResponse.json(
        { error: "Admin user already exists" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email, password, name } = body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Basic validation (more is enforced by the Mongoose schema)
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Create admin user; password hashing is handled by the User schema pre-save hook
    const admin = await User.create({
      email,
      password,
      name,
      role: "admin",
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error("Error creating initial admin user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create admin user" },
      { status: 500 }
    );
  }
}


