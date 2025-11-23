import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Role from '../lib/models/Role';
import connectDB from '../lib/mongodb';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const defaultRoles = [
  {
    name: 'Administrator',
    description: 'Full system access with all permissions',
    color: '#FF0000',
    permissions: [
      'admin.access',
      'admin.settings',
      'admin.database',
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
      'moderator.access',
      'content.moderate',
    ],
    isSystem: true,
    isDefault: false,
    priority: 1000,
  },
  {
    name: 'Moderator',
    description: 'Content moderation and user management',
    color: '#00AA00',
    permissions: [
      'moderator.access',
      'content.moderate',
      'users.view',
      'users.edit',
      'blog.view',
      'blog.edit',
      'blog.publish',
      'projects.view',
      'projects.edit',
      'mentorship.view',
      'mentorship.edit',
    ],
    isSystem: true,
    isDefault: false,
    priority: 500,
  },
  {
    name: 'Mentor',
    description: 'Teaching and mentorship capabilities',
    color: '#0066FF',
    permissions: [
      'mentorship.view',
      'mentorship.create',
      'mentorship.edit',
      'mentorship.manage_mentors',
      'app_builder.view',
      'blog.view',
      'projects.view',
    ],
    isSystem: true,
    isDefault: false,
    priority: 300,
  },
  {
    name: 'Member',
    description: 'Standard user with basic access',
    color: '#808080',
    permissions: [
      'app_builder.view',
      'app_builder.create',
      'blog.view',
      'projects.view',
      'mentorship.view',
      'subscriptions.view',
      'credits.view',
    ],
    isSystem: true,
    isDefault: true,
    priority: 100,
  },
  {
    name: 'Guest',
    description: 'Limited read-only access',
    color: '#CCCCCC',
    permissions: [
      'blog.view',
      'projects.view',
    ],
    isSystem: true,
    isDefault: false,
    priority: 0,
  },
];

async function seedRoles() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    let created = 0;
    let updated = 0;

    for (const roleData of defaultRoles) {
      const existing = await Role.findOne({ name: roleData.name });
      
      if (existing) {
        await Role.findByIdAndUpdate(existing._id, roleData);
        updated++;
        console.log(`Updated: ${roleData.name}`);
      } else {
        await Role.create(roleData);
        created++;
        console.log(`Created: ${roleData.name}`);
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Created: ${created} roles`);
    console.log(`   Updated: ${updated} roles`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
}

seedRoles();

