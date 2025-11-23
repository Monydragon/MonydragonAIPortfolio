import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';
import mongoose from 'mongoose';

class RoleAssignmentService {
  /**
   * Ensure user has a default role if they have no roles assigned
   */
  async ensureUserRoles(userId: string | mongoose.Types.ObjectId): Promise<void> {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      return;
    }

    // If user already has roles, nothing to do
    if (user.roles && user.roles.length > 0) {
      return;
    }

    // Assign default role
    const defaultRole = await Role.findOne({ isDefault: true });
    if (defaultRole) {
      user.roles = [defaultRole._id];
      await user.save();
    }
  }
}

export const roleAssignmentService = new RoleAssignmentService();
export default roleAssignmentService;

