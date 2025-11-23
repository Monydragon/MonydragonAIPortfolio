/**
 * Script to create an admin user
 * Run with: npx tsx scripts/create-admin-user.ts
 */

// IMPORTANT: Load environment variables FIRST using require (synchronous)
// This must happen before any ES6 imports that use process.env
const dotenv = require("dotenv");
const path = require("path");

const result = dotenv.config({ 
  path: path.resolve(process.cwd(), ".env.local"), 
  override: true 
});

if (result.error) {
  console.error("❌ Error loading .env.local:", result.error.message);
  process.exit(1);
}

// Verify MONGODB_URI is loaded
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set in environment variables");
  console.error("Please check your .env.local file exists and contains MONGODB_URI");
  process.exit(1);
}

console.log("✅ Environment variables loaded");
console.log(`MONGODB_URI: ${process.env.MONGODB_URI.substring(0, 20)}...`);

// Now import modules that depend on environment variables
import connectDB from "../lib/mongodb";
import User from "../lib/models/User";
import Role from "../lib/models/Role";

async function createAdminUser() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Check if Administrator role exists, if not, seed roles first
    let adminRole = await Role.findOne({ name: 'Administrator' });
    if (!adminRole) {
      console.log("⚠️  Administrator role not found. Seeding roles...");
      // Import and run seed roles
      const { execSync } = require('child_process');
      execSync('npm run seed-roles', { stdio: 'inherit' });
      adminRole = await Role.findOne({ name: 'Administrator' });
      if (!adminRole) {
        console.error("❌ Failed to create Administrator role. Please run: npm run seed-roles");
        process.exit(1);
      }
    }

    // Get admin credentials from environment variables or use defaults
    const email = process.env.ADMIN_EMAIL || "monydragon@gmail.com";
    const password = process.env.ADMIN_PASSWORD || "Dr460n1991!";
    const firstName = process.env.ADMIN_FIRST_NAME || "Mony";
    const middleName = process.env.ADMIN_MIDDLE_NAME || undefined;
    const lastName = process.env.ADMIN_LAST_NAME || "Dragon";
    const username = process.env.ADMIN_USERNAME || "monydragon";
    const phone = process.env.ADMIN_PHONE || undefined;
    const location = process.env.ADMIN_LOCATION || undefined;
    const timezone = process.env.ADMIN_TIMEZONE || "UTC";
    const bio = process.env.ADMIN_BIO || undefined;
    const avatar = process.env.ADMIN_AVATAR || undefined;
    const experienceLevelRaw = process.env.ADMIN_EXPERIENCE_LEVEL;
    const experienceLevel = experienceLevelRaw && ['beginner', 'intermediate', 'advanced', 'expert'].includes(experienceLevelRaw)
      ? experienceLevelRaw as 'beginner' | 'intermediate' | 'advanced' | 'expert'
      : undefined;
    const name = [firstName, middleName, lastName].filter(Boolean).join(' ');

    // Check if user already exists by email OR username
    const existingByEmail = await User.findOne({ email: email.toLowerCase() });
    const existingByUsername = await User.findOne({ username: username.toLowerCase() });
    const existing = existingByEmail || existingByUsername;
    
    if (existing) {
      const foundBy = existingByEmail ? 'email' : 'username';
      console.log(`\n⚠️  User found by ${foundBy}: ${foundBy === 'email' ? email : username}`);
      console.log(`   Existing user: ${existing.email} (${existing.name || 'No name'})`);
      
      // Check if they have Administrator role
      const hasAdminRole = existing.roles?.some(
        (r: any) => r.toString() === (adminRole as any)._id.toString()
      );
      
      if (!hasAdminRole) {
        console.log("\n   Adding Administrator role to existing user...");
        if (!existing.roles) {
          existing.roles = [];
        }
        
        // Remove any duplicate role references and add Administrator role
        const roleIds = existing.roles.map((r: any) => r.toString());
        if (!roleIds.includes((adminRole as any)._id.toString())) {
          existing.roles.push((adminRole as any)._id);
        }
        
        // Update user details if provided and missing
        let updated = false;
        if (firstName && !existing.firstName) {
          existing.firstName = firstName;
          updated = true;
        }
        if (middleName && !existing.middleName) {
          existing.middleName = middleName;
          updated = true;
        }
        if (lastName && !existing.lastName) {
          existing.lastName = lastName;
          updated = true;
        }
        if (username && !existing.username) {
          existing.username = username.toLowerCase();
          updated = true;
        }
        if (phone && !existing.phone) {
          existing.phone = phone;
          updated = true;
        }
        if (location && !existing.location) {
          existing.location = location;
          updated = true;
        }
        if (timezone && existing.timezone !== timezone) {
          existing.timezone = timezone;
          updated = true;
        }
        if (bio && !existing.bio) {
          existing.bio = bio;
          updated = true;
        }
        if (avatar && !existing.avatar) {
          existing.avatar = avatar;
          updated = true;
        }
        if (experienceLevel && !existing.experienceLevel) {
          existing.experienceLevel = experienceLevel;
          updated = true;
        }
        if (!existing.name && (existing.firstName || existing.lastName)) {
          existing.name = [existing.firstName, existing.middleName, existing.lastName].filter(Boolean).join(' ');
          updated = true;
        }
        
        // ALWAYS verify email for admin users (even if already verified, ensure it's set)
        if (!existing.emailVerified) {
          existing.emailVerified = new Date();
          updated = true;
          console.log("   Email verified automatically");
        }
        
        await existing.save();
        
        // Populate roles to show details
        await existing.populate('roles', 'name permissions');
        
        console.log("\n✅ Administrator role added to existing user!");
        console.log(`   Email: ${existing.email}`);
        console.log(`   Username: ${existing.username || 'Not set'}`);
        console.log(`   Name: ${existing.name || 'Not set'}`);
        console.log(`   Roles: ${(existing.roles as any[]).map((r: any) => r.name).join(', ')}`);
        console.log(`   Email Verified: ${existing.emailVerified ? 'Yes' : 'No'}`);
        console.log("\n✅ User now has full admin access! Changes are saved and active immediately.");
        process.exit(0);
      } else {
        console.log("\n✅ User already has Administrator role.");
        console.log(`   Email: ${existing.email}`);
        console.log(`   Username: ${existing.username || 'Not set'}`);
        console.log(`   Name: ${existing.name || 'Not set'}`);
        
        // Update user details if provided and missing
        let updated = false;
        if (firstName && !existing.firstName) {
          existing.firstName = firstName;
          updated = true;
        }
        if (middleName && !existing.middleName) {
          existing.middleName = middleName;
          updated = true;
        }
        if (lastName && !existing.lastName) {
          existing.lastName = lastName;
          updated = true;
        }
        if (username && !existing.username) {
          existing.username = username.toLowerCase();
          updated = true;
        }
        if (phone && !existing.phone) {
          existing.phone = phone;
          updated = true;
        }
        if (location && !existing.location) {
          existing.location = location;
          updated = true;
        }
        if (timezone && existing.timezone !== timezone) {
          existing.timezone = timezone;
          updated = true;
        }
        if (bio && !existing.bio) {
          existing.bio = bio;
          updated = true;
        }
        if (avatar && !existing.avatar) {
          existing.avatar = avatar;
          updated = true;
        }
        if (experienceLevel && !existing.experienceLevel) {
          existing.experienceLevel = experienceLevel;
          updated = true;
        }
        // ALWAYS ensure email is verified for admins
        if (!existing.emailVerified) {
          existing.emailVerified = new Date();
          updated = true;
        }
        if (updated) {
          if (!existing.name && (existing.firstName || existing.lastName)) {
            existing.name = [existing.firstName, existing.middleName, existing.lastName].filter(Boolean).join(' ');
          }
          await existing.save();
          console.log("   Updated user details");
        }
        
        console.log("\n✅ User already has full admin access!");
        process.exit(0);
      }
    }

    // Create admin user
    const admin = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      middleName: middleName || undefined,
      lastName,
      name,
      username: username.toLowerCase(),
      phone: phone || undefined,
      location: location || undefined,
      timezone: timezone || 'UTC',
      bio: bio || undefined,
      avatar: avatar || undefined,
      experienceLevel: experienceLevel || undefined,
      roles: [adminRole._id],
      emailVerified: new Date(), // ALWAYS auto-verify admin emails
    });

    console.log("\n✅ Admin user created successfully!");
    console.log(`Email: ${admin.email}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Roles: Administrator`);
    console.log("\n⚠️  Please change the default password after first login!");
    
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error creating admin user:", error.message);
    if (error.code === 11000) {
      console.error("   This email or username is already in use.");
    }
    process.exit(1);
  }
}

createAdminUser();

