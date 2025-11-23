import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "./mongodb";
import User from "./models/User";
import GoogleProvider from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
        totp: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        const identifier = (credentials?.identifier || (credentials as any)?.email || "").toString().trim();
        const password = (credentials?.password || "").toString();
        const totp = (credentials as any)?.totp?.toString().trim();

        if (!identifier || !password) {
          console.error("Missing credentials");
          return null;
        }

        try {
          if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not set in environment variables");
            return null;
          }

          await connectDB();

          // Find by email or username (case-insensitive)
          const query = identifier.includes("@")
            ? { email: identifier.toLowerCase() }
            : { username: identifier.toLowerCase() };

          const user = await User.findOne(query).select("+password +twoFactorSecret +twoFactorBackupCodes");

          if (!user) {
            console.error("User not found:", identifier);
            return null;
          }

          const isPasswordValid = await user.comparePassword(password);
          if (!isPasswordValid) {
            console.error("Invalid password for user:", identifier);
            return null;
          }

          // Handle 2FA if enabled
          if (user.twoFactorEnabled) {
            if (!totp) {
              // Signal to UI that 2FA code is required
              throw new Error("2FA_REQUIRED");
            }
            try {
              // eslint-disable-next-line
              const speakeasy = require("speakeasy");
              const ok = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: "base32",
                token: String(totp),
                window: 1,
              });
              if (!ok) {
                return null;
              }
            } catch (e) {
              console.error("2FA verification error:", (e as any)?.message || e);
              return null;
            }
          }

          return {
            id: (user._id as any).toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            username: (user as any).username,
          } as any;
        } catch (error: any) {
          // Rethrow known 2FA required for UI handling
          if (typeof error?.message === "string" && error.message === "2FA_REQUIRED") {
            throw error;
          }
          console.error("Auth error:", error?.message || error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Ensure user exists in DB for OAuth logins
      if (account && account.provider !== "credentials") {
        try {
          await connectDB();
          const email = (user as any)?.email;
          if (!email) return false;
          let dbUser = await User.findOne({ email });
          if (!dbUser) {
            dbUser = new User({
              email,
              password: Math.random().toString(36) + Math.random().toString(36),
              name: (user as any)?.name || email.split("@")[0],
              role: "user",
              emailVerified: new Date(),
            });
            await dbUser.save();
          } else if (!dbUser.emailVerified) {
            dbUser.emailVerified = new Date();
            await dbUser.save();
          }
          (user as any).id = (dbUser._id as any).toString();
          (user as any).role = dbUser.role;
          (user as any).username = (dbUser as any).username;
        } catch (e) {
          console.error("OAuth signIn ensure user error:", (e as any)?.message || e);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        (token as any).role = (user as any).role;
        (token as any).username = (user as any).username;
        (token as any).emailVerified = (user as any).emailVerified ?? null;
        (token as any).twoFactorEnabled = (user as any).twoFactorEnabled ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).role = (token as any).role;
        (session.user as any).username = (token as any).username;
        (session.user as any).emailVerified = (token as any).emailVerified ?? null;
        (session.user as any).twoFactorEnabled = (token as any).twoFactorEnabled ?? false;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Role-based default redirects after login
      try {
        const roleParam = new URL(url, baseUrl).searchParams.get("role");
        if (roleParam === "admin") return `${baseUrl}/MonyAdmin`;
        if (roleParam === "user") return `${baseUrl}/dashboard`;
      } catch {}
      // Allow same-origin navigations
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
};

