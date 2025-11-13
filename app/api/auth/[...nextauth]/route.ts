import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";

// Check for required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.warn("⚠️  NEXTAUTH_SECRET is not set in environment variables");
  console.warn("Please create a .env.local file with NEXTAUTH_SECRET");
}

let handlers: { GET: any; POST: any };

try {
  const nextAuth = NextAuth(authConfig);
  handlers = nextAuth.handlers;
} catch (error: any) {
  console.error("❌ Error initializing NextAuth:", error);
  // Fallback handlers that return errors
  handlers = {
    GET: async () => {
      return new Response(
        JSON.stringify({ error: "NextAuth initialization failed", message: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    },
    POST: async () => {
      return new Response(
        JSON.stringify({ error: "NextAuth initialization failed", message: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    },
  };
}

export const { GET, POST } = handlers;
