"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Don't apply auth checks to the login page
  const isLoginPage = pathname === "/MonyAdmin/login";

  useEffect(() => {
    // Skip auth checks on login page
    if (isLoginPage) {
      return;
    }

    if (status === "unauthenticated") {
      router.push("/MonyAdmin/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router, isLoginPage]);

  // Show loading only for protected pages
  if (!isLoginPage && status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow login page to render, but protect other pages
  if (!isLoginPage && (status === "unauthenticated" || (session?.user as any)?.role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}

