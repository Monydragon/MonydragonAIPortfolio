/**
 * Script to force reset password for an admin user
 * Run with: npx tsx scripts/reset-admin-password.ts
 * 
 * Uses ADMIN_EMAIL and ADMIN_PASSWORD from .env.local
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

// Now import modules
import connectDB from "../lib/mongodb";
import User from "../lib/models/User";

async function resetPassword() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Get email and password from environment variables
    const email = process.env.ADMIN_EMAIL || "Monydragon@gmail.com";
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      console.error("❌ ADMIN_PASSWORD is not set in .env.local");
      console.error("Please set ADMIN_PASSWORD in your .env.local file");
      process.exit(1);
    }

    if (password.length < 6) {
      console.error("❌ Password must be at least 6 characters");
      process.exit(1);
    }

    console.log(`Resetting password for: ${email}`);
    console.log(`New password length: ${password.length} characters\n`);

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    // Update password (Mongoose pre-save hook will hash it automatically)
    user.password = password;
    await user.save();

    console.log("✅ Password reset successfully!");
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username || 'Not set'}`);
    console.log(`   Name: ${user.name || 'Not set'}`);
    console.log("\n⚠️  You can now log in with the new password from ADMIN_PASSWORD");
    
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error resetting password:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

resetPassword();

