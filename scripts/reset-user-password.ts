/**
 * Script to reset password for any user by email or username
 * 
 * Usage:
 *   npm run reset-user-password
 *   (uses ADMIN_EMAIL and ADMIN_PASSWORD from .env.local)
 * 
 * Or with command line arguments:
 *   npx tsx scripts/reset-user-password.ts --email user@example.com --password NewPassword123!
 *   npx tsx scripts/reset-user-password.ts --username myuser --password NewPassword123!
 */

// IMPORTANT: Load environment variables FIRST using require (synchronous)
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

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set in environment variables");
  process.exit(1);
}

console.log("✅ Environment variables loaded");

// Parse command line arguments
const args = process.argv.slice(2);
let targetEmail: string | undefined;
let targetUsername: string | undefined;
let newPassword: string | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--email' && args[i + 1]) {
    targetEmail = args[i + 1];
    i++;
  } else if (args[i] === '--username' && args[i + 1]) {
    targetUsername = args[i + 1];
    i++;
  } else if (args[i] === '--password' && args[i + 1]) {
    newPassword = args[i + 1];
    i++;
  }
}

// Now import modules
import connectDB from "../lib/mongodb";
import User from "../lib/models/User";

async function resetPassword() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Determine target user identifier
    const email = targetEmail || process.env.ADMIN_EMAIL;
    const username = targetUsername || process.env.ADMIN_USERNAME;
    const password = newPassword || process.env.ADMIN_PASSWORD;

    if (!email && !username) {
      console.error("❌ No user specified!");
      console.error("\nUsage options:");
      console.error("  1. Set ADMIN_EMAIL or ADMIN_USERNAME in .env.local");
      console.error("  2. Use command line: --email user@example.com or --username myuser");
      console.error("  3. Use command line: --password NewPassword123!");
      process.exit(1);
    }

    if (!password) {
      console.error("❌ No password specified!");
      console.error("\nUsage options:");
      console.error("  1. Set ADMIN_PASSWORD in .env.local");
      console.error("  2. Use command line: --password NewPassword123!");
      process.exit(1);
    }

    if (password.length < 6) {
      console.error("❌ Password must be at least 6 characters");
      process.exit(1);
    }

    // Build query
    const query: any = {};
    if (email) {
      query.email = email.toLowerCase();
      console.log(`Looking for user by email: ${email}`);
    } else if (username) {
      query.username = username.toLowerCase();
      console.log(`Looking for user by username: ${username}`);
    }

    // Find user
    const user = await User.findOne(query);
    
    if (!user) {
      console.error(`❌ User not found`);
      if (email) {
        console.error(`   Email: ${email}`);
      }
      if (username) {
        console.error(`   Username: ${username}`);
      }
      process.exit(1);
    }

    console.log(`\n✅ User found:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username || 'Not set'}`);
    console.log(`   Name: ${user.name || 'Not set'}`);
    
    // Check if user has roles
    if (user.roles && user.roles.length > 0) {
      await user.populate('roles', 'name');
      const roleNames = (user.roles as any[]).map((r: any) => r.name).join(', ');
      console.log(`   Roles: ${roleNames}`);
    }

    console.log(`\nResetting password...`);
    console.log(`   New password length: ${password.length} characters`);

    // Update password (Mongoose pre-save hook will hash it automatically)
    user.password = password;
    await user.save();

    console.log("\n✅ Password reset successfully!");
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username || 'Not set'}`);
    console.log(`   Name: ${user.name || 'Not set'}`);
    console.log("\n⚠️  The user can now log in with the new password");
    
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error resetting password:", error.message);
    if (error.code === 11000) {
      console.error("   Duplicate key error - user might already exist with different identifier");
    }
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

resetPassword();

