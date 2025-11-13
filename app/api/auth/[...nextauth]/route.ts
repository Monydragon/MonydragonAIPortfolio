import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";

// Check for required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.error("⚠️  NEXTAUTH_SECRET is not set in environment variables");
  console.error("Please create a .env.local file with NEXTAUTH_SECRET");
}

const { handlers } = NextAuth(authConfig);

export const { GET, POST } = handlers;
