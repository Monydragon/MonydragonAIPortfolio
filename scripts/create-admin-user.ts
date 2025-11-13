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

async function createAdminUser() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Default admin credentials - can be overridden with environment variables
    const email = process.env.ADMIN_EMAIL || "monydragon@gmail.com";
    const password = process.env.ADMIN_PASSWORD || "Dr460n1991!";
    const name = process.env.ADMIN_NAME || "Mony Dragon";

    // Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin user with email ${email} already exists.`);
      console.log("To create a new admin, use a different email or delete the existing one.");
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      email,
      password,
      name,
      role: "admin",
    });

    console.log("✅ Admin user created successfully!");
    console.log(`Email: ${admin.email}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Role: ${admin.role}`);
    console.log("\n⚠️  Please change the default password after first login!");
    
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
}

createAdminUser();

