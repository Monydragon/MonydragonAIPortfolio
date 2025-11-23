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
            username: (user as any).username,
            emailVerified: user.emailVerified ?? null,
            twoFactorEnabled: user.twoFactorEnabled ?? false,
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
          
          // Parse name from Google profile
          const googleName = (user as any)?.name || (profile as any)?.name || email.split("@")[0];
          const nameParts = googleName.split(" ");
          const firstName = nameParts[0] || email.split("@")[0];
          const lastName = nameParts.slice(1).join(" ") || "";
          
          if (!dbUser) {
            // Create new user with Google OAuth - auto-verify email since Google verifies it
            dbUser = new User({
              email,
              password: Math.random().toString(36) + Math.random().toString(36) + Math.random().toString(36),
              firstName,
              lastName,
              name: googleName,
              emailVerified: new Date(), // Google emails are pre-verified
            });
            await dbUser.save();
            console.log(`[OAuth] Created new user via Google: ${email}`);
          } else {
            // Update existing user - verify email if not already verified
            if (!dbUser.emailVerified) {
              dbUser.emailVerified = new Date();
            }
            // Update name if missing or update from Google profile
            if (!dbUser.firstName || !dbUser.lastName) {
              dbUser.firstName = dbUser.firstName || firstName;
              dbUser.lastName = dbUser.lastName || lastName;
              dbUser.name = dbUser.name || googleName;
            }
            await dbUser.save();
            console.log(`[OAuth] Updated existing user via Google: ${email}`);
          }
          
          (user as any).id = (dbUser._id as any).toString();
          (user as any).username = (dbUser as any).username;
          (user as any).emailVerified = dbUser.emailVerified;
        } catch (e) {
          console.error("OAuth signIn ensure user error:", (e as any)?.message || e);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      // On sign in, use user data from authorize
      if (user) {
        token.id = (user as any).id;
        (token as any).username = (user as any).username;
        (token as any).emailVerified = (user as any).emailVerified ?? null;
        (token as any).twoFactorEnabled = (user as any).twoFactorEnabled ?? false;
      }
      // On session update, fetch fresh user data from database
      else if (trigger === "update" && (token as any)?.id) {
        try {
          await connectDB();
          const dbUser = await User.findById((token as any).id);
          if (dbUser) {
            (token as any).emailVerified = dbUser.emailVerified ?? null;
            (token as any).twoFactorEnabled = dbUser.twoFactorEnabled ?? false;
          }
        } catch (error) {
          console.error("Error updating JWT token:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).username = (token as any).username;
        (session.user as any).emailVerified = (token as any).emailVerified ?? null;
        (session.user as any).twoFactorEnabled = (token as any).twoFactorEnabled ?? false;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
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

