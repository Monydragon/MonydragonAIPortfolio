import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";

// Initialize NextAuth - this should not throw on import
// Errors will be caught in the API route handler
const nextAuth = NextAuth(authConfig);

export const auth = nextAuth.auth;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;

