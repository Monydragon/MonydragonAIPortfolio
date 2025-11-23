import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import permissionService from '@/lib/services/permission-service';

/**
 * Helper function to check if the current user has admin access
 * Returns the user if they have admin.access permission, null otherwise
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return null;
  }

  const hasAdminAccess = await permissionService.hasPermission(user._id, 'admin.access');
  return hasAdminAccess ? user : null;
}

/**
 * Helper function to check if the current user has a specific permission
 * Returns the user if they have the permission, null otherwise
 */
export async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return null;
  }

  const hasPermission = await permissionService.hasPermission(user._id, permission as any);
  return hasPermission ? user : null;
}

