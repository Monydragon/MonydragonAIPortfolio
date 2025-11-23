import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';
import permissionService from '@/lib/services/permission-service';

// GET /api/roles/[id] - Get specific role
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const role = await Role.findById(params.id).lean();

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ role });
  } catch (error: any) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

// PUT /api/roles/[id] - Update role (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const canManageRoles = await permissionService.hasPermission(user._id, 'users.manage_roles');
    if (!canManageRoles) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const role = await Role.findById(params.id);
    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Prevent modification of system roles (except name, description, color)
    const body = await request.json();
    const { name, description, color, permissions, priority } = body;

    if (role.isSystem) {
      // For system roles, only allow updating name, description, and color
      if (name !== undefined) role.name = name;
      if (description !== undefined) role.description = description;
      if (color !== undefined) role.color = color;
      // Don't allow changing permissions or priority for system roles
    } else {
      // For custom roles, allow full updates
      if (name !== undefined) role.name = name;
      if (description !== undefined) role.description = description;
      if (color !== undefined) role.color = color;
      if (permissions !== undefined) role.permissions = permissions;
      if (priority !== undefined) role.priority = priority;
    }

    await role.save();

    return NextResponse.json({ role });
  } catch (error: any) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update role' },
      { status: 500 }
    );
  }
}

// DELETE /api/roles/[id] - Delete role (admin only, cannot delete system roles)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const canManageRoles = await permissionService.hasPermission(user._id, 'users.manage_roles');
    if (!canManageRoles) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const role = await Role.findById(params.id);
    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of system roles
    if (role.isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 400 }
      );
    }

    // Check if any users have this role
    const usersWithRole = await User.find({ roles: params.id });
    if (usersWithRole.length > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete role: ${usersWithRole.length} user(s) still have this role`,
          usersCount: usersWithRole.length
        },
        { status: 400 }
      );
    }

    await Role.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true, message: 'Role deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete role' },
      { status: 500 }
    );
  }
}

