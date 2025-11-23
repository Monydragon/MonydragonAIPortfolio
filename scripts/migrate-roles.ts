import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../lib/models/User';
import Role from '../lib/models/Role';
import connectDB from '../lib/mongodb';
import roleAssignmentService from '../lib/services/role-assignment-service';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateRoles() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Get or create default roles
    const adminRole = await Role.findOne({ name: 'Administrator' });
    const moderatorRole = await Role.findOne({ name: 'Moderator' });
    const mentorRole = await Role.findOne({ name: 'Mentor' });
    const memberRole = await Role.findOne({ name: 'Member' });
    const guestRole = await Role.findOne({ name: 'Guest' });

    if (!adminRole || !moderatorRole || !mentorRole || !memberRole || !guestRole) {
      console.error('Default roles not found. Please run: npm run seed-roles');
      process.exit(1);
    }

    console.log('\n📋 Starting role migration...\n');

    // Get all users
    const users = await User.find({}).lean();
    console.log(`Found ${users.length} users to migrate\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      try {
        const userDoc = await User.findById(user._id);
        if (!userDoc) continue;

        // Skip if user already has roles assigned
        if (userDoc.roles && userDoc.roles.length > 0) {
          console.log(`⏭️  Skipping ${userDoc.email} - already has roles assigned`);
          skipped++;
          continue;
        }

        // Map legacy role to new role system
        let roleToAssign: mongoose.Types.ObjectId | null = null;

        switch (userDoc.role) {
          case 'admin':
            roleToAssign = adminRole._id;
            console.log(`👑 Assigning Administrator role to ${userDoc.email}`);
            break;
          case 'mentor':
            roleToAssign = mentorRole._id;
            console.log(`🎓 Assigning Mentor role to ${userDoc.email}`);
            break;
          case 'user':
            roleToAssign = memberRole._id;
            console.log(`👤 Assigning Member role to ${userDoc.email}`);
            break;
          case 'guest':
            roleToAssign = guestRole._id;
            console.log(`👻 Assigning Guest role to ${userDoc.email}`);
            break;
          default:
            // Default to Member role
            roleToAssign = memberRole._id;
            console.log(`👤 Assigning Member role (default) to ${userDoc.email}`);
        }

        // Assign the role
        userDoc.roles = [roleToAssign];
        await userDoc.save();

        migrated++;
      } catch (error: any) {
        console.error(`❌ Error migrating user ${user.email}:`, error.message);
        errors++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Migrated: ${migrated} users`);
    console.log(`   Skipped: ${skipped} users (already had roles)`);
    console.log(`   Errors: ${errors} users\n`);

    // Verify and fix admin roles
    console.log('🔍 Verifying admin users...\n');
    await roleAssignmentService.ensureAdminRoles();

    console.log('\n🎉 All done!');
    process.exit(0);
  } catch (error: any) {
    console.error('Error migrating roles:', error);
    process.exit(1);
  }
}

migrateRoles();

