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

  // Public admin pages that should not require auth (e.g., login, initial admin creation)
  const isPublicAdminPage =
    pathname === "/MonyAdmin/createMonyAdmin";

  useEffect(() => {
    // Skip auth checks on public admin pages
    if (isPublicAdminPage) {
      return;
    }

    if (status === "unauthenticated") {
      router.push("/login?next=/MonyAdmin");
    }
    // Note: Permission checks are handled by individual API routes and pages
  }, [session, status, router, isPublicAdminPage]);

  // Show loading only for protected pages
  if (!isPublicAdminPage && status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow public admin pages to render, but protect other pages
  if (!isPublicAdminPage && status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}

