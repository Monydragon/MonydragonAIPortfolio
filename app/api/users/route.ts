import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';
import Subscription from '@/lib/models/Subscription';
import permissionService from '@/lib/services/permission-service';
import mongoose from 'mongoose';

// GET /api/users - Unified user management (with permissions)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permission
    const canView = await permissionService.hasPermission(user._id, 'users.view');
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const role = searchParams.get('role');
    const verified = searchParams.get('verified');
    const experienceLevel = searchParams.get('experienceLevel');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const includeRoles = searchParams.get('includeRoles') === 'true';

    const filter: any = {};

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
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

    // Role filter removed - use roles array instead

    if (verified === 'true') {
      filter.emailVerified = { $ne: null };
    } else if (verified === 'false') {
      filter.emailVerified = null;
    }

    if (experienceLevel && ['beginner', 'intermediate', 'advanced', 'expert'].includes(experienceLevel)) {
      filter.experienceLevel = experienceLevel;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password -twoFactorSecret -twoFactorBackupCodes')
        .populate(includeRoles ? 'roles' : '', 'name description color permissions')
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

    // Add subscription info and permissions to users
    const usersWithDetails = await Promise.all(
      users.map(async (user: any) => {
        const userPermissions = await permissionService.getUserPermissions(user._id);
        return {
          ...user,
          subscription: subscriptionMap.get(user._id.toString())
            ? {
                tier: subscriptionMap.get(user._id.toString())?.tier,
                status: subscriptionMap.get(user._id.toString())?.status,
                creditsPerMonth: subscriptionMap.get(user._id.toString())?.creditsPerMonth,
              }
            : null,
          permissions: userPermissions,
        };
      })
    );

    return NextResponse.json({
      users: usersWithDetails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (with permissions)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permission
    const canCreate = await permissionService.hasPermission(user._id, 'users.create');
    if (!canCreate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      middleName,
      username,
      phone,
      location,
      demographics,
      experienceLevel,
      timezone,
      bio,
      avatar,
      roleIds, // Array of role IDs to assign
      emailVerified, // Option to mark email as verified
    } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if email exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Check if username exists (if provided)
    if (username) {
      const existingUsername = await User.findOne({ username: username.toLowerCase() });
      if (existingUsername) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
    }

    // Validate role IDs if provided
    if (roleIds && roleIds.length > 0) {
      const validRoles = await Role.find({ _id: { $in: roleIds } });
      if (validRoles.length !== roleIds.length) {
        return NextResponse.json(
          { error: 'One or more role IDs are invalid' },
          { status: 400 }
        );
      }
    }

    // Create user
    const newUser = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      middleName: middleName || undefined,
      username: username?.toLowerCase() || undefined,
      phone: phone || undefined,
      location: location || undefined,
      demographics: demographics || undefined,
      experienceLevel: experienceLevel || undefined,
      timezone: timezone || 'UTC',
      bio: bio || undefined,
      avatar: avatar || undefined,
      roles: roleIds || [],
      emailVerified: emailVerified ? new Date() : null,
    });

    // Get default role if no roles assigned
    if (!roleIds || roleIds.length === 0) {
      const defaultRole = await Role.findOne({ isDefault: true });
      if (defaultRole) {
        newUser.roles = [defaultRole._id];
        await newUser.save();
      }
    }

    const sanitized = newUser.toObject();
    delete (sanitized as any).password;
    delete (sanitized as any).twoFactorSecret;
    delete (sanitized as any).twoFactorBackupCodes;

    return NextResponse.json({ user: sanitized }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT /api/users - Update user (with permissions)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 });
    }

    // Check if user can manage the target user
    const canManage = await permissionService.canManageUser(user._id, id);
    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to manage this user' },
        { status: 403 }
      );
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check specific permissions for sensitive operations
    if (updateData.roles !== undefined) {
      const canManageRoles = await permissionService.hasPermission(user._id, 'users.manage_roles');
      if (!canManageRoles) {
        return NextResponse.json(
          { error: 'Insufficient permissions to manage roles' },
          { status: 403 }
        );
      }
    }

    // Update allowed fields
    const allowedFields = [
      'firstName',
      'middleName',
      'lastName',
      'email',
      'username',
      'phone',
      'location',
      'demographics',
      'experienceLevel',
      'timezone',
      'bio',
      'avatar',
      'roles', // Roles array
      'forceVerify',
      'password', // Password update
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'forceVerify' && updateData[field]) {
          targetUser.emailVerified = new Date();
        } else if (field === 'roles') {
          // Validate role IDs
          const roleIds = updateData[field];
          if (Array.isArray(roleIds)) {
            const validRoles = await Role.find({ _id: { $in: roleIds } });
            if (validRoles.length !== roleIds.length) {
              return NextResponse.json(
                { error: 'One or more role IDs are invalid' },
                { status: 400 }
              );
            }
            targetUser.roles = roleIds;
          }
        } else if (field === 'password') {
          // Only update password if provided and not empty
          if (updateData.password && updateData.password.length > 0) {
            if (updateData.password.length < 6) {
              return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
              );
            }
            targetUser.password = updateData.password;
          }
        } else if (field !== 'forceVerify') {
          (targetUser as any)[field] = updateData[field] || undefined;
        }
      }
    }

    // Update name if first/last name changed
    if (updateData.firstName || updateData.middleName || updateData.lastName) {
      const parts = [
        targetUser.firstName,
        targetUser.middleName,
        targetUser.lastName,
      ].filter(Boolean);
      targetUser.name = parts.join(' ').trim();
    }

    await targetUser.save();

    const sanitized = targetUser.toObject();
    delete (sanitized as any).password;
    delete (sanitized as any).twoFactorSecret;
    delete (sanitized as any).twoFactorBackupCodes;

    return NextResponse.json({ user: sanitized });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users - Delete user (with permissions)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permission
    const canDelete = await permissionService.hasPermission(user._id, 'users.delete');
    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 });
    }

    // Check if user can manage the target user
    const canManage = await permissionService.canManageUser(user._id, id);
    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this user' },
        { status: 403 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

