"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Always render the SessionProvider - it handles its own hydration
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}

