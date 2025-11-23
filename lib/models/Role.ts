import mongoose, { Schema, Document, Model } from 'mongoose';

export type Permission = 
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.manage_roles'
  | 'users.manage_permissions'
  | 'app_builder.view'
  | 'app_builder.create'
  | 'app_builder.edit'
  | 'app_builder.delete'
  | 'app_builder.manage'
  | 'blog.view'
  | 'blog.create'
  | 'blog.edit'
  | 'blog.delete'
  | 'blog.publish'
  | 'projects.view'
  | 'projects.create'
  | 'projects.edit'
  | 'projects.delete'
  | 'mentorship.view'
  | 'mentorship.create'
  | 'mentorship.edit'
  | 'mentorship.delete'
  | 'mentorship.manage_mentors'
  | 'subscriptions.view'
  | 'subscriptions.create'
  | 'subscriptions.edit'
  | 'subscriptions.delete'
  | 'credits.view'
  | 'credits.manage'
  | 'admin.access'
  | 'admin.settings'
  | 'admin.database'
  | 'moderator.access'
  | 'content.moderate';

export interface IRole extends Document {
  name: string;
  description?: string;
  color?: string; // Hex color for UI display
  permissions: Permission[];
  isSystem: boolean; // System roles cannot be deleted
  isDefault: boolean; // Default role for new users
  priority: number; // Higher priority = more important (for role hierarchy)
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    color: {
      type: String,
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color'],
    },
    permissions: {
      type: [String],
      enum: [
        'users.view',
        'users.create',
        'users.edit',
        'users.delete',
        'users.manage_roles',
        'users.manage_permissions',
        'app_builder.view',
        'app_builder.create',
        'app_builder.edit',
        'app_builder.delete',
        'app_builder.manage',
        'blog.view',
        'blog.create',
        'blog.edit',
        'blog.delete',
        'blog.publish',
        'projects.view',
        'projects.create',
        'projects.edit',
        'projects.delete',
        'mentorship.view',
        'mentorship.create',
        'mentorship.edit',
        'mentorship.delete',
        'mentorship.manage_mentors',
        'subscriptions.view',
        'subscriptions.create',
        'subscriptions.edit',
        'subscriptions.delete',
        'credits.view',
        'credits.manage',
        'admin.access',
        'admin.settings',
        'admin.database',
        'moderator.access',
        'content.moderate',
      ],
      default: [],
      index: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    priority: {
      type: Number,
      default: 0,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RoleSchema.index({ isSystem: 1, isDefault: 1 });
RoleSchema.index({ priority: -1 });

const Role: Model<IRole> =
  mongoose.models.Role ||
  mongoose.model<IRole>('Role', RoleSchema);

export default Role;

