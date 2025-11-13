import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "./mongodb";
import User from "./models/User";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }

        try {
          // Check if MongoDB URI is set
          if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not set in environment variables");
            return null;
          }

          await connectDB();
          
          // Try to find user by email (username can be email)
          const user = await User.findOne({ email: credentials.email }).select("+password");

          if (!user) {
            console.error("User not found:", credentials.email);
            return null;
          }

          const isPasswordValid = await user.comparePassword(credentials.password as string);

          if (!isPasswordValid) {
            console.error("Invalid password for user:", credentials.email);
            return null;
          }

          // Check if user is admin
          if (user.role !== "admin") {
            console.error("User is not an admin:", credentials.email);
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error: any) {
          console.error("Auth error:", error.message || error);
          // Return null on error - NextAuth will show generic error
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/MonyAdmin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for NextAuth v5
};

