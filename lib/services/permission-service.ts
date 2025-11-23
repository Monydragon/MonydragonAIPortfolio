import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';
import { Permission } from '@/lib/models/Role';
import mongoose from 'mongoose';

class PermissionService {
  /**
   * Get all permissions for a user (combining all their roles)
   */
  async getUserPermissions(userId: string | mongoose.Types.ObjectId): Promise<Permission[]> {
    await connectDB();
    
    const user = await User.findById(userId).populate('roles').lean();
    if (!user) {
      return [];
    }

    const roles = (user as any).roles || [];
    const allPermissions = new Set<Permission>();

    // Collect permissions from all roles
    for (const role of roles) {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach((perm: Permission) => allPermissions.add(perm));
      }
    }

    return Array.from(allPermissions);
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(
    userId: string | mongoose.Types.ObjectId,
    permission: Permission
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(
    userId: string | mongoose.Types.ObjectId,
    permissions: Permission[]
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some(perm => userPermissions.includes(perm));
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(
    userId: string | mongoose.Types.ObjectId,
    permissions: Permission[]
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every(perm => userPermissions.includes(perm));
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: string | mongoose.Types.ObjectId) {
    await connectDB();
    
    const user = await User.findById(userId).populate('roles').lean();
    if (!user) {
      return [];
    }

    return (user as any).roles || [];
  }

  /**
   * Check if user can manage another user (based on role priority)
   */
  async canManageUser(
    managerId: string | mongoose.Types.ObjectId,
    targetUserId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    // Users can always manage themselves
    if (managerId.toString() === targetUserId.toString()) {
      return true;
    }

    // Check if manager has users.edit permission
    const canEdit = await this.hasPermission(managerId, 'users.edit');
    if (!canEdit) {
      return false;
    }

    // Get role priorities
    const managerRoles = await this.getUserRoles(managerId);
    const targetRoles = await this.getUserRoles(targetUserId);

    const managerMaxPriority = Math.max(
      ...managerRoles.map((r: any) => r.priority || 0),
      ...(managerRoles.length === 0 ? [0] : [])
    );
    const targetMaxPriority = Math.max(
      ...targetRoles.map((r: any) => r.priority || 0),
      ...(targetRoles.length === 0 ? [0] : [])
    );

    // Manager must have higher priority
    return managerMaxPriority > targetMaxPriority;
  }
}

export const permissionService = new PermissionService();
export default permissionService;

