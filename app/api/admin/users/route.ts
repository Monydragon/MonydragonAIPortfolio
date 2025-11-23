import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import VerificationToken from "@/lib/models/VerificationToken";
import Subscription from "@/lib/models/Subscription";
import permissionService from "@/lib/services/permission-service";

// GET /api/admin/users - list users with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const canView = await permissionService.hasPermission(user._id, 'users.view');
    if (!canView) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search")?.trim();
    const verified = searchParams.get("verified");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);

    const filter: any = {};

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { email: regex },
        { username: regex },
        { name: regex },
        { firstName: regex },
        { lastName: regex },
        { location: regex },
        { phone: regex },
      ];
    }

    if (verified === "true") {
      filter.emailVerified = { $ne: null };
    } else if (verified === "false") {
      filter.emailVerified = null;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password -twoFactorSecret -twoFactorBackupCodes")
        .lean(),
      User.countDocuments(filter),
    ]);

    // Get subscriptions for users
    const userIds = users.map((u: any) => u._id);
    const subscriptions = await Subscription.find({
      userId: { $in: userIds },
      status: 'active',
    }).lean();

    const subscriptionMap = new Map(
      subscriptions.map((sub: any) => [sub.userId.toString(), sub])
    );

    // Add subscription info to users
    const usersWithSubs = users.map((user: any) => ({
      ...user,
      subscription: subscriptionMap.get(user._id.toString())
        ? {
            tier: subscriptionMap.get(user._id.toString())?.tier,
            status: subscriptionMap.get(user._id.toString())?.status,
            creditsPerMonth: subscriptionMap.get(user._id.toString())?.creditsPerMonth,
          }
        : null,
    }));

    return NextResponse.json({
      users: usersWithSubs,
      total,
      page,
      limit,
    });
  } catch (err: any) {
    console.error("Admin users GET error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/users - update user fields (admin)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const requestingUser = await User.findOne({ email: session.user.email });
    if (!requestingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const canEdit = await permissionService.hasPermission(requestingUser._id, 'users.edit');
    if (!canEdit) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      firstName,
      middleName,
      lastName,
      email,
      username,
      phone,
      location,
      demographics,
      forceVerify,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (middleName !== undefined) user.middleName = middleName || undefined;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone || undefined;
    if (location !== undefined) user.location = location || undefined;
    if (demographics !== undefined) user.demographics = demographics || undefined;

    if (typeof forceVerify === "boolean" && forceVerify) {
      user.emailVerified = new Date();
      // Clean up any outstanding verification tokens
      await VerificationToken.deleteMany({ userId: user._id });
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existingEmail = await User.findOne({
        _id: { $ne: user._id },
        email: email.toLowerCase(),
      }).select("_id");
      if (existingEmail) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      user.email = email.toLowerCase();
    }

    if (username && username.toLowerCase() !== (user.username || "").toLowerCase()) {
      const existingUsername = await User.findOne({
        _id: { $ne: user._id },
        username: username.toLowerCase(),
      }).select("_id");
      if (existingUsername) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
      user.username = username.toLowerCase();
    }

    if (firstName || middleName || lastName) {
      const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
      user.name = parts.join(" ").trim();
    }

    await user.save();

    const sanitized = user.toObject();
    delete (sanitized as any).password;
    delete (sanitized as any).twoFactorSecret;
    delete (sanitized as any).twoFactorBackupCodes;

    return NextResponse.json({ user: sanitized });
  } catch (err: any) {
    console.error("Admin users PUT error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update user" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/users?id=... - delete a user
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const canDelete = await permissionService.hasPermission(user._id, 'users.delete');
    if (!canDelete) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await VerificationToken.deleteMany({ userId: user._id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin users DELETE error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete user" },
      { status: 500 },
    );
  }
}

